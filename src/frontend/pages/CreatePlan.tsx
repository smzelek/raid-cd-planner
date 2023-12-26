import React, { useEffect, useRef, useState, useMemo } from 'react'
import { CLASS_COLORS, CLASS_OFFSET_COLORS, Class, Cooldown, FLAT_COOLDOWNS, HealerSpecs, Roster, SpecOf, } from '../constants';
import { displaySec, rosterToHealerComp, formatLogTime, offsetEntries, toGraphable, CooldownEvent } from '../utils';
import { loadLogSearchData, loadCurrentRaidData, loadLogDetailsData } from '../hooks/api';
import RosterEditor from '../components/RosterEditor/RosterEditor';
import { Encounter } from '../../types';
import { IMPORTANT_CURRENT_RAID_SPELLS } from '../../utils';
import { BossAbilityDamageEvents, LogSearchResponse, RaidCDUsage, ReportFightTimestamps } from '../../backend/services/wcl.service';
import * as d3 from 'd3';
import { Spell } from '../../backend/services/blizzard.service';
import { LogResponse } from '../../backend/services/raidtimers.service';

const MARGIN_TOP = 20;
const COLORS = d3.schemeCategory10;
const PRECISION = 4;

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'ion-icon': any;
        }
    }
}

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
            {view === 'create-plan' && <CreatePlan boss={selectedBoss!} roster={roster} setRoster={setRoster} />}
        </section>
    )
};

const PlanSelection = ({ bosses, createPlanForBoss }: { bosses: Encounter[], createPlanForBoss: (_: number) => void }): React.JSX.Element => {
    return (
        <>
            <h2>Bosses</h2>
            <div className='plan-selection'>
                {bosses.map(b =>
                    <div className='boss-row'>
                        <div>
                            <h4>
                                {b.name}
                            </h4>
                        </div>
                        <div>
                            <ion-icon onClick={() => createPlanForBoss(b.id)} name="add-circle" style={{ fontSize: '28px', color: '#92f192' }}></ion-icon>
                        </div>
                        {/* <div>
                            {new Array(Math.ceil(Math.random() * 3)).fill(null).map(x =>
                                <span className='existing'>
                                    <ion-icon name="document-text" style={{ fontSize: '36px', color: '#e3cca1' }}></ion-icon>
                                    existing note
                                </span>
                            )}
                        </div> */}
                    </div>
                )}
            </div>
        </>
    )
};

const CreatePlan = ({ boss, roster, setRoster }: { boss: Encounter, roster: Roster, setRoster: (r: Roster) => void; }): React.JSX.Element => {
    const { data: logSearchData, isLoading: isLoadingLogSearchData, isSuccess: loadedLogSearchData, mutateAsync: _loadLogSearchData } = loadLogSearchData()
    const { data: logDetailsData, isLoading: isLoadingLogDetailsData, isSuccess: loadedLogDetailsData, mutateAsync: _loadLogDetailsData } = loadLogDetailsData()

    const [selectedLog, setSelectedLog] = useState<LogSearchResponse[number] | null>(null)
    const [view, setView] = useState<'search-logs' | 'analyze-log'>('search-logs')

    return (
        <div id='create-plan'>
            <div className='left-pane'>
                <div className='search-logs-pane'>
                    <BossDetails boss={boss} />
                    <div id='healers-pane'>
                        <h3 className='healers-pane--title'>Healers</h3>
                        <div className='healers-pane--body'>
                            <RosterEditor roster={roster} disabled={view !== 'search-logs'} setRoster={setRoster} />
                            {view === 'search-logs' && (
                                <button
                                    className={`primary-btn load-logs-btn ${isLoadingLogSearchData ? 'loading' : ''}`}
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
                        </div>
                    </div>
                </div>
            </div>
            {(loadedLogSearchData && view === 'search-logs') && (
                <div id='logs-pane'>
                    <div className='logs-pane--title'>
                        <h3>Logs</h3>
                        <div className='info'>
                            <ion-icon name="information-circle"></ion-icon>
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
                            <div className='wcl-logs--option'>
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
            {(loadedLogDetailsData && view === 'analyze-log') && <LogDetails boss={boss} log={selectedLog!} logDetails={logDetailsData} />}
        </div >
    );
};

const BossDetails = ({ boss }: { boss: Encounter, }) => {
    useEffect(() => {
        (window as any)?.WH?.Tooltips && (window as any).WH.Tooltips.refreshLinks();
    }, [boss])

    return (
        <div id='boss-pane'>
            <h3 className='boss-pane--title'>
                {boss.name}
                <span className='remove-btn'>
                    <ion-icon name="close"></ion-icon>
                </span>
            </h3>
            <div className='boss-pane--body'>
                <div className='boss-pane--phases'>
                    {boss.phases.map(p =>
                        <div className='boss-pane--phase'>
                            {boss.phases.length > 1 && (
                                <h5>{p.title}</h5>
                            )}
                            <div className='boss-pane--spells'>
                                <div className='major-boss-abilities'>
                                    {p.spells.filter(s => IMPORTANT_CURRENT_RAID_SPELLS[boss.wclId].includes(s.ability)).map(s =>
                                        <a data-wh-icon-size="small" className='boss-pane--spell'
                                            href={`https://www.wowhead.com/spell=${s.spellId}`}>
                                        </a>
                                    )}
                                </div>
                                <div className='minor-boss-abilities'>
                                    {p.spells.filter(s => !IMPORTANT_CURRENT_RAID_SPELLS[boss.wclId].includes(s.ability)).map(s =>
                                        <a data-wh-icon-size="small" className='boss-pane--spell'
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

type GridData = {
    data: {
        name: string;
        class: Class;
        spec: SpecOf<Class>;
        casts: CooldownEvent[];
    }[];
    fightSec: number;
}
const LogDetails = ({ boss, log, logDetails }: { boss: Encounter, log: LogSearchResponse[number], logDetails: LogResponse }) => {
    const fightSec = Math.ceil(logDetails.timestamps.endTime - logDetails.timestamps.startTime);
    const [tooltipLineX, setTooltipLineX] = useState<number | null>(null);
    const [chartMode, setChartMode] = useState<'line' | 'stacked'>('line');
    const [chartScale, setChartScale] = useState(6);

    // Compress to X second precision
    const smoothSeries = (series: number[]): number[] => {
        const newSeries = new Array(fightSec).fill(0);
        for (let i = PRECISION - 1; i <= newSeries.length - PRECISION; i += PRECISION) {
            const lookbacks = new Array(PRECISION).fill(0).map((_, x) => -x);
            const sum = lookbacks.map(x => series[i + x]).reduce((acc, cur) => acc + cur, 0);
            lookbacks.forEach(x => {
                newSeries[i + x] = sum;
            });
        }
        for (let i = 1; i < newSeries.length - 2; i++) {
            if (newSeries[i] === 0 && (newSeries[i - 1] > 0 || newSeries[i + 1] > 0)) {
                newSeries[i] = 1;
                i++;
            }
        }
        return newSeries;
    };

    const chartData: ChartData = useMemo(() => {
        // 1 second precision
        // Get all abilities that were found in the data
        const abilities = [...new Set(logDetails.bossEvents.map(e => e.ability))];

        // Compute dmg each ability did in each second of the fight
        const dtpsSeriesMap = abilities.reduce((acc, cur) => {
            acc[cur] = new Array(fightSec).fill(0);
            return acc;
        }, {} as Record<string, number[]>);

        logDetails.bossEvents.forEach(e => {
            dtpsSeriesMap[e.ability][e.timestamp] += e.damage;
        });

        abilities.forEach(ability => {
            dtpsSeriesMap[ability] = smoothSeries(dtpsSeriesMap[ability]);
        });

        const highestDamagePeak = Math.max(
            ...Object.values(dtpsSeriesMap).reduce((acc, cur) => {
                return acc.map((a, i) => a + cur[i]);
            }, new Array(fightSec).fill(0) as number[])
        );

        const data = Object
            .entries(dtpsSeriesMap)
            .flatMap(([ability, dtpsSeries], i) => {
                return dtpsSeries.map((dmg, sec) => ({
                    ability: ability,
                    damage: dmg,
                    sec,
                }))
            });

        const abilitiesRankedByOccurrences = Object.entries(
            abilities.reduce((acc, cur) => {
                acc[cur] = data.filter(d => d.ability === cur && d.damage > 0).length;
                return acc;
            }, {} as Record<string, number>)
        )
            .sort(([_, occurrences1], [__, occurrences2]) => occurrences2 - occurrences1)
            .map(([ability, _]) => ability);

        const abilitiesRankedByTotal = Object.entries(
            abilities.reduce((acc, cur) => {
                acc[cur] = data.filter(d => d.ability === cur && d.damage > 0).reduce((acc, cur) => acc + cur.damage, 0);
                return acc;
            }, {} as Record<string, number>)
        )
            .sort(([_, dmg1], [__, dmg2]) => dmg2 - dmg1)
            .map(([ability, _]) => ability);

        const xTicks = new Array(Math.ceil(fightSec / 60) * 6).fill(0).map((_, i) => i * 10).slice(0, -1);

        return {
            data,
            colors: COLORS,
            fightSec: fightSec,
            xTicks,
            maxY: highestDamagePeak * 1.1,
            keysByCount: abilitiesRankedByOccurrences,
            keysByMax: abilitiesRankedByTotal,
            width: (chartScale * fightSec),
            height: 300,
            margin: {
                top: MARGIN_TOP,
                right: 0,
                bottom: 30,
            }
        };
    }, [logDetails.bossEvents, COLORS, PRECISION, chartScale]);

    const healers = useMemo(() => {
        return logDetails.raidCDs.filter(rcd => HealerSpecs.some(h => h.class === rcd.class && h.spec === rcd.spec));
    }, [logDetails.raidCDs]);

    const gridData: GridData = useMemo(() => {
        const data = healers
            .map(h => {
                const abilityRows = toGraphable(h.casts);
                return abilityRows.map(row => ({
                    ...h,
                    casts: row
                }))
            })
            .flat(1);
        return {
            data,
            fightSec
        }
    }, [healers]);

    useEffect(() => {
        setTooltipLineX(null);
    }, [chartScale])

    return (
        <div id="log-detail-pane">
            <div className='log-detail-pane--title'>
                <div className='wcl-option-card wcl-option-card--left wcl-option-card--right'>
                    <WclLogLink log={log} />
                    <WclLogTime log={log} />
                    <WclLogIlvl log={log} />
                    <WclLogRoster log={log} />
                    <WclLogGuild log={log} />
                    <span className='remove-btn'>
                        <ion-icon name="close"></ion-icon>
                    </span>
                </div>
            </div>
            <div className='log-detail-pane--body'>
                <ChartLegend boss={boss} chartData={chartData} />
                <div className='log-detail-pane--buttons'>
                    <button
                        className='primary-btn primary-btn--no-load chart-scale-btn'
                        onClick={() => setChartScale(Math.max(chartScale - 1, 3))}>
                        -
                    </button>
                    <button
                        className='primary-btn primary-btn--no-load chart-scale-btn'
                        onClick={() => setChartScale(Math.min(chartScale + 1, 6))}>
                        +
                    </button>
                    <button
                        className='primary-btn chart-toggle-btn'
                        onClick={() => setChartMode(chartMode === 'line' ? 'stacked' : 'line')}>
                        {chartMode === 'line' ? 'Area' : 'Line'}
                    </button>
                </div>
                <div className='log-detail-pane--charts'>
                    <div className='log-detail-pane--labels'>
                        <DamageTakenGraphLabels chartData={chartData} />
                        <CDUsageGraphLabels gridData={gridData} />
                    </div>
                    <div className='log-detail-pane--scroll-wrapper'>
                        {chartMode === 'stacked' && <AreaChart chartData={chartData} chartScale={chartScale} setTooltipLineX={setTooltipLineX} />}
                        {chartMode === 'line' && <LineChart chartData={chartData} chartScale={chartScale} setTooltipLineX={setTooltipLineX} />}
                        <CDUsageGraph
                            gridData={gridData}
                            chartScale={chartScale}
                            setTooltipLineX={setTooltipLineX} />
                        {(tooltipLineX !== null) && (
                            <div
                                style={{
                                    top: `${MARGIN_TOP}px`,
                                    left: `${tooltipLineX}px`,
                                }}
                                className='tooltip-line' />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

type Point = { damage: number; ability: string; sec: number; };
type ChartData = {
    data: Point[],
    keysByCount: string[];
    keysByMax: string[];
    maxY: number;
    colors: readonly string[];
    fightSec: number;
    xTicks: number[];
    width: number;
    height: number;
    margin: {
        top: number;
        right: number;
        bottom: number;
    };
};

export const DamageTakenGraphLabels = ({ chartData }: { chartData: ChartData }) => {

    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr("width", 75)
            .attr("height", chartData.height);

        svg.selectAll("g > *").remove()

        const yScale = d3.scaleLinear(
            [0, chartData.maxY],
            [chartData.height - chartData.margin.bottom, chartData.margin.top]
        );

        const yAxis = d3.axisLeft(yScale)
            .tickSizeOuter(0);

        svg
            .append('g')
            .attr('transform', `translate(${75},0)`)
            .call(yAxis)
            .call(g => g.select(".domain").remove());
    }, [svgRef, chartData])

    return (
        <div id="boss-damage-chart--labels">
            <svg color="white" ref={svgRef} />
        </div>
    )
}

const ChartLegend = ({ boss, chartData }: { boss: Encounter; chartData: ChartData }) => {
    const spells = chartData.keysByCount.map(a => boss.spells.find(s => s.ability === a)).filter((a): a is Spell => !!a);
    return (
        <div id='chart-legend'>
            {spells.map((spells, i) => (
                <div className='chart-legend-series'>
                    <span className='series-line' style={{ background: chartData.colors[i] }}></span>
                    <span>
                        {spells.ability}
                    </span>
                </div>
            ))}
        </div>
    );
};

const LineChart = ({ chartData, chartScale, setTooltipLineX }: { chartData: ChartData, chartScale: number, setTooltipLineX: (_: number) => void; }) => {

    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr("width", chartData.width)
            .attr("height", chartData.height);

        svg.selectAll("g > *").remove()

        const colors = d3.scaleOrdinal(chartData.colors);

        const sortedData = [...chartData.data].sort((p1, p2) => chartData.keysByCount.findIndex(ab => ab === p1.ability) - chartData.keysByCount.findIndex(ab => ab === p2.ability));

        const xScale = d3.scaleLinear(
            [0, chartData.fightSec],
            [0, chartData.width]
        );

        const yScale = d3.scaleLinear(
            [0, chartData.maxY],
            [chartData.height - chartData.margin.bottom, chartData.margin.top]
        );

        const yAxisGrid = d3.axisLeft(yScale)
            .tickSize(-chartData.width)
            .tickFormat(d => '')
            .ticks(10)
            .tickSizeOuter(0);

        const xAxis = d3.axisBottom(xScale)
            .tickValues(chartData.xTicks)
            .tickFormat((d) => {
                const sec = d.valueOf();
                if (sec % 30 === 0 && sec !== 0) {
                    return displaySec(sec, true)
                }
                return '';
            })
            .tickSizeOuter(0);

        svg.append('g')
            .attr('class', 'y axis-grid')
            .call(yAxisGrid)
            .call(g => g.select(".domain").remove());

        const line = d3
            .line<Point>()
            .curve(d3.curveBasis)
            .x(d => xScale(d.sec))
            .y(d => yScale(d.damage))
            .defined(d => d.damage > 0);

        svg
            .append('g')
            .selectAll()
            .data(d3.group(sortedData, (x) => x.ability))
            .join('path')
            .attr('d', (d) => line(d[1]))
            .style('stroke', (d, i) => colors(d[0].toString()))
            .style('stroke-width', 2)
            .style('fill', 'transparent');

        svg
            .append('g')
            .attr('transform', `translate(0,${chartData.height - chartData.margin.bottom})`)
            .call(xAxis);

        svg
            .on('mousemove', (e: MouseEvent, d) => {
                const roundedX = Math.round(e.offsetX / chartScale) * chartScale;
                setTooltipLineX(roundedX - 0.5);
            });
    }, [svgRef, chartData])

    return (
        <svg id="boss-damage-chart" color="white" ref={svgRef} />
    )
}

const AreaChart = ({ chartData, chartScale, setTooltipLineX }: { chartData: ChartData, chartScale: number, setTooltipLineX: (_: number) => void }) => {

    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = d3.select(svgRef.current)
            .attr("width", chartData.width)
            .attr("height", chartData.height);

        svg.selectAll("g > *").remove();

        const colors = d3.scaleOrdinal(chartData.colors);

        const stackSeries = d3.stack()
            .keys(chartData.keysByCount as any)
            .value(([, group]: any, key) => group.get(key).damage)
            (d3.index(chartData.data, d => d.sec, d => d.ability) as any);

        const xScale = d3
            .scaleLinear()
            .domain([0, chartData.fightSec])
            .range([0, chartData.width]);

        const yScale = d3.scaleLinear()
            .domain([0, chartData.maxY])
            .rangeRound([chartData.height - chartData.margin.bottom, chartData.margin.top]);

        const yAxisGrid = d3.axisLeft(yScale)
            .tickSize(-chartData.width)
            .tickFormat(d => '')
            .ticks(10)
            .tickSizeOuter(0);

        const xAxis = d3.axisBottom(xScale)
            .tickValues(chartData.xTicks)
            .tickFormat((d) => {
                const sec = d.valueOf();
                if (sec % 30 === 0 && sec !== 0) {
                    return displaySec(sec, true)
                }
                return '';
            })
            .tickSizeOuter(0);

        svg.append('g')
            .attr('class', 'y axis-grid')
            .call(yAxisGrid)
            .call(g => g.select(".domain").remove())

        const area = d3.area()
            .x((d: any) => xScale(d.data[0]))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]));

        svg
            .append("g")
            .selectAll()
            .data(stackSeries)
            .join("path")
            .attr("fill", d => colors(d.key))
            .attr("d", area as any)
            .append("title")
            .text(d => d.key);

        svg
            .append('g')
            .attr('transform', `translate(0,${chartData.height - chartData.margin.bottom})`)
            .call(xAxis);

        svg
            .on('mousemove', (e: MouseEvent, d) => {
                const roundedX = Math.round(e.offsetX / chartScale) * chartScale;
                setTooltipLineX(roundedX - 0.5);
            });
    }, [svgRef, chartData])

    return (
        <svg id="boss-damage-chart" color="white" ref={svgRef} />
    )
}

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

const CDUsageGraphLabels = ({
    gridData
}: {
    gridData: GridData,
}) => {
    return (
        <div id="cd-usage-graph--labels">
            <div
                className='raid-cds-grid'
                style={{
                    gridTemplateColumns: `max-content`
                }}
            >
                {gridData.data.map((h, y) => {
                    const rowLabel = (() => {
                        const isFirst = gridData.data.findIndex(g => g.name === h.name) === y;
                        if (!isFirst) {
                            return null;
                        }

                        return h.name;
                    })();

                    return (
                        <>
                            <div
                                className='raid-cds-grid--header-cell raid-cds-grid--name'
                                style={{
                                    color: CLASS_COLORS[h.class],
                                    gridRow: y + 1,
                                    gridColumnStart: 1,
                                    gridColumnEnd: 2,
                                }}
                            >
                                {rowLabel}
                            </div>
                        </>
                    );
                })}
            </div>
        </div>
    )
}

const CDUsageGraph = ({
    gridData,
    chartScale,
    setTooltipLineX
}: {
    gridData: GridData,
    chartScale: number,
    setTooltipLineX: (_: number) => void
}) => {
    useEffect(() => {
        (window as any)?.WH?.Tooltips && (window as any).WH.Tooltips.refreshLinks();
    }, [gridData.data]);

    const seconds = new Array(gridData.fightSec).fill(null).map((_, sec) => sec);

    return (
        <div id="cd-usage-graph">
            <div
                className='raid-cds-grid'
                style={{
                    gridTemplateColumns: `repeat(${seconds.length + 1}, ${chartScale}px)`
                }}
            >
                {gridData.data.map((h, y) => {
                    return seconds.map(x => {
                        const cast = h.casts.find(c => c.timestamp === x + 1);
                        if (!cast) {
                            return null;
                            // return (
                            //     <div
                            //         onMouseOver={(e) => {
                            //             setTooltipLineX(chartScale * (x + 1));
                            //         }}
                            //         className={`raid-cds-grid--row-cell row-${y + 1}`}
                            //         style={{
                            //             gridRow: y + 1,
                            //             gridColumnStart: x + 1,
                            //             gridColumnEnd: x + 1 + 1,
                            //         }}
                            //     >
                            //     </div>
                            // );
                        }

                        return (
                            <div
                                onMouseOver={(e) => {
                                    setTooltipLineX(chartScale * (x + 1));
                                }}
                                className={`raid-cds-grid--row-cell raid-cds-grid--cast row-${y + 1}`}
                                title={cast.ability}
                                style={{
                                    background: CLASS_COLORS[h.class],
                                    color: CLASS_OFFSET_COLORS[h.class],
                                    gridRow: y + 1,
                                    gridColumnStart: x + 2,
                                    gridColumnEnd: x + 2 + cast.duration,
                                }}
                            >
                                <a
                                    onClick={() => { }}
                                    data-wh-icon-size='small'
                                    href={`https://www.wowhead.com/spell=${cast.spellId}`}>
                                </a>
                            </div>
                        );
                    });
                })}
                {gridData.data.map((h, y) => {
                    return (
                        <div
                            className={`raid-cds-grid--row-cell row-${y + 1}`}
                            style={{
                                gridRow: y + 1,
                                gridColumnStart: 1,
                                gridColumnEnd: seconds.length + 1,
                            }}
                        >
                        </div>
                    )
                })}
            </div>
        </div>
    )
}