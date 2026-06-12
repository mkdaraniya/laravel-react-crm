import client from './client';

export const getStages = () => client.get('/stages');
export const createStage = (data) => client.post('/stages', data);
export const updateStage = (id, data) => client.patch(`/stages/${id}`, data);
export const reorderStages = (stages) => client.post('/stages/reorder', { stages });
export const deleteStage = (id) => client.delete(`/stages/${id}`);
