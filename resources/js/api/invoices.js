import client from './client';

export const getInvoices = (params) => client.get('/invoices', { params });
export const getInvoice = (id) => client.get(`/invoices/${id}`);
export const createInvoice = (data) => client.post('/invoices', data);
export const updateInvoice = (id, data) => client.patch(`/invoices/${id}`, data);
export const markInvoicePaid = (id) => client.patch(`/invoices/${id}/mark-paid`);
export const deleteInvoice = (id) => client.delete(`/invoices/${id}`);
