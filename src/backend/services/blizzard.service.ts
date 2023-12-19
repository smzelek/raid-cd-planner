import { CACHE_KEYS, SimpleCache } from '../cache';
import { minutesToMilliseconds } from 'date-fns';
import { BLIZZARD_CLIENT_ID, BLIZZARD_CLIENT_SECRET } from '../env';
import { BLIZZARD_API_ROUTES } from '../routes';
import { daysToMilliseconds, logFunction } from '../../utils';
import { Encounter } from '../../types';

const CURRENT_RAID_ID = 1207; // Amirdrassil

export type Phases = {
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

export type BlizzardApiEncounter = {
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

export type Instance = {
    id: number;
    name: string;
    description: string;
    encounters: {
        key: any;
        name: string;
        id: number;
    }[];
    map: any;
    expansion: any;
    modes: any;
    media: any;
    minimum_level: any;
    category: any;
    order_index: any;
    _links: any;
}

type AccessToken = {
    access_token: string;
    token_type: string;
    expires_in: number; // seconds
    sub: string;
}

export class BlizzardApi {
    private cache: SimpleCache;

    constructor() {
        this.cache = new SimpleCache();
    }

    async getAccessToken(): Promise<string> {
        const cachedToken = this.cache.get(CACHE_KEYS.accessToken())
        if (cachedToken) {
            return cachedToken;
        }

        const basicAuthToken = Buffer.from(`${BLIZZARD_CLIENT_ID()}:${BLIZZARD_CLIENT_SECRET()}`).toString('base64');
        const formData = new FormData();
        formData.append('grant_type', 'client_credentials');
        const res = await fetch(BLIZZARD_API_ROUTES.oauth(), {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Basic ${basicAuthToken}`
            }
        });
        if (!res.ok) {
            throw `Failed to getAccessToken, ${res.status}`
        }
        const json: AccessToken = await res.json();

        this.cache.set(CACHE_KEYS.accessToken(), json.access_token, json.expires_in * 1000);
        return json.access_token;
    }

    async loadCurrentRaid(): Promise<Instance> {
        const cached = this.cache.get(CACHE_KEYS.currentRaid())
        if (cached) {
            return cached;
        }

        const token = await this.getAccessToken();
        const res = await fetch(BLIZZARD_API_ROUTES.journalInstance(CURRENT_RAID_ID), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) {
            throw `Failed to loadCurrentRaid, ${res.status}`
        }
        const raid = await res.json();

        this.cache.set(CACHE_KEYS.currentRaid(), raid, daysToMilliseconds(20));
        return raid;
    }

    async loadJournalEncounter(args: { encounterId: number }): Promise<Encounter> {
        logFunction(this.loadJournalEncounter, args);
        const cached = this.cache.get(CACHE_KEYS.raidEncounter(args.encounterId))
        if (cached) {
            return cached;
        }

        const token = await this.getAccessToken();
        const res = await fetch(BLIZZARD_API_ROUTES.journalEncounter(args.encounterId), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) {
            throw `Failed to loadJournalEncounter, ${res.status}`
        }
        const encounter = await res.json();
        const mappedEncounter = BlizzardApi.mapEncounterResponse(encounter);

        this.cache.set(CACHE_KEYS.raidEncounter(args.encounterId), mappedEncounter, minutesToMilliseconds(10));
        return mappedEncounter;
    }

    static mapEncounterResponse(response: BlizzardApiEncounter): Encounter {
        return {
            id: response.id,
            name: response.name,
            phases: parsePhasesForEncounter(response),
        };
    }
}

export const parsePhasesForEncounter = (encounter: BlizzardApiEncounter): Phases[] => {
    const phases = encounter.sections.reduce((acc, cur) => {
        const title = cur.title;
        if (!title.startsWith('Stage')) {
            return acc;
        }

        const uniqueSpells = _getNestedSpells({
            sections: cur.sections ?? [],
            spell: cur.spell,
        });
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

    if (phases.length > 0) {
        return phases;
    }

    // otherwise it's a single phase boss
    const spells = _getNestedSpells(encounter)
    const spellList: Spell[] = Object.entries(spells).map(([k, v]) => ({
        id: +k,
        name: v,
    }));
    return [
        {
            title: encounter.name,
            spells: spellList
        }
    ];
}

const _getNestedSpells = (section: { sections: EncounterSections[]; spell?: EncounterSections['spell'] }): Record<number, string> => {
    const mainSpell: Record<number, string> = section.spell ? {
        [section.spell.id]: section.spell.name,
    } : {};

    const nestedSpells = (section.sections ?? []).reduce((acc, cur) => {
        const sectionSpells = _getNestedSpells({
            spell: cur.spell,
            sections: cur.sections ?? [],
        });
        return {
            ...acc,
            ...sectionSpells
        }
    }, mainSpell);
    return nestedSpells;
}
