import { dash_case_string } from '../types';
import { constrain, logFunction } from '../utils';

export const CACHE_KEYS = constrain({
    accessToken: () => 'BLIZZARD_ACCESS_TOKEN',
    currentRaid: () => 'BLIZZARD_CURRENT_RAID',
    raidEncounter: (encounterId: number) => `BLIZZARD_RAID_ENCOUNTER_${encounterId}`,
    searchLogs: (encounterId: number, filter: string) => `WCL_SEARCH_LOGS_${encounterId}__${filter}`,
    logDetails: (reportId: string, fightId: number) => `WCL_LOG_DETAILS_${reportId}__${fightId}`,
});

export class SimpleCache {
    private cache: Map<string, any>;

    constructor() {
        this.cache = new Map();
    }

    set(key: string, value: any, ttl: number) {
        if (ttl > 2147483646 || ttl < 1 || Number.isNaN(ttl)) {
            throw 'Invalid TTL for Cache';
        }

        logFunction(this.set, `CACHE STORE ${key} for ${ttl}`)

        this.cache.set(key, value);
        setTimeout(function (this: SimpleCache) {
            this.cache.delete(key);
            logFunction(this.set, `CACHE EVICT ${key} after ${ttl}`)
        }.bind(this), ttl)
    }

    get(key: string) {
        if (this.cache.has(key)) {
            logFunction(this.get, `CACHE HIT ${key}`)
        } else {
            logFunction(this.get, `CACHE MISS ${key}`)
        }
        return this.cache.get(key);
    }
} 
