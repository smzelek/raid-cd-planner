import { CurrentRaid, dash_case_string } from "../../types";
import { logFunction, retry } from '../../utils';
import { BlizzardApi } from "./blizzard.service";
import { WarcraftLogsApi } from "./wcl.service";

export class RaidTimersApi {
    private blizzardApi: BlizzardApi;
    private warcraftLogsApi: WarcraftLogsApi;

    constructor() {
        this.blizzardApi = new BlizzardApi();
        this.warcraftLogsApi = new WarcraftLogsApi();
    }

    async loadCurrentRaidEncounters(): Promise<CurrentRaid> {
        const raid = await this.blizzardApi.loadCurrentRaid();
        const encounterIds = raid.encounters.map(e => e.id);
        const encounters = await Promise.all(encounterIds.map(id => this.blizzardApi.loadJournalEncounter({ encounterId: id })))

        return {
            id: raid.id,
            name: raid.name,
            bosses: encounters,
        }
    }
}

