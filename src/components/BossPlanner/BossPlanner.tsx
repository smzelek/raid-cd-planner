import Select from "../Select/Select";
import styles from '@/styles/Global.module.scss'
import { BOSSES, BOSS_ABILITIES, } from "@/constants";
import { UserBossPlan, Bosses, } from "@/types";

import DummyIcon from "../DummyIcon/DummyIcon";

export default function BossPlanner(props: {
    bossPlan: UserBossPlan,
    setBossPlan: (val: UserBossPlan) => void,
}) {
    const { bossPlan, setBossPlan } = props;

    const validTimesRegex = new RegExp(/^(([\d]+:[\d]{2})(\s|$))+$/);
    return (<div className={`${styles['flex-scroll-wrapper']} ${styles['boss']}`}>
        <h3 className={styles['title-bar']}>
            Boss
        </h3>
        <div className={`${styles['scroll-wrapper']} ${styles['module-box']}`}>
            <div style={{ marginBottom: '10px' }}>
                <Select
                    width={'185px'}
                    value={'Rashok' as Bosses}
                    options={BOSSES}
                    clearable={false}
                    onChange={(s) => {
                        setBossPlan({
                            ...bossPlan,
                            boss: s!
                        })
                    }}
                />
            </div>
            {BOSS_ABILITIES[bossPlan.boss].map((ability, i) => (<div key={i} className={styles['boss-ability-editor']} >
                <div className={styles['ability-icon']}>
                    {ability.spellId ? (
                        <a data-wh-icon-size="medium" href={`https://www.wowhead.com/spell=${ability.spellId}`}></a>
                    ) : (
                        <DummyIcon sizeClass="iconmedium" />
                    )}
                </div>
                <span className={styles['ability-name']}>
                    {ability.ability}
                </span>
                <input
                    className={styles['timing-editor']}
                    placeholder="0:00 4:10 ..."
                    value={bossPlan.rawPlannedAbilityUses?.[ability.ability] || ''}
                    onChange={(e) => {
                        setBossPlan({
                            ...bossPlan,
                            rawPlannedAbilityUses: {
                                ...bossPlan.rawPlannedAbilityUses,
                                [ability.ability]: e.target.value
                            }
                        });

                        const value = e.target.value.trim();
                        const allowedText = validTimesRegex.test(value) || value.length === 0;
                        if (!allowedText) {
                            return;
                        }

                        setBossPlan({
                            ...bossPlan,
                            plannedAbilityUses: {
                                ...bossPlan.plannedAbilityUses,
                                [ability.ability]: e.target.value
                            },
                            rawPlannedAbilityUses: {
                                ...bossPlan.rawPlannedAbilityUses,
                                [ability.ability]: e.target.value
                            }
                        })
                    }} />
            </div>))}
        </div>
    </div>)
}
