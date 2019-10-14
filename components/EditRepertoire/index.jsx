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
                onDrop={(fromId, toId) => {
                    const fromPosition = currentSections.find(({_id}) => _id === fromId).position;
                    const toPosition = currentSections.find(({_id}) => _id === toId).position;

                    const newSections = currentSections.map(section => {
                        if (section._id === fromId) {
                            section.position = toPosition;
                        } else if (section._id === toId) {
                            section.position = fromPosition;
                        }

                        return section;
                    }).sort(function(a, b){
                        if(a.position < b.position) { return -1; }
                        if(a.position > b.position) { return 1; }
                        return 0;
                    });

                    setSections(new Map(newSections.map(section => [section._id, section])));
                }}
            />
        </div>
    )
}

export default EditRepertoire;