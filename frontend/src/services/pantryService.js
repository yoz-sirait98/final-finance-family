import { createCrudService } from './crud.js';
import { supabase } from '../lib/supabase.js';
import { useAuthStore } from '../stores/auth.js';

const crud = createCrudService('pantry_items');

export const pantryService = {
  ...crud,

  list: async (params = {}) => {
    let query = supabase
      .from('pantry_items')
      .select('*')
      .order('expiration_date', { ascending: true, nullsFirst: false })
      .order('name', { ascending: true });

    if (params.location && params.location !== 'all') {
      query = query.eq('location', params.location);
    }
    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    if (params.status) {
      query = query.eq('status', params.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },

  /**
   * Fetch items that expire within N days
   */
  getExpiringSoon: async (daysThreshold = 3) => {
    const today = new Date().toISOString().split('T')[0];
    const targetDate = new Date(Date.now() + daysThreshold * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('status', 'in_stock')
      .gte('expiration_date', today)
      .lte('expiration_date', targetDate)
      .order('expiration_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Fetch already expired items
   */
  getExpired: async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('status', 'in_stock')
      .lt('expiration_date', today)
      .order('expiration_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Consume or adjust quantity
   */
  adjustQuantity: async (id, deltaQty) => {
    const { data: item, error: fetchErr } = await supabase
      .from('pantry_items')
      .select('quantity')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;

    const newQty = Math.max(0, Number(item.quantity) + deltaQty);
    const newStatus = newQty === 0 ? 'consumed' : newQty <= 1 ? 'low_stock' : 'in_stock';

    const { data, error } = await supabase
      .from('pantry_items')
      .update({ quantity: newQty, status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 1-click restock from a completed shopping item into pantry
   */
  addFromShoppingItem: async (shoppingItem, location = 'fridge') => {
    const authStore = useAuthStore();
    const payload = {
      family_id: authStore.familyId,
      name: shoppingItem.name,
      category: shoppingItem.category || 'other',
      location: location,
      quantity: shoppingItem.qty || 1,
      unit: shoppingItem.unit || 'pcs',
      status: 'in_stock',
      notes: shoppingItem.notes || null,
      created_by: authStore.user?.id || null,
    };

    const { data, error } = await supabase
      .from('pantry_items')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
