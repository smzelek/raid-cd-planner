export const cooldownTimeDisplay = (sec: number) => {
    const _mins = sec / 60;
    const mins = _mins > 0 ? `${_mins}m` : ''
    const _secs = sec % 60;
    const secs = _secs > 0 ? `${_secs}s` : ''

    return `${mins}${secs}`
}

export const timelineTimeDisplay = (sec: number) => {
    const _mins = String(Math.floor(sec / 60)).padStart(2, '0');
    const _secs = String(sec % 60).padStart(2, '0');

    return `${_mins}:${_secs}`
}

export const toSec = (tstring: string) => {
    const [min, sec] = tstring.split(':');
    return Number(min) * 60 + Number(sec);
}

export const offsetEntries = (rawEvents: { time: number, duration: number, offset: number }[],) => {
    let offsetExpirations: Record<number, number> = {};

    for (let i in rawEvents) {
        const evt = rawEvents[i];
        const firstAvailableOffset = Object.entries(offsetExpirations)
            .sort(([o1], [o2]) => Number(o1) - Number(o2))
            .find(([o, exp]) => exp + 1 < evt.time)?.[0]
        const nextOffset = Object.values(offsetExpirations).length + 1;

        const toUse = Number(firstAvailableOffset || nextOffset);
        offsetExpirations[toUse] = evt.time + evt.duration;
        evt.offset = toUse;
    }

    return rawEvents;
}