import { defineStore } from 'pinia';
import { budgetService } from '../services/budgetService';

export const useBudgetStore = defineStore('budgets', {
  state: () => ({
    budgets: [],
    alerts: [],
    loading: false,
  }),

  actions: {
    async fetchBudgets(month, year) {
      this.loading = true;
      try {
        const { data } = await budgetService.list({ month, year });
        this.budgets = data.data;
      } finally {
        this.loading = false;
      }
    },

    async fetchAlerts(month, year) {
      const { data } = await budgetService.alerts({ month, year });
      this.alerts = data.data;
    },
  },
});
