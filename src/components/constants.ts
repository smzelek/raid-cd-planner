import { Class, SpecChoices, SpecMatchesClass, Cooldown, Cooldowns, BossAbility, BossTimelineInput } from "./types";

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
    'Paladin': '#FFFFFF',
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

export const cooldownsBySpec = (s: SpecMatchesClass) => {
    return (COOLDOWNS[s.class] as Cooldown<Class>[]).filter((cd) => cd.spec === "ALL" || cd.spec === s.spec)
}

export const _testAbilities: BossAbility[] = [
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
        duration: 19
    }
]

export const _testTimelineEnd = '6:20';
export const _testBossTimeline: BossTimelineInput = [
    {
        ability: 'Charged Smash',
        times: ['0:27', '1:12', '2:40', '3:26', '4:53', '5:39']
    },
    {
        ability: 'Shadowflame Energy',
        times: ['0:22', '1:08', '1:41', '2:37', '3:23', '3:56', '4:50', '5:36', '6:09']
    },
    {
        ability: 'Intermission',
        times: ['1:52', '4:05']
    },
    {
        ability: 'Searing Slam',
        times: ['5:28', '6:01']
    },
];


