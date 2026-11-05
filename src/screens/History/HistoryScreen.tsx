import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  View,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../theme/theme';
import { useMyOrdersQuery } from '../../hooks/queries';
import { styles } from './historyStyles';
import HistoryTabs from './components/HistoryTabs';
import HistoryFilters from './components/HistoryFilters';
import HistoryTicketCard from './components/HistoryTicketCard';

const TAB_STATUS_MAP: Record<string, string> = {
  'Chờ in': 'pending',
  'Hoàn thành': 'completed',
  'Vé huỷ': 'cancelled',
};

const FILTER_MAP: Record<string, string[]> = {
  Vietlott: ['keno', 'bao_keno', 'power_655', 'mega_645', 'max_3d', 'max_3d_pro', 'max_4d', 'lotto_535', 'lotto_570'],
  'Điện toán': ['loto_235', 'loto_cap', 'dientoan_636', 'bao_loto_2', 'than_tai_4', 'bao_636', 'truot_loto'],
  'Kiến Thiết': ['kienthiet', 'kienthiet_MB', 'kienthiet_MN', 'kienthiet_MT'],
  'Lô Đề': ['xoso_3mien', 'lode', 'MB', 'MT', 'MN', 'mb', 'mt', 'mn', 'lode_3mien'],
};

export default function HistoryScreen({ route }: any) {
  const insets = useSafeAreaInsets();
  const initialTab = route?.params?.initialTab || 'Chờ in';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [page, setPage] = useState(1);
  const [accumulatedOrders, setAccumulatedOrders] = useState<any[]>([]);

  const status = TAB_STATUS_MAP[activeTab];
  const gameType = activeFilter !== 'Tất cả' ? FILTER_MAP[activeFilter]?.join(',') : undefined;

  // React Query cached query
  const {
    data: newOrders = [],
    isLoading,
    isFetching,
    refetch,
  } = useMyOrdersQuery({
    status,
    gameType,
    page,
    limit: 10,
  });

  // Handle pagination accumulation
  useEffect(() => {
    if (page === 1) {
      setAccumulatedOrders(newOrders);
    } else if (newOrders.length > 0) {
      setAccumulatedOrders((prev) => {
        const existingIds = new Set(prev.map((o) => o._id || o.orderId));
        const filteredNew = newOrders.filter((o) => !existingIds.has(o._id || o.orderId));
        return [...prev, ...filteredNew];
      });
    }
  }, [newOrders, page]);

  useFocusEffect(
    useCallback(() => {
      setPage(1);
      refetch();
    }, [activeTab, activeFilter])
  );

  const onRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = () => {
    if (!isFetching && newOrders.length === 10) {
      setPage((prev) => prev + 1);
    }
  };

  const hasMore = newOrders.length === 10;

  const renderFooter = () => {
    if (isFetching && page > 1) {
      return (
        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ color: COLORS.gray500, fontSize: 12, marginTop: 4 }}>Đang tải thêm...</Text>
        </View>
      );
    }
    if (!hasMore && accumulatedOrders.length > 0) {
      return (
        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
          <Text style={{ color: COLORS.gray400, fontSize: 12 }}>Đã hiển thị tất cả đơn hàng</Text>
        </View>
      );
    }
    return <View style={{ height: 30 }} />;
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <Text style={styles.headerTitle}>Lịch sử</Text>

      <HistoryTabs
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (activeTab !== tab) {
            setActiveTab(tab);
            setPage(1);
            setAccumulatedOrders([]);
          }
        }}
      />

      <View style={{ height: 8, backgroundColor: '#F1F5F9' }} />

      <HistoryFilters
        activeFilter={activeFilter}
        onSelectFilter={(filter) => {
          if (activeFilter !== filter) {
            setActiveFilter(filter);
            setPage(1);
            setAccumulatedOrders([]);
          }
        }}
      />

      {isLoading && page === 1 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : accumulatedOrders.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          <Text style={{ color: COLORS.gray500, fontSize: 14 }}>Không có dữ liệu</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={accumulatedOrders}
          keyExtractor={(item, index) => item._id || item.orderId || `${index}`}
          renderItem={({ item, index }) => (
            <HistoryTicketCard
              ticket={item}
              index={index}
              prevTicket={index > 0 ? accumulatedOrders[index - 1] : undefined}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={isFetching && page === 1} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </View>
  );
}
