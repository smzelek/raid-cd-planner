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

export const priorAndOverlapsNow = (now: number, start: number, duration: number) => start < now && (start + duration + 1) >= now;
export const orderConcurrentEvents = (rawEvents: { time: number }[], searchTime: number, searchIdx: number) => {
    return rawEvents
        .map((e, i) => ({ ...e, order: i }))
        .filter(otherEvt => otherEvt.time === searchTime)
        .findIndex(e => e.order === searchIdx);
}
