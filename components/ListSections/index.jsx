import React, {useState} from 'react';

import Section from '../Section';

import useGlobalMap from '../../hooks/useGlobalMap';

import styles from './styles.scss';

function ListSections({sections, onDrop}) {
    const [songs] = useGlobalMap('songs');
    const [dragSectionId, setDragSectionId] = useState('');

    return (
        <>
            <h3>Sekce v repertoáru</h3>
            <p><small>*tip: Můžete měnit pořadí sekcí tažením myši</small></p>
            <ul className={styles.wrapper}>
                {sections && sections.length > 0 ? sections.map(section => (
                    <li key={section._id}
                        draggable
                        onDragStart={() => setDragSectionId(section._id)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => typeof onDrop === 'function' && onDrop(dragSectionId, section._id)}
                    >
                        <Section section={section} songs={section.songs.map(id => songs.get(id))}/>
                    </li>
                )) : (
                    <li><i>zatím žádné nejsou</i></li>
                )}
            </ul>
        </>
    )
}

export default ListSections;