import { WARCRAFT_LOGS_API_V1_KEY, WARCRAFT_LOGS_API_V2_ACCESS_TOKEN, WARCRAFT_LOGS_API_V2_CLIENT_KEY, WARCRAFT_LOGS_API_V2_SECRET_KEY } from '../env';
import { WCL_ROUTES } from '../routes';
import { CACHE_KEYS, SimpleCache } from '../cache';
import { COOLDOWNS, Class, ClassList, Spec, SpecOf, WCLClassIds } from '../../frontend/constants';
import { HealerComp } from '../../types';
import { CURRENT_RAID_ENCOUNTER_IDS, IMPORTANT_CURRENT_RAID_SPELLS, logFunction } from '../../utils';
import { minutesToMilliseconds } from 'date-fns';
import { nodeUuid } from '../utils';

export type BossAbilityDamageEvents = {
    ability: string;
    damage: number;
    timestamp: number;
    tick: boolean;
}[];

export type RaidCDUsage = {
    name: string;
    class: Class;
    spec: Spec;
    playerId: string;
    casts: { castId: string; spellId: number; timestamp: number; }[];
}

export type LogSearchResponse = {
    url: string;
    reportID: string;
    fightID: number;
    duration: number;
    itemLevel: number;
    tanks: number;
    healers: number;
    melee: number;
    ranged: number;
    startTime: number;
    guildName: string;
    serverName: string;
}[];

export type ReportFightTimestamps = {
    startTime: number;
    endTime: number;
};

export class WarcraftLogsApi {
    private cache: SimpleCache;

    constructor() {
        this.cache = new SimpleCache();
    }

    getZones = async (): Promise<{
        error: string | null;
        result: WCLZoneResponse | null
    }> => {
        const params = new URLSearchParams();
        params.append('api_key', WARCRAFT_LOGS_API_V1_KEY());

        try {
            const url = WCL_ROUTES.zones(params.toString());
            const res = await fetch(url);
            if (!res.ok) {
                throw res.statusText;
            }

            const json: WCLZoneResponse = await res.json();
            return {
                error: null,
                result: json
            }

        } catch (e: unknown) {
            return {
                error: String(e),
                result: null,
            }
        }
    };

    findLogsForHealComp = async (encounterId: number, healerComp: HealerComp): Promise<{
        error: string | null;
        result: LogSearchResponse,
    }> => {
        const filterString = WarcraftLogsApi.toFilterString(healerComp);
        logFunction(this.findLogsForHealComp, { encounterId, filterString });

        const cached = this.cache.get(CACHE_KEYS.searchLogs(encounterId, filterString))
        if (cached) {
            return cached;
        }

        const { error, result } = await this._findLogsForHealComp(encounterId, filterString);
        const mappedResponse = {
            error,
            result: result.map(l => ({
                reportID: l.reportID,
                itemLevel: l.bracket,
                fightID: l.fightID,
                duration: Math.ceil(l.duration / 1000),
                url: WCL_ROUTES.websiteReportLink(l.reportID, l.fightID),
                tanks: l.tanks,
                healers: l.healers,
                melee: l.melee,
                ranged: l.ranged,
                startTime: l.startTime,
                guildName: l.guildName,
                serverName: l.serverName,
            }))
        };
        this.cache.set(CACHE_KEYS.searchLogs(encounterId, filterString), mappedResponse, minutesToMilliseconds(1000));
        return mappedResponse;
    }

    _findLogsForHealComp = async (encounterId: number, filterString: string): Promise<{
        error: string | null;
        result: WCLLogSearchResponse['rankings'];
    }> => {
        logFunction(this._findLogsForHealComp, {})
        const params = new URLSearchParams();
        params.append('api_key', WARCRAFT_LOGS_API_V1_KEY());
        params.append('filter', filterString)
        params.append('difficulty', '5'); // Mythic
        params.append('metric', 'execution');

        const minLogCount = 10;
        const maxPages = 10;
        let page = 1;
        let logs: WCLLogSearchResponse['rankings'] = [];

        while (logs.length < minLogCount && page <= maxPages) {
            try {
                params.set('page', page.toString());
                const url = WCL_ROUTES.encounterLogs(encounterId, params.toString());
                const res = await fetch(url);
                if (!res.ok) {
                    throw res.statusText;
                }

                const json: WCLLogSearchResponse = await res.json();

                logs = logs.concat(json.rankings);
                if (!json.hasMorePages) {
                    break;
                }
                page++;
            } catch (e: unknown) {
                return {
                    error: String(e),
                    result: logs,
                }
            }
        }

        return {
            error: null,
            result: logs,
        }
    }

    _getAccessToken = async (): Promise<{
        error: string | null;
        result: WCLAccessTokenResponse | null;
    }> => {
        const form = new FormData();
        form.append('grant_type', 'client_credentials');
        const basicToken = Buffer.from(`${WARCRAFT_LOGS_API_V2_CLIENT_KEY()}:${WARCRAFT_LOGS_API_V2_SECRET_KEY}`).toString('base64');

        try {
            const res = await fetch(WCL_ROUTES.accessToken(), {
                method: 'POST',
                body: form,
                headers: {
                    'Authorization': `Basic ${basicToken}`
                }
            });
            if (!res.ok) {
                throw res.statusText;
            }
            const json = await res.json();
            return {
                error: null,
                result: json,
            }
        } catch (e) {
            return {
                error: String(e),
                result: null,
            };
        }
    }

    static _raidCDUsageFromLogQuery = (reportId: string, fightId: number, raidCDAbilityIds: number[]) => `
query RaidCDUsageEvents {
    reportData {
        report(code: "${reportId}") {
            playerDetails(fightIDs:${fightId})
            raidCDs: events(fightIDs:${fightId}, dataType: Casts, hostilityType: Friendlies, filterExpression: "ability.id IN (${raidCDAbilityIds.join(',')})") {
                data
                nextPageTimestamp
            }
        }
    }
    rateLimitData {
        limitPerHour
        pointsSpentThisHour
        pointsResetIn
    }
}
`;

    _loadRaidCDData = async (reportId: string, fightId: number, raidCDAbilityIds: number[]): Promise<{
        error: string | null;
        result: WCLRaidCDsResponse | null;
    }> => {
        try {
            const query = WarcraftLogsApi._raidCDUsageFromLogQuery(reportId, fightId, raidCDAbilityIds);
            const res = await fetch(WCL_ROUTES.graphql(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WARCRAFT_LOGS_API_V2_ACCESS_TOKEN()}`,
                    'Content-Type': 'application/graphql'
                },
                body: query
            });
            if (!res.ok) {
                throw res.statusText;
            }
            const json = await res.json();
            if (json.errors) {
                throw json.errors.map((e: any) => e.message).join(' ');
            }
            const safeJson: WCLRaidCDsResponse = json;
            return {
                error: null,
                result: safeJson,
            }
        } catch (e) {
            return {
                error: String(e),
                result: null,
            };
        }
    };

    loadRaidCDData = async (reportId: string, fightId: number, timestamps: ReportFightTimestamps): Promise<{ error: string | null; result: RaidCDUsage[] | null }> => {
        const allRaidCDIds = Object.values(COOLDOWNS).flat(1).map(cd => cd.spellId);
        const { error, result } = await this._loadRaidCDData(reportId, fightId, allRaidCDIds);
        if (error) {
            return {
                error,
                result: null,
            }
        }

        const usage: RaidCDUsage[] = [
            ...result!.data.reportData.report.playerDetails.data.playerDetails.dps,
            ...result!.data.reportData.report.playerDetails.data.playerDetails.healers,
            ...result!.data.reportData.report.playerDetails.data.playerDetails.tanks,
        ]
            .map((p, i): RaidCDUsage => {
                const className = ClassList.find(c => c.replaceAll(' ', '') === p.type)! as Class;
                const spec = p.specs[0].spec as SpecOf<typeof className>;

                const casts = result!.data.reportData.report.raidCDs.data.filter(e => e.sourceID === p.id).map(a => ({
                    spellId: a.abilityGameID,
                    timestamp: Math.round((a.timestamp - timestamps.startTime) / 1000),
                    castId: nodeUuid(),
                }));

                return {
                    name: p.name,
                    playerId: i.toString(),
                    class: className,
                    spec: spec,
                    casts,
                }
            })
            .filter(p => p.casts.length > 0)
            .sort((a, b) => a.name.localeCompare(b.name));

        return {
            error: null,
            result: usage,
        }
    }


    static _bossAbilityDamageFromLogQuery = (reportId: string, fightId: number, bossAbilities: string[], nextPageTimestamp: number | null, endTime: number) => `
query BossAbilityDamageEvents {
    reportData {
        report(code: "${reportId}") {
            bossAbilityDamageEvents: events(useAbilityIDs: false, fightIDs:${fightId}, startTime: ${nextPageTimestamp}, endTime:${endTime}, dataType: DamageDone, hostilityType: Enemies, filterExpression: "ability.name IN (${bossAbilities.map(a => `'${a}'`).join(',')})") {
                data
                nextPageTimestamp
            }
        }
    }
    rateLimitData {
        limitPerHour
        pointsSpentThisHour
        pointsResetIn
    }
}
`;
    async _loadBossAbilityDamage(reportId: string, fightId: number, bossAbilities: string[], timestamps: ReportFightTimestamps): Promise<{
        error: string | null;
        result: WCLBossDamageEvents | null;
    }> {
        let events: WCLBossDamageEvents = [];
        let nextPageTimestamp: number | null = timestamps.startTime;

        try {
            while (nextPageTimestamp !== null) {
                const query = WarcraftLogsApi._bossAbilityDamageFromLogQuery(reportId, fightId, bossAbilities, nextPageTimestamp, timestamps.endTime);
                logFunction(this._loadBossAbilityDamage, {
                    currentCount: events.length, nextPageTimestamp, endTime: timestamps.endTime
                });
                const res = await fetch(WCL_ROUTES.graphql(), {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${WARCRAFT_LOGS_API_V2_ACCESS_TOKEN()}`,
                        'Content-Type': 'application/graphql'
                    },
                    body: query
                });
                if (!res.ok) {
                    throw res.statusText;
                }
                const json = await res.json();
                if (json.errors) {
                    throw json.errors.map((e: any) => e.message).join(' ');
                }

                const safeJson = json as WCLBossAbilityDamageEventsResponse;
                events = events.concat(safeJson.data.reportData.report.bossAbilityDamageEvents.data);
                nextPageTimestamp = safeJson.data.reportData.report.bossAbilityDamageEvents.nextPageTimestamp;
            }
            return {
                error: null,
                result: events,
            }
        } catch (e) {
            return {
                error: String(e),
                result: events,
            };
        }
    };


    // TODO: Fallback to looking for casts when an ability is not found. For some things like Heartstopper on Igira, there is no damage done unless the mechanic is failed,
    // so you wouldn't see any damage events in this response!
    // Also some things might not do damage but you might still want to see where it was cast and damage was prevented.
    loadBossAbilityDamage = async (reportId: string, fightId: number, encounterId: CURRENT_RAID_ENCOUNTER_IDS, timestamps: ReportFightTimestamps): Promise<{ error: string | null; result: BossAbilityDamageEvents | null }> => {
        logFunction(this.loadBossAbilityDamage, { reportId, fightId });

        const cached = this.cache.get(CACHE_KEYS.logDetails(reportId, fightId))
        if (cached) {
            return {
                error: null,
                result: cached
            }
        }

        const specifiedBossAbilities = IMPORTANT_CURRENT_RAID_SPELLS[encounterId];
        const { error, result } = await this._loadBossAbilityDamage(reportId, fightId, specifiedBossAbilities, timestamps);
        if (error) {
            return {
                error,
                result: null,
            }
        }

        const events: BossAbilityDamageEvents = result!.map((d) => {
            return {
                ability: d.ability.name,
                damage: d.amount,
                timestamp: Math.round((d.timestamp - timestamps.startTime) / 1000),
                tick: d.tick ?? false,
            }
        });

        this.cache.set(CACHE_KEYS.logDetails(reportId, fightId), events, minutesToMilliseconds(1000));

        return {
            error: null,
            result: events,
        }
    }

    static _timestampsForReportFightQuery = (reportId: string, fightId: number) => `
query TimestampsForReportFight {
    reportData {
        report(code: "${reportId}") {
            fights(fightIDs:${fightId}) {
                startTime
                endTime
            }
        }
    }
    rateLimitData {
        limitPerHour
        pointsSpentThisHour
        pointsResetIn
    }
}
`;
    _loadReportFightTimestamps = async (reportId: string, fightId: number): Promise<{
        error: string | null;
        result: WCLFightTimesResponse | null;
    }> => {
        try {
            const query = WarcraftLogsApi._timestampsForReportFightQuery(reportId, fightId);
            const res = await fetch(WCL_ROUTES.graphql(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WARCRAFT_LOGS_API_V2_ACCESS_TOKEN()}`,
                    'Content-Type': 'application/graphql'
                },
                body: query
            });
            if (!res.ok) {
                throw res.statusText;
            }
            const json = await res.json();
            if (json.errors) {
                throw json.errors.map((e: any) => e.message).join(' ');
            }
            const safeJson: WCLFightTimesResponse = json;
            return {
                error: null,
                result: safeJson,
            }
        } catch (e) {
            return {
                error: String(e),
                result: null,
            };
        }
    };

    loadReportFightTimestamps = async (reportId: string, fightId: number): Promise<{ error: string | null; result: ReportFightTimestamps | null }> => {
        const { error, result } = await this._loadReportFightTimestamps(reportId, fightId);
        if (error) {
            return {
                error,
                result: null,
            }
        }

        return {
            error: null,
            result: {
                startTime: result!.data.reportData.report.fights[0].startTime,
                endTime: result!.data.reportData.report.fights[0].endTime
            },
        }
    }

    static toFilterString = (healerComp: HealerComp): string => {
        return healerComp
            .map(healerSpec => {
                const classId = (WCLClassIds as any)[healerSpec.class].classId;
                const specId = ((WCLClassIds as any)[healerSpec.class].specIds as any)[healerSpec.spec];
                return {
                    classId,
                    specId,
                    count: healerSpec.count
                };
            })
            .sort((a, b) => a.specId - b.specId)
            .sort((a, b) => a.classId - b.classId)
            .map((s) => `${s.classId}.${s.specId}.${s.count}`)
            .join(',');
    }
}

type WCLLogSearchResponse = {
    hasMorePages: boolean;
    rankings: {
        reportID: string;
        fightID: number;
        duration: number;
        bracket: number;
        guildId: number;
        guildName: string;
        guildFaction: number;
        tanks: number;
        healers: number;
        melee: number;
        ranged: number;
        deaths: number;
        exploit: number;
        damageTaken: number;
        reportStart: number;
        startTime: number;
        regionName: string;
        serverName: string;
        serverId: number;
    }[];
}

type WCLZoneResponse = {
    id: number;
    name: string;
    frozen: boolean;
    encounters: [{
        id: CURRENT_RAID_ENCOUNTER_IDS;
        name: string;
    }]
}[];

type WCLAccessTokenResponse = {
    token_type: string;
    expires_in: number;
    access_token: string;
}

type WCLRateLimitData = {
    limitPerHour: number;
    pointsSpentThisHour: number;
    pointsResetIn: number;
}

type WCLPlayer = {
    id: number;
    name: string;
    type: string; // Class, but no spaces.
    specs: [{
        spec: string;
    }];
}

type WCLRaidCDsResponse = {
    data: {
        rateLimitData: WCLRateLimitData;
        reportData: {
            report: {
                playerDetails: {
                    data: {
                        playerDetails: {
                            tanks: WCLPlayer[];
                            dps: WCLPlayer[];
                            healers: WCLPlayer[];
                        }
                    }
                };
                raidCDs: {
                    data: {
                        timestamp: number;
                        sourceID: number;
                        abilityGameID: number;
                    }[];
                };
            }
        }
    }
}

type WCLFightTimesResponse = {
    data: {
        rateLimitData: WCLRateLimitData;
        reportData: {
            report: {
                fights: [{
                    startTime: number;
                    endTime: number;
                }];
            }
        }
    }
}

type WCLBossDamageEvents = {
    timestamp: number;
    abilityGameID: number;
    ability: {
        name: string;
    },
    amount: number;
    unmitigatedAmount: number;
    tick: boolean;
}[];

type WCLBossAbilityDamageEventsResponse = {
    data: {
        rateLimitData: WCLRateLimitData;
        reportData: {
            report: {
                bossAbilityDamageEvents: {
                    data: WCLBossDamageEvents;
                    nextPageTimestamp: number | null;
                }
            }
        }
    }
}
