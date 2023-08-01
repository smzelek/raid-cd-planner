import styles from './Planner.module.scss'
import { useEffect, useRef, useState, useMemo } from 'react'
import { FLAT_COOLDOWNS, _testAbilities, _testBossTimeline, _testRaidCDTimeline, _testRoster, _testTimelineEnd } from './constants';
import { toSec, orderConcurrentEvents, priorAndOverlapsNow } from './utils';
import CheatSheet from './CheatSheet';
import Roster from './Roster';
import Timeline from './Timeline';
import { RosterMember, BossTimeline, BossAbilityEvent, PlayerTimeline, PlayerAbilityEvent } from './types';

export default function Planner() {
    const effectRan = useRef(false);
    const [roster, setRoster] = useState<RosterMember[]>(_testRoster);

    useEffect(() => {
        if (effectRan.current && (window as any).WH) {
            (window as any).WH.Tooltips.refreshLinks()
        }
    }, [roster])

    useEffect(() => {
        if (!effectRan.current) {
            const scriptTag = document.createElement('script');
            (window as any).whTooltips = { 'colorLinks': true, 'iconizeLinks': true, 'renameLinks': false, 'iconSize': 'small' };
            scriptTag.src = "https://wow.zamimg.com/js/tooltips.js"
            document.head.appendChild(scriptTag)
        }

        return () => { effectRan.current = true };
    }, [])

    const raidCDTimeline = useMemo(() => {
        return _testRaidCDTimeline.filter(rcd => roster.some(r => r.playerId === rcd.playerId))
    }, [_testRaidCDTimeline, roster])

    const offsetBossAbilityEvents: BossTimeline = useMemo(() => {
        const _rawEvents: BossAbilityEvent[] = _testBossTimeline
            .map(a => a.times.map(at => ({
                ..._testAbilities.find(_ta => _ta.ability === a.ability)!,
                time: toSec(at)
            })))
            .flat(1)

        const eventTimeline = _rawEvents.map((evt, i) => {
            const stillActive = _rawEvents.filter((otherEvt, ii) => i != ii && priorAndOverlapsNow(evt.time, otherEvt.time, otherEvt.duration));
            const concurrentOrder = orderConcurrentEvents(_rawEvents, evt.time, i);

            return {
                ...evt,
                offset: stillActive.length + concurrentOrder
            }
        });

        eventTimeline.sort((a, b) => (a.time + a.offset) - (b.time + b.offset));
        return eventTimeline;
    }, [_testBossTimeline, _testAbilities])

    const offsetPlayerAbilityEvents: PlayerTimeline = useMemo(() => {
        const _rawEvents: PlayerAbilityEvent[] = raidCDTimeline
            .map<PlayerAbilityEvent[]>(evt => evt.times.map(at => {
                const ability = FLAT_COOLDOWNS.find(cd => cd.ability === evt.ability)!;
                const player = roster.find(member => member.playerId === evt.playerId)!;
                return {
                    ...ability,
                    time: toSec(at),
                    cooldown: evt.cooldownOverride || ability.cooldown,
                    duration: evt.durationOverride || ability.duration,
                    playerId: evt.playerId,
                    name: player.name,
                    class: player.class,
                }
            }))
            .flat(1);

        const eventTimeline = _rawEvents.map((evt, i) => {
            const stillActive = _rawEvents.filter((otherEvt, ii) => i != ii && priorAndOverlapsNow(evt.time, otherEvt.time, otherEvt.duration));
            const concurrentOrder = orderConcurrentEvents(_rawEvents, evt.time, i);

            return {
                ...evt,
                offset: stillActive.length + concurrentOrder
            }
        });

        eventTimeline.sort((a, b) => (a.time + a.offset) - (b.time + b.offset));
        return eventTimeline;
    }, [raidCDTimeline, FLAT_COOLDOWNS])

    return (
        <>
            <header className={styles['header']}>
                <h1>Raid CD Planner</h1>
            </header>
            <main className={styles['main']}>
                <section className={styles.builder}>
                    <Roster roster={roster} setRoster={setRoster} />
                    <CheatSheet roster={roster} />
                </section>
                <section className={styles.timeline}>
                    <Timeline roster={roster} bossTimeline={offsetBossAbilityEvents} playerTimeline={offsetPlayerAbilityEvents} />
                </section>
            </main>
        </>
    )
}
