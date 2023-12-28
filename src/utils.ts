import { hoursToMilliseconds } from "date-fns";

const ONE_MINUTE_IN_MS = 60000;

export const logFunction = (caller: (...args: any[]) => any, message: unknown): void => {
    console.log(JSON.stringify({
        fn: caller.name,
        message
    }, (_, v) => v === undefined ? null : v))
};

export const isLessThanXMinutesAgo = (within_minutes: number, timestamp: number) => {
    const in_milliseconds = within_minutes * ONE_MINUTE_IN_MS;
    const now = Date.now();
    return timestamp + in_milliseconds > now;
};

export const daysToMilliseconds = (days: number) => hoursToMilliseconds(24) * days;

export const retry = async<T>(fnThatMayError: () => Promise<T>, tries = 1): Promise<T> => {
    try {
        return await fnThatMayError();
    }
    catch (e) {
        logFunction(fnThatMayError, e?.toString())
        if (tries < 3) {
            return retry(fnThatMayError, tries + 1);
        }
        throw 'Failed after 3 retries.';
    }
}

export const constrain = <T extends Record<string, (...args: any[]) => string>>(t: T): T => {
    return t;
}

export const CURRENT_RAID_ID = 1207; // Amirdrassil
export type CURRENT_RAID_ENCOUNTER_IDS = 2708 | 2731;
export const IMPORTANT_CURRENT_RAID_SPELLS: Record<CURRENT_RAID_ENCOUNTER_IDS, string[]> = {
    2708: [ // Nymue
        "Surging Growth",
        "Unravel",
        "Continuum",
        "Viridian Rain",
    ],
    2731: [ // Larodar
        "Consuming Flame",
        "Furious Outburst",
        "Raging Inferno",
        "Searing Ash",
    ]
};
// export const CURRENT_RAID_PHASE_CHANGE_SPELLS: Record<CURRENT_RAID_ENCOUNTER_IDS, 

// what moves the phase into the next phase:
export const CURRENT_RAID_PHASE_TRANSITIONS: Record<CURRENT_RAID_ENCOUNTER_IDS, Record<number, Record<number, { type: string, spellId: number }>>> = {
    2708: {
        [0]: {
            1: {
                type: "SCS",
                spellId: 426855,
            }
        },
        [1]: {
            0: {
                type: "SAR",
                spellId: 413443,
            }
        }
    },
    2731: {
        [0]: {
            1: {
                "type": "SCS",
                spellId: 421316
            }
        },
        [1]: {}
    }
};

export const CURRENT_RAID_DEFAULT_PHASE_TIMINGS: Record<CURRENT_RAID_ENCOUNTER_IDS, Record<number, string>> = {
    2708: {
        [0]: '0:00 1:50 4:02 6:09',
        [1]: '1:14 3:22 5:33',
    },
    2731: {
        [0]: '0:00',
        [1]: '4:30',
    }
};

