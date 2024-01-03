export type Class = 'Warrior' | 'Paladin' | 'Hunter' | 'Rogue' | 'Priest' | 'Shaman' | 'Mage' | 'Warlock' | 'Monk' | 'Druid' | 'Demon Hunter' | 'Death Knight' | 'Evoker';
export type Bosses = 'Rashok' | 'Magmorax' | 'Echo of Neltharion';
export const ClassList = ['Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest', 'Shaman', 'Mage', 'Warlock', 'Monk', 'Druid', 'Demon Hunter', 'Death Knight', 'Evoker'];

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

export type ClassIds<C extends Class> = {
    classId: number;
    specIds: Record<SpecOf<C>, number>;
};

export type Ids = {
    [T in Class]: ClassIds<T>;
};

export const WCLClassIds: Ids = {
    'Death Knight': {
        classId: 1,
        specIds: {
            'Blood': 1,
            'Frost': 2,
            'Unholy': 3,
        }
    },
    'Druid': {
        classId: 2,
        specIds: {
            'Balance': 1,
            'Feral': 2,
            'Guardian': 3,
            'Restoration': 4
        }
    },
    'Hunter': {
        classId: 3,
        specIds: {
            'Beast Mastery': 1,
            'Marksmanship': 2,
            'Survival': 3,
        }
    },
    'Mage': {
        classId: 4,
        specIds: {
            'Arcane': 1,
            'Fire': 2,
            'Frost': 3,
        }
    },
    'Monk': {
        classId: 5,
        specIds: {
            'Brewmaster': 1,
            'Mistweaver': 2,
            'Windwalker': 3,
        }
    },
    'Paladin': {
        classId: 6,
        specIds: {
            'Holy': 1,
            'Protection': 2,
            'Retribution': 3,
        }
    },
    'Priest': {
        classId: 7,
        specIds: {
            'Discipline': 1,
            'Holy': 2,
            'Shadow': 3,
        }
    },
    'Rogue': {
        classId: 8,
        specIds: {
            'Assassination': 1,
            'Subtlety': 3,
            'Outlaw': 4,
        }
    },
    'Shaman': {
        classId: 9,
        specIds: {
            'Elemental': 1,
            'Enhancement': 2,
            'Restoration': 3,
        }
    },
    'Warlock': {
        classId: 10,
        specIds: {
            'Affliction': 1,
            'Demonology': 2,
            'Destruction': 3
        }
    },
    'Warrior': {
        classId: 11,
        specIds: {
            'Arms': 1,
            'Fury': 2,
            'Protection': 3,
        }
    },
    'Demon Hunter': {
        classId: 12,
        specIds: {
            'Havoc': 1,
            'Vengeance': 2
        }
    },
    'Evoker': {
        classId: 13,
        specIds: {
            'Devastation': 1,
            'Preservation': 2,
            'Augmentation': 3
        }
    },
};

export type SpecOf<C extends Class> = _SPECS[C][number];
type SpecOfClassOrAnySpec<C extends Class> = _SPECS[C][number] | 'ALL';

export type Spec = SpecOf<Class>;

export type Cooldown<T extends Class> = {
    ability: string;
    spec: SpecOfClassOrAnySpec<T>;
    cooldown: number;
    duration: number;
    spellId: number;
    category?: "UTIL";
};

export type Cooldowns = {
    [T in Class]: Cooldown<T>[];
};

export type BossAbilities = Record<Bosses, readonly BossAbility[]>;

type SpecClassMapper<T extends Class> = T extends Class ? { [key in T]: { spec: SpecOfClassOrAnySpec<T> } }[T] & { class: T } : never;
export type SpecMatchesClass = SpecClassMapper<Class>;
export type SpecChoices = {
    class: Class;
    spec: Spec;
    display: string;
};

export type RosterMember = {
    class: Class;
    spec: Spec;
    name: string;
    playerId: string;
    cdOverrides: Record<number, number>;
    cdTracking: Record<number, boolean>;
};
export type Roster = RosterMember[];
export type BossAbility = {
    ability: string;
    spellId: number;
    duration: number;
};

export const BOSSES: Bosses[] = ['Rashok', 'Magmorax', 'Echo of Neltharion'];

const LITERAL_BOSS_ABILITIES = {
    'Rashok': [
        {
            ability: 'Charged Smash',
            spellId: 400777,
            duration: 0,
        },
        {
            ability: 'Conduit Flare',
            spellId: 405828,
            duration: 5,
        },
        {
            ability: 'Overcharged',
            spellId: 405827,
            duration: 5,
        },
        {
            ability: 'Scorched Flesh',
            spellId: 408204,
            duration: 0,
        },
        {
            ability: 'Scorching Heatwave',
            spellId: 404445,
            duration: 19,
        },
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
            ability: 'Shattered Conduit',
            spellId: 410690,
            duration: 0,
        },
        {
            ability: 'Smoldering Rage',
            spellId: 406165,
            duration: 0,
        },
    ],
    'Magmorax': [
        {
            ability: 'Explosive Magma',
            spellId: 411182,
            duration: 6,
        },
        {
            ability: 'Igniting Roar',
            spellId: 403740,
            duration: 1,
        },
        {
            ability: 'Lava Ejection',
            spellId: 413351,
            duration: 2,
        },
        {
            ability: 'Molten Spittle',
            spellId: 402989,
            duration: 6,
        },
        {
            ability: 'Overpowering Stomp',
            spellId: 403671,
            duration: 1,
        },
        {
            ability: 'Soak Magma Puddle',
            spellId: 403103,
            duration: 3,
        },
    ],
    'Echo of Neltharion': [
        {
            ability: 'Calamitous Strike',
            spellId: 401022,
            duration: 0,
        },
        {
            ability: 'Ebon Destruction',
            spellId: 407917,
            duration: 0,
        },
        {
            ability: 'Echoing Fissure',
            spellId: 402115,
            duration: 0,
        },
        {
            ability: 'Rushing Darkness',
            spellId: 407221,
            duration: 0,
        },
        {
            ability: 'Shadow Strike',
            spellId: 407856,
            duration: 0,
        },
        {
            ability: 'Shatter',
            spellId: 401825,
            duration: 15,
        },
        {
            ability: 'Surrender to Corruption',
            spellId: 403057,
            duration: 10,
        },
        {
            ability: 'Corrupt Players',
            spellId: 0,
            duration: 5,
        },
        {
            ability: 'Umbral Annihilation',
            spellId: 404068,
            duration: 0,
        },
        {
            ability: 'Volcanic Heart',
            spellId: 410953,
            duration: 7,
        },
    ],
} as const;
// Use `as const` to extract literal types from the object; use the following rule to constrain the type of the object.
const _ensure_boss_abilities_structure: Record<Bosses, readonly BossAbility[]> = LITERAL_BOSS_ABILITIES;
export const BOSS_ABILITIES = _ensure_boss_abilities_structure;


export type BossPhases = {
    [T in Bosses]: {
        enrage: string | null;
        phases: {
            [phase: string]: {
                start: string;
                abilities: Partial<{ [ability in typeof LITERAL_BOSS_ABILITIES[T][number]['ability']]: string }>
            };
        }
    }
}
export const BOSS_PHASES: BossPhases = {
    'Rashok': {
        enrage: '6:20',
        phases: {
            'ALL': {
                start: '0:00',
                abilities: {
                    'Charged Smash': '0:27 1:12 2:40 3:26 4:53 5:39',
                    'Shadowflame Energy': '0:22 1:08 1:41 2:37 3:23 3:56 4:50 5:36 6:09',
                    'Scorching Heatwave': '1:52 4:05',
                    'Searing Slam': '5:28 6:01',
                }
            },
        }
    },
    'Magmorax': {
        enrage: '5:30',
        phases: {
            'ALL': {
                start: '0:00',
                abilities: {
                    'Molten Spittle': '0:15 0:55 1:22 2:02 2:29 3:09 3:35 4:15 4:42 5:22',
                    'Explosive Magma': '0:15 0:55 1:22 2:02 2:29 3:09 3:35 4:15 4:42 5:22',
                    'Soak Magma Puddle': '0:21 1:01 1:28 2:08 2:35 3:15 3:41 4:21 4:48 5:28',
                    'Igniting Roar': '0:08 0:49 1:14 1:56 2:21 3:03 3:28 4:09 4:34 5:16',
                    'Lava Ejection': '0:13 0:54 1:19 2:01 2:26 3:08 3:33 4:14 4:39 5:21',
                    'Overpowering Stomp': '0:47 1:54 3:00 4:07 5:14',
                }
            }
        }
    },
    'Echo of Neltharion': {
        enrage: null,
        phases: {
            'P1: The Earth Warder': {
                start: '0:00',
                abilities: {
                    'Calamitous Strike': '0:27 1:03 1:40 2:17',
                    'Echoing Fissure': '0:39 1:15 1:52 2:29',
                    'Rushing Darkness': '0:15 0:52 1:29 2:06 2:43',
                    'Shatter': '0:15 0:27 0:52 1:03 1:29 1:40 2:06',
                    'Volcanic Heart': '0:15 0:52 1:29 2:06',
                }
            },
            'P2: Corruption Takes Hold': {
                start: '2:46',
                abilities: {
                    'Rushing Darkness': '0:40 1:10 1:40 2:10',
                    'Shadow Strike': '0:25 0:55 1:25 1:55 2:25',
                    'Shatter': '0:55 1:25 1:55',
                    'Surrender to Corruption': '0:15',
                    'Umbral Annihilation': '0:33 1:03 1:33 2:03 2:33',
                    'Volcanic Heart': '0:26 0:42 0:59 1:16 1:33 2:09 2:24',
                    'Corrupt Players': '0:18 0:58 1:38'
                }
            },
            'P3: Reality Fractures': {
                start: '5:04',
                abilities: {
                    'Calamitous Strike': '0:38 1:08 1:38 2:07',
                    'Ebon Destruction': '0:48 1:18 1:48 2:18',
                    'Rushing Darkness': '0:32 1:02 1:32 2:02',
                }
            },
        },
    }
};

export const COOLDOWNS: Cooldowns = {
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
            ability: 'Rapture',
            spec: 'Discipline',
            cooldown: 90,
            duration: 8,
            spellId: 47536
        },
        {
            ability: 'Evangelism',
            spec: 'Discipline',
            cooldown: 90,
            duration: 6,
            spellId: 246287,
        },
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
            duration: 12,
            spellId: 265202,
        },
        {
            ability: 'Symbol of Hope',
            spec: 'Holy',
            cooldown: 180,
            duration: 4,
            spellId: 64901,
            category: 'UTIL'
        }
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
        {
            ability: 'Ancestral Guidance',
            spec: 'Restoration',
            cooldown: 120,
            duration: 10,
            spellId: 108281,
        },
        {
            ability: 'Wind Rush Totem',
            spec: 'Restoration',
            cooldown: 120,
            duration: 5,
            spellId: 192077,
            category: 'UTIL'
        }
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
        {
            ability: 'Stampeding Roar',
            spec: 'ALL',
            cooldown: 120,
            duration: 8,
            spellId: 77761,
            category: 'UTIL'
        },
        {
            ability: 'Innervate',
            spec: 'ALL',
            cooldown: 180,
            duration: 8,
            spellId: 29166,
            category: 'UTIL'
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
            ability: 'Zephyr',
            spec: 'ALL',
            cooldown: 120,
            duration: 8,
            spellId: 374227,
        },
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

export const FLAT_COOLDOWNS = Object.values(COOLDOWNS).flat(1);

export const CLASS_COLORS: Record<Class, string> = {
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

export const CLASS_OFFSET_COLORS: Record<Class, string> = {
    'Warrior': '#FFFFFF',
    'Paladin': '#000000',
    'Hunter': '#FFFFFF',
    'Rogue': '#FFFFFF',
    'Priest': '#000000',
    'Shaman': '#FFFFFF',
    'Mage': '#FFFFFF',
    'Warlock': '#FFFFFF',
    'Monk': '#000000',
    'Druid': '#FFFFFF',
    'Demon Hunter': '#FFFFFF',
    'Death Knight': '#FFFFFF',
    'Evoker': '#FFFFFF',
};

export const SPECS_WITH_CDS = Object.entries(COOLDOWNS)
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


export const HealerSpecs = [
    { class: 'Paladin', spec: 'Holy' },
    { class: 'Priest', spec: 'Discipline' },
    { class: 'Priest', spec: 'Holy' },
    { class: 'Shaman', spec: 'Restoration' },
    { class: 'Monk', spec: 'Mistweaver' },
    { class: 'Druid', spec: 'Restoration' },
    { class: 'Evoker', spec: 'Preservation' }
].map(s => ({ ...s, display: `${s.spec} ${s.class}` })) as SpecChoices[];

export const NonHealerSpecs = SPECS_WITH_CDS.filter(s => {
    return !HealerSpecs.some(hs => hs.class === s.class && hs.spec === s.spec);
});

export const cooldownsBySpec = (s: SpecMatchesClass) => {
    return (COOLDOWNS[s.class] as Cooldown<Class>[]).filter((cd) => cd.spec === "ALL" || cd.spec === s.spec)
}

export type PhasedAbilities = Record<string, {
    start: string;
    abilities: Record<AbilityName, string>;
}>;
export type BossPlan = {
    boss: Bosses;
    timeline: {
        enrage: string | null;
        phases: PhasedAbilities;
    };
};
export type BossTimelineData = {
    boss: Bosses;
    timeline: {
        ability: string;
        spellId: number | null;
        duration: number;
        time: number;
        offset: number;
    }[];
    events: {
        name: string;
        time: number;
    }[];
};

export type UserPlayerPlan = {
    roster: RosterMember[];
    rawPlannedAbilityUses: PlannedPlayerAbilityUses;
    plannedAbilityUses: PlannedPlayerAbilityUses;
    abilityCooldownOverrides: AbilityCooldownOverrides;
    abilityDurationOverrides: AbilityDurationOverrides;
};
export type PlayerTimelineData = {
    rosterCDPool: ({ playerId: PlayerId; } & Cooldown<Class>)[];
    abilityCooldownOverrides: AbilityCooldownOverrides;
    abilityDurationOverrides: AbilityDurationOverrides;
    timeline: {
        ability: string;
        cooldown: number;
        playerId: string;
        name: string;
        class: Class;
        spellId: number;
        duration: number;
        time: number;
        offset: number;
    }[];
};

export type PlayerId = string;
export type AbilityName = string;
export type AbilityUses = Record<AbilityName, string>;
export type PlannedPlayerAbilityUses = Record<PlayerId, AbilityUses>;
export type AbilityCooldownOverrides = Record<PlayerId, Record<AbilityName, string>>;
export type AbilityDurationOverrides = Record<PlayerId, Record<AbilityName, string>>;
export type RaidCDErrors = Record<PlayerId, Record<AbilityName, string>>;

export type SavedProfile = {
    userPlayerPlan: Omit<UserPlayerPlan, 'rawPlannedAbilityUses'>
    userBossPlan: Omit<BossPlan, 'rawPlannedAbilityUses'>;
}
