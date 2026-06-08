import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

const crud = createCrudService('shopping_items');

export const shoppingService = {
  ...crud,
  list: async (params = {}) => {
    let query = supabase.from('shopping_items').select('*, added_by_profile:profiles!added_by(full_name, avatar_url)').order('created_at', { ascending: false });
    
    if (params.status) query = query.eq('status', params.status);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { data: { data } };
  },
  checkout: async (itemIds, transactionPayload) => {
    const family_id = useAuthStore().familyId;
    
    // 1. Create the transaction
    const { data: txn, error: txnError } = await supabase.from('transactions').insert([{
        family_id,
        ...transactionPayload,
        type: 'expense'
    }]).select().single();
    
    if (txnError) throw txnError;
    
    // 2. Link the shopping items to the new transaction and mark them as bought
    const { data: items, error: itemsError } = await supabase.from('shopping_items')
        .update({ status: 'bought', transaction_id: txn.id })
        .in('id', itemIds)
        .select();
        
    if (itemsError) throw itemsError;
    
    return { data: { transaction: txn, items } };
  }
};
