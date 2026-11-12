import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export const WALLET_QUERY_KEYS = {
  depositConfig: ['wallet', 'deposit_config'] as const,
  binanceConfig: ['wallet', 'binance_config'] as const,
  history: (params?: any) => ['wallet', 'history', params] as const,
};

export function useDepositConfigQuery() {
  return useQuery<any>({
    queryKey: WALLET_QUERY_KEYS.depositConfig,
    queryFn: async () => {
      const { data } = await api.get('/settings/deposit_config');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useBinanceConfigQuery() {
  return useQuery<any>({
    queryKey: WALLET_QUERY_KEYS.binanceConfig,
    queryFn: async () => {
      const { data } = await api.get('/settings/binance_config');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useWalletHistoryQuery(params: {
  type?: 'deposit' | 'withdraw' | 'all';
  page?: number;
  limit?: number;
  enabled?: boolean;
}) {
  const { type = 'all', page = 1, limit = 20, enabled = true } = params;

  return useQuery<any>({
    queryKey: WALLET_QUERY_KEYS.history({ type, page, limit }),
    queryFn: async () => {
      const queryParams: any = { page, limit };
      if (type && type !== 'all') {
        queryParams.type = type;
      }
      const { data } = await api.get('/wallet/history', { params: queryParams });
      return data;
    },
    enabled,
    staleTime: 15 * 1000,
  });
}

