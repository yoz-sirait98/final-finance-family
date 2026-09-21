import { reminderRepository } from '../../db/reminderRepository';
import { taskRepository } from '../../db/taskRepository';
import { calculateReminderTriggerTime } from '../../utils/schedulerDate';

class ReminderService {
  constructor() {
    this.timer = null;
    this.alarmCallbacks = new Set();
    this.snoozedAlarms = new Map();
  }

  /**
   * Start checking for due reminders every 15 seconds
   */
  start() {
    if (this.timer) return;
    this.checkReminders();
    this.timer = setInterval(() => this.checkReminders(), 15000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  onAlarm(callback) {
    this.alarmCallbacks.add(callback);
    return () => this.alarmCallbacks.delete(callback);
  }

  /**
   * Main check loop
   */
  async checkReminders() {
    try {
      const now = new Date();

      // 1. Check snoozed alarms
      for (const [id, snoozed] of this.snoozedAlarms.entries()) {
        if (snoozed.triggerTime <= now) {
          this.snoozedAlarms.delete(id);
          this.triggerAlarm(snoozed.task, snoozed.reminder, true);
        }
      }

      // 2. Check active reminders from DB
      const activeReminders = await reminderRepository.getAllActive();
      for (const reminder of activeReminders) {
        const task = await taskRepository.getById(reminder.task_id);
        if (!task || task.status === 'completed' || task.is_deleted) {
          continue;
        }

        const triggerTime = calculateReminderTriggerTime(
          task.task_date,
          task.start_time,
          reminder.minutes_before
        );

        // If due now (within the past hour to prevent stale alerts)
        const diffMs = now.getTime() - triggerTime.getTime();
        if (diffMs >= 0 && diffMs < 3600000) {
          await reminderRepository.setTriggered(reminder.id, true);
          this.triggerAlarm(task, reminder);
        }
      }
    } catch (e) {
      console.error('Error during reminder check:', e);
    }
  }

  /**
   * Triggers the alarm UI and browser notification
   */
  triggerAlarm(task, reminder, isSnoozed = false) {
    const timeLabel = task.start_time ? `at ${task.start_time}` : 'Today';
    const message =
      reminder.minutes_before === 0
        ? `Task "${task.title}" starts now!`
        : `Task "${task.title}" starts in ${reminder.minutes_before} minutes (${timeLabel}).`;

    // 1. Show browser notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🔔 ${task.title}`, {
          body: message,
          icon: '/pwa-192x192.png',
        });
      } catch (err) {
        console.warn('Browser notification error:', err);
      }
    }

    // 2. Notify subscribers (Pinia Alarm Store & AlarmModal)
    const activeAlarm = {
      id: `${reminder.id}-${Date.now()}`,
      task,
      reminder,
      triggerTime: new Date(),
      isSnoozed,
    };

    this.alarmCallbacks.forEach((cb) => cb(activeAlarm));
  }

  /**
   * Snooze a triggered alarm for X minutes
   */
  snooze(alarm, minutes) {
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
    this.snoozedAlarms.set(alarm.id, {
      task: alarm.task,
      reminder: alarm.reminder,
      triggerTime: snoozeUntil,
    });
  }
}

export const reminderService = new ReminderService();
