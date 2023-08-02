import Select from "./Select";
import styles from './Planner.module.scss'
import { CLASS_COLORS, SPECS_WITH_CDS, cooldownsBySpec } from "./constants";
import { Class, Cooldown, PlayerTimeline, PlayerTimelineInput, RosterMember } from "./types";
import { useEffect, useState } from "react";
import { timelineTimeDisplay, toSec } from "./utils";

type RaidCDEntry = Record<string, Record<string, string>>;
type RaidCDCooldownOverrides = Record<string, Record<string, string>>;
type RaidCDDurationOverrides = Record<string, Record<string, string>>;
type RaidCDErrors = Record<string, Record<string, string>>;
type SavedProfile = {
    roster: RosterMember[];
    raidTimelineEditors: RaidCDEntry;
    raidCDCooldownOverrides: RaidCDCooldownOverrides;
    raidCDDurationOverrides: RaidCDDurationOverrides;
}

export default function Roster(props: {
    roster: RosterMember[],
    setRoster: (val: RosterMember[]) => void,
    raidCDTimeline: PlayerTimeline,
    setRaidCDTimeline: (val: PlayerTimelineInput) => void,
}) {
    const { roster, setRoster, raidCDTimeline, setRaidCDTimeline } = props;
    const [raidCDCooldownOverrides, setRaidCDCooldownOverrides] = useState<RaidCDCooldownOverrides>({});
    const [raidCDDurationOverrides, setRaidCDDurationOverrides] = useState<RaidCDDurationOverrides>({});
    const [raidTimelineEditors, setRaidTimelineEditors] = useState<RaidCDEntry>({});
    const [rawRaidTimelineEditors, setRawRaidTimelineEditors] = useState<RaidCDEntry>({});
    const [raidTimelineEditorErrors, setRaidTimelineEditorsErrors] = useState<RaidCDErrors>({});

    useEffect(() => {
        const raidTimeline: PlayerTimelineInput = roster.map(r => cooldownsBySpec(r).map(cd => {
            const times = (raidTimelineEditors?.[r.playerId]?.[cd.ability]);
            return {
                ability: cd.ability,
                times: times ? times.trim().split(' ') : [],
                cooldownOverride: Number(raidCDCooldownOverrides?.[r.playerId]?.[cd.ability]) || undefined,
                durationOverride: Number(raidCDDurationOverrides?.[r.playerId]?.[cd.ability]) || undefined,
                playerId: r.playerId
            }
        })).flat(1);

        setRaidCDTimeline(raidTimeline);
    }, [roster, raidTimelineEditors, raidCDCooldownOverrides, raidCDDurationOverrides, setRaidCDTimeline])

    const validTimesRegex = new RegExp(/^(([\d]+:[\d]{2})(\s|$))+$/);
    const validCds = (cd: Cooldown<Class>, times: string[], cooldownOverride: number) => {
        const timesSec = times.map(toSec);
        return timesSec.every((t, i) => {
            if (i === 0) {
                return true;
            }
            return timesSec[i - 1] + (cooldownOverride || cd.cooldown) <= t
        })
    }
    const exportNote = () => {
        const note = raidCDTimeline.map(evt => `{time:${timelineTimeDisplay(evt.time)}} ${evt.name} ${evt.ability}`).join('\n')
        navigator.clipboard.writeText(note);
    }

    const exportToSavedString = () => {
        const saveObj: SavedProfile = {
            roster,
            raidTimelineEditors,
            raidCDCooldownOverrides,
            raidCDDurationOverrides,
        }
        const encoded = btoa(JSON.stringify(saveObj))
        navigator.clipboard.writeText(encoded);

    }

    const importFromSavedString = () => {
        const saveStr = prompt('Paste saved profile here');
        if (!saveStr) {
            return;
        }
        const saveObj: SavedProfile = JSON.parse(atob(saveStr));
        setRoster(saveObj.roster)
        setRaidTimelineEditors(saveObj.raidTimelineEditors)
        setRawRaidTimelineEditors(saveObj.raidTimelineEditors)
        setRaidCDCooldownOverrides(saveObj.raidCDCooldownOverrides)
        setRaidCDDurationOverrides(saveObj.raidCDDurationOverrides)
    }

    return (
        <div className={`${styles['flex-scroll-wrapper']} ${styles['roster']}`}>
            <h3 className={styles['title-bar']}>
                Raid Roster
                <div>
                    <button onClick={exportNote}>Export to ERT</button>
                    <button onClick={exportToSavedString}>Export to Saved Profile</button>
                    <button onClick={importFromSavedString}>Import from Saved Profile</button>
                </div>
            </h3>
            <div className={`${styles['scroll-wrapper']} ${styles['module-box']}`}>
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

                            setRoster([{ ...s!, name: `${defaultName} ${suffix}`, playerId: crypto.randomUUID() }, ...roster])
                        }}
                        render={(s) => <div className={styles['class-text']} style={{ color: CLASS_COLORS[s.class] }}>{s.display}</div>}
                    />
                </div>
                {roster.map((member, i) => (
                    <div key={member.playerId} className={styles['roster-member']}>
                        <div >
                            <input className={`${styles['player-text']} 
                            ${styles['player-name-editor']}`}
                                style={{ color: CLASS_COLORS[member.class] }}
                                value={member.name}
                                onChange={(e) => {
                                    setRoster([...roster.slice(0, i), { ...roster[i], name: e.target.value }, ...roster.slice(i + 1)])
                                }} />
                            <button onClick={() => {
                                setRoster([...roster.slice(0, i), ...roster.slice(i + 1)])
                            }}>remove</button>
                        </div>
                        <div className={styles['cooldown-section']}>
                            {cooldownsBySpec(member).map((cd) => (
                                <div key={cd.spellId} className={styles['cooldown-editor']}>
                                    <a suppressHydrationWarning={true} data-wh-icon-size="medium" href={`https://www.wowhead.com/spell=${cd.spellId}`}></a>
                                    <input
                                        className={styles['timing-editor']}
                                        placeholder="0:00 4:10 ..."
                                        value={rawRaidTimelineEditors?.[member.playerId]?.[cd.ability] || ''}
                                        onChange={(e) => {
                                            setRawRaidTimelineEditors({
                                                ...rawRaidTimelineEditors,
                                                [member.playerId]: {
                                                    ...rawRaidTimelineEditors[member.playerId],
                                                    [cd.ability]: e.target.value
                                                }
                                            })

                                            const value = e.target.value.trim();
                                            const allowedText = validTimesRegex.test(value) || value.length === 0;
                                            if (!allowedText) {
                                                return;
                                            }

                                            const cds = value.split(' ')
                                            if (validCds(cd, cds, Number(raidCDCooldownOverrides?.[member.playerId]?.[cd.ability]))) {
                                                setRaidTimelineEditors({
                                                    ...raidTimelineEditors,
                                                    [member.playerId]: {
                                                        ...raidTimelineEditors[member.playerId],
                                                        [cd.ability]: e.target.value
                                                    }
                                                })
                                                setRaidTimelineEditorsErrors({
                                                    ...raidTimelineEditorErrors,
                                                    [member.playerId]: {
                                                        ...raidTimelineEditorErrors[member.playerId],
                                                        [cd.ability]: ''
                                                    }
                                                })
                                            } else {
                                                setRaidTimelineEditorsErrors({
                                                    ...raidTimelineEditorErrors,
                                                    [member.playerId]: {
                                                        ...raidTimelineEditorErrors[member.playerId],
                                                        [cd.ability]: 'Invalid use of CDs.'
                                                    }
                                                })
                                            }
                                        }} />
                                    <input
                                        className={styles['override-cd-editor']}
                                        placeholder="set cooldown"
                                        value={raidCDCooldownOverrides?.[member.playerId]?.[cd.ability] || ''}
                                        onChange={(e) => {
                                            setRaidCDCooldownOverrides({
                                                ...raidCDCooldownOverrides,
                                                [member.playerId]: {
                                                    ...raidCDCooldownOverrides[member.playerId],
                                                    [cd.ability]: e.target.value.trim()
                                                }
                                            })
                                        }} />
                                    <input
                                        className={styles['override-dur-editor']}
                                        placeholder="set duration"
                                        value={raidCDDurationOverrides?.[member.playerId]?.[cd.ability] || ''}
                                        onChange={(e) => {
                                            setRaidCDDurationOverrides({
                                                ...raidCDDurationOverrides,
                                                [member.playerId]: {
                                                    ...raidCDDurationOverrides[member.playerId],
                                                    [cd.ability]: e.target.value.trim()
                                                }
                                            })
                                        }} />
                                    <span className={styles['cooldown-error']}>{raidTimelineEditorErrors?.[member.playerId]?.[cd.ability]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
