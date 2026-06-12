import client from './client';

export const getDashboardStats = () => client.get('/dashboard/stats');
export const getDashboardRevenue = () => client.get('/dashboard/revenue');
export const getDashboardActivities = () => client.get('/dashboard/activities');
