import { format, fromUnixTime } from "date-fns";
import { HealerComp } from "../types";
import { Class, Cooldown, FLAT_COOLDOWNS, HealerSpecs, Roster, SpecMatchesClass } from "./constants";
import { RaidCDUsage } from "../backend/services/wcl.service";

export const cooldownTimeDisplay = (sec: number) => {
    const _mins = sec / 60;
    const mins = _mins > 0 ? `${_mins}m` : ''
    const _secs = sec % 60;
    const secs = _secs > 0 ? `${_secs}s` : ''

    return `${mins}${secs}`
}

export const displaySec = (sec: number, pad = true) => {
    const _mins = String(Math.floor(sec / 60));
    const _secs = String(sec % 60).padStart(2, '0');

    return `${pad ? _mins.padStart(2, '0') : _mins}:${_secs}`
}

export const toSec = (tstring: string) => {
    const [min, sec] = tstring.split(':');
    return Number(min) * 60 + Number(sec);
}

export const offsetEntries = <T extends { offset: number, time: number; duration: number; }[],>(rawEvents: T) => {
    let offsetExpirations: Record<number, number> = {};

    for (let i in rawEvents) {
        const evt = rawEvents[i];
        const firstAvailableOffset = Object.entries(offsetExpirations)
            .sort(([o1], [o2]) => Number(o1) - Number(o2))
            .find(([_, exp]) => exp + 1 < evt.time)?.[0]
        const nextOffset = Object.values(offsetExpirations).length;

        const toUse = Number(firstAvailableOffset || nextOffset);
        offsetExpirations[toUse] = evt.time + evt.duration;
        evt.offset = toUse;
    }

    return rawEvents;
};

export const rosterToHealerComp = (roster: Roster): HealerComp => {
    const init: HealerComp = HealerSpecs.map(hs => ({ class: hs.class, spec: hs.spec, count: 0 }))
    return roster
        .reduce((acc, cur) => {
            const existing = acc.findIndex(m => m.class === cur.class && m.spec === cur.spec);
            acc[existing].count++;
            return acc;
        }, init)
};

export const formatLogTime = (time: number): string => {
    return format(fromUnixTime(Math.round(time / 1000)), 'yyyy, MMM do');
}

export type CooldownEvent = Cooldown<Class> & {
    timestamp: number;
};
type OffsetCooldownEvent = CooldownEvent & {
    offset: number;
}
const offsetAbilities = (rawEvents: CooldownEvent[]): OffsetCooldownEvent[] => {
    const offsetExpirations: Record<number, number> = {};

    return rawEvents.map((rawEvt) => {
        const firstAvailableOffset = Object.entries(offsetExpirations)
            .sort(([o1], [o2]) => Number(o1) - Number(o2))
            .find(([_, exp]) => exp + 1 < rawEvt.timestamp)?.[0]
        const nextOffset = Object.values(offsetExpirations).length;

        const toUse = Number(firstAvailableOffset || nextOffset);
        offsetExpirations[toUse] = rawEvt.timestamp + rawEvt.duration;
        return { ...rawEvt, offset: toUse };
    });
};

export const toGraphable = (rawEvents: RaidCDUsage['casts']): CooldownEvent[][] => {
    const withDurations: CooldownEvent[] = rawEvents.map(c => {
        const cd = FLAT_COOLDOWNS.find(fcd => fcd.spellId === c.spellId);
        return {
            ...cd as Cooldown<Class>,
            timestamp: c.timestamp,
        }
    });

    const withOffsets = offsetAbilities(withDurations);
    const splitOffsets = withOffsets.reduce((acc, cur) => {
        acc[cur.offset] = acc[cur.offset] ?? [];
        const { offset, ...rest } = cur;
        acc[cur.offset].push(rest);
        return acc;
    }, {} as Record<number, CooldownEvent[]>);

    return Object.values(splitOffsets);
}