import { defineStore } from 'pinia';
import { transactionService } from '../services/transactionService';

export const useTransactionStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    meta: {},
    loading: false,
    filters: {
      search: '',
      type: '',
      category_id: '',
      member_id: '',
      account_id: '',
      date_from: '',
      date_to: '',
      sort_by: 'transaction_date',
      sort_dir: 'desc',
      page: 1,
      per_page: 15,
    },
  }),

  actions: {
    async fetchTransactions() {
      this.loading = true;
      try {
        const params = {};
        Object.entries(this.filters).forEach(([k, v]) => {
          if (v !== '' && v !== null && v !== undefined) params[k] = v;
        });
        const { data } = await transactionService.list(params);
        this.transactions = data.data;
        this.meta = data.meta || {};
      } finally {
        this.loading = false;
      }
    },

    setFilter(key, value) {
      this.filters[key] = value;
      this.filters.page = 1;
    },

    resetFilters() {
      this.filters = {
        search: '', type: '', category_id: '', member_id: '',
        account_id: '', date_from: '', date_to: '',
        sort_by: 'transaction_date', sort_dir: 'desc', page: 1, per_page: 15,
      };
    },
  },
});
