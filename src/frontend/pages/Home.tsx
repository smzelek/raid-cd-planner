import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
    BOSS_ABILITIES, BOSS_PHASES, FLAT_COOLDOWNS, cooldownsBySpec,
    BossTimelineData, PlayerTimelineData, UserPlayerPlan, BossPlan, SavedProfile, PlayerId, Cooldown, Class
} from '../constants';
import { toSec, offsetEntries, displaySec } from '../utils';
import CheatSheet from '../components/CheatSheet';
import RaidPlanner from '../components/PlayerPlanner';
import Timeline from '../components/Timeline';
import BossPlanner from '../components/BossPlanner';
import CopyButton from '../components/CopyButton';
import { Link } from 'react-router-dom';

export default function Home() {

    return (
        <>
            Get started:
            <Link to="/create">Create Plan</Link>
            <button>Load Plan</button>
        </>
    )
}
