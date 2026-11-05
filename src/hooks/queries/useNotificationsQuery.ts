import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

export const NOTIFICATION_QUERY_KEYS = {
  unreadCount: ['notifications', 'unread-count'] as const,
  myNotifications: (page: number, limit: number) => ['notifications', 'my-notifications', { page, limit }] as const,
};

export function useUnreadNotificationsCountQuery() {
  const token = useAppStore((state) => state.token);

  return useQuery<number>({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    queryFn: async () => {
      if (!token) return 0;
      const { data } = await api.get('/notifications/unread-count');
      return typeof data?.unreadCount === 'number' ? data.unreadCount : 0;
    },
    enabled: !!token,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useMyNotificationsQuery(page: number = 1, limit: number = 20) {
  const token = useAppStore((state) => state.token);

  return useQuery<any>({
    queryKey: NOTIFICATION_QUERY_KEYS.myNotifications(page, limit),
    queryFn: async () => {
      const { data } = await api.get('/notifications/my-notifications', {
        params: { page, limit },
      });
      return data;
    },
    enabled: !!token,
    staleTime: 15 * 1000,
  });
}

