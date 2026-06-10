import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

const crud = createCrudService('budgets');

export const budgetService = {
  ...crud,
  list: async (params = {}) => {
    let query = supabase.from('budgets').select('*, category:categories(*)').order('created_at', { ascending: false });
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
           query = query.eq(key, value);
        }
      });
    }

    const { data: budgets, error } = await query;
    if (error) throw error;

    // If month and year are provided, calculate spent amounts
    if (params.month && params.year) {
      // Create first and last day of the month as local strings (YYYY-MM-DD)
      const startDate = `${params.year}-${String(params.month).padStart(2, '0')}-01`;
      const lastDay = new Date(params.year, params.month, 0).getDate();
      const endDate = `${params.year}-${String(params.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')} 23:59:59`;

      const { data: txs } = await supabase.from('transactions')
        .select('category_id, amount')
        .eq('type', 'expense')
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .is('goal_id', null);
      
      const spentByCategory = {};
      (txs || []).forEach(tx => {
         if (tx.category_id) {
           spentByCategory[tx.category_id] = (spentByCategory[tx.category_id] || 0) + Number(tx.amount);
         }
      });

      const enrichedBudgets = budgets.map(b => {
         const spent = spentByCategory[b.category_id] || 0;
         const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
         return {
           ...b,
           spent,
           percentage,
           remaining: b.amount - spent,
           is_over_threshold: percentage > 100
         };
      });

      return { data: { data: enrichedBudgets } };
    }

    return { data: { data: budgets } };
  },
  alerts: async () => {
    try {
      const d = new Date();
      // Fetch the budgets for the current month
      const { data } = await budgetService.list({ month: d.getMonth() + 1, year: d.getFullYear() });
      const budgets = data.data || [];
      // Filter for budgets that are at 80% capacity or higher
      const alerts = budgets.filter(b => b.percentage >= 80);
      return { data: { data: alerts } };
    } catch (e) {
      console.error('Failed to fetch budget alerts:', e);
      return { data: { data: [] } };
    }
  },
  checkGuardrail: async (categoryId, amount, date) => {
    const family_id = useAuthStore().familyId;
    const { data, error } = await supabase.rpc('check_budget_guardrail', {
      p_family_id: family_id,
      p_category_id: categoryId,
      p_amount: amount,
      p_date: date
    });
    if (error) throw error;
    return { data };
  }
};
