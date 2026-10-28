import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme/theme';
import api from '../../services/api';

interface GuideItem {
  _id: string;
  title: string;
  subtitle?: string;
  content: string;
  iconType: string;
}

export default function GuideScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [guides, setGuides] = React.useState<GuideItem[]>([]);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchGuides = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const { data } = await api.get('/guides', {
        params: { page: pageNum, limit: 10 }
      });
      const list = Array.isArray(data) ? data : [];
      if (pageNum === 1) {
        setGuides(list);
      } else {
        setGuides((prev) => [...prev, ...list]);
      }
      setHasMore(list.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching guides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchGuides(1);
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    fetchGuides(1, true);
  }, []);

  const handleLoadMore = () => {
    if (!loading && !loadingMore && !refreshing && hasMore) {
      fetchGuides(page + 1);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>HƯỚNG DẪN</Text>
      <View style={styles.headerBtn} />
    </View>
  );

  const renderIcon = (type: string) => {
    switch (type) {
      case 'X':
        return (
          <View style={styles.iconXContainer}>
            <Text style={styles.iconXText}>X</Text>
          </View>
        );
      case 'KENO':
        return <Text style={styles.logoKeno}>KENO</Text>;
      case 'MUACHUNG':
        return (
          <View style={styles.logoMuaChung}>
            <Text style={styles.logoMuaText}>MUA</Text>
            <Text style={styles.logoChungText}>CHUNG</Text>
          </View>
        );
      case 'POWER':
        return (
          <View style={styles.logoVietlott}>
            <Text style={styles.logoPowerText}>POWER</Text>
            <Text style={styles.logoNumberText}>6/55</Text>
          </View>
        );
      case 'MEGA':
        return (
          <View style={styles.logoVietlott}>
            <Text style={styles.logoMegaText}>MEGA</Text>
            <Text style={styles.logoNumberText}>6/45</Text>
          </View>
        );
      default:
        if (type && type !== 'X') {
          const iconMap: Record<string, { top: string, bottom: string, topColor: string, bottomColor: string }> = {
            'BAO KENO': { top: 'BAO', bottom: 'KENO', topColor: '#D9981B', bottomColor: '#E51F27' },
            'MAX 3D/3DPRO': { top: 'MAX', bottom: '3D/3DPRO', topColor: '#8B5CF6', bottomColor: '#6B21A8' },
            'MAX 4D': { top: 'MAX', bottom: '4D', topColor: '#8B5CF6', bottomColor: '#6B21A8' },
            'LOTTO 5/35': { top: 'LOTTO', bottom: '5/35', topColor: '#3B82F6', bottomColor: '#1E3A8A' },
            'LOTTO 5/70': { top: 'LOTTO', bottom: '5/70', topColor: '#3B82F6', bottomColor: '#1E3A8A' },
            'BINGO18': { top: 'BINGO', bottom: '18', topColor: '#3B82F6', bottomColor: '#1E3A8A' },
            'LÔ TÔ 235': { top: 'LÔ TÔ', bottom: '2-3-5', topColor: '#3B82F6', bottomColor: '#1E3A8A' },
            'LÔ TÔ 234': { top: 'LÔ TÔ', bottom: '2-3-4', topColor: '#3B82F6', bottomColor: '#1E3A8A' },
            'BAO LÔ TÔ 2': { top: 'BAO', bottom: 'LÔ TÔ 2', topColor: '#E51F27', bottomColor: '#3B82F6' },
            'TRƯỢT LÔ TÔ': { top: 'TRƯỢT', bottom: 'LÔ TÔ', topColor: '#E51F27', bottomColor: '#3B82F6' },
            'ĐT 6X36': { top: 'ĐT', bottom: '6X36', topColor: '#10B981', bottomColor: '#047857' },
            'BAO 6X36': { top: 'BAO', bottom: '6X36', topColor: '#E51F27', bottomColor: '#047857' },
            'THẦN TÀI 4': { top: 'THẦN TÀI', bottom: '4', topColor: '#F59E0B', bottomColor: '#B45309' },
            'LÔ ĐỀ MIỀN NAM': { top: 'LÔ ĐỀ', bottom: 'MIỀN NAM', topColor: '#10B981', bottomColor: '#047857' },
            'LÔ ĐỀ MIỀN TRUNG': { top: 'LÔ ĐỀ', bottom: 'MIỀN TRUNG', topColor: '#F59E0B', bottomColor: '#B45309' },
            'LÔ ĐỀ MIỀN BẮC': { top: 'LÔ ĐỀ', bottom: 'MIỀN BẮC', topColor: '#E51F27', bottomColor: '#991B1B' },
            'XSKT 3 MIỀN': { top: 'XSKT', bottom: '3 MIỀN', topColor: '#E51F27', bottomColor: '#D9981B' },
            'HƯỚNG DẪN': { top: 'HƯỚNG', bottom: 'DẪN', topColor: '#3B82F6', bottomColor: '#1E3A8A' },
          };

          const map = iconMap[type];
          if (map) {
            return (
              <View style={styles.logoVietlott}>
                {map.top ? <Text style={{ color: map.topColor, fontSize: 12, fontWeight: 'bold', fontStyle: 'italic', textAlign: 'center' }}>{map.top}</Text> : null}
                {map.bottom ? <Text style={{ color: map.bottomColor, fontSize: 16, fontWeight: '900', fontStyle: 'italic', textAlign: 'center' }}>{map.bottom}</Text> : null}
              </View>
            );
          }

          return (
            <View style={styles.logoVietlott}>
              <Text style={{ color: '#E51F27', fontSize: 12, fontWeight: 'bold', fontStyle: 'italic' }}>{type.split(' ')[0]}</Text>
              <Text style={{ color: '#D9981B', fontSize: 14, fontWeight: '900', fontStyle: 'italic' }}>{type.split(' ').slice(1).join(' ')}</Text>
            </View>
          );
        }
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {renderHeader()}
      
      {loading && !refreshing ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : guides.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        >
          <Text style={{ color: COLORS.gray500, fontSize: 14 }}>Không có hướng dẫn nào</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={guides}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.itemCard}
              onPress={() => navigation.navigate('GuideDetail', { title: item.title, content: item.content })}
            >
              <View style={styles.itemIconWrapper}>
                {renderIcon(item.iconType)}
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.subtitle ? (
                  <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                ) : null}
              </View>
              <ChevronRight size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          )}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : !hasMore && guides.length > 0 ? (
              <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: COLORS.gray400, fontSize: 12 }}>Đã hiển thị tất cả hướng dẫn</Text>
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
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A3B7C',
  },
  content: {
    paddingTop: SPACING.md,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  itemIconWrapper: {
    width: 60,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A3B7C',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 16,
  },
  // Logos
  iconXContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E51F27',
    borderRightWidth: 16,
    borderRightColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  iconXText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    left: 10,
  },
  logoKeno: {
    color: '#FF5C00',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  logoMuaChung: {
    alignItems: 'center',
  },
  logoMuaText: {
    color: '#0A3B7C',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoChungText: {
    color: '#FF5C00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoVietlott: {
    alignItems: 'center',
  },
  logoPowerText: {
    color: '#D9981B',
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  logoMegaText: {
    color: '#E51F27',
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  logoNumberText: {
    color: '#D9981B',
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
  },
});
