import { Fragment } from 'react';
import styles from '@/styles/Global.module.scss'
import { BossTimelineData, CLASS_COLORS, CLASS_OFFSET_COLORS, Class, Cooldown, PlayerTimelineData } from "@/constants";
import { displaySec, toSec } from "@/utils";

export default function Timeline(props: { bossTimeline: BossTimelineData, playerTimeline: PlayerTimelineData }) {
    const { bossTimeline, playerTimeline } = props;
    console.log(bossTimeline)
    const maxConcurrentBossAbilities = Math.max(...bossTimeline.timeline.map(obae => obae.offset), 0) + 1;
    const maxConcurrentPlayerAbilities = Math.max(...playerTimeline.timeline.map(obae => obae.offset), 0) + 1;
    const bossColOffset = 2;
    const playerColOffset = maxConcurrentBossAbilities + 2;
    const availableColOffset = playerColOffset + maxConcurrentPlayerAbilities + 1;

    const timelineEnd = Math.max(
        bossTimeline.timeline[bossTimeline.timeline.length - 1]?.time ?? 0,
        bossTimeline.events[bossTimeline.events.length - 1]?.time ?? 0,
        playerTimeline.timeline[playerTimeline.timeline.length - 1]?.time ?? 0,
    )

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
                    <a data-wh-icon-size="small"
                        href={`https://www.wowhead.com/spell=${bossAbility.spellId}`}>
                    </a>
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

        const isOffCD = (pcd: PlayerTimelineData['rosterCDPool'][number]) => {
            const mostRecentUse = playerTimeline.timeline.findLast((evt) => (evt.playerId === pcd.playerId) && (evt.spellId === pcd.spellId) && (evt.time <= time));
            if (!mostRecentUse) {
                return true;
            }
            return mostRecentUse.time + pcd.cooldown <= time;
        };

        const wontPreventPlannedCD = (pcd: PlayerTimelineData['rosterCDPool'][number]) => {
            const nextPlannedUse = playerTimeline.timeline.find((evt) => (evt.playerId === pcd.playerId) && (evt.spellId === pcd.spellId) && evt.time > time);
            if (!nextPlannedUse) {
                return true;
            }
            return time + pcd.cooldown <= nextPlannedUse.time;
        }

        const available = playerTimeline.rosterCDPool.filter(cd => isOffCD(cd) && wontPreventPlannedCD(cd));

        const icons = (available.map((cd, i) => (
            <a key={`${time}-${cd.spellId}-${i}`} data-wh-icon-size="small"
                href={`https://www.wowhead.com/spell=${cd.spellId}`}>
            </a>
        )));

        return (<div className={styles['available-cds']}
            style={{
                gridRowStart: time + 2,
                gridRowEnd: time + 2,
                gridColumn: availableColOffset
            }}>
            {icons}
        </div>)
    };

    const eventsForFrame = (time: number) => {
        const event = bossTimeline.events.find(e => e.time === time);

        if (!event) {
            return null;
        }
        return (<div
            className={styles['timeline-event']} style={{
                gridRowStart: time + 2,
                gridRowEnd: time + 3,
                gridColumnStart: 1,
                gridColumnEnd: availableColOffset + 1,
            }}>
            {event.name}
        </div>)
    };

    return (
        <div className={`${styles['flex-scroll-wrapper']} ${styles['timeline']}`}>
            <h3 className={styles['title-bar']}>Timeline</h3>
            <div className={`${styles['scroll-wrapper']} ${styles['timeline-grid']}`}
                style={{
                    gridTemplateColumns: `min-content repeat(${maxConcurrentBossAbilities + maxConcurrentPlayerAbilities}, minmax(100px, min-content)) auto min-content`
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
                        gridColumnStart: bossColOffset,
                        gridColumnEnd: bossColOffset + maxConcurrentBossAbilities,
                    }}>
                    {bossTimeline.boss}'s Abilities
                </div>
                <div className={styles['timeline-header']}
                    style={{
                        gridRow: 1,
                        gridColumnStart: playerColOffset,
                        gridColumnEnd: playerColOffset + maxConcurrentPlayerAbilities,
                    }}>
                    Raid CDs
                </div>
                <div className={styles['timeline-header']}
                    style={{
                        gridRow: 1,
                        gridColumnStart: availableColOffset,
                        gridColumnEnd: availableColOffset,
                    }}>
                    Available
                </div>
                {Array(timelineEnd + 1).fill(0).map((_, s) => (<Fragment key={s}>
                    <div className={styles['timeline-grid-cell']}
                        style={{
                            gridRowStart: s + 2,
                            gridRowEnd: s + 2,
                            gridColumn: 1
                        }}>
                        {s % 5 === 0 && displaySec(s)}
                    </div>
                    {eventsForFrame(s)}
                    {bossAbilitySpaceForFrame(s)}
                    {bossAbilitiesForFrame(s)}
                    {playerAbilitySpaceForFrame(s)}
                    {playerAbilitiesForFrame(s)}
                    {availableRaidCDsForFrame(s)}
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
