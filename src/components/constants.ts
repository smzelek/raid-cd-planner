import { Class, SpecChoices, SpecMatchesClass, Cooldown, RosterMember, Cooldowns, BossAbility, BossTimelineInput, PlayerTimelineInput } from "./types";

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
    'Monk': '#FFFFFF',
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

// ~~~~~~~~~~

export const _testRoster: RosterMember[] = [
    { name: 'Niinetails', class: 'Paladin', spec: 'Holy', playerId: 'f62d6469-e926-4ea4-8ed2-5deccec2b02d' },
    { name: 'Ferdaherde', class: 'Warrior', spec: 'Protection', playerId: 'd8b706cc-9a3c-4990-b6c2-135487c47d37' },
    { name: 'Moonmoose', class: 'Druid', spec: 'Restoration', playerId: 'cbd4d44e-024a-4a93-9c81-c85cffbcda1d' },
    { name: 'Lysdexic', class: 'Priest', spec: 'Discipline', playerId: 'e7041e2c-f545-4526-8087-d462cd2c6865' },
    { name: 'Orkwa', class: 'Shaman', spec: 'Restoration', playerId: '42a7973a-322d-4117-87ff-d02c072b6b12' },
    { name: 'Meepeadeep', class: 'Demon Hunter', spec: 'Havoc', playerId: '1da84713-edf7-47a2-9453-3414def8b420' },
    { name: 'Willywankers', class: 'Death Knight', spec: 'Unholy', playerId: '78515ff0-1f06-450e-8e04-ff7fd931edca' },
    { name: 'Tjdkk', class: 'Death Knight', spec: 'Unholy', playerId: '06046982-be38-4251-9dee-7b242d935e7a' },
];

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
        duration: 20
    }
]

export const _testTimelineEnd = '6:20';
export const _testBossTimeline: BossTimelineInput = [
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

export const _testRaidCDTimeline: PlayerTimelineInput = [
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

