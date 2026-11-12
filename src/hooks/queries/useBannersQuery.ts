import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export const BANNER_QUERY_KEYS = {
  active: ['banners', 'active'] as const,
};

export function useBannersQuery() {
  return useQuery<any[]>({
    queryKey: BANNER_QUERY_KEYS.active,
    queryFn: async () => {
      const { data } = await api.get('/banners/active');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

