import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export const STATS_QUERY_KEYS = {
  stats: (params: Record<string, any>) => ['stats', params] as const,
};

export function useStatsQuery(params: {
  type: string;
  code?: string;
  limit?: number;
  prize?: string;
  tab?: string;
  enabled?: boolean;
}) {
  const { type, code, limit = 30, prize, tab, enabled = true } = params;

  return useQuery<any>({
    queryKey: STATS_QUERY_KEYS.stats({ type, code, limit, prize, tab }),
    queryFn: async () => {
      const queryParams: any = { type, limit };
      if (code) queryParams.code = code;
      if (prize) queryParams.prize = prize;
      if (tab) queryParams.tab = tab;

      const { data } = await api.get('/draws/stats', { params: queryParams });
      return data;
    },
    enabled,
    staleTime: 60 * 1000,
  });
}

