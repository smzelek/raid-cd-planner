import { Fragment } from 'react';
import styles from '@/styles/Global.module.scss'
import { CLASS_COLORS, CLASS_OFFSET_COLORS, DEFAULT_BOSS_TIMELINE_ENDS } from "@/constants";
import { BossTimelineData, PlayerTimelineData } from '@/types';
import { timelineTimeDisplay, toSec } from "@/utils";
import DummyIcon from '../DummyIcon/DummyIcon';

export default function Timeline(props: { bossTimeline: BossTimelineData, playerTimeline: PlayerTimelineData }) {
    const { bossTimeline, playerTimeline } = props;

    const maxConcurrentBossAbilities = Math.max(...bossTimeline.timeline.map(obae => obae.offset), 0) + 1;
    const maxConcurrentPlayerAbilities = Math.max(...playerTimeline.timeline.map(obae => obae.offset), 0) + 1;
    const staticColumns = 2;
    const bossColOffset = staticColumns + 1;
    const playerColOffset = staticColumns + maxConcurrentBossAbilities + 1;

    const timelineEnd = toSec(DEFAULT_BOSS_TIMELINE_ENDS[bossTimeline.boss]);

    const bossAbilitySpaceForFrame = (time: number) => {
        return Array(maxConcurrentBossAbilities).fill(0)
            .map((_, col) => {
                return <div key={col}
                    style={{
                        gridRowStart: time + 2,
                        gridRowEnd: time + 2,
                        gridColumn: col + bossColOffset
                    }}>
                </div>
            })
    };
    const bossAbilitiesForFrame = (time: number) => {
        return Array(maxConcurrentBossAbilities).fill(0)
            .map((_, col) => {
                return bossTimeline.timeline.find(obae => obae.time === time && obae.offset === col)
            })
            .map((bossAbility, col) => {
                if (!bossAbility) {
                    return null;
                }
                return (<div key={col}
                    className={styles['timeline-ability']} style={{
                        gridRowStart: time + 2,
                        gridRowEnd: time + 2 + bossAbility.duration + 1,
                        gridColumn: col + bossColOffset,
                        whiteSpace: bossAbility.duration < 3 ? 'nowrap' : 'normal',
                    }}>
                    {bossAbility.spellId ? (
                        <a data-wh-icon-size="small"
                            href={`https://www.wowhead.com/spell=${bossAbility.spellId}`}>
                        </a>
                    ) : (
                        <DummyIcon sizeClass='iconsmall' />
                    )}
                    {bossAbility.ability}
                </div>)
            });
    };

    const playerAbilitySpaceForFrame = (time: number) => {
        return Array(maxConcurrentPlayerAbilities).fill(0)
            .map((_, col) => {
                return <div key={col}
                    style={{
                        gridRowStart: time + 2,
                        gridRowEnd: time + 2,
                        gridColumn: col + playerColOffset
                    }}>
                </div>
            });
    };
    const playerAbilitiesForFrame = (time: number) => {
        return Array(maxConcurrentPlayerAbilities).fill(0)
            .map((_, col) => {
                return playerTimeline.timeline.find(obae => obae.time === time && obae.offset === col)
            })
            .map((playerAbility, col) => {
                if (!playerAbility) {
                    return null;
                }
                return (<div key={`${time}-${col}-${playerAbility.spellId}`}
                    className={styles['timeline-ability']}
                    style={{
                        background: CLASS_COLORS[playerAbility.class],
                        color: CLASS_OFFSET_COLORS[playerAbility.class],
                        gridRowStart: time + 2,
                        gridRowEnd: time + 2 + playerAbility.duration + 1,
                        gridColumn: col + playerColOffset,
                        whiteSpace: playerAbility.duration < 3 ? 'nowrap' : 'normal',
                    }}>
                    <a data-wh-icon-size="small"
                        href={`https://www.wowhead.com/spell=${playerAbility.spellId}`}>
                    </a>
                    {playerAbility.name}&apos;s {playerAbility.ability}
                </div>)
            });
    };

    const availableRaidCDsForFrame = (time: number) => {
        if (!bossTimeline.timeline.find(obae => obae.time === time)) {
            return [];
        }

        const available = playerTimeline.rosterCDPool.filter(cd => {
            const lastUse = playerTimeline.timeline.findLast(evt => evt.playerId === cd.playerId && evt.spellId === cd.spellId && evt.time <= time);
            if (!lastUse) {
                return true;
            }
            return lastUse.time + cd.cooldown <= time;
        })

        const icons = (available.map((cd, i) => (
            <a key={`${time}-${cd.spellId}-${i}`} data-wh-icon-size="small"
                href={`https://www.wowhead.com/spell=${cd.spellId}`}>
            </a>
        )));

        return (<div className={styles['available-cds']}
            style={{
                gridRowStart: time + 2,
                gridRowEnd: time + 2,
                gridColumn: 2
            }}>
            {icons}
        </div>)
    };


    return (
        <div className={`${styles['flex-scroll-wrapper']} ${styles['timeline']}`}>
            <h3 className={styles['title-bar']}>Timeline</h3>
            <div className={`${styles['scroll-wrapper']} ${styles['module-box']} ${styles['timeline-grid']}`}
                style={{
                    gridTemplateColumns: `min-content min-content repeat(${maxConcurrentBossAbilities + maxConcurrentPlayerAbilities}, minmax(100px, min-content)) min-content auto`
                }}>
                <div className={styles['timeline-header']}
                    style={{
                        gridRow: 1,
                        gridColumnStart: 1,
                        gridColumnEnd: 1,
                    }}>
                </div>
                <div className={styles['timeline-header']}
                    style={{
                        gridRow: 1,
                        gridColumnStart: 2,
                        gridColumnEnd: 2,
                    }}>
                    Available
                </div>
                <div className={styles['timeline-header']}
                    style={{
                        gridRow: 1,
                        gridColumnStart: bossColOffset,
                        gridColumnEnd: bossColOffset + maxConcurrentBossAbilities,
                    }}>
                    Boss Abilities
                </div>
                <div className={styles['timeline-header']}
                    style={{
                        gridRow: 1,
                        gridColumnStart: playerColOffset,
                        gridColumnEnd: playerColOffset + maxConcurrentPlayerAbilities,
                    }}>
                    Raid CDs
                </div>
                {Array(timelineEnd + 1).fill(0).map((_, s) => (<Fragment key={s}>
                    <div className={styles['timeline-grid-cell']}
                        style={{
                            gridRowStart: s + 2,
                            gridRowEnd: s + 2,
                            gridColumn: 1
                        }}>
                        {s % 5 === 0 && timelineTimeDisplay(s)}
                    </div>
                    {availableRaidCDsForFrame(s)}
                    {bossAbilitySpaceForFrame(s)}
                    {bossAbilitiesForFrame(s)}
                    {playerAbilitySpaceForFrame(s)}
                    {playerAbilitiesForFrame(s)}
                    {(s % 5 === 0 ? (
                        <div className={styles['timeline-major-ticks']}
                            style={{
                                gridRowStart: s + 2,
                                gridRowEnd: s + 2
                            }}>
                        </div>
                    ) : (<>
                        <div className={styles['timeline-minor-ticks-emphasis']}
                            style={{
                                gridRowStart: s + 2,
                                gridRowEnd: s + 2,
                            }}>
                        </div>
                        <div className={styles['timeline-minor-ticks']}
                            style={{
                                gridRowStart: s + 2,
                                gridRowEnd: s + 2,
                            }}>
                        </div>
                    </>))}
                </Fragment>))}
            </div>
        </div>
    )
}
