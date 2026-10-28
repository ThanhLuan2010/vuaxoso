import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, HelpCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme/theme';
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface CoBuyRoom {
  _id: string;
  id?: string;
  gameType: 'mega' | 'power';
  roomNum: string;
  baoType: number;
  totalCost: number;
  minGop: number;
  drawNum: string;
  drawDate: string;
  closeTime: string;
  progress: number;
  ticketNumbers: string[];
}

export default function CoBuyScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'mega' | 'power'>('mega');
  const [rooms, setRooms] = useState<CoBuyRoom[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRooms = useCallback(async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await api.get('/cobuy/rooms', {
        params: {
          gameType: activeTab,
          status: 'open',
          page: pageNum,
          limit: 10,
        }
      });
      const newRooms = Array.isArray(res.data) ? res.data : [];

      if (pageNum === 1) {
        setRooms(newRooms);
      } else {
        setRooms((prev) => [...prev, ...newRooms]);
      }

      setHasMore(newRooms.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching CoBuy rooms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [activeTab]);

  const onRefresh = useCallback(() => {
    fetchRooms(1, true);
  }, [fetchRooms]);

  useFocusEffect(
    useCallback(() => {
      fetchRooms(1);
    }, [fetchRooms])
  );

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      fetchRooms(page + 1);
    }
  };

  const renderRoomItem = ({ item: room }: { item: CoBuyRoom }) => (
    <TouchableOpacity
      style={styles.roomCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('CoBuyDetail', {
        roomId: room._id,
        roomNum: room.roomNum,
        baoType: room.baoType,
        totalCost: room.totalCost,
        progress: room.progress,
        minGop: room.minGop,
        isCompleted: false,
        gameType: room.gameType,
        ticketNumbers: room.ticketNumbers
      })}
    >
      {/* Left Col */}
      <View style={styles.leftCol}>
        <Text style={styles.gameCode}>{room.gameType === 'mega' ? 'ĐT 6/45' : 'ĐT 6/55'}</Text>
        <Text style={styles.baoLabel}>Bao {room.baoType}</Text>
        <Text style={styles.myShareLabel}>Bạn đã góp</Text>
        <Text style={styles.myShareVal}>0%</Text>
      </View>

      {/* Divider line */}
      <View style={styles.cardDivider} />

      {/* Center Col */}
      <View style={styles.centerCol}>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Nhóm: </Text>
          <Text style={styles.detailValBold}>{room.roomNum}</Text>
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Góp tối thiểu: </Text>
          <Text style={styles.detailValRed}>{room.minGop.toLocaleString('vi-VN')}đ</Text>
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Kỳ quay: </Text>
          <Text style={styles.detailVal}>{room.drawNum} - {room.drawDate}</Text>
        </Text>
        <Text style={styles.detailRow}>
          <Text style={styles.detailLabel}>Thời gian đóng: </Text>
          <Text style={styles.detailVal}>{room.closeTime} - {room.drawDate}</Text>
        </Text>
      </View>

      {/* Progress Badge */}
      <View style={styles.badgeRibbon}>
        <Text style={styles.badgeTextSmall}>Hoàn thành</Text>
        <Text style={styles.badgeTextLarge}>{room.progress}%</Text>
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
        <Text style={styles.headerTitle}>CÙNG CHỌN SỐ</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <HelpCircle size={14} color="#FF8A00" />
          <Text style={styles.helpText}>Hướng dẫn</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'mega' && styles.tabItemActive]}
          onPress={() => {
            if (activeTab !== 'mega') {
              setActiveTab('mega');
              setPage(1);
              setRooms([]);
              setHasMore(true);
            }
          }}
        >
          <Text style={[styles.tabLabel, { color: '#E51F27' }]}>MEGA</Text>
          <Text style={[styles.tabValue, { color: '#E51F27' }, activeTab === 'mega' && styles.tabTextActive]}>6/45</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'power' && styles.tabItemActive]}
          onPress={() => {
            if (activeTab !== 'power') {
              setActiveTab('power');
              setPage(1);
              setRooms([]);
              setHasMore(true);
            }
          }}
        >
          <Text style={[styles.tabLabel, { color: '#D87A00' }]}>POWER</Text>
          <Text style={[styles.tabValue, { color: '#D87A00' }, activeTab === 'power' && styles.tabTextActive]}>6/55</Text>
        </TouchableOpacity>
      </View>

      {/* Rooms List */}
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : rooms.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          <Text style={{ color: COLORS.gray500, fontSize: 14 }}>Hiện chưa có phòng mở</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item, index) => item._id || `${index}`}
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
                <Text style={{ color: COLORS.gray400, fontSize: 12 }}>Đã hiển thị tất cả các phòng</Text>
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
          }
        />
      )}

      {/* Sticky Bottom Footer */}
      <View style={[styles.footerContainer, { paddingBottom: 16 + insets.bottom }]}>
        <TouchableOpacity style={styles.footerBtnBlue} onPress={() => navigation.navigate('CoBuyHistory')}>
          <Text style={styles.footerBtnText}>Lịch sử mua chung</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerBtnOrange} onPress={() => navigation.navigate('CoBuyCompleted')}>
          <Text style={styles.footerBtnText}>Nhóm hoàn thành</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
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
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#0056B3',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  tabValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  tabTextActive: {
    fontWeight: '900',
  },
  scrollList: {
    padding: 16,
    paddingBottom: 90,
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    ...SHADOWS.light,
    elevation: 3,
  },
  leftCol: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameCode: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E51F27',
    marginBottom: 4,
  },
  baoLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0056B3',
    marginBottom: 8,
  },
  myShareLabel: {
    fontSize: 9,
    color: '#7F8E9C',
  },
  myShareVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  cardDivider: {
    width: 1,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 12,
  },
  centerCol: {
    flex: 1,
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#7F8E9C',
  },
  detailVal: {
    fontSize: 12,
    color: '#0F2942',
    fontWeight: '500',
  },
  detailValBold: {
    fontSize: 12,
    color: '#0F2942',
    fontWeight: 'bold',
  },
  detailValRed: {
    fontSize: 12,
    color: '#E51F27',
    fontWeight: 'bold',
  },
  badgeRibbon: {
    position: 'absolute',
    top: 0,
    right: 12,
    backgroundColor: '#5F27CD',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    alignItems: 'center',
    width: 76,
  },
  badgeTextSmall: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  badgeTextLarge: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 12,
  },
  footerBtnBlue: {
    flex: 1,
    backgroundColor: '#0084FA',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBtnOrange: {
    flex: 1,
    backgroundColor: '#FF6A00',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
