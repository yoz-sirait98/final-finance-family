import { defineStore } from 'pinia';
import { goalService } from '../services/goalService';

export const useGoalStore = defineStore('goals', {
  state: () => ({
    goals: [],
    loading: false,
  }),

  actions: {
    async fetchGoals() {
      this.loading = true;
      try {
        const { data } = await goalService.list();
        this.goals = data.data;
      } finally {
        this.loading = false;
      }
    },
  },
});
