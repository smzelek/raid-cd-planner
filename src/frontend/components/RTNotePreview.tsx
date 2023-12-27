import { RosterMember } from "../constants";
import { Fragment, useEffect, useMemo, useState } from "react";
import { displaySec } from "../utils";
import { PlannedRaidCDs } from "./FightBreakdown";
import CopyButton from "./CopyButton";
import { Encounter } from "../../types";

export default function RTNotePreview(props: {
    boss: Encounter,
    roster: RosterMember[],
    rosterCDs: PlannedRaidCDs,
}) {
    const { boss, roster, rosterCDs } = props;

    const exportNote = () => {
        navigator.clipboard.writeText(note);
    }

    const [phaseTimings, setPhaseTimings] = useState<Record<string, string>>({})

    useEffect(() => {
        if (boss.phases.length === 1) {
            setPhaseTimings({
                [boss.phases[0]!.title]: '0:00'
            });
        } else {
            setPhaseTimings(boss.phases.reduce((acc, cur) => {
                acc[cur.title] = '';
                return acc;
            }, {} as Record<string, string>))
        }
    }, [boss])

    const note = useMemo(() => {
        return rosterCDs.map(rcd => {
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
            .sort((c1, c2) => c1.timestamp - c2.timestamp)
            .map(cast => {
                const player = roster.find(r => r.playerId === cast.playerId);
                if (!player) {
                    return null;
                }

                return `{time:${displaySec(cast.timestamp)}} ${player.name} ${cast.ability}`;
            })
            .join('\n')
    }, [roster, rosterCDs]);

    console.log(phaseTimings)

    return (
        <div id="ert-note-pane">
            <div className='ert-note-pane--body'>
                {boss.phases.length > 1 && (
                    <>
                        <h5>Phase Timings</h5>
                        <div className="ert-note-pane--phase-timings">
                            {boss.phases.map(p => (
                                <Fragment key={p.title}>
                                    <span className="ert-note-pane--phase-name">{p.title}</span>
                                    <input
                                        className="ert-note-pane--phase-input"
                                        defaultValue={phaseTimings[p.title]}
                                        onBlur={(e) => {
                                            setPhaseTimings({
                                                ...phaseTimings,
                                                [p.title]: e.target.value
                                            })
                                        }}
                                        placeholder="0:00 4:10 ..."
                                    />
                                </Fragment>
                            ))}
                        </div>
                    </>
                )}
                <div className="ert-note-pane--contents">
                    {note}
                </div>
                <div className='ert-note-pane--action'>
                    <CopyButton onClick={exportNote}>Copy MRT Note</CopyButton>
                </div>
            </div>
        </div>
    );
};
