import { schedulerDb } from './schedulerDatabase';

export const DEFAULT_FAMILY_CATEGORIES = [
  { name: 'Family & Kids', icon: 'Users', color: '#ec4899', is_default: true },
  { name: 'Home & Chores', icon: 'Home', color: '#10b981', is_default: true },
  { name: 'Work', icon: 'Briefcase', color: '#3b82f6', is_default: true },
  { name: 'Finance', icon: 'DollarSign', color: '#f59e0b', is_default: true },
  { name: 'Health & Medical', icon: 'HeartPulse', color: '#ef4444', is_default: true },
  { name: 'Personal', icon: 'User', color: '#8b5cf6', is_default: true },
];

export class CategoryRepository {
  /**
   * Initializes default categories if database is empty
   */
  async ensureDefaults(familyId) {
    const current = await schedulerDb.categories.toArray();
    if (current.length === 0) {
      const now = new Date().toISOString();
      const defaultCats = DEFAULT_FAMILY_CATEGORIES.map((cat) => ({
        id: crypto.randomUUID(),
        family_id: familyId || 'local-family',
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        is_default: true,
        created_at: now,
        updated_at: now,
      }));

      await schedulerDb.categories.bulkAdd(defaultCats);
      return defaultCats;
    }
    return current;
  }

  async getAll(familyId) {
    await this.ensureDefaults(familyId);
    if (familyId && familyId !== 'local-family') {
      return schedulerDb.categories
        .filter((c) => !c.family_id || c.family_id === familyId || c.family_id === 'local-family')
        .toArray();
    }
    return schedulerDb.categories.toArray();
  }

  async getById(id) {
    return schedulerDb.categories.get(id);
  }

  async create(input, familyId, userId) {
    const now = new Date().toISOString();
    const newCategory = {
      id: crypto.randomUUID(),
      family_id: familyId || 'local-family',
      user_id: userId || 'local-user',
      name: input.name.trim(),
      icon: input.icon || 'Folder',
      color: input.color || '#6366f1',
      is_default: false,
      created_at: now,
      updated_at: now,
    };

    await schedulerDb.categories.add(newCategory);

    // Queue sync
    await schedulerDb.syncQueue.add({
      id: crypto.randomUUID(),
      entity: 'category',
      action: 'create',
      record_id: newCategory.id,
      timestamp: Date.now(),
      retries: 0,
      data: newCategory,
    });

    return newCategory;
  }

  async update(id, updates) {
    const existing = await schedulerDb.categories.get(id);
    if (!existing) return undefined;

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await schedulerDb.categories.put(updated);

    // Queue sync
    await schedulerDb.syncQueue.add({
      id: crypto.randomUUID(),
      entity: 'category',
      action: 'update',
      record_id: id,
      timestamp: Date.now(),
      retries: 0,
      data: updated,
    });

    return updated;
  }

  async delete(id) {
    await schedulerDb.categories.delete(id);

    // Queue sync
    await schedulerDb.syncQueue.add({
      id: crypto.randomUUID(),
      entity: 'category',
      action: 'delete',
      record_id: id,
      timestamp: Date.now(),
      retries: 0,
    });
  }
}

export const categoryRepository = new CategoryRepository();
