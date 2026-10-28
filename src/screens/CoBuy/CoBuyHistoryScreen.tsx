import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, HelpCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function CoBuyHistoryScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'joined' | 'cancelled'>('joined');
  const [rooms, setRooms] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await api.get('/cobuy/my-history', {
        params: {
          status: activeTab,
          page: pageNum,
          limit: 10,
        }
      });
      const newItems = Array.isArray(res.data) ? res.data : [];

      if (pageNum === 1) {
        setRooms(newItems);
      } else {
        setRooms((prev) => [...prev, ...newItems]);
      }

      setHasMore(newItems.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.log('Error fetching CoBuy history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory(1);
    }, [fetchHistory])
  );

  const onRefresh = useCallback(() => {
    fetchHistory(1, true);
  }, [fetchHistory]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      fetchHistory(page + 1);
    }
  };

  const renderRoomItem = ({ item: room }: { item: any }) => (
    <TouchableOpacity
      style={styles.roomCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CoBuyDetail', {
        roomId: room._id || room.id,
        roomNum: room.roomNum,
        baoType: room.baoType,
        totalCost: room.totalCost,
        progress: room.progress,
        minGop: room.minGop,
        isCompleted: room.status === 'closed',
        gameType: room.gameType,
        ticketNumbers: room.ticketNumbers
      })}
    >
      <View style={styles.leftCol}>
        <Text style={styles.gameCode}>{room.gameType === 'mega' ? 'ĐT 6/45' : 'ĐT 6/55'}</Text>
        <Text style={styles.baoLabel}>Bao {room.baoType}</Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.centerCol}>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Nhóm: </Text>
          <Text style={styles.detailValBold}>{room.roomNum}</Text>
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tổng giá trị: </Text>
          <Text style={styles.detailValRed}>{(room.totalCost || 0).toLocaleString('vi-VN')}đ</Text>
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Kỳ quay: </Text>
          <Text style={styles.detailVal}>{room.drawNum} - {room.drawDate}</Text>
        </Text>
      </View>

      <View style={styles.badgeRibbon}>
        <Text style={styles.badgeTextSmall}>Tiến độ</Text>
        <Text style={styles.badgeTextLarge}>{room.progress || 0}%</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F2942" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LỊCH SỬ MUA CHUNG</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <HelpCircle size={14} color="#FF8A00" />
          <Text style={styles.helpText}>Hướng dẫn</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'joined' && styles.tabItemActive]}
          onPress={() => {
            if (activeTab !== 'joined') {
              setActiveTab('joined');
              setPage(1);
              setRooms([]);
              setHasMore(true);
            }
          }}
        >
          <Text style={[styles.tabText, activeTab === 'joined' && styles.tabTextActive]}>
            Đã tham gia
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'cancelled' && styles.tabItemActive]}
          onPress={() => {
            if (activeTab !== 'cancelled') {
              setActiveTab('cancelled');
              setPage(1);
              setRooms([]);
              setHasMore(true);
            }
          }}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>
            Đã huỷ
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.content}>
          <Text style={styles.emptyText}>Chưa có lịch sử mua chung nào</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item, index) => item._id || item.id || `${index}`}
          renderItem={renderRoomItem}
          contentContainerStyle={styles.scrollList}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : !hasMore && rooms.length > 0 ? (
              <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: COLORS.gray400, fontSize: 12 }}>Đã hiển thị tất cả</Text>
              </View>
            ) : null
          }
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE8CC',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF9DB',
  },
  helpText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF8A00',
    marginLeft: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#0056B3',
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7F8E9C',
  },
  tabTextActive: {
    color: '#0F2942',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#7F8E9C',
    fontWeight: '500',
  },
  scrollList: {
    padding: 12,
  },
  roomCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
    position: 'relative',
    ...SHADOWS.light,
  },
  leftCol: {
    width: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E51F27',
    marginBottom: 2,
  },
  baoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F2942',
  },
  cardDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E9ECEF',
    marginHorizontal: 10,
  },
  centerCol: {
    flex: 1,
    justifyContent: 'center',
  },
  detailRow: {
    fontSize: 12,
    color: '#495057',
    marginBottom: 2,
  },
  detailLabel: {
    color: '#6C757D',
  },
  detailValBold: {
    fontWeight: 'bold',
    color: '#0F2942',
  },
  detailValRed: {
    fontWeight: 'bold',
    color: '#E51F27',
  },
  detailVal: {
    color: '#212529',
  },
  badgeRibbon: {
    backgroundColor: '#EBF4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  badgeTextSmall: {
    fontSize: 10,
    color: '#0056B3',
  },
  badgeTextLarge: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0056B3',
  },
});
