import { defineStore } from 'pinia';
import { authService } from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('auth_user') || 'null'),
    token: localStorage.getItem('auth_token') || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name || '',
  },

  actions: {
    async register(data) {
      const response = await authService.register(data);
      this.token = response.data.token;
      this.user = response.data.user;
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify(response.data.user));
    },

    async login(credentials) {
      const { data } = await authService.login(credentials);
      this.token = data.token;
      this.user = data.user;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    },

    async fetchProfile() {
      const { data } = await authService.profile();
      this.user = data.data;
      localStorage.setItem('auth_user', JSON.stringify(data.data));
    },

    async logout() {
      try { await authService.logout(); } catch {}
      this.token = null;
      this.user = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
  },
});
