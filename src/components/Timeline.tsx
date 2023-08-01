import styles from './Planner.module.scss'
import { CLASS_COLORS, CLASS_OFFSET_COLORS, _testTimelineEnd, cooldownsBySpec } from "./constants";
import { RosterMember, BossTimeline, PlayerTimeline } from './types';
import { timelineTimeDisplay, toSec } from "./utils";

export default function Timeline(props: { roster: RosterMember[], bossTimeline: BossTimeline, playerTimeline: PlayerTimeline }) {
    const { roster, bossTimeline, playerTimeline } = props;

    const maxConcurrentBossAbilities = Math.max(...bossTimeline.map(obae => obae.offset), 0) + 1;
    const maxConcurrentPlayerAbilities = Math.max(...playerTimeline.map(obae => obae.offset), 0) + 1;
    const staticColumns = 2;
    const bossColOffset = staticColumns + 1;
    const playerColOffset = staticColumns + maxConcurrentBossAbilities + 1;

    const timelineEnd = toSec(_testTimelineEnd);
    const timelineSecondFrames = Array(timelineEnd).fill(0).map((_, i) => i);

    const bossAbilitySpaceForFrame = (time: number) => {
        return Array(maxConcurrentBossAbilities).fill(0)
            .map((_, col) => {
                return <div style={{
                    gridRowStart: time + 1,
                    gridRowEnd: time + 1,
                    gridColumn: col + bossColOffset
                }} ></div>
            })
    };
    const bossAbilitiesForFrame = (time: number) => {
        return Array(maxConcurrentBossAbilities).fill(0)
            .map((_, col) => {
                return bossTimeline.find(obae => obae.time === time && obae.offset === col)
            })
            .map((bossAbility, col) => {
                if (!bossAbility) {
                    return null;
                }
                if (bossAbility.spellId) {
                    return (<div className={styles['timeline-ability']} style={{
                        gridRowStart: time + 1,
                        gridRowEnd: time + 1 + bossAbility.duration + 1,
                        gridColumn: col + bossColOffset,
                        whiteSpace: bossAbility.duration === 0 ? 'nowrap' : 'normal',
                    }}>
                        <a data-wh-icon-size="tiny"
                            href={`https://www.wowhead.com/spell=${bossAbility.spellId}`}>
                            {bossAbility.ability}
                        </a>
                    </div>)
                }
                return (<span className={styles['timeline-ability']} style={{
                    gridRowStart: time + 1,
                    gridRowEnd: time + 1 + bossAbility.duration + 1,
                    gridColumn: col + bossColOffset,
                }}>
                    {bossAbility.ability}
                </span>)
            });
    };

    const playerAbilitySpaceForFrame = (time: number) => {
        if (maxConcurrentPlayerAbilities === 0) {
            return [];
        }
        return Array(maxConcurrentPlayerAbilities).fill(0)
            .map((_, col) => {
                return <div key={col} style={{ gridRowStart: time + 1, gridRowEnd: time + 1, gridColumn: col + playerColOffset }} ></div>
            });
    };
    const playerAbilitiesForFrame = (time: number) => {
        if (maxConcurrentPlayerAbilities === 0) {
            return [];
        }
        return Array(maxConcurrentPlayerAbilities).fill(0)
            .map((_, col) => {
                return playerTimeline.find(obae => obae.time === time && obae.offset === col)
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
                        gridRowStart: time + 1,
                        gridRowEnd: time + 1 + playerAbility.duration + 1,
                        gridColumn: col + playerColOffset
                    }}>
                    <a data-wh-icon-size="tiny"
                        href={`https://www.wowhead.com/spell=${playerAbility.spellId}`}>
                        {playerAbility.name}'s {playerAbility.ability}
                    </a>
                </div>)
            });
    };

    const availableRaidCDsForFrame = (time: number) => {
        if (!bossTimeline.find(obae => obae.time === time)) {
            return [];
        }

        const fullRosterCds = roster.map(member => {
            const cooldowns = cooldownsBySpec(member);
            return cooldowns.map(cd => ({
                ...cd,
                ...member,
            }))
        }).flat(1);

        const available = fullRosterCds.filter(cd => {
            const lastUse = playerTimeline.findLast(evt => evt.playerId === cd.playerId && evt.spellId === cd.spellId && evt.time <= time);
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
                gridRowStart: time + 1,
                gridRowEnd: time + 1,
                gridColumn: 2
            }}>
            {icons}
        </div>)
    };

    return (
        <>
            <h3>Timeline</h3>
            <div className={styles['timeline-grid']}
                style={{
                    gridTemplateColumns: `repeat(${maxConcurrentBossAbilities + maxConcurrentPlayerAbilities + staticColumns}, min-content)`
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
                {timelineSecondFrames.map((s, i) => (<>
                    <div key={null}
                        className={styles['timeline-grid-cell']}
                        style={{
                            gridRowStart: i + 2,
                            gridRowEnd: i + 2,
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
                                gridRowStart: i + 2,
                                gridRowEnd: i + 2
                            }}>
                        </div>
                    ) : (<>
                        <div className={styles['timeline-minor-ticks-emphasis']}
                            style={{
                                gridRowStart: i + 2,
                                gridRowEnd: i + 2,
                            }}>
                        </div>
                        <div className={styles['timeline-minor-ticks']}
                            style={{
                                gridRowStart: i + 2,
                                gridRowEnd: i + 2,
                            }}>
                        </div>
                    </>))}
                </>))}
            </div>
        </>
    )
}
