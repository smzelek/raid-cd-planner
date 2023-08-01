export type Class = 'Warrior' | 'Paladin' | 'Hunter' | 'Rogue' | 'Priest' | 'Shaman' | 'Mage' | 'Warlock' | 'Monk' | 'Druid' | 'Demon Hunter' | 'Death Knight' | 'Evoker';

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

export type Cooldown<T extends Class> = {
    ability: string;
    spec: SpecOf<T>;
    cooldown: number;
    duration: number;
    spellId: number;
};

export type Cooldowns = {
    [T in Class]: Cooldown<T>[];
};


type SpecClassMapper<T extends Class> = T extends Class ? { [key in T]: { spec: SpecOf<T> } }[T] & { class: T } : never;
export type SpecMatchesClass = SpecClassMapper<Class>;
export type SpecChoices = SpecMatchesClass & {
    display: string;
};
export type RosterMember = SpecMatchesClass & {
    name: string;
    playerId: string;
};
export type BossAbility = {
    ability: string;
    spellId: number | null;
    duration: number;
};
export type BossAbilityEvent = {
    ability: string;
    spellId: number | null;
    duration: number;
    time: number;
};
export type PlayerAbilityEvent = {
    ability: string;
    cooldown: number;
    playerId: string;
    name: string;
    class: Class;
    spellId: number;
    duration: number;
    time: number;
};
export type PlayerTimeline = (PlayerAbilityEvent & { offset: number })[];
export type BossTimeline = (BossAbilityEvent & { offset: number })[];
export type BossTimelineInput = {
    ability: string;
    times: string[];
}[];
export type PlayerTimelineInput = {
    ability: string;
    cooldownOverride?: number;
    durationOverride?: number;
    playerId: string;
    times: string[];
}[];
