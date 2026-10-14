import axios from 'axios';

const authApiInstance = axios.create({
    baseURL: '/api/auth',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Registers a new user
 * @param {{ username: string, email: string, password: string }} payload
 * @returns {Promise<object>}
 */
export async function registerUser(payload) {
    try {
        const response = await authApiInstance.post('/register', payload);
        return response.data;
    } catch (err) {
        console.error('Error in registerUser:', err);
        throw err.response?.data || { message: err.message || 'Registration failed' };
    }
}

/**
 * Logs in an existing user and sets session cookie
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<object>}
 */
export async function loginUser(payload) {
    try {
        const response = await authApiInstance.post('/login', payload);
        return response.data;
    } catch (err) {
        console.error('Error in loginUser:', err);
        throw err.response?.data || { message: err.message || 'Login failed' };
    }
}

/**
 * Logs out user, invalidating session and clearing cookie
 * @returns {Promise<object>}
 */
export async function logoutUser() {
    try {
        const response = await authApiInstance.post('/logout');
        return response.data;
    } catch (err) {
        console.error('Error in logoutUser:', err);
        throw err.response?.data || { message: err.message || 'Logout failed' };
    }
}

/**
 * Fetches current authenticated user profile
 * @returns {Promise<object>}
 */
export async function getMe() {
    try {
        const response = await authApiInstance.get('/me');
        return response.data;
    } catch (err) {
        if (err.response?.status !== 401 && err.response?.status !== 400) {
            console.error('Error in getMe:', err);
        }
        throw err.response?.data || { message: err.message || 'Failed to authenticate' };
    }
}
