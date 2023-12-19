import React, { useEffect, useRef, useState, useMemo } from 'react'
import {
    BOSS_ABILITIES, BOSS_PHASES, FLAT_COOLDOWNS, cooldownsBySpec,
    BossTimelineData, PlayerTimelineData, UserPlayerPlan, BossPlan, SavedProfile, PlayerId, Cooldown, Class, RosterMember
} from '../constants';
import { toSec, offsetEntries, displaySec } from '../utils';
import CheatSheet from '../components/CheatSheet/CheatSheet';
import RaidPlanner from '../components/PlayerPlanner/PlayerPlanner';
import Timeline from '../components/Timeline/Timeline';
import BossPlanner from '../components/BossPlanner/BossPlanner';
import CopyButton from '../components/CopyButton/CopyButton';
import { loadCurrentRaidData } from '../hooks/api';
import Roster from '../components/Roster/Roster';
import { Encounter } from '../../types';
import { IMPORTANT_CURRENT_RAID_SPELL_IDS } from '../../utils';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'ion-icon': any;
        }
    }
}

export default function CreatePlan() {

    const { data } = loadCurrentRaidData()
    const [roster, setRoster] = useState<RosterMember[]>([]);
    const [bossId, setBossId] = useState<number | null>(null);

    // load report
    // select fight

    // Pick boss
    if (!data) {
        return null;
    }

    // 1. pick boss
    // 2. on boss page with abilities
    // 3. pick roster/load roster from string

    // once boss is clicked, show ability tray with the important ones highlighted
    // 


    return (
        <section id="dashboard">
            <div>
                <h2>Players</h2>
                <Roster roster={roster} setRoster={setRoster} />
                {/* {new Array(Math.ceil(Math.random() * 3)).fill(null).map(x =>
                <span className='existing'>
                    <ion-icon name="people-circle" style={{ fontSize: '28px', color: '#92f192' }}></ion-icon>
                    existing team
                </span>
            )}
            <ion-icon name="add-circle" style={{ fontSize: '28px', color: '#92f192' }}></ion-icon> */}

            </div>
            <div>
                {bossId
                    ? <BossDetail boss={data.bosses.find(b => b.id === bossId)!} />
                    : <BossSelection bosses={data.bosses} setBossId={setBossId} />}
            </div>
            {/* <input placeholder='warcraftlogs.com/reports/...' />
            <button>Load Fights</button> */}
        </section>
    )
}

const BossSelection = ({ bosses, setBossId }: { bosses: Encounter[], setBossId: (_: number) => void }): React.JSX.Element => {
    return (
        <>
            <h2>Bosses</h2>
            <div className='plan-selection'>
                {bosses.map(b =>
                    <div className='boss-row'>
                        <div>
                            <h4 onClick={() => setBossId(b.id)}>
                                {b.name}
                            </h4>
                        </div>
                        <div>
                            <ion-icon name="add-circle" style={{ fontSize: '28px', color: '#92f192' }}></ion-icon>
                        </div>
                        <div>
                            {new Array(Math.ceil(Math.random() * 3)).fill(null).map(x =>
                                <span className='existing'>
                                    <ion-icon name="document-text" style={{ fontSize: '36px', color: '#e3cca1' }}></ion-icon>
                                    existing note
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
};

const BossDetail = ({ boss }: { boss: Encounter }): React.JSX.Element => {

    useEffect(() => {
        console.log('?', (window as any)?.WH?.Tooltips);
        (window as any)?.WH?.Tooltips && (window as any).WH.Tooltips.refreshLinks();
    }, [boss])

    return (
        <>
            <h2>{boss.name}</h2>
            <div>
                {boss.phases.map(p =>
                    <div>
                        {boss.phases.length > 1 && (
                            <h4>{p.title}</h4>
                        )}
                        {p.spells.filter(s => IMPORTANT_CURRENT_RAID_SPELL_IDS.includes(s.id)).map(s =>
                            <a data-wh-icon-size="small" className='important-boss-abilility'
                                href={`https://www.wowhead.com/spell=${s.id}`}>
                            </a>
                        )}
                        {p.spells.filter(s => !IMPORTANT_CURRENT_RAID_SPELL_IDS.includes(s.id)).map(s =>
                            <a data-wh-icon-size="small"
                                href={`https://www.wowhead.com/spell=${s.id}`}>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}