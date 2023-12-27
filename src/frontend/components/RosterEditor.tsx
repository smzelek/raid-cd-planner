import Select from "./Select/Select";
import { CLASS_COLORS, Class, Cooldown, HealerSpecs, NonHealerSpecs, RosterMember, SPECS_WITH_CDS, SpecMatchesClass, cooldownsBySpec } from "../constants";
import React, { useEffect, useMemo, useState } from "react";
import { CooldownEvent, PlayerCooldownCast, getHealersInRoster, getNonHealersInRoster, refreshTooltips, webUuid } from "../utils";

type RosterKind = 'healers' | 'raid';

export default function RosterEditor(props: {
    mode: 'healers' | 'split',
    entryMode: 'edit' | 'note',
    chartScale: number,
    roster: RosterMember[],
    disabled: boolean,
    setRoster: (val: RosterMember[]) => void,
}) {
    const { roster, mode, entryMode, setRoster, disabled, chartScale } = props;
    const healers = useMemo(() => getHealersInRoster(roster), [roster]);
    const raiders = useMemo(() => getNonHealersInRoster(roster), [roster]);

    return (
        <div className="roster">
            {(mode === 'healers' || mode === 'split') && (
                <div>
                    <h5 className="roster--title">Healers</h5>
                    {!disabled && (
                        <RosterMemberSelector
                            kind={'healers'}
                            roster={healers}
                            setRoster={(e) => {
                                setRoster([...e, ...raiders]);
                            }}
                        />
                    )}
                    {healers.map((member, i) => (
                        <RosterMemberEditor
                            chartScale={chartScale}
                            key={member.playerId}
                            i={i}
                            entryMode={entryMode}
                            disabled={disabled}
                            roster={healers}
                            setRoster={(e) => {
                                setRoster([...e, ...raiders]);
                            }}
                            member={member} />
                    ))}
                </div>
            )}
            {(mode === 'split') && (
                <div className="flex-scroll-wrapper">
                    <h5 className="roster--title">Raid</h5>
                    {!disabled && (
                        <RosterMemberSelector
                            kind={'raid'}
                            roster={raiders}
                            setRoster={(e) => {
                                setRoster([...healers, ...e]);
                            }}
                        />
                    )}
                    {raiders.map((member, i) => (
                        <RosterMemberEditor
                            key={member.playerId}
                            i={i}
                            chartScale={chartScale}
                            entryMode={entryMode}
                            disabled={disabled}
                            roster={raiders}
                            setRoster={(e) => {
                                setRoster([...healers, ...e]);
                            }}
                            member={member} />
                    ))}
                </div>
            )}
        </div>
    )
}

const RosterMemberSelector = (props: { kind: RosterKind, roster: RosterMember[], setRoster: (val: RosterMember[]) => void, }) => {
    const { roster, kind, setRoster } = props;
    const options = kind === 'healers' ? HealerSpecs : NonHealerSpecs;
    return (
        <Select
            width={'200px'}
            value={undefined}
            options={options}
            clearable={false}
            onChange={(s) => {
                const defaultName = `${s!.display}`;
                const currentCount = roster.filter(r => r.name.startsWith(defaultName)).length;
                const suffix = currentCount === 0 ? 1 : currentCount + 1;
                const { display, ...specProperties } = s!;

                setRoster([
                    { name: `${defaultName} ${suffix}`, playerId: webUuid(), ...specProperties },
                    ...roster
                ])
            }}
            render={(s) => <div className="class-text" style={{ color: CLASS_COLORS[s.class] }}>{s.display}</div>}
        />
    );
}

const RosterMemberEditor = (props: {
    disabled: boolean,
    entryMode: 'edit' | 'note',
    i: number,
    chartScale: number,
    roster: RosterMember[],
    member: RosterMember,
    setRoster: (val: RosterMember[]) => void,
}) => {
    const { disabled, i, member, roster, chartScale, entryMode, setRoster } = props;
    const [value, setValue] = useState(member.name);
    const cds = useMemo(() => {
        return cooldownsBySpec(member as SpecMatchesClass);
    }, [member.class, member.spec]);

    useEffect(() => {
        refreshTooltips();
    }, [cds]);

    return <div key={member.playerId} className="roster-member">
        <div className="roster-member--editor">
            {!disabled && (
                <button className='remove-btn'
                    onClick={() => {
                        setRoster([...roster.slice(0, i), ...roster.slice(i + 1)]);
                    }}
                >
                    <ion-icon name="close" />
                </button>
            )}
            <input
                className="player-text"
                style={{ color: CLASS_COLORS[member.class] }}
                defaultValue={value}
                onBlur={(e) => {
                    setValue(e.target.value);
                    setRoster([...roster.slice(0, i), { ...roster[i], name: e.target.value }, ...roster.slice(i + 1)])
                }}
            />
        </div>
        {entryMode === 'note' && (
            <div className="roster-member--cds">
                {cds.map(cd => (
                    <DraggableAbilityIcon
                        key={cd.spellId}
                        chartScale={chartScale}
                        spell={cd}
                        playerId={member.playerId}
                        playerClass={member.class}
                    />
                ))}
            </div>
        )}
    </div>
};


import { useDraggable } from "@dnd-kit/core";

export type DraggableSpell = {
    newId: string;
    spellId: number;
    playerClass: Class;
    playerId: string;
    duration: number;
}
const DraggableAbilityIcon = (props: {
    chartScale: number,
    spell: Cooldown<Class>,
    playerId: string,
    playerClass: Class,
}) => {
    const { spell, chartScale, playerId, playerClass } = props;
    const [hideTooltip, setHideTooltip] = useState(false);
    // const setIsDragging

    const dragId = useMemo(() => {
        return webUuid();
    }, [])

    const dragData = (): DraggableSpell => ({
        spellId: spell.spellId,
        duration: spell.duration,
        playerClass,
        playerId,
        newId: webUuid(),
    });

    const { attributes, listeners, setNodeRef, transform, isDragging, active } = useDraggable({
        id: dragId,
        data: dragData()
    });

    return (
        <div >
            <div ref={setNodeRef} {...listeners} {...attributes}>
                <a
                    onDragStart={(e) => {
                        setHideTooltip(true);
                    }}
                    onDragEnd={(e) => {
                        setHideTooltip(false);
                    }}
                    style={{ pointerEvents: hideTooltip ? 'none' : 'all' }}
                    data-wh-icon-size="small"
                    href={`https://www.wowhead.com/spell=${spell.spellId}`}
                />
            </div>
        </div>
    )
}
