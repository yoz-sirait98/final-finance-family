import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

export const createCrudService = (tableName) => ({
  list: async (params = {}) => {
    let query = supabase.from(tableName).select('*').order('created_at', { ascending: false });
    
    // Simple filter handling if params are provided
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
               query = query.eq(key, value);
            }
        });
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: { data } };
  },
  
  show: async (id) => {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) throw error;
    return { data: { data } };
  },
  
  create: async (payload) => {
    const family_id = useAuthStore().familyId;
    const { data, error } = await supabase.from(tableName).insert([{ ...payload, family_id }]).select().single();
    if (error) throw error;
    return { data: { data } };
  },
  
  update: async (id, payload) => {
    const { data, error } = await supabase.from(tableName).update(payload).eq('id', id).select().single();
    if (error) throw error;
    return { data: { data } };
  },
  
  delete: async (id) => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) throw error;
  },
});
