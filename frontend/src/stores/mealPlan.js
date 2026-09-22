import { defineStore } from 'pinia';
import { mealPlanService } from '../services/mealPlanService';

/**
 * Get Monday of the week for a given date
 */
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Format date to YYYY-MM-DD
 */
function toDateStr(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const useMealPlanStore = defineStore('mealPlan', {
  state: () => {
    const monday = getMonday(new Date());
    return {
      currentMonday: monday,
      mealPlans: [],
      loading: false,
    };
  },

  getters: {
    startDateStr(state) {
      return toDateStr(state.currentMonday);
    },

    endDateStr(state) {
      const sunday = new Date(state.currentMonday);
      sunday.setDate(sunday.getDate() + 6);
      return toDateStr(sunday);
    },

    /**
     * 7-day matrix populated with meal slot buckets
     */
    weekDaysMatrix(state) {
      const todayStr = toDateStr(new Date());
      const days = [];
      const dayNamesId = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
      const dayNamesEn = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      for (let i = 0; i < 7; i++) {
        const d = new Date(state.currentMonday);
        d.setDate(d.getDate() + i);
        const dateStr = toDateStr(d);

        const dayMeals = state.mealPlans.filter((m) => m.plan_date === dateStr);

        days.push({
          date: d,
          dateStr,
          dayNameId: dayNamesId[i],
          dayNameEn: dayNamesEn[i],
          dayNumber: d.getDate(),
          monthName: d.toLocaleString('default', { month: 'short' }),
          isToday: dateStr === todayStr,
          meals: {
            breakfast: dayMeals.filter((m) => m.meal_type === 'breakfast'),
            lunch: dayMeals.filter((m) => m.meal_type === 'lunch'),
            dinner: dayMeals.filter((m) => m.meal_type === 'dinner'),
            snack: dayMeals.filter((m) => m.meal_type === 'snack')
          },
          totalMeals: dayMeals.length
        });
      }

      return days;
    },

    todayMeals(state) {
      const todayStr = toDateStr(new Date());
      return state.mealPlans.filter((m) => m.plan_date === todayStr);
    }
  },

  actions: {
    async fetchCurrentWeek() {
      this.loading = true;
      try {
        const res = await mealPlanService.getWeekPlan(this.startDateStr, this.endDateStr);
        this.mealPlans = res.data?.data || [];
      } finally {
        this.loading = false;
      }
    },

    nextWeek() {
      const nextMon = new Date(this.currentMonday);
      nextMon.setDate(nextMon.getDate() + 7);
      this.currentMonday = nextMon;
      return this.fetchCurrentWeek();
    },

    prevWeek() {
      const prevMon = new Date(this.currentMonday);
      prevMon.setDate(prevMon.getDate() - 7);
      this.currentMonday = prevMon;
      return this.fetchCurrentWeek();
    },

    goToCurrentWeek() {
      this.currentMonday = getMonday(new Date());
      return this.fetchCurrentWeek();
    },

    async addMealPlan(payload) {
      const { data } = await mealPlanService.create(payload);
      await this.fetchCurrentWeek();
      return data;
    },

    async updateMealPlan(id, payload) {
      const { data } = await mealPlanService.update(id, payload);
      await this.fetchCurrentWeek();
      return data;
    },

    async deleteMealPlan(id) {
      await mealPlanService.delete(id);
      this.mealPlans = this.mealPlans.filter((m) => m.id !== id);
    },

    async toggleCompleted(id, isCompleted) {
      const updated = await mealPlanService.toggleCompleted(id, isCompleted);
      const idx = this.mealPlans.findIndex((m) => m.id === id);
      if (idx !== -1) {
        this.mealPlans[idx] = { ...this.mealPlans[idx], ...updated };
      }
      return updated;
    },

    async copyWeekToNext() {
      const nextMon = new Date(this.currentMonday);
      nextMon.setDate(nextMon.getDate() + 7);
      const targetDateStr = toDateStr(nextMon);
      await mealPlanService.copyWeek(this.startDateStr, targetDateStr);
    },

    async exportIngredientsToShopping(ingredients, shoppingPlanId) {
      return await mealPlanService.exportMissingIngredientsToShopping(ingredients, shoppingPlanId);
    }
  }
});
