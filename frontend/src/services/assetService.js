import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';
import { taskRepository } from '../db/taskRepository';

export const assetService = {
  // ── 1. Assets CRUD ───────────────────────────────────────────────
  listAssets: async (params = {}) => {
    let query = supabase
      .from('assets')
      .select('*, member:members(id, name, role)', { count: 'exact' });

    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    if (params.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }
    if (params.assigned_member_id) {
      query = query.eq('assigned_member_id', params.assigned_member_id);
    }
    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      query = query.or(`name.ilike.%${q}%,brand.ilike.%${q}%,model.ilike.%${q}%,license_plate.ilike.%${q}%,location.ilike.%${q}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: { data, total: count } };
  },

  getAssetById: async (id) => {
    const { data, error } = await supabase
      .from('assets')
      .select(`
        *,
        member:members(id, name, role),
        warranties:asset_warranties(*),
        maintenance_schedules:asset_maintenance_schedules(*, member:members(id, name, role)),
        maintenance_logs:asset_maintenance_logs(*, member:members(id, name, role), transaction:transactions(id, amount, account_id))
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: { data } };
  },

  createAsset: async (payload) => {
    const authStore = useAuthStore();
    const family_id = authStore.familyId;
    const user_id = authStore.user?.id;

    const { data, error } = await supabase
      .from('assets')
      .insert([{
        ...payload,
        family_id,
        created_by: user_id,
      }])
      .select('*, member:members(id, name, role)')
      .single();

    if (error) throw error;
    return { data: { data } };
  },

  updateAsset: async (id, payload) => {
    const { data, error } = await supabase
      .from('assets')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, member:members(id, name, role)')
      .single();

    if (error) throw error;
    return { data: { data } };
  },

  deleteAsset: async (id) => {
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ── 2. Warranties CRUD ───────────────────────────────────────────
  listWarranties: async (params = {}) => {
    let query = supabase
      .from('asset_warranties')
      .select('*, asset:assets(id, name, category, brand, model)');

    if (params.asset_id) {
      query = query.eq('asset_id', params.asset_id);
    }
    if (params.status && params.status !== 'all') {
      query = query.eq('status', params.status);
    }

    query = query.order('end_date', { ascending: true, nullsFirst: false });

    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },

  createWarranty: async (payload) => {
    const authStore = useAuthStore();
    const family_id = authStore.familyId;
    const user_id = authStore.user?.id;

    const { data, error } = await supabase
      .from('asset_warranties')
      .insert([{
        ...payload,
        family_id,
        created_by: user_id,
      }])
      .select('*, asset:assets(id, name, category, brand, model)')
      .single();

    if (error) throw error;
    return { data: { data } };
  },

  updateWarranty: async (id, payload) => {
    const { data, error } = await supabase
      .from('asset_warranties')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, asset:assets(id, name, category, brand, model)')
      .single();

    if (error) throw error;
    return { data: { data } };
  },

  deleteWarranty: async (id) => {
    const { error } = await supabase.from('asset_warranties').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ── 3. Maintenance Schedules CRUD ────────────────────────────────
  listMaintenanceSchedules: async (params = {}) => {
    let query = supabase
      .from('asset_maintenance_schedules')
      .select('*, asset:assets(id, name, category, brand, model, license_plate, current_odometer), member:members(id, name, role)');

    if (params.asset_id) {
      query = query.eq('asset_id', params.asset_id);
    }
    if (params.is_active !== undefined) {
      query = query.eq('is_active', params.is_active);
    }

    query = query.order('next_due_date', { ascending: true, nullsFirst: false });

    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },

  createMaintenanceSchedule: async (payload) => {
    const authStore = useAuthStore();
    const family_id = authStore.familyId;
    const user_id = authStore.user?.id;

    const { data, error } = await supabase
      .from('asset_maintenance_schedules')
      .insert([{
        ...payload,
        family_id,
        created_by: user_id,
      }])
      .select('*, asset:assets(id, name, category, brand, model, license_plate, current_odometer), member:members(id, name, role)')
      .single();

    if (error) throw error;
    return { data: { data } };
  },

  updateMaintenanceSchedule: async (id, payload) => {
    const { data, error } = await supabase
      .from('asset_maintenance_schedules')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, asset:assets(id, name, category, brand, model, license_plate, current_odometer), member:members(id, name, role)')
      .single();

    if (error) throw error;
    return { data: { data } };
  },

  deleteMaintenanceSchedule: async (id) => {
    const { error } = await supabase.from('asset_maintenance_schedules').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ── 4. Maintenance Logs CRUD & Cross-Posting ─────────────────────
  listMaintenanceLogs: async (params = {}) => {
    let query = supabase
      .from('asset_maintenance_logs')
      .select('*, asset:assets(id, name, category, license_plate), member:members(id, name, role), transaction:transactions(id, amount, account_id)');

    if (params.asset_id) {
      query = query.eq('asset_id', params.asset_id);
    }
    if (params.schedule_id) {
      query = query.eq('schedule_id', params.schedule_id);
    }

    query = query.order('performed_date', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },

  createMaintenanceLog: async (logPayload, expenseOptions = null) => {
    const authStore = useAuthStore();
    const family_id = authStore.familyId;
    const user_id = authStore.user?.id;

    let linkedTxnId = null;

    // Optional cross-posting to Transactions table
    if (expenseOptions && expenseOptions.createExpense && Number(logPayload.cost) > 0 && expenseOptions.accountId) {
      const { data: txn, error: txnError } = await supabase
        .from('transactions')
        .insert([{
          family_id,
          amount: Number(logPayload.cost),
          type: 'expense',
          account_id: expenseOptions.accountId,
          category_id: expenseOptions.categoryId || null,
          member_id: logPayload.performed_member_id || null,
          transaction_date: logPayload.performed_date || new Date().toISOString().split('T')[0],
          description: expenseOptions.description || `Servis: ${logPayload.title}`,
          receipt_url: logPayload.invoice_url || null,
        }])
        .select()
        .single();

      if (txnError) throw txnError;
      linkedTxnId = txn.id;
    }

    const { data, error } = await supabase
      .from('asset_maintenance_logs')
      .insert([{
        ...logPayload,
        family_id,
        created_by: user_id,
        transaction_id: linkedTxnId,
      }])
      .select('*, asset:assets(id, name, category, license_plate), member:members(id, name, role), transaction:transactions(id, amount, account_id)')
      .single();

    if (error) throw error;
    return { data: { data, transactionId: linkedTxnId } };
  },

  updateMaintenanceLog: async (id, payload) => {
    const { data, error } = await supabase
      .from('asset_maintenance_logs')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, asset:assets(id, name, category, license_plate), member:members(id, name, role), transaction:transactions(id, amount, account_id)')
      .single();

    if (error) throw error;
    return { data: { data } };
  },

  deleteMaintenanceLog: async (id) => {
    const { error } = await supabase.from('asset_maintenance_logs').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  // ── 5. Family Scheduler Chore / Task Synergy ─────────────────────
  syncMaintenanceToScheduler: async (schedule, targetDate = null) => {
    const authStore = useAuthStore();
    const family_id = authStore.familyId;
    const user_id = authStore.user?.id;

    const taskDate = targetDate || schedule.next_due_date || new Date().toISOString().split('T')[0];
    const assetName = schedule.asset?.name || 'Aset';
    const taskTitle = `Servis: ${schedule.title} (${assetName})`;

    // Use taskRepository for offline Dexie sync + Supabase background sync
    const createdTask = await taskRepository.create(
      {
        title: taskTitle,
        description: `Perawatan terjadwal untuk ${assetName}. Estimasi biaya: Rp ${Number(schedule.estimated_cost || 0).toLocaleString('id-ID')}`,
        task_date: taskDate,
        is_all_day: true,
        priority: 'high',
        assigned_member_id: schedule.assigned_member_id || null,
        reminders: [
          { reminder_type: 'notification', minutes_before: 1440 } // 1 day before
        ]
      },
      family_id,
      user_id
    );

    return createdTask;
  }
};
