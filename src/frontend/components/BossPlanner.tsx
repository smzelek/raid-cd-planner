// import Select from "./Select/Select";
// import { BOSSES, BOSS_ABILITIES, BOSS_PHASES, BossAbility, BossPlan } from "../constants";
// import React, { Fragment, useEffect, useState } from "react";

// export default function BossPlanner(props: {
//     bossPlan: BossPlan,
//     setBossPlan: (val: BossPlan) => void,
// }) {
//     const { bossPlan, setBossPlan } = props;

//     return (<div className="flex-scroll-wrapper boss">
//         <h3 className="title-bar">
//             Boss
//         </h3>
//         <div className="scroll-wrapper">
//             < div className="boss-select">
//                 < Select
//                     width={'185px'}
//                     value={bossPlan.boss}
//                     options={BOSSES}
//                     clearable={false}
//                     onChange={(s) => {
//                         setBossPlan({
//                             boss: s!,
//                             timeline: BOSS_PHASES[s!],
//                         });
//                     }
//                     }
//                 />
//             </div >
//             {
//                 bossPlan.timeline.enrage && (<div className="boss-enrage">
//                     Enrage
//                     <TimeInput value={bossPlan.timeline.enrage} placeholder="5: 55" onChange={(val) => {
//                         const newPlan: BossPlan = { ...bossPlan };
//                         newPlan.timeline.enrage = val;
//                         setBossPlan(newPlan)
//                     }} />
//                 </div >)}
//             {
//                 Object.keys(bossPlan.timeline.phases).length > 1 && Object.entries(bossPlan.timeline.phases).map(([phaseName, phase], phaseNum) => (
//                     <Fragment key={phaseName}>
//                         <h4 className="phase-header">{phaseName}</h4>
//                         <div className="phase-wrapper">
//                             {phaseNum > 0 && (
//                                 <>
//                                     <span>Starts: </span>
//                                     <TimeInput value={phase.start} placeholder="5:55" onChange={(val) => {
//                                         const newPlan: BossPlan = { ...bossPlan };
//                                         newPlan.timeline.phases[phaseName].start = val;
//                                         setBossPlan(newPlan)
//                                     }} />
//                                 </>
//                             )}
//                             {Object.entries(phase.abilities).map(([abilityName, times], i) => {
//                                 const ability = BOSS_ABILITIES[bossPlan.boss].find(a => a.ability === abilityName)!;
//                                 return (
//                                     <Fragment key={ability.spellId} >
//                                         <BossAbilityEditor ability={ability} abilityPlan={times} onChange={(val) => {
//                                             const newPlan: BossPlan = { ...bossPlan };
//                                             newPlan.timeline.phases[phaseName].abilities[abilityName] = val;
//                                             setBossPlan(newPlan)
//                                         }} />
//                                     </Fragment>
//                                 );
//                             })}
//                         </div>
//                     </Fragment>
//                 ))
//             }
//             {
//                 Object.keys(bossPlan.timeline.phases).length === 1 && Object.entries(bossPlan.timeline.phases).map(([phaseName, phase], phaseNum) => (
//                     <Fragment key={phaseName}>
//                         <div className="phase-wrapper">
//                             {Object.entries(phase.abilities).map(([abilityName, times], i) => {
//                                 const ability = BOSS_ABILITIES[bossPlan.boss].find(a => a.ability === abilityName)!;
//                                 return (
//                                     <Fragment key={ability.spellId} >
//                                         <BossAbilityEditor ability={ability} abilityPlan={times} onChange={(val) => {
//                                             const newPlan: BossPlan = { ...bossPlan };
//                                             newPlan.timeline.phases[phaseName].abilities[abilityName] = val;
//                                             setBossPlan(newPlan)
//                                         }} />
//                                     </Fragment>
//                                 );
//                             })}
//                         </div>
//                     </Fragment>
//                 ))
//             }
//         </div >
//     </div >)
// }


// const BossAbilityEditor = ({ ability, abilityPlan, onChange }: { ability: BossAbility, abilityPlan: string, onChange: (newPlan: string) => void }) => {
//     return (
//         <div className="boss-ability-editor" >
//             <div className="ability-label">
//                 <a data-wh-icon-size="small" href={`https://www.wowhead.com/spell=${ability.spellId}`}></a>
//                 <span className="ability-name">{ability.ability}</span>
//             </div>
//             <TimelineInput placeholder="0:00 4:10 ..." value={abilityPlan} onChange={onChange} />
//         </div>
//     );
// }

// const TimelineInput = (props: { placeholder: string; value: string, onChange: (newValue: string) => void }) => {
//     const validTimesRegex = new RegExp(/^(([\d]+:[\d]{2})(\s|$))+$/);
//     return <RegexValidatedInput regex={validTimesRegex} className={"long"} {...props} />;
// }
