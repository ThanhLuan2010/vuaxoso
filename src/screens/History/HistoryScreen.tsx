import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Timer } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';

const TAB_STATUS_MAP: Record<string, string> = {
  'Chờ in': 'pending',
  'Hoàn thành': 'completed',
  'Vé huỷ': 'cancelled',
};

const FILTER_MAP: Record<string, string[]> = {
  'Vietlott': ['keno', 'bao_keno', 'power_655', 'mega_645', 'max_3d', 'max_3d_pro', 'max_4d', 'lotto_535', 'lotto_570'],
  'Điện toán': ['loto_235', 'loto_cap', 'dientoan_636', 'bao_loto_2', 'than_tai_4', 'bao_636'],
  'Kiến Thiết': ['kienthiet'],
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState('Chờ in');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (pageNum: number, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params: any = {
        page: pageNum,
        limit: 10,
        status: TAB_STATUS_MAP[activeTab],
      };

      if (activeFilter !== 'Tất cả') {
        const allowed = FILTER_MAP[activeFilter];
        if (allowed) {
          params.gameType = allowed.join(',');
        }
      }

      const res = await api.get('/orders/my-orders', { params });
      const newOrders = Array.isArray(res.data) ? res.data : [];

      if (pageNum === 1) {
        setOrders(newOrders);
      } else {
        setOrders((prev) => [...prev, ...newOrders]);
      }

      setHasMore(newOrders.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.log('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders(1);
    }, [activeTab, activeFilter])
  );

  const onRefresh = useCallback(() => {
    fetchOrders(1, true);
  }, [activeTab, activeFilter]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      fetchOrders(page + 1);
    }
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {['Chờ in', 'Hoàn thành', 'Vé huỷ'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          onPress={() => {
            if (activeTab !== tab) {
              setActiveTab(tab);
              setPage(1);
              setOrders([]);
              setHasMore(true);
            }
          }}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilters = () => (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.filterContainer}
      >
        {['Tất cả', 'Vietlott', 'Điện toán', 'Kiến Thiết'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterItem, activeFilter === filter && styles.filterItemActive]}
            onPress={() => {
              if (activeFilter !== filter) {
                setActiveFilter(filter);
                setPage(1);
                setOrders([]);
                setHasMore(true);
              }
            }}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const getDateGroupLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return `Ngày ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const renderOrderItem = ({ item: ticket, index }: { item: any; index: number }) => {
    const isKienThiet = ticket.gameType?.startsWith('kienthiet');
    let ticketTypeStr = ticket.gameType ? ticket.gameType.toUpperCase() : 'VÉ SỐ';
    if (isKienThiet) {
      const parts = ticket.gameType.split('_');
      ticketTypeStr = parts[1] ? parts[1].toUpperCase() : 'KIẾN THIẾT';
    } else {
      switch (ticket.gameType) {
        case 'max_3d': ticketTypeStr = 'MAX 3D'; break;
        case 'max_4d': ticketTypeStr = 'MAX 4D'; break;
        case 'lotto_535': ticketTypeStr = 'LOTTO 5/35'; break;
        case 'lotto_570': ticketTypeStr = 'LOTTO 5/70'; break;
        case 'loto_235': ticketTypeStr = 'LÔ TÔ 235'; break;
        case 'loto_cap': ticketTypeStr = 'LÔ TÔ CẶP'; break;
        case 'xoso_3mien': ticketTypeStr = 'LÔ ĐỀ 3 MIỀN'; break;
        case 'than_tai_4': ticketTypeStr = 'THẦN TÀI 4'; break;
        case 'dientoan_636': ticketTypeStr = 'ĐIỆN TOÁN 636'; break;
        default: ticketTypeStr = ticket.gameType ? ticket.gameType.replace(/_/g, ' ').toUpperCase() : 'VÉ SỐ'; break;
      }
    }

    const formattedPrice = (ticket.totalCost || 0).toLocaleString('vi-VN') + 'đ';
    const dateObj = new Date(ticket.createdAt || Date.now());
    const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')} - ${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

    // Date grouping header check
    const currentGroup = getDateGroupLabel(ticket.createdAt);
    const prevGroup = index > 0 ? getDateGroupLabel(orders[index - 1]?.createdAt) : null;
    const showDateHeader = currentGroup !== prevGroup;

    return (
      <View key={ticket._id || index}>
        {showDateHeader && (
          <Text style={styles.groupTitle}>{currentGroup}</Text>
        )}

        <TouchableOpacity
          style={styles.ticketCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('HistoryDetail', { ticket })}
        >
          <View style={styles.ticketLeft}>
            <Text style={styles.ticketType}>{ticketTypeStr}</Text>
          </View>

          {/* Dotted border line */}
          <View style={styles.ticketDivider}>
            <View style={styles.dottedLine} />
            <View style={styles.halfCircleTop} />
            <View style={styles.halfCircleBottom} />
          </View>

          <View style={styles.ticketRight}>
            <Text style={styles.ticketIdLabel}>
              Mã đơn:<Text style={styles.ticketIdVal}> {ticket.orderId}</Text>
            </Text>

            {ticket.items && ticket.items.length > 0 ? (
              <>
                {ticket.items.slice(0, 3).map((item: any, idx: number) => {
                  const hasMoreNumbers = item.numbers && item.numbers.length > 10;
                  const displayNumbers = hasMoreNumbers ? item.numbers.slice(0, 10) : (item.numbers || []);
                  return (
                    <View key={idx} style={styles.ticketBallsRow}>
                      <Text style={styles.ticketRowLabel}>{item.id || String.fromCharCode(65 + idx)}</Text>
                      {displayNumbers.map((n: string, i: number) => (
                        <View key={i} style={styles.ticketBall}>
                          <Text style={styles.ticketBallText}>{n}</Text>
                        </View>
                      ))}
                      {hasMoreNumbers && (
                        <TouchableOpacity
                          style={styles.moreBallBtn}
                          onPress={() => navigation.navigate('HistoryDetail', { ticket })}
                        >
                          <Text style={styles.moreBallText}>+{item.numbers.length - 10} Xem thêm</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
                {ticket.items.length > 3 && (
                  <Text style={{ fontSize: 13, color: '#0066FF', marginBottom: 8, fontStyle: 'italic' }}>
                    + {ticket.items.length - 3} dãy số khác (xem chi tiết)
                  </Text>
                )}
              </>
            ) : (
              <View style={styles.ticketBallsRow}>
                <Text style={styles.ticketRowLabel}>A</Text>
                {((ticket.numbers && ticket.numbers.length > 10) ? ticket.numbers.slice(0, 10) : (ticket.numbers || [])).map((n: string, i: number) => (
                  <View key={i} style={styles.ticketBall}>
                    <Text style={styles.ticketBallText}>{n}</Text>
                  </View>
                ))}
                {ticket.numbers && ticket.numbers.length > 10 && (
                  <TouchableOpacity
                    style={styles.moreBallBtn}
                    onPress={() => navigation.navigate('HistoryDetail', { ticket })}
                  >
                    <Text style={styles.moreBallText}>+{ticket.numbers.length - 10} Xem thêm</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            <Text style={styles.ticketKy}>Kỳ QSMT: {ticket.drawId || 'Đang cập nhật'}</Text>

            <View style={styles.ticketBottomRow}>
              <View style={styles.timeRow}>
                <Timer size={14} color={COLORS.gray500} />
                <Text style={styles.timeText}>{timeStr}</Text>
              </View>
              <Text style={styles.priceText}>{formattedPrice}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={{ paddingVertical: 16, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ color: COLORS.gray500, fontSize: 12, marginTop: 4 }}>Đang tải thêm...</Text>
        </View>
      );
    }
    if (!hasMore && orders.length > 0) {
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
      {renderTabs()}
      <View style={{ height: 8, backgroundColor: '#F1F5F9' }} />
      {renderFilters()}

      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : orders.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          <Text style={{ color: COLORS.gray500, fontSize: 14 }}>Không có dữ liệu</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, index) => item._id || item.orderId || `${index}`}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A3B7C',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#0066FF',
  },
  tabText: {
    fontSize: 14,
    color: COLORS.gray500,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#0066FF',
  },
  filterContainer: {
    padding: SPACING.md,
    gap: 12,
    alignItems: 'center',
    height: 64,
  },
  filterItem: {
    paddingHorizontal: 16,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.light,
  },
  filterItemActive: {
    backgroundColor: '#0066FF',
    borderColor: '#0066FF',
  },
  filterText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: SPACING.md,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  groupContainer: {
    marginBottom: SPACING.md,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  ticketCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
    minHeight: 100,
  },
  ticketLeft: {
    width: 70,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  ticketBac: {
    color: '#0A3B7C',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 8,
  },
  ticketType: {
    color: '#FF5C00',
    fontWeight: '900',
    fontStyle: 'italic',
    fontSize: 16,
  },
  ticketDivider: {
    width: 2,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  dottedLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  halfCircleTop: {
    position: 'absolute',
    top: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  halfCircleBottom: {
    position: 'absolute',
    bottom: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  ticketRight: {
    flex: 1,
    padding: SPACING.md,
  },
  ticketIdLabel: {
    fontSize: 13,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  ticketIdVal: {
    color: '#0066FF',
    fontWeight: 'bold',
  },
  ticketBallsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  ticketRowLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray600,
  },
  ticketBall: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF5C00',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  ticketBallText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  moreBallBtn: {
    backgroundColor: '#FFF0E6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'center',
    marginLeft: 4,
  },
  moreBallText: {
    fontSize: 11,
    color: '#FF5C00',
    fontWeight: 'bold',
  },
  ticketKy: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  ticketBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.success,
  },
});
