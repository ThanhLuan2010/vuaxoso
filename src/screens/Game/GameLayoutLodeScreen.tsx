import Toast from 'react-native-toast-message';
import { ChevronLeft, Info, Calendar, ChevronDown, Check, X } from 'lucide-react-native';
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
      { name: 'Xiên ĐB', multiplier: 1, rate: 4.8 },
      { name: 'Xiên giải 1', multiplier: 1, rate: 4.8 },
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
      { name: 'Xiên 3 càng ĐB', multiplier: 1, rate: 3.2 },
      { name: 'Xiên 3 càng giải 1', multiplier: 1, rate: 3.2 },
    ],
    '4 Càng': [
      { name: '4 Càng ĐB', multiplier: 1, rate: 9000 },
      { name: '4 Càng đầu ĐB', multiplier: 1, rate: 9000 },
      { name: '4 Càng giải 1', multiplier: 1, rate: 9000 },
      { name: '4 Càng đầu giải 1', multiplier: 1, rate: 9000 },
      { name: 'Xiên 4 càng ĐB', multiplier: 1, rate: 2.4 },
      { name: 'Xiên 4 càng giải 1', multiplier: 1, rate: 2.4 },
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
      { name: 'Xiên ĐB', multiplier: 1, rate: 4.8 },
      { name: 'Xiên giải 1', multiplier: 1, rate: 4.8 },
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
      { name: 'Xiên 3 càng ĐB', multiplier: 1, rate: 3.2 },
      { name: 'Xiên 3 càng giải 1', multiplier: 1, rate: 3.2 },
    ],
    '4 Càng': [
      { name: '4 Càng ĐB', multiplier: 1, rate: 9000 },
      { name: '4 Càng đầu ĐB', multiplier: 1, rate: 9000 },
      { name: '4 Càng giải 1', multiplier: 1, rate: 9000 },
      { name: '4 Càng đầu giải 1', multiplier: 1, rate: 9000 },
      { name: 'Xiên 4 càng ĐB', multiplier: 1, rate: 2.4 },
      { name: 'Xiên 4 càng giải 1', multiplier: 1, rate: 2.4 },
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
  if (n === 'đề đầu' || n === 'đề đuôi' || n === 'xiên đb' || n === 'xiên giải 1' || n.includes('xiên 3 càng') || n.includes('xiên 4 càng')) return 1;
  if (n.includes('3 số') || n.includes('3 càng')) return 3;
  if (n.includes('4 số') || n.includes('4 càng')) return 4;
  return 2;
};

const isXienCombo = (name: string) => {
  const n = name.toLowerCase();
  return (n.includes('xiên') || n.includes('trượt')) && n !== 'xiên đb' && n !== 'xiên giải 1' && !n.includes('đb') && !n.includes('xiên 3 càng') && !n.includes('xiên 4 càng');
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
  if (n.includes('trượt xiên 4')) return "Nhập số...";
  if (n.includes('trượt xiên 6')) return "Nhập số...";
  if (n.includes('trượt xiên 8')) return "Nhập số...";
  if (n.includes('trượt xiên 10')) return "Nhập số...";

  if (n.includes('3')) return "Nhập số...";
  if (n.includes('4')) return "Nhập số...";
  return "Nhập số...";
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
    const hideLabel = isSingleDigitMode && (subName.toLowerCase() === 'xiên đb' || subName.toLowerCase() === 'xiên giải 1' || subName.toLowerCase().includes('xiên 3 càng') || subName.toLowerCase().includes('xiên 4 càng'));
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


const getVnDateDetails = (dateInput: Date | string | number) => {
  const d = new Date(dateInput);
  const vnDateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }); // "YYYY-MM-DD"
  const [yearStr, monthStr, dayStr] = vnDateStr.split('-');
  const y = Number(yearStr);
  const m = Number(monthStr);
  const dt = Number(dayStr);
  const localVnDate = new Date(y, m - 1, dt);
  const targetDay = localVnDate.getDay();
  const vnTimeStr = d.toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    dateKey: vnDateStr,
    formattedDate: `${dayStr}/${monthStr}/${yearStr}`,
    dayMonth: `${dayStr}/${monthStr}`,
    yearStr,
    targetDay,
    timeStr: vnTimeStr,
    localVnDate,
  };
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
  const [isDrawPickerVisible, setIsDrawPickerVisible] = useState(false);
  const [selectedDrawId, setSelectedDrawId] = useState<string | null>(null);
  const [activeDraws, setActiveDraws] = useState<any[]>([]);
  const [isBuyNow, setIsBuyNow] = useState(false);
  const [showAllNumbers, setShowAllNumbers] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(false);

  const [provinceOpen, setProvinceOpen] = useState(false);
  const [provinceValue, setProvinceValue] = useState<string | null>(null);
  const [provinceItems, setProvinceItems] = useState<{ label: string, value: string }[]>([]);
  const [allProvinces, setAllProvinces] = useState<any[]>([]);
  const [apiRates, setApiRates] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    const fetchProvincesAndRates = async () => {
      try {
        const [provRes, gamesRes, drawsRes] = await Promise.all([
          api.get('/provinces'),
          api.get('/games'),
          api.get('/draws/active').catch(() => ({ data: [] }))
        ]);
        if (provRes?.data) setAllProvinces(provRes.data);
        if (Array.isArray(drawsRes?.data)) setActiveDraws(drawsRes.data);
        if (Array.isArray(gamesRes?.data)) {
          const ratesMap: Record<string, Record<string, number>> = {};
          gamesRes.data.forEach((g: any) => {
            if (g.code && g.payoutRates) {
              ratesMap[g.code] = g.payoutRates;
            }
          });
          setApiRates(ratesMap);
        }
      } catch (error) {
        console.error('Failed to fetch provinces or game rates', error);
      }
    };
    fetchProvincesAndRates();
  }, []);

  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      api.get('/draws/active')
        .then(res => {
          if (Array.isArray(res.data)) setActiveDraws(res.data);
        })
        .catch(() => { });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Tính danh sách các kỳ quay trong tương lai (từ CMS / API và lịch quay định kỳ)
  // CHỈ CHO PHÉP CHỌN CÁC KỲ QUAY TRONG TƯƠNG LAI
  const availableDrawDates = useMemo(() => {
    const now = new Date();
    const nowMs = now.getTime();
    const todayVn = getVnDateDetails(now);
    const [hours, minutes] = todayVn.timeStr.split(':').map(Number);
    const currentMinutes = hours * 60 + minutes;

    let cutoffMinutes = 18 * 60 + 10; // MB: 18:10
    if (region === 'mn') {
      cutoffMinutes = 16 * 60 + 10; // MN: 16:10
    } else if (region === 'mt') {
      cutoffMinutes = 17 * 60 + 10; // MT: 17:10
    }

    const isTodayPastCutoff = currentMinutes >= cutoffMinutes;
    const tomorrowVn = getVnDateDetails(new Date(nowMs + 24 * 60 * 60 * 1000));
    const dayAfterVn = getVnDateDetails(new Date(nowMs + 48 * 60 * 60 * 1000));

    const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

    const options: any[] = [];

    // 1. ƯU TIÊN HIỂN THỊ TẤT CẢ CÁC KỲ QUAY ĐƯỢC TẠO TRÊN CMS (/draws/active)
    const matchedApiDraws = activeDraws.filter(draw => {
      const gCode = (draw.game?.code || '').toLowerCase();
      const isRegionMatch = gCode === region || gCode === 'xoso_3mien' || gCode === 'xs' + region;
      if (!isRegionMatch) return false;

      const closeTimeMs = new Date(draw.closeTime).getTime();
      if (closeTimeMs <= nowMs) return false; // Chỉ lấy các kỳ trong tương lai

      return true;
    });

    // Sắp xếp các kỳ từ CMS theo thời gian đóng cược sớm nhất -> muộn hơn
    matchedApiDraws.sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());

    matchedApiDraws.forEach(draw => {
      const closeTimeMs = new Date(draw.closeTime).getTime();
      const vnDetails = getVnDateDetails(draw.closeTime);
      const dayName = daysOfWeek[vnDetails.targetDay];

      let badgeText = '';
      if (vnDetails.dateKey === todayVn.dateKey) {
        badgeText = 'Hôm nay';
      } else if (vnDetails.dateKey === tomorrowVn.dateKey) {
        badgeText = 'Ngày mai';
      } else if (vnDetails.dateKey === dayAfterVn.dateKey) {
        badgeText = 'Ngày kia';
      }

      const drawCodeStr = draw.drawCode
        ? (draw.drawCode.startsWith('#') ? draw.drawCode : `#${draw.drawCode}`)
        : '';

      const pId = typeof draw.provinceId === 'string'
        ? draw.provinceId
        : (draw.provinceId?._id || draw.provinceId?.provinceId || draw.province?.provinceId || draw.province?.id || draw.province?.code || '');

      const provName = draw.province?.name || (pId ? (allProvinces.find(p => p.provinceId?.toLowerCase() === pId?.toLowerCase())?.name || pId) : (region === 'mb' ? 'Miền Bắc' : 'Toàn miền'));

      const id = String(draw._id || draw.id || `${drawCodeStr}_${draw.closeTime}`);

      options.push({
        id,
        drawId: drawCodeStr || id,
        drawCode: drawCodeStr,
        closeTimeMs,
        closeTimeStr: vnDetails.timeStr,
        targetDay: vnDetails.targetDay,
        targetDate: vnDetails.localVnDate,
        dayName,
        dayMonth: vnDetails.dayMonth,
        yearStr: vnDetails.yearStr,
        formattedDate: vnDetails.formattedDate,
        dateKey: vnDetails.dateKey,
        dateLabel: drawCodeStr ? `${drawCodeStr} - ${dayName}, ${vnDetails.dayMonth}` : `${dayName}, ${vnDetails.dayMonth}`,
        badgeText,
        isToday: vnDetails.dateKey === todayVn.dateKey,
        isPastCutoff: isTodayPastCutoff,
        provincesText: provName,
        provinceId: pId || undefined,
        isFromApi: true,
      });
    });

    // 2. TẠO CÁC KỲ ĐỊNH KỲ CHO CÁC NGÀY CHƯA CÓ KỲ TỪ CMS TRONG 14 NGÀY TỚI
    const [y, m, d] = todayVn.dateKey.split('-').map(Number);
    const startOffset = isTodayPastCutoff ? 1 : 0;
    const daysCount = 14;

    for (let offset = startOffset; offset < startOffset + daysCount; offset++) {
      const targetDate = new Date(y, m - 1, d + offset);
      const targetDay = targetDate.getDay();
      const dayName = daysOfWeek[targetDay];
      const dayStr = String(targetDate.getDate()).padStart(2, '0');
      const monthStr = String(targetDate.getMonth() + 1).padStart(2, '0');
      const yearStr = String(targetDate.getFullYear());
      const formattedDate = `${dayStr}/${monthStr}/${yearStr}`;
      const dateKey = `${yearStr}-${monthStr}-${dayStr}`;

      // Nếu ngày này ĐÃ CÓ kỳ từ CMS thì không cần thêm bản ghi giả định
      const hasApiDrawOnThisDate = options.some(o => o.dateKey === dateKey);
      if (!hasApiDrawOnThisDate) {
        let badgeText = '';
        let dateLabel = `${dayName}, ${dayStr}/${monthStr}`;
        if (offset === 0) {
          badgeText = 'Hôm nay';
          dateLabel = `${dayName}, ${dayStr}/${monthStr} (Hôm nay)`;
        } else if (offset === 1) {
          badgeText = 'Ngày mai';
          dateLabel = `${dayName}, ${dayStr}/${monthStr} (Ngày mai)`;
        } else if (offset === 2) {
          badgeText = 'Ngày kia';
        }

        const provs = allProvinces.filter(p => {
          if (p.region.toLowerCase() !== region) return false;
          if (p.drawDays && Array.isArray(p.drawDays)) {
            return p.drawDays.includes(targetDay);
          }
          return true;
        });

        const provincesText = provs.length > 0
          ? provs.map(p => p.name).join(', ')
          : (region === 'mb' ? 'Miền Bắc' : '');

        options.push({
          id: `sched_${dateKey}`,
          drawId: '',
          drawCode: '',
          closeTimeMs: targetDate.getTime(),
          closeTimeStr: region === 'mn' ? '16:10' : (region === 'mt' ? '17:10' : '18:10'),
          targetDay,
          targetDate,
          dayName,
          dayMonth: `${dayStr}/${monthStr}`,
          yearStr,
          formattedDate,
          dateKey,
          dateLabel,
          badgeText,
          isToday: offset === 0,
          isPastCutoff: isTodayPastCutoff,
          provincesText,
          isFromApi: false,
        });
      }
    }

    // Sắp xếp toàn bộ theo thời gian
    options.sort((a, b) => a.closeTimeMs - b.closeTimeMs);

    return options;
  }, [region, activeDraws, allProvinces, tick]);

  const targetDateInfo = useMemo(() => {
    if (availableDrawDates.length === 0) {
      return {
        id: '',
        drawId: '',
        drawCode: '',
        dateKey: '',
        targetDay: new Date().getDay(),
        targetDate: new Date(),
        dayName: 'Hôm nay',
        dayMonth: '',
        yearStr: String(new Date().getFullYear()),
        formattedDate: '',
        dateLabel: 'Đang tải...',
        closeTimeStr: '',
        badgeText: '',
        isToday: true,
        isPastCutoff: false,
        provincesText: '',
        provinceId: undefined,
      };
    }
    const found = availableDrawDates.find(d => d.id === selectedDrawId || (selectedDrawId && d.drawCode === selectedDrawId));
    return found || availableDrawDates[0];
  }, [availableDrawDates, selectedDrawId]);

  useEffect(() => {
    const { targetDay, provinceId: targetProvinceId } = targetDateInfo;
    const filtered = allProvinces.filter(p => {
      if (p.region.toLowerCase() !== region) return false;
      if (p.drawDays && Array.isArray(p.drawDays)) {
        return p.drawDays.includes(targetDay);
      }
      return true;
    });

    // Nếu kỳ quay này từ CMS có chỉ định đài cụ thể (ví dụ An Giang), bổ sung vào danh sách đài
    if (targetProvinceId) {
      const specificProv = allProvinces.find(p => p.provinceId?.toLowerCase() === targetProvinceId.toLowerCase());
      if (specificProv && !filtered.some(p => p.provinceId?.toLowerCase() === specificProv.provinceId?.toLowerCase())) {
        filtered.unshift(specificProv);
      }
    }

    const items = filtered.map(p => ({ label: p.name, value: p.provinceId }));
    setProvinceItems(items);

    if (targetProvinceId && items.some(i => i.value?.toLowerCase() === targetProvinceId.toLowerCase())) {
      const matched = items.find(i => i.value?.toLowerCase() === targetProvinceId.toLowerCase());
      if (matched && provinceValue !== matched.value) {
        setProvinceValue(matched.value);
      }
    } else if (items.length > 0) {
      if (!items.find(i => i.value === provinceValue)) {
        setProvinceValue(items[0].value);
      }
    } else {
      setProvinceValue(null);
    }
  }, [region, allProvinces, targetDateInfo.targetDay, targetDateInfo.provinceId]);

  const currentDataSet = useMemo(() => {
    const base = region === 'mb' ? BET_DATA.mb : BET_DATA.mn_mt;
    const regionCode = region === 'mb' ? 'MB' : (region === 'mt' ? 'MT' : 'MN');
    const customRates = apiRates[regionCode];

    if (!customRates || Object.keys(customRates).length === 0) {
      return base;
    }

    const merged: any = {};
    for (const cat of Object.keys(base) as MainCategory[]) {
      merged[cat] = base[cat].map(sub => {
        const customRate = customRates[sub.name];
        if (customRate !== undefined && customRate !== null) {
          return { ...sub, rate: Number(customRate) };
        }
        return sub;
      });
    }
    return merged;
  }, [region, apiRates]);

  const currentSubOptions = currentDataSet[selectedCategory];

  useEffect(() => {
    const updated = currentSubOptions.find((s: BetOption) => s.name === selectedSub.name);
    if (updated && updated.rate !== selectedSub.rate) {
      setSelectedSub(updated);
    }
  }, [currentDataSet]);

  const currentParsed = useMemo(() => parseNumbers(inputNumbers, selectedSub), [inputNumbers, selectedSub]);

  const handleCategorySelect = (cat: MainCategory) => {
    setSelectedCategory(cat);
    const dataSet = currentDataSet;
    setSelectedSub(dataSet[cat][0]);
    setInputNumbers('');
  };

  const handleRegionSelect = (r: Region) => {
    setRegion(r);
    const dataSet = r === 'mb' ? (apiRates['MB'] ? currentDataSet : BET_DATA.mb) : (apiRates['MN'] ? currentDataSet : BET_DATA.mn_mt);
    setSelectedSub(dataSet[selectedCategory][0]);
    setInputNumbers('');
  };

  const calculateTotal = () => {
    if (currentParsed.error || currentParsed.numbers.length === 0) return 0;
    const amountNum = parseInt(baseAmount) || 0;
    return currentParsed.numbers.length * amountNum * selectedSub.multiplier;
  };

  const calculateWinAmount = () => {
    if (currentParsed.error || currentParsed.numbers.length === 0 || !inputNumbers.trim()) return 0;
    const amountNum = parseInt(baseAmount) || 0;
    return amountNum * selectedSub.rate;
  };

  const handleAddToCart = () => {
    if (currentParsed.error) {
      return Toast.show({ type: 'error', text1: 'Lỗi cú pháp', text2: currentParsed.error });
    }
    if (currentParsed.numbers.length === 0) {
      return Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập số muốn cược' });
    }
    setConfirmModalVisible(true);
  };

  const confirmAddToCart = () => {
    const selectedProv = provinceItems.find(p => p.value === provinceValue);
    const resolvedDrawId = targetDateInfo.drawCode || targetDateInfo.drawId || targetDateInfo.id;
    const resolvedDrawDate = targetDateInfo.formattedDate;
    const resolvedProvinceName = selectedProv?.label || (region === 'mb' ? 'Miền Bắc' : undefined);

    if (isBuyNow) {
      setConfirmModalVisible(false);
      navigation.navigate('GamePayment', {
        gameId,
        gameName: `XỔ SỐ 3 MIỀN - ${region.toUpperCase()}`,
        playType: selectedSub.name,
        boards: [{
          id: 'A',
          numbers: currentParsed.numbers,
          cost: calculateTotal(),
          baseCost: parseInt(baseAmount) || 0,
          unitAmount: parseInt(baseAmount) || 0,
          multiplier: selectedSub.multiplier,
        }],
        totalCost: calculateTotal(),
        cost: calculateTotal(),
        drawIds: [resolvedDrawId],
        drawDate: resolvedDrawDate,
        provinceName: resolvedProvinceName,
      });
      return;
    }

    addToCart({
      gameId,
      gameName: `XỔ SỐ 3 MIỀN - ${region.toUpperCase()}`,
      playType: selectedSub.name,
      numbers: currentParsed.numbers,
      cost: calculateTotal(),
      baseCost: parseInt(baseAmount) || 0,
      winAmount: calculateWinAmount(),
      region,
      provinceId: provinceValue ?? undefined,
      provinceName: resolvedProvinceName,
      drawId: resolvedDrawId,
      drawDate: resolvedDrawDate,
      category: selectedCategory,
      subCategory: selectedSub.name,
      multiplier: selectedSub.multiplier,
      rate: selectedSub.rate,
      quantity: 1,
    });
    setConfirmModalVisible(false);
    Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã thêm vào giỏ hàng' });
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textDark }}>
                Chọn đài quay thưởng
              </Text>
              <TouchableOpacity
                style={styles.drawDateSelectorBtn}
                onPress={() => setIsDrawPickerVisible(true)}
                activeOpacity={0.7}
              >
                <Calendar size={13} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.drawDateSelectorLabel}>Kỳ quay:</Text>
                <Text style={styles.drawDateSelectorVal} numberOfLines={1}>
                  {targetDateInfo.drawCode ? `${targetDateInfo.drawCode} • ` : ''}{targetDateInfo.dayName}, {targetDateInfo.dayMonth}{targetDateInfo.badgeText ? ` (${targetDateInfo.badgeText})` : ''}
                </Text>
                <ChevronDown size={14} color={COLORS.primary} style={{ marginLeft: 3 }} />
              </TouchableOpacity>
            </View>
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
              {currentSubOptions.map((sub: BetOption) => (
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
              onNumbersGenerated={(nums) => { setInputNumbers(nums); setIsInputExpanded(false); }}
              subName={selectedSub.name}
            />
          )}

          <Text style={styles.inputHint}>
            {isXienCombo(selectedSub.name)
              ? 'Ngăn cách các cặp số bằng dấu: , hoặc ; hoặc khoảng cách'
              : 'Ngăn cách bằng dấu phẩy, chấm phẩy hoặc khoảng trắng'}
          </Text>

          {!isManualDisabled && (
            <>
              {!isInputExpanded && inputNumbers.split(/[,;\s]+/).filter(Boolean).length > 10 ? (
                <TouchableOpacity
                  style={[styles.textInput, { minHeight: 48, justifyContent: 'center' }]}
                  onPress={() => setIsInputExpanded(true)}
                >
                  <Text style={{ color: COLORS.textDark, lineHeight: 22 }}>
                    {inputNumbers.split(/[,;\s]+/).filter(Boolean).slice(0, 10).join(', ')}...
                  </Text>
                  <Text style={{ color: COLORS.primary, marginTop: 4, fontWeight: 'bold' }}>Xem thêm</Text>
                </TouchableOpacity>
              ) : (
                <View>
                  <TextInput
                    style={[styles.textInput, { maxHeight: 200 }]}
                    value={inputNumbers}
                    onChangeText={setInputNumbers}
                    placeholder={isXienCombo(selectedSub.name) ? getXienPlaceholder(selectedSub.name) : "Nhập số..."}
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numbers-and-punctuation"
                    multiline
                    editable={true}
                    onBlur={() => setIsInputExpanded(false)}
                  />
                  {isInputExpanded && inputNumbers.split(/[,;\s]+/).filter(Boolean).length > 10 && (
                    <TouchableOpacity style={{ alignSelf: 'flex-end', marginRight: SPACING.md, marginTop: 4 }} onPress={() => setIsInputExpanded(false)}>
                      <Text style={{ color: COLORS.primary, fontWeight: 'bold' }}>Thu gọn</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </>
          )}

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
              <Text style={styles.previewTitle}>Số đã chọn: {currentParsed.numbers.length > 0 ? `(${currentParsed.numbers.length} số)` : ''}</Text>
              {currentParsed.error ? (
                <Text style={styles.previewError}>{currentParsed.error}</Text>
              ) : currentParsed.numbers.length > 0 ? (
                <View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
                    {(showAllNumbers ? currentParsed.numbers : currentParsed.numbers.slice(0, 10)).map((n, i) => (
                      <View key={i} style={styles.previewTag}>
                        <Text style={styles.previewTagText}>{n}</Text>
                      </View>
                    ))}
                    {!showAllNumbers && currentParsed.numbers.length > 10 && (
                      <TouchableOpacity style={[styles.previewTag, { backgroundColor: COLORS.gray200, borderColor: COLORS.gray300 }]} onPress={() => setShowAllNumbers(true)}>
                        <Text style={[styles.previewTagText, { color: COLORS.gray600 }]}>+{currentParsed.numbers.length - 10} số nữa</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                  {showAllNumbers && currentParsed.numbers.length > 10 && (
                    <TouchableOpacity style={{ marginTop: 8, alignSelf: 'flex-start' }} onPress={() => setShowAllNumbers(false)}>
                      <Text style={{ color: COLORS.primary, fontSize: TYPOGRAPHY.fontSize.sm }}>Thu gọn</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
            </View>
          )}

          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerLabel}>Tổng thanh toán</Text>
              <Text style={styles.footerTotal}>{calculateTotal().toLocaleString('vi-VN')} đ</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>Thắng/1Con</Text>
              <Text style={styles.footerWin}>{calculateWinAmount().toLocaleString('vi-VN')} đ</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity style={[styles.addBtn, { flex: 1, backgroundColor: COLORS.secondary }]} onPress={() => { setIsBuyNow(false); handleAddToCart(); }}>
              <Text style={styles.addBtnText}>THÊM VÀO GIỎ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { flex: 1 }]} onPress={() => { setIsBuyNow(true); handleAddToCart(); }}>
              <Text style={styles.addBtnText}>MUA NGAY</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Modal Chọn Kỳ Quay Thưởng (Chỉ các kỳ tương lai) */}
      <Modal
        visible={isDrawPickerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsDrawPickerVisible(false)}
      >
        <View style={styles.datePickerModalOverlay}>
          <View style={styles.datePickerModalContent}>
            <View style={styles.datePickerModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.datePickerModalTitle}>Chọn Kỳ Quay Thưởng</Text>
                <Text style={styles.datePickerModalSubtitle}>
                  Chỉ cho phép chọn các kỳ quay mở thưởng trong tương lai
                </Text>
              </View>
              <TouchableOpacity
                style={styles.datePickerCloseBtn}
                onPress={() => setIsDrawPickerVisible(false)}
              >
                <X size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.datePickerList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {availableDrawDates.map((item) => {
                const isSelected = item.id === targetDateInfo.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.datePickerItem,
                      isSelected && styles.datePickerItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedDrawId(item.id);
                      if (item.provinceId && provinceItems.some(p => p.value === item.provinceId)) {
                        setProvinceValue(item.provinceId);
                      }
                      setIsDrawPickerVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.datePickerItemLeft}>
                      <View style={[styles.dateRadioCircle, isSelected && styles.dateRadioCircleSelected]}>
                        {isSelected && <View style={styles.dateRadioDot} />}
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          {item.drawCode ? (
                            <View style={styles.drawCodeTag}>
                              <Text style={styles.drawCodeTagText}>{item.drawCode}</Text>
                            </View>
                          ) : null}
                          <Text style={[styles.dateItemDayName, isSelected && styles.dateItemTextSelected]}>
                            {item.dayName}, {item.dayMonth}/{item.yearStr}
                          </Text>
                          {item.badgeText ? (
                            <View
                              style={[
                                styles.dateBadge,
                                item.isToday ? styles.dateBadgeToday : styles.dateBadgeTomorrow,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dateBadgeText,
                                  item.isToday ? styles.dateBadgeTextToday : styles.dateBadgeTextTomorrow,
                                ]}
                              >
                                {item.badgeText}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, flexWrap: 'wrap', gap: 8 }}>
                          <Text style={styles.dateItemTime}>
                            Đóng cược: {item.closeTimeStr}
                          </Text>
                          {item.provincesText ? (
                            <Text style={styles.dateItemProvinces} numberOfLines={1}>
                              • Đài: {item.provincesText}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    {isSelected && (
                      <Check size={18} color={COLORS.primary} style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isBuyNow ? 'Xác Nhận Mua Ngay' : 'Xác Nhận Đặt Cược'}</Text>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Kỳ quay:</Text>
              <Text style={styles.modalValue}>
                {targetDateInfo.drawCode ? `${targetDateInfo.drawCode} • ` : ''}{targetDateInfo.dayName}, {targetDateInfo.formattedDate}
              </Text>
            </View>
            <View style={styles.modalRow}>
              <Text style={styles.modalLabel}>Đài:</Text>
              <Text style={styles.modalValue}>
                {provinceItems.find(p => p.value === provinceValue)?.label || (region === 'mb' ? 'Miền Bắc' : 'Toàn miền')}
              </Text>
            </View>
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
                <Text style={styles.modalConfirmText}>{isBuyNow ? 'Mua Ngay' : 'Xác Nhận'}</Text>
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
  modalConfirmText: { color: COLORS.cardBackground, fontWeight: TYPOGRAPHY.fontWeight.bold },
  drawDateSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    maxWidth: '65%',
  },
  drawDateSelectorLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.gray600,
    marginRight: 4,
  },
  drawDateSelectorVal: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModalContent: {
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    maxHeight: '75%',
    ...SHADOWS.dark,
  },
  datePickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  datePickerModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  datePickerModalSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  datePickerCloseBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
  },
  datePickerList: {
    maxHeight: 400,
  },
  datePickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  datePickerItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F5',
  },
  datePickerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateRadioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateRadioCircleSelected: {
    borderColor: COLORS.primary,
  },
  dateRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  dateItemDayName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  dateItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dateBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  dateBadgeToday: {
    backgroundColor: '#DCFCE7',
  },
  dateBadgeTomorrow: {
    backgroundColor: '#FEF3C7',
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  dateBadgeTextToday: {
    color: '#15803D',
  },
  dateBadgeTextTomorrow: {
    color: '#B45309',
  },
  dateItemProvinces: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  drawCodeTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  drawCodeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  dateItemTime: {
    fontSize: 12,
    color: COLORS.textDark,
    fontWeight: '500',
  },
});
