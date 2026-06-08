import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

const crud = createCrudService('shopping_plans');

export const shoppingPlanService = {
  ...crud,
  list: async (params = {}) => {
    let query = supabase.from('shopping_plans').select('*, created_by_member:members!created_by(id, name), transaction:transactions(*)').order('created_at', { ascending: false });
    
    if (params.status) query = query.eq('status', params.status);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { data: { data } };
  },
  checkout: async (planId, transactionPayload) => {
    const family_id = useAuthStore().familyId;
    
    // 1. Get the plan to find the total amount and location
    const { data: items, error: itemsErr } = await supabase.from('shopping_items').select('price').eq('shopping_plan_id', planId);
    if (itemsErr) throw itemsErr;
    
    const totalAmount = items.reduce((sum, item) => sum + Number(item.price), 0);
    
    const { data: plan, error: planErr } = await supabase.from('shopping_plans').select('location').eq('id', planId).single();
    if (planErr) throw planErr;

    // 2. Create the transaction
    const { data: txn, error: txnError } = await supabase.from('transactions').insert([{
        family_id,
        ...transactionPayload,
        amount: totalAmount,
        type: 'expense',
        description: `Transaction at ${plan.location}`
    }]).select().single();
    
    if (txnError) throw txnError;
    
    // 3. Mark the plan as done and link transaction
    const { data: updatedPlan, error: updateErr } = await supabase.from('shopping_plans')
        .update({ status: 'done', transaction_id: txn.id })
        .eq('id', planId)
        .select();
        
    if (updateErr) throw updateErr;
    
    return { data: { transaction: txn, plan: updatedPlan } };
  }
};
