import Dexie from 'dexie';

export class SchedulerDatabase extends Dexie {
  constructor() {
    super('FamilySchedulerDB');

    this.version(1).stores({
      tasks: 'id, family_id, user_id, category_id, assigned_member_id, task_date, start_time, priority, status, is_deleted, updated_at, created_at',
      categories: 'id, family_id, name, is_default, updated_at, created_at',
      reminders: 'id, task_id, family_id, minutes_before, is_enabled, is_triggered, updated_at',
      recurrences: 'id, task_id, family_id, updated_at',
      syncQueue: 'id, entity, action, record_id, timestamp, retries',
      settings: 'key',
    });
  }
}

export const schedulerDb = new SchedulerDatabase();
