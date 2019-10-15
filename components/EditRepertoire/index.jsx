import React, {useEffect} from 'react';
import {useGlobal} from 'reactn';
import classNames from 'classnames';

import ListSections from '../ListSections';
import PlusSVG from '../../static/svg/plus.svg';
import FormNewSection from '../FormNewSection';

import {ADD_SECTION} from '../../consts/visibility';
import useGlobalMap from '../../hooks/useGlobalMap';

import globalStyles from 'Sass/global.scss';
import styles from './styles.scss';

function EditRepertoire() {
    const [currentRepertoireId, setEditingRepertoireId] = useGlobal('editingRepertoireId');
    const [repertoires] = useGlobalMap('repertoires');
    const [sections, , , , setSections] = useGlobalMap('sections');
    const [visibility, addVisibility, removeVisibility] = useGlobalMap('visibility');

    const addSectionVisible = visibility.has(ADD_SECTION);

    const currentSections = [...sections.values()].filter(section => section.belongsTo === currentRepertoireId).sort(function(a, b){
        if(a.position < b.position) { return -1; }
        if(a.position > b.position) { return 1; }
        return 0;
    });

    function handleAddSectionVisibility(visibility) {
        visibility
            ? addVisibility(ADD_SECTION, true)
            : removeVisibility(ADD_SECTION);
    }
    function handleOnDrop(fromId, toId) {
        const from = {position: 0, index: -1};
        const to = {...from};

        currentSections.forEach(({_id: id, position}, index) => {
            id === fromId && Object.assign(from, {position, index});
            id === toId && Object.assign(to, {position, index});
        });

        if (from.index === to.index) {
            return;
        }

        const startIndex = from.index < to.index ? from.index : to.index;
        const endIndex = from.index < to.index ? to.index : from.index;

        const newSections = [];
        let isInRange = false;

        for (let i = 0; i < currentSections.length; i++) {
            isInRange = i >= startIndex && i <= endIndex;

            if (isInRange) {
                if (to.index < from.index && i === from.index) {
                    newSections.push({...currentSections[i], position: to.position});
                } else if (to.index > from.index && i === from.index) {
                    newSections.push({...currentSections[i], position: to.position});
                } else {
                    const swapSection = to.index < from.index ? currentSections[i + 1] : currentSections[i - 1];

                    newSections.push({...currentSections[i], position: swapSection.position})
                }
            } else {
                newSections.push(currentSections[i]);
            }
        }

        setSections(new Map(newSections.map(section => [section._id, section])));
    }

    useEffect(() => {
        self.scrollTo(0, 0);
    }, [currentRepertoireId]);

    return (
        <div className={styles.repertoire}>
            <h3>Upravit repertoár: {repertoires.get(currentRepertoireId).title}</h3>
            <span className={styles.close} onClick={() => setEditingRepertoireId('')}>&times;</span>
            <PlusSVG
                className={classNames(styles.addNewSection, globalStyles.addSVG, {
                    [globalStyles.closeSVG]: addSectionVisible,
                })}
                onClick={() => handleAddSectionVisibility(!addSectionVisible)}
                title={addSectionVisible ? 'Zavřít' : 'Přidat sekci'}
            />
            {addSectionVisible && <FormNewSection/>}
            <ListSections
                sections={currentSections}
                onDrop={handleOnDrop}
            />
        </div>
    )
}

export default EditRepertoire;