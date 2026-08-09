import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Timer } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  
  const [activeTab, setActiveTab] = useState('Chờ in');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFocused) {
      fetchOrders();
    }
  }, [isFocused]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      setOrders(res.data || []);
    } catch (error) {
      console.log('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {['Chờ in', 'Hoàn thành', 'Vé huỷ'].map(tab => (
        <TouchableOpacity 
          key={tab} 
          style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderFilters = () => (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.filterContainer}>
        {['Tất cả', 'Vietlott', 'Điện toán', 'Kiến Thiết'].map(filter => (
          <TouchableOpacity 
            key={filter} 
            style={[styles.filterItem, activeFilter === filter && styles.filterItemActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderList = () => {
    if (loading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    // Map tab name to status
    const tabStatusMap: any = {
      'Chờ in': 'pending',
      'Hoàn thành': 'completed',
      'Vé huỷ': 'cancelled'
    };
    
    // Map filter to game Type loosely
    const filterMap: any = {
      'Vietlott': ['keno', 'bao_keno', 'power_655', 'mega_645', 'max_3d', 'max_3d_pro', 'lotto_535'],
      'Điện toán': ['loto_235', 'loto_cap', 'dientoan_636', 'bao_loto_2', 'than_tai_4', 'bao_636'],
      'Kiến Thiết': ['kienthiet']
    };

    let filteredOrders = orders.filter(o => o.status === tabStatusMap[activeTab]);

    if (activeFilter !== 'Tất cả') {
      const allowedTypes = filterMap[activeFilter] || [];
      filteredOrders = filteredOrders.filter(o => allowedTypes.includes(o.gameType) || (activeFilter === 'Kiến Thiết' && o.gameType.startsWith('kienthiet')));
    }

    // Grouping by dateGroup
    const groups: Record<string, any[]> = {};
    filteredOrders.forEach(o => {
      const date = new Date(o.createdAt);
      const dateGroup = `Ngày ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      if (!groups[dateGroup]) groups[dateGroup] = [];
      groups[dateGroup].push(o);
    });

    if (filteredOrders.length === 0) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
          <Text style={{ color: COLORS.gray500 }}>Không có dữ liệu</Text>
        </View>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {Object.entries(groups).map(([dateGroup, tickets], gIdx) => (
          <View key={gIdx} style={styles.groupContainer}>
            <Text style={styles.groupTitle}>{dateGroup}</Text>
            
            {tickets.map((ticket, tIdx) => {
              const isKienThiet = ticket.gameType.startsWith('kienthiet');
              const ticketTypeStr = isKienThiet ? 'KIẾN THIẾT' : ticket.gameType.toUpperCase();
              const formattedPrice = ticket.totalCost.toLocaleString('vi-VN') + 'đ';
              const dateObj = new Date(ticket.createdAt);
              const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')} - ${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
              
              return (
                <TouchableOpacity 
                  key={tIdx} 
                  style={styles.ticketCard}
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
                    <Text style={styles.ticketIdLabel}>Mã đơn:<Text style={styles.ticketIdVal}>{ticket.orderId}</Text></Text>
                    {ticket.items && ticket.items.length > 0 ? (
                      <>
                        {ticket.items.slice(0, 3).map((item: any, idx: number) => (
                          <View key={idx} style={styles.ticketBallsRow}>
                            <Text style={styles.ticketRowLabel}>{item.id || String.fromCharCode(65 + idx)}</Text>
                            {item.numbers.map((n: string, i: number) => (
                              <View key={i} style={styles.ticketBall}>
                                <Text style={styles.ticketBallText}>{n}</Text>
                              </View>
                            ))}
                          </View>
                        ))}
                        {ticket.items.length > 3 && (
                          <Text style={{ fontSize: 13, color: '#0066FF', marginBottom: 8, fontStyle: 'italic' }}>
                            + {ticket.items.length - 3} dãy số khác (xem chi tiết)
                          </Text>
                        )}
                      </>
                    ) : (
                      <View style={styles.ticketBallsRow}>
                        <Text style={styles.ticketRowLabel}>A</Text>
                        {(ticket.numbers || []).map((n: string, i: number) => (
                          <View key={i} style={styles.ticketBall}>
                            <Text style={styles.ticketBallText}>{n}</Text>
                          </View>
                        ))}
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
              )
            })}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <Text style={styles.headerTitle}>Lịch sử</Text>
      {renderTabs()}
      <View style={{ height: 8, backgroundColor: '#F1F5F9' }} />
      {renderFilters()}
      {renderList()}
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
  }
});
