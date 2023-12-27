import { JSX, useEffect, useMemo, useState } from 'react'
import { Encounter } from '../../types';

export const PlanSelection = ({ bosses, createPlanForBoss }: { bosses: Encounter[], createPlanForBoss: (_: number) => void }): JSX.Element => {
    // const { setNodeRef } = useDraggable({
    //     id: 'draggable',
        // data: {
        //     type: 'NEW_CAST',
        //     castId: uuid(),
        //     playerId: playerId,
        //     duration: spell.duration,
        //     spellId: spell.spellId
        // },
    // });

    // useDndMonitor({
    //     onDragStart(event) {
    //         console.log('onDragStart', event)
    //     },
    // });

    return (
        <div id='plan-selection'>
            <h2>Bosses</h2>
            {/* <Draggable /> */}
            <div className='plan-selection--bosses'>
                {bosses.map(b =>
                    <div key={b.id} className='boss-row'>
                        <div className='boss-row--bg boss-row--bg__left'>
                            <h4>
                                {b.name}
                            </h4>
                        </div>
                        <div className='boss-row--bg boss-row--bg__right'>
                            <div className="new-note-btn">
                                <ion-icon
                                    onClick={() => createPlanForBoss(b.id)}
                                    name="add-circle"
                                    style={{ fontSize: '28px', color: '#92f192' }}
                                />
                            </div>
                        </div>
                        {/* <div>
                            {new Array(Math.ceil(Math.random() * 3)).fill(null).map(x =>
                                <span className='existing'>
                                    <ion-icon name="document-text" style={{ fontSize: '36px', color: '#e3cca1' }}/>
                                    existing note
                                </span>
                            )}
                        </div> */}
                    </div>
                )}
            </div>
            {/* <Droppable /> */}
        </div>
    )
};

// import { useDroppable } from '@dnd-kit/core';

// const [list, setList] = useState<string[]>([]);

// function Droppable(props: any) {


//     useEffect(() => {
//         return () => {
//             console.log('Unmounted Droppable.');
//         }
//     }, []);
//     const style = {
//         color: isOver ? 'green' : undefined,
//     };


//     return (
//         <div ref={setNodeRef} style={style}>
//             i can be dropped here
//             {list}
//         </div>
//     );
// }

// import { useDraggable } from '@dnd-kit/core';
// import { uuid } from '../../utils';

// function Draggable(props: any) {
//     // const id = useMemo(() => uuid(), []);

//     const style = transform ? {
//         transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
//     } : undefined;

//     useEffect(() => {
//         return () => {
//             console.log('Unmounted Draggable.');
//         }
//     }, []);

//     return (
//         <div ref={setNodeRef} {...listeners} {...attributes}>
//             <button style={style} >
//                 {props.children}
//                 me
//             </button>
//         </div>
//     );
// }
