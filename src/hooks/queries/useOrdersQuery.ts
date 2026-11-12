import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

export const ORDER_QUERY_KEYS = {
  myOrders: (status?: string, gameType?: string, page?: number, limit?: number) =>
    ['orders', 'my-orders', { status, gameType, page, limit }] as const,
  orderDetail: (orderId: string) => ['orders', 'detail', orderId] as const,
};

export function useMyOrdersQuery(params: {
  status?: string;
  gameType?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}) {
  const { status, gameType, page = 1, limit = 10, enabled = true } = params;

  return useQuery<any[]>({
    queryKey: ORDER_QUERY_KEYS.myOrders(status, gameType, page, limit),
    queryFn: async () => {
      const queryParams: any = { page, limit };
      if (status) queryParams.status = status;
      if (gameType) queryParams.gameType = gameType;

      const { data } = await api.get('/orders/my-orders', { params: queryParams });
      return Array.isArray(data) ? data : [];
    },
    enabled,
    staleTime: 10 * 1000,
  });
}

export function useOrderDetailQuery(orderId: string, enabled: boolean = true) {
  return useQuery<any>({
    queryKey: ORDER_QUERY_KEYS.orderDetail(orderId),
    queryFn: async () => {
      if (!orderId) return null;
      const { data } = await api.get(`/orders/${orderId}`);
      return data;
    },
    enabled: enabled && !!orderId,
    staleTime: 20 * 1000,
  });
}

