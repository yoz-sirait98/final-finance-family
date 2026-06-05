import api from './api';

export const dashboardService = {
  full: (params) => api.get('/dashboard/full', { params }),
  reports: (params) => api.get('/dashboard/reports', { params }),
};
