import { useQuery } from '@tanstack/vue-query';
import { dashboardService } from '../services/dashboardService';

export function useDashboard(month, year) {
  return useQuery({
    queryKey: ['dashboard', month, year],
    queryFn: async () => {
      const { data } = await dashboardService.full({
        month: month.value,
        year: year.value,
      });
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
