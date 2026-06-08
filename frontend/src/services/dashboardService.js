import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/auth';

export const dashboardService = {
  full: async (params = {}) => {
    const family_id = useAuthStore().familyId;
    const now = new Date();
    const month = params.month !== undefined && params.month !== null ? params.month : now.getMonth() + 1;
    const year = params.year || now.getFullYear();
    const member_id = params.member_id !== undefined && params.member_id !== null ? params.member_id : null;

    const { data, error } = await supabase.rpc('get_dashboard_summary', {
        p_family_id: family_id,
        p_month: month,
        p_year: year,
        p_member_id: member_id
    });
    if (error) throw error;
    return { data: { data } };
  },
  reports: async (params = {}) => {
    // Reports likely use the same data
    return dashboardService.full(params);
  }
};
