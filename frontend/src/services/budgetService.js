import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

const crud = createCrudService('budgets');

export const budgetService = {
  ...crud,
  alerts: async () => {
    // Legacy endpoint was GET /budgets/alerts
    // For now we might just fetch active budgets and transactions
    // Wait, the new guardrail RPC handles check on transaction insert.
    // Let's just return empty array for now or fetch active limits.
    return { data: { data: [] } };
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
    // Map the JSON response to `{ data }` so it looks like Axios response
    return { data };
  }
};
