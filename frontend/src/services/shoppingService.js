import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';

const crud = createCrudService('shopping_items');

export const shoppingService = {
  ...crud,
  create: async (payload) => {
    const itemData = {
      ...payload,
      qty: (payload.qty !== undefined && payload.qty !== null && !isNaN(parseFloat(payload.qty))) ? parseFloat(payload.qty) : 1,
      unit: payload.unit ? payload.unit.trim() : 'pcs'
    };

    let { data, error } = await supabase.from('shopping_items').insert([itemData]).select().single();

    // Fallback if migration 000040 (qty, unit columns) is pending in Supabase
    if (error && (error.code === '42703' || error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('schema cache'))) {
      console.warn('[shoppingService] Falling back to basic columns without qty/unit (migration 000040 pending):', error.message);
      const fallbackPayload = { ...payload };
      delete fallbackPayload.qty;
      delete fallbackPayload.unit;
      const res = await supabase.from('shopping_items').insert([fallbackPayload]).select().single();
      if (res.error) throw res.error;
      data = res.data;
      error = null;
    } else if (error) {
      throw error;
    }

    return { data: { data } };
  },

  update: async (id, payload) => {
    const itemData = { ...payload };
    if (itemData.qty !== undefined && itemData.qty !== null) {
      itemData.qty = !isNaN(parseFloat(itemData.qty)) ? parseFloat(itemData.qty) : 1;
    }
    if (itemData.unit !== undefined && itemData.unit !== null) {
      itemData.unit = itemData.unit.trim() || 'pcs';
    }

    let { data, error } = await supabase.from('shopping_items').update(itemData).eq('id', id).select().single();

    // Fallback if migration 000040 is pending
    if (error && (error.code === '42703' || error.code === 'PGRST204' || error.message?.includes('column') || error.message?.includes('schema cache'))) {
      console.warn('[shoppingService] Falling back to basic columns on update (migration 000040 pending):', error.message);
      const fallbackPayload = { ...payload };
      delete fallbackPayload.qty;
      delete fallbackPayload.unit;
      const res = await supabase.from('shopping_items').update(fallbackPayload).eq('id', id).select().single();
      if (res.error) throw res.error;
      data = res.data;
      error = null;
    } else if (error) {
      throw error;
    }

    return { data: { data } };
  },

  list: async (params = {}) => {
    let query = supabase.from('shopping_items').select('*, added_by_member:members!added_by(id, name)').order('created_at', { ascending: false });
    
    if (params.shopping_plan_id) query = query.eq('shopping_plan_id', params.shopping_plan_id);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { data: { data } };
  }
};
