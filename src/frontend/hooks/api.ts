import { useMutation, useQuery } from "react-query";
import { CurrentRaid } from "../../types";
import { loadFightRequest, loadTopBossLogsForSameRosterRequest } from "../../backend/controllers/raidtimers.controller";
import { LogSearchResponse, RaidCDUsage } from "../../backend/services/wcl.service";
import { LogResponse } from "../../backend/services/raidtimers.service";

export const loadCurrentRaidData = () => useQuery<CurrentRaid>({
    queryKey: ['current-raid'],
    queryFn: async () => {
        const data = await fetch('http://localhost:8000/raid');
        const json = await data.json();
        return json;
    },
});

export const loadLogSearchData = () => useMutation<LogSearchResponse, unknown, loadTopBossLogsForSameRosterRequest>({
    mutationKey: ['boss-logs-same-heal-roster'],
    mutationFn: async (body) => {
        const data = await fetch('http://localhost:8000/logs/search', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        });
        const json: LogSearchResponse = await data.json();
        return json.sort((a, b) => a.duration - b.duration);
    },
});

export const loadLogDetailsData = () => useMutation<LogResponse, unknown, loadFightRequest>({
    mutationKey: ['boss-log-fight'],
    mutationFn: async (body) => {
        const data = await fetch('http://localhost:8000/logs/detail', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'content-type': 'application/json'
            }
        });
        const json: LogResponse = await data.json();
        return json;
    },
});

