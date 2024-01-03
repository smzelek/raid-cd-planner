import Select from "./Select/Select";
import { CLASS_COLORS, Class, Cooldown, HealerSpecs, NonHealerSpecs, RosterMember, SPECS_WITH_CDS, SpecMatchesClass, cooldownsBySpec } from "../constants";
import React, { useEffect, useMemo, useState } from "react";
import { CooldownEvent, PlayerCooldownCast, displaySec, getHealersInRoster, getNonHealersInRoster, refreshTooltips, toSec, webUuid } from "../utils";
import { useDraggable } from "@dnd-kit/core";
import { COOLDOWNS_WITH_VARIABLE_CDR } from "../../utils";

type RosterKind = 'healers' | 'raid';

export default function RosterEditor(props: {
    mode: 'healers' | 'split',
    entryMode: 'edit' | 'note',
    roster: RosterMember[],
    disabled: boolean,
    setRoster: (val: RosterMember[]) => void,
}) {
    const { roster, mode, entryMode, setRoster, disabled } = props;
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
                            key={member.playerId}
                            kind={'healers'}
                            i={i}
                            entryMode={entryMode}
                            disabled={disabled}
                            roster={healers}
                            setRoster={(e) => {
                                setRoster([...e, ...raiders]);
                            }}
                            member={member} />
                    ))}
                    <div className="scroll-padder" />
                </div>
            )}
            {(mode === 'split') && (
                <div>
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
                            kind={'raid'}
                            i={i}
                            entryMode={entryMode}
                            disabled={disabled}
                            roster={raiders}
                            setRoster={(e) => {
                                setRoster([...healers, ...e]);
                            }}
                            member={member} />
                    ))}
                    <div className="scroll-padder" />
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
                    { name: `${defaultName} ${suffix}`, playerId: webUuid(), ...specProperties, cdOverrides: {}, cdTracking: {} },
                    ...roster
                ])
            }}
            render={(s) => <div className="class-text" style={{ color: CLASS_COLORS[s.class] }}>{s.display}</div>}
        />
    );
}

const RosterMemberEditor = (props: {
    kind: RosterKind,
    disabled: boolean,
    entryMode: 'edit' | 'note',
    i: number,
    roster: RosterMember[],
    member: RosterMember,
    setRoster: (val: RosterMember[]) => void,
}) => {
    const { disabled, i, member, roster, entryMode, kind, setRoster } = props;
    const [value, setValue] = useState(member.name);
    const cds = useMemo(() => {
        // return cooldownsBySpec(member as SpecMatchesClass).sort((a, b) => {
        //     if (COOLDOWNS_WITH_VARIABLE_CDR.includes(a.ability)) {
        //         return -1;
        //     }
        //     if (COOLDOWNS_WITH_VARIABLE_CDR.includes(b.ability)) {
        //         return 1;
        //     }
        //     return 0;
        // })
        return cooldownsBySpec(member as SpecMatchesClass).sort((a, b) => b.duration - a.duration);
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
            <div className="player-text-wrapper">
                {kind === 'healers' && (
                    <img src={`/${member.spec.toLowerCase()}_${member.class.toLowerCase()}.png`} />
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
        </div>
        {/* {entryMode === 'note' && ( */}
        <div className="roster-member--cds">
            {cds.map(cd => {
                return (
                    <div className="roster-member--cd">
                        <input
                            type='checkbox'
                            defaultChecked={member.cdTracking[cd.spellId] ?? true}
                            onClick={(e) => {
                                const current = (member.cdTracking[cd.spellId] ?? true);
                                console.log('was:', current, 'changing to:', !current)
                                setRoster([...roster.slice(0, i), { ...roster[i], cdTracking: { ...member.cdTracking, [cd.spellId]: !current } }, ...roster.slice(i + 1)])
                            }}
                        />
                        <DraggableAbilityIcon
                            key={cd.spellId}
                            spell={cd}
                            playerId={member.playerId}
                            playerClass={member.class}
                        />
                        {COOLDOWNS_WITH_VARIABLE_CDR.includes(cd.ability) && (
                            <div className="override-cd-editor">
                                <label>CD</label>
                                <TimeInput
                                    placeholder={displaySec(cd.cooldown, false)}
                                    defaultValue={displaySec(member.cdOverrides[cd.spellId] ?? cd.cooldown, false)}
                                    onBlur={(e) => {
                                        setValue(e);
                                        setRoster([...roster.slice(0, i), { ...roster[i], cdOverrides: { ...member.cdOverrides, [cd.spellId]: toSec(e) } }, ...roster.slice(i + 1)])
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
        {/* )} */}
    </div>
};

export type DraggableSpell = {
    type: 'NEW' | 'EXISTING',
    castId: string;
    spellId: number;
    playerClass: Class;
    playerId: string;
    duration: number;
}
const DraggableAbilityIcon = (props: {
    spell: Cooldown<Class>,
    playerId: string,
    playerClass: Class,
}) => {
    const { spell, playerId, playerClass } = props;
    const [hideTooltip, setHideTooltip] = useState(false);

    const dragId = useMemo(() => {
        return webUuid();
    }, [])

    const dragData = (): DraggableSpell => ({
        type: 'NEW',
        spellId: spell.spellId,
        duration: spell.duration,
        playerClass,
        playerId,
        castId: webUuid(),
    });

    const { attributes, listeners, setNodeRef } = useDraggable({
        id: dragId,
        data: dragData()
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                width: `${6 * spell.duration}px`,
                background: CLASS_COLORS[playerClass],
            }}
            className='raid-cds-grid--cast'
            {...listeners}
        >
            <a
                onDragStart={(e) => {
                    setHideTooltip(true);
                }}
                onDragEnd={(e) => {
                    setHideTooltip(false);
                }}
                style={{
                    pointerEvents: hideTooltip ? 'none' : 'all',
                    boxShadow: `0 0 0 1px ${CLASS_COLORS[playerClass]}`
                }}
                data-wh-icon-size="small"
                href={`https://www.wowhead.com/spell=${spell.spellId}`}
            />
        </div>
    )
};


const TimeInput = (props: { placeholder: string; defaultValue: string, onBlur: (newValue: string) => void }) => {
    const validTimeRegex = new RegExp(/^([\d]+:[\d]{2})$/);
    return <RegexValidatedInput regex={validTimeRegex} className={"short"} {...props} />;
}

const RegexValidatedInput = ({ regex, placeholder, defaultValue, className, onBlur }: { regex: RegExp; placeholder: string; className: string; defaultValue: string, onBlur: (newValue: string) => void }) => {
    return (
        <input
            className={`timing-editor ${className}`}
            placeholder={placeholder}
            defaultValue={defaultValue}
            onBlur={(e) => {
                const value = e.target.value.trim();
                const allowedText = regex.test(value) || value.length === 0;
                if (!allowedText) {
                    return;
                }
                onBlur(value);
            }} />
    );
};
