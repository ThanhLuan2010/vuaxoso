import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, Calendar } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';

import { useAppStore } from '../../store/useAppStore';

type StatItem = { number: string; count: number };

const KY_OPTIONS = ['Tất cả các kỳ', '10 kỳ gần nhất', '20 kỳ gần nhất', '50 kỳ gần nhất'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatTable({
  title,
  data,
  selectedNumber,
  onSelect,
}: {
  title: string;
  data: StatItem[];
  selectedNumber: string | null;
  onSelect: (n: string) => void;
}) {
  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderCell}>Số</Text>
        <Text style={styles.tableHeaderCell}>Số lần về</Text>
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
          <Text style={styles.countText}>{item.count} lần</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function BoSoTab({ kenoData, selectedNumber, onSelect }: { kenoData: any; selectedNumber: string | null; onSelect: (n: string) => void }) {
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.twoColGrid}>
        <View style={styles.colHalf}>
          <Text style={styles.groupTitle}>Top số về nhiều:</Text>
          <StatTable
            title=""
            data={kenoData.topNhieu}
            selectedNumber={selectedNumber}
            onSelect={onSelect}
          />
        </View>
        <View style={styles.colHalf}>
          <Text style={styles.groupTitle}>Top số ít về:</Text>
          <StatTable
            title=""
            data={kenoData.topIt}
            selectedNumber={selectedNumber}
            onSelect={onSelect}
          />
        </View>
      </View>
      <View style={styles.twoColGrid}>
        <View style={styles.colHalf}>
          <Text style={styles.groupTitle}>Top chưa về:</Text>
          <StatTable
            title=""
            data={kenoData.topChuaVe}
            selectedNumber={selectedNumber}
            onSelect={onSelect}
          />
        </View>
        <View style={styles.colHalf}>
          <Text style={styles.groupTitle}>Top về liên tiếp:</Text>
          <StatTable
            title=""
            data={kenoData.topLienTiep}
            selectedNumber={selectedNumber}
            onSelect={onSelect}
          />
        </View>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function DauDuoiTab({ kenoData, selectedNumber, onSelect }: { kenoData: any; selectedNumber: string | null; onSelect: (n: string) => void }) {
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.twoColGrid}>
        <View style={styles.colHalf}>
          <Text style={styles.groupTitle}>Top 10 đầu số về nhiều:</Text>
          <StatTable
            title=""
            data={kenoData.dauDuoi.topDau}
            selectedNumber={selectedNumber}
            onSelect={onSelect}
          />
        </View>
        <View style={styles.colHalf}>
          <Text style={styles.groupTitle}>Top 10 đuôi số về nhiều:</Text>
          <StatTable
            title=""
            data={kenoData.dauDuoi.topDuoi}
            selectedNumber={selectedNumber}
            onSelect={onSelect}
          />
        </View>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

function ChanLeTab({ kenoData }: { kenoData: any }) {
  const { columns, kyRa, buoc, chuaVe } = kenoData.chanLe;
  const rows = [
    { label: 'Kỳ ra', values: kyRa },
    { label: 'Bước', values: buoc },
    { label: 'Chưa về', values: chuaVe },
  ];

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.chanLeWrapper}>
        <View style={styles.chanLeTable}>
          {/* Header row */}
          <View style={styles.chanLeHeaderRow}>
            <View style={[styles.chanLeCorner]}>
              <Text style={styles.chanLeCornerGame}>KENO</Text>
              <Text style={styles.chanLeCornerSub}>Chẵn lẻ</Text>
            </View>
            {columns.map((col: string, i: number) => (
              <View key={i} style={styles.chanLeHeaderCell}>
                <Text style={styles.chanLeHeaderText}>{col}</Text>
              </View>
            ))}
          </View>
          {/* Data rows */}
          {rows.map((row, ri) => (
            <View key={ri} style={[styles.chanLeDataRow, ri % 2 === 1 && styles.chanLeDataRowAlt]}>
              <View style={styles.chanLeRowLabel}>
                <Text style={styles.chanLeRowLabelText}>{row.label}</Text>
              </View>
              {row.values.map((val: any, vi: number) => (
                <View key={vi} style={styles.chanLeDataCell}>
                  <Text style={styles.chanLeDataText}>{Number(val).toFixed(1)}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// Power 6/55 và Mega 6/45: hiển thị top balls + progress bar
function VietlottStatTab({ data, color }: { data: any; color: string }) {
  // Using dummy date strings for UI consistency, real app would use a DatePicker
  const [sortOption, setSortOption] = useState('Xuất hiện giảm dần');
  const [showSortPicker, setShowSortPicker] = useState(false);

  const SORT_OPTIONS = ['Xuất hiện giảm dần', 'Xuất hiện tăng dần', 'Theo thứ tự của bóng'];

  const maxCount = Math.max(...data.boSo.map((d: StatItem) => d.count));

  // local sort
  const sortedBoSo = useMemo(() => {
    let arr = [...data.boSo];
    if (sortOption === 'Xuất hiện giảm dần') {
      arr.sort((a, b) => b.count - a.count);
    } else if (sortOption === 'Xuất hiện tăng dần') {
      arr.sort((a, b) => a.count - b.count);
    } else {
      arr.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    }
    return arr;
  }, [data.boSo, sortOption]);

  return (
    <ScrollView style={{ flex: 1 }}>
      {/* Sort Dropdown */}
      <View style={styles.sortContainer}>
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortPicker(true)}>
          <Text style={styles.sortButtonText}>{sortOption}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showSortPicker} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowSortPicker(false)}>
          <View style={styles.modalBox}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt} style={styles.modalOption} onPress={() => { setSortOption(opt); setShowSortPicker(false); }}>
                <Text style={[styles.modalOptionText, opt === sortOption && styles.modalOptionActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>10 bóng xuất hiện nhiều nhất</Text>
        <View style={styles.ballRow}>
          {data.topNhieuNumbers.map((n: string, i: number) => (
            <View key={i} style={[styles.ballBig, { backgroundColor: color }]}>
              <Text style={styles.ballBigText}>{n}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>10 bóng xuất hiện ít nhất</Text>
        <View style={styles.ballRow}>
          {data.topItNhat.map((n: string, i: number) => (
            <View key={i} style={[styles.ballBig, { backgroundColor: color }]}>
              <Text style={styles.ballBigText}>{n}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thống kê theo bộ số</Text>
        {data.boSo.map((item: StatItem, i: number) => (
          <View key={i} style={styles.barRow}>
            <View style={[styles.ballSmall, { backgroundColor: color }]}>
              <Text style={styles.ballSmallText}>{item.number}</Text>
            </View>
            <View style={styles.barBg}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(item.count / maxCount) * 100}%` as any, backgroundColor: color },
                ]}
              />
            </View>
            <Text style={styles.barCount}>{item.count}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 20 }} />

      {/* Sort Picker Modal */}
      <Modal visible={showSortPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowSortPicker(false)}
          activeOpacity={1}
        >
          <View style={styles.modalBox}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.modalOption}
                onPress={() => {
                  setSortOption(opt);
                  setShowSortPicker(false);
                }}
              >
                <Text style={[styles.modalOptionText, opt === sortOption && styles.modalOptionActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type GameTab = 'keno' | 'power' | 'mega';
type KenoSubTab = 'boSo' | 'dauDuoi' | 'chanLe';

import api from '../../services/api';

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
        <Text style={styles.kyPickerText}>{selected}</Text>
        <ChevronDown size={16} color={COLORS.textDark} />
      </TouchableOpacity>
    </View>
  );
}

export default function StatsKenoScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [gameTab, setGameTab] = useState<GameTab>('keno');
  const [kenoSubTab, setKenoSubTab] = useState<KenoSubTab>('boSo');
  const [selectedKy, setSelectedKy] = useState(KY_OPTIONS[0]);
  const [showKyPicker, setShowKyPicker] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);

  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      let limit = '10';
      if (selectedKy.includes('20')) limit = '20';
      if (selectedKy.includes('50')) limit = '50';
      if (selectedKy.includes('Tất cả')) limit = 'all';

      let type = 'vietlott';
      let code = 'keno';
      if (gameTab === 'power') { code = 'power_655'; }
      if (gameTab === 'mega') { code = 'mega_645'; }

      const res = await api.get(`/draws/stats?type=${type}&code=${code}&limit=${limit}`);
      setStatsData(res.data);
    } catch (err) {
      console.log('Error fetching stats', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStats();
  }, [gameTab, selectedKy]);

  const gameTabs: { id: GameTab; label: string }[] = [
    { id: 'keno', label: 'Keno' },
    { id: 'power', label: 'Power 6/55' },
    { id: 'mega', label: 'Mega 6/45' },
  ];
  const kenoSubTabs: { id: KenoSubTab; label: string }[] = [
    { id: 'boSo', label: 'Bộ số' },
    { id: 'dauDuoi', label: 'Đầu đuôi' },
    { id: 'chanLe', label: 'Chẵn lẻ' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 16 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>THỐNG KÊ KENO</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Game Tabs */}
      <View style={styles.gameTabs}>
        {gameTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.gameTab, gameTab === tab.id && styles.gameTabActive]}
            onPress={() => setGameTab(tab.id)}
          >
            <Text style={[styles.gameTabText, gameTab === tab.id && styles.gameTabTextActive]}>
              {tab.label}
            </Text>
            {gameTab === tab.id && <View style={styles.gameTabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* Keno Sub-tabs & content */}
      {gameTab === 'keno' && (
        <>
          {/* Sub-tab bar */}
          <View style={styles.subTabBar}>
            {kenoSubTabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.subTab, kenoSubTab === tab.id && styles.subTabActive]}
                onPress={() => setKenoSubTab(tab.id)}
              >
                <Text style={[styles.subTabText, kenoSubTab === tab.id && styles.subTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ky picker and content moved below */}
        </>
      )}

      {/* Content based on selected game */}
      <KyPicker selected={selectedKy} onPress={() => setShowKyPicker(true)} />

      {gameTab === 'keno' && statsData ? (
        <>
          {kenoSubTab === 'boSo' && <BoSoTab kenoData={statsData} selectedNumber={selectedNumber} onSelect={setSelectedNumber} />}
          {kenoSubTab === 'dauDuoi' && <DauDuoiTab kenoData={statsData} selectedNumber={selectedNumber} onSelect={setSelectedNumber} />}
          {kenoSubTab === 'chanLe' && <ChanLeTab kenoData={statsData} />}
        </>
      ) : gameTab === 'keno' && !statsData ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.gray500 }}>Đang tải dữ liệu...</Text>
        </View>
      ) : null}

      {gameTab === 'power' && statsData ? (
        <VietlottStatTab data={statsData} color="#E51F27" />
      ) : gameTab === 'power' && !statsData ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.gray500 }}>Đang tải dữ liệu...</Text>
        </View>
      ) : null}

      {gameTab === 'mega' && statsData ? (
        <VietlottStatTab data={statsData} color="#1A4B7A" />
      ) : gameTab === 'mega' && !statsData ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.gray500 }}>Đang tải dữ liệu...</Text>
        </View>
      ) : null}

      {/* Ky picker modal */}
      <Modal visible={showKyPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowKyPicker(false)}
          activeOpacity={1}
        >
          <View style={styles.modalBox}>
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
          </View>
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

  // Game tabs (Keno / Power / Mega)
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

  // Sub-tabs (Bộ số / Đầu đuôi / Chẵn lẻ)
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.xs,
  },
  subTabActive: { backgroundColor: TABLE_BLUE },
  subTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  subTabTextActive: {
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
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kyPickerText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textDark,
    marginRight: 6,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
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
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
    marginBottom: 4,
  },

  // Stat Table
  tableContainer: {
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tableTitle: { display: 'none' }, // not used when groupTitle is shown above
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: TABLE_BLUE,
    paddingVertical: 6,
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
    paddingVertical: 6,
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
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textDark,
    textAlign: 'center',
  },

  // Chẵn lẻ table
  chanLeWrapper: {
    margin: SPACING.md,
  },
  chanLeTable: {
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chanLeHeaderRow: {
    flexDirection: 'row',
  },
  chanLeCorner: {
    width: 64,
    backgroundColor: '#FFF3F3',
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chanLeCornerGame: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: TABLE_RED,
    fontStyle: 'italic',
  },
  chanLeCornerSub: {
    fontSize: 8,
    color: COLORS.gray500,
  },
  chanLeHeaderCell: {
    flex: 1,
    backgroundColor: TABLE_RED,
    paddingVertical: 8,
    paddingHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chanLeHeaderText: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  chanLeDataRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
  },
  chanLeDataRowAlt: { backgroundColor: COLORS.gray100 },
  chanLeRowLabel: {
    width: 64,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  chanLeRowLabelText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  chanLeDataCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  chanLeDataText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
  },

  // Power / Mega sections
  section: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  ballRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  ballBig: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  ballBigText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  ballSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballSmallText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  barBg: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.gray200,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barCount: {
    width: 20,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
    textAlign: 'right',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
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
    minWidth: 220,
    ...SHADOWS.dark,
  },
  modalOption: {
    paddingVertical: SPACING.md,
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

  // Power/Mega specific UI
  dateFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    ...SHADOWS.light,
  },
  dateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
  },
  sortContainer: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  sortButton: {
    backgroundColor: COLORS.cardBackground,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  sortButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: TABLE_BLUE,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
});
