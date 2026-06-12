import client from './client';

export const login = (email, password) => client.post('/login', { email, password });
export const register = (name, email, password, password_confirmation) =>
    client.post('/register', { name, email, password, password_confirmation });
export const getUser = () => client.get('/user');
export const logout = () => client.post('/logout');
