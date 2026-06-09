import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

const crud = createCrudService('transactions');

export const transactionService = {
  ...crud,
  list: async (params = {}) => {
    let query = supabase.from('transactions').select('*, member:members(*), account:accounts(*), category:categories(*), shopping_plans(*)', { count: 'exact' });
    
    if (params.type) query = query.eq('type', params.type);
    if (params.category_id) query = query.eq('category_id', params.category_id);
    if (params.member_id) query = query.eq('member_id', params.member_id);
    if (params.account_id) query = query.eq('account_id', params.account_id);
    if (params.goal_id) query = query.eq('goal_id', params.goal_id);
    if (params.date_from) query = query.gte('transaction_date', params.date_from);
    if (params.date_to) query = query.lte('transaction_date', params.date_to);
    
    if (params.search) {
      query = query.ilike('description', `%${params.search}%`);
    }

    const sortField = params.sort_by || 'transaction_date';
    const ascending = params.sort_dir === 'asc';
    query = query.order(sortField, { ascending });

    const page = parseInt(params.page) || 1;
    const perPage = parseInt(params.per_page) || 15;
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    
    return { 
      data: { 
        data, 
        meta: {
          current_page: page,
          last_page: Math.ceil((count || data.length) / perPage),
          total: count || data.length,
          from: from + 1,
          to: from + data.length
        }
      } 
    };
  },
  transfer: async (payload) => {
    const family_id = useAuthStore().familyId;
    const { data, error } = await supabase.rpc('handle_transfer_transaction', {
        p_family_id: family_id,
        p_member_id: payload.member_id || null,
        p_from_account_id: payload.from_account_id,
        p_to_account_id: payload.to_account_id,
        p_amount: payload.amount,
        p_date: payload.date || new Date().toISOString().split('T')[0],
        p_description: payload.description || 'Transfer'
    });
    if (error) throw error;
    return { data: { success: true } };
  }
};
