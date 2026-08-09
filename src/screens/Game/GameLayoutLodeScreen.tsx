import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Info, HelpCircle } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';

type Region = 'mn' | 'mt' | 'mb';
type MainCategory = 'Bao Lô' | 'Đề' | 'Xiên' | '3 Càng' | '4 Càng' | 'Lô Trượt';

interface BetOption {
  name: string;
  multiplier: number; // Cấp nhân
  rate: number;       // Tỉ lệ
  description?: string;
}

// --------------------------------------------------------------------------
// DATA
// --------------------------------------------------------------------------
const BET_DATA: Record<'mn_mt' | 'mb', Record<MainCategory, BetOption[]>> = {
  mn_mt: {
    'Bao Lô': [
      { name: 'Lô 2 số', multiplier: 18, rate: 99.9 },
      { name: 'Lô Giải 4', multiplier: 7, rate: 99.9 },
      { name: 'Lô Giải 6', multiplier: 3, rate: 99.9 },
      { name: 'Lô 2 số đầu', multiplier: 18, rate: 99.9 },
      { name: 'Lô 2 số 1k', multiplier: 1, rate: 5.445 },
      { name: 'Lô 2 số đầu 1k', multiplier: 1, rate: 5.445 },
      { name: 'Lô 3 số', multiplier: 17, rate: 980 },
      { name: 'Lô 4 số', multiplier: 16, rate: 9000 },
    ],
    'Đề': [
      { name: 'Đề ĐB', multiplier: 1, rate: 99.9 },
      { name: 'Đề Đầu ĐB', multiplier: 1, rate: 99.9 },
      { name: 'Đề giải 1', multiplier: 1, rate: 99.9 },
      { name: 'Đề đầu giải 1', multiplier: 1, rate: 99.9 },
      { name: 'Đề giải 8', multiplier: 1, rate: 99.9 },
      { name: 'Đề đầu', multiplier: 10, rate: 99.9 },
      { name: 'Đề đuôi', multiplier: 10, rate: 99.9 },
      { name: 'Đề đầu đuôi', multiplier: 2, rate: 99.9 },
    ],
    'Xiên': [
      { name: 'Xiên 2', multiplier: 1, rate: 28 },
      { name: 'Xiên 3', multiplier: 1, rate: 150 },
      { name: 'Xiên 4', multiplier: 1, rate: 750 },
    ],
    '3 Càng': [
      { name: '3 Càng ĐB', multiplier: 1, rate: 980 },
      { name: '3 Càng đầu ĐB', multiplier: 1, rate: 980 },
      { name: '3 Càng giải 7', multiplier: 1, rate: 980 },
      { name: '3 Càng giải 1', multiplier: 1, rate: 980 },
      { name: '3 Càng đầu giải 1', multiplier: 1, rate: 980 },
      { name: '3 Càng đầu đuôi', multiplier: 2, rate: 980 },
      { name: 'Xiên 3 ĐB', multiplier: 1, rate: 158 },
    ],
    '4 Càng': [
      { name: '4 Càng ĐB', multiplier: 1, rate: 9000 },
      { name: '4 Càng giải 1', multiplier: 1, rate: 9000 },
      { name: 'Xiên 4 ĐB', multiplier: 1, rate: 388 },
    ],
    'Lô Trượt': [
      { name: 'Lô Trượt Xiên 4', multiplier: 1, rate: 1.8 },
      { name: 'Lô Trượt Xiên 6', multiplier: 1, rate: 2.5 },
      { name: 'Lô Trượt Xiên 8', multiplier: 1, rate: 3.3 },
      { name: 'Lô Trượt Xiên 10', multiplier: 1, rate: 4.3 },
    ],
  },
  mb: {
    'Bao Lô': [
      { name: 'Lô 2 số', multiplier: 27, rate: 99.9 },
      { name: 'Lô Giải 3', multiplier: 6, rate: 99.9 },
      { name: 'Lô Giải 5', multiplier: 6, rate: 99.9 },
      { name: 'Lô 2 số đầu', multiplier: 27, rate: 99.9 },
      { name: 'Lô 2 số 1k', multiplier: 1, rate: 3.7 },
      { name: 'Lô 2 số đầu 1k', multiplier: 1, rate: 3.7 },
      { name: 'Lô 3 số', multiplier: 23, rate: 980 },
      { name: 'Lô 4 số', multiplier: 20, rate: 9000 },
    ],
    'Đề': [
      { name: 'Đề ĐB', multiplier: 1, rate: 99.9 },
      { name: 'Đề Đầu ĐB', multiplier: 1, rate: 99.9 },
      { name: 'Đề giải 1', multiplier: 1, rate: 99.9 },
      { name: 'Đề đầu giải 1', multiplier: 1, rate: 99.9 },
      { name: 'Đề giải 7', multiplier: 4, rate: 99.9 },
      { name: 'Đề đầu', multiplier: 10, rate: 99.9 },
      { name: 'Đề đuôi', multiplier: 10, rate: 99.9 },
      { name: 'Đề đầu đuôi', multiplier: 5, rate: 99.9 },
    ],
    'Xiên': [
      { name: 'Xiên 2', multiplier: 1, rate: 16 },
      { name: 'Xiên 3', multiplier: 1, rate: 65 },
      { name: 'Xiên 4', multiplier: 1, rate: 180 },
    ],
    '3 Càng': [
      { name: '3 Càng ĐB', multiplier: 1, rate: 980 },
      { name: '3 Càng đầu ĐB', multiplier: 1, rate: 980 },
      { name: '3 Càng giải 6', multiplier: 3, rate: 980 },
      { name: '3 Càng giải 1', multiplier: 1, rate: 980 },
      { name: '3 Càng đầu đuôi', multiplier: 4, rate: 980 },
      { name: 'Xiên 3 ĐB', multiplier: 1, rate: 158 },
    ],
    '4 Càng': [
      { name: '4 Càng ĐB', multiplier: 1, rate: 9000 },
      { name: '4 Càng giải 1', multiplier: 1, rate: 9000 },
      { name: 'Xiên 4 ĐB', multiplier: 1, rate: 388 },
    ],
    'Lô Trượt': [
      { name: 'Lô Trượt Xiên 4', multiplier: 1, rate: 2.3 },
      { name: 'Lô Trượt Xiên 6', multiplier: 1, rate: 4.5 },
      { name: 'Lô Trượt Xiên 8', multiplier: 1, rate: 8 },
      { name: 'Lô Trượt Xiên 10', multiplier: 1, rate: 12 },
    ],
  }
};

const MAIN_CATEGORIES: MainCategory[] = ['Bao Lô', 'Đề', 'Xiên', '3 Càng', '4 Càng', 'Lô Trượt'];

// --------------------------------------------------------------------------
// SCREEN
// --------------------------------------------------------------------------
export default function GameLayoutLodeScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { addToCart, activeDraws } = useAppStore();
  const gameId = route.params?.gameId || 'lotto_535';

  const [region, setRegion] = useState<Region>('mn');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('Bao Lô');
  const [selectedSub, setSelectedSub] = useState<BetOption>(BET_DATA['mn_mt']['Bao Lô'][0]);
  const [inputNumbers, setInputNumbers] = useState('');
  const [baseAmount, setBaseAmount] = useState('1000'); // Mặc định 1000đ

  // Cập nhật selectedSub mặc định khi chuyển vùng hoặc category
  const handleCategorySelect = (cat: MainCategory) => {
    setSelectedCategory(cat);
    const dataSet = region === 'mb' ? BET_DATA.mb : BET_DATA.mn_mt;
    setSelectedSub(dataSet[cat][0]);
  };

  const handleRegionSelect = (r: Region) => {
    setRegion(r);
    const dataSet = r === 'mb' ? BET_DATA.mb : BET_DATA.mn_mt;
    setSelectedSub(dataSet[selectedCategory][0]);
  };

  const currentDataSet = region === 'mb' ? BET_DATA.mb : BET_DATA.mn_mt;
  const currentSubOptions = currentDataSet[selectedCategory];

  // Tính toán
  const calculateTotal = () => {
    const numbers = inputNumbers.split(',').map(s => s.trim()).filter(s => s !== '');
    if (numbers.length === 0) return 0;
    const amountNum = parseInt(baseAmount) || 0;
    return numbers.length * amountNum * selectedSub.multiplier;
  };

  const calculateWinAmount = () => {
    const amountNum = parseInt(baseAmount) || 0;
    return amountNum * selectedSub.rate;
  };

  const handleAddToCart = () => {
    if (!inputNumbers.trim()) {
      return Alert.alert('Lỗi', 'Vui lòng nhập số muốn cược');
    }
    const total = calculateTotal();
    if (total === 0) return;

    // Phân giải region to string
    const regionName = region === 'mn' ? 'Miền Nam' : region === 'mt' ? 'Miền Trung' : 'Miền Bắc';

    addToCart({
      gameId: gameId,
      gameName: `XỔ SỐ 3 MIỀN - ${regionName}`,
      numbers: [inputNumbers],
      cost: total,
      quantity: 1,
      playType: `${selectedCategory} - ${selectedSub.name}`,
      provinceName: regionName,
      drawDate: new Date().toISOString(),
    });
    Alert.alert('Thành công', 'Đã thêm vé vào giỏ hàng');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>XỔ SỐ 3 MIỀN</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs Miền */}
      <View style={styles.regionTabs}>
        <TouchableOpacity
          style={[styles.regionTab, region === 'mn' && styles.regionTabActive]}
          onPress={() => handleRegionSelect('mn')}
        >
          <Text style={[styles.regionTabText, region === 'mn' && styles.regionTabTextActive]}>Miền Nam</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.regionTab, region === 'mt' && styles.regionTabActive]}
          onPress={() => handleRegionSelect('mt')}
        >
          <Text style={[styles.regionTabText, region === 'mt' && styles.regionTabTextActive]}>Miền Trung</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.regionTab, region === 'mb' && styles.regionTabActive]}
          onPress={() => handleRegionSelect('mb')}
        >
          <Text style={[styles.regionTabText, region === 'mb' && styles.regionTabTextActive]}>Miền Bắc</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* Khung Kết Quả Placeholder */}
        <View style={styles.resultBox}>
          <Text style={styles.resultBoxTitle}>Kết quả kỳ trước</Text>
          <Text style={styles.resultBoxSubtitle}>(Hiển thị bảng kết quả XSKT tương ứng)</Text>
        </View>

        {/* Cược Menu */}
        <View style={styles.betSection}>
          <Text style={styles.sectionTitle}>Chọn Loại Cược</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {MAIN_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, selectedCategory === cat && styles.catBtnActive]}
                onPress={() => handleCategorySelect(cat)}
              >
                <Text style={[styles.catBtnText, selectedCategory === cat && styles.catBtnTextActive]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.subCatGrid}>
            {currentSubOptions.map(sub => (
              <TouchableOpacity
                key={sub.name}
                style={[styles.subCatBtn, selectedSub.name === sub.name && styles.subCatBtnActive]}
                onPress={() => setSelectedSub(sub)}
              >
                <Text style={[styles.subCatBtnText, selectedSub.name === sub.name && styles.subCatBtnTextActive]}>{sub.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Table */}
        <View style={styles.infoTable}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cấp nhân (Tiền xác):</Text>
            <Text style={styles.infoValue}>x{selectedSub.multiplier}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tỉ lệ thắng:</Text>
            <Text style={styles.infoValueRed}>1 ăn {selectedSub.rate}</Text>
          </View>
        </View>

        {/* Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Nhập số muốn cược</Text>
          <Text style={styles.inputHint}>Ngăn cách các số bằng dấu phẩy (vd: 68, 86)</Text>
          <TextInput
            style={styles.textInput}
            value={inputNumbers}
            onChangeText={setInputNumbers}
            placeholder="Nhập số..."
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
            multiline
          />

          <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Số tiền cược (vnđ/1 con)</Text>
          <TextInput
            style={styles.textInput}
            value={baseAmount}
            onChangeText={setBaseAmount}
            keyboardType="numeric"
            placeholder="1000"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.footerLabel}>Tổng thanh toán</Text>
            <Text style={styles.footerTotal}>{calculateTotal().toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerLabel}>Thắng tạm tính</Text>
            <Text style={styles.footerWin}>{calculateWinAmount().toLocaleString('vi-VN')} đ</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.submitBtn} onPress={handleAddToCart}>
          <Text style={styles.submitBtnText}>THÊM VÀO GIỎ VÉ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  backBtn: { padding: 4 },
  infoBtn: { padding: 4 },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0056B3',
  },
  regionTabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  regionTab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  regionTabActive: {
    borderBottomColor: COLORS.primary,
  },
  regionTabText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textMuted,
  },
  regionTabTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  content: {
    flex: 1,
  },
  resultBox: {
    margin: SPACING.md,
    backgroundColor: '#FFF2EE',
    borderWidth: 1,
    borderColor: '#FFD1C1',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  resultBoxTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  resultBoxSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  betSection: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  catScroll: {
    marginBottom: SPACING.md,
  },
  catBtn: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.gray100,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  catBtnActive: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  catBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textMuted,
  },
  catBtnTextActive: {
    color: COLORS.primary,
  },
  subCatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subCatBtn: {
    width: '31%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  subCatBtnActive: {
    backgroundColor: '#E6F0FA',
    borderColor: '#0056B3',
  },
  subCatBtnText: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  subCatBtnTextActive: {
    color: '#0056B3',
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  infoTable: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textDark,
  },
  infoValueRed: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  inputSection: {
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
  },
  inputHint: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  textInput: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textDark,
    minHeight: 44,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.dark,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  footerLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textMuted,
  },
  footerTotal: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  footerWin: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFF',
  },
});
