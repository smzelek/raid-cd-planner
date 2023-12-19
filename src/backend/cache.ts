import { dash_case_string } from '../types';
import { constrain, logFunction } from '../utils';

export const CACHE_KEYS = constrain({
    accessToken: () => 'BLIZZARD_ACCESS_TOKEN',
    currentRaid: () => 'BLIZZARD_CURRENT_RAID',
    raidEncounter: (encounterId: number) => `BLIZZARD_RAID_ENCOUNTER_${encounterId}`,
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

        logFunction(this.set, `Caching ${key} for ${ttl}`)

        this.cache.set(key, value);
        setTimeout(function (this: SimpleCache) {
            this.cache.delete(key);
            logFunction(this.set, `Evicting ${key} after ${ttl}`)
        }.bind(this), ttl)
    }

    get(key: string) {
        if (this.cache.has(key)) {
            logFunction(this.get, `Retrieving ${key}`)
        }
        return this.cache.get(key);
    }
} 
