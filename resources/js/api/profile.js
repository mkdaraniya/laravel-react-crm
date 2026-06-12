import client from './client';

export const updateProfile = (data) => client.patch('/profile', data);
export const updatePassword = (data) => client.patch('/profile/password', data);
export const deleteAccount = (password) => client.delete('/profile', { data: { password } });
