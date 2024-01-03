import { format, fromUnixTime } from "date-fns";
import { HealerComp } from "../types";
import { Class, Cooldown, FLAT_COOLDOWNS, HealerSpecs, Roster, Spec, SpecChoices, SpecMatchesClass, SpecOf } from "./constants";
import { RaidCDUsage } from "../backend/services/wcl.service";
import { PlannedPlayerRaidCDs } from "./components/FightBreakdown";

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
    const init = (HealerSpecs).map((hs) => ({ class: hs.class, spec: hs.spec, count: 0 }));

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

export type CooldownCast = {
    duration: number;
    cooldown: number;
    spellId: number;
    castId: string;
};

export type PlayerCooldownCast = CooldownCast & {
    playerId: string;
}
export type CooldownEvent = CooldownCast & {
    ability: string;
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

export const getHealersInRoster = <T extends ({ class: Class; spec: Spec; }[]),>(roster: T): T => {
    return roster.filter(rm => HealerSpecs.some(h => h.class === rm.class && h.spec === rm.spec)) as unknown as T;
}

export const getNonHealersInRoster = <T extends ({ class: Class; spec: Spec; }[]),>(roster: T): T => {
    return roster.filter(rm => !HealerSpecs.some(h => h.class === rm.class && h.spec === rm.spec)) as unknown as T;
}

export const addRaidCDProperties = (rawEvents: RaidCDUsage['casts']): CooldownEvent[] => {
    return rawEvents.map(c => {
        const cd = FLAT_COOLDOWNS.find(fcd => fcd.spellId === c.spellId)!;
        return {
            spellId: cd.spellId,
            duration: cd.duration,
            ability: cd.ability,
            cooldown: cd.cooldown,
            castId: c.castId,
            timestamp: c.timestamp,
        }
    });
};

export const offsetRaidCDRows = (rawEvents: CooldownEvent[]): CooldownEvent[][] => {
    const withOffsets = offsetAbilities(rawEvents);
    const splitOffsets = withOffsets.reduce((acc, cur) => {
        acc[cur.offset] = acc[cur.offset] ?? [];
        const { offset, ...rest } = cur;
        acc[cur.offset].push(rest);
        return acc;
    }, {
        0: [],
    } as Record<number, CooldownEvent[]>);

    return Object.values(splitOffsets);
}

export const refreshTooltips = () => {
    (window as any)?.WH?.Tooltips && (window as any).WH.Tooltips.refreshLinks()
};

export const webUuid = () => {
    return crypto.randomUUID().split('-')[0]
};

export const findInvalidCds = (cds: PlannedPlayerRaidCDs, overrides: Record<number, number>) => {
    const lastAbilityUse: Record<number, number> = {};

    const ROUNDING_EPSILON = 1;
    return cds.casts.reduce((errs, cd) => {
        const lastUse = lastAbilityUse[cd.spellId];

        if (lastUse === undefined) {
            lastAbilityUse[cd.spellId] = cd.timestamp;
            return errs;
        }
        const cooldown = (overrides[cd.spellId] ?? cd.cooldown);

        if (cd.timestamp < lastUse + cooldown - ROUNDING_EPSILON) {
            return [...errs, cd];
        }

        return errs;
    }, [] as CooldownEvent[]);
};

export const findUnusedCDs = (classCDs: Cooldown<Class>[], raidCdCasts: CooldownEvent[], fightSec: number, overrides: Record<number, number>, tracking: Record<number, boolean>): Record<string, number[][]> => {
    const usagesByAbility = raidCdCasts.reduce((acc, cur) => {
        acc[cur.ability] = [...(acc[cur.ability] ?? []), cur];
        return acc;
    }, {} as Record<string, CooldownEvent[]>);

    const missingUses = classCDs
        .filter(cd => tracking[cd.spellId] ?? true)
        .reduce((acc, cd) => {
            const usages = usagesByAbility[cd.ability];

            if (!usages) {
                acc[cd.ability] = [[0, fightSec]];
                return acc;
            }

            const EXCLUDE_END = 5;

            const rangesMissingUsage = usages.map((usage, i) => {
                const priorUsage = (usages[i - 1] as CooldownEvent | undefined);
                const nextUsage = (usages[i + 1] as CooldownEvent | undefined);

                const cooldown = (overrides[usage.spellId] ?? usage.cooldown);

                const gapForPriorUse = !!priorUsage && (priorUsage.timestamp + cooldown + cooldown < usage.timestamp);
                const gapForNextUse = !!nextUsage && (usage.timestamp + cooldown + cooldown < nextUsage.timestamp);

                const missingPriorUse = !priorUsage && (cooldown < usage.timestamp);
                const missingNextUse = !nextUsage && (usage.timestamp + cooldown < fightSec);

                const hasUsefulNextUse = usage.timestamp + cooldown + EXCLUDE_END < fightSec;

                if (missingPriorUse && missingNextUse) {
                    return [[0, usage.timestamp - cooldown], [usage.timestamp + cooldown, fightSec]]
                }

                if (missingPriorUse) {
                    return [[0, usage.timestamp - cooldown]]
                }

                if (gapForPriorUse) {
                    return [[priorUsage.timestamp + cooldown, usage.timestamp - cooldown]]
                }

                if (missingNextUse && hasUsefulNextUse) {
                    return [[usage.timestamp + cooldown, fightSec]];
                }

                if (gapForNextUse) {
                    return [[usage.timestamp + cooldown, nextUsage.timestamp - cooldown]]
                }

                return null;
            })
                .flat(1)
                .filter((u): u is (number)[] => !!u);

            if (rangesMissingUsage.length > 0) {
                acc[cd.ability] = rangesMissingUsage;
            }

            return acc;
        }, {} as Record<string, number[][]>);

    return missingUses;
};
