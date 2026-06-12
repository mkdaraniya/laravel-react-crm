import client from './client';

export const getDeals = () => client.get('/deals');
export const getDeal = (id) => client.get(`/deals/${id}`);
export const createDeal = (data) => client.post('/deals', data);
export const updateDeal = (id, data) => client.patch(`/deals/${id}`, data);
export const moveDeal = (id, pipeline_stage_id) => client.patch(`/deals/${id}/move`, { pipeline_stage_id });
export const deleteDeal = (id) => client.delete(`/deals/${id}`);
