import { CurrentRaid, HealerComp, dash_case_string } from "../../types";
import { CURRENT_RAID_ENCOUNTER_IDS, logFunction, retry } from '../../utils';
import { BlizzardApi } from "./blizzard.service";
import { BossAbilityDamageEvents, LogSearchResponse, RaidCDUsage, ReportFightTimestamps, WarcraftLogsApi } from "./wcl.service";

export class RaidTimersApi {
    private blizzardApi: BlizzardApi;
    private warcraftLogsApi: WarcraftLogsApi;

    constructor() {
        this.blizzardApi = new BlizzardApi();
        this.warcraftLogsApi = new WarcraftLogsApi();
    }

    async loadCurrentRaidEncounters(): Promise<CurrentRaid> {
        const blizzRaid = await this.blizzardApi.loadCurrentRaid();
        const wclRaids = await this.warcraftLogsApi.getZones();
        if (wclRaids.error) {
            throw wclRaids.error;
        }

        const wclRaid = wclRaids.result!.find(r => r.name === blizzRaid.name)!;

        const encounterIds = blizzRaid.encounters.map(e => e.id);
        const encounters = await Promise.all(encounterIds.map(id => this.blizzardApi.loadJournalEncounter({ encounterId: id })))

        return {
            id: blizzRaid.id,
            name: blizzRaid.name,
            bosses: encounters.map(e => ({
                ...e,
                wclId: wclRaid.encounters.find(wclE => wclE.name === e.name)!.id
            })),
        }
    }

    async findLogsForHealComp(encounterId: number, healerComp: HealerComp): Promise<{
        error: string | null;
        result: LogSearchResponse,
    }> {
        return await this.warcraftLogsApi.findLogsForHealComp(encounterId, healerComp);
    }

    async loadReport(reportId: string, fightId: number, encounterId: CURRENT_RAID_ENCOUNTER_IDS): Promise<{ error: string | null; result: LogResponse | null }> {
        const timestamps = await this.warcraftLogsApi.loadReportFightTimestamps(reportId, fightId);
        if (timestamps.error) {
            throw timestamps.error;
        }

        const [
            raidCDs,
            bossEvents
        ] = await Promise.all([
            this.warcraftLogsApi.loadRaidCDData(reportId, fightId, timestamps.result!),
            this.warcraftLogsApi.loadBossAbilityDamage(reportId, fightId, encounterId, timestamps.result!),
        ]);
        if (raidCDs.error || bossEvents.error) {
            throw [raidCDs.error, bossEvents.error].filter(x => !!x).join('\n');
        }

        return {
            error: null,
            result: {
                timestamps: {
                    startTime: timestamps.result!.startTime / 1000,
                    endTime: timestamps.result!.endTime / 1000,
                },
                raidCDs: raidCDs.result!,
                bossEvents: bossEvents.result!
            }
        }
    }
}

export type LogResponse = {
    timestamps: ReportFightTimestamps;
    raidCDs: RaidCDUsage[];
    bossEvents: BossAbilityDamageEvents;
};
