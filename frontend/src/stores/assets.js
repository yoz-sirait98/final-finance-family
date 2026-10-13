import { defineStore } from 'pinia';
import { assetService } from '../services/assetService';

export const useAssetStore = defineStore('assets', {
  state: () => ({
    assets: [],
    warranties: [],
    schedules: [],
    logs: [],
    currentAsset: null,
    activeTab: 'assets', // 'assets' | 'schedules' | 'logs' | 'warranties'
    filterCategory: 'all',
    filterStatus: 'all',
    filterScheduleStatus: 'all', // 'all' | 'due_soon' | 'overdue' | 'upcoming'
    filterWarrantyStatus: 'all', // 'all' | 'active' | 'expiring_soon' | 'expired'
    searchQuery: '',
    loading: false,
    error: null,
  }),

  getters: {
    // ── Filtered Assets ──────────────────────────────────────────────
    filteredAssets(state) {
      const q = state.searchQuery.trim().toLowerCase();
      return state.assets.filter((a) => {
        if (state.filterCategory !== 'all' && a.category !== state.filterCategory) return false;
        if (state.filterStatus !== 'all' && a.status !== state.filterStatus) return false;
        if (q) {
          const matchName = a.name?.toLowerCase().includes(q);
          const matchBrand = a.brand?.toLowerCase().includes(q);
          const matchModel = a.model?.toLowerCase().includes(q);
          const matchPlate = a.license_plate?.toLowerCase().includes(q);
          const matchLoc = a.location?.toLowerCase().includes(q);
          if (!matchName && !matchBrand && !matchModel && !matchPlate && !matchLoc) return false;
        }
        return true;
      });
    },

    // ── Filtered Schedules ───────────────────────────────────────────
    filteredSchedules(state) {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      const q = state.searchQuery.trim().toLowerCase();

      return state.schedules.filter((s) => {
        if (q) {
          const matchTitle = s.title?.toLowerCase().includes(q);
          const matchAsset = s.asset?.name?.toLowerCase().includes(q);
          if (!matchTitle && !matchAsset) return false;
        }

        if (state.filterScheduleStatus === 'overdue') {
          return s.next_due_date && s.next_due_date < today && s.is_active;
        }
        if (state.filterScheduleStatus === 'due_soon') {
          return s.next_due_date && s.next_due_date >= today && s.next_due_date <= nextWeek && s.is_active;
        }
        if (state.filterScheduleStatus === 'upcoming') {
          return s.next_due_date && s.next_due_date > nextWeek && s.is_active;
        }

        return true;
      });
    },

    // ── Filtered Warranties ──────────────────────────────────────────
    filteredWarranties(state) {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const q = state.searchQuery.trim().toLowerCase();

      return state.warranties.filter((w) => {
        if (q) {
          const matchAsset = w.asset?.name?.toLowerCase().includes(q);
          const matchProvider = w.provider_name?.toLowerCase().includes(q);
          const matchPolicy = w.policy_number?.toLowerCase().includes(q);
          if (!matchAsset && !matchProvider && !matchPolicy) return false;
        }

        if (state.filterWarrantyStatus === 'expired') {
          return w.end_date && w.end_date < today;
        }
        if (state.filterWarrantyStatus === 'expiring_soon') {
          return w.end_date && w.end_date >= today && w.end_date <= nextMonth;
        }
        if (state.filterWarrantyStatus === 'active') {
          return (!w.end_date || w.end_date >= today) && w.status === 'active';
        }

        return true;
      });
    },

    // ── Filtered Logs ────────────────────────────────────────────────
    filteredLogs(state) {
      const q = state.searchQuery.trim().toLowerCase();
      if (!q) return state.logs;
      return state.logs.filter((l) => {
        const matchTitle = l.title?.toLowerCase().includes(q);
        const matchAsset = l.asset?.name?.toLowerCase().includes(q);
        const matchBy = l.performed_by?.toLowerCase().includes(q);
        return matchTitle || matchAsset || matchBy;
      });
    },

    // ── KPIs & Metrics ───────────────────────────────────────────────
    totalAssetCount: (state) => state.assets.length,

    totalAssetValuation: (state) => {
      return state.assets.reduce((sum, a) => {
        const val = Number(a.current_value !== null && a.current_value !== undefined ? a.current_value : a.purchase_price || 0);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
    },

    activeAssetCount: (state) => state.assets.filter((a) => a.status === 'active').length,

    vehicleCount: (state) => state.assets.filter((a) => a.category === 'vehicle').length,

    overdueSchedulesCount: (state) => {
      const today = new Date().toISOString().split('T')[0];
      return state.schedules.filter((s) => s.is_active && s.next_due_date && s.next_due_date < today).length;
    },

    dueSoonSchedulesCount: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
      return state.schedules.filter((s) => s.is_active && s.next_due_date && s.next_due_date >= today && s.next_due_date <= nextWeek).length;
    },

    expiringWarrantiesCount: (state) => {
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      return state.warranties.filter((w) => w.end_date && w.end_date >= today && w.end_date <= nextMonth && w.status !== 'expired').length;
    },

    expiredWarrantiesCount: (state) => {
      const today = new Date().toISOString().split('T')[0];
      return state.warranties.filter((w) => w.end_date && w.end_date < today).length;
    },

    totalMaintenanceSpent: (state) => {
      return state.logs.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);
    },
  },

  actions: {
    async fetchAssets() {
      try {
        const res = await assetService.listAssets();
        this.assets = res.data.data || [];
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async fetchWarranties() {
      try {
        const res = await assetService.listWarranties();
        this.warranties = res.data.data || [];
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async fetchSchedules() {
      try {
        const res = await assetService.listMaintenanceSchedules();
        this.schedules = res.data.data || [];
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async fetchLogs() {
      try {
        const res = await assetService.listMaintenanceLogs();
        this.logs = res.data.data || [];
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        await Promise.all([
          this.fetchAssets(),
          this.fetchWarranties(),
          this.fetchSchedules(),
          this.fetchLogs(),
        ]);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async getAssetDetails(id) {
      try {
        const res = await assetService.getAssetById(id);
        this.currentAsset = res.data.data;
        return this.currentAsset;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    async addAsset(payload) {
      const res = await assetService.createAsset(payload);
      if (res.data?.data) {
        this.assets.unshift(res.data.data);
      }
      return res.data.data;
    },

    async updateAsset(id, payload) {
      const res = await assetService.updateAsset(id, payload);
      const updated = res.data?.data;
      if (updated) {
        const idx = this.assets.findIndex((a) => a.id === id);
        if (idx !== -1) this.assets[idx] = updated;
        if (this.currentAsset?.id === id) {
          this.currentAsset = { ...this.currentAsset, ...updated };
        }
      }
      return updated;
    },

    async deleteAsset(id) {
      await assetService.deleteAsset(id);
      this.assets = this.assets.filter((a) => a.id !== id);
      this.warranties = this.warranties.filter((w) => w.asset_id !== id);
      this.schedules = this.schedules.filter((s) => s.asset_id !== id);
      this.logs = this.logs.filter((l) => l.asset_id !== id);
      if (this.currentAsset?.id === id) this.currentAsset = null;
      return true;
    },

    async addWarranty(payload) {
      const res = await assetService.createWarranty(payload);
      if (res.data?.data) {
        this.warranties.push(res.data.data);
      }
      return res.data.data;
    },

    async updateWarranty(id, payload) {
      const res = await assetService.updateWarranty(id, payload);
      const updated = res.data?.data;
      if (updated) {
        const idx = this.warranties.findIndex((w) => w.id === id);
        if (idx !== -1) this.warranties[idx] = updated;
      }
      return updated;
    },

    async deleteWarranty(id) {
      await assetService.deleteWarranty(id);
      this.warranties = this.warranties.filter((w) => w.id !== id);
      return true;
    },

    async addSchedule(payload) {
      const res = await assetService.createMaintenanceSchedule(payload);
      if (res.data?.data) {
        this.schedules.push(res.data.data);
      }
      return res.data.data;
    },

    async updateSchedule(id, payload) {
      const res = await assetService.updateSchedule(id, payload);
      const updated = res.data?.data;
      if (updated) {
        const idx = this.schedules.findIndex((s) => s.id === id);
        if (idx !== -1) this.schedules[idx] = updated;
      }
      return updated;
    },

    async deleteSchedule(id) {
      await assetService.deleteSchedule(id);
      this.schedules = this.schedules.filter((s) => s.id !== id);
      return true;
    },

    async addMaintenanceLog(payload, expenseOptions = null) {
      const res = await assetService.createMaintenanceLog(payload, expenseOptions);
      if (res.data?.data) {
        this.logs.unshift(res.data.data);
        // Refresh schedules and assets since trigger might have updated them
        await Promise.all([this.fetchSchedules(), this.fetchAssets()]);
      }
      return res.data;
    },

    async updateMaintenanceLog(id, payload) {
      const res = await assetService.updateMaintenanceLog(id, payload);
      const updated = res.data?.data;
      if (updated) {
        const idx = this.logs.findIndex((l) => l.id === id);
        if (idx !== -1) this.logs[idx] = updated;
      }
      return updated;
    },

    async deleteMaintenanceLog(id) {
      await assetService.deleteMaintenanceLog(id);
      this.logs = this.logs.filter((l) => l.id !== id);
      return true;
    },

    async syncScheduleToScheduler(schedule, date = null) {
      return await assetService.syncMaintenanceToScheduler(schedule, date);
    },
  },
});
