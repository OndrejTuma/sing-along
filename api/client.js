import fetch from 'cross-fetch';
import cookie from 'js-cookie';

import {AppError, ApiError, API_ERRORS, ERR_NETWORK, ERR_NETWORK_MSG} from './errors';
import {
    REPERTOIRE_CREATE_URL,
    REPERTOIRE_DELETE_URL,
    REPERTOIRE_FETCH_ALL_URL,
    REPERTOIRE_FETCH_URL,
    REPERTOIRE_SET_ACTIVE_URL,
    SECTION_CREATE_URL,
    SECTION_DELETE_URL,
    SECTION_FETCH_URL,
    SECTION_UPDATE_URL,
    SONG_CREATE_URL,
    SONG_DELETE_URL,
    SONG_FETCH_ALL_URL,
    SONG_UPDATE_URL,
    USER_CREATE_URL,
    USER_LOGIN_URL,
} from './urls';
import cookieName from 'Api/cookie-name';

export function createRepertoir(title) {
    return apiFetch(REPERTOIRE_CREATE_URL, 'POST', {
        title,
    });
}
export function createSection(title, songs, repertoireId) {
    return apiFetch(SECTION_CREATE_URL, 'POST', {
        title,
        songs,
        repertoireId,
    });
}
export function createSong(title, text) {
    return apiFetch(SONG_CREATE_URL, 'POST', {
        title,
        text,
    });
}
export function createUser(login, password) {
    return apiFetch(USER_CREATE_URL, 'POST', {
        login,
        password,
    });
}
export function deleteRepertoire(id) {
    return apiFetch(REPERTOIRE_DELETE_URL, 'POST', {
        id,
    });
}
export function deleteSection(id) {
    return apiFetch(SECTION_DELETE_URL, 'POST', {
        id,
    });
}
export function deleteSong(title) {
    return apiFetch(SONG_DELETE_URL, 'POST', {
        title,
    });
}
export function fetchRepertoire(id) {
    return apiFetch(`${REPERTOIRE_FETCH_URL}/${id}`);
}
export function fetchRepertoires() {
    return apiFetch(REPERTOIRE_FETCH_ALL_URL);
}
export function fetchSectionsInRepertoar(repertoireId) {
    return apiFetch(`${SECTION_FETCH_URL}/${repertoireId}`);
}
export function fetchSongs() {
    return apiFetch(SONG_FETCH_ALL_URL);
}
export function login(login, password) {
    return apiFetch(USER_LOGIN_URL, 'POST', {
        login,
        password,
    });
}
export function logout() {
    return cookie.remove(cookieName);
}
export function setActiveRepertoire(id) {
    return apiFetch(REPERTOIRE_SET_ACTIVE_URL, 'POST', {
        id,
    });
}
export function updateSection(id, data) {
    return apiFetch(SECTION_UPDATE_URL, 'POST', {
        id,
        data,
    })
}
export function updateSong(id, data) {
    return apiFetch(SONG_UPDATE_URL, 'POST', {
        id,
        data,
    })
}

async function apiFetch(url, method = 'POST', body) {
    let result;

    try {
        result = await fetch(url, {
            body: JSON.stringify(body),
            method,
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
        });
    } catch (e) {
        throw new AppError(ERR_NETWORK, ERR_NETWORK_MSG);
    }

    if (result.status >= 400) {
        result = await result.json();

        //TODO: better way to parse error messages
        throw new AppError(ERR_NETWORK, result.errmsg || result.message);
    }

    result = await result.json();

    if (result.error) {
        throw new ApiError(result.error, API_ERRORS[result.error] || result.error);
    }

    return result;
}