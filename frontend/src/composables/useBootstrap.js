import { useQuery } from '@tanstack/vue-query';
import api from '../services/api';

export function useBootstrap() {
  return useQuery({
    queryKey: ['bootstrap'],
    queryFn: async () => {
      const { data } = await api.get('/bootstrap');
      return data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: true,
  });
}
