import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, Calendar } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const KY_OPTIONS = [
  '10 kỳ gần nhất', '20 kỳ gần nhất', '30 kỳ gần nhất',
  '40 kỳ gần nhất', '50 kỳ gần nhất', '100 kỳ gần nhất'
];


const PRIZE_OPTIONS = [
  'Giải 8', 'Giải 7', 'Giải 6', 'Giải 5',
  'Giải 4', 'Giải 3', 'Giải 2', 'Giải 1', 'Giải Đặc Biệt'
];

type StatItem = { number: string; count: number };
// ─── Sub-components ───────────────────────────────────────────────────────────

function StatTable({
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
      {title ? <Text style={styles.tableTitle}>{title}</Text> : null}
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

type MainTab = 'mienbac' | 'mientrung' | 'miennam';

export default function StatsTruyenThongScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [mainTab, setMainTab] = useState<MainTab>('mienbac');

  // Provinces state
  const [provincesMB, setProvincesMB] = useState<string[]>(['Loading...']);
  const [provincesMT, setProvincesMT] = useState<string[]>(['Loading...']);
  const [provincesMN, setProvincesMN] = useState<string[]>(['Loading...']);

  // Pickers state
  const [selectedKy, setSelectedKy] = useState(KY_OPTIONS[0]);
  const [selectedProvinceMB, setSelectedProvinceMB] = useState('');
  const [selectedProvinceMT, setSelectedProvinceMT] = useState('');
  const [selectedProvinceMN, setSelectedProvinceMN] = useState('');
  const [selectedPrize, setSelectedPrize] = useState(PRIZE_OPTIONS[0]);

  React.useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { data } = await api.get('/provinces');
        const mb = data.filter((p: any) => p.region === 'MB').map((p: any) => p.name);
        const mt = data.filter((p: any) => p.region === 'MT').map((p: any) => p.name);
        const mn = data.filter((p: any) => p.region === 'MN').map((p: any) => p.name);
        
        if (mb.length > 0) {
          setProvincesMB(mb);
          setSelectedProvinceMB(mb[0]);
        }
        if (mt.length > 0) {
          setProvincesMT(mt);
          setSelectedProvinceMT(mt[0]);
        }
        if (mn.length > 0) {
          setProvincesMN(mn);
          setSelectedProvinceMN(mn[0]);
        }
      } catch (error) {
        console.log('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Modals state
  const [showKyPicker, setShowKyPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showPrizePicker, setShowPrizePicker] = useState(false);

  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);

  const mainTabs: { id: MainTab; label: string }[] = [
    { id: 'mienbac', label: 'Miền Bắc' },
    { id: 'mientrung', label: 'Miền Trung' },
    { id: 'miennam', label: 'Miền Nam' },
  ];

  const currentProvinceList = mainTab === 'mienbac' ? provincesMB : mainTab === 'mientrung' ? provincesMT : provincesMN;
  const currentProvince = mainTab === 'mienbac' ? selectedProvinceMB : mainTab === 'mientrung' ? selectedProvinceMT : selectedProvinceMN;

  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        let limit = '10';
        const match = selectedKy.match(/\d+/);
        if (match) limit = match[0];
        if (selectedKy.includes('Tất cả')) limit = 'all';

        let code = mainTab === 'mienbac' ? 'MB' : mainTab === 'mientrung' ? 'MT' : 'MN';
        // Mock using the region code as the API doesn't support province yet
        const res = await api.get(`/draws/stats?type=kienthiet&code=${code}&limit=${limit}&prize=${selectedPrize}`);
        setStatsData(res.data);
      } catch (err) {
        console.log('Error fetching stats for kienthiet', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [mainTab, selectedKy, selectedPrize, currentProvince]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>XỔ SỐ TRUYỀN THỐNG</Text>
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Filters Row */}
        <View style={styles.filtersRow}>
          <TouchableOpacity style={styles.pickerBox} onPress={() => setShowKyPicker(true)}>
            <Calendar size={16} color={TABLE_BLUE} style={{ marginRight: 6 }} />
            <Text style={styles.pickerText} numberOfLines={1}>{selectedKy}</Text>
            <ChevronDown size={16} color={TABLE_BLUE} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.pickerBox} onPress={() => setShowProvincePicker(true)}>
            <Calendar size={16} color={TABLE_BLUE} style={{ marginRight: 6 }} />
            <Text style={styles.pickerText} numberOfLines={1}>{currentProvince}</Text>
            <ChevronDown size={16} color={TABLE_BLUE} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color={TABLE_BLUE} />
        ) : (
          <View style={styles.gridContainer}>
            {statsData?.gridData?.map((item: any, index: number) => {
              const prefix = item.number.slice(0, item.number.length - item.highlight.length);
              return (
                <View key={index} style={styles.gridCell}>
                  <Text style={styles.gridNumberText}>
                    <Text style={{ color: TABLE_BLUE }}>{prefix}</Text>
                    <Text style={{ color: TABLE_RED }}>{item.highlight}</Text>
                  </Text>
                  <Text style={styles.gridDateText}>{item.date}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Prize Selector Button */}
        <TouchableOpacity style={styles.prizeButton} onPress={() => setShowPrizePicker(true)}>
          <Text style={styles.prizeButtonText}>{selectedPrize}</Text>
        </TouchableOpacity>

        {/* 2 Tables side-by-side */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} color={TABLE_BLUE} />
        ) : (
          <View style={styles.twoColGrid}>
            <View style={styles.colHalf}>
              <Text style={styles.groupTitle}>Top 10 số khan</Text>
              <StatTable
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
              <StatTable
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

      {/* ─── Modals ────────────────────────────────────────────── */}

      {/* Ky picker modal */}
      <Modal visible={showKyPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowKyPicker(false)}
          activeOpacity={1}
        >
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
        </TouchableOpacity>
      </Modal>

      {/* Province picker modal */}
      <Modal visible={showProvincePicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowProvincePicker(false)}
          activeOpacity={1}
        >
          <View style={styles.modalBox}>
            <ScrollView bounces={false} style={{ maxHeight: 300 }}>
              {currentProvinceList.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalOption}
                  onPress={() => {
                    if (mainTab === 'mienbac') setSelectedProvinceMB(opt);
                    else if (mainTab === 'mientrung') setSelectedProvinceMT(opt);
                    else setSelectedProvinceMN(opt);
                    setShowProvincePicker(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, opt === currentProvince && styles.modalOptionActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Prize picker modal */}
      <Modal visible={showPrizePicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowPrizePicker(false)}
          activeOpacity={1}
        >
          <View style={styles.modalBox}>
            <ScrollView bounces={false} style={{ maxHeight: 400 }}>
              {PRIZE_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedPrize(opt);
                    setShowPrizePicker(false);
                  }}
                >
                  <Text style={[styles.modalOptionText, opt === selectedPrize && styles.modalOptionActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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

  // Filters Row
  filtersRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  pickerBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.round,
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  pickerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: TABLE_BLUE,
    marginRight: 4,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    textAlign: 'center',
  },

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.cardBackground,
    marginBottom: SPACING.md,
  },
  gridCell: {
    width: '20%', // 5 columns
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.gray300,
  },
  gridNumberText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    marginBottom: 4,
  },
  gridDateText: {
    fontSize: 8,
    color: COLORS.gray600,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Prize Button
  prizeButton: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    alignItems: 'center',
  },
  prizeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: TABLE_BLUE,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },

  // Two-column table grid
  twoColGrid: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.sm,
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
