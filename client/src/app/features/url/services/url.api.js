import axios from 'axios';

const urlApiInstance = axios.create({
    baseURL: '/api/url',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Creates a shortened URL
 * @param {string|{url: string}} payload
 * @returns {Promise<object>} Created URL record data
 */
export async function createShortenUrl(payload) {
    try {
        const body = typeof payload === 'string' ? { url: payload } : payload;
        const response = await urlApiInstance.post('/', body);
        return response.data;
    } catch (err) {
        console.error('Error occurred while creating shortened URL:', err);
        throw err.response?.data || { error: err.message || 'Network error' };
    }
}

/**
 * Fetches a single URL record by its MongoDB ObjectId or shortCode
 * @param {string} id - Mongo ObjectId or short code
 * @returns {Promise<object>}
 */
export async function getShortenUrlById(id) {
    try {
        const response = await urlApiInstance.get(`/${id}`);
        return response.data;
    } catch (err) {
        console.error('Error occurred while fetching URL:', err);
        throw err.response?.data || { error: err.message || 'Network error' };
    }
}

/**
 * Fetches all saved shortened URLs, or filters by search query
 * @param {string} [search] - Optional search query
 * @param {object} [options] - Optional axios request options (e.g. signal for AbortController)
 * @returns {Promise<object>} List of URLs
 */
export async function getAllUrls(search, options = {}) {
    try {
        const params = search && search.trim() ? { search: search.trim() } : {};
        const response = await urlApiInstance.get('/', {
            params,
            ...options,
        });
        return response.data;
    } catch (err) {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
            throw err;
        }
        console.error('Error occurred while fetching all URLs:', err);
        throw err.response?.data || { error: err.message || 'Network error' };
    }
}

/**
 * Searches shortened URLs by query string via API
 * @param {string} query - Search term
 * @param {object} [options] - Optional axios config options
 * @returns {Promise<object>}
 */
export async function searchUrls(query, options = {}) {
    return getAllUrls(query, options);
}

/**
 * Deletes a shortened URL by its ID or shortCode
 * @param {string} id - Mongo ObjectId or short code
 * @returns {Promise<object>}
 */
export async function deleteUrl(id) {
    try {
        const response = await urlApiInstance.delete(`/${id}`);
        return response.data;
    } catch (err) {
        console.error('Error occurred while deleting URL:', err);
        throw err.response?.data || { error: err.message || 'Network error' };
    }
}

/**
 * Redirects or tests redirect endpoint for a short code
 * @param {string} shortCode
 * @returns {Promise<object>}
 */
export async function redirectUrl(shortCode) {
    try {
        const response = await urlApiInstance.get(`/redirect/${shortCode}`);
        return response.data;
    } catch (err) {
        console.error('Error occurred in redirecting:', err);
        throw err.response?.data || { error: err.message || 'Network error' };
    }
}

/**
 * Updates destination originalUrl (Resilient QR)
 * @param {string} id - Mongo ObjectId or short code
 * @param {string|{url: string}} payload
 * @returns {Promise<object>}
 */
export async function updateUrl(id, payload) {
    try {
        const body = typeof payload === 'string' ? { url: payload } : payload;
        const response = await urlApiInstance.patch(`/${id}`, body);
        return response.data;
    } catch (err) {
        console.error('Error occurred while updating URL:', err);
        throw err.response?.data || { error: err.message || 'Network error' };
    }
}

