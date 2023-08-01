import Select from "./Select";
import styles from './Planner.module.scss'
import { CLASS_COLORS, SPECS_WITH_CDS, cooldownsBySpec } from "./constants";
import { RosterMember } from "./types";
import { Fragment } from "react";

export default function Roster(props: { roster: RosterMember[], setRoster: (val: RosterMember[]) => void }) {
    const { roster, setRoster } = props;

    return (
        <div>
            <h3>Roster</h3>
            <div className={styles['scroll-wrapper']}>
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
                    <Fragment key={member.playerId}>
                        <div >
                            <input className={`${styles['player-text']} ${styles['player-name-editor']}`} style={{ color: CLASS_COLORS[member.class] }} defaultValue={member.name} />
                            <button onClick={() => {
                                setRoster([...roster.slice(0, i), ...roster.slice(i + 1)])
                            }}>clear</button>
                        </div>
                        <div>
                            {cooldownsBySpec(member).map((cd) => (
                                <a key={cd.spellId} suppressHydrationWarning={true} data-wh-icon-size="medium" href={`https://www.wowhead.com/spell=${cd.spellId}`}></a>
                            ))}
                        </div>
                    </Fragment>
                ))}
            </div>
        </div>
    )
}
