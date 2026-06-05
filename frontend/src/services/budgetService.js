import api from './api';

export const budgetService = {
  list: (params) => api.get('/budgets', { params }),
  show: (id) => api.get(`/budgets/${id}`),
  create: (data) => api.post('/budgets', data),
  update: (id, data) => api.put(`/budgets/${id}`, data),
  delete: (id) => api.delete(`/budgets/${id}`),
  alerts: (params) => api.get('/budgets/alerts', { params }),
};
