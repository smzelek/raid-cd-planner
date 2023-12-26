import { dash_case_string } from "../types";
import { constrain } from '../utils';

export const BLIZZARD_API_ROUTES = constrain({
    oauth: () => 'https://oauth.battle.net/token',
    journalInstance: (journalInstanceId: number) => `https://us.api.blizzard.com/data/wow/journal-instance/${journalInstanceId}?namespace=static-us&locale=en_US`,
    journalEncounter: (journalEncounterId: number) => `https://us.api.blizzard.com/data/wow/journal-encounter/${journalEncounterId}?namespace=static-us&locale=en_US`,
    realmsUS: () => 'https://us.api.blizzard.com/data/wow/realm/index?namespace=dynamic-us&locale=en_US',
});

export const WCL_ROUTES = constrain({
    accessToken: () => 'https://www.warcraftlogs.com/oauth/token',
    graphql: () => 'https://www.warcraftlogs.com/api/v2/client',
    websiteReportLink: (reportId: string, fightId: number) => `https://www.warcraftlogs.com/reports/${reportId}#fight=${fightId}`,
    encounterLogs: (encounterId: number, params: string) => `https://www.warcraftlogs.com/v1/rankings/encounter/${encounterId}?${params}`,
    zones: (params: string) => `https://www.warcraftlogs.com/v1/zones?${params}`,
});
