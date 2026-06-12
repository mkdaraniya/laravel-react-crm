import axios from 'axios';

const client = axios.create({
    baseURL: '/api',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export function apiError(error) {
    if (error.response?.data?.message) return error.response.data.message;
    if (error.response?.data?.errors) {
        return Object.values(error.response.data.errors).flat().join(', ');
    }
    return 'An unexpected error occurred.';
}

export default client;
