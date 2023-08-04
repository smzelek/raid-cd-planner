import styles from './Planner.module.scss'
import { useEffect, useRef, useState, useMemo } from 'react'
import { BOSS_ABILITIES, FLAT_COOLDOWNS, _testBossTimeline, _testTimelineEnd, cooldownsBySpec } from './constants';
import { toSec, offsetEntries, timelineTimeDisplay } from './utils';
import CheatSheet from './CheatSheet';
import RaidPlanner from './Roster';
import Timeline from './Timeline';
import { BossTimelineData, PlayerTimelineData, UserPlayerPlan, UserBossPlan, SavedProfile, PlayerId, Cooldown, Class } from './types';
import BossPlanner from './BossPlanner';
import CopyButton from './CopyButton';

export default function Planner() {
    const effectRan = useRef(false);
    const [userBossPlan, setUserBossPlan] = useState<UserBossPlan>({
        boss: 'Rashok',
        plannedAbilityUses: _testBossTimeline,
        rawPlannedAbilityUses: _testBossTimeline,
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
        const _rawEvents = Object.entries(userBossPlan.plannedAbilityUses)
            .map(([ability, _times]) => {
                const times = _times ? _times.trim().split(' ') : []
                return times.map(at => ({
                    ...BOSS_ABILITIES[userBossPlan.boss].find(_ta => _ta.ability === ability)!,
                    time: toSec(at),
                    offset: 0,
                }))
            })
            .flat(1)


        const _sortedEvents = _rawEvents.sort((a, b) => a.time - b.time);
        const _offsetEvents = offsetEntries(_sortedEvents);
        return {
            boss: userBossPlan.boss,
            timeline: _offsetEvents
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

        const _rawEvents = _raidTimeline
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

        const _sortedEvents = _rawEvents.sort((a, b) => (a.time + a.offset) - (b.time + b.offset));
        const _offsetEvents = offsetEntries(_sortedEvents) as PlayerTimelineData['timeline'];

        return {
            roster: userPlayerPlan.roster,
            rosterCDPool: rosterCDPool,
            timeline: _offsetEvents,
            abilityCooldownOverrides: userPlayerPlan.abilityCooldownOverrides,
            abilityDurationOverrides: userPlayerPlan.abilityDurationOverrides,
        };
    }, [userPlayerPlan]);


    const exportNote = () => {
        const note = playerTimelineData.timeline.map(evt => `{time:${timelineTimeDisplay(evt.time)}} ${evt.name} ${evt.ability}`).join('\n')
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
                plannedAbilityUses: userBossPlan.plannedAbilityUses
            },
        }
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
            rawPlannedAbilityUses: saveObj.userBossPlan.plannedAbilityUses
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
                        <CopyButton onClick={exportNote}>Export to ERT</CopyButton>
                        <CopyButton onClick={exportToSavedString}>Export to Saved Profile</CopyButton>
                        <button onClick={importFromSavedString}>Import from Saved Profile</button>
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
