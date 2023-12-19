import Select from "../Select/Select";
import { CLASS_COLORS, RosterMember, SPECS_WITH_CDS } from "../../constants";
import React, { useState } from "react";

export default function Roster(props: {
    roster: RosterMember[],
    setRoster: (val: RosterMember[]) => void,
}) {
    const { roster, setRoster } = props;
    return (
        <div className="flex-scroll-wrapper roster">
            <div style={{ marginBottom: '10px' }}>
                <Select
                    width={'185px'}
                    value={undefined}
                    options={SPECS_WITH_CDS}
                    clearable={false}
                    onChange={(s) => {
                        const defaultName = `${s!.display}`;
                        const currentCount = roster.filter(r => r.name.startsWith(defaultName)).length;
                        const suffix = currentCount === 0 ? 1 : currentCount + 1;
                        const { display, ...specProperties } = s!;

                        setRoster([
                            { name: `${defaultName} ${suffix}`, playerId: crypto.randomUUID().split('-')[0], ...specProperties },
                            ...roster
                        ])
                    }}
                    render={(s) => <div className="class-text" style={{ color: CLASS_COLORS[s.class] }}>{s.display}</div>}
                />
            </div>
            {roster.map((member, i) => (
                <div key={member.playerId} className="roster-member">
                    <div >
                        <input className="player-text player-name-editor"
                            style={{ color: CLASS_COLORS[member.class] }}
                            value={member.name}
                            onChange={(e) => {
                                setRoster([...roster.slice(0, i), { ...roster[i], name: e.target.value }, ...roster.slice(i + 1)])
                            }} />
                        <button onClick={() => {
                            setRoster([...roster.slice(0, i), ...roster.slice(i + 1)]);
                        }}>X</button>
                    </div>
                </div>
            ))}
        </div >
    )
}
