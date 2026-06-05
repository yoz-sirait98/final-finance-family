import { defineStore } from 'pinia';
import { categoryService } from '../services/categoryService';

export const useCategoryStore = defineStore('categories', {
  state: () => ({
    categories: [],
    loading: false,
  }),

  getters: {
    incomeCategories: (state) => state.categories.filter(c => c.type === 'income'),
    expenseCategories: (state) => state.categories.filter(c => c.type === 'expense'),
  },

  actions: {
    async fetchCategories(type) {
      this.loading = true;
      try {
        const { data } = await categoryService.list(type);
        this.categories = data.data;
      } finally {
        this.loading = false;
      }
    },
  },
});
