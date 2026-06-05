import { defineStore } from 'pinia';
import { accountService } from '../services/accountService';

export const useAccountStore = defineStore('accounts', {
  state: () => ({
    accounts: [],
    loading: false,
  }),

  actions: {
    async fetchAccounts() {
      this.loading = true;
      try {
        const { data } = await accountService.list();
        this.accounts = data.data;
      } finally {
        this.loading = false;
      }
    },
  },
});
