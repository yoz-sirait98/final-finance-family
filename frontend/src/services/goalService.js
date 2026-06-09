import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';

const crud = createCrudService('saving_goals');

export const goalService = {
  ...crud,
  list: async (params = {}) => {
    let query = supabase.from('saving_goals')
      .select('*, account:accounts(name)')
      .order('created_at', { ascending: false });
      
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
           query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;
    if (error) throw error;

    const enriched = (data || []).map(g => {
      const current = Number(g.current_amount || 0);
      const target = Number(g.target_amount || 0);
      const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
      
      let formattedDeadline = g.deadline;
      if (g.deadline) {
        const d = new Date(g.deadline);
        formattedDeadline = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }

      return {
        ...g,
        deadline_raw: g.deadline,
        deadline: formattedDeadline,
        account_name: g.account?.name,
        progress_percentage: percentage
      };
    });

    return { data: { data: enriched } };
  },
  contribute: async (id, payload) => {
    const { data: goal, error: fetchError } = await supabase
      .from('saving_goals')
      .select('current_amount')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newAmount = Number(goal.current_amount || 0) + Number(payload.amount || 0);

    const { data, error } = await supabase
      .from('saving_goals')
      .update({ current_amount: newAmount })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  },
  checkHasTransactions: async (id) => {
    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('goal_id', id);
    if (error) throw error;
    return count > 0;
  }
};
