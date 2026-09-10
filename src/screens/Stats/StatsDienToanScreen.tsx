import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, Calendar, Search } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const KY_OPTIONS = [
  '10 kỳ gần nhất', '20 kỳ gần nhất', '30 kỳ gần nhất',
  '40 kỳ gần nhất', '50 kỳ gần nhất', '100 kỳ gần nhất'
];

type StatItem = { number: string; count: number };

// ─── Sub-components ───────────────────────────────────────────────────────────

function KyPicker({
  selected,
  onPress,
}: {
  selected: string;
  onPress: () => void;
}) {
  return (
    <View style={styles.kyPickerRow}>
      <TouchableOpacity style={styles.kyPicker} onPress={onPress}>
        <Calendar size={16} color={COLORS.textDark} style={{ marginRight: 6 }} />
        <Text style={styles.kyPickerText}>{selected}</Text>
        <ChevronDown size={16} color={COLORS.textDark} />
      </TouchableOpacity>
    </View>
  );
}

function CapSoTable({
  title,
  data,
  selectedNumber,
  onSelect,
  countLabel = 'Chưa về',
  suffix = 'kỳ',
}: {
  title: string;
  data: StatItem[];
  selectedNumber: string | null;
  onSelect: (n: string) => void;
  countLabel?: string;
  suffix?: string;
}) {
  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Số</Text>
        <Text style={styles.tableHeaderCell}>{countLabel}</Text>
      </View>
      <Text style={styles.tableTitle}>{title}</Text>
      {data.map((item, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}
          onPress={() => onSelect(item.number)}
          activeOpacity={0.6}
        >
          <View style={styles.tableCell}>
            <View style={[styles.radio, selectedNumber === item.number && styles.radioActive]}>
              {selectedNumber === item.number && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.numberText}>{item.number}</Text>
          </View>
          <Text style={styles.countText}>{item.count} {suffix}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type MainTab = '235' | 'capSo' | 'dt6x36';
type SubTab235 = '2' | '3' | '4' | '5';

export default function StatsDienToanScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const [mainTab, setMainTab] = useState<MainTab>('235');
  const [subTab, setSubTab] = useState<SubTab235>('5');
  const [selectedKy, setSelectedKy] = useState(KY_OPTIONS[0]);
  const [showKyPicker, setShowKyPicker] = useState(false);
  
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');

  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      let limit = '10';
      const match = selectedKy.match(/\d+/);
      if (match) limit = match[0];
      if (selectedKy.includes('Tất cả')) limit = 'all';

      const res = await api.get(`/draws/stats?type=dientoan&tab=${mainTab}&limit=${limit}`);
      setStatsData(res.data);
    } catch (err) {
      console.log('Error fetching stats for dientoan', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [mainTab, selectedKy])
  );

  const onRefresh = React.useCallback(() => {
    fetchStats(true);
  }, [mainTab, selectedKy]);

  const renderRefreshControl = () => (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
  );

  const mainTabs: { id: MainTab; label: string }[] = [
    { id: '235', label: '2,3,4,5 Số' },
    { id: 'capSo', label: 'Cặp số' },
    { id: 'dt6x36', label: 'DT 6x36' },
  ];
  
  const subTabs: { id: SubTab235; label: string }[] = [
    { id: '2', label: '2 số' },
    { id: '3', label: '3 số' },
    { id: '4', label: '4 số' },
    { id: '5', label: '5 số' },
  ];

  const filteredCapSo = useMemo(() => {
    if (!statsData || !statsData.khan) return { khan: [], nhieu: [] };
    if (!searchText) return statsData;
    return {
      khan: statsData.khan.filter((x: any) => x.number.includes(searchText)),
      nhieu: statsData.nhieu.filter((x: any) => x.number.includes(searchText)),
    };
  }, [searchText, statsData]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ĐIỆN TOÁN THỦ ĐÔ</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Main Tabs */}
      <View style={styles.gameTabs}>
        {mainTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.gameTab, mainTab === tab.id && styles.gameTabActive]}
            onPress={() => {
              setMainTab(tab.id);
              setSearchText('');
              setSelectedNumber(null);
            }}
          >
            <Text style={[styles.gameTabText, mainTab === tab.id && styles.gameTabTextActive]}>
              {tab.label}
            </Text>
            {mainTab === tab.id && <View style={styles.gameTabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab: 2, 3, 5 Số */}
      {mainTab === '235' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} refreshControl={renderRefreshControl()}>
          {/* Sub-tab segmented control */}
          <View style={styles.subTabBarSegmented}>
            {subTabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.subTabSegmented, subTab === tab.id && styles.subTabActiveSegmented]}
                onPress={() => setSubTab(tab.id)}
              >
                <Text style={[styles.subTabTextSegmented, subTab === tab.id && styles.subTabTextActiveSegmented]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <KyPicker selected={selectedKy} onPress={() => setShowKyPicker(true)} />

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={TABLE_BLUE} />
          ) : (
            <View style={styles.gridContainer}>
              {statsData && statsData.so235 && statsData.so235.map((item: any, index: number) => {
                const highlightLen = parseInt(subTab);
                const numberStr = String(item.number).padStart(5, '0');
                const prefix = numberStr.slice(0, Math.max(0, numberStr.length - highlightLen));
                const highlightStr = numberStr.slice(-highlightLen);
                return (
                  <View key={index} style={styles.gridCell}>
                    <Text style={styles.gridNumberText}>
                      <Text style={{ color: TABLE_BLUE }}>{prefix}</Text>
                      <Text style={{ color: TABLE_RED }}>{highlightStr}</Text>
                    </Text>
                    <Text style={styles.gridDateText}>{item.date}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      {/* Tab: Cặp số */}
      {mainTab === 'capSo' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} refreshControl={renderRefreshControl()}>
          <KyPicker selected={selectedKy} onPress={() => setShowKyPicker(true)} />
          
          {/* Search bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.gray500} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm"
              placeholderTextColor={COLORS.gray500}
              value={searchText}
              onChangeText={setSearchText}
              keyboardType="number-pad"
            />
          </View>
          
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={TABLE_BLUE} />
          ) : (
            <View style={styles.twoColGrid}>
              <View style={styles.colHalf}>
                <Text style={styles.groupTitle}>Top 10 số khan</Text>
                <CapSoTable
                  title=""
                  data={filteredCapSo.khan || []}
                  selectedNumber={selectedNumber}
                  onSelect={setSelectedNumber}
                  countLabel="Chưa về"
                  suffix="kỳ"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.groupTitle}>Top 10 số về nhiều</Text>
                <CapSoTable
                  title=""
                  data={filteredCapSo.nhieu || []}
                  selectedNumber={selectedNumber}
                  onSelect={setSelectedNumber}
                  countLabel="Số lần về"
                  suffix="lần"
                />
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Tab: DT 6x36 */}
      {mainTab === 'dt6x36' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} refreshControl={renderRefreshControl()}>
          <KyPicker selected={selectedKy} onPress={() => setShowKyPicker(true)} />
          
          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color={TABLE_BLUE} />
          ) : (
            <View style={styles.twoColGrid}>
              <View style={styles.colHalf}>
                <Text style={styles.groupTitle}>Top 10 số khan</Text>
                <CapSoTable
                  title=""
                  data={statsData?.khan || []}
                  selectedNumber={selectedNumber}
                  onSelect={setSelectedNumber}
                  countLabel="Chưa về"
                  suffix="kỳ"
                />
              </View>
              <View style={styles.colHalf}>
                <Text style={styles.groupTitle}>Top 10 số về nhiều</Text>
                <CapSoTable
                  title=""
                  data={statsData?.nhieu || []}
                  selectedNumber={selectedNumber}
                  onSelect={setSelectedNumber}
                  countLabel="Số lần về"
                  suffix="lần"
                />
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Ky picker modal */}
      <Modal transparent={true} visible={showKyPicker} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowKyPicker(false)}
          activeOpacity={1}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalBox}>
              <ScrollView bounces={false} style={{ maxHeight: 300 }}>
                {KY_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.modalOption}
                    onPress={() => {
                      setSelectedKy(opt);
                      setShowKyPicker(false);
                    }}
                  >
                    <Text style={[styles.modalOptionText, opt === selectedKy && styles.modalOptionActive]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const TABLE_BLUE = '#1A4B7A';
const TABLE_RED = '#E51F27';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.light,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },

  // Main tabs
  gameTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  gameTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    position: 'relative',
  },
  gameTabActive: {},
  gameTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  gameTabTextActive: {
    color: TABLE_BLUE,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  gameTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: TABLE_BLUE,
    borderRadius: 2,
  },

  // Segmented control (Sub tabs)
  subTabBarSegmented: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray200,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    padding: 3,
  },
  subTabSegmented: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xs,
  },
  subTabActiveSegmented: {
    backgroundColor: TABLE_BLUE,
  },
  subTabTextSegmented: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  subTabTextActiveSegmented: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Kỳ picker
  kyPickerRow: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  kyPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.round,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  kyPickerText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: TABLE_BLUE,
    marginRight: 6,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textDark,
  },

  // 2,3,5 Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.cardBackground,
  },
  gridCell: {
    width: '33.33%',
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray300,
  },
  gridNumberText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: 4,
  },
  gridDateText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray600,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Two-column grid
  twoColGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  colHalf: { flex: 1 },
  groupTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
    marginBottom: 8,
  },

  // Stat Table
  tableContainer: {
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tableTitle: { display: 'none' },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: TABLE_BLUE,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: COLORS.cardBackground,
  },
  tableRowAlt: { backgroundColor: COLORS.gray100 },
  tableCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  radio: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: COLORS.gray400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: TABLE_BLUE },
  radioDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TABLE_BLUE,
  },
  numberText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  countText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    width: '80%',
    maxWidth: 320,
    ...SHADOWS.dark,
  },
  modalOption: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  modalOptionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textDark,
  },
  modalOptionActive: {
    color: TABLE_BLUE,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});
