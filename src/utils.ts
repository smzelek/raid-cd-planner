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
export type CURRENT_RAID_ENCOUNTER_IDS = 2708;
export const IMPORTANT_CURRENT_RAID_SPELLS: Record<CURRENT_RAID_ENCOUNTER_IDS, string[]> = {
    2708: [ // Nymue
        "Surging Growth",
        "Unravel",
        "Continuum",
        "Viridian Rain",
    ]
};
