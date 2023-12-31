import styles from '@/styles/Global.module.scss'
import { CLASS_COLORS, RosterMember, SPECS_WITH_CDS, SpecChoices, cooldownsBySpec } from "@/constants";
import { cooldownTimeDisplay } from "@/utils";
import { useEffect, useState } from 'react';

export default function CheatSheet(props: { roster: RosterMember[] }) {
    const { roster } = props;

    const [collapsed, setCollapsed] = useState(true);

    useEffect(() => {
        (window as any)?.WH?.Tooltips && !collapsed && (window as any).WH.Tooltips.refreshLinks()
    }, [collapsed])

    const rosterHasSpec = (c: SpecChoices) => roster.some(r => r.class === c.class && (r.spec === c.spec || c.spec === "ALL"))
    const haveSpecs = SPECS_WITH_CDS.filter(s => rosterHasSpec(s))
    const missingSpecs = SPECS_WITH_CDS.filter(s => !rosterHasSpec(s))

    return (
        <div className={`${styles['flex-scroll-wrapper']} ${styles['cheat-sheet']}`}>
            <h3 onClick={() => {
                setCollapsed(!collapsed);
            }} className={styles['title-bar']}>Raid CD Cheat Sheet {collapsed ? '▲' : '▼'}</h3>
            {!collapsed && (<div className={`${styles['scroll-wrapper']} ${styles['cheat-sheet-box']}`}>
                {missingSpecs.length > 0 ? (<div>
                    {missingSpecs.map(c => {
                        return (<div key={c.display} className={styles['class-row']}>
                            <h4 style={{ color: CLASS_COLORS[c.class] }}>{c.display}</h4>
                            {cooldownsBySpec(c).map((cd) => (
                                <div key={cd.spellId} >
                                    <a href={`https://www.wowhead.com/spell=${cd.spellId}`}></a>{cd.ability} ({cooldownTimeDisplay(cd.cooldown)})
                                </div>
                            ))}
                        </div>)
                    })}
                </div>) : <></>}
                <div>
                    {haveSpecs.map(c => {
                        return (<div key={c.display} className={styles['class-row']}>
                            <h4 style={{ color: CLASS_COLORS[c.class] }}>{c.display}</h4>
                            {cooldownsBySpec(c).map((cd) => (
                                <div key={cd.spellId} >
                                    ✅<a style={{ textDecoration: 'line-through', color: 'gray' }} href={`https://www.wowhead.com/spell=${cd.spellId}`}></a>{cd.ability} ({cooldownTimeDisplay(cd.cooldown)})
                                </div>
                            ))}
                        </div>)
                    })}
                </div>
            </div>)}
        </div>
    )
}
