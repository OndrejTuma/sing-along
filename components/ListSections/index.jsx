import {DndProvider} from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';

import Section from '../Section';

import useGlobalMap from '../../hooks/useGlobalMap';

import styles from './styles.scss';

function ListSections({sections, onDrop}) {
    const [songs] = useGlobalMap('songs');

    return (
        <DndProvider backend={HTML5Backend}>
            <h3>Sekce v repertoáru</h3>
            <p><small>*tip: Můžete měnit pořadí sekcí tažením myši</small></p>
            <ul className={styles.wrapper}>
                {sections && sections.length > 0 ? sections.map(section => (
                    <li key={section._id}>
                        <Section
                            section={section}
                            songs={section.songs.map(id => songs.get(id))}
                            onDrop={onDrop}
                        />
                    </li>
                )) : (
                    <li><i>zatím žádné nejsou</i></li>
                )}
            </ul>
        </DndProvider>
    )
}

export default ListSections;