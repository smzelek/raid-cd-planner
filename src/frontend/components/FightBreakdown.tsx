import { useEffect, useRef, useState, useMemo } from 'react'
import { CLASS_COLORS, CLASS_OFFSET_COLORS, Class, Roster, Spec, SpecMatchesClass, cooldownsBySpec, } from '../constants';
import { displaySec, offsetRaidCDRows, CooldownEvent, addRaidCDProperties, refreshTooltips, findInvalidCds, webUuid, findUnusedCDs } from '../utils';
import { Encounter } from '../../types';
import { BossAbilityDamageEvents, ReportFightTimestamps } from '../../backend/services/wcl.service';
import * as d3 from 'd3';
import { DragEndEvent, DragOverlay, DragStartEvent, useDndMonitor, useDraggable, useDroppable } from '@dnd-kit/core';
import { DraggableSpell } from './RosterEditor';
import type { Modifier } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';
import useResizeObserver from 'use-resize-observer';

const MARGIN_TOP = 20;
const COLORS = d3.schemeCategory10;
const PRECISION = 4;
const MAX_SCALE = 8;
const MIN_SCALE = 3;

export type PlannedPlayerRaidCDs = {
    class: Class;
    spec: Spec;
    playerId: string;
    casts: CooldownEvent[];
};

export type PlannedRaidCDs = PlannedPlayerRaidCDs[];

export const snapLeftToCursor: Modifier = ({
    activatorEvent,
    draggingNodeRect,
    transform,
}) => {
    if (draggingNodeRect && activatorEvent) {
        const activatorCoordinates = getEventCoordinates(activatorEvent);

        if (!activatorCoordinates) {
            return transform;
        }

        const offsetX = activatorCoordinates.x - draggingNodeRect.left;
        const offsetY = activatorCoordinates.y - draggingNodeRect.top;

        return {
            ...transform,
            x: transform.x + offsetX, //- draggingNodeRect.width,
            y: transform.y + offsetY - draggingNodeRect.height / 2,
        };
    }

    return transform;
};

type GridData = {
    data: PlannedRaidCDs;
    fightSec: number;
};

// Compress to X second precision
const smoothSeries = (series: number[], fightSec: number): number[] => {
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

export const FightBreakdown = (props: {
    roster: Roster,
    chartScale: number,
    raidCDs: PlannedRaidCDs,
    timestamps: ReportFightTimestamps,
    bossDamage: BossAbilityDamageEvents,
    mode: 'view' | 'edit',
    setRaidCDs: (_: PlannedRaidCDs) => void,
    setChartScale: (_: number) => void,
}) => {
    const { roster, raidCDs, timestamps, bossDamage, chartScale, mode, setChartScale, setRaidCDs } = props;
    const fightSec = Math.ceil(timestamps.endTime - timestamps.startTime);
    const [tooltipLineSec, setTooltipLineSec] = useState<number | null>(null);
    const [scrollOffset, setScrollOffset] = useState<number>(0);
    const [chartMode, setChartMode] = useState<'line' | 'stacked'>('stacked');

    const labelRef = useRef(null);
    const [labelWidth, setLabelWidth] = useState<number | null>(null);

    useResizeObserver({
        ref: labelRef,
        onResize: (e) => {
            setLabelWidth(e.width ?? null);
        },
    })

    const chartData: ChartData = useMemo(() => {
        // 1 second precision
        // Get all abilities that were found in the data
        const abilities = [...new Set(bossDamage.map(e => e.ability))];

        // Compute dmg each ability did in each second of the fight
        const dtpsSeriesMap = abilities.reduce((acc, cur) => {
            acc[cur] = new Array(fightSec).fill(0);
            return acc;
        }, {} as Record<string, number[]>);

        bossDamage.forEach(e => {
            dtpsSeriesMap[e.ability][e.timestamp] += e.damage;
        });

        abilities.forEach(ability => {
            dtpsSeriesMap[ability] = smoothSeries(dtpsSeriesMap[ability], fightSec);
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

        const xTicks = new Array(Math.ceil(fightSec / 60) * 6).fill(0).map((_, i) => i * 10).slice(1, -1);

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
    }, [bossDamage, COLORS, PRECISION, chartScale]);

    const gridData: GridData = useMemo(() => {
        const data = roster
            .map((rm): PlannedPlayerRaidCDs[] => {
                const cdsForPlayer = raidCDs.find(rcd => rcd.playerId === rm.playerId)?.casts ?? [];
                return offsetRaidCDRows(addRaidCDProperties(cdsForPlayer))
                    .map(cds => ({
                        casts: cds,
                        class: rm.class,
                        spec: rm.spec,
                        playerId: rm.playerId
                    }));
            }).flat(1);

        return {
            data,
            fightSec
        }
    }, [raidCDs, roster]);

    const playerErrors = useMemo(() => {
        return raidCDs.map(rcd => {
            const player = roster.find(r => r.playerId === rcd.playerId);
            if (!player) {
                return null;
            }

            const errorCasts = findInvalidCds(rcd, player.cdOverrides);
            if (errorCasts.length === 0) {
                return null;
            }
            return {
                name: player.name,
                class: player.class,
                errors: errorCasts
            }
        }).filter((p): p is ({ name: string; class: Class; errors: CooldownEvent[] }) => !!p);
    }, [raidCDs, roster]);

    const playerUtilization = useMemo(() => {
        return roster.map(player => {
            const cdUsages = raidCDs.find(rcd => rcd.playerId === player.playerId)?.casts ?? [];
            const allCds = cooldownsBySpec(player as SpecMatchesClass);

            console.log({ name: player.name, tracking: player.cdTracking })

            const missingCasts = findUnusedCDs(allCds, cdUsages, fightSec, player.cdOverrides, player.cdTracking);
            if (Object.keys(missingCasts).length === 0) {
                return null;
            }

            const missingCastTexts = Object.entries(missingCasts).reduce((acc, [k, v]) => {
                const times = (() => {
                    const _times = v.map(([start, end]) => {
                        if (start === 0 && end === fightSec) {
                            return `entirely`
                        }

                        return `between ${displaySec(start, false)} and ${displaySec(end, false)}`
                        // if (start !== 0) {
                        //     return `after ${displaySec(start, false)}`
                        // }
                        // if (!!end) {
                        //     return `before ${displaySec(end, false)}`
                        // }
                        // return '';
                    });

                    if (_times.length > 1) {
                        return `${_times.slice(0, -1).join(', ')}, and ${_times.slice(-1)[0]}.`;
                    }

                    return `${_times[0]}.`;
                })();

                acc[k] = times;

                return acc;
            }, {} as Record<string, string>);

            return {
                name: player.name,
                class: player.class,
                missing: missingCastTexts
            }

        }).filter((p): p is ({ name: string; class: Class; missing: Record<string, string>; }) => !!p);
    }, [raidCDs, roster]);

    useEffect(() => {
        setTooltipLineSec(null);
    }, [chartScale]);

    const [draggedSpell, setDraggedSpell] = useState<DraggableSpell | null>();

    const { isOver, setNodeRef } = useDroppable({
        id: 'droppable',
    });

    const handleDragStart = (event: DragStartEvent) => {
        const dragData = event.active.data.current as DraggableSpell;
        setDraggedSpell(dragData);

        setTimeout(() => {
            refreshTooltips();
        }, 10);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        if (!isOver || !tooltipLineSec) {
            return;
        }

        const payload = event.active.data.current as DraggableSpell;

        if (payload.type === 'NEW') {
            let update: PlannedRaidCDs = [...raidCDs];

            // Add new players to the raidCDs array
            if (raidCDs.every(p => p.playerId !== payload.playerId)) {
                const player = roster.find(r => r.playerId === payload.playerId)!;
                update = [...update, {
                    class: player.class,
                    spec: player.spec,
                    playerId: player.playerId,
                    casts: [],
                }]
            }

            // Add new casts to the raidCDs array
            update = update.map(rc => {
                if (rc.playerId !== payload.playerId) {
                    return rc;
                }
                return {
                    ...rc,
                    casts: [
                        ...rc.casts,
                        ...addRaidCDProperties([{ castId: payload.castId, spellId: payload.spellId, timestamp: tooltipLineSec }])
                    ].sort((c1, c2) => c1.timestamp - c2.timestamp)
                }
            });

            setRaidCDs(update);
        }

        if (payload.type === 'EXISTING') {
            let update: PlannedRaidCDs = [...raidCDs];

            // Remove old cast and add new cast to the raidCDs array
            update = update.map(rc => {
                if (rc.playerId !== payload.playerId) {
                    return rc;
                }
                return {
                    ...rc,
                    casts: [
                        ...rc.casts.filter(c => c.castId !== payload.castId),
                        ...addRaidCDProperties([{ castId: payload.castId, spellId: payload.spellId, timestamp: tooltipLineSec }])
                    ].sort((c1, c2) => c1.timestamp - c2.timestamp)
                }
            });

            setRaidCDs(update);
        }
    };

    useDndMonitor({
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
    });

    const handleRemoveCast = (castId: string) => {
        const update = raidCDs.map(rcd => ({
            ...rcd,
            casts: rcd.casts.filter(c => c.castId !== castId)
        }));
        setRaidCDs(update);
    };

    return (
        <div id="fight-breakdown">
            <DragOverlay
                modifiers={[snapLeftToCursor]}
                dropAnimation={null}
                style={{
                    pointerEvents: 'none'
                }}
            >
                {draggedSpell && (
                    <div
                        id="cds-drag-preview"
                        className='raid-cds-grid--cast'
                        style={{
                            width: `${chartScale * draggedSpell.duration}px`,
                            background: CLASS_COLORS[draggedSpell.playerClass],
                        }}
                    >
                        <a
                            style={{
                                pointerEvents: 'none',
                                boxShadow: `0 0 0 1px ${CLASS_COLORS[draggedSpell.playerClass]}`
                            }}
                            data-wh-icon-size="small"
                            href={`https://www.wowhead.com/spell=${draggedSpell.spellId}`}
                        />
                    </div>
                )}
            </DragOverlay>
            <div className='fight-breakdown-pane--buttons'>
                <button
                    className='primary-btn primary-btn--no-load chart-scale-btn'
                    onClick={() => setChartScale(Math.max(chartScale - 1, MIN_SCALE))}>
                    -
                </button>
                <button
                    className='primary-btn primary-btn--no-load chart-scale-btn'
                    onClick={() => setChartScale(Math.min(chartScale + 1, MAX_SCALE))}>
                    +
                </button>
                <button
                    className='primary-btn chart-toggle-btn'
                    onClick={() => setChartMode(chartMode === 'line' ? 'stacked' : 'line')}>
                    {chartMode === 'line' ? 'Stacked' : 'Lines'}
                </button>
            </div>
            <div className='fight-breakdown-pane--charts'>
                {useMemo(() => (
                    <ChartLegend chartData={chartData} />
                ), [chartData])}
                <div ref={labelRef} className='fight-breakdown-pane--labels'>
                    {useMemo(() => (
                        <DamageTakenGraphLabels chartData={chartData} />
                    ), [chartData])}
                    {useMemo(() => (
                        <CDUsageGraphLabels gridData={gridData} roster={roster} />
                    ), [gridData, roster])}
                    {(tooltipLineSec !== null) && (
                        <div
                            style={{
                                left: `calc(100% + ${tooltipLineSec * chartScale}px - ${scrollOffset}px)`,
                            }}
                            id='seconds-tooltip'>
                            <div className='seconds-tooltip--label'>
                                <span>
                                    {displaySec(tooltipLineSec, false)}
                                </span>
                            </div>
                            <div className='seconds-tooltip--line' />
                        </div>
                    )}
                </div>
                <div ref={setNodeRef}
                    className='fight-breakdown-pane--scroll-wrapper'
                    onScroll={(e) => {
                        setScrollOffset((e.target as Element).scrollLeft);
                        setTooltipLineSec(null);
                    }}
                >
                    {useMemo(() => {
                        return <>
                            {chartMode === 'stacked' && <AreaChart chartData={chartData} chartScale={chartScale} setTooltipLineSec={setTooltipLineSec} />}
                            {chartMode === 'line' && <LineChart chartData={chartData} chartScale={chartScale} setTooltipLineSec={setTooltipLineSec} />}
                        </>
                    }, [chartMode, chartData, chartScale, setTooltipLineSec])}
                    <div>
                        {useMemo(() => (
                            <CDUsageGraph
                                mode={mode}
                                gridData={gridData}
                                chartScale={chartScale}
                                setTooltipLineSec={setTooltipLineSec}
                                onRemoveCast={handleRemoveCast}
                            />
                        ), [gridData, chartScale, setTooltipLineSec,])}
                    </div>
                </div>
            </div>
            {mode === 'edit' && labelWidth && (
                <>
                    <div className='fight-breakdown-pane--advice' style={{ gridTemplateColumns: `${labelWidth}px auto` }}>
                        {playerErrors.map(player => (
                            <div className='fight-breakdown-pane--error'>
                                <div className='advice-label-wrapper'>
                                    <span className='advice-label' style={{ color: CLASS_COLORS[player.class] }}>
                                        {player.name}
                                        <ion-icon name="alert-circle"></ion-icon>
                                    </span>
                                </div>
                                <span className='advice-text'>
                                    {player.errors.map(ec => `${ec.ability} is still on cooldown at ${displaySec(ec.timestamp, false)}. `)}
                                </span>
                            </div>
                        ))}
                        {playerUtilization.map(player => (
                            <div key={player.name} className='fight-breakdown-pane--missing'>
                                <div className='advice-label-wrapper'>
                                    <span className='advice-label' style={{ color: CLASS_COLORS[player.class] }}>
                                        {player.name}
                                        <ion-icon name="warning"></ion-icon>
                                    </span>
                                </div>
                                <span className='advice-text'>
                                    {Object.entries(player.missing).map(([ability, text]) => `${ability} is unused ${text}`).join(' ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
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

const ChartLegend = ({ chartData }: { chartData: ChartData }) => {
    return (
        <div id='chart-legend'>
            {chartData.keysByCount.map((key, i) => (
                <div key={key} className='chart-legend-series'>
                    <span className='series-line' style={{ background: chartData.colors[i] }}></span>
                    <span>
                        {key}
                    </span>
                </div>
            ))}
        </div>
    );
};

const LineChart = ({
    chartData,
    chartScale,
    setTooltipLineSec
}: {
    chartData: ChartData,
    chartScale: number,
    setTooltipLineSec: (_: number) => void;
}) => {
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
            .style('fill', '#0000001c');

        svg
            .append('g')
            .attr('transform', `translate(0,${chartData.height - chartData.margin.bottom})`)
            .call(xAxis);

        svg
            .on('mousemove', (e: MouseEvent, d) => {
                const roundedX = Math.round(e.offsetX / chartScale);
                setTooltipLineSec(roundedX);
            });
    }, [svgRef, chartData])

    return (
        <svg id="boss-damage-chart" color="white" ref={svgRef} />
    )
}

const AreaChart = ({
    chartData,
    chartScale,
    setTooltipLineSec
}: {
    chartData: ChartData,
    chartScale: number,
    setTooltipLineSec: (_: number) => void
}) => {
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
            .attr("stroke", "#0000003f")
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
                const roundedX = Math.round(e.offsetX / chartScale);
                setTooltipLineSec(roundedX);
            });
    }, [svgRef, chartData])

    return (
        <svg id="boss-damage-chart" color="white" ref={svgRef} />
    )
}


const CDUsageGraphLabels = ({
    gridData,
    roster,
}: {
    gridData: GridData,
    roster: Roster,
}) => {

    return (
        <div id="cd-usage-graph--labels">
            {gridData.data.map((h, y) => {
                const rowLabel = (() => {
                    const playerIdx = gridData.data.findIndex(g => g.playerId === h.playerId);
                    const isFirstRowForPlayer = playerIdx === y;

                    if (!isFirstRowForPlayer) {
                        return null;
                    }

                    return roster.find(r => r.playerId === h.playerId)?.name;
                })();

                return (
                    <div
                        key={y}
                        className='raid-cds-grid--header-cell raid-cds-grid--name'
                        style={{ color: CLASS_COLORS[h.class], }}
                    >
                        {rowLabel}
                    </div>
                );
            })}
        </div>
    )
};

const CDUsageGraph = (props: {
    mode: 'view' | 'edit',
    gridData: GridData,
    chartScale: number,
    setTooltipLineSec: (_: number) => void,
    onRemoveCast: (_: string) => void,
}) => {
    const { gridData, chartScale, mode, setTooltipLineSec, onRemoveCast } = props;

    useEffect(() => {
        refreshTooltips();
    }, [gridData.data]);

    const seconds = new Array(gridData.fightSec).fill(null).map((_, sec) => sec);

    return (
        <div id="cd-usage-graph">
            <div
                onMouseMove={(e) => {
                    const roundedX = Math.round(e.nativeEvent.offsetX / chartScale);
                    setTooltipLineSec(roundedX);
                }}
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
                        }

                        return (
                            <DraggableGridCast
                                row={y}
                                column={x}
                                key={cast.castId}
                                player={h}
                                cast={cast}
                                disabled={mode === 'view'}
                                setTooltipLineSec={setTooltipLineSec}
                                onRemove={() => onRemoveCast(cast.castId)}
                            />
                        );
                    });
                })}
                {gridData.data.map((h, y) => {
                    return (
                        <div
                            key={`bg-row-${y}`}
                            className={`raid-cds-grid--bg-row row-${y + 1}`}
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
};

const DraggableGridCast = (props: {
    row: number,
    column: number,
    cast: CooldownEvent,
    player: PlannedPlayerRaidCDs,
    disabled: boolean,
    setTooltipLineSec: (_: number) => void,
    onRemove: () => void,
}) => {
    const { row, column, cast, player, disabled, setTooltipLineSec, onRemove } = props;

    const dragId = useMemo(() => {
        return webUuid();
    }, []);

    const dragData = (): DraggableSpell => ({
        type: 'EXISTING',
        spellId: cast.spellId,
        duration: cast.duration,
        playerClass: player.class,
        playerId: player.playerId,
        castId: cast.castId,
    });

    const { listeners, setNodeRef, isDragging } = useDraggable({
        id: dragId,
        data: dragData(),
        disabled,
    });

    return (
        <div
            ref={setNodeRef}
            onClick={(e) => {
                if (!e.shiftKey || disabled) {
                    return;
                }

                onRemove();
            }}
            {...listeners}
            onMouseMove={(e) => {
                setTooltipLineSec(column + 1);
                e.stopPropagation()
            }}
            className={`raid-cds-grid--row-cell raid-cds-grid--cast`}
            title={cast.ability}
            style={{
                background: CLASS_COLORS[player.class],
                color: CLASS_OFFSET_COLORS[player.class],
                gridRow: row + 1,
                gridColumnStart: column + 2,
                gridColumnEnd: column + 2 + cast.duration,
                visibility: isDragging ? 'hidden' : 'visible'
            }}
        >
            <div className='no-click-a-wrapper'>
                <a
                    onClick={() => { }}
                    style={{
                        boxShadow: `0 0 0 1px ${CLASS_COLORS[player.class]}`
                    }}
                    data-wh-icon-size='small'
                    href={`https://www.wowhead.com/spell=${cast.spellId}`}>
                </a>
            </div>
        </div>
    )
};

