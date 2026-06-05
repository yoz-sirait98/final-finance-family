import { useQuery } from '@tanstack/vue-query';
import { dashboardService } from '../services/dashboardService';
import { useAuthStore } from '../stores/auth';
import { computed } from 'vue';

export function useDashboard(month, year) {
  const authStore = useAuthStore();
  
  return useQuery({
    queryKey: computed(() => ['dashboard', month.value, year.value, authStore.familyId]),
    queryFn: async () => {
      const { data } = await dashboardService.full({
        month: month.value,
        year: year.value,
      });
      return data.data;
    },
    enabled: computed(() => !!authStore.familyId),
    staleTime: 0, // 0 prevents caching old data when navigating back after inserting transactions
    refetchOnMount: true,
  });
}
