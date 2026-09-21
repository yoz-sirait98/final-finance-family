import { defineStore } from 'pinia';
import { categoryRepository } from '../db/categoryRepository';

export const useSchedulerCategoryStore = defineStore('schedulerCategory', {
  state: () => ({
    categories: [],
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchCategories(familyId) {
      this.isLoading = true;
      try {
        this.categories = await categoryRepository.getAll(familyId);
      } catch (err) {
        console.error('Failed to load categories:', err);
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async addCategory(input, familyId, userId) {
      const newCategory = await categoryRepository.create(input, familyId, userId);
      this.categories.push(newCategory);
      return newCategory;
    },

    async editCategory(id, updates) {
      const updated = await categoryRepository.update(id, updates);
      if (updated) {
        const index = this.categories.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.categories[index] = updated;
        }
      }
      return updated;
    },

    async removeCategory(id) {
      await categoryRepository.delete(id);
      this.categories = this.categories.filter((c) => c.id !== id);
    },
  },
});
