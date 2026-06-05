import api from './api';

export const transactionService = {
  list: (params) => api.get('/transactions', { params }),
  show: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  transfer: (data) => api.post('/transactions/transfer', data),
};
