import { createCrudService } from './crud';
import { supabase } from '../lib/supabase';

const crud = createCrudService('shopping_items');

export const shoppingService = {
  ...crud,
  list: async (params = {}) => {
    let query = supabase.from('shopping_items').select('*, added_by_member:members!added_by(id, name)').order('created_at', { ascending: false });
    
    if (params.shopping_plan_id) query = query.eq('shopping_plan_id', params.shopping_plan_id);
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { data: { data } };
  }
};
