import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

const crud = createCrudService('shopping_plans');

export const shoppingPlanService = {
  ...crud,
  list: async (params = {}) => {
    let query = supabase.from('shopping_plans').select('*, created_by_member:members!created_by(id, name), transaction:transactions(*), shopping_items(price)').order('created_at', { ascending: false });
    
    if (params.status) query = query.eq('status', params.status);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { data: { data } };
  },

  /**
   * Mark a shopping plan as done WITHOUT creating a transaction.
   */
  markAsDone: async (planId) => {
    const { data, error } = await supabase.from('shopping_plans')
      .update({ status: 'done' })
      .eq('id', planId)
      .select();
    if (error) throw error;
    return { data };
  },

  /**
   * Lock a shopping plan (status = 'locked').
   * Locked plans cannot be deleted and items become read-only.
   */
  lock: async (planId) => {
    const { data, error } = await supabase.from('shopping_plans')
      .update({ status: 'locked' })
      .eq('id', planId)
      .select();
    if (error) throw error;
    return { data };
  },

  /**
   * Checkout: mark as locked AND create a linked expense transaction.
   */
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
    
    // 3. Mark the plan as locked and link transaction
    const { data: updatedPlan, error: updateErr } = await supabase.from('shopping_plans')
        .update({ status: 'locked', transaction_id: txn.id })
        .eq('id', planId)
        .select();
        
    if (updateErr) throw updateErr;
    
    return { data: { transaction: txn, plan: updatedPlan } };
  },

  /**
   * Create a shopping plan + items from a scanned receipt (auto-done).
   * @param {string} location - Store/merchant name
   * @param {Array<{name: string, price: number, qty: number}>} items - Parsed items
   * @param {string} createdBy - Member ID who scanned the receipt
   * @returns plan + items
   */
  createFromReceipt: async (location, items, createdBy) => {
    const family_id = useAuthStore().familyId;

    // 1. Create the plan with status = done
    const { data: plan, error: planErr } = await supabase.from('shopping_plans')
      .insert([{
        family_id,
        location,
        created_by: createdBy,
        status: 'done',
        assigned_members: []
      }])
      .select()
      .single();
    if (planErr) throw planErr;

    const itemRows = items.map(item => ({
      shopping_plan_id: plan.id,
      name: item.name,
      price: item.price,
      added_by: createdBy,
      is_checked: true
    }));

    const { data: insertedItems, error: itemsErr } = await supabase.from('shopping_items')
      .insert(itemRows)
      .select();
    if (itemsErr) throw itemsErr;

    return { data: { plan, items: insertedItems } };
  },

  /**
   * Delete a shopping plan. Plans with status 'locked' CANNOT be deleted.
   */
  delete: async (id) => {
    // 0. Guard: check status
    const { data: plan, error: fetchErr } = await supabase.from('shopping_plans').select('status, transaction_id').eq('id', id).single();
    if (fetchErr && fetchErr.code !== 'PGRST116') throw fetchErr;

    if (plan && plan.status === 'locked') {
      throw new Error('Locked shopping plans cannot be deleted.');
    }

    // 1. If it has a transaction, delete the transaction
    if (plan && plan.transaction_id) {
      const { error: txnErr } = await supabase.from('transactions').delete().eq('id', plan.transaction_id);
      if (txnErr) throw txnErr;
    }

    // 2. Delete the shopping plan
    const { data, error } = await supabase.from('shopping_plans').delete().eq('id', id).select();
    if (error) throw error;
    
    return { data };
  }
};
