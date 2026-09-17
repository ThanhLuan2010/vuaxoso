import { ChevronLeft, Info } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme/theme';

type Region = 'mn' | 'mt' | 'mb';
type MainCategory = 'Bao Lô' | 'Đề' | 'Xiên' | '3 Càng' | '4 Càng' | 'Lô Trượt';

interface BetOption {
  name: string;
  multiplier: number;
  rate: number;
  description?: string;
}

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
      { name: 'Xiên ĐB', multiplier: 1, rate: 4.9 },
      { name: 'Xiên giải 1', multiplier: 1, rate: 4.9 },
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
      { name: 'Xiên 3 càng ĐB', multiplier: 1, rate: 158 },
    ],
    '4 Càng': [
      { name: '4 Càng ĐB', multiplier: 1, rate: 9000 },
      { name: '4 Càng giải 1', multiplier: 1, rate: 9000 },
      { name: 'Xiên 4 càng ĐB', multiplier: 1, rate: 388 },
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
      { name: 'Xiên ĐB', multiplier: 1, rate: 4.9 },
      { name: 'Xiên giải 1', multiplier: 1, rate: 4.9 },
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
      { name: 'Xiên 3 càng ĐB', multiplier: 1, rate: 158 },
    ],
    '4 Càng': [
      { name: '4 Càng ĐB', multiplier: 1, rate: 9000 },
      { name: '4 Càng giải 1', multiplier: 1, rate: 9000 },
      { name: 'Xiên 4 càng ĐB', multiplier: 1, rate: 388 },
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

const getExpectedLength = (name: string) => {
  const n = name.toLowerCase();
  if (n === 'đề đầu' || n === 'đề đuôi' || n === 'xiên đb' || n === 'xiên giải 1' || n === 'xiên 3 càng đb' || n === 'xiên 4 càng đb') return 1;
  if (n.includes('3 số') || n.includes('3 càng')) return 3;
  if (n.includes('4 số') || n.includes('4 càng')) return 4;
  return 2;
};

const isXienCombo = (name: string) => {
  const n = name.toLowerCase();
  return (n.includes('xiên') || n.includes('trượt')) && n !== 'xiên đb' && n !== 'xiên giải 1' && !n.includes('đb');
};

const parseNumbers = (input: string, selectedSub: BetOption) => {
  if (!input.trim()) return { numbers: [], error: null };
  const expectedLength = getExpectedLength(selectedSub.name);

  if (isXienCombo(selectedSub.name)) {
    if (input.includes('  ')) {
      return { numbers: [], error: 'Sai cú pháp: Khoảng cách không được vượt quá 1 lần trắng' };
    }
    const parts = input.split(/[,\s;]+/).filter(Boolean);
    let k = 2;
    if (selectedSub.name.includes('3')) k = 3;
    if (selectedSub.name.includes('4')) k = 4;
    if (selectedSub.name.includes('6')) k = 6;
    if (selectedSub.name.includes('8')) k = 8;
    if (selectedSub.name.includes('10')) k = 10;

    const valid: string[] = [];
    const seenTickets = new Set<string>();
    for (const p of parts) {
      if (!p.includes('&')) {
        return { numbers: [], error: `Cú pháp sai: Vé xiên phải ghép bằng dấu "&"` };
      }
      const nums = p.split('&');
      if (nums.length !== k) {
        return { numbers: [], error: `Vé xiên yêu cầu ghép đúng ${k} số. Đã nhập: ${p}` };
      }
      const unique = new Set(nums);
      if (unique.size !== nums.length) {
        return { numbers: [], error: 'Số trùng, vui lòng kiểm tra lại' };
      }
      for (const n of nums) {
        if (!/^\d+$/.test(n) || n.length !== 2) {
          return { numbers: [], error: `Các cặp số xiên phải gồm 2 chữ số. Sai ở: ${n}` };
        }
      }

      // Sort the numbers to normalize the ticket (01&02 is the same as 02&01)
      const sortedTicket = [...nums].sort().join('&');
      if (!seenTickets.has(sortedTicket)) {
        seenTickets.add(sortedTicket);
        valid.push(p);
      }
    }
    return { numbers: valid, error: null };
  }

  // Normal logic
  if (input.includes('  ')) {
    return { numbers: [], error: 'Sai cú pháp: Khoảng cách không được vượt quá 1 lần trắng' };
  }
  const rawParts = input.split(/[,\s;]+/).filter(Boolean);
  const unique = new Set<string>();

  for (const part of rawParts) {
    if (!/^\d+$/.test(part)) return { numbers: [], error: `Có ký tự không hợp lệ: ${part}` };
    if (part.length !== expectedLength) return { numbers: [], error: `Yêu cầu đúng ${expectedLength} ký tự số. Đã nhập: ${part}` };
    unique.add(part);
  }

  return { numbers: Array.from(unique), error: null };
};

const getXienPlaceholder = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('trượt xiên 4')) return "Nhập số... (VD: 00&01&02&03)";
  if (n.includes('trượt xiên 6')) return "Nhập số... (VD: 00&01&02&03&04&05)";
  if (n.includes('trượt xiên 8')) return "Nhập số... (VD: 00&01&02&03&04&05&06&07)";
  if (n.includes('trượt xiên 10')) return "Nhập số... (VD: 00&01&02&03&04&05&06&07&08&09)";

  if (n.includes('3')) return "Nhập số... (VD: 68&78&88)";
  if (n.includes('4')) return "Nhập số... (VD: 68&78&88&98)";
  return "Nhập số... (VD: 68&78)";
};

const NumberPicker = ({ expectedLength, onNumbersGenerated, subName }: { expectedLength: number, onNumbersGenerated: (nums: string) => void, subName: string }) => {
  const [thousands, setThousands] = useState<number[]>([]);
  const [hundreds, setHundreds] = useState<number[]>([]);
  const [tens, setTens] = useState<number[]>([]);
  const [units, setUnits] = useState<number[]>([]);

  const toggleNumber = (type: 'thousands' | 'hundreds' | 'tens' | 'units', num: number) => {
    if (type === 'thousands') setThousands(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num].sort());
    else if (type === 'hundreds') setHundreds(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num].sort());
    else if (type === 'tens') setTens(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num].sort());
    else setUnits(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num].sort());
  };

  useEffect(() => {
    const generated: string[] = [];
    if (expectedLength === 1) {
      if (subName.toLowerCase() === 'đề đầu' && tens.length > 0) {
        for (const t of tens) generated.push(`${t}`);
      } else if (subName.toLowerCase() !== 'đề đầu' && units.length > 0) {
        for (const u of units) generated.push(`${u}`);
      }
    } else if (expectedLength === 2 && tens.length > 0 && units.length > 0) {
      for (const t of tens) for (const u of units) generated.push(`${t}${u}`);
    } else if (expectedLength === 3 && hundreds.length > 0 && tens.length > 0 && units.length > 0) {
      for (const h of hundreds) for (const t of tens) for (const u of units) generated.push(`${h}${t}${u}`);
    } else if (expectedLength === 4 && thousands.length > 0 && hundreds.length > 0 && tens.length > 0 && units.length > 0) {
      for (const th of thousands) for (const h of hundreds) for (const t of tens) for (const u of units) generated.push(`${th}${h}${t}${u}`);
    }

    onNumbersGenerated(generated.join(', '));
  }, [thousands, hundreds, tens, units, expectedLength, subName]);

  const renderRow = (label: string, type: 'thousands' | 'hundreds' | 'tens' | 'units', selectedArr: number[]) => {
    const isSingleDigitMode = expectedLength === 1;
    const hideLabel = isSingleDigitMode && (subName.toLowerCase() === 'xiên đb' || subName.toLowerCase() === 'xiên giải 1' || subName.toLowerCase() === 'xiên 3 càng đb' || subName.toLowerCase() === 'xiên 4 càng đb');
    return (
      <View style={styles.pickerRow}>
        {!hideLabel && <Text style={styles.pickerRowLabel}>{label}</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pickerScroll}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <TouchableOpacity
              key={num}
              style={[styles.pickerCircle, selectedArr.includes(num) && styles.pickerCircleActive]}
              onPress={() => toggleNumber(type, num)}
            >
              <Text style={[styles.pickerCircleText, selectedArr.includes(num) && styles.pickerCircleTextActive]}>{num}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.pickerContainer}>
      {expectedLength >= 4 && renderRow('Ngàn', 'thousands', thousands)}
      {expectedLength >= 3 && renderRow('Trăm', 'hundreds', hundreds)}
      {(expectedLength >= 2 || subName.toLowerCase() === 'đề đầu') && renderRow('Chục', 'tens', tens)}
      {(expectedLength >= 2 || (expectedLength === 1 && subName.toLowerCase() !== 'đề đầu')) && renderRow('Đơn vị', 'units', units)}
    </View>
  );
};


export default function GameLayoutLodeScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { addToCart } = useAppStore();
  const gameId = route.params?.gameId || 'xoso_3mien';

  const [region, setRegion] = useState<Region>('mn');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('Bao Lô');
  const [selectedSub, setSelectedSub] = useState<BetOption>(BET_DATA['mn_mt']['Bao Lô'][0]);
  const [inputNumbers, setInputNumbers] = useState('');
  const [baseAmount, setBaseAmount] = useState('1000');
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  const [provinceOpen, setProvinceOpen] = useState(false);
  const [provinceValue, setProvinceValue] = useState<string | null>(null);
  const [provinceItems, setProvinceItems] = useState<{ label: string, value: string }[]>([]);
  const [allProvinces, setAllProvinces] = useState<any[]>([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const { data } = await api.get('/provinces');
        setAllProvinces(data);
      } catch (error) {
        console.error('Failed to fetch provinces', error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const today = new Date().getDay();
    const filtered = allProvinces.filter(p => {
      if (p.region.toLowerCase() !== region) return false;
      if (p.drawDays && Array.isArray(p.drawDays)) {
        return p.drawDays.includes(today);
      }
      return true;
    });

    const items = filtered.map(p => ({ label: p.name, value: p.provinceId }));
    setProvinceItems(items);
    if (items.length > 0 && !items.find(i => i.value === provinceValue)) {
      setProvinceValue(items[0].value);
    }
  }, [region, allProvinces]);

  const currentParsed = useMemo(() => parseNumbers(inputNumbers, selectedSub), [inputNumbers, selectedSub]);

  const handleCategorySelect = (cat: MainCategory) => {
    setSelectedCategory(cat);
    const dataSet = region === 'mb' ? BET_DATA.mb : BET_DATA.mn_mt;
    setSelectedSub(dataSet[cat][0]);
    setInputNumbers('');
  };

  const handleRegionSelect = (r: Region) => {
    setRegion(r);
    const dataSet = r === 'mb' ? BET_DATA.mb : BET_DATA.mn_mt;
    setSelectedSub(dataSet[selectedCategory][0]);
    setInputNumbers('');
  };

  const currentDataSet = region === 'mb' ? BET_DATA.mb : BET_DATA.mn_mt;
  const currentSubOptions = currentDataSet[selectedCategory];

  const calculateTotal = () => {
    if (currentParsed.error || currentParsed.numbers.length === 0) return 0;
    const amountNum = parseInt(baseAmount) || 0;
    return currentParsed.numbers.length * amountNum * selectedSub.multiplier;
  };

  const calculateWinAmount = () => {
    if (currentParsed.error || currentParsed.numbers.length === 0 || !inputNumbers.trim()) return 0;
    const amountNum = parseInt(baseAmount) || 0;
    return currentParsed.numbers.length * amountNum * selectedSub.rate;
  };

  const handleAddToCart = () => {
    if (currentParsed.error) {
      return Alert.alert('Lỗi cú pháp', currentParsed.error);
    }
    if (currentParsed.numbers.length === 0) {
      return Alert.alert('Lỗi', 'Vui lòng nhập số muốn cược');
    }
    setConfirmModalVisible(true);
  };

  const confirmAddToCart = () => {
    addToCart({
      gameId,
      gameName: `XỔ SỐ 3 MIỀN - ${region.toUpperCase()}`,
      numbers: currentParsed.numbers,
      cost: calculateTotal(),
      winAmount: calculateWinAmount(),
      region,
      provinceId: provinceValue ?? undefined,
      category: selectedCategory,
      subCategory: selectedSub.name,
      multiplier: selectedSub.multiplier,
      rate: selectedSub.rate,
      quantity: 1,
    });
    setConfirmModalVisible(false);
    navigation.goBack();
  };
  // Các loại cược này BẮT BUỘC dùng NumberPicker (Không cho nhập tay)
  const isManualDisabled = ['đề đầu', 'đề đuôi', 'xiên đb', 'xiên giải 1', 'xiên 3 càng đb', 'xiên 4 càng đb'].includes(selectedSub.name.toLowerCase());

  // Các loại cược này BẮT BUỘC nhập tay (Không hiển thị NumberPicker)
  const isNumberPickerHidden = isXienCombo(selectedSub.name);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>XỔ SỐ 3 MIỀN</Text>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={100}
        >
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

          <View style={{ zIndex: 10, marginHorizontal: SPACING.md, marginTop: SPACING.sm, marginBottom: SPACING.sm }}>
            <DropDownPicker
              open={provinceOpen}
              value={provinceValue}
              items={provinceItems}
              setOpen={setProvinceOpen}
              setValue={setProvinceValue}
              setItems={setProvinceItems}
              placeholder="Chọn đài"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            />
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
                  onPress={() => { setSelectedSub(sub); setInputNumbers(''); }}
                >
                  <Text style={[styles.subCatBtnText, selectedSub.name === sub.name && styles.subCatBtnTextActive]}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description Block */}
          <View style={styles.descriptionBlock}>
            <View style={styles.descriptionRow}>
              <Info size={16} color={COLORS.textLight} style={{ marginRight: SPACING.xs }} />
              <Text style={styles.descriptionText}>
                {selectedSub.description || (selectedSub.name.toLowerCase().includes('trượt') ? `Đánh ${selectedSub.name}. Không có trong KQXS thì thắng.` : `Đánh ${selectedSub.name}. Có trong KQXS thì thắng.`)}
              </Text>
            </View>
            <View style={[styles.descriptionRow, { marginLeft: 20 }]}>
              <Text style={styles.descriptionLabel}>Cấp nhân (Tiền xác):</Text>
              <Text style={styles.descriptionValue}>x{selectedSub.multiplier}</Text>
            </View>
            <View style={[styles.descriptionRow, { marginLeft: 20 }]}>
              <Text style={styles.descriptionLabel}>Tỉ lệ thắng:</Text>
              <Text style={[styles.descriptionValue, { color: COLORS.error }]}>1 ăn {selectedSub.rate}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Nhập số muốn cược</Text>

          {!isNumberPickerHidden && (
            <NumberPicker
              expectedLength={getExpectedLength(selectedSub.name)}
              onNumbersGenerated={(nums) => setInputNumbers(nums)}
              subName={selectedSub.name}
            />
          )}

          <Text style={styles.inputHint}>
            {isXienCombo(selectedSub.name)
              ? 'Ngăn cách các cặp số bằng dấu: , hoặc ; hoặc khoảng cách'
              : 'Ngăn cách bằng dấu phẩy, chấm phẩy hoặc khoảng trắng'}
          </Text>

          <TextInput
            style={[styles.textInput, isManualDisabled && { backgroundColor: COLORS.gray200 }]}
            value={inputNumbers}
            onChangeText={setInputNumbers}
            placeholder={isManualDisabled ? "Không nhập tay được. Vui lòng bấm chọn số bất kỳ." : isXienCombo(selectedSub.name) ? getXienPlaceholder(selectedSub.name) : "Nhập số... (VD: 688,788)"}
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numbers-and-punctuation"
            multiline
            editable={!isManualDisabled}
          />

          <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Số tiền cược (vnđ/1 con)</Text>
          <TextInput
            style={[styles.textInput, { minHeight: 48 }]}
            value={baseAmount ? Number(baseAmount.replace(/[^0-9]/g, '')).toLocaleString('vi-VN') : ''}
            onChangeText={(text) => setBaseAmount(text.replace(/[^0-9]/g, ''))}
            placeholder="Nhập số tiền..."
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
          />

          <View style={{ height: 40 }} />
        </KeyboardAwareScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          {inputNumbers.length > 0 && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Số đã chọn:</Text>
              {currentParsed.error ? (
                <Text style={styles.previewError}>{currentParsed.error}</Text>
              ) : currentParsed.numbers.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
                  {currentParsed.numbers.map((n, i) => (
                    <View key={i} style={styles.previewTag}>
                      <Text style={styles.previewTagText}>{n}</Text>
                    </View>
                  ))}
                </ScrollView>
              ) : null}
            </View>
          )}

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
          <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
            <Text style={styles.addBtnText}>THÊM VÀO GIỎ VÉ</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác Nhận Đặt Cược</Text>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Loại cược:</Text>
              <Text style={styles.modalValue}>{selectedCategory} - {selectedSub.name}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Số đã chọn:</Text>
              <Text style={[styles.modalValue, { color: COLORS.primary, flex: 1, textAlign: 'right' }]} numberOfLines={3}>
                {currentParsed.numbers.join(', ')}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Tổng số vé:</Text>
              <Text style={styles.modalValue}>{currentParsed.numbers.length}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Tiền 1 vé:</Text>
              <Text style={styles.modalValue}>{Number(baseAmount || 0).toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={[styles.modalRow, { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm }]}>
              <Text style={[styles.modalLabel, { fontWeight: 'bold' }]}>Tổng thanh toán:</Text>
              <Text style={[styles.modalValue, { color: COLORS.error, fontWeight: 'bold', fontSize: 18 }]}>
                {calculateTotal().toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setConfirmModalVisible(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmAddToCart}>
                <Text style={styles.modalConfirmText}>Xác Nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, backgroundColor: COLORS.cardBackground, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textDark },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  regionTabs: { flexDirection: 'row', backgroundColor: COLORS.cardBackground, paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  regionTab: { flex: 1, paddingVertical: SPACING.md, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  regionTabActive: { borderBottomColor: COLORS.primary },
  regionTabText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textMuted, fontWeight: TYPOGRAPHY.fontWeight.medium },
  regionTabTextActive: { color: COLORS.primary, fontWeight: TYPOGRAPHY.fontWeight.bold },
  betSection: { backgroundColor: COLORS.cardBackground, padding: SPACING.md, marginBottom: SPACING.md },
  catScroll: { marginBottom: SPACING.md },
  catBtn: { paddingHorizontal: SPACING.lg, paddingVertical: 8, borderRadius: BORDER_RADIUS.round, backgroundColor: COLORS.gray100, marginRight: SPACING.sm, borderWidth: 1, borderColor: COLORS.gray300 },
  catBtnActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  catBtnText: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.semiBold, color: COLORS.textMuted },
  catBtnTextActive: { color: COLORS.primary },
  subCatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subCatBtn: { width: '31%', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.gray100, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: COLORS.gray300 },
  subCatBtnActive: { backgroundColor: '#E6F0FA', borderColor: '#0056B3' },
  subCatBtnText: { fontSize: 13, fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.textDark, textAlign: 'center' },
  subCatBtnTextActive: { color: '#0056B3', fontWeight: TYPOGRAPHY.fontWeight.bold },
  dropdown: {
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    height: 48,
  },
  dropdownContainer: {
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.border,
  },
  descriptionBlock: { backgroundColor: '#F0F7FF', padding: SPACING.md, marginTop: SPACING.sm, marginHorizontal: SPACING.md, borderRadius: BORDER_RADIUS.sm, borderWidth: 1, borderColor: '#CCE5FF' },
  descriptionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  descriptionText: { flex: 1, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textDark, fontWeight: TYPOGRAPHY.fontWeight.medium },
  descriptionLabel: { flex: 1, fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted },
  descriptionValue: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textDark },
  sectionTitle: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textDark, marginHorizontal: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  pickerContainer: { marginHorizontal: SPACING.md, backgroundColor: COLORS.cardBackground, borderRadius: BORDER_RADIUS.md, padding: SPACING.sm, ...SHADOWS.light },
  pickerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  pickerRowLabel: { width: 40, fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.medium, color: COLORS.textDark },
  pickerScroll: { alignItems: 'center' },
  pickerCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: COLORS.gray200 },
  pickerCircleActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pickerCircleText: { fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textDark, fontWeight: TYPOGRAPHY.fontWeight.medium },
  pickerCircleTextActive: { color: COLORS.cardBackground, fontWeight: TYPOGRAPHY.fontWeight.bold },
  inputHint: { fontSize: TYPOGRAPHY.fontSize.xs, color: COLORS.textMuted, marginHorizontal: SPACING.md, marginTop: SPACING.sm, marginBottom: 4 },
  textInput: { marginHorizontal: SPACING.md, backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.sm, padding: SPACING.md, fontSize: TYPOGRAPHY.fontSize.md, color: COLORS.textDark, minHeight: 60, textAlignVertical: 'top' },
  footer: { backgroundColor: COLORS.cardBackground, paddingHorizontal: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.dark },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  footerLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted, marginBottom: 4 },
  footerTotal: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.error },
  footerWin: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.success },
  addBtn: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  addBtnText: { color: COLORS.cardBackground, fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold },
  previewContainer: { marginBottom: SPACING.md, backgroundColor: COLORS.gray100, borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, borderWidth: 1, borderColor: COLORS.gray200 },
  previewTitle: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textDark, marginBottom: SPACING.xs },
  previewError: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.error, fontStyle: 'italic' },
  previewScroll: { flexDirection: 'row' },
  previewTag: { backgroundColor: '#E6F0FA', borderWidth: 1, borderColor: '#0056B3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: BORDER_RADIUS.round, marginRight: 8 },
  previewTagText: { fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.bold, color: '#0056B3' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: COLORS.cardBackground, borderRadius: BORDER_RADIUS.md, padding: SPACING.lg },
  modalTitle: { fontSize: TYPOGRAPHY.fontSize.lg, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textDark, marginBottom: SPACING.md, textAlign: 'center' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  modalLabel: { fontSize: TYPOGRAPHY.fontSize.sm, color: COLORS.textMuted },
  modalValue: { fontSize: TYPOGRAPHY.fontSize.sm, fontWeight: TYPOGRAPHY.fontWeight.bold, color: COLORS.textDark },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.lg },
  modalCancelBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.gray200, marginRight: SPACING.sm, alignItems: 'center' },
  modalCancelText: { color: COLORS.textDark, fontWeight: TYPOGRAPHY.fontWeight.bold },
  modalConfirmBtn: { flex: 1, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.sm, backgroundColor: COLORS.primary, marginLeft: SPACING.sm, alignItems: 'center' },
  modalConfirmText: { color: COLORS.cardBackground, fontWeight: TYPOGRAPHY.fontWeight.bold }
});
