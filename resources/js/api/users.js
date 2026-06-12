import client from './client';

export const getUsers = (params) => client.get('/users', { params });
export const createUser = (data) => client.post('/users', data);
export const updateUserRole = (id, role) => client.patch(`/users/${id}/role`, { role });
export const deleteUser = (id) => client.delete(`/users/${id}`);
