import { defineStore } from 'pinia';
import { audioService } from '../services/scheduler/audioService';
import { reminderService } from '../services/scheduler/reminderService';

export const useSchedulerAlarmStore = defineStore('schedulerAlarm', {
  state: () => ({
    activeAlarm: null,
    isOpen: false,
    initialized: false,
  }),

  actions: {
    init() {
      if (this.initialized) return;
      this.initialized = true;

      // Connect reminderService callback
      reminderService.onAlarm((alarm) => {
        this.triggerAlarm(alarm);
      });
    },

    triggerAlarm(alarm) {
      this.activeAlarm = alarm;
      this.isOpen = true;

      // Play chime sequence if reminder type is alarm or both
      const reminderType = alarm.reminder?.reminder_type || 'both';
      if (reminderType === 'alarm' || reminderType === 'both') {
        audioService.startAlarm();
      }
    },

    snooze(minutes = 5) {
      if (this.activeAlarm) {
        reminderService.snooze(this.activeAlarm, minutes);
      }
      this.dismiss();
    },

    dismiss() {
      audioService.stopAlarm();
      this.isOpen = false;
      this.activeAlarm = null;
    },
  },
});
