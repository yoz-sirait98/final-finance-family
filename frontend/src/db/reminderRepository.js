import { schedulerDb } from './schedulerDatabase';

export class ReminderRepository {
  async getByTaskId(taskId) {
    return schedulerDb.reminders.where('task_id').equals(taskId).toArray();
  }

  async getAllActive() {
    return schedulerDb.reminders
      .filter((r) => r.is_enabled && !r.is_triggered)
      .toArray();
  }

  async create(reminder, familyId) {
    const now = new Date().toISOString();
    const newReminder = {
      ...reminder,
      id: crypto.randomUUID(),
      family_id: familyId || 'local-family',
      created_at: now,
      updated_at: now,
    };
    await schedulerDb.reminders.add(newReminder);

    // Queue sync
    await schedulerDb.syncQueue.add({
      id: crypto.randomUUID(),
      entity: 'reminder',
      action: 'create',
      record_id: newReminder.id,
      timestamp: Date.now(),
      retries: 0,
      data: newReminder,
    });

    return newReminder;
  }

  async setTriggered(id, isTriggered = true) {
    const existing = await schedulerDb.reminders.get(id);
    if (existing) {
      existing.is_triggered = isTriggered;
      existing.updated_at = new Date().toISOString();
      await schedulerDb.reminders.put(existing);

      await schedulerDb.syncQueue.add({
        id: crypto.randomUUID(),
        entity: 'reminder',
        action: 'update',
        record_id: id,
        timestamp: Date.now(),
        retries: 0,
        data: existing,
      });
    }
  }

  async deleteByTaskId(taskId) {
    const reminders = await this.getByTaskId(taskId);
    const ids = reminders.map((r) => r.id);
    await schedulerDb.reminders.bulkDelete(ids);

    for (const id of ids) {
      await schedulerDb.syncQueue.add({
        id: crypto.randomUUID(),
        entity: 'reminder',
        action: 'delete',
        record_id: id,
        timestamp: Date.now(),
        retries: 0,
      });
    }
  }

  async delete(id) {
    await schedulerDb.reminders.delete(id);

    await schedulerDb.syncQueue.add({
      id: crypto.randomUUID(),
      entity: 'reminder',
      action: 'delete',
      record_id: id,
      timestamp: Date.now(),
      retries: 0,
    });
  }
}

export const reminderRepository = new ReminderRepository();
