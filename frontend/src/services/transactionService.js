import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

const crud = createCrudService('transactions');

export const transactionService = {
  ...crud,
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
