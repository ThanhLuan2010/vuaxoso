import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, ShoppingBag, Trophy, Wallet } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'order' | 'win' | 'deposit' | 'promo';
  orderId?: string; // Used for order redirection
  isRead?: boolean;
}

interface NotificationSection {
  title: string;
  data: NotificationItem[];
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { markAllNotificationsAsRead, clearNotifications } = useAppStore();
  const [notificationData, setNotificationData] = useState<NotificationSection[]>([]);
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const groupNotifications = (list: any[]) => {
    const groups: Record<string, NotificationItem[]> = {};

    list.forEach((n: any) => {
      const dateObj = new Date(n.createdAt);
      const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
      const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')}`;
      
      const item: NotificationItem = {
        id: n._id || n.id,
        title: n.title,
        body: n.body,
        time: timeStr,
        type: n.type,
        orderId: n.orderId,
        isRead: n.isRead,
      };

      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(item);
    });

    return Object.keys(groups).map((k) => ({ title: k, data: groups[k] }));
  };

  const fetchNotifications = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await api.get('/notifications/my-notifications', {
        params: { page: pageNum, limit: 10 }
      });
      let notifications = res.data;
      
      // Handle potential wrapped response or non-array
      if (res.data && Array.isArray(res.data.data)) {
        notifications = res.data.data;
      } else if (!Array.isArray(notifications)) {
        notifications = [];
      }

      let combined: any[] = [];
      if (pageNum === 1) {
        combined = notifications;
      } else {
        combined = [...allNotifications, ...notifications];
      }

      setAllNotifications(combined);
      setNotificationData(groupNotifications(combined));
      setHasMore(notifications.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchNotifications(1);
      markAllNotificationsAsRead();
    }, [markAllNotificationsAsRead])
  );

  const onRefresh = React.useCallback(() => {
    fetchNotifications(1, true);
    markAllNotificationsAsRead();
  }, [markAllNotificationsAsRead]);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      fetchNotifications(page + 1);
    }
  };


  const handleNotificationPress = (item: NotificationItem) => {
    if (item.type === 'order' && item.orderId) {
      navigation.navigate('HistoryDetail', { orderId: item.orderId });
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color="#0A3B7C" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Thông Báo</Text>
      <View style={styles.headerBtn} />
    </View>
  );



  const renderIcon = (type: string) => {
    switch (type) {
      case 'order':
        return (
          <View style={styles.iconWrapperGreen}>
            <ShoppingBag size={14} color="#FFF" />
          </View>
        );
      case 'win':
        return (
          <View style={styles.iconWrapperTransparent}>
            <Trophy size={20} color="#FF3B30" />
          </View>
        );
      case 'deposit':
        return (
          <View style={styles.iconWrapperGreenSolid}>
            <Wallet size={14} color="#FFF" />
          </View>
        );
      default:
        return null;
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isPromo = item.type === 'promo';
    
    return (
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        {!isPromo && (
          <View style={styles.iconContainer}>
            {renderIcon(item.type)}
          </View>
        )}
        
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section: { title } }: any) => (
    <Text style={styles.sectionTitle}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {renderHeader()}

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0A3B7C" />
        </View>
      ) : notificationData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Bạn chưa có thông báo nào.</Text>
        </View>
      ) : (
        <SectionList
          sections={notificationData}
          keyExtractor={(item, index) => item.id || `${index}`}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#0A3B7C" />
              </View>
            ) : !hasMore && notificationData.length > 0 ? (
              <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: COLORS.gray400, fontSize: 12, textAlign: 'center' }}>
                  Đã tải hết thông báo
                </Text>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
    backgroundColor: '#FFF',
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A3B7C',
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: SPACING.sm,
    paddingTop: 2,
  },
  // Icon variants
  iconWrapperGreen: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#00A859',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperTransparent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperGreenSolid: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: '#00A859',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0A3B7C',
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
    marginBottom: 8,
  },
  time: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray500,
  },
});
