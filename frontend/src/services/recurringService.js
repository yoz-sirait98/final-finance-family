import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';

const crud = createCrudService('recurring_transactions');

export const recurringService = {
  ...crud,
  list: async (params = {}) => {
    let query = supabase.from('recurring_transactions')
      .select('*, category:categories(name)')
      .eq('type', 'expense')
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

    const enriched = (data || []).map(r => {
      let formattedNextDue = r.next_due_date;
      if (r.next_due_date) {
        const d = new Date(r.next_due_date);
        formattedNextDue = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
      }
      return {
        ...r,
        next_due_date_raw: r.next_due_date,
        next_due_date: formattedNextDue
      };
    });

    return { data: { data: enriched } };
  }
};
