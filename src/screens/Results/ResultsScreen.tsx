import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';

const { width } = Dimensions.get('window');

// ─── Colors ───────────────────────────────────────────────────────────────────
const TABLE_BLUE = '#1A4B7A';
const TABLE_RED = '#E51F27';
const KENO_ORANGE = '#FF5C00';
const LOTTO_GREEN = '#00843D';
const POWER_GOLD = '#B68A2E';
const MEGA_RED = '#E51F27';
const MAX3D_MAGENTA = '#D2008E';
const DIENTOAN_BLUE = '#005CB9';

import { useAppStore } from '../../store/useAppStore';
import { FlatList, ActivityIndicator } from 'react-native';
import api from '../../services/api';

function usePaginatedResults(type?: string, code?: string) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  React.useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
  }, [type, code]);

  React.useEffect(() => {
    if (!hasMore) return;
    
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get('/draws/results', {
          params: { page, limit: 10, type, code }
        });
        if (isMounted) {
          if (res.data.length < 10) {
            setHasMore(false);
          }
          if (page === 1) {
            setData(res.data);
          } else {
            setData(prev => [...prev, ...res.data]);
          }
        }
      } catch (error) {
        console.log('fetch error', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [page, type, code]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return { data, loading, loadMore, hasMore };
}
// ─── Sub-components ───────────────────────────────────────────────────────────

function VietlottTab() {
  const navigation = useNavigation<any>();
  const { games, drawResults } = useAppStore();
  const HARDCODED_VIETLOTT_GAMES = [
    { code: 'keno', name: 'Keno', color: KENO_ORANGE, navType: 'keno', isKeno: true },
    { code: 'lotto_535', name: 'Lotto\n5/35', color: LOTTO_GREEN, navType: 'lotto', isKeno: false },
    { code: 'power_655', name: 'Power\n6/55', color: POWER_GOLD, navType: 'power', isKeno: false },
    { code: 'mega_645', name: 'Mega\n6/45', color: MEGA_RED, navType: 'mega', isKeno: false },
    { code: 'max_3d', name: 'Max\n3D', color: MAX3D_MAGENTA, navType: 'max3d', isKeno: false },
    { code: 'max_3d_pro', name: 'Max\n3D Pro', color: MAX3D_MAGENTA, navType: 'max3dpro', isKeno: false }
  ];

  return (
    <ScrollView contentContainerStyle={styles.vietlottContainer} showsVerticalScrollIndicator={false}>
      {HARDCODED_VIETLOTT_GAMES.map(game => {
        const { navType, color, isKeno, name } = game;

        // Find the latest completed draw for this game by code
        const latestDraw = drawResults.find(d => d.game?.code === game.code && d.status === 'completed');

        let dateStr = '';
        let drawCodeStr = 'Đang cập nhật';
        let winningNumbers: string[] = [];
        let prizeText = 'Cập nhật liên tục';

        if (latestDraw) {
          const d = new Date(latestDraw.closeTime);
          dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
          drawCodeStr = `Kỳ quay: ${latestDraw.drawCode} ${dateStr}`;
          winningNumbers = latestDraw.winningNumbers || [];
          if (latestDraw.jackpotPrize) {
            prizeText = `${latestDraw.jackpotPrize.toLocaleString('vi-VN')} đ`;
          }
        }

        return (
          <TouchableOpacity
            key={game.code}
            style={styles.vlCard}
            onPress={() => navigation.navigate('VietlottDetail', { type: navType, code: game.code })}
          >
            <View style={styles.vlLeftRibbon}>
              <Text style={[styles.vlType, { color: color, fontStyle: isKeno ? 'italic' : 'normal', fontSize: isKeno ? 16 : 14 }]}>
                {name}
              </Text>
            </View>
            <View style={styles.vlContent}>
              <Text style={styles.vlKyText}>{drawCodeStr}</Text>
              
              {winningNumbers.length > 0 ? (
                <View style={styles.vlBallRow}>
                  {winningNumbers.map((num: string, i: number) => (
                    <View key={i} style={[styles.vlBall, { backgroundColor: color }, isKeno && styles.vlBallKeno]}>
                      <Text style={[styles.vlBallText, isKeno && styles.vlBallTextKeno]}>{num}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ height: 32, justifyContent: 'center' }}>
                  <Text style={{ color: COLORS.gray500, fontSize: 13, fontStyle: 'italic' }}>Chưa có kết quả</Text>
                </View>
              )}
              
              <Text style={[styles.vlPrizeText, { color: color }]}>{prizeText}</Text>
            </View>
            <View style={[styles.vlCornerStyle, { borderBottomColor: color }]} />
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const DIENTOAN_COLORS = ['#00A3E0', '#FFCD00', '#E51F27', '#E51F27', '#00A3E0', '#FFCD00'];

function DienToanTab() {
  const [subTab, setSubTab] = useState<'dientoan_636' | 'than_tai_4' | 'dientoan_123'>('dientoan_636');
  const { data: results, loading, loadMore, hasMore } = usePaginatedResults('dientoan', subTab);

  const renderFooter = () => {
    if (!loading) return <View style={{ height: 24 }} />;
    return <ActivityIndicator style={{ marginVertical: 20 }} color={COLORS.primary} />;
  };

  const renderItem = ({ item }: { item: any }) => {
    const d = new Date(item.closeTime);
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = dayNames[d.getDay()];
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const numbers = item.winningNumbers || [];

    return (
      <View style={styles.dtCard}>
        <Text style={styles.dtDateText}>{dayName} - {dateStr} (Kỳ: {item.drawCode})</Text>

        {subTab === 'dientoan_636' && (
          <View style={styles.dtBallRow}>
            {numbers.map((num: string, i: number) => (
              <View key={i} style={[styles.dtBall6x36, { borderColor: DIENTOAN_COLORS[i % DIENTOAN_COLORS.length] }]}>
                <Text style={styles.dtBallTextDark}>{num}</Text>
              </View>
            ))}
          </View>
        )}

        {subTab === 'than_tai_4' && (
          <View style={styles.dtBallRowCentered}>
            {numbers.map((num: string, i: number) => (
              <View key={i} style={styles.dtBallThanTai}>
                <Text style={styles.dtBallTextLight}>{num}</Text>
              </View>
            ))}
          </View>
        )}

        {subTab === 'dientoan_123' && (
          <View style={styles.dtBallRowCentered}>
            {numbers.map((num: string, i: number) => (
              <View key={i} style={styles.dtOval123}>
                <Text style={styles.dtBallTextLight}>{num}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.tabContentContainer}>
      <View style={styles.subTabSegmented}>
        {[
          { id: 'dientoan_636', label: '6x36' },
          { id: 'than_tai_4', label: 'Thần tài' },
          { id: 'dientoan_123', label: '1-2-3' },
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.subTabBtn, subTab === t.id && styles.subTabBtnActiveDT]}
            onPress={() => setSubTab(t.id as any)}
          >
            <Text style={[styles.subTabText, subTab === t.id && styles.subTabTextActiveDT]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.dtList}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading ? <Text style={{ textAlign: 'center', color: COLORS.gray500, marginTop: 20 }}>Không có dữ liệu</Text> : null
        }
      />
    </View>
  );
}

function KienThietTab() {
  const [subTab, setSubTab] = useState<'mien_bac' | 'mien_trung' | 'mien_nam'>('mien_trung');
  const { data: results, loading, loadMore, hasMore } = usePaginatedResults('kienthiet', subTab);

  const renderFooter = () => {
    if (!loading) return <View style={{ height: 24 }} />;
    return <ActivityIndicator style={{ marginVertical: 20 }} color={COLORS.primary} />;
  };

  const renderItem = ({ item }: { item: any }) => {
    const d = new Date(item.closeTime);
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const numbers = item.winningNumbers || [];
    
    const prizeLabels = ['Đặc biệt', 'Giải Nhất', 'Giải Nhì', 'Giải Ba', 'Giải Tư', 'Giải Năm', 'Giải Sáu', 'Giải Bảy', 'Giải Tám'];

    return (
      <View style={{ marginBottom: 16, backgroundColor: COLORS.cardBackground, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#EEEEEE' }}>
        <View style={{ backgroundColor: '#005baa', padding: 12 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
            {item.game?.name}{item.province?.name ? ` - ${item.province.name}` : ''}
          </Text>
          <Text style={{ color: '#E0E0E0', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
            Kỳ quay: {item.drawCode} - Ngày: {dateStr}
          </Text>
        </View>
        <View>
          {numbers.map((num: string, idx: number) => {
            const isSpecial = idx === 0;
            return (
              <View key={idx} style={{ flexDirection: 'row', borderBottomWidth: idx === numbers.length - 1 ? 0 : 1, borderBottomColor: '#EEEEEE', backgroundColor: isSpecial ? '#FFF9E6' : 'white' }}>
                <View style={{ width: 100, paddingVertical: 12, paddingHorizontal: 8, borderRightWidth: 1, borderRightColor: '#EEEEEE', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: isSpecial ? '#D32F2F' : COLORS.textDark, fontSize: 14 }}>
                    {prizeLabels[idx] || `Giải ${idx}`}
                  </Text>
                </View>
                <View style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: isSpecial ? '#D32F2F' : COLORS.textDark, fontSize: isSpecial ? 20 : 16, letterSpacing: 2 }}>
                    {num}
                  </Text>
                </View>
              </View>
            );
          })}
          {numbers.length === 0 && (
            <Text style={{ textAlign: 'center', padding: 20, color: COLORS.gray500 }}>Chưa có kết quả</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.tabContentContainer}>
      <View style={styles.subTabSegmented}>
        {[
          { id: 'mien_bac', label: 'Miền Bắc' },
          { id: 'mien_trung', label: 'Miền Trung' },
          { id: 'mien_nam', label: 'Miền Nam' },
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.subTabBtn, subTab === t.id && styles.subTabBtnActiveDT]}
            onPress={() => setSubTab(t.id as any)}
          >
            <Text style={[styles.subTabText, subTab === t.id && styles.subTabTextActiveDT]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.ktContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading ? <Text style={{ textAlign: 'center', color: COLORS.gray500, marginTop: 20 }}>Không có dữ liệu</Text> : null
        }
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const [mainTab, setMainTab] = useState<'vietlott' | 'dientoan' | 'kienthiet'>('vietlott');

  const mainTabs = [
    { id: 'vietlott', label: 'Vietlott' },
    { id: 'dientoan', label: 'Điện Toán\nThủ Đô' },
    { id: 'kienthiet', label: 'Xổ Số\nKiến Thiết' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.headerTitle}>Kết quả</Text>
      </View>

      {/* Main Tabs */}
      <View style={styles.mainTabsRow}>
        {mainTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.mainTab, mainTab === tab.id && styles.mainTabActive]}
            onPress={() => setMainTab(tab.id as any)}
          >
            <Text style={[styles.mainTabText, mainTab === tab.id && styles.mainTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {mainTab === 'vietlott' && <VietlottTab />}
        {mainTab === 'dientoan' && <DienToanTab />}
        {mainTab === 'kienthiet' && <KienThietTab />}
      </View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA', // Slightly gray background for contrast with cards
  },

  // Header
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: TABLE_BLUE,
  },

  // Main Tabs
  mainTabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mainTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  mainTabActive: {
    borderBottomColor: TABLE_BLUE,
  },
  mainTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  mainTabTextActive: {
    color: TABLE_BLUE,
  },

  // Shared
  tabContentContainer: {
    flex: 1,
  },

  // Vietlott Tab
  vietlottContainer: {
    padding: SPACING.md,
  },
  vlCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  vlLeftRibbon: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingHorizontal: 4,
  },
  vlType: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  vlContent: {
    flex: 1,
    padding: SPACING.md,
  },
  vlKyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  vlBallRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  vlBall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vlBallText: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  vlBallKeno: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  vlBallTextKeno: {
    fontSize: 10,
  },
  vlPrizeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  vlCornerStyle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 20,
    borderBottomWidth: 20,
    borderRightColor: 'transparent',
  },

  // Sub Tabs for DT / KT
  subTabSegmented: {
    flexDirection: 'row',
    margin: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    overflow: 'hidden',
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabBtnActiveDT: {
    backgroundColor: DIENTOAN_BLUE,
  },
  subTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  subTabTextActiveDT: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Điện Toán Tab
  dtList: {
    paddingHorizontal: SPACING.md,
  },
  dtCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  dtDateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  dtBallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  dtBallRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  dtBall6x36: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    ...SHADOWS.light,
  },
  dtBallThanTai: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TABLE_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  dtOval123: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    backgroundColor: TABLE_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    ...SHADOWS.light,
  },
  dtBallTextDark: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  dtBallTextLight: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textLight,
  },

  // Kiến Thiết Tab
  ktContainer: {
    padding: SPACING.md,
  },
  ktTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: TABLE_BLUE,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  table: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: width - SPACING.md * 2, // Take full width but can scroll
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  thPrize: {
    width: 90,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  thCol: {
    width: 100,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  thText: {
    color: TABLE_BLUE,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  tdPrize: {
    width: 90,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  tdPrizeName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: TABLE_BLUE,
    textAlign: 'center',
  },
  tdPrizeValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: TABLE_RED,
    marginTop: 2,
    textAlign: 'center',
  },
  tdCol: {
    width: 100,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  tdNumber: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 22,
  },
  tdNumberSpecial: {
    color: TABLE_RED,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Miền Bắc Specific
  mbCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  mbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mbLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: TABLE_BLUE,
    borderLeftColor: TABLE_RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  mbLogoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mbLogoText: {
    color: TABLE_RED,
    fontWeight: 'bold',
    fontSize: 20,
  },
  mbHeaderTitle: {
    fontSize: 12,
    color: TABLE_BLUE,
    fontWeight: 'bold',
  },
  mbKyText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  mbTable: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  mbValuesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mbValText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  mbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  mbGridCell: {
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
