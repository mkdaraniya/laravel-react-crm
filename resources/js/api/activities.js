import client from './client';

export const getActivities = () => client.get('/dashboard/activities');
