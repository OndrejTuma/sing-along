import React from 'react';
import {useGlobal} from 'reactn';

import Button from '../Button';
import Form from '../Form';
import Input from '../Input';
import SongPicker from '../SongPicker';

import {createSection, fetchSectionsInRepertoar} from '../../api/client';
import useGlobalMap from '../../hooks/useGlobalMap';

import styles from './styles.scss';

function FormNewSection() {
    const [currentRepertoireId] = useGlobal('editingRepertoireId');
    const [, addSection] = useGlobalMap('sections');
    const [, addNotification] = useGlobalMap('notifications');

    async function handleOnSubmit(refs) {
        const title = refs.get('title').current;
        const songs = refs.get('songs').current;

        try {
            const {sections} = await fetchSectionsInRepertoar(currentRepertoireId);
            const {section} = await createSection(
                title.value(),
                songs.value(),
                currentRepertoireId,
                sections.reduce((res, {position}) => res > position ? res : position, 0) + 1
            );

            addSection(section._id, section);
            title.reset();
            songs.reset();
        } catch (e) {
            addNotification(e.message, 'error');
        }
    }

    return (
        <>
            <h3>Přidat sekci:</h3>
            <Form className={styles.wrapper} onSubmit={handleOnSubmit}>
                <Input name={'title'} label={'Název'}/>
                <SongPicker name={'songs'}/>
                <Button label={'Vytvořit'}/>
            </Form>
        </>
    )
}

export default FormNewSection;