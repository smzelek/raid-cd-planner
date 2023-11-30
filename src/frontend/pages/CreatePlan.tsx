import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
    BOSS_ABILITIES, BOSS_PHASES, FLAT_COOLDOWNS, cooldownsBySpec,
    BossTimelineData, PlayerTimelineData, UserPlayerPlan, BossPlan, SavedProfile, PlayerId, Cooldown, Class
} from '../constants';
import { toSec, offsetEntries, displaySec } from '../utils';
import CheatSheet from '../components/CheatSheet/CheatSheet';
import RaidPlanner from '../components/PlayerPlanner/PlayerPlanner';
import Timeline from '../components/Timeline/Timeline';
import BossPlanner from '../components/BossPlanner/BossPlanner';
import CopyButton from '../components/CopyButton/CopyButton';

export default function CreatePlan() {

    // load report
    // select fight
    
    return (
        <>
            <input placeholder='warcraftlogs.com/reports/...' />
            <button>Load Fights</button>
        </>
    )
}
