import React, { useEffect, useMemo, useState } from 'react'
import { Roster, RosterMember, } from '../constants';
import { displaySec, rosterToHealerComp, formatLogTime, addRaidCDProperties, getHealersInRoster, refreshTooltips } from '../utils';
import { loadLogSearchData, loadLogDetailsData } from '../hooks/api';
import RosterEditor from '../components/RosterEditor';
import { Encounter } from '../../types';
import { IMPORTANT_CURRENT_RAID_SPELLS } from '../../utils';
import { LogSearchResponse } from '../../backend/services/wcl.service';
import { FightBreakdown, PlannedPlayerRaidCDs, PlannedRaidCDs } from '../components/FightBreakdown';


export const CreatePlan = ({ boss, roster, setRoster }: { boss: Encounter, roster: Roster, setRoster: (r: Roster) => void; }): React.JSX.Element => {
    const { data: logSearchData, isLoading: isLoadingLogSearchData, isSuccess: loadedLogSearchData, mutateAsync: _loadLogSearchData } = loadLogSearchData()
    const { data: logDetailsData, isLoading: isLoadingLogDetailsData, isSuccess: loadedLogDetailsData, mutateAsync: _loadLogDetailsData } = loadLogDetailsData()

    const [rosterCDs, setRosterCDs] = useState<PlannedRaidCDs>();
    const [selectedLog, setSelectedLog] = useState<LogSearchResponse[number] | null>(null)
    const [view, setView] = useState<'search-logs' | 'analyze-log' | 'create-note'>('search-logs');
    const [chartScale, setChartScale] = useState(6);

    const logRaidCDs: PlannedRaidCDs = useMemo(() => {
        return getHealersInRoster(logDetailsData?.raidCDs ?? []).map(p => ({
            class: p.class,
            spec: p.spec,
            playerId: p.playerId,
            casts: addRaidCDProperties(p.casts)
        }));
    }, [logDetailsData?.raidCDs]);

    const logRoster: Roster = useMemo(() => {
        return getHealersInRoster(logDetailsData?.raidCDs ?? []).map((r): RosterMember => {
            return {
                class: r.class,
                spec: r.spec,
                playerId: r.playerId,
                name: r.name,
            }
        })
    }, [logDetailsData?.raidCDs]);

    return (
        <div id='create-plan'>
            <div className='left-pane'>
                <div className='search-logs-pane'>
                    <BossDetails boss={boss} />
                    <div id='healers-pane'>
                        <div className='healers-pane--body'>
                            <RosterEditor
                                entryMode={view === 'create-note' ? 'note' : 'edit'}
                                mode={view === 'create-note' ? 'split' : 'healers'}
                                roster={roster}
                                disabled={isLoadingLogDetailsData || view === 'analyze-log'}
                                setRoster={setRoster}
                                chartScale={chartScale}
                            />
                            {view === 'search-logs' && !isLoadingLogDetailsData && (
                                <button
                                    className={`primary-btn healers-pane--action ${isLoadingLogSearchData ? 'loading' : ''}`}
                                    onClick={() => {
                                        if (isLoadingLogSearchData) {
                                            return;
                                        }

                                        _loadLogSearchData({
                                            healerComp: rosterToHealerComp(roster),
                                            encounterId: boss.wclId,
                                        })
                                    }}
                                >
                                    Load Top Logs
                                </button>
                            )}
                            {view === 'analyze-log' && loadedLogDetailsData && (
                                <button
                                    className={`primary-btn healers-pane--action`}
                                    onClick={() => {
                                        let healers = getHealersInRoster(roster);
                                        const existingHealerCds = getHealersInRoster(logDetailsData.raidCDs);

                                        const copiedCDs: PlannedRaidCDs = existingHealerCds.map((player): PlannedPlayerRaidCDs => {
                                            const casts = addRaidCDProperties(player.casts);
                                            const copyTo = healers.findIndex(h => h.class === player.class && h.spec === player.spec);
                                            const [target] = healers.splice(copyTo, 1);

                                            return {
                                                ...player,
                                                playerId: target.playerId,
                                                casts,
                                            }
                                        });

                                        setRosterCDs(copiedCDs);
                                        setView('create-note');
                                    }}
                                >
                                    Copy Note
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {(loadedLogSearchData && view === 'search-logs') && (
                <div id='logs-pane'>
                    <div className='logs-pane--title'>
                        <h3>Logs</h3>
                        <div className='info'>
                            <ion-icon name="information-circle" />
                            <span>
                                If your guild has mixed dps performance, pick a longer log.
                            </span>
                        </div>
                    </div>
                    <div className='wcl-logs--list'>
                        <h5 className='wcl-logs--title'>Date</h5>
                        <h5 className='wcl-logs--title'>Time</h5>
                        <h5 className='wcl-logs--title'>Gear</h5>
                        <h5 className='wcl-logs--title'>Roster</h5>
                        <h5 className='wcl-logs--title'>Guild</h5>
                        <h5></h5>
                        {logSearchData.map(log =>
                            <div key={log.url} className='wcl-logs--option'>
                                <div className='wcl-option-card wcl-option-card--left'>
                                    <WclLogLink log={log} />
                                </div>
                                <div className='wcl-option-card'>
                                    <WclLogTime log={log} />
                                </div>
                                <div className='wcl-option-card'>
                                    <WclLogIlvl log={log} />
                                </div>
                                <div className='wcl-option-card'>
                                    <WclLogRoster log={log} />
                                </div>
                                <div className='wcl-option-card'>
                                    <WclLogGuild log={log} />
                                </div>
                                <div className='wcl-option-card wcl-option-card--right'>
                                    {(!selectedLog || (selectedLog.fightID === log.fightID && selectedLog.reportID === log.reportID)) && (
                                        <button
                                            className={`primary-btn ${isLoadingLogDetailsData ? 'loading' : ''}`}
                                            onClick={() => {
                                                if (isLoadingLogDetailsData) {
                                                    return;
                                                }
                                                setSelectedLog(log);

                                                _loadLogDetailsData({
                                                    reportId: log.reportID,
                                                    fightId: log.fightID,
                                                    encounterId: boss.wclId
                                                }).then(() => {
                                                    setView('analyze-log');
                                                })
                                            }}>
                                            Analyze
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {(loadedLogDetailsData && view === 'analyze-log') && (
                <div id="fight-breakdown-pane">
                    <div className='fight-breakdown-pane--title'>
                        <div className='wcl-option-card wcl-option-card--left wcl-option-card--right'>
                            <WclLogLink log={selectedLog!} />
                            <WclLogTime log={selectedLog!} />
                            <WclLogIlvl log={selectedLog!} />
                            <WclLogRoster log={selectedLog!} />
                            <WclLogGuild log={selectedLog!} />
                            <span className='remove-btn'>
                                <ion-icon name="close" />
                            </span>
                        </div>
                    </div>
                    <FightBreakdown
                        chartScale={chartScale}
                        setChartScale={setChartScale}
                        boss={boss}
                        roster={logRoster}
                        raidCDs={logRaidCDs}
                        setRaidCDs={() => { }}
                        timestamps={logDetailsData.timestamps}
                        bossDamage={logDetailsData.bossEvents}
                    />
                </div>
            )}
            {(loadedLogDetailsData && rosterCDs && view === 'create-note') && (
                <div id="fight-breakdown-pane">
                    <div className='fight-breakdown-pane--title'>
                        <h3>New Note</h3>
                    </div>
                    <FightBreakdown
                        chartScale={chartScale}
                        setChartScale={setChartScale}
                        boss={boss}
                        roster={roster}
                        raidCDs={rosterCDs}
                        setRaidCDs={setRosterCDs}
                        timestamps={logDetailsData.timestamps}
                        bossDamage={logDetailsData.bossEvents}
                    />
                </div>
            )}
        </div >
    );
};

const BossDetails = ({ boss }: { boss: Encounter, }) => {
    useEffect(() => {
        refreshTooltips();
    }, [boss])

    return (
        <div id='boss-pane'>
            <h3 className='boss-pane--title'>
                {boss.name}
                <span className='remove-btn'>
                    <ion-icon name="close" />
                </span>
            </h3>
            <div className='boss-pane--body'>
                <div className='boss-pane--phases'>
                    {boss.phases.map(p =>
                        <div key={p.title} className='boss-pane--phase'>
                            {boss.phases.length > 1 && (
                                <h5 className='boss-pane--phase-title'>{p.title}</h5>
                            )}
                            <div className='boss-pane--spells'>
                                <div className='major-boss-abilities'>
                                    {p.spells.filter(s => IMPORTANT_CURRENT_RAID_SPELLS[boss.wclId].includes(s.ability)).map(s =>
                                        <a key={s.spellId} data-wh-icon-size="small" className='boss-pane--spell'
                                            href={`https://www.wowhead.com/spell=${s.spellId}`}>
                                        </a>
                                    )}
                                </div>
                                <div className='minor-boss-abilities'>
                                    {p.spells.filter(s => !IMPORTANT_CURRENT_RAID_SPELLS[boss.wclId].includes(s.ability)).map(s =>
                                        <a key={s.spellId} data-wh-icon-size="small" className='boss-pane--spell'
                                            href={`https://www.wowhead.com/spell=${s.spellId}`}>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const WclLogLink = ({ log }: { log: LogSearchResponse[number] }) => {
    return <a className='wcl-logs--link' href={log.url}>
        {formatLogTime(log.startTime)}
    </a>;
};

const WclLogTime = ({ log }: { log: LogSearchResponse[number] }) => {
    return <span className='wcl-logs--time'>
        {displaySec(log.duration, false)}
    </span>;
};

const WclLogIlvl = ({ log }: { log: LogSearchResponse[number] }) => {
    return <span className='wcl-logs--ilvl'>
        {Math.floor(log.itemLevel)} ilvl
    </span>;
};

const WclLogRoster = ({ log }: { log: LogSearchResponse[number] }) => {
    return <span className='roles'>
        <span className='role-count'>
            {log.tanks}<img className='role-icon' src="/tank.svg" />
        </span>
        <span className='role-count'>
            {log.healers}<img className='role-icon' src="/healer.svg" />
        </span>
        <span className='role-count'>
            {log.melee}<img className='role-icon' src="/mdps.svg" />
        </span>
        <span className='role-count'>
            {log.ranged}<img className='role-icon' src="/rdps.svg" />
        </span>
    </span>
};

const WclLogGuild = ({ log }: { log: LogSearchResponse[number] }) => {
    return <span>
        &lt;{log.guildName}&gt; ({log.serverName})
    </span>
};
