import { schedulerDb } from './schedulerDatabase';
import { reminderRepository } from './reminderRepository';
import { categoryRepository } from './categoryRepository';
import { getTodayDateString, isOverdue } from '../utils/schedulerDate';

export class TaskRepository {
  /**
   * Enrich a task with joined category and reminders
   */
  async enrichTask(task) {
    if (task.category_id) {
      const category = await categoryRepository.getById(task.category_id);
      if (category) {
        task.category = {
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
        };
      }
    }
    task.reminders = await reminderRepository.getByTaskId(task.id);
    return task;
  }

  async getAll(familyId) {
    let query = schedulerDb.tasks.filter((t) => !t.is_deleted);
    if (familyId && familyId !== 'local-family') {
      query = schedulerDb.tasks.filter(
        (t) => !t.is_deleted && (!t.family_id || t.family_id === familyId || t.family_id === 'local-family')
      );
    }
    const tasks = await query.toArray();
    return Promise.all(tasks.map((t) => this.enrichTask(t)));
  }

  async getById(id) {
    const task = await schedulerDb.tasks.get(id);
    if (!task || task.is_deleted) return undefined;
    return this.enrichTask(task);
  }

  async getByDate(dateStr, familyId) {
    const tasks = await schedulerDb.tasks
      .where('task_date')
      .equals(dateStr)
      .filter((t) => !t.is_deleted && (!familyId || !t.family_id || t.family_id === familyId || t.family_id === 'local-family'))
      .toArray();

    const enriched = await Promise.all(tasks.map((t) => this.enrichTask(t)));
    return this.sortTasks(enriched, 'time');
  }

  async getByDateRange(startDate, endDate, familyId) {
    const tasks = await schedulerDb.tasks
      .where('task_date')
      .between(startDate, endDate, true, true)
      .filter((t) => !t.is_deleted && (!familyId || !t.family_id || t.family_id === familyId || t.family_id === 'local-family'))
      .toArray();

    const enriched = await Promise.all(tasks.map((t) => this.enrichTask(t)));
    return this.sortTasks(enriched, 'time');
  }

  async filterTasks({
    filter = 'all',
    categoryId = null,
    memberId = null,
    searchQuery = '',
    sortOption = 'time',
    familyId = null,
  } = {}) {
    const allTasks = await this.getAll(familyId);
    const today = getTodayDateString();

    const filtered = allTasks.filter((task) => {
      // Category filter
      if (categoryId && task.category_id !== categoryId) {
        return false;
      }

      // Member filter
      if (memberId && String(task.assigned_member_id) !== String(memberId)) {
        return false;
      }

      // Search query
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Status/Date Filter
      switch (filter) {
        case 'today':
          return task.task_date === today && task.status !== 'completed';
        case 'upcoming':
          return task.task_date > today && task.status !== 'completed';
        case 'overdue':
          return task.status !== 'completed' && isOverdue(task.task_date, task.start_time);
        case 'completed':
          return task.status === 'completed';
        case 'all':
        default:
          return true;
      }
    });

    return this.sortTasks(filtered, sortOption);
  }

  async create(input, familyId, userId) {
    const now = new Date().toISOString();
    const taskId = crypto.randomUUID();

    const newTask = {
      id: taskId,
      family_id: familyId || 'local-family',
      user_id: userId || 'local-user',
      category_id: input.category_id || null,
      assigned_member_id: input.assigned_member_id || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      task_date: input.task_date,
      start_time: input.start_time || null,
      end_time: input.end_time || null,
      is_all_day: input.is_all_day ?? false,
      priority: input.priority || 'medium',
      status: 'pending',
      is_deleted: false,
      created_at: now,
      updated_at: now,
    };

    await schedulerDb.tasks.add(newTask);

    // Create reminders if provided
    if (input.reminders && input.reminders.length > 0) {
      for (const r of input.reminders) {
        await reminderRepository.create(
          {
            task_id: taskId,
            reminder_type: r.reminder_type || 'notification',
            minutes_before: r.minutes_before ?? 15,
            is_enabled: true,
            is_triggered: false,
          },
          familyId
        );
      }
    }

    // Queue sync
    await schedulerDb.syncQueue.add({
      id: crypto.randomUUID(),
      entity: 'task',
      action: 'create',
      record_id: taskId,
      timestamp: Date.now(),
      retries: 0,
      data: newTask,
    });

    return this.enrichTask(newTask);
  }

  async update(id, updates) {
    const existing = await schedulerDb.tasks.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.status === 'completed' && !existing.completed_at) {
      updated.completed_at = new Date().toISOString();
    } else if (updates.status === 'pending') {
      updated.completed_at = null;
    }

    await schedulerDb.tasks.put(updated);

    // Update reminders if explicitly passed
    if (updates.reminders !== undefined) {
      await reminderRepository.deleteByTaskId(id);
      if (Array.isArray(updates.reminders)) {
        for (const r of updates.reminders) {
          await reminderRepository.create(
            {
              task_id: id,
              reminder_type: r.reminder_type || 'notification',
              minutes_before: r.minutes_before ?? 15,
              is_enabled: true,
              is_triggered: false,
            },
            existing.family_id
          );
        }
      }
    }

    // Queue sync
    await schedulerDb.syncQueue.add({
      id: crypto.randomUUID(),
      entity: 'task',
      action: 'update',
      record_id: id,
      timestamp: Date.now(),
      retries: 0,
      data: updated,
    });

    return this.enrichTask(updated);
  }

  async toggleStatus(id) {
    const task = await schedulerDb.tasks.get(id);
    if (!task) return undefined;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    return this.update(id, { status: newStatus });
  }

  async softDelete(id) {
    const task = await schedulerDb.tasks.get(id);
    if (!task) return;

    task.is_deleted = true;
    task.updated_at = new Date().toISOString();
    await schedulerDb.tasks.put(task);

    await schedulerDb.syncQueue.add({
      id: crypto.randomUUID(),
      entity: 'task',
      action: 'delete',
      record_id: id,
      timestamp: Date.now(),
      retries: 0,
    });
  }

  sortTasks(tasks, sortOption = 'time') {
    return [...tasks].sort((a, b) => {
      // Always group incomplete tasks before completed tasks
      if (a.status !== b.status) {
        return a.status === 'completed' ? 1 : -1;
      }

      switch (sortOption) {
        case 'priority': {
          const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        case 'title':
          return a.title.localeCompare(b.title);
        case 'time':
        default: {
          // Compare task dates first
          if (a.task_date !== b.task_date) {
            return a.task_date.localeCompare(b.task_date);
          }
          // All-day tasks first
          if (a.is_all_day && !b.is_all_day) return -1;
          if (!a.is_all_day && b.is_all_day) return 1;

          // By start time
          const timeA = a.start_time || '99:99';
          const timeB = b.start_time || '99:99';
          return timeA.localeCompare(timeB);
        }
      }
    });
  }
}

export const taskRepository = new TaskRepository();
