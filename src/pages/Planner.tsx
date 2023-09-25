import styles from '@/styles/Global.module.scss'
import { useEffect, useRef, useState, useMemo } from 'react'
import {
    BOSS_ABILITIES, BOSS_PHASES, FLAT_COOLDOWNS, cooldownsBySpec,
    BossTimelineData, PlayerTimelineData, UserPlayerPlan, BossPlan, SavedProfile, PlayerId, Cooldown, Class
} from '@/constants';
import { toSec, offsetEntries, displaySec } from '@/utils';
import CheatSheet from '@/components/CheatSheet/CheatSheet';
import RaidPlanner from '@/components/PlayerPlanner/PlayerPlanner';
import Timeline from '@/components/Timeline/Timeline';
import BossPlanner from '@/components/BossPlanner/BossPlanner';
import CopyButton from '@/components/CopyButton/CopyButton';

export default function Planner() {
    const effectRan = useRef(false);
    const [userBossPlan, setUserBossPlan] = useState<BossPlan>({
        boss: 'Echo of Neltharion',
        timeline: BOSS_PHASES['Echo of Neltharion'],
    });
    const [userPlayerPlan, setUserPlayerPlan] = useState<UserPlayerPlan>({
        roster: [],
        rawPlannedAbilityUses: {},
        plannedAbilityUses: {},
        abilityCooldownOverrides: {},
        abilityDurationOverrides: {},
    });

    useEffect(() => {
        if (effectRan.current && (window as any).WH) {
            (window as any).WH.Tooltips.refreshLinks()
        }
    }, [userBossPlan, userPlayerPlan])

    useEffect(() => {
        if (!effectRan.current) {
            const scriptTag = document.createElement('script');
            (window as any).whTooltips = { 'colorLinks': true, 'iconizeLinks': true, 'renameLinks': false, 'iconSize': 'small' };
            scriptTag.src = "https://wow.zamimg.com/js/tooltips.js"
            document.head.appendChild(scriptTag)
            effectRan.current = true
        }
    }, [])

    const bossTimelineData: BossTimelineData = useMemo(() => {
        const phaseArray = Object.values(userBossPlan.timeline.phases);
        const _rawBossAbilities = phaseArray
            .map((phase, phaseNum) => {
                const phaseStart = toSec(phase.start);
                const nextPhaseStart = phaseArray[phaseNum + 1]?.start;
                const phaseEnd = nextPhaseStart ? toSec(nextPhaseStart) : Infinity;

                const abilities = Object.entries(phase.abilities).map(([abilityName, _times]) => {
                    const times = _times.trim().split(' ').filter(t => !!t).map(t => toSec(t) + phaseStart).filter(t => t < phaseEnd)
                    const ability = BOSS_ABILITIES[userBossPlan.boss].find(_ta => _ta.ability === abilityName)!;
                    return times.map((at, i) => ({
                        ...ability,
                        ability: `${ability.ability} ${i + 1}`,
                        time: at,
                        offset: 0,
                    }))
                });

                return abilities.flat(1);
            })
            .flat(1);

        const _bossEvents = [
            ...(Object.keys(userBossPlan.timeline.phases).length > 1 ?
                Object.entries(userBossPlan.timeline.phases).map(([phaseName, phase]) => ({ name: phaseName, time: toSec(phase.start) })) : []),
            ...(userBossPlan.timeline.enrage ? [{ name: 'Enrage', time: toSec(userBossPlan.timeline.enrage) }] : [])
        ]

        const _sortedAbilityEvents = _rawBossAbilities.sort((a, b) => a.time - b.time);
        const _offsetAbilityEvents = offsetEntries(_sortedAbilityEvents);
        return {
            boss: userBossPlan.boss,
            timeline: _offsetAbilityEvents,
            events: _bossEvents,
        };
    }, [userBossPlan])

    const playerTimelineData: PlayerTimelineData = useMemo(() => {
        const rosterCDs = userPlayerPlan.roster.reduce((acc, cur) => {
            const cooldowns = cooldownsBySpec(cur);
            acc[cur.playerId] = cooldowns.map(cd => {
                const cdOverride = userPlayerPlan.abilityCooldownOverrides?.[cur.playerId]?.[cd.ability];
                const durationOverride = userPlayerPlan.abilityDurationOverrides?.[cur.playerId]?.[cd.ability];

                return {
                    ...cd,
                    cooldown: Number(cdOverride) || cd.cooldown,
                    duration: Number(durationOverride) || cd.duration
                }
            });
            return acc;
        }, {} as Record<PlayerId, Cooldown<Class>[]>);
        const rosterCDPool = Object.entries(rosterCDs).map(([playerId, cds]) => cds.map(cd => ({ ...cd, playerId }))).flat(1)

        const _raidTimeline = Object.entries(rosterCDs)
            .map(([playerId, cds]) => cds.map((cd => {
                const times = (userPlayerPlan.plannedAbilityUses?.[playerId]?.[cd.ability]);
                return {
                    ability: cd.ability,
                    times: times ? times.trim().split(' ') : [],
                    cooldown: cd.cooldown,
                    duration: cd.duration,
                    playerId: playerId,
                };
            }))).flat(1);

        const _rawAbilityEvents = _raidTimeline
            .map(evt => evt.times.map(at => {
                const ability = FLAT_COOLDOWNS.find(cd => cd.ability === evt.ability)!;
                const player = userPlayerPlan.roster.find(member => member.playerId === evt.playerId);
                if (!player) {
                    return null;
                }
                return {
                    ...ability,
                    time: toSec(at),
                    cooldown: evt.cooldown,
                    duration: evt.duration,
                    playerId: evt.playerId,
                    name: player.name,
                    class: player.class,
                    offset: 0,
                }
            }))
            .flat(1)
            .filter(e => !!e) as PlayerTimelineData['timeline'];

        const _sortedAbilityEvents = _rawAbilityEvents.sort((a, b) => (a.time + a.offset) - (b.time + b.offset));
        const _offsetAbilityEvents = offsetEntries(_sortedAbilityEvents) as PlayerTimelineData['timeline'];

        return {
            roster: userPlayerPlan.roster,
            rosterCDPool: rosterCDPool,
            timeline: _offsetAbilityEvents,
            abilityCooldownOverrides: userPlayerPlan.abilityCooldownOverrides,
            abilityDurationOverrides: userPlayerPlan.abilityDurationOverrides,
        };
    }, [userPlayerPlan]);


    const buildNote = () => {
        const phases = Object.entries(userBossPlan.timeline.phases);
        if (phases.length === 1) {
            return playerTimelineData.timeline.map(evt => `{time:${displaySec(evt.time)}} ${evt.name}'s ${evt.ability}`).join('\n')
        }

        return phases.map(([phaseName, phase], phaseNum) => {
            const phaseStart = toSec(phase.start);
            const nextPhaseStart = phases[phaseNum + 1]?.[1]?.start;
            const phaseEnd = nextPhaseStart ? toSec(nextPhaseStart) : Infinity;
            return [
                `-- ${phaseName}`,
                ...playerTimelineData.timeline
                    .filter(evt => phaseStart <= evt.time && evt.time <= phaseEnd)
                    .map(evt => ({
                        ...evt,
                        time: evt.time - phaseStart
                    }))
                    .map(evt => `{time:${displaySec(evt.time)}${phaseNum > 0 ? `,p${phaseNum + 1}` : ''}} ${evt.name}'s ${evt.ability}`)
            ]
        }).flat(1).join('\n');
    }

    const exportNote = () => {
        const note = buildNote();
        navigator.clipboard.writeText(note);
    }

    const exportToSavedString = () => {
        const saveObj: SavedProfile = {
            userPlayerPlan: {
                roster: userPlayerPlan.roster,
                plannedAbilityUses: userPlayerPlan.plannedAbilityUses,
                abilityCooldownOverrides: userPlayerPlan.abilityCooldownOverrides,
                abilityDurationOverrides: userPlayerPlan.abilityDurationOverrides,
            },
            userBossPlan: {
                boss: userBossPlan.boss,
                timeline: userBossPlan.timeline
            },
        };
        const encoded = btoa(JSON.stringify(saveObj))
        navigator.clipboard.writeText(encoded);
    }

    const importFromSavedString = () => {
        const saveStr = prompt('Paste saved profile here');
        if (!saveStr) {
            return;
        }
        const saveObj: SavedProfile = JSON.parse(atob(saveStr));
        setUserBossPlan({
            ...saveObj.userBossPlan,
        });
        setUserPlayerPlan({
            ...saveObj.userPlayerPlan,
            rawPlannedAbilityUses: saveObj.userPlayerPlan.plannedAbilityUses
        })
    }

    return (
        <>
            <header className={styles['header']}>
                <h1 className={styles['app-title-bar']}>
                    Raid CD Planner
                    <div className={styles['app-title-actions']}>
                        <CopyButton onClick={exportNote}>Export to RT Note</CopyButton>
                        <CopyButton onClick={exportToSavedString}>Export to Profile String</CopyButton>
                        <button onClick={importFromSavedString}>Import from Profile String</button>
                    </div>
                </h1>
            </header>
            <main className={styles['main']}>
                <BossPlanner bossPlan={userBossPlan} setBossPlan={setUserBossPlan} />
                <section className={styles.builder}>
                    <RaidPlanner playerPlan={userPlayerPlan} setPlayerPlan={setUserPlayerPlan} />
                    <CheatSheet roster={userPlayerPlan.roster} />
                </section>
                <Timeline bossTimeline={bossTimelineData} playerTimeline={playerTimelineData} />
            </main>
        </>
    )
}
