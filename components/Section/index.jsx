import React, {useState} from 'react';
import classNames from 'classnames';
import {useDrag, useDrop} from 'react-dnd-cjs';

import BinSVG from 'Svg/bin.svg';

import {deleteSection as deleteSectionAPI} from 'Api/client';
import dragTypes from 'Consts/dragTypes';
import {inflectString} from 'Helpers/strings';
import useGlobalMap from 'Hooks/useGlobalMap';

import styles from './styles.scss';

function Section({onDrop, section, songs}) {
    const [isOpen, setIsOpen] = useState(false);
    const [, setNotification] = useGlobalMap('notifications');
    const [, , deleteSection] = useGlobalMap('sections');
    const [{opacity}, dragRef] = useDrag({
        item: {
            type: dragTypes.SECTION,
            id: section._id,
        },
        collect: monitor => ({
            opacity: monitor.isDragging() ? 0.5 : 1,
        }),
    });
    const [{isOver}, dropRef] = useDrop({
        accept: dragTypes.SECTION,
        drop: ({id: fromId}) => typeof onDrop === 'function' && onDrop(fromId, section._id),
        collect: monitor => ({
            isOver: !!monitor.isOver(),
        }),
    });

    async function handleDeleteSection() {
        if (!confirm(`Opravdu smazat sekci "${section.title}"?`)) {
            return;
        }

        try {
            await deleteSectionAPI(section._id);

            deleteSection(section._id);
        } catch (e) {
            setNotification(e.message, 'error');
        }
    }

    return (
        <div className={styles.wrapper} ref={dropRef} style={{opacity}}>
            <h4 ref={dragRef} onClick={() => setIsOpen(!isOpen)} className={classNames(styles.heading, {
                [styles.dragOver]: isOver,
            })}>
                {section.title}
                <small> ({songs.length} {inflectString(songs.length, ['písnička', 'písničky', 'písniček'])})</small>
            </h4>
            {isOpen && (
                <ul>
                    {songs.map(({_id: id, title}) => (
                        <li key={id}>{title}</li>
                    ))}
                </ul>
            )}
            <BinSVG className={styles.removeIcon} onClick={handleDeleteSection}/>
        </div>
    )
}

export default Section;