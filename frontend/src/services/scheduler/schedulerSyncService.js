import { schedulerDb } from '../../db/schedulerDatabase';
import { supabase } from '../../lib/supabase';

class SchedulerSyncService {
  constructor() {
    this.isSyncing = false;
    this.statusListeners = new Set();
    this.currentStatus = {
      state: 'idle',
      lastSyncedAt: null,
      pendingCount: 0,
      errorMessage: null,
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.triggerSync();
      });
    }
  }

  getStatus() {
    return { ...this.currentStatus };
  }

  onStatusChange(callback) {
    this.statusListeners.add(callback);
    callback(this.getStatus());
    return () => this.statusListeners.delete(callback);
  }

  emitStatus(updates) {
    this.currentStatus = { ...this.currentStatus, ...updates };
    this.statusListeners.forEach((cb) => cb(this.getStatus()));
  }

  async updatePendingCount() {
    const count = await schedulerDb.syncQueue.count();
    this.emitStatus({ pendingCount: count });
    return count;
  }

  /**
   * Main sync trigger
   */
  async triggerSync(familyId) {
    if (this.isSyncing) return;
    if (!navigator.onLine) {
      this.emitStatus({ state: 'offline' });
      return;
    }

    // Check auth session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !familyId) {
      return;
    }

    this.isSyncing = true;
    this.emitStatus({ state: 'syncing', errorMessage: null });

    try {
      // 1. Process Outbox (Push local changes to Supabase)
      await this.processSyncQueue(familyId, session.user.id);

      // 2. Pull remote changes (Fetch from Supabase to Dexie)
      await this.pullFromRemote(familyId);

      const now = new Date().toISOString();
      await schedulerDb.settings.put({ key: 'lastSyncedAt', value: now });
      this.emitStatus({
        state: 'synced',
        lastSyncedAt: now,
        pendingCount: 0,
      });
    } catch (err) {
      console.error('Scheduler sync error:', err);
      this.emitStatus({
        state: 'error',
        errorMessage: err.message || 'Sync failed',
      });
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process local sync queue items and push them to Supabase
   */
  async processSyncQueue(familyId, userId) {
    const queueItems = await schedulerDb.syncQueue.orderBy('timestamp').toArray();

    for (const item of queueItems) {
      try {
        if (item.entity === 'task') {
          if (item.action === 'create' || item.action === 'update') {
            const task = item.data || (await schedulerDb.tasks.get(item.record_id));
            if (task) {
              const payload = {
                id: task.id,
                family_id: familyId,
                created_by: userId,
                assigned_member_id: task.assigned_member_id || null,
                category_id: task.category_id || null,
                title: task.title,
                description: task.description || null,
                task_date: task.task_date,
                start_time: task.start_time || null,
                end_time: task.end_time || null,
                is_all_day: !!task.is_all_day,
                priority: task.priority || 'medium',
                status: task.status || 'pending',
                is_deleted: !!task.is_deleted,
                completed_at: task.completed_at || null,
                updated_at: task.updated_at || new Date().toISOString(),
              };

              await supabase.from('tasks').upsert(payload);
            }
          } else if (item.action === 'delete') {
            await supabase.from('tasks').update({ is_deleted: true }).eq('id', item.record_id);
          }
        } else if (item.entity === 'category') {
          if (item.action === 'create' || item.action === 'update') {
            const category = item.data || (await schedulerDb.categories.get(item.record_id));
            if (category) {
              const payload = {
                id: category.id,
                family_id: familyId,
                created_by: userId,
                name: category.name,
                icon: category.icon || 'Folder',
                color: category.color || '#6366f1',
                is_default: !!category.is_default,
                updated_at: category.updated_at || new Date().toISOString(),
              };

              await supabase.from('task_categories').upsert(payload);
            }
          } else if (item.action === 'delete') {
            await supabase.from('task_categories').delete().eq('id', item.record_id);
          }
        }

        // Successfully pushed, remove from queue
        await schedulerDb.syncQueue.delete(item.id);
      } catch (e) {
        console.warn('Error processing sync item:', item, e);
        item.retries = (item.retries || 0) + 1;
        if (item.retries > 5) {
          await schedulerDb.syncQueue.delete(item.id);
        } else {
          await schedulerDb.syncQueue.put(item);
        }
      }
    }

    await this.updatePendingCount();
  }

  /**
   * Pull categories and tasks from Supabase into local Dexie
   */
  async pullFromRemote(familyId) {
    // 1. Pull Categories
    const { data: remoteCategories, error: catError } = await supabase
      .from('task_categories')
      .select('*')
      .eq('family_id', familyId);

    if (!catError && remoteCategories) {
      for (const cat of remoteCategories) {
        const local = await schedulerDb.categories.get(cat.id);
        if (!local || new Date(cat.updated_at) > new Date(local.updated_at)) {
          await schedulerDb.categories.put({
            id: cat.id,
            family_id: cat.family_id,
            name: cat.name,
            icon: cat.icon,
            color: cat.color,
            is_default: cat.is_default,
            created_at: cat.created_at,
            updated_at: cat.updated_at,
          });
        }
      }
    }

    // 2. Pull Tasks
    const { data: remoteTasks, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('family_id', familyId);

    if (!taskError && remoteTasks) {
      for (const t of remoteTasks) {
        const local = await schedulerDb.tasks.get(t.id);
        if (!local || new Date(t.updated_at) > new Date(local.updated_at)) {
          await schedulerDb.tasks.put({
            id: t.id,
            family_id: t.family_id,
            user_id: t.created_by,
            assigned_member_id: t.assigned_member_id,
            category_id: t.category_id,
            title: t.title,
            description: t.description,
            task_date: t.task_date,
            start_time: t.start_time,
            end_time: t.end_time,
            is_all_day: t.is_all_day,
            priority: t.priority,
            status: t.status,
            is_deleted: t.is_deleted,
            completed_at: t.completed_at,
            created_at: t.created_at,
            updated_at: t.updated_at,
          });
        }
      }
    }
  }
}

export const schedulerSyncService = new SchedulerSyncService();
