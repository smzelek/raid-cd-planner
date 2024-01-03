import React, { useEffect, useRef, useState, useMemo } from 'react'
import { CLASS_COLORS, CLASS_OFFSET_COLORS, Class, Cooldown, FLAT_COOLDOWNS, HealerSpecs, Roster, SpecOf, } from '../constants';
import { displaySec, rosterToHealerComp, formatLogTime, offsetEntries, offsetRaidCDRows, CooldownEvent, addRaidCDProperties, getHealersInRoster } from '../utils';
import { loadLogSearchData, loadCurrentRaidData, loadLogDetailsData } from '../hooks/api';
import RosterEditor from '../components/RosterEditor';
import { Encounter } from '../../types';
import { IMPORTANT_CURRENT_RAID_SPELLS } from '../../utils';
import { BossAbilityDamageEvents, LogSearchResponse, RaidCDUsage, ReportFightTimestamps } from '../../backend/services/wcl.service';
import * as d3 from 'd3';
import { Spell } from '../../backend/services/blizzard.service';
import { LogResponse } from '../../backend/services/raidtimers.service';
import { FightBreakdown, PlannedRaidCDs } from '../components/FightBreakdown';
import { PlanSelection } from './PlanSelection';
import { CreatePlan } from './CreatePlan';

export const PlanDashboard = () => {

    const { data } = loadCurrentRaidData();
    const [roster, setRoster] = useState<Roster>([]);
    const [bossId, setBossId] = useState<number | null>(2556);
    const [view, setView] = useState<'plan-selection' | 'create-plan'>('plan-selection')

    if (!data) {
        return null;
    }

    const selectedBoss = data.bosses.find(b => b.id === bossId)!;

    return (
        <section id="dashboard">
            {view === 'plan-selection' && <PlanSelection bosses={data.bosses} createPlanForBoss={(id) => {
                setBossId(id);
                setView('create-plan')
            }} />}
            {view === 'create-plan' && <CreatePlan boss={selectedBoss!} roster={roster} setRoster={setRoster} onBack={() => {
                setBossId(null);
                setView('plan-selection');
            }} />}
        </section>
    )
};
