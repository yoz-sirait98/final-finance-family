import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

export const dashboardService = {
  full: async (params = {}) => {
    const family_id = useAuthStore().familyId;
    const now = new Date();
    const { data, error } = await supabase.rpc('get_dashboard_summary', {
        p_family_id: family_id,
        p_month: params.month || now.getMonth() + 1,
        p_year: params.year || now.getFullYear()
    });
    if (error) throw error;
    return { data: { data } };
  },
  reports: async () => {
    // Reports likely use the same data
    return dashboardService.full();
  }
};
