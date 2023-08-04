import styles from './Planner.module.scss'
import { CLASS_COLORS, SPECS_WITH_CDS, cooldownsBySpec } from "../constants";
import { RosterMember, SpecChoices } from "../types";
import { cooldownTimeDisplay } from "../utils";

export default function CheatSheet(props: { roster: RosterMember[] }) {
    const { roster } = props;

    const rosterHasSpec = (c: SpecChoices) => roster.some(r => r.class === c.class && (r.spec === c.spec || c.spec === "ALL"))
    const haveSpecs = SPECS_WITH_CDS.filter(s => rosterHasSpec(s))
    const missingSpecs = SPECS_WITH_CDS.filter(s => !rosterHasSpec(s))

    return (
        <div className={styles['flex-scroll-wrapper']}>
            <h3 className={styles['title-bar']}>Raid CD Cheat Sheet</h3>
            <div className={`${styles['scroll-wrapper']} ${styles['module-box']} ${styles['cheat-sheets']}`}>
                {missingSpecs.length > 0 ? (<div>
                    {missingSpecs.map(c => {
                        return (<div key={c.display}>
                            <h4 style={{ color: CLASS_COLORS[c.class] }}>{c.display}</h4>
                            {cooldownsBySpec(c).map((cd) => (
                                <div key={cd.spellId} >
                                    <a href={`https://www.wowhead.com/spell=${cd.spellId}`}>{cd.ability} ({cooldownTimeDisplay(cd.cooldown)})</a>
                                </div>
                            ))}
                        </div>)
                    })}
                </div>) : <></>}
                <div>
                    {haveSpecs.map(c => {
                        return (<div key={c.display}>
                            <h4 style={{ color: CLASS_COLORS[c.class] }}>{c.display}</h4>
                            {cooldownsBySpec(c).map((cd) => (
                                <div key={cd.spellId} >
                                    ✅<a style={{ textDecoration: 'line-through', color: 'gray' }} href={`https://www.wowhead.com/spell=${cd.spellId}`}>{cd.ability} ({cooldownTimeDisplay(cd.cooldown)})</a>
                                </div>
                            ))}
                        </div>)
                    })}
                </div>
            </div>
        </div>
    )
}
