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

export default function Home() {

    return (
        <>
            Get started:
            <button>Create Plan</button>
            <button>Load Plan</button>
        </>
    )
}
