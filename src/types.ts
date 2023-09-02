export type Class = 'Warrior' | 'Paladin' | 'Hunter' | 'Rogue' | 'Priest' | 'Shaman' | 'Mage' | 'Warlock' | 'Monk' | 'Druid' | 'Demon Hunter' | 'Death Knight' | 'Evoker';
export type Bosses = 'Rashok' | 'Magmorax';

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

export type BossAbilities = Record<Bosses, BossAbility[]>;

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

export type UserBossPlan = {
    boss: Bosses;
    rawPlannedAbilityUses: AbilityUses;
    plannedAbilityUses: AbilityUses;
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
    userBossPlan: Omit<UserBossPlan, 'rawPlannedAbilityUses'>;
}
