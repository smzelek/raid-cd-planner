import { RosterMember } from "../constants";
import { Fragment, useEffect, useMemo, useState } from "react";
import { displaySec, toSec } from "../utils";
import { PlannedRaidCDs } from "./FightBreakdown";
import CopyButton from "./CopyButton";
import { Encounter } from "../../types";
import { CURRENT_RAID_DEFAULT_PHASE_TIMINGS, CURRENT_RAID_ENCOUNTER_IDS, CURRENT_RAID_PHASE_TRANSITIONS } from "../../utils";
import { Phases } from "../../backend/services/blizzard.service";

type Phase = {
    title: string;
    start: number;
};

export default function RTNotePreview(props: {
    boss: Encounter,
    roster: RosterMember[],
    rosterCDs: PlannedRaidCDs,
}) {
    const { boss, roster, rosterCDs } = props;

    const exportNote = () => {
        navigator.clipboard.writeText(note);
    }

    const [phaseTimings, setPhaseTimings] = useState<Record<number, string>>({})
    const [error, setError] = useState('');

    useEffect(() => {
        setPhaseTimings(CURRENT_RAID_DEFAULT_PHASE_TIMINGS[boss.wclId]);
    }, [boss])

    const note = useMemo(() => {
        const phaseIds = boss.phases.reduce((acc, cur, i) => {
            acc[cur.title] = i;
            return acc;
        }, {} as Record<string, number>);

        const phases: Phase[] = Object.entries(phaseTimings)
            .map(([k, v]) => v.split(' ').map(time => ({
                title: boss.phases[+k].title,
                start: toSec(time),
            })))
            .flat(1)
            .filter(p => !isNaN(p.start))
            .sort((p1, p2) => p1.start - p2.start);

        const casts = rosterCDs.map(rcd => {
            const casts = rcd.casts.map(c => {
                return {
                    playerId: rcd.playerId,
                    ability: c.ability,
                    timestamp: c.timestamp,
                }
            });
            return casts;
        })
            .flat(1)
            .sort((c1, c2) => c1.timestamp - c2.timestamp);

        const phaseTransitionCounts: Record<number, Record<number, number>> = {};
        const phaseCounts: Record<number, number> = {};

        setError('');

        return phases.map((p, i) => {
            const fromPhase = (phases[i - 1] as Phase | undefined);
            const nextPhase = (phases[i + 1] as Phase | undefined);

            let phaseOffsetText = '';
            let title: string | null = null;

            if (fromPhase) {
                const fromPhaseId = phaseIds[fromPhase.title];
                const toPhaseId = phaseIds[p.title];

                const transitionCounts = phaseTransitionCounts[fromPhaseId] ?? {};
                transitionCounts[toPhaseId] = (transitionCounts[toPhaseId] ?? 0) + 1;
                phaseTransitionCounts[fromPhaseId] = transitionCounts;

                const transition = CURRENT_RAID_PHASE_TRANSITIONS[boss.wclId][fromPhaseId][toPhaseId];
                if (!transition) {
                    setError(`Missing an appropriate transition from (${fromPhase.title}) to (${p.title}) in the given timings.`)
                    return [];
                }
                phaseOffsetText = `,${transition.type}:${transition.spellId}:${phaseTransitionCounts[fromPhaseId][toPhaseId]}`;

                phaseCounts[toPhaseId] = (phaseCounts[toPhaseId] ?? 0) + 1;

                title = `-- ${p.title} (${phaseCounts[toPhaseId]}: ${displaySec(p.start)})`;
            } else {
                title = `-- ${p.title} (1: ${displaySec(p.start)})`;
            }

            const phaseEnd = nextPhase?.start ?? Infinity;
            const castsForPhase = casts.filter(c => p.start <= c.timestamp && c.timestamp < phaseEnd);
            return [
                title,
                ...castsForPhase.map(c => {
                    const player = roster.find(r => r.playerId === c.playerId);
                    if (!player) {
                        return null;
                    }

                    return `{time:${displaySec(c.timestamp - p.start)}${phaseOffsetText}} ${player.name} ${c.ability}`;
                })
            ]
        })
            .flat(1)
            .filter(t => !!t)
            .join('\n');
    }, [roster, rosterCDs, phaseTimings]);

    return (
        <div id="ert-note-pane">
            <div className='ert-note-pane--body'>
                {boss.phases.length > 1 && (
                    <>
                        <h5>Phase Timings</h5>
                        <div className="ert-note-pane--phase-timings">
                            {boss.phases.map((p, i) => (
                                <Fragment key={p.title}>
                                    <span className="ert-note-pane--phase-name">{p.title}</span>
                                    <input
                                        className="ert-note-pane--phase-input"
                                        defaultValue={phaseTimings[i]}
                                        onBlur={(e) => {
                                            setPhaseTimings({
                                                ...phaseTimings,
                                                [i]: e.target.value
                                            })
                                        }}
                                        placeholder="0:00 4:10 ..."
                                    />
                                </Fragment>
                            ))}
                        </div>
                    </>
                )}
                {error && (
                    <div className="ert-note-pane--error">
                        <ion-icon name="warning"></ion-icon>
                        <span>
                            {error}
                        </span>
                    </div>
                )}
                {!error && (
                    <>
                        <div className="ert-note-pane--contents">
                            {note}
                        </div>
                        <div className='ert-note-pane--action'>
                            <CopyButton onClick={exportNote}>Copy MRT Note</CopyButton>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
