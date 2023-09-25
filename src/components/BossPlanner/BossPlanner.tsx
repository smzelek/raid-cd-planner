import Select from "../Select/Select";
import styles from '@/styles/Global.module.scss'
import { BOSSES, BOSS_ABILITIES, BOSS_PHASES, BossAbility, BossPlan } from "@/constants";
import { Fragment, useState } from "react";

export default function BossPlanner(props: {
    bossPlan: BossPlan,
    setBossPlan: (val: BossPlan) => void,
}) {
    const { bossPlan, setBossPlan } = props;

    return (<div className={`${styles['flex-scroll-wrapper']} ${styles['boss']}`}>
        <h3 className={styles['title-bar']}>
            Boss
        </h3>
        <div className={`${styles['scroll-wrapper']}`}>
            <div className={`${styles['boss-select']}`}>
                <Select
                    width={'185px'}
                    value={bossPlan.boss}
                    options={BOSSES}
                    clearable={false}
                    onChange={(s) => {
                        setBossPlan({
                            boss: s!,
                            timeline: BOSS_PHASES[s!],
                        });
                    }}
                />
            </div>
            {bossPlan.timeline.enrage && (<div className={`${styles['boss-enrage']}`}>
                Enrage
                <TimeInput value={bossPlan.timeline.enrage} placeholder="5:55" onChange={(val) => {
                    const newPlan: BossPlan = { ...bossPlan };
                    newPlan.timeline.enrage = val;
                    setBossPlan(newPlan)
                }} />
            </div>)}
            {Object.keys(bossPlan.timeline.phases).length > 1 && Object.entries(bossPlan.timeline.phases).map(([phaseName, phase], phaseNum) => (
                <Fragment key={phaseName}>
                    <h4 className={styles['phase-header']}>{phaseName}</h4>
                    <div className={styles['phase-wrapper']}>
                        {phaseNum > 0 && (
                            <>
                                <span>Starts: </span>
                                <TimeInput value={phase.start} placeholder="5:55" onChange={(val) => {
                                    const newPlan: BossPlan = { ...bossPlan };
                                    newPlan.timeline.phases[phaseName].start = val;
                                    setBossPlan(newPlan)
                                }} />
                            </>
                        )}
                        {Object.entries(phase.abilities).map(([abilityName, times], i) => {
                            const ability = BOSS_ABILITIES[bossPlan.boss].find(a => a.ability === abilityName)!;
                            return (
                                <Fragment key={ability.spellId} >
                                    <BossAbilityEditor ability={ability} abilityPlan={times} onChange={(val) => {
                                        const newPlan: BossPlan = { ...bossPlan };
                                        newPlan.timeline.phases[phaseName].abilities[abilityName] = val;
                                        setBossPlan(newPlan)
                                    }} />
                                </Fragment>
                            );
                        })}
                    </div>
                </Fragment>
            ))}
            {Object.keys(bossPlan.timeline.phases).length === 1 && Object.entries(bossPlan.timeline.phases).map(([phaseName, phase], phaseNum) => (
                <Fragment key={phaseName}>
                    <div className={styles['phase-wrapper']}>
                        {Object.entries(phase.abilities).map(([abilityName, times], i) => {
                            const ability = BOSS_ABILITIES[bossPlan.boss].find(a => a.ability === abilityName)!;
                            return (
                                <Fragment key={ability.spellId} >
                                    <BossAbilityEditor ability={ability} abilityPlan={times} onChange={(val) => {
                                        const newPlan: BossPlan = { ...bossPlan };
                                        newPlan.timeline.phases[phaseName].abilities[abilityName] = val;
                                        setBossPlan(newPlan)
                                    }} />
                                </Fragment>
                            );
                        })}
                    </div>
                </Fragment>
            ))}
        </div>
    </div>)
}


const BossAbilityEditor = ({ ability, abilityPlan, onChange }: { ability: BossAbility, abilityPlan: string, onChange: (newPlan: string) => void }) => {
    return (
        <div className={styles['boss-ability-editor']} >
            <div className={styles['ability-label']}>
                <a data-wh-icon-size="small" href={`https://www.wowhead.com/spell=${ability.spellId}`}></a>
                <span className={styles['ability-name']}>{ability.ability}</span>
            </div>
            <TimelineInput placeholder="0:00 4:10 ..." value={abilityPlan} onChange={onChange} />
        </div>
    );
}

const TimelineInput = (props: { placeholder: string; value: string, onChange: (newValue: string) => void }) => {
    const validTimesRegex = new RegExp(/^(([\d]+:[\d]{2})(\s|$))+$/);
    return <_RegexValidatedInput regex={validTimesRegex} className={"long"} {...props} />;
}

const TimeInput = (props: { placeholder: string; value: string, onChange: (newValue: string) => void }) => {
    const validTimeRegex = new RegExp(/^([\d]+:[\d]{2})$/);
    return <_RegexValidatedInput regex={validTimeRegex} className={"short"} {...props} />;
}

const _RegexValidatedInput = ({ regex, placeholder, value, className, onChange }: { regex: RegExp; placeholder: string; className: string; value: string, onChange: (newValue: string) => void }) => {
    const [_value, _setValue] = useState(value);

    return (
        <input
            className={`${styles['timing-editor']} ${styles[className]}`}
            placeholder={placeholder}
            value={_value}
            onChange={(e) => {
                _setValue(e.target.value);
                const value = e.target.value.trim();
                const allowedText = regex.test(value) || value.length === 0;
                if (!allowedText) {
                    return;
                }
                onChange(value);
            }} />
    );
};