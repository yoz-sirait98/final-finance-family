import api from './api';

export const memberService = {
  list: () => api.get('/members'),
  show: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
  toggleActive: (id) => api.patch(`/members/${id}/toggle-active`),
};
