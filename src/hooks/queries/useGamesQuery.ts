import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { GameModel } from '../../store/useAppStore';

export const GAME_QUERY_KEYS = {
  all: ['games'] as const,
};

export function useGamesQuery() {
  return useQuery<GameModel[]>({
    queryKey: GAME_QUERY_KEYS.all,
    queryFn: async () => {
      const { data } = await api.get('/games');
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

