import { defineStore } from 'pinia';
import { taskRepository } from '../db/taskRepository';
import { getTodayDateString } from '../utils/schedulerDate';
import { audioService } from '../services/scheduler/audioService';

export const useSchedulerTaskStore = defineStore('schedulerTask', {
  state: () => ({
    tasks: [],
    selectedDate: getTodayDateString(),
    viewMode: 'day', // 'day' | 'week' | 'month' | 'agenda' | 'list'
    activeFilter: 'all', // 'all' | 'today' | 'upcoming' | 'overdue' | 'completed'
    selectedCategoryId: null,
    selectedMemberId: null,
    searchQuery: '',
    sortOption: 'time',
    isLoading: false,
    error: null,
  }),

  getters: {
    /**
     * Tasks filtered for the currently selected day
     */
    tasksForSelectedDate: (state) => {
      return state.tasks.filter((t) => t.task_date === state.selectedDate && !t.is_deleted);
    },

    /**
     * Incomplete tasks for selected day
     */
    pendingTasksForSelectedDate: (state) => {
      return state.tasks.filter(
        (t) => t.task_date === state.selectedDate && t.status !== 'completed' && !t.is_deleted
      );
    },

    /**
     * Tasks matching current active filter, category, member, and search query
     */
    filteredTasks: (state) => {
      const today = getTodayDateString();
      const query = state.searchQuery.toLowerCase().trim();

      return state.tasks.filter((t) => {
        if (t.is_deleted) return false;

        // Category filter
        if (state.selectedCategoryId && t.category_id !== state.selectedCategoryId) {
          return false;
        }

        // Member assignee filter
        if (state.selectedMemberId && String(t.assigned_member_id) !== String(state.selectedMemberId)) {
          return false;
        }

        // Search query
        if (query) {
          const matchTitle = t.title?.toLowerCase().includes(query);
          const matchDesc = t.description?.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc) return false;
        }

        // Active status/date filter
        switch (state.activeFilter) {
          case 'today':
            return t.task_date === today && t.status !== 'completed';
          case 'upcoming':
            return t.task_date > today && t.status !== 'completed';
          case 'overdue':
            return t.task_date < today && t.status !== 'completed';
          case 'completed':
            return t.status === 'completed';
          case 'all':
          default:
            return true;
        }
      });
    },

    todayTaskCount: (state) => {
      const today = getTodayDateString();
      return state.tasks.filter((t) => t.task_date === today && !t.is_deleted).length;
    },

    todayCompletedCount: (state) => {
      const today = getTodayDateString();
      return state.tasks.filter((t) => t.task_date === today && t.status === 'completed' && !t.is_deleted).length;
    },
  },

  actions: {
    async fetchTasks(familyId) {
      this.isLoading = true;
      try {
        this.tasks = await taskRepository.getAll(familyId);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async addTask(input, familyId, userId) {
      const newTask = await taskRepository.create(input, familyId, userId);
      this.tasks.push(newTask);
      audioService.playConfirmSound();
      return newTask;
    },

    async editTask(id, updates) {
      const updated = await taskRepository.update(id, updates);
      if (updated) {
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tasks[index] = updated;
        }
      }
      return updated;
    },

    async toggleStatus(id) {
      const updated = await taskRepository.toggleStatus(id);
      if (updated) {
        const index = this.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          this.tasks[index] = updated;
        }
        if (updated.status === 'completed') {
          audioService.playConfirmSound();
        }
      }
      return updated;
    },

    async removeTask(id) {
      await taskRepository.softDelete(id);
      this.tasks = this.tasks.filter((t) => t.id !== id);
    },

    setSelectedDate(dateStr) {
      this.selectedDate = dateStr;
    },

    setViewMode(mode) {
      this.viewMode = mode;
    },

    setActiveFilter(filter) {
      this.activeFilter = filter;
    },

    setCategoryId(categoryId) {
      this.selectedCategoryId = categoryId;
    },

    setMemberId(memberId) {
      this.selectedMemberId = memberId;
    },

    setSearchQuery(query) {
      this.searchQuery = query;
    },
  },
});
