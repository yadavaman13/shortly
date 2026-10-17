import axios from 'axios';

const qrApiInstance = axios.create({
    baseURL: '/api/qr',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Creates a short URL and generates its QR metadata
 * @param {string|{url: string}} payload - The long URL to shorten and encode
 * @returns {Promise<object>} QR record data
 */
export async function createQr(payload) {
    try {
        const body = typeof payload === 'string' ? { url: payload } : payload;
        const response = await qrApiInstance.post('/', body);
        return response.data;
    } catch (err) {
        console.error('Error occurred while generating QR code:', err);
        throw err.response?.data || { error: err.message || 'Network error' };
    }
}

/**
 * Fetches all URLs generated via the QR flow
 * @returns {Promise<object>} List of QR URLs
 */
export async function getAllQrUrls() {
    try {
        const response = await qrApiInstance.get('/');
        return response.data;
    } catch (err) {
        if (axios.isCancel(err) || err.name === 'CanceledError') {
            throw err;
        }
        console.error('Error occurred while fetching QR URLs:', err);
        throw err.response?.data || { error: err.message || 'Network error' };
    }
}

export default {
    createQr,
    getAllQrUrls,
};
