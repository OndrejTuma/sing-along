import {useGlobal} from 'reactn';

function useGlobalMap(name) {
    const [map, setMap] = useGlobal(name);

    function addItem(id, item = true) {
        setMap(map.set(id, item));
    }

    function deleteItem(id) {
        map.delete(id);
        setMap(map);
    }

    function deleteAllItems() {
        map.clear();
        setMap(map);
    }

    function setAllItems(items) {
        setMap(items);
    }

    return [map, addItem, deleteItem, deleteAllItems, setAllItems];
}

export default useGlobalMap;