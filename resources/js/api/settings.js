import client from './client';

export const getSettings = () => client.get('/settings');
export const updateSettings = (data) => client.post('/settings', data);
