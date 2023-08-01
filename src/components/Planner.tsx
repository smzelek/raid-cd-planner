import styles from './Planner.module.scss'
import { useEffect, useRef, useState, useMemo } from 'react'
import Select from "./Select"

type Class = 'Warrior' | 'Paladin' | 'Hunter' | 'Rogue' | 'Priest' | 'Shaman' | 'Mage' | 'Warlock' | 'Monk' | 'Druid' | 'Demon Hunter' | 'Death Knight' | 'Evoker';

interface _SPECS extends Record<Class, string[]> {
    'Warrior': ['Arms', 'Fury', 'Protection'];
    'Paladin': ['Holy', 'Protection', 'Retribution'];
    'Hunter': ['Beast Mastery', 'Marksmanship', 'Survival'];
    'Rogue': ['Assassination', 'Outlaw', 'Subtlety'];
    'Priest': ['Discipline', 'Holy', 'Shadow'];
    'Shaman': ['Elemental', 'Enhancement', 'Restoration'];
    'Mage': ['Arcane', 'Fire', 'Frost'];
    'Warlock': ['Affliction', 'Demonology', 'Destruction'];
    'Monk': ['Brewmaster', 'Mistweaver', 'Windwalker'];
    'Druid': ['Balance', 'Feral', 'Guardian', 'Restoration'];
    'Demon Hunter': ['Havoc', 'Vengeance'];
    'Death Knight': ['Blood', 'Frost', 'Unholy'];
    'Evoker': ['Devastation', 'Preservation', 'Augmentation'];
}

type SpecOf<C extends Class> = _SPECS[C][number] | 'ALL'

type Cooldown<T extends Class> = {
    ability: string;
    spec: SpecOf<T>;
    cooldown: number;
    duration: number;
    spellId: number;
};

type Cooldowns = {
    [T in Class]: Cooldown<T>[];
};

const COOLDOWNS: Cooldowns = {
    'Hunter': [],
    'Warlock': [],
    'Mage': [],
    'Rogue': [],
    'Warrior': [
        {
            ability: 'Rallying Cry',
            spec: 'ALL',
            cooldown: 180,
            duration: 10,
            spellId: 97462,
        },
    ],
    'Paladin': [
        {
            ability: 'Aura Mastery',
            spec: 'Holy',
            cooldown: 180,
            duration: 8,
            spellId: 31821,
        },
    ],
    'Priest': [
        {
            ability: 'Power Word: Barrier',
            spec: 'Discipline',
            cooldown: 180,
            duration: 10,
            spellId: 62618,
        },
        {
            ability: 'Divine Hymn',
            spec: 'Holy',
            cooldown: 180,
            duration: 15,
            spellId: 64843,
        },
        {
            ability: 'Apotheosis',
            spec: 'Holy',
            cooldown: 120,
            duration: 20,
            spellId: 200183,
        },
        {
            ability: 'Holy Word: Salvation',
            spec: 'Holy',
            cooldown: 720,
            duration: 0,
            spellId: 265202,
        },
    ],
    'Shaman': [
        {
            ability: 'Spirit Link Totem',
            spec: 'Restoration',
            cooldown: 180,
            duration: 6,
            spellId: 98008,
        },
        {
            ability: 'Healing Tide Totem',
            spec: 'Restoration',
            cooldown: 180,
            duration: 10,
            spellId: 108280,
        },
        {
            ability: 'Ascendance',
            spec: 'Restoration',
            cooldown: 180,
            duration: 15,
            spellId: 114052,
        },
    ],
    'Monk': [
        {
            ability: 'Revival',
            spec: 'Mistweaver',
            cooldown: 180,
            duration: 0,
            spellId: 115310,
        },
    ],
    'Druid': [
        {
            ability: 'Tranquility',
            spec: 'Restoration',
            cooldown: 180,
            duration: 8,
            spellId: 740,
        },
    ],
    'Death Knight': [
        {
            ability: 'Anti-Magic Zone',
            spec: 'ALL',
            cooldown: 120,
            duration: 8,
            spellId: 51052,
        },
    ],
    'Demon Hunter': [
        {
            ability: 'Darkness',
            spec: 'ALL',
            cooldown: 300,
            duration: 8,
            spellId: 196718,
        },
    ],
    'Evoker': [
        {
            ability: 'Dream Flight',
            spec: 'Preservation',
            cooldown: 120,
            duration: 15,
            spellId: 359816
        },
        {
            ability: 'Rewind',
            spec: 'Preservation',
            cooldown: 240,
            spellId: 363534,
            duration: 0,
        }
    ]
};

const FLAT_COOLDOWNS = Object.values(COOLDOWNS).flat(1);

const CLASS_COLORS: Record<Class, string> = {
    'Warrior': '#C79C6E',
    'Paladin': '#F58CBA',
    'Hunter': '#ABD473',
    'Rogue': '#FFF569',
    'Priest': '#FFFFFF',
    'Shaman': '#0070DE',
    'Mage': '#40C7EB',
    'Warlock': '#8787ED',
    'Monk': '#00FF96',
    'Druid': '#FF7D0A',
    'Demon Hunter': '#A330C9',
    'Death Knight': '#C41F3B',
    'Evoker': '#5ABD8C',
};

const CLASS_OFFSET_COLORS: Record<Class, string> = {
    'Warrior': '#FFFFFF',
    'Paladin': '#FFFFFF',
    'Hunter': '#FFFFFF',
    'Rogue': '#FFFFFF',
    'Priest': '#000000',
    'Shaman': '#FFFFFF',
    'Mage': '#FFFFFF',
    'Warlock': '#FFFFFF',
    'Monk': '#FFFFFF',
    'Druid': '#FFFFFF',
    'Demon Hunter': '#FFFFFF',
    'Death Knight': '#FFFFFF',
    'Evoker': '#FFFFFF',
};

type SpecClassMapper<T extends Class> = T extends Class ? { [key in T]: { spec: SpecOf<T> } }[T] & { class: T } : never;
type SpecMatchesClass = SpecClassMapper<Class>;
type SpecChoices = SpecMatchesClass & {
    display: string;
};
type RosterMember = SpecMatchesClass & {
    name: string;
    playerId: string;
};
type BossAbility = {
    ability: string;
    spellId: number | null;
    duration: number;
};
type BossAbilityEvent = {
    ability: string;
    spellId: number | null;
    duration: number;
    time: number;
};
type PlayerAbilityEvent = {
    ability: string;
    cooldown: number;
    playerId: string;
    name: string;
    class: Class;
    spellId: number;
    duration: number;
    time: number;
};
type BossTimeline = {
    ability: string;
    times: string[];
}[];
type PlayerTimeline = {
    ability: string;
    cooldownOverride?: number;
    durationOverride?: number;
    playerId: string;
    times: string[];
}[];

const _testRoster: RosterMember[] = [
    { name: 'Niinetails', class: 'Paladin', spec: 'Holy', playerId: 'f62d6469-e926-4ea4-8ed2-5deccec2b02d' },
    { name: 'Ferdaherde', class: 'Warrior', spec: 'Protection', playerId: 'd8b706cc-9a3c-4990-b6c2-135487c47d37' },
    { name: 'Moonmoose', class: 'Druid', spec: 'Restoration', playerId: 'cbd4d44e-024a-4a93-9c81-c85cffbcda1d' },
    { name: 'Lysdexic', class: 'Priest', spec: 'Discipline', playerId: 'e7041e2c-f545-4526-8087-d462cd2c6865' },
    { name: 'Orkwa', class: 'Shaman', spec: 'Restoration', playerId: '42a7973a-322d-4117-87ff-d02c072b6b12' },
    { name: 'Meepeadeep', class: 'Demon Hunter', spec: 'Havoc', playerId: '1da84713-edf7-47a2-9453-3414def8b420' },
    { name: 'Willywankers', class: 'Death Knight', spec: 'Unholy', playerId: '78515ff0-1f06-450e-8e04-ff7fd931edca' },
    { name: 'Tjdkk', class: 'Death Knight', spec: 'Unholy', playerId: '06046982-be38-4251-9dee-7b242d935e7a' },
];

const _testAbilities: BossAbility[] = [
    {
        ability: 'Searing Slam',
        spellId: 405821,
        duration: 0,
    },
    {
        ability: 'Shadowflame Energy',
        spellId: 410077,
        duration: 5,
    },
    {
        ability: 'Charged Smash',
        spellId: 400777,
        duration: 0,
    },
    {
        ability: 'Overcharged',
        spellId: 405827,
        duration: 5,
    },
    {
        ability: 'Conduit Flare',
        spellId: 405828,
        duration: 5,
    },
    {
        ability: 'Scorching Heatwave',
        spellId: 404445,
        duration: 0,
    },
    {
        ability: 'Scorched Flesh',
        spellId: 408204,
        duration: 0,
    },
    {
        ability: 'Smoldering Rage',
        spellId: 406165,
        duration: 0,
    },
    {
        ability: 'Shattered Conduit',
        spellId: 410690,
        duration: 0,
    },
    {
        ability: 'Intermission',
        spellId: null,
        duration: 20
    }
]

const _testTimelineEnd = '6:20';
const _testBossTimeline: BossTimeline = [
    {
        ability: 'Charged Smash',
        times: ['0:21', '1:07', '2:35', '3:21', '4:51', '5:37']
    },
    {
        ability: 'Shadowflame Energy',
        times: ['0:16', '1:01', '1:34', '2:30', '3:16', '3:48', '4:43', '5:29', '6:01']
    },
    {
        ability: 'Intermission',
        times: ['1:53', '4:08']
    },
    {
        ability: 'Searing Slam',
        times: ['5:20', '5:55']
    },
];

const _testRaidCDTimeline: PlayerTimeline = [
    {
        ability: 'Anti-Magic Zone',
        times: ['0:21', '2:35', '4:51'],
        playerId: _testRoster.find(m => m.name === "Willywankers")!.playerId,
    },
    {
        ability: 'Power Word: Barrier',
        times: ['1:07', '5:20'],
        playerId: _testRoster.find(m => m.name === "Lysdexic")!.playerId,
    },
    {
        ability: 'Spirit Link Totem',
        times: ['0:21', '3:21', '6:20'],
        playerId: _testRoster.find(m => m.name === "Orkwa")!.playerId,
    },
    {
        ability: 'Ascendance',
        times: ['1:07', '4:51'],
        playerId: _testRoster.find(m => m.name === "Orkwa")!.playerId,
    },
    {
        ability: 'Healing Tide Totem',
        times: ['2:35', '5:37'],
        playerId: _testRoster.find(m => m.name === "Orkwa")!.playerId,
    },
    {
        ability: 'Darkness',
        times: ['0:21', '5:37'],
        playerId: _testRoster.find(m => m.name === "Meepeadeep")!.playerId,
    },
    {
        ability: 'Rallying Cry',
        times: ['1:07', '4:08'],
        playerId: _testRoster.find(m => m.name === "Ferdaherde")!.playerId,
    },
    {
        ability: 'Aura Mastery',
        times: ['1:53', '5:55'],
        playerId: _testRoster.find(m => m.name === "Niinetails")!.playerId,
    },
    {
        ability: 'Tranquility',
        times: ['1:53', '4:08', '6:08'],
        playerId: _testRoster.find(m => m.name === "Moonmoose")!.playerId,
    }
]

export default function Planner() {
    const validSpecs = Object.entries(COOLDOWNS)
        .filter(([_class, _cds]) => !!_cds.length)
        .map(([_class, _cds]) => {
            const specs = _cds.map(cd => {
                const specPrefix = cd.spec === "ALL" ? "" : `${cd.spec} `;
                return {
                    class: _class,
                    spec: cd.spec,
                    display: `${specPrefix}${_class}`
                }
            })

            return Array.from(new Map(specs.map(s => [s.display, s])).values())
        })
        .flat(1) as SpecChoices[];

    const cooldownsBySpec = (s: SpecMatchesClass) => {
        return (COOLDOWNS[s.class] as Cooldown<Class>[]).filter((cd) => cd.spec === "ALL" || cd.spec === s.spec)
    }

    const [roster, setRoster] = useState<RosterMember[]>(_testRoster);

    const cooldownTimeDisplay = (sec: number) => {
        const _mins = sec / 60;
        const mins = _mins > 0 ? `${_mins}m` : ''
        const _secs = sec % 60;
        const secs = _secs > 0 ? `${_secs}s` : ''

        return `${mins}${secs}`
    }

    const timelineTimeDisplay = (sec: number) => {
        const _mins = String(Math.floor(sec / 60)).padStart(2, '0');
        const _secs = String(sec % 60).padStart(2, '0');

        return `${_mins}:${_secs}`

    }

    const toSec = (tstring: string) => {
        const [min, sec] = tstring.split(':');
        return Number(min) * 60 + Number(sec);
    }

    useEffect(() => {
        if (effectRan.current && (window as any).WH) {
            (window as any).WH.Tooltips.refreshLinks()
        }
    }, [roster])

    const effectRan = useRef(false);
    useEffect(() => {
        if (!effectRan.current) {
            setTimeout(() => {
                const scriptTag = document.createElement('script');
                (window as any).whTooltips = { 'colorLinks': true, 'iconizeLinks': true, 'renameLinks': false, 'iconSize': 'small' };
                scriptTag.src = "https://wow.zamimg.com/js/tooltips.js"
                document.head.appendChild(scriptTag)
            })
        }

        return () => { effectRan.current = true };
    }, [])

    const timelineEnd = toSec(_testTimelineEnd);
    const timelineSecondFrames = Array(timelineEnd).fill(0).map((_, i) => i);

    const priorAndOverlapsNow = (now: number, start: number, duration: number) => start < now && (start + duration + 1) >= now;
    const orderConcurrentEvents = (rawEvents: { time: number }[], searchTime: number, searchIdx: number) => {
        return rawEvents
            .map((e, i) => ({ ...e, order: i }))
            .filter(otherEvt => otherEvt.time === searchTime)
            .findIndex(e => e.order === searchIdx);
    }

    const offsetBossAbilityEvents = useMemo(() => {
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

    const offsetPlayerAbilityEvents = useMemo(() => {
        const _rawEvents: PlayerAbilityEvent[] = _testRaidCDTimeline
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
    }, [_testRaidCDTimeline, FLAT_COOLDOWNS])

    const maxConcurrentBossAbilities = Math.max(...offsetBossAbilityEvents.map(obae => obae.offset)) + 1;
    const maxConcurrentPlayerAbilities = Math.max(...offsetPlayerAbilityEvents.map(obae => obae.offset)) + 1;
    const staticColumns = 2;
    const bossColOffset = staticColumns + 1;
    const playerColOffset = staticColumns + maxConcurrentBossAbilities + 1;

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
                return offsetBossAbilityEvents.find(obae => obae.time === time && obae.offset === col)
            })
            .map((bossAbility, col) => {
                if (!bossAbility) {
                    return null;
                }
                if (bossAbility.spellId) {
                    return (<div className={styles['timeline-ability']} style={{
                        gridRowStart: time + 1,
                        gridRowEnd: time + 1 + bossAbility.duration + 1,
                        gridColumn: col + bossColOffset
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
        return Array(maxConcurrentPlayerAbilities).fill(0)
            .map((_, col) => {
                return <div style={{ gridRowStart: time + 1, gridRowEnd: time + 1, gridColumn: col + playerColOffset }} ></div>
            })
    };
    const playerAbilitiesForFrame = (time: number) => {
        return Array(maxConcurrentPlayerAbilities).fill(0)
            .map((_, col) => {
                return offsetPlayerAbilityEvents.find(obae => obae.time === time && obae.offset === col)
            })
            .map((playerAbility, col) => {
                if (!playerAbility) {
                    return null;
                }
                return (<div className={styles['timeline-ability']} style={{
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
        if (!offsetBossAbilityEvents.find(obae => obae.time === time)) {
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
            const lastUse = offsetPlayerAbilityEvents.findLast(evt => evt.playerId === cd.playerId && evt.spellId === cd.spellId && evt.time <= time);
            if (!lastUse) {
                return true;
            }
            return lastUse.time + cd.cooldown <= time;
        })

        const icons = (available.map((cd) => (
            <a data-wh-icon-size="tiny"
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
            <header className={styles['header']}>
                <h1>Raid CD Planner</h1>
            </header>
            <main className={styles['main']}>
                <section className={styles.builder}>
                    <h3>Raid CD Reference Sheet</h3>
                    <div>
                        {validSpecs.map(c => (
                            <div key={c.display}>
                                <h4 style={{ color: CLASS_COLORS[c.class] }}>{c.display}</h4>
                                {cooldownsBySpec(c).map((cd) => (
                                    <div key={cd.spellId} >
                                        <a suppressHydrationWarning={true} href={`https://www.wowhead.com/spell=${cd.spellId}`}>{cd.ability} ({cooldownTimeDisplay(cd.cooldown)})</a>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </section>
                <section className={styles.builder}>
                    <h3>Roster</h3>
                    {roster.map((member, i) => (
                        <>
                            <div key={member.playerId}>
                                <input className={`${styles['player-text']} ${styles['player-name-editor']}`} style={{ color: CLASS_COLORS[member.class] }} defaultValue={member.name} />
                                <button onClick={() => {
                                    setRoster([...roster.slice(0, i), ...roster.slice(i + 1)])
                                }}>clear</button>
                            </div>
                            <div>
                                {cooldownsBySpec(member).map((cd) => (
                                    <a key={cd.spellId} suppressHydrationWarning={true} data-wh-icon-size="medium" href={`https://www.wowhead.com/spell=${cd.spellId}`}></a>
                                ))}
                            </div>
                        </>
                    ))}
                    <Select
                        value={undefined}
                        options={validSpecs}
                        clearable={false}
                        onChange={(s) => {
                            const defaultName = `${s!.display}`;
                            const currentCount = roster.filter(r => r.name.startsWith(defaultName)).length;
                            const suffix = currentCount === 0 ? 1 : currentCount + 1;

                            setRoster([...roster, { ...s!, name: `${defaultName} ${suffix}`, playerId: crypto.randomUUID() }])
                        }}
                        render={(s) => <div className={styles['class-text']} style={{ color: CLASS_COLORS[s.class] }}>{s.display}</div>}
                    />
                </section>
                <section className={styles.timeline}>
                    <h3>Timeline</h3>
                    <div className={styles['timeline-grid']}
                        style={{
                            gridTemplateColumns: `repeat(${maxConcurrentBossAbilities + maxConcurrentPlayerAbilities + staticColumns}, max-content)`
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
                            <div className={styles['timeline-grid-cell']}
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
                </section>
            </main>
        </>
    )
}
