import { defineStore } from 'pinia';
import { googleCalendarService } from '../services/scheduler/googleCalendarService';

export const useGoogleCalendarStore = defineStore('googleCalendar', {
  state: () => ({
    account: googleCalendarService.getSavedAccount(),
    calendars: [],
    selectedCalendarId: googleCalendarService.getSelectedCalendarId(),
    autoSyncEnabled: googleCalendarService.isAutoSyncEnabled(),
    clientId: googleCalendarService.getClientId(),
    isSyncing: false,
    lastSyncStats: googleCalendarService.getLastSyncStats(),
    errorMessage: null,
  }),

  getters: {
    isConnected: (state) => {
      return !!state.account && state.account.isConnected;
    },

    isTokenExpired: (state) => {
      if (!state.account) return false;
      return !googleCalendarService.isTokenValid(state.account);
    },

    selectedCalendar: (state) => {
      return state.calendars.find((c) => c.id === state.selectedCalendarId) || state.calendars[0] || null;
    },
  },

  actions: {
    async init() {
      this.account = googleCalendarService.getSavedAccount();
      this.clientId = googleCalendarService.getClientId();
      this.selectedCalendarId = googleCalendarService.getSelectedCalendarId();
      this.autoSyncEnabled = googleCalendarService.isAutoSyncEnabled();
      this.lastSyncStats = googleCalendarService.getLastSyncStats();

      if (this.isConnected && !this.isTokenExpired) {
        await this.refreshCalendars();
      }
    },

    async connect() {
      this.errorMessage = null;
      try {
        const acc = await googleCalendarService.promptOAuthLogin();
        this.account = acc;
        await this.refreshCalendars();
        return true;
      } catch (err) {
        console.error('Google OAuth connection failed:', err);
        this.errorMessage = err.message || 'Google authentication failed';
        return false;
      }
    },

    connectMock() {
      this.errorMessage = null;
      const mockAcc = googleCalendarService.enableMockAccount();
      this.account = mockAcc;
      this.refreshCalendars();
      return mockAcc;
    },

    disconnect() {
      googleCalendarService.disconnect();
      this.account = null;
      this.calendars = [];
      this.lastSyncStats = null;
      this.errorMessage = null;
    },

    setClientId(id) {
      googleCalendarService.setClientId(id);
      this.clientId = id;
    },

    setSelectedCalendar(calendarId) {
      googleCalendarService.setSelectedCalendarId(calendarId);
      this.selectedCalendarId = calendarId;
    },

    toggleAutoSync() {
      const nextVal = !this.autoSyncEnabled;
      googleCalendarService.setAutoSync(nextVal);
      this.autoSyncEnabled = nextVal;
    },

    async refreshCalendars() {
      if (!this.account || !this.account.accessToken) return;
      try {
        const list = await googleCalendarService.fetchCalendars(this.account.accessToken);
        this.calendars = list;
      } catch (err) {
        console.warn('Failed to refresh calendars:', err);
      }
    },

    async sync(familyId, userId, options = {}) {
      if (!this.isConnected) return null;
      this.isSyncing = true;
      this.errorMessage = null;

      try {
        const stats = await googleCalendarService.syncTwoWay(
          {
            calendarId: this.selectedCalendarId,
            ...options,
          },
          familyId,
          userId
        );
        this.lastSyncStats = stats;
        return stats;
      } catch (err) {
        console.error('Google Calendar sync failed:', err);
        this.errorMessage = err.message || 'Sync failed';
        throw err;
      } finally {
        this.isSyncing = false;
      }
    },
  },
});
