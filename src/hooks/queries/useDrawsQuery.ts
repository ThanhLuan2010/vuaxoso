import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { DrawModel } from '../../store/useAppStore';

export const DRAW_QUERY_KEYS = {
  active: ['draws', 'active'] as const,
  results: (type?: string, code?: string, page?: number, limit?: number) =>
    ['draws', 'results', { type, code, page, limit }] as const,
  kienThietSchedule: ['draws', 'kienthiet-schedule'] as const,
};

export function useActiveDrawsQuery() {
  return useQuery<DrawModel[]>({
    queryKey: DRAW_QUERY_KEYS.active,
    queryFn: async () => {
      const { data } = await api.get('/draws/active');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useDrawResultsQuery() {
  return useQuery<DrawModel[]>({
    queryKey: DRAW_QUERY_KEYS.results(),
    queryFn: async () => {
      const { data } = await api.get('/draws/results');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30 * 1000,
  });
}

export function usePaginatedResultsQuery(type?: string, code?: string, page: number = 1, limit: number = 10) {
  return useQuery<any[]>({
    queryKey: DRAW_QUERY_KEYS.results(type, code, page, limit),
    queryFn: async () => {
      const params: any = { page, limit };
      if (type) params.type = type;
      if (code) params.code = code;
      const { data } = await api.get('/draws/results', { params });
      return Array.isArray(data) ? data : [];
    },
    staleTime: 30 * 1000,
  });
}

export function useKienThietScheduleQuery() {
  return useQuery<any[]>({
    queryKey: DRAW_QUERY_KEYS.kienThietSchedule,
    queryFn: async () => {
      const { data } = await api.get('/draws/kienthiet-schedule');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

