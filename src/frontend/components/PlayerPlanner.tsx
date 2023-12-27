import Select from "./Select/Select";
import { CLASS_COLORS, Class, Cooldown, RaidCDErrors, SPECS_WITH_CDS, UserPlayerPlan, cooldownsBySpec } from "../constants";
import { toSec, webUuid } from "../utils";
import React, { useState } from "react";

export default function PlayerPlanner(props: {
    playerPlan: UserPlayerPlan,
    setPlayerPlan: (val: UserPlayerPlan) => void,
}) {
    const { playerPlan, setPlayerPlan } = props;
    const [plannedAbilityUseErrors, setPlannedAbilityUseErrors] = useState<RaidCDErrors>({});

    const validTimesRegex = new RegExp(/^(([\d]+:[\d]{2})(\s|$))+$/);


    return (
        <div className="flex-scroll-wrapper roster">
            <h3 className="title-bar">
                Players
            </h3>
            <div className="scroll-wrapper roster-box">
                <div style={{ marginBottom: '10px' }}>
                    <Select
                        width={'185px'}
                        value={undefined}
                        options={SPECS_WITH_CDS}
                        clearable={false}
                        onChange={(s) => {
                            const defaultName = `${s!.display}`;
                            const currentCount = playerPlan.roster.filter(r => r.name.startsWith(defaultName)).length;
                            const suffix = currentCount === 0 ? 1 : currentCount + 1;
                            const { display, ...specProperties } = s!;

                            setPlayerPlan({
                                ...playerPlan,
                                roster: [
                                    { name: `${defaultName} ${suffix}`, playerId: webUuid(), ...specProperties },
                                    ...playerPlan.roster
                                ]
                            })
                        }}
                        render={(s) => <div className="class-text" style={{ color: CLASS_COLORS[s.class] }}>{s.display}</div>}
                    />
                </div>
                {playerPlan.roster.map((member, i) => (
                    <div key={member.playerId} className="roster-member">
                        <div >
                            <input className="player-text player-name-editor"
                                style={{ color: CLASS_COLORS[member.class] }}
                                value={member.name}
                                onChange={(e) => {
                                    setPlayerPlan({
                                        ...playerPlan,
                                        roster: [...playerPlan.roster.slice(0, i), { ...playerPlan.roster[i], name: e.target.value }, ...playerPlan.roster.slice(i + 1)]
                                    })
                                }} />
                            <button onClick={() => {
                                setPlayerPlan({
                                    ...playerPlan,
                                    roster: [...playerPlan.roster.slice(0, i), ...playerPlan.roster.slice(i + 1)]
                                });
                            }}>X</button>
                        </div>
                        <div className="cooldown-section">
                            {cooldownsBySpec(member).map((cd) => (
                                <div key={cd.spellId} className="cooldown-editor">
                                    <a className="cooldown-icon" data-wh-icon-size="medium" href={`https://www.wowhead.com/spell=${cd.spellId}`}></a>
                                    <input
                                        className="timing-editor cooldown-timeline"
                                        placeholder="0:00 4:10 ..."
                                        value={playerPlan.rawPlannedAbilityUses?.[member.playerId]?.[cd.ability] || ''}
                                        onChange={(e) => {
                                            setPlayerPlan({
                                                ...playerPlan,
                                                rawPlannedAbilityUses: {
                                                    ...playerPlan.rawPlannedAbilityUses,
                                                    [member.playerId]: {
                                                        ...playerPlan.rawPlannedAbilityUses[member.playerId],
                                                        [cd.ability]: e.target.value
                                                    }
                                                }
                                            })

                                            const value = e.target.value.trim();
                                            const allowedText = validTimesRegex.test(value) || value.length === 0;
                                            if (!allowedText) {
                                                return;
                                            }

                                            const cds = value.split(' ')
                                            if (validCds(cd, cds, Number(playerPlan.abilityCooldownOverrides?.[member.playerId]?.[cd.ability]))) {
                                                setPlayerPlan({
                                                    ...playerPlan,
                                                    plannedAbilityUses: {
                                                        ...playerPlan.plannedAbilityUses,
                                                        [member.playerId]: {
                                                            ...playerPlan.plannedAbilityUses[member.playerId],
                                                            [cd.ability]: e.target.value
                                                        }
                                                    },
                                                    rawPlannedAbilityUses: {
                                                        ...playerPlan.rawPlannedAbilityUses,
                                                        [member.playerId]: {
                                                            ...playerPlan.rawPlannedAbilityUses[member.playerId],
                                                            [cd.ability]: e.target.value
                                                        }
                                                    }
                                                })
                                                setPlannedAbilityUseErrors({
                                                    ...plannedAbilityUseErrors,
                                                    [member.playerId]: {
                                                        ...plannedAbilityUseErrors[member.playerId],
                                                        [cd.ability]: ''
                                                    }
                                                })
                                            } else {
                                                setPlannedAbilityUseErrors({
                                                    ...plannedAbilityUseErrors,
                                                    [member.playerId]: {
                                                        ...plannedAbilityUseErrors[member.playerId],
                                                        [cd.ability]: 'Invalid use of CDs.'
                                                    }
                                                })
                                            }
                                        }} />
                                    <div className="cooldown-overrides">
                                        <input
                                            className="override-cd-editor"
                                            placeholder="set cooldown"
                                            value={playerPlan.abilityCooldownOverrides?.[member.playerId]?.[cd.ability] || ''}
                                            onChange={(e) => {
                                                setPlayerPlan({
                                                    ...playerPlan,
                                                    abilityCooldownOverrides: {
                                                        ...playerPlan.abilityCooldownOverrides,
                                                        [member.playerId]: {
                                                            ...playerPlan.abilityCooldownOverrides[member.playerId],
                                                            [cd.ability]: e.target.value.trim()
                                                        }
                                                    }
                                                })
                                            }} />
                                        <input
                                            className="override-dur-editor"
                                            placeholder="set duration"
                                            value={playerPlan.abilityDurationOverrides?.[member.playerId]?.[cd.ability] || ''}
                                            onChange={(e) => {
                                                setPlayerPlan({
                                                    ...playerPlan,
                                                    abilityDurationOverrides: {
                                                        ...playerPlan.abilityDurationOverrides,
                                                        [member.playerId]: {
                                                            ...playerPlan.abilityDurationOverrides[member.playerId],
                                                            [cd.ability]: e.target.value.trim()
                                                        }
                                                    }
                                                })
                                            }} />
                                    </div>
                                    <span className="cooldown-errors"> {plannedAbilityUseErrors?.[member.playerId]?.[cd.ability]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div >
    )
}
