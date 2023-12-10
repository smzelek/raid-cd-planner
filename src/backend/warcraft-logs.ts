import { WCLClassIds, HealerSpec, Class, SpecOf, ClassList, COOLDOWNS } from '@/frontend/constants';
import { WARCRAFT_LOGS_API_V1_KEY, WARCRAFT_LOGS_API_V2_ACCESS_TOKEN, WARCRAFT_LOGS_API_V2_CLIENT_KEY, WARCRAFT_LOGS_API_V2_SECRET_KEY } from './env';

type Phases = {
    title: string;
    spells: Spell[];
}
type Spell = {
    id: number;
    name: string;
    key?: any;
}
type EncounterSections = {
    id: number;
    title: string;
    body_text?: string;
    spell?: Spell;
    sections?: EncounterSections[];
    creature_display?: any;
}

export type Encounter = {
    sections: EncounterSections[];

    id: any;
    name: any;
    description: any;
    creatures: any;
    items: any;
    instance: any;
    category: any;
    modes: any;
    _links: any;
}

const _getUniqueSpells = (section: EncounterSections): Record<number, string> => {
    const mainSpell: Record<number, string> = section.spell ? {
        [section.spell.id]: section.spell.name,
    } : {};

    const nestedSpells = (section.sections ?? []).reduce((acc, cur) => {
        const sectionSpells = _getUniqueSpells(cur);
        return {
            ...acc,
            ...sectionSpells
        }
    }, mainSpell);
    return nestedSpells;
}

export const parsePhasesForEncounter = (encounter: Encounter): Phases[] => {
    const phases = encounter.sections.reduce((acc, cur) => {
        const title = cur.title;
        if (!title.startsWith('Stage')) {
            return acc;
        }

        const uniqueSpells = _getUniqueSpells(cur);
        const spellList: Spell[] = Object.entries(uniqueSpells).map(([k, v]) => ({
            id: +k,
            name: v,
        }))
        return [
            ...acc,
            {
                title,
                spells: spellList
            }
        ];
    }, [] as Phases[]);

    return phases;
}

export const toFilterString = (healerComp: HealerComp): string => {
    return healerComp
        .map(healerSpec => {
            const classId = WCLClassIds[healerSpec.class].classId;
            const specId = (WCLClassIds[healerSpec.class].specIds as any)[healerSpec.spec];
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

type LogSearchResponse = {
    url: string;
    reportID: string;
    fightID: number;
    duration: number;
    itemLevel: number;
}[];

type WCLLogSearchResponse = {
    hasMorePages: boolean;
    rankings: {
        reportID: string;
        fightID: number;
        duration: number;
        bracket: number;
    }[];
}
export type HealerComp = Array<HealerSpec & { count: number; }>;

const _findLogsForHealComp = async (encounterId: number, healerComp: HealerComp): Promise<{
    error: string | null;
    result: WCLLogSearchResponse['rankings'];
}> => {
    const params = new URLSearchParams();
    params.append('api_key', WARCRAFT_LOGS_API_V1_KEY());
    params.append('filter', toFilterString(healerComp))
    params.append('difficulty', '5'); // Mythic
    params.append('metric', 'execution');

    const minLogCount = 10;
    const maxPages = 10;
    let logCount = 0;
    let page = 1;
    let logs: WCLLogSearchResponse['rankings'] = [];

    while (logCount < minLogCount && page <= maxPages) {
        try {
            params.set('page', page.toString());
            const url = `https://www.warcraftlogs.com/v1/rankings/encounter/${encounterId}?${params.toString()}`;
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

export const findLogsForHealComp = async (encounterId: number, healerComp: HealerComp): Promise<{
    error: string | null;
    result: LogSearchResponse,
}> => {
    const { error, result } = await _findLogsForHealComp(encounterId, healerComp);
    return {
        error,
        result: result.map(l => ({
            reportID: l.reportID,
            itemLevel: l.bracket,
            fightID: l.fightID,
            duration: l.duration,
            url: `https://www.warcraftlogs.com/reports/${l.reportID}#fight=${l.fightID}`
        }))
    }
}

type AccessTokenResponse = {
    token_type: string;
    expires_in: number;
    access_token: string;
}
export const _getAccessToken = async (): Promise<{
    error: string | null;
    result: AccessTokenResponse | null;
}> => {
    const form = new FormData();
    form.append('grant_type', 'client_credentials');
    const basicToken = Buffer.from(`${WARCRAFT_LOGS_API_V2_CLIENT_KEY()}:${WARCRAFT_LOGS_API_V2_SECRET_KEY}`).toString('base64');

    try {
        const res = await fetch('https://www.warcraftlogs.com/oauth/token', {
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

type RateLimitData = {
    limitPerHour: number;
    pointsSpentThisHour: number;
    pointsResetIn: number;
}
type Player = {
    id: number;
    name: string;
    type: string; // Class, but no spaces.
    specs: [{
        spec: string;
    }];
}
type WCLRaidCDsResponse = {
    data: {
        rateLimitData: RateLimitData;
        reportData: {
            report: {
                playerDetails: {
                    data: {
                        playerDetails: {
                            tanks: Player[];
                            dps: Player[];
                            healers: Player[];
                        }
                    }
                }
                raidCDs: {
                    data: {
                        timestamp: number;
                        sourceID: number;
                        abilityGameID: number;
                    }[];
                }
            }
        }
    }
}
export const _raidCDUsageFromLogQuery = (reportId: string, fightId: number, raidCDAbilityIds: number[]) => `
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

export const _loadRaidCDData = async (reportId: string, fightId: number, raidCDAbilityIds: number[]): Promise<{
    error: string | null;
    result: WCLRaidCDsResponse | null;
}> => {
    try {
        const query = _raidCDUsageFromLogQuery(reportId, fightId, raidCDAbilityIds);
        const res = await fetch('https://www.warcraftlogs.com/api/v2/client', {
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
};

type RaidCDUsage = {
    name: string;
    class: Class;
    spec: SpecOf<Class>;
    casts: { ability: number; timestamp: number; }[];
}

export const loadRaidCDData = async (reportId: string, fightId: number): Promise<{ error: string | null; result: RaidCDUsage[] | null }> => {
    const allRaidCDIds = Object.values(COOLDOWNS).flat(1).map(cd => cd.spellId);
    const { error, result } = await _loadRaidCDData(reportId, fightId, allRaidCDIds);
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
    ].map((p): RaidCDUsage => {
        const className = ClassList.find(c => c.replaceAll(' ', '') === p.type)! as Class;
        const spec = p.specs[0].spec as SpecOf<typeof className>;

        const casts = result!.data.reportData.report.raidCDs.data.filter(e => e.sourceID === p.id).map(a => ({
            ability: a.abilityGameID,
            timestamp: a.timestamp,
        }));

        return {
            name: p.name,
            class: className,
            spec: spec,
            casts,
        }
    }).filter(p => p.casts.length > 0);

    return {
        error: null,
        result: usage,
    }
}

type WCLBossDamageEvents = {
    timestamp: number;
    abilityGameID: number;
    amount: number;
    unmitigatedAmount: number;
    tick: boolean;
}[];
type WCLBossAbilityDamageEventsResponse = {
    data: {
        rateLimitData: RateLimitData;
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
export const _bossAbilityDamageFromLogQuery = (reportId: string, fightId: number, bossAbilityIds: number[], nextPageTimestamp: number | null) => `
query BossAbilityDamageEvents {
    reportData {
        report(code: "${reportId}") {
            bossAbilityDamageEvents: events(fightIDs:${fightId}, startTime: ${nextPageTimestamp}, dataType: DamageDone, hostilityType: Enemies, filterExpression: "ability.id IN (${bossAbilityIds.join(',')})") {
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
export const _loadBossAbilityDamage = async (reportId: string, fightId: number, bossAbilities: number[]): Promise<{
    error: string | null;
    result: WCLBossDamageEvents | null;
}> => {
    let events: WCLBossDamageEvents = [];
    let nextPageTimestamp: number | null = 0;
    try {
        while (nextPageTimestamp !== null) {
            const query = _bossAbilityDamageFromLogQuery(reportId, fightId, bossAbilities, nextPageTimestamp);
            const res = await fetch('https://www.warcraftlogs.com/api/v2/client', {
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

type BossAbilityDamageEvents = {
    ability: number;
    damage: number;
    timestamp: number;
    tick: boolean;
}[];

// TODO: Fallback to looking for casts when an ability is not found. For some things like Heartstopper on Igira, there is no damage done unless the mechanic is failed,
// so you wouldn't see any damage events in this response!
export const loadBossAbilityDamage = async (reportId: string, fightId: number, specifiedBossAbilities: number[]): Promise<{ error: string | null; result: BossAbilityDamageEvents | null }> => {
    const { error, result } = await _loadBossAbilityDamage(reportId, fightId, specifiedBossAbilities);
    if (error) {
        return {
            error,
            result: null,
        }
    }

    const events: BossAbilityDamageEvents = result!.map((d) => {
        return {
            ability: d.abilityGameID,
            damage: d.unmitigatedAmount || d.amount,
            timestamp: d.timestamp,
            tick: d.tick ?? false,
        }
    });

    return {
        error: null,
        result: events,
    }
}
