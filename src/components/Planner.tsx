import styles from './Planner.module.scss'
import { useEffect, useRef, useState, useMemo } from 'react'
import { FLAT_COOLDOWNS, _testAbilities, _testBossTimeline, _testTimelineEnd } from './constants';
import { toSec, offsetEntries } from './utils';
import CheatSheet from './CheatSheet';
import Roster from './Roster';
import Timeline from './Timeline';
import { RosterMember, BossTimeline, PlayerTimeline, PlayerTimelineInput } from './types';

export default function Planner() {
    const effectRan = useRef(false);
    const [roster, setRoster] = useState<RosterMember[]>([]);
    const [raidCDTimeline, setRaidCDTimeline] = useState<PlayerTimelineInput>([]);

    useEffect(() => {
        if (effectRan.current && (window as any).WH) {
            (window as any).WH.Tooltips.refreshLinks()
        }
    }, [roster, raidCDTimeline])

    useEffect(() => {
        if (!effectRan.current) {
            const scriptTag = document.createElement('script');
            (window as any).whTooltips = { 'colorLinks': true, 'iconizeLinks': true, 'renameLinks': false, 'iconSize': 'small' };
            scriptTag.src = "https://wow.zamimg.com/js/tooltips.js"
            document.head.appendChild(scriptTag)
        }

        return () => { effectRan.current = true };
    }, [])

    const offsetBossAbilityEvents: BossTimeline = useMemo(() => {
        const _rawEvents: BossTimeline = _testBossTimeline
            .map(a => a.times.map(at => ({
                ..._testAbilities.find(_ta => _ta.ability === a.ability)!,
                time: toSec(at),
                offset: 0,
            })))
            .flat(1)


        const _sortedEvents = _rawEvents.sort((a, b) => a.time - b.time);
        const _offsetEvents = offsetEntries(_sortedEvents) as BossTimeline;
        return _offsetEvents;
    }, [])

    const offsetPlayerAbilityEvents: PlayerTimeline = useMemo(() => {
        const _rawEvents: PlayerTimeline = raidCDTimeline
            .map(evt => evt.times.map(at => {
                const ability = FLAT_COOLDOWNS.find(cd => cd.ability === evt.ability)!;
                const player = roster.find(member => member.playerId === evt.playerId);
                if (!player) {
                    return null;
                }
                return {
                    ...ability,
                    time: toSec(at),
                    cooldown: evt.cooldownOverride || ability.cooldown,
                    duration: evt.durationOverride || ability.duration,
                    playerId: evt.playerId,
                    name: player.name,
                    class: player.class,
                    offset: 0,
                }
            }))
            .flat(1)
            .filter(e => !!e) as PlayerTimeline;

        const _sortedEvents = _rawEvents.sort((a, b) => (a.time + a.offset) - (b.time + b.offset));
        const _offsetEvents = offsetEntries(_sortedEvents) as PlayerTimeline;

        return _offsetEvents;
    }, [raidCDTimeline, roster])

    return (
        <>
            <header className={styles['header']}>
                <h1>Raid CD Planner</h1>
            </header>
            <main className={styles['main']}>
                <section className={styles.builder}>
                    <Roster roster={roster} setRoster={setRoster} raidCDTimeline={offsetPlayerAbilityEvents} setRaidCDTimeline={setRaidCDTimeline} />
                    <CheatSheet roster={roster} />
                </section>
                <Timeline roster={roster} bossTimeline={offsetBossAbilityEvents} playerTimeline={offsetPlayerAbilityEvents} />
            </main>
        </>
    )
}
