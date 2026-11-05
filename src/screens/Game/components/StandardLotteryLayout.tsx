import Toast from 'react-native-toast-message';
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Dimensions, ScrollView, Text, TouchableOpacity, View, FlatList, Modal, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../../services/api';
import { useAppStore } from '../../../store/useAppStore';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../../theme/theme';

import { ArrowLeft, BarChart2, Check, Plus, RefreshCw, RotateCw, Trash2, X } from 'lucide-react-native';
import { styles } from '../gameLayoutAStyles';
import DrawPickerModal from './DrawPickerModal';
import LotoMultiplierModal from './LotoMultiplierModal';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Board {
  id: string; // A, B, C, D, E, F
  numbers: string[];
  multiplier?: number;
}


export default function StandardLotteryLayout({ route, navigation }: any) {
  const { gameId, initialTab } = route.params;
  const addToCart = useAppStore((state) => state.addToCart);
  const insets = useSafeAreaInsets();
  const isAddingToCart = React.useRef(false);

  // General draw cycles state for standard lotteries
  const [isDrawPickerVisible, setIsDrawPickerVisible] = useState(false);
  const [selectedDraws, setSelectedDraws] = useState<string[]>([]);
  const [tempSelectedDraws, setTempSelectedDraws] = useState<string[]>([]);
  const [drawCycles, setDrawCycles] = useState<any[]>([]);
  const [isDrawLoading, setIsDrawLoading] = useState<boolean>(false);

  const handleOpenDrawPicker = () => {
    setTempSelectedDraws([...selectedDraws]);
    setIsDrawPickerVisible(true);
  };

  const handleStatsPress = () => {
    if (gameId && gameId.includes('kienthiet')) {
      navigation.navigate('StatsTruyenThong');
    } else if (gameId === 'keno') {
      navigation.navigate('StatsKeno');
    } else {
      navigation.navigate('StatsDienToan');
    }
  };

  const processCheckout = (payload: any) => {
    if (isAddingToCart.current) {
      if (!payload.boards || payload.boards.length === 0) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không có vé nào để thêm.' });
        return;
      }

      // Gộp tất cả các dãy số (boards) thành 1 record trong giỏ hàng
      const allNumbers = payload.boards.reduce((acc: string[], b: any) => {
        if (b.numbers) {
          // Xử lý nối chuỗi các dãy số cho dễ nhìn (ví dụ: Lotto có thêm specialNumbers)
          const numStr = b.specialNumbers
            ? `${b.numbers.join(' ')} | ${b.specialNumbers.join(' ')}`
            : b.numbers.join(' ');
          acc.push(`Dãy ${b.id}: ${numStr}`);
        }
        return acc;
      }, []);

      const totalCost = payload.boards.reduce((sum: number, b: any) => sum + (b.cost || 0), 0);

      const curDraw = (drawCycles && drawCycles.length > 0)
        ? (drawCycles.find((d: any) => (payload.drawIds || selectedDraws)?.includes(d.id)) || drawCycles[0])
        : null;
      const drawDateStr = curDraw 
        ? `${curDraw.drawCode ? `Kỳ #${curDraw.drawCode} - ` : ''}${curDraw.dateStr || curDraw.date || ''}` 
        : (payload.drawDate || undefined);

      addToCart({
        gameId: payload.gameId,
        gameName: payload.gameName,
        playType: payload.playType,
        numbers: allNumbers,
        cost: totalCost,
        baseCost: payload.boards[0]?.cost || 10000,
        quantity: payload.drawIds ? payload.drawIds.length : 1,
        drawDate: payload.drawDate || drawDateStr,
        provinceName: payload.provinceName || route.params?.provinceName,
        boards: payload.boards, // Quan trọng: lưu lại danh sách boards gốc để checkout bóc tách lại
      });

      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã thêm vé vào giỏ hàng' });
      isAddingToCart.current = false;
    } else {
      const curDraw = (drawCycles && drawCycles.length > 0)
        ? (drawCycles.find((d: any) => (payload.drawIds || selectedDraws)?.includes(d.id)) || drawCycles[0])
        : null;
      const drawDateStr = curDraw 
        ? `${curDraw.drawCode ? `Kỳ #${curDraw.drawCode} - ` : ''}${curDraw.dateStr || curDraw.date || ''}` 
        : (payload.drawDate || undefined);

      navigation.navigate('GamePayment', {
        ...payload,
        drawDate: payload.drawDate || drawDateStr,
        provinceName: payload.provinceName || route.params?.provinceName,
      });
    }
  };




  // General Game configurations
  const isLottoGame = gameId === 'lotto_535' || gameId === 'lotto_570';
  const isKenoGame = gameId === 'keno' || gameId === 'bao_keno' || gameId === 'clln_keno' || (typeof gameId === 'string' && gameId.includes('keno'));
  let gameName = '';
  let maxNumber = 45;
  let requiredSelectCount = 6;
  let initialJackpot = '';
  let initialCountdown = 600;

  if (gameId === 'power_655') {
    gameName = 'POWER 6/55';
    maxNumber = 55;
    requiredSelectCount = 6;
    initialJackpot = '154.230.120.000 đ';
    initialCountdown = 14400;
  } else if (gameId === 'mega_645') {
    gameName = 'MEGA 6/45';
    maxNumber = 45;
    requiredSelectCount = 6;
    initialJackpot = '45.120.550.000 đ';
    initialCountdown = 12000;
  } else if (gameId === 'lotto_535') {
    gameName = 'LOTTO 5/35';
    maxNumber = 35;
    requiredSelectCount = 5;
    initialJackpot = '2.500.000.000 đ';
    initialCountdown = 12500;
  } else if (gameId === 'lotto_570') {
    gameName = 'LOTTO 5/70';
    maxNumber = 70;
    requiredSelectCount = 5;
    initialJackpot = '10.000.000.000 đ';
    initialCountdown = 12500;
  } else if (gameId === 'keno' || gameId === 'bao_keno') {
    gameName = 'KENO';
    maxNumber = 80;
    requiredSelectCount = 10;
    initialJackpot = '2.000.000.000 đ';
    initialCountdown = 480;
  } else if (gameId === 'max_3d') {
    gameName = 'MAX3D';
    maxNumber = 9;
    requiredSelectCount = 3;
    initialJackpot = '1.000.000.000 đ';
    initialCountdown = 8000;
  } else if (gameId === 'max_4d') {
    gameName = 'MAX4D';
    maxNumber = 9;
    requiredSelectCount = 4;
    initialJackpot = '15.000.000 đ';
    initialCountdown = 8000;
  } else if (gameId === 'loto_235') {
    gameName = 'LÔ TÔ 2,3,5';
    maxNumber = 10;
    requiredSelectCount = 2;
    initialJackpot = '';
    initialCountdown = 9000;
  } else if (gameId === 'loto_cap') {
    gameName = 'LÔ TÔ 2,3,4 CẶP SỐ';
    maxNumber = 99;
    requiredSelectCount = 2;
    initialJackpot = '';
    initialCountdown = 9500;
  } else if (gameId === 'dientoan_636') {
    gameName = 'ĐIỆN TOÁN 6X36';
    maxNumber = 36;
    requiredSelectCount = 6;
    initialJackpot = '2.000.000.000 đ';
    initialCountdown = 9900;
  } else if (gameId === 'than_tai_4') {
    gameName = 'THẦN TÀI & ĐT 1-2-3';
    maxNumber = 9;
    requiredSelectCount = 4;
    initialJackpot = '';
    initialCountdown = 9700;
  } else if (gameId === 'truot_loto') {
    gameName = 'TRƯỢT LÔ TÔ 4-8-10 CẶP';
    maxNumber = 99;
    requiredSelectCount = 4;
    initialJackpot = '';
    initialCountdown = 9000;
  }

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(initialCountdown);

  // Standard Matrix Game Redesign States
  const [standardPlayType, setStandardPlayType] = useState<string>(
    gameId === 'max_3d' ? 'Max3D' : gameId === 'max_4d' ? 'Max4D' : 'Cơ bản'
  );
  const [isBaoDropdownOpen, setIsBaoDropdownOpen] = useState(false);
  const [activeBoardIndex, setActiveBoardIndex] = useState<number | null>(null);
  const [standardBoards, setStandardBoards] = useState<Array<{ id: string; numbers: string[]; specialNumbers?: string[]; isTC: boolean; multiplier?: number }>>([
    { id: 'A', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
    { id: 'B', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
    { id: 'C', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
    { id: 'D', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
    { id: 'E', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
    { id: 'F', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
  ]);
  const [isStandardNumberModalVisible, setIsStandardNumberModalVisible] = useState(false);
  const [tempStandardNumbers, setTempStandardNumbers] = useState<string[]>([]);
  const [selectedDrawIndex, setSelectedDrawIndex] = useState(0);
  const [isStandardDrawPickerVisible, setIsStandardDrawPickerVisible] = useState(false);
  const [tempSelectedDrawIndex, setTempSelectedDrawIndex] = useState(0);

  // Max3D Digit Selector States
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [tempMax3dSlots, setTempMax3dSlots] = useState<string[]>([]);

  // Lotto 535 States
  const [lottoPlayType, setLottoPlayType] = useState<string>('Cơ bản');
  const [lottoMainBao, setLottoMainBao] = useState<number>(6); // 4, 6..15
  const [lottoSpecialBao, setLottoSpecialBao] = useState<number>(2); // 2..12
  const [tempLottoSpecialNumbers, setTempLottoSpecialNumbers] = useState<string[]>([]);

  // Loto 235 States
  const [loto235PlayType, setLoto235PlayType] = useState<string>(
    initialTab === 'Bao 2 số' ? 'Bao 2 số' : 'Lô tô 2 số'
  );
  const [loto235Bao2Filter, setLoto235Bao2Filter] = useState<string>('CHẴN');
  const [loto235Bao2Numbers, setLoto235Bao2Numbers] = useState<string[]>([]);
  const [loto235Bao2Multiplier, setLoto235Bao2Multiplier] = useState<number>(10000);
  const [isLotoMultiplierModalVisible, setIsLotoMultiplierModalVisible] = useState(false);
  const [activeMultiplierBoardIndex, setActiveMultiplierBoardIndex] = useState<number | null>(null);
  const [loto235DrawCount, setLoto235DrawCount] = useState<number>(1);
  const [isLoto235DrawPickerVisible, setIsLoto235DrawPickerVisible] = useState(false);

  // Loto Cap States
  const [lotoCapPlayType, setLotoCapPlayType] = useState<string>('Lô tô 2 cặp');

  // Truot Loto States
  const [truotLotoPlayType, setTruotLotoPlayType] = useState<string>('Trượt 4');

  // Dientoan 636 States
  const [dientoan636PlayType, setDientoan636PlayType] = useState<string>(
    initialTab === 'Bao 6x36' ? 'Bao 6x36' : 'Cơ bản'
  );
  const [dientoan636BaoType, setDientoan636BaoType] = useState<number>(7);
  const [dientoan636VisibleCombosCount, setDientoan636VisibleCombosCount] = useState<number>(10);

  // Than Tai 4 States
  const [thanTaiPlayType, setThanTaiPlayType] = useState<string>('Thần tài 4');

  const standardDrawCycles = drawCycles;

  const handleStandardPlayTypeChange = (type: string) => {
    setStandardPlayType(type);
    setIsBaoDropdownOpen(false);
    setDrawCycles([]);
    setIsDrawLoading(true);
    setStandardBoards([
      { id: 'A', numbers: [], isTC: false, multiplier: 10000 },
      { id: 'B', numbers: [], isTC: false, multiplier: 10000 },
      { id: 'C', numbers: [], isTC: false, multiplier: 10000 },
      { id: 'D', numbers: [], isTC: false, multiplier: 10000 },
      { id: 'E', numbers: [], isTC: false, multiplier: 10000 },
      { id: 'F', numbers: [], isTC: false, multiplier: 10000 },
    ]);
  };

  const getTruotLotoRequiredCount = (type: string) => {
    if (type === 'Trượt 4') return 4;
    if (type === 'Trượt 8') return 8;
    if (type === 'Trượt 10') return 10;
    return 4;
  };

  const getRequiredNumbersCount = (type: string) => {
    if (gameId === 'than_tai_4') {
      return thanTaiPlayType === 'Thần tài 4' ? 4 : 6;
    }
    if (gameId === 'dientoan_636') {
      return dientoan636PlayType === 'Cơ bản' ? 6 : dientoan636BaoType;
    }
    if (type === 'Max3D') return 3;
    if (type === 'Max3D+' || type === 'Max3D Pro') return 6;
    if (type === 'Max4D') return 4;
    if (type === 'Cơ bản') return isLottoGame ? 5 : 6;
    if (type === 'Bao 4') return 4;
    if (type === 'Bao 5') return 5;
    if (type === 'Bao 7') return 7;
    if (type === 'Bao 8') return 8;
    if (type === 'Bao 9') return 9;
    if (type === 'Bao 10') return 10;
    if (type === 'Bao 11') return 11;
    if (type === 'Bao 12') return 12;
    if (type === 'Bao 13') return 13;
    if (type === 'Bao 14') return 14;
    if (type === 'Bao 15') return 15;
    if (type === 'Bao 18') return 18;
    return 6;
  };

  const handleAutoPickBoard = (index: number) => {
    if (gameId === 'than_tai_4') {
      handleThanTaiAutoPickBoard(index);
      return;
    }
    if (gameId === 'dientoan_636') {
      handleDientoan636AutoPickBoard(index);
      return;
    }
    if (gameId === 'loto_cap' || gameId === 'truot_loto') {
      handleLotoCapAutoPickBoard(index);
      return;
    }
    if (gameId === 'loto_235') {
      handleLoto235AutoPickBoard(index);
      return;
    }
    if (isLottoGame) {
      handleLottoAutoPickBoard(index);
      return;
    }
    const reqCount = getRequiredNumbersCount(standardPlayType);
    const chosen: string[] = [];
    if (gameId === 'max_3d' || gameId === 'max_4d') {
      for (let i = 0; i < reqCount; i++) {
        chosen.push(Math.floor(Math.random() * 10).toString());
      }
    } else {
      while (chosen.length < reqCount) {
        const rand = Math.floor(Math.random() * maxNumber) + 1;
        const randStr = String(rand).padStart(2, '0');
        if (!chosen.includes(randStr)) {
          chosen.push(randStr);
        }
      }
      chosen.sort((a, b) => parseInt(a) - parseInt(b));
    }
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: chosen,
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleClearBoard = (index: number) => {
    if (gameId === 'than_tai_4') {
      handleThanTaiClearBoard(index);
      return;
    }
    if (gameId === 'dientoan_636') {
      handleDientoan636ClearBoard(index);
      return;
    }
    if (gameId === 'loto_cap' || gameId === 'truot_loto') {
      handleLotoCapClearBoard(index);
      return;
    }
    if (gameId === 'loto_235') {
      handleLoto235ClearBoard(index);
      return;
    }
    if (isLottoGame) {
      handleLottoClearBoard(index);
      return;
    }
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: [],
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleChọnNhanh = () => {
    if (gameId === 'than_tai_4') {
      handleThanTaiChọnNhanh();
      return;
    }
    if (gameId === 'dientoan_636') {
      handleDientoan636ChọnNhanh();
      return;
    }
    if (gameId === 'loto_cap' || gameId === 'truot_loto') {
      handleLotoCapChọnNhanh();
      return;
    }
    if (gameId === 'loto_235') {
      handleLoto235ChọnNhanh();
      return;
    }
    if (isLottoGame) {
      handleLottoChọnNhanh();
      return;
    }
    const reqCount = getRequiredNumbersCount(standardPlayType);
    const updated = standardBoards.map((board) => {
      if (board.numbers.length === 0 && !board.isTC) {
        const chosen: string[] = [];
        if (gameId === 'max_3d' || gameId === 'max_4d') {
          for (let i = 0; i < reqCount; i++) {
            chosen.push(Math.floor(Math.random() * 10).toString());
          }
        } else {
          while (chosen.length < reqCount) {
            const rand = Math.floor(Math.random() * maxNumber) + 1;
            const randStr = String(rand).padStart(2, '0');
            if (!chosen.includes(randStr)) {
              chosen.push(randStr);
            }
          }
          chosen.sort((a, b) => parseInt(a) - parseInt(b));
        }
        return {
          ...board,
          numbers: chosen,
          isTC: false
        };
      }
      return board;
    });
    setStandardBoards(updated);
  };

  const handleTCAll = () => {
    if (isLottoGame) {
      handleLottoTCAll();
      return;
    }
    const updated = standardBoards.map((board) => {
      if (board.numbers.length === 0 && !board.isTC) {
        return {
          ...board,
          numbers: [],
          isTC: true
        };
      }
      return board;
    });
    setStandardBoards(updated);
  };

  const handleAddBoard = () => {
    if (gameId !== 'loto_235' && standardBoards.length >= 10) {
      Alert.alert('Thông báo', 'Tối đa 10 dãy số.');
      return;
    }
    let nextId = '';
    if (standardBoards.length < 26) {
      nextId = String.fromCharCode(65 + standardBoards.length);
    } else {
      nextId = `A${String.fromCharCode(65 + standardBoards.length - 26)}`;
    }
    setStandardBoards([
      ...standardBoards,
      { id: nextId, numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 }
    ]);
  };

  const handleSelectMultiplier = (index: number) => {
    setActiveMultiplierBoardIndex(index);
    setIsLotoMultiplierModalVisible(true);
  };

  const getCostPerBoard = (type: string) => {
    if (gameId === 'max_3d') return 10000;
    if (gameId === 'power_655' || gameId === 'mega_645') {
      if (type === 'Cơ bản') return 10000;
      if (type === 'Bao 5') return gameId === 'power_655' ? 500000 : 400000;
      if (type === 'Bao 7') return 70000;
      if (type === 'Bao 8') return 280000;
      if (type === 'Bao 9') return 840000;
      if (type === 'Bao 10') return 2100000;
      if (type === 'Bao 11') return 4620000;
      if (type === 'Bao 12') return 9240000;
      if (type === 'Bao 13') return 17160000;
      if (type === 'Bao 14') return 30030000;
      if (type === 'Bao 15') return 50050000;
      if (type === 'Bao 18') return 185640000;
    } else if (isLottoGame) {
      if (type === 'Cơ bản' || type === 'Bao 5') return 10000;
      const req = getRequiredNumbersCount(type);
      const c = (n: number, k: number) => {
        let r = 1;
        for (let i = 1; i <= k; i++) r = r * (n - i + 1) / i;
        return Math.round(r);
      };
      return c(req, 5) * 10000;
    }
    return 10000;
  };

  const getActiveBoardsCount = () => {
    return standardBoards.filter((b) => b.numbers.length > 0 || b.isTC).length;
  };

  const getStandardTotalCost = () => {
    if (gameId === 'max_3d' || gameId === 'max_4d' || gameId === 'than_tai_4') {
      return standardBoards
        .filter((b) => b.numbers.length > 0 || b.isTC)
        .reduce((sum, b) => sum + (b.multiplier || 10000), 0);
    }
    return getActiveBoardsCount() * getCostPerBoard(standardPlayType);
  };

  const handleOpenStandardBoardModal = (index: number, slotIndex = 0) => {
    setActiveBoardIndex(index);
    const boardToEdit = standardBoards[index];

    if (gameId === 'max_3d' || gameId === 'max_4d' || gameId === 'than_tai_4' || gameId === 'loto_235') {
      const reqCount = gameId === 'than_tai_4' ? (thanTaiPlayType === 'Thần tài 4' ? 4 : 6) : gameId === 'loto_235' ? getLoto235RequiredCount(loto235PlayType) : getRequiredNumbersCount(standardPlayType);
      const initialSlots = Array(reqCount).fill('');
      if (boardToEdit && boardToEdit.numbers) {
        for (let i = 0; i < reqCount; i++) {
          if (boardToEdit.numbers[i] !== undefined && boardToEdit.numbers[i] !== '') {
            initialSlots[i] = boardToEdit.numbers[i];
          }
        }
      }
      setTempMax3dSlots(initialSlots);
      setActiveSlotIndex(slotIndex >= 0 && slotIndex < reqCount ? slotIndex : 0);
    } else {
      setTempStandardNumbers(boardToEdit ? [...boardToEdit.numbers] : []);
      if (isLottoGame) {
        setTempLottoSpecialNumbers(boardToEdit && boardToEdit.specialNumbers ? [...boardToEdit.specialNumbers] : []);
      }
    }
    setIsStandardNumberModalVisible(true);
  };

  const getModalReqCount = () => {
    if (gameId === 'dientoan_636') {
      return dientoan636PlayType === 'Cơ bản' ? 6 : dientoan636BaoType;
    }
    if (gameId === 'loto_cap') return getLotoCapRequiredCount(lotoCapPlayType);
    if (gameId === 'truot_loto') return getTruotLotoRequiredCount(truotLotoPlayType);
    if (gameId === 'loto_235') return getLoto235RequiredCount(loto235PlayType);
    return getRequiredNumbersCount(standardPlayType);
  };

  const toggleStandardModalNumber = (numStr: string) => {
    const reqCount = getModalReqCount();
    if (tempStandardNumbers.includes(numStr)) {
      setTempStandardNumbers(tempStandardNumbers.filter((n) => n !== numStr));
    } else {
      if (tempStandardNumbers.length >= reqCount) {
        Alert.alert('Thông báo', `Bạn chỉ được chọn tối đa ${reqCount} số.`);
        return;
      }
      setTempStandardNumbers([...tempStandardNumbers, numStr].sort());
    }
  };

  const confirmStandardModalNumbers = () => {
    const reqCount = getModalReqCount();
    if (tempStandardNumbers.length !== reqCount) {
      Alert.alert('Thông báo', `Vui lòng chọn đủ ${reqCount} số.`);
      return;
    }
    if (activeBoardIndex !== null) {
      const updated = [...standardBoards];
      updated[activeBoardIndex] = {
        ...updated[activeBoardIndex],
        numbers: tempStandardNumbers,
        isTC: false
      };
      setStandardBoards(updated);
    }
    setIsStandardNumberModalVisible(false);
  };

  const standardModalAutoSelect = () => {
    const reqCount = getModalReqCount();
    const chosen: string[] = [];
    if (gameId === 'loto_cap') {
      while (chosen.length < reqCount) {
        const rand = Math.floor(Math.random() * 100);
        const randStr = String(rand).padStart(2, '0');
        if (!chosen.includes(randStr)) {
          chosen.push(randStr);
        }
      }
    } else {
      while (chosen.length < reqCount) {
        const rand = Math.floor(Math.random() * maxNumber) + 1;
        const randStr = String(rand).padStart(2, '0');
        if (!chosen.includes(randStr)) {
          chosen.push(randStr);
        }
      }
    }
    setTempStandardNumbers(chosen.sort());
  };

  const handleMax3dDigitPress = (digit: string) => {
    const reqCount = gameId === 'than_tai_4' ? (thanTaiPlayType === 'Thần tài 4' ? 4 : 6) : gameId === 'loto_235' ? getLoto235RequiredCount(loto235PlayType) : getRequiredNumbersCount(standardPlayType);
    const updated = [...tempMax3dSlots];
    updated[activeSlotIndex] = digit;
    setTempMax3dSlots(updated);

    // Auto advance active slot
    if (activeSlotIndex < reqCount - 1) {
      setActiveSlotIndex(activeSlotIndex + 1);
    }
  };

  const handleMax3dClear = () => {
    const reqCount = gameId === 'than_tai_4' ? (thanTaiPlayType === 'Thần tài 4' ? 4 : 6) : gameId === 'loto_235' ? getLoto235RequiredCount(loto235PlayType) : getRequiredNumbersCount(standardPlayType);
    setTempMax3dSlots(Array(reqCount).fill(''));
    setActiveSlotIndex(0);
  };

  const handleMax3dRandom = () => {
    const reqCount = gameId === 'than_tai_4' ? (thanTaiPlayType === 'Thần tài 4' ? 4 : 6) : gameId === 'loto_235' ? getLoto235RequiredCount(loto235PlayType) : getRequiredNumbersCount(standardPlayType);
    const randomSlots = Array.from({ length: reqCount }, () =>
      Math.floor(Math.random() * 10).toString()
    );
    setTempMax3dSlots(randomSlots);
    setActiveSlotIndex(reqCount - 1);
  };

  const handleMax3dConfirm = () => {
    const reqCount = gameId === 'than_tai_4' ? (thanTaiPlayType === 'Thần tài 4' ? 4 : 6) : gameId === 'loto_235' ? getLoto235RequiredCount(loto235PlayType) : getRequiredNumbersCount(standardPlayType);
    if (tempMax3dSlots.some((s) => s === '')) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ các ô số.');
      return;
    }
    if (activeBoardIndex !== null) {
      const updated = [...standardBoards];
      updated[activeBoardIndex] = {
        ...updated[activeBoardIndex],
        numbers: tempMax3dSlots,
        isTC: false
      };
      setStandardBoards(updated);
    }
    setIsStandardNumberModalVisible(false);
  };

  const handleStandardCheckout = () => {
    if (gameId === 'than_tai_4') {
      handleThanTaiCheckout();
      return;
    }
    if (gameId === 'dientoan_636') {
      handleDientoan636Checkout();
      return;
    }
    if (gameId === 'loto_cap' || gameId === 'truot_loto') {
      handleLotoCapCheckout();
      return;
    }
    if (gameId === 'loto_235') {
      handleLoto235Checkout();
      return;
    }
    if (isLottoGame) {
      handleLottoCheckout();
      return;
    }
    const activeBoards = standardBoards.filter((b) => b.numbers.length > 0 || b.isTC);
    if (activeBoards.length === 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn số hoặc tự chọn cho ít nhất 1 dãy.' });
      return;
    }

    const reqCount = getRequiredNumbersCount(standardPlayType);
    const invalidBoard = activeBoards.find((b) => !b.isTC && b.numbers.length !== reqCount);
    if (invalidBoard) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: `Dãy ${invalidBoard.id} chưa được chọn đủ ${reqCount} số.` });
      return;
    }

    processCheckout({
      gameId,
      gameName,
      playType: standardPlayType,
      drawIds: selectedDraws,
      boards: activeBoards.map(b => ({
        id: b.id,
        isTC: b.isTC,
        numbers: b.numbers,
        cost: b.multiplier || 10000
      })),
      totalCost: getStandardTotalCost()
    });
  };

  // Lotto 535 specific helper functions
  const getLottoRequiredCounts = () => {
    if (lottoPlayType === 'Cơ bản') {
      return { main: 5, special: 1 };
    } else if (lottoPlayType === 'Bao số chính') {
      return { main: lottoMainBao, special: 1 };
    } else {
      return { main: 5, special: lottoSpecialBao };
    }
  };

  const toggleLottoSpecialNumber = (numStr: string) => {
    const { special: reqSpecial } = getLottoRequiredCounts();
    if (tempLottoSpecialNumbers.includes(numStr)) {
      setTempLottoSpecialNumbers(tempLottoSpecialNumbers.filter(n => n !== numStr));
    } else {
      if (tempLottoSpecialNumbers.length >= reqSpecial) {
        Alert.alert('Thông báo', `Bạn chỉ được chọn tối đa ${reqSpecial} số đặc biệt.`);
        return;
      }
      setTempLottoSpecialNumbers([...tempLottoSpecialNumbers, numStr].sort());
    }
  };

  const handleLottoAutoPickBoard = (index: number) => {
    const { main: reqMain, special: reqSpecial } = getLottoRequiredCounts();
    const mainChosen: string[] = [];
    while (mainChosen.length < reqMain) {
      const rand = Math.floor(Math.random() * 35) + 1;
      const randStr = String(rand).padStart(2, '0');
      if (!mainChosen.includes(randStr)) {
        mainChosen.push(randStr);
      }
    }
    mainChosen.sort((a, b) => parseInt(a) - parseInt(b));

    const specialChosen: string[] = [];
    while (specialChosen.length < reqSpecial) {
      const rand = Math.floor(Math.random() * (gameId === 'lotto_570' ? 24 : 12)) + 1;
      const randStr = String(rand).padStart(2, '0');
      if (!specialChosen.includes(randStr)) {
        specialChosen.push(randStr);
      }
    }
    specialChosen.sort((a, b) => parseInt(a) - parseInt(b));

    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: mainChosen,
      specialNumbers: specialChosen,
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleLottoClearBoard = (index: number) => {
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: [],
      specialNumbers: [],
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleLottoChọnNhanh = () => {
    const { main: reqMain, special: reqSpecial } = getLottoRequiredCounts();
    const updated = standardBoards.map((board) => {
      const hasContent = board.numbers.length > 0 || (board.specialNumbers && board.specialNumbers.length > 0);
      if (!hasContent && !board.isTC) {
        const mainChosen: string[] = [];
        while (mainChosen.length < reqMain) {
          const rand = Math.floor(Math.random() * (gameId === 'lotto_570' ? 70 : 35)) + 1;
          const randStr = String(rand).padStart(2, '0');
          if (!mainChosen.includes(randStr)) {
            mainChosen.push(randStr);
          }
        }
        mainChosen.sort((a, b) => parseInt(a) - parseInt(b));

        const specialChosen: string[] = [];
        while (specialChosen.length < reqSpecial) {
          const rand = Math.floor(Math.random() * (gameId === 'lotto_570' ? 24 : 12)) + 1;
          const randStr = String(rand).padStart(2, '0');
          if (!specialChosen.includes(randStr)) {
            specialChosen.push(randStr);
          }
        }
        specialChosen.sort((a, b) => parseInt(a) - parseInt(b));

        return {
          ...board,
          numbers: mainChosen,
          specialNumbers: specialChosen,
          isTC: false
        };
      }
      return board;
    });
    setStandardBoards(updated);
  };

  const handleLottoTCAll = () => {
    const updated = standardBoards.map((board) => {
      const hasContent = board.numbers.length > 0 || (board.specialNumbers && board.specialNumbers.length > 0);
      if (!hasContent && !board.isTC) {
        return {
          ...board,
          numbers: [],
          specialNumbers: [],
          isTC: true
        };
      }
      return board;
    });
    setStandardBoards(updated);
  };

  const handleLottoModalRandom = () => {
    const { main: reqMain, special: reqSpecial } = getLottoRequiredCounts();
    const mainChosen: string[] = [];
    while (mainChosen.length < reqMain) {
      const rand = Math.floor(Math.random() * (gameId === 'lotto_570' ? 70 : 35)) + 1;
      const randStr = String(rand).padStart(2, '0');
      if (!mainChosen.includes(randStr)) {
        mainChosen.push(randStr);
      }
    }
    setTempStandardNumbers(mainChosen.sort());

    const specialChosen: string[] = [];
    while (specialChosen.length < reqSpecial) {
      const rand = Math.floor(Math.random() * (gameId === 'lotto_570' ? 24 : 12)) + 1;
      const randStr = String(rand).padStart(2, '0');
      if (!specialChosen.includes(randStr)) {
        specialChosen.push(randStr);
      }
    }
    setTempLottoSpecialNumbers(specialChosen.sort());
  };

  const handleLottoModalConfirm = () => {
    const { main: reqMain, special: reqSpecial } = getLottoRequiredCounts();
    if (tempStandardNumbers.length !== reqMain) {
      Alert.alert('Thông báo', `Vui lòng chọn đủ ${reqMain} số chính.`);
      return;
    }
    if (tempLottoSpecialNumbers.length !== reqSpecial) {
      Alert.alert('Thông báo', `Vui lòng chọn đủ ${reqSpecial} số đặc biệt.`);
      return;
    }
    if (activeBoardIndex !== null) {
      const updated = [...standardBoards];
      updated[activeBoardIndex] = {
        ...updated[activeBoardIndex],
        numbers: tempStandardNumbers,
        specialNumbers: tempLottoSpecialNumbers,
        isTC: false
      };
      setStandardBoards(updated);
    }
    setIsStandardNumberModalVisible(false);
  };

  const getLottoTotalCost = () => {
    const activeBoards = standardBoards.filter((b) => b.numbers.length > 0 || b.isTC);
    if (lottoPlayType === 'Cơ bản') {
      return activeBoards.length * 10000;
    } else if (lottoPlayType === 'Bao số chính') {
      const mainBaoCount = lottoMainBao;
      let costPerBao = 10000;
      if (mainBaoCount === 4) {
        costPerBao = gameId === 'lotto_570' ? 660000 : 310000;
      } else {
        const c = (n: number, k: number) => {
          let r = 1;
          for (let i = 1; i <= k; i++) r = r * (n - i + 1) / i;
          return Math.round(r);
        };
        costPerBao = c(mainBaoCount, 5) * 10000;
      }
      return activeBoards.length * costPerBao;
    } else {
      const specBaoCount = lottoSpecialBao;
      return activeBoards.length * specBaoCount * 10000;
    }
  };

  const handleLottoCheckout = () => {
    const activeBoards = standardBoards.filter((b) => b.numbers.length > 0 || b.isTC);
    if (activeBoards.length === 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn số hoặc tự chọn cho ít nhất 1 dãy.' });
      return;
    }

    const { main: reqMain, special: reqSpecial } = getLottoRequiredCounts();
    const invalidBoard = activeBoards.find((b) => !b.isTC && (b.numbers.length !== reqMain || !b.specialNumbers || b.specialNumbers.length !== reqSpecial));
    if (invalidBoard) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: `Dãy ${invalidBoard.id} chưa chọn đủ số chính hoặc số đặc biệt.` });
      return;
    }

    let displayPlayType = lottoPlayType;
    if (lottoPlayType === 'Bao số chính') displayPlayType = `Bao số chính (Bao ${lottoMainBao})`;
    if (lottoPlayType === 'Bao số đặc biệt') displayPlayType = `Bao số đặc biệt (Bao ${lottoSpecialBao})`;

    processCheckout({
      gameId,
      gameName,
      playType: displayPlayType,
      drawIds: selectedDraws,
      boards: activeBoards.map(b => ({
        id: b.id,
        isTC: b.isTC,
        numbers: b.numbers,
        specialNumbers: b.specialNumbers,
        cost: getLottoTotalCost() / activeBoards.length
      })),
      totalCost: getLottoTotalCost()
    });
  };

  // Dientoan 636 helper functions
  const getCombinationsList = (array: string[], k: number): string[][] => {
    const result: string[][] = [];
    const helper = (start: number, combo: string[]) => {
      if (combo.length === k) {
        result.push([...combo]);
        return;
      }
      for (let i = start; i < array.length; i++) {
        combo.push(array[i]);
        helper(i + 1, combo);
        combo.pop();
      }
    };
    helper(0, []);
    return result;
  };

  const getDientoan636CombinationsCount = (baoType: number, selectedCount: number) => {
    if (baoType === 4) {
      if (selectedCount < 4) return 0;
      return 496;
    }
    if (baoType === 5) {
      if (selectedCount < 5) return 0;
      return 31;
    }
    if (baoType >= 7) {
      if (selectedCount < baoType) return 0;
      const n = selectedCount;
      const k = 6;
      let result = 1;
      for (let i = 1; i <= k; i++) {
        result = result * (n - k + i) / i;
      }
      return Math.round(result);
    }
    return 0;
  };

  const getDientoan636GeneratedCombos = (numbers: string[], baoType: number): string[][] => {
    const minReq = baoType === 4 ? 4 : baoType === 5 ? 5 : baoType;
    if (!numbers || numbers.length < minReq) {
      return [];
    }
    const all36 = Array.from({ length: 36 }, (_, i) => String(i + 1).padStart(2, '0'));
    const remaining = all36.filter((n) => !numbers.includes(n));

    if (baoType === 4) {
      const combos: string[][] = [];
      for (let i = 0; i < remaining.length; i++) {
        for (let j = i + 1; j < remaining.length; j++) {
          combos.push([...numbers, remaining[i], remaining[j]].sort((a, b) => parseInt(a) - parseInt(b)));
        }
      }
      return combos;
    }

    if (baoType === 5) {
      const combos: string[][] = [];
      for (let i = 0; i < remaining.length; i++) {
        combos.push([...numbers, remaining[i]].sort((a, b) => parseInt(a) - parseInt(b)));
      }
      return combos;
    }

    if (baoType >= 7) {
      return getCombinationsList(numbers, 6);
    }

    return [];
  };

  const getDientoan636TotalCost = () => {
    const drawCount = selectedDraws?.length || 1;
    if (dientoan636PlayType === 'Cơ bản') {
      const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
      return activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000), 0) * drawCount;
    } else {
      const boardA = standardBoards[0];
      const comb = getDientoan636CombinationsCount(dientoan636BaoType, boardA.numbers.length);
      return comb * (boardA.multiplier || 10000) * drawCount;
    }
  };

  const handleDientoan636AutoPickBoard = (index: number) => {
    const reqCount = dientoan636PlayType === 'Cơ bản' ? 6 : dientoan636BaoType;
    const chosen: string[] = [];
    while (chosen.length < reqCount) {
      const rand = Math.floor(Math.random() * 36) + 1;
      const randStr = String(rand).padStart(2, '0');
      if (!chosen.includes(randStr)) {
        chosen.push(randStr);
      }
    }
    chosen.sort((a, b) => parseInt(a) - parseInt(b));
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: chosen,
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleDientoan636ClearBoard = (index: number) => {
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: [],
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleDientoan636ChọnNhanh = () => {
    const reqCount = dientoan636PlayType === 'Cơ bản' ? 6 : dientoan636BaoType;
    if (dientoan636PlayType === 'Cơ bản') {
      const updated = standardBoards.map((board) => {
        const hasContent = board.numbers.length > 0;
        if (!hasContent && !board.isTC) {
          const chosen: string[] = [];
          while (chosen.length < reqCount) {
            const rand = Math.floor(Math.random() * 36) + 1;
            const randStr = String(rand).padStart(2, '0');
            if (!chosen.includes(randStr)) {
              chosen.push(randStr);
            }
          }
          chosen.sort((a, b) => parseInt(a) - parseInt(b));
          return {
            ...board,
            numbers: chosen,
            isTC: false
          };
        }
        return board;
      });
      setStandardBoards(updated);
    } else {
      handleDientoan636AutoPickBoard(0);
    }
  };

  const handleDientoan636Checkout = () => {
    if (dientoan636PlayType === 'Cơ bản') {
      const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
      if (activeBoards.length === 0) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn số cho ít nhất 1 dãy.' });
        return;
      }
      const invalidBoard = activeBoards.find((b) => b.numbers.length !== 6);
      if (invalidBoard) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: `Dãy ${invalidBoard.id} chưa chọn đủ 6 số.` });
        return;
      }
      processCheckout({
        gameId,
        gameName,
        playType: dientoan636PlayType,
        drawIds: selectedDraws,
        boards: activeBoards.map(b => ({
          id: b.id,
          isTC: false,
          numbers: b.numbers,
          cost: b.multiplier || 10000
        })),
        totalCost: getDientoan636TotalCost()
      });
    } else {
      const boardA = standardBoards[0];
      if (boardA.numbers.length < dientoan636BaoType) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: `Vui lòng chọn đủ ${dientoan636BaoType} số cho Bao ${dientoan636BaoType}.` });
        return;
      }
      const comb = getDientoan636CombinationsCount(dientoan636BaoType, boardA.numbers.length);
      processCheckout({
        gameId,
        gameName,
        playType: `Bao ${dientoan636BaoType}`,
        drawIds: selectedDraws,
        boards: [{
          id: 'A',
          isTC: false,
          numbers: boardA.numbers,
          cost: comb * (boardA.multiplier || 10000)
        }],
        totalCost: getDientoan636TotalCost()
      });
    }
  };

  // Than Tai 4 helper functions
  const handleThanTaiAutoPickBoard = (index: number) => {
    const reqCount = thanTaiPlayType === 'Thần tài 4' ? 4 : 6;
    const chosen: string[] = [];
    for (let i = 0; i < reqCount; i++) {
      const rand = Math.floor(Math.random() * 10).toString();
      chosen.push(rand);
    }
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: chosen,
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleThanTaiClearBoard = (index: number) => {
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: [],
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleThanTaiChọnNhanh = () => {
    const updated = standardBoards.map((board) => {
      const hasContent = board.numbers.length > 0;
      if (!hasContent && !board.isTC) {
        const reqCount = thanTaiPlayType === 'Thần tài 4' ? 4 : 6;
        const chosen: string[] = [];
        for (let i = 0; i < reqCount; i++) {
          const rand = Math.floor(Math.random() * 10).toString();
          chosen.push(rand);
        }
        return {
          ...board,
          numbers: chosen,
          isTC: false
        };
      }
      return board;
    });
    setStandardBoards(updated);
  };

  const handleThanTaiCheckout = () => {
    const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
    if (activeBoards.length === 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn số cho ít nhất 1 dãy.' });
      return;
    }
    const reqCount = thanTaiPlayType === 'Thần tài 4' ? 4 : 6;
    const invalidBoard = activeBoards.find((b) => b.numbers.length !== reqCount);
    if (invalidBoard) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: `Dãy ${invalidBoard.id} chưa chọn đủ số.` });
      return;
    }
    processCheckout({
      gameId,
      gameName,
      playType: thanTaiPlayType,
      drawIds: selectedDraws,
      boards: activeBoards.map(b => ({
        id: b.id,
        isTC: false,
        numbers: b.numbers,
        cost: b.multiplier || 10000
      })),
      totalCost: activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000), 0)
    });
  };

  // Loto Cap specific helper functions
  const getLotoCapRequiredCount = (playType: string) => {
    if (playType === 'Lô tô 2 cặp') return 2;
    if (playType === 'Lô tô 3 cặp') return 3;
    if (playType === 'Lô tô 4 cặp') return 4;
    return 2;
  };

  const handleLotoCapAutoPickBoard = (index: number) => {
    const reqCount = gameId === 'truot_loto' ? getTruotLotoRequiredCount(truotLotoPlayType) : getLotoCapRequiredCount(lotoCapPlayType);
    const chosen: string[] = [];
    while (chosen.length < reqCount) {
      const rand = Math.floor(Math.random() * 100);
      const randStr = String(rand).padStart(2, '0');
      if (!chosen.includes(randStr)) {
        chosen.push(randStr);
      }
    }
    chosen.sort();
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: chosen,
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleLotoCapClearBoard = (index: number) => {
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: [],
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleLotoCapChọnNhanh = () => {
    const reqCount = gameId === 'truot_loto' ? getTruotLotoRequiredCount(truotLotoPlayType) : getLotoCapRequiredCount(lotoCapPlayType);
    const updated = standardBoards.map((board) => {
      const hasContent = board.numbers.length > 0;
      if (!hasContent && !board.isTC) {
        const chosen: string[] = [];
        while (chosen.length < reqCount) {
          const rand = Math.floor(Math.random() * 100);
          const randStr = String(rand).padStart(2, '0');
          if (!chosen.includes(randStr)) {
            chosen.push(randStr);
          }
        }
        chosen.sort();
        return {
          ...board,
          numbers: chosen,
          isTC: false
        };
      }
      return board;
    });
    setStandardBoards(updated);
  };

  const getLotoCapTotalCost = () => {
    const activeBoards = standardBoards.filter((b) => b.numbers.length > 0);
    return activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000), 0);
  };

  const handleLotoCapCheckout = () => {
    const activeBoards = standardBoards.filter((b) => b.numbers.length > 0);
    if (activeBoards.length === 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn số cho ít nhất 1 dãy.' });
      return;
    }

    const reqCount = gameId === 'truot_loto' ? getTruotLotoRequiredCount(truotLotoPlayType) : getLotoCapRequiredCount(lotoCapPlayType);
    const invalidBoard = activeBoards.find((b) => b.numbers.length !== reqCount);
    if (invalidBoard) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: `Dãy ${invalidBoard.id} chưa chọn đủ ${reqCount} cặp.` });
      return;
    }

    processCheckout({
      gameId,
      gameName,
      playType: gameId === 'truot_loto' ? truotLotoPlayType : lotoCapPlayType,
      drawIds: selectedDraws,
      boards: activeBoards.map(b => ({
        id: b.id,
        isTC: false,
        numbers: b.numbers,
        cost: b.multiplier || 10000
      })),
      totalCost: getLotoCapTotalCost()
    });
  };

  const getLoto235RequiredCount = (playType: string) => {
    if (playType === 'Lô tô 2 số') return 2;
    if (playType === 'Lô tô 3 số') return 3;
    if (playType === 'Lô tô 4 số') return 4;
    if (playType === 'Lô tô 5 số') return 5;
    return 2;
  };

  const getLoto235CapNhan = (playType: string) => {
    if (playType === 'Lô tô 2 số') return 4;
    if (playType === 'Lô tô 3 số') return 4;
    if (playType === 'Lô tô 4 số') return 4;
    if (playType === 'Lô tô 5 số') return 27;
    return 1;
  };

  const applyLoto235Bao2Filter = (filter: string) => {
    const nums: string[] = [];
    for (let i = 0; i < 100; i++) {
      const numStr = String(i).padStart(2, '0');
      const sum = parseInt(numStr[0]) + parseInt(numStr[1]);
      if (filter === 'CHẴN') {
        if (i % 2 === 0) nums.push(numStr);
      } else if (filter === 'LẺ') {
        if (i % 2 !== 0) nums.push(numStr);
      } else if (filter === 'LỚN') {
        if (i >= 50) nums.push(numStr);
      } else if (filter === 'NHỎ') {
        if (i < 50) nums.push(numStr);
      } else if (filter === 'TỔNG CHẴN') {
        if (sum % 2 === 0) nums.push(numStr);
      } else if (filter === 'TỔNG LẺ') {
        if (sum % 2 !== 0) nums.push(numStr);
      }
    }
    setLoto235Bao2Numbers(filter === 'ĐẦU' || filter === 'ĐUÔI' ? [] : nums);
  };

  const toggleLoto235Bao2Number = (numStr: string) => {
    if (loto235Bao2Numbers.includes(numStr)) {
      setLoto235Bao2Numbers(loto235Bao2Numbers.filter(n => n !== numStr));
    } else {
      setLoto235Bao2Numbers([...loto235Bao2Numbers, numStr].sort());
    }
  };

  const getGeneratedBao2Numbers = () => {
    if (loto235Bao2Filter === 'ĐẦU') {
      const result: string[] = [];
      loto235Bao2Numbers.forEach(d => {
        for (let i = 0; i <= 9; i++) {
          result.push(`${d}${i}`);
        }
      });
      return result;
    }
    if (loto235Bao2Filter === 'ĐUÔI') {
      const result: string[] = [];
      loto235Bao2Numbers.forEach(d => {
        for (let i = 0; i <= 9; i++) {
          result.push(`${i}${d}`);
        }
      });
      return result;
    }
    return loto235Bao2Numbers;
  };

  const handleLoto235AutoPickBoard = (index: number) => {
    const reqCount = getLoto235RequiredCount(loto235PlayType);
    const chosen: string[] = [];
    for (let i = 0; i < reqCount; i++) {
      chosen.push(Math.floor(Math.random() * 10).toString());
    }
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: chosen,
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleLoto235ClearBoard = (index: number) => {
    const updated = [...standardBoards];
    updated[index] = {
      ...updated[index],
      numbers: [],
      isTC: false
    };
    setStandardBoards(updated);
  };

  const handleLoto235ChọnNhanh = () => {
    const reqCount = getLoto235RequiredCount(loto235PlayType);
    const updated = standardBoards.map((board) => {
      const hasContent = board.numbers.length > 0;
      if (!hasContent && !board.isTC) {
        const chosen: string[] = [];
        for (let i = 0; i < reqCount; i++) {
          chosen.push(Math.floor(Math.random() * 10).toString());
        }
        return {
          ...board,
          numbers: chosen,
          isTC: false
        };
      }
      return board;
    });
    setStandardBoards(updated);
  };

  const getLoto235TotalCost = () => {
    const numDraws = (selectedDraws && selectedDraws.length > 0) ? selectedDraws.length : (loto235DrawCount || 1);
    if (loto235PlayType === 'Bao 2 số') {
      let count = loto235Bao2Numbers.length;
      if (loto235Bao2Filter === 'ĐẦU' || loto235Bao2Filter === 'ĐUÔI') {
        count = count * 10;
      }
      return count * (loto235Bao2Multiplier || 10000) * numDraws;
    }
    const capNhan = getLoto235CapNhan(loto235PlayType);
    const activeBoards = standardBoards.filter((b) => b.numbers.length > 0);
    const sumBase = activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000) * capNhan, 0);
    return sumBase * numDraws;
  };

  const getEstimatedWinInfo = () => {
    let multiplier = 0;
    if (isLoto235) {
      if (loto235PlayType === 'Lô tô 2 số') multiplier = 90;
      else if (loto235PlayType === 'Lô tô 3 số') multiplier = 900;
      else if (loto235PlayType === 'Lô tô 4 số') multiplier = 9000;
      else if (loto235PlayType === 'Lô tô 5 số') multiplier = 90000;
      else if (loto235PlayType === 'Bao 2 số') multiplier = 2.7;
    } else if (isLotoCap) {
      if (lotoCapPlayType === 'Lô tô 2 cặp') multiplier = 15;
      else if (lotoCapPlayType === 'Lô tô 3 cặp') multiplier = 65;
      else if (lotoCapPlayType === 'Lô tô 4 cặp') multiplier = 170;
    } else if (isTruotLoto) {
      if (truotLotoPlayType === 'Trượt 4') multiplier = 2.3;
      else if (truotLotoPlayType === 'Trượt 8') multiplier = 8;
      else if (truotLotoPlayType === 'Trượt 10') multiplier = 12;
    }

    if (isDientoan636) {
      const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
      let totalCost = getDientoan636TotalCost();
      if (totalCost === 0) return null;
      let estimatedWin = 500000000;
      if (dientoan636PlayType !== 'Cơ bản') {
        estimatedWin = 500000000;
      }
      return { multiplier: 100000, totalCost, estimatedWin };
    }

    if (isThanTai4) {
      const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
      let totalCost = activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000), 0);
      if (totalCost === 0) return null;
      let estimatedWin = 0;
      if (thanTaiPlayType === 'Thần tài 4') {
        const baseCostSum = activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000), 0);
        estimatedWin = baseCostSum * 10000;
      } else if (thanTaiPlayType === 'Điện toán 1-2-3') {
        const baseCostSum = activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000), 0);
        estimatedWin = baseCostSum * 1080;
      }
      return { multiplier: 1, totalCost, estimatedWin };
    }

    if (!multiplier) return null;

    let estimatedWin = 0;
    let totalCost = 0;
    if (isLoto235) {
      totalCost = getLoto235TotalCost();
      if (totalCost === 0) return null;
      if (loto235PlayType === 'Bao 2 số') {
        const baseBet = loto235Bao2Multiplier || 10000;
        estimatedWin = baseBet * multiplier;
      } else {
        const activeBoards = standardBoards.filter((b) => b.numbers.length > 0);
        if (activeBoards.length === 0) return null;
        const maxBet = Math.max(...activeBoards.map((b) => b.multiplier || 10000));
        estimatedWin = maxBet * multiplier;
      }
    } else if (isLotoCap || isTruotLoto) {
      totalCost = getLotoCapTotalCost();
      if (totalCost === 0) return null;
      const activeBoards = standardBoards.filter((b) => b.numbers.length > 0);
      if (activeBoards.length === 0) return null;
      const maxBet = Math.max(...activeBoards.map((b) => b.multiplier || 10000));
      estimatedWin = maxBet * multiplier;
    } else {
      totalCost = getStandardTotalCost();
      estimatedWin = totalCost * multiplier;
    }
    if (totalCost === 0) return null;
    return { multiplier, totalCost, estimatedWin };
  };

  const handleLoto235Checkout = () => {
    if (loto235PlayType === 'Bao 2 số') {
      if (loto235Bao2Numbers.length === 0) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn ít nhất 1 bộ số.' });
        return;
      }
      let finalNumbers = [...loto235Bao2Numbers];
      if (loto235Bao2Filter === 'ĐẦU') {
        finalNumbers = [];
        loto235Bao2Numbers.forEach(d => {
          for (let i = 0; i <= 9; i++) {
            finalNumbers.push(`${d}${i}`);
          }
        });
      } else if (loto235Bao2Filter === 'ĐUÔI') {
        finalNumbers = [];
        loto235Bao2Numbers.forEach(d => {
          for (let i = 0; i <= 9; i++) {
            finalNumbers.push(`${i}${d}`);
          }
        });
      }

      processCheckout({
        gameId,
        gameName,
        playType: `Bao 2 số (${loto235Bao2Filter})`,
        drawIds: selectedDraws,
        boards: [{
          id: 'A',
          isTC: false,
          numbers: finalNumbers,
          cost: (loto235Bao2Multiplier || 10000) * finalNumbers.length,
          baseCost: loto235Bao2Multiplier || 10000
        }],
        totalCost: getLoto235TotalCost()
      });
      return;
    }

    const activeBoards = standardBoards.filter((b) => b.numbers.length > 0);
    if (activeBoards.length === 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn số cho ít nhất 1 dãy.' });
      return;
    }

    const reqCount = getLoto235RequiredCount(loto235PlayType);
    const invalidBoard = activeBoards.find((b) => b.numbers.length !== reqCount);
    if (invalidBoard) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: `Dãy ${invalidBoard.id} chưa được điền đầy đủ các ô số.` });
      return;
    }

    const capNhan = getLoto235CapNhan(loto235PlayType);
    processCheckout({
      gameId,
      gameName,
      playType: loto235PlayType,
      drawIds: selectedDraws,
      boards: activeBoards.map(b => ({
        id: b.id,
        isTC: false,
        numbers: [b.numbers.join('')],
        cost: (b.multiplier || 10000) * capNhan,
        baseCost: b.multiplier || 10000
      })),
      totalCost: getLoto235TotalCost()
    });
  };

  useEffect(() => {
    if (gameId === 'loto_235' && loto235PlayType === 'Bao 2 số') {
      applyLoto235Bao2Filter(loto235Bao2Filter);
    }
  }, [loto235PlayType, loto235Bao2Filter]);

  const fetchActiveDraw = async () => {
    setIsDrawLoading(true);
    try {
      const res = await api.get('/draws/active');
      const draws = res.data;
      // Map UI gameId to backend game code
      let mappedGameCode = gameId;
      if (gameId === 'bao_keno' || gameId === 'clln_keno') mappedGameCode = 'keno';
      if (gameId === 'max_3d' && standardPlayType === 'Max3D Pro') mappedGameCode = 'max_3d_pro';

      const nowMs = Date.now();

      if (mappedGameCode === 'truot_loto' || mappedGameCode === 'loto_cap') {
        const generatedDraws: any[] = [];
        const now = new Date();
        const todayCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 20, 0);
        let startDayOffset = 0;
        if (now.getTime() >= todayCutoff.getTime()) {
          startDayOffset = 1;
        }

        for (let i = 0; i < 10; i++) {
          const drawDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + startDayOffset + i, 17, 20, 0);
          const day = String(drawDate.getDate()).padStart(2, '0');
          const month = String(drawDate.getMonth() + 1).padStart(2, '0');
          const year = drawDate.getFullYear();
          const dateFormatted = `${day}/${month}/${year} 18:15`;
          const drawNum = 1612 + startDayOffset + i;
          const drawCode = `#${drawNum}`;

          generatedDraws.push({
            id: `truot_${year}${month}${day}`,
            drawCode: drawCode,
            label: `${drawCode} - ${dateFormatted}`,
            timeStr: '18:15:00',
            dateStr: dateFormatted,
            closeTime: drawDate.toISOString(),
          });
        }
        setDrawCycles(generatedDraws);
        setSelectedDrawIndex(0);
        setSelectedDraws([generatedDraws[0].id]);
        const closeTimeMs = new Date(generatedDraws[0].closeTime).getTime();
        setCountdown(Math.max(0, Math.floor((closeTimeMs - Date.now()) / 1000)));
        setIsDrawLoading(false);
        return;
      }

      if (mappedGameCode === 'max_4d' && (!draws || draws.filter((d: any) => d.game && d.game.code === 'max_4d' && new Date(d.closeTime).getTime() > nowMs).length === 0)) {
        const generatedDraws: any[] = [];
        const now = new Date();
        const todayCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 20, 0);
        let startDayOffset = 0;
        if (now.getTime() >= todayCutoff.getTime()) {
          startDayOffset = 1;
        }

        for (let i = 0; i < 10; i++) {
          const drawDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + startDayOffset + i, 17, 20, 0);
          const day = String(drawDate.getDate()).padStart(2, '0');
          const month = String(drawDate.getMonth() + 1).padStart(2, '0');
          const year = drawDate.getFullYear();
          const dateFormatted = `${day}/${month}/${year} 18:00`;
          const drawNum = 750 + startDayOffset + i;
          const drawCode = `#${String(drawNum).padStart(4, '0')}`;

          generatedDraws.push({
            id: `max4d_${year}${month}${day}`,
            drawCode: drawCode,
            label: `${drawCode} - ${dateFormatted}`,
            timeStr: '18:00:00',
            dateStr: dateFormatted,
            closeTime: drawDate.toISOString(),
          });
        }
        setDrawCycles(generatedDraws);
        setSelectedDrawIndex(0);
        setSelectedDraws([generatedDraws[0].id]);
        const closeTimeMs = new Date(generatedDraws[0].closeTime).getTime();
        setCountdown(Math.max(0, Math.floor((closeTimeMs - Date.now()) / 1000)));
        setIsDrawLoading(false);
        return;
      }

      // Find all active draws for this game that are in the future (max 10 upcoming)
      const activeDrawsForGame = draws
        .filter((d: any) =>
          d.game && d.game.code === mappedGameCode && new Date(d.closeTime).getTime() > nowMs
        )
        .slice(0, 10);

      if (activeDrawsForGame.length > 0) {
        const formattedDraws = activeDrawsForGame.map((d: any) => {
          const closeTime = new Date(d.closeTime);
          const isLotto535 = mappedGameCode === 'lotto_535';
          // For lotto_535, closeTime is cutoff (12h/20h), draw time is 1 hour later (13h/21h)
          const displayTime = isLotto535 ? new Date(closeTime.getTime() + 60 * 60 * 1000) : (d.drawTime ? new Date(d.drawTime) : closeTime);

          const day = String(displayTime.getDate()).padStart(2, '0');
          const month = String(displayTime.getMonth() + 1).padStart(2, '0');
          const year = displayTime.getFullYear();
          const hrs = String(displayTime.getHours()).padStart(2, '0');
          const mins = String(displayTime.getMinutes()).padStart(2, '0');
          const secs = String(displayTime.getSeconds()).padStart(2, '0');
          const dateFormatted = `${day}/${month}/${year} ${hrs}:${mins}`;

          return {
            id: d._id,
            drawCode: d.drawCode,
            label: `${d.drawCode} - ${dateFormatted}`,
            timeStr: `${hrs}:${mins}:${secs}`,
            dateStr: dateFormatted,
            closeTime: d.closeTime,
          };
        });

        setDrawCycles(formattedDraws);

        setSelectedDrawIndex((prevIndex) => {
          if (prevIndex < 0 || prevIndex >= formattedDraws.length) {
            setTempSelectedDrawIndex(0);
            return 0;
          }
          return prevIndex;
        });

        // Auto switch to first active draw if current selection is invalid or expired
        setSelectedDraws((prev) => {
          const isValidPrev = prev && prev.length > 0 && formattedDraws.some((d: any) => prev.includes(d.id));
          if (!isValidPrev) {
            setTempSelectedDraws([formattedDraws[0].id]);
            return [formattedDraws[0].id];
          }
          return prev;
        });

        const currentSelectedId = (selectedDraws && selectedDraws[0]) || formattedDraws[0]?.id;
        const activeDraw = activeDrawsForGame.find((d: any) => d._id === currentSelectedId) || activeDrawsForGame[0];
        if (activeDraw && activeDraw.closeTime) {
          const closeTimeMs = new Date(activeDraw.closeTime).getTime();
          const diffSecs = Math.max(0, Math.floor((closeTimeMs - Date.now()) / 1000));
          setCountdown(diffSecs);
        }
      } else {
        setDrawCycles([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin kỳ quay:', error);
    } finally {
      setIsDrawLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveDraw();
    }, [gameId, standardPlayType])
  );

  useEffect(() => {
    fetchActiveDraw();
  }, [gameId, standardPlayType]);

  useEffect(() => {
    if (countdown === 0) {
      fetchActiveDraw();
    }
  }, [countdown]);


  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };




  // Render STANDARD LAYOUT A (Mega/Power/Lotto/Max3D/Lotto535)
  const isPower = gameId === 'power_655';
  const isMega = gameId === 'mega_645';
  const isMax3d = gameId === 'max_3d';
  const isMax4d = gameId === 'max_4d';

  const isLoto235 = gameId === 'loto_235';
  const isThanTai4 = gameId === 'than_tai_4';
  const isDigitPicker = isMax3d || isMax4d || isThanTai4 || (isLoto235 && loto235PlayType !== 'Bao 2 số');
  const isLotoCap = gameId === 'loto_cap';
  const isTruotLoto = gameId === 'truot_loto';
  const isDientoan636 = gameId === 'dientoan_636';
  const activeDraw = standardDrawCycles.length > 0 ? standardDrawCycles[selectedDrawIndex] : null;

  // Dynamic color branding
  const activeColor = (isMax3d || isMax4d) ? '#E0115F' : isLottoGame ? '#E51F27' : isLoto235 ? '#0084FA' : '#C77A1E';

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F2942" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{gameName}</Text>
        <View style={styles.infoBtn} />
      </View>

      {/* Play Type Tabs */}
      <View style={styles.playTabsWrapper}>
        {isThanTai4 ? (
          <View style={{ flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#EBF0F3', width: '100%' }}>
            {['Thần tài 4', 'Điện toán 1-2-3'].map((type) => {
              const isActive = thanTaiPlayType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.lottoTabBtn,
                    isActive && { borderBottomColor: '#E51F27', borderBottomWidth: 2 }
                  ]}
                  onPress={() => {
                    setThanTaiPlayType(type);
                    setStandardBoards([
                      { id: 'A', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'B', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'C', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'D', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'E', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'F', numbers: [], isTC: false, multiplier: 10000 },
                    ]);
                  }}
                >
                  <Text style={[
                    styles.lottoTabBtnText,
                    isActive && { color: '#0F2942', fontWeight: 'bold' },
                    !isActive && { color: '#8F9BB3' }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : isDientoan636 ? (
          <View style={{ flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#EBF0F3', width: '100%' }}>
            {['Cơ bản', 'Bao 6x36'].map((type) => {
              const isActive = dientoan636PlayType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.lottoTabBtn,
                    isActive && { borderBottomColor: '#E51F27', borderBottomWidth: 2 }
                  ]}
                  onPress={() => {
                    setDientoan636PlayType(type);
                    setStandardBoards([
                      { id: 'A', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'B', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'C', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'D', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'E', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'F', numbers: [], isTC: false, multiplier: 10000 },
                    ]);
                  }}
                >
                  <Text style={[
                    styles.lottoTabBtnText,
                    isActive && { color: '#0F2942', fontWeight: 'bold' },
                    !isActive && { color: '#8F9BB3' }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : isLotoCap ? (
          <View style={{ flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#EBF0F3', width: '100%' }}>
            {['Lô tô 2 cặp', 'Lô tô 3 cặp', 'Lô tô 4 cặp'].map((type) => {
              const isActive = lotoCapPlayType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.lottoTabBtn,
                    isActive && { borderBottomColor: '#E51F27', borderBottomWidth: 2 }
                  ]}
                  onPress={() => {
                    setLotoCapPlayType(type);
                    setStandardBoards([
                      { id: 'A', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'B', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'C', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'D', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'E', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'F', numbers: [], isTC: false, multiplier: 10000 },
                    ]);
                  }}
                >
                  <Text style={[
                    styles.lottoTabBtnText,
                    isActive && { color: '#0F2942', fontWeight: 'bold' },
                    !isActive && { color: '#8F9BB3' }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : isTruotLoto ? (
          <View style={{ flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#EBF0F3', width: '100%' }}>
            {['Trượt 4', 'Trượt 8', 'Trượt 10'].map((type) => {
              const isActive = truotLotoPlayType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.lottoTabBtn,
                    isActive && { borderBottomColor: '#E51F27', borderBottomWidth: 2 }
                  ]}
                  onPress={() => {
                    setTruotLotoPlayType(type);
                    setStandardBoards([
                      { id: 'A', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'B', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'C', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'D', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'E', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'F', numbers: [], isTC: false, multiplier: 10000 },
                    ]);
                  }}
                >
                  <Text style={[
                    styles.lottoTabBtnText,
                    isActive && { color: '#0F2942', fontWeight: 'bold' },
                    !isActive && { color: '#8F9BB3' }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : isLoto235 ? (
          <View style={{ flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#EBF0F3', width: '100%' }}>
            {['Lô tô 2 số', 'Lô tô 3 số', 'Lô tô 4 số', 'Lô tô 5 số', 'Bao 2 số'].map((type) => {
              const isActive = loto235PlayType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.lottoTabBtn,
                    isActive && { borderBottomColor: '#E51F27', borderBottomWidth: 2 }
                  ]}
                  onPress={() => {
                    setLoto235PlayType(type);
                    setStandardBoards([
                      { id: 'A', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'B', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'C', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'D', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'E', numbers: [], isTC: false, multiplier: 10000 },
                      { id: 'F', numbers: [], isTC: false, multiplier: 10000 },
                    ]);
                  }}
                >
                  <Text style={[
                    styles.lottoTabBtnText,
                    isActive && { color: '#0F2942', fontWeight: 'bold' },
                    !isActive && { color: '#8F9BB3' }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : isLottoGame ? (
          <View style={{ flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#EBF0F3', width: '100%' }}>
            {['Cơ bản', 'Bao số chính', 'Bao số đặc biệt'].map((type) => {
              const isActive = lottoPlayType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.lottoTabBtn,
                    isActive && { borderBottomColor: '#E51F27', borderBottomWidth: 2 }
                  ]}
                  onPress={() => {
                    setLottoPlayType(type);
                    setStandardBoards([
                      { id: 'A', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
                      { id: 'B', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
                      { id: 'C', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
                      { id: 'D', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
                      { id: 'E', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
                      { id: 'F', numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 },
                    ]);
                  }}
                >
                  <Text style={[
                    styles.lottoTabBtnText,
                    isActive && { color: '#E51F27' }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : isMax3d ? (
          <View style={{ flexDirection: 'row', borderBottomWidth: 1.5, borderBottomColor: '#EBF0F3', width: '100%' }}>
            {['Max3D', 'Max3D+', 'Max3D Pro'].map((type) => {
              const isActive = standardPlayType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.max3dTabBtn,
                    isActive && { borderBottomColor: '#E0115F', borderBottomWidth: 2 }
                  ]}
                  onPress={() => handleStandardPlayTypeChange(type)}
                >
                  <Text style={[
                    styles.max3dTabBtnText,
                    isActive && { color: '#E0115F' }
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : !isMax4d ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playTabsScroll}
          >
            {['Cơ bản', 'Bao 5', 'Bao 7', 'Bao 8', 'Bao 9', 'Bao 10', 'Bao 11', 'Bao 12'].map((type) => {
              const isActive = standardPlayType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.playTabBtn, isActive && styles.playTabBtnActive]}
                  onPress={() => handleStandardPlayTypeChange(type)}
                >
                  <Text style={[styles.playTabBtnText, isActive && styles.playTabBtnTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={[
                styles.playTabBtn,
                ['Bao 13', 'Bao 14', 'Bao 15', 'Bao 18'].includes(standardPlayType) && styles.playTabBtnActive
              ]}
              onPress={() => setIsBaoDropdownOpen(!isBaoDropdownOpen)}
            >
              <Text style={[
                styles.playTabBtnText,
                ['Bao 13', 'Bao 14', 'Bao 15', 'Bao 18'].includes(standardPlayType) && styles.playTabBtnTextActive
              ]}>
                {['Bao 13', 'Bao 14', 'Bao 15', 'Bao 18'].includes(standardPlayType) ? standardPlayType : '...'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}

        {/* Dropdown Menu for Bao 13, 14, 15, 18 */}
        {!isMax3d && !isMax4d && !isLottoGame && isBaoDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {['Bao 13', 'Bao 14', 'Bao 15', 'Bao 18'].map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownMenuItem}
                onPress={() => handleStandardPlayTypeChange(type)}
              >
                <Text style={styles.dropdownMenuItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Lotto 535 Sub Bao Tabs */}
      {isLottoGame && lottoPlayType !== 'Cơ bản' && (
        <View style={styles.lottoSubBaoWrapper}>
          {lottoPlayType === 'Bao số chính' ? (
            <View style={styles.lottoSubBaoContainer}>
              {[4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((val) => {
                const isActive = lottoMainBao === val;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[styles.lottoSubBaoBtn, isActive && styles.lottoSubBaoBtnActive]}
                    onPress={() => {
                      setLottoMainBao(val);
                      setStandardBoards(standardBoards.map(b => ({ ...b, numbers: [], specialNumbers: [], isTC: false })));
                    }}
                  >
                    <Text style={[styles.lottoSubBaoText, isActive && styles.lottoSubBaoTextActive]}>
                      Bao {val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.lottoSubBaoContainer}>
              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((val) => {
                const isActive = lottoSpecialBao === val;
                return (
                  <TouchableOpacity
                    key={val}
                    style={[styles.lottoSubBaoBtn, isActive && styles.lottoSubBaoBtnActive]}
                    onPress={() => {
                      setLottoSpecialBao(val);
                      setStandardBoards(standardBoards.map(b => ({ ...b, numbers: [], specialNumbers: [], isTC: false })));
                    }}
                  >
                    <Text style={[styles.lottoSubBaoText, isActive && styles.lottoSubBaoTextActive]}>
                      Bao {val}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Period/Draw Selection Row */}
      <View style={styles.periodRowContainer}>
        <TouchableOpacity
          style={styles.periodBox}
          onPress={() => {
            if (isLoto235) {
              setIsLoto235DrawPickerVisible(true);
            } else {
              setTempSelectedDrawIndex(selectedDrawIndex);
              setIsStandardDrawPickerVisible(true);
            }
          }}
        >
          <Text style={styles.periodLabel}>Kỳ quay:</Text>
          <Text style={styles.periodValueRed}>
            {isDrawLoading || !activeDraw
              ? 'Đang tải...'
              : isLoto235
                ? (loto235DrawCount > 1 ? `Đã chọn ${loto235DrawCount} kỳ` : `${activeDraw.dateStr}`)
                : `${activeDraw.drawCode} - ${activeDraw.dateStr}`}
          </Text>
          <Text style={styles.periodTime}>
            {`${formatTime(countdown)} ▼`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chartBtn} onPress={handleStatsPress}>
          <BarChart2 size={18} color="#00A859" />
        </TouchableOpacity>
      </View>

      {/* Boards List */}
      {isDientoan636 && dientoan636PlayType === 'Bao 6x36' ? (
        <ScrollView contentContainerStyle={styles.bao2ScrollContent} showsVerticalScrollIndicator={false}>
          {/* Bao options (split into 2 rows of 4 buttons) */}
          <View style={{ gap: 8, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[4, 5, 7, 8].map((baoNum) => {
                const isActive = dientoan636BaoType === baoNum;
                return (
                  <TouchableOpacity
                    key={baoNum}
                    style={[
                      styles.bao2FilterBtn,
                      isActive && styles.bao2FilterBtnActive
                    ]}
                    onPress={() => {
                      setDientoan636BaoType(baoNum);
                      setDientoan636VisibleCombosCount(10);
                      const updated = [...standardBoards];
                      updated[0] = { id: 'A', numbers: [], isTC: false, multiplier: 10000 };
                      setStandardBoards(updated);
                    }}
                  >
                    <Text style={[styles.bao2FilterBtnText, isActive && styles.bao2FilterBtnTextActive]}>
                      Bao {baoNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[9, 10, 11, 12].map((baoNum) => {
                const isActive = dientoan636BaoType === baoNum;
                return (
                  <TouchableOpacity
                    key={baoNum}
                    style={[
                      styles.bao2FilterBtn,
                      isActive && styles.bao2FilterBtnActive
                    ]}
                    onPress={() => {
                      setDientoan636BaoType(baoNum);
                      setDientoan636VisibleCombosCount(10);
                      const updated = [...standardBoards];
                      updated[0] = { id: 'A', numbers: [], isTC: false, multiplier: 10000 };
                      setStandardBoards(updated);
                    }}
                  >
                    <Text style={[styles.bao2FilterBtnText, isActive && styles.bao2FilterBtnTextActive]}>
                      Bao {baoNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Row A circle slots */}
          <View style={[styles.standardBoardRow, { borderBottomWidth: 0, paddingVertical: 12, justifyContent: 'center' }]}>
            <Text style={[styles.standardBoardLetter, { color: '#0F2942', marginRight: 12 }]}>A</Text>

            <TouchableOpacity
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1, maxWidth: '75%' }}
              onPress={() => handleOpenStandardBoardModal(0)}
            >
              {Array.from({ length: dientoan636BaoType }).map((_, idx) => {
                const num = standardBoards[0]?.numbers[idx];
                if (num !== undefined && num !== '') {
                  return (
                    <View key={idx} style={[styles.filledCircle, { backgroundColor: '#0B3A60', borderColor: '#0B3A60', margin: 2 }]}>
                      <Text style={styles.filledCircleText}>{num}</Text>
                    </View>
                  );
                }
                return (
                  <View key={idx} style={[styles.emptyCircle, { borderColor: '#0B3A60', margin: 2 }]} />
                );
              })}
            </TouchableOpacity>

            <View style={{ marginLeft: 12 }}>
              {standardBoards[0]?.numbers.length > 0 ? (
                <TouchableOpacity
                  style={styles.rowDeleteBtn}
                  onPress={() => handleClearBoard(0)}
                >
                  <Trash2 size={22} color="#8F9BB3" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.rowRefreshBtn}
                  onPress={() => handleAutoPickBoard(0)}
                >
                  <RotateCw size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Title */}
          <Text style={styles.bao2ListHeading}>
            Danh sách các bộ số được tạo ({getDientoan636CombinationsCount(dientoan636BaoType, standardBoards[0]?.numbers.length)} bộ số)
          </Text>

          {/* Render combos */}
          {(() => {
            const combos = getDientoan636GeneratedCombos(standardBoards[0]?.numbers || [], dientoan636BaoType);
            if (combos.length === 0) return null;
            const visibleCombos = combos.slice(0, dientoan636VisibleCombosCount);
            const hasMore = combos.length > dientoan636VisibleCombosCount;

            return (
              <View style={{ gap: 8, alignItems: 'center', marginTop: 12, paddingBottom: 32 }}>
                {visibleCombos.map((combo, idx) => (
                  <View key={idx} style={{ flexDirection: 'row', gap: 6 }}>
                    {combo.map((num, ballIdx) => (
                      <View key={ballIdx} style={[styles.filledCircle, { backgroundColor: '#0B3A60', borderColor: '#0B3A60', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={[styles.filledCircleText, { fontSize: 13 }]}>{num}</Text>
                      </View>
                    ))}
                  </View>
                ))}

                {hasMore ? (
                  <TouchableOpacity
                    style={{
                      marginTop: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 24,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: '#0084FA',
                    }}
                    onPress={() => setDientoan636VisibleCombosCount((prev) => prev + 10)}
                  >
                    <Text style={{ fontSize: 13, color: '#0084FA', fontWeight: 'bold' }}>
                      Xem thêm (Còn {combos.length - dientoan636VisibleCombosCount} bộ số)
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ fontSize: 13, color: '#8F9BB3', fontStyle: 'italic', marginTop: 8, textAlign: 'center' }}>
                    Đã hiển thị tất cả {combos.length} bộ số được tạo.
                  </Text>
                )}
              </View>
            );
          })()}
        </ScrollView>
      ) : isLoto235 && loto235PlayType === 'Bao 2 số' ? (
        <ScrollView contentContainerStyle={styles.bao2ScrollContent} showsVerticalScrollIndicator={false}>
          {/* Grid of filters and multiplier pill */}
          <View style={styles.bao2FilterRowContainer}>
            <View style={styles.bao2FilterLeftGrid}>
              {/* Row 1 */}
              <View style={styles.bao2FilterRow}>
                <TouchableOpacity
                  style={[styles.bao2FilterBtn, loto235Bao2Filter === 'CHẴN' && styles.bao2FilterBtnActive]}
                  onPress={() => setLoto235Bao2Filter('CHẴN')}
                >
                  <Text style={[styles.bao2FilterBtnText, loto235Bao2Filter === 'CHẴN' && styles.bao2FilterBtnTextActive]}>CHẴN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bao2FilterBtn, loto235Bao2Filter === 'LẺ' && styles.bao2FilterBtnActive]}
                  onPress={() => setLoto235Bao2Filter('LẺ')}
                >
                  <Text style={[styles.bao2FilterBtnText, loto235Bao2Filter === 'LẺ' && styles.bao2FilterBtnTextActive]}>LẺ</Text>
                </TouchableOpacity>
              </View>

              {/* Row 2 */}
              <View style={styles.bao2FilterRow}>
                <TouchableOpacity
                  style={[styles.bao2FilterBtn, loto235Bao2Filter === 'LỚN' && styles.bao2FilterBtnActive]}
                  onPress={() => setLoto235Bao2Filter('LỚN')}
                >
                  <Text style={[styles.bao2FilterBtnText, loto235Bao2Filter === 'LỚN' && styles.bao2FilterBtnTextActive]}>LỚN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bao2FilterBtn, loto235Bao2Filter === 'NHỎ' && styles.bao2FilterBtnActive]}
                  onPress={() => setLoto235Bao2Filter('NHỎ')}
                >
                  <Text style={[styles.bao2FilterBtnText, loto235Bao2Filter === 'NHỎ' && styles.bao2FilterBtnTextActive]}>NHỎ</Text>
                </TouchableOpacity>
              </View>

              {/* Row 3 */}
              <View style={styles.bao2FilterRow}>
                <TouchableOpacity
                  style={[styles.bao2FilterBtn, loto235Bao2Filter === 'TỔNG CHẴN' && styles.bao2FilterBtnActive]}
                  onPress={() => setLoto235Bao2Filter('TỔNG CHẴN')}
                >
                  <Text style={[styles.bao2FilterBtnText, loto235Bao2Filter === 'TỔNG CHẴN' && styles.bao2FilterBtnTextActive]}>T.CHẴN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bao2FilterBtn, loto235Bao2Filter === 'TỔNG LẺ' && styles.bao2FilterBtnActive]}
                  onPress={() => setLoto235Bao2Filter('TỔNG LẺ')}
                >
                  <Text style={[styles.bao2FilterBtnText, loto235Bao2Filter === 'TỔNG LẺ' && styles.bao2FilterBtnTextActive]}>T.LẺ</Text>
                </TouchableOpacity>
              </View>

              {/* Row 3 */}
              <View style={styles.bao2FilterRow}>
                <TouchableOpacity
                  style={[styles.bao2FilterBtn, loto235Bao2Filter === 'ĐẦU' && styles.bao2FilterBtnActive]}
                  onPress={() => setLoto235Bao2Filter('ĐẦU')}
                >
                  <Text style={[styles.bao2FilterBtnText, loto235Bao2Filter === 'ĐẦU' && styles.bao2FilterBtnTextActive]}>ĐẦU</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bao2FilterBtn, loto235Bao2Filter === 'ĐUÔI' && styles.bao2FilterBtnActive]}
                  onPress={() => setLoto235Bao2Filter('ĐUÔI')}
                >
                  <Text style={[styles.bao2FilterBtnText, loto235Bao2Filter === 'ĐUÔI' && styles.bao2FilterBtnTextActive]}>ĐUÔI</Text>
                </TouchableOpacity>
                <View style={{ flex: 1.5 }} />
              </View>
            </View>

            {/* Right side multiplier pill (tall button) */}
            <TouchableOpacity
              style={styles.bao2MultiplierBox}
              onPress={() => {
                setActiveMultiplierBoardIndex(null);
                setIsLotoMultiplierModalVisible(true);
              }}
            >
              <Text style={styles.bao2MultiplierBoxText}>
                {((loto235Bao2Multiplier || 10000) / 1000).toString()}K
              </Text>
            </TouchableOpacity>
          </View>

          {/* Numbers Display */}
          {loto235Bao2Filter === 'ĐẦU' || loto235Bao2Filter === 'ĐUÔI' ? (
            <View>
              {/* Digit selection header */}
              <Text style={[styles.bao2ListHeading, { fontSize: 13, color: '#333333', marginBottom: 8 }]}>
                Chọn số:
              </Text>

              {/* Digit selection balls */}
              <View style={styles.bao2NumbersGrid}>
                {Array.from({ length: 10 }, (_, i) => {
                  const numStr = String(i);
                  const isSelected = loto235Bao2Numbers.includes(numStr);
                  return (
                    <TouchableOpacity
                      key={numStr}
                      style={[
                        styles.bao2NumberBall,
                        isSelected && { backgroundColor: '#E53935', borderColor: '#E53935' }
                      ]}
                      onPress={() => toggleLoto235Bao2Number(numStr)}
                    >
                      <Text style={[
                        styles.bao2NumberBallText,
                        isSelected && { color: '#FFFFFF' }
                      ]}>
                        {numStr}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Generated numbers below */}
              {getGeneratedBao2Numbers().length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.bao2ListHeading}>
                    Danh sách các bộ số được tạo ({getGeneratedBao2Numbers().length} bộ số)
                  </Text>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, paddingHorizontal: 2, paddingBottom: 16 }}>
                    {getGeneratedBao2Numbers().map((numStr) => (
                      <View
                        key={numStr}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: '#0B2545',
                          justifyContent: 'center',
                          alignItems: 'center',
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                          elevation: 1,
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' }}>
                          {numStr}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View>
              <Text style={styles.bao2ListHeading}>
                Danh sách các bộ số được tạo ({getGeneratedBao2Numbers().length} bộ số)
              </Text>

              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, paddingHorizontal: 2, paddingBottom: 16 }}>
                {getGeneratedBao2Numbers().map((numStr) => (
                  <View
                    key={numStr}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: '#0B2545',
                      justifyContent: 'center',
                      alignItems: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.1,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' }}>
                      {numStr}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.boardsScrollContent, { paddingBottom: 320 + insets.bottom }]} showsVerticalScrollIndicator={false}>
          {((isLotoCap || isDientoan636) ? standardBoards.slice(0, 5) : standardBoards).map((board, index) => {
            const requiredCount = getRequiredNumbersCount(standardPlayType);
            const hasContent = board.numbers.length > 0 || board.isTC || (board.specialNumbers && board.specialNumbers.length > 0);

            const renderSingleCircle = (idx: number) => {
              const num = board.numbers[idx];
              if (board.isTC) {
                return (
                  <View key={idx} style={[styles.tcCircle, { backgroundColor: activeColor }]}>
                    <Text style={styles.tcCircleText}>TC</Text>
                  </View>
                );
              }

              if (num !== undefined && num !== '') {
                return (
                  <View key={idx} style={[styles.filledCircle, { backgroundColor: activeColor }]}>
                    <Text style={styles.filledCircleText}>{num}</Text>
                  </View>
                );
              }

              return (
                <View key={idx} style={[styles.emptyCircle, { borderColor: activeColor }]} />
              );
            };

            const renderLottoCircles = () => {
              const { main: reqMain, special: reqSpecial } = getLottoRequiredCounts();

              const renderLottoBall = (num: string | undefined, isSpecial: boolean, idx: number) => {
                const color = isSpecial ? '#FF8A00' : '#0F8A5F';
                if (board.isTC) {
                  return (
                    <View key={`${isSpecial ? 's' : 'm'}-${idx}`} style={[styles.tcCircle, { backgroundColor: color }]}>
                      <Text style={styles.tcCircleText}>TC</Text>
                    </View>
                  );
                }
                if (num !== undefined && num !== '') {
                  return (
                    <View key={`${isSpecial ? 's' : 'm'}-${idx}`} style={[styles.filledCircle, { backgroundColor: color }]}>
                      <Text style={styles.filledCircleText}>{num}</Text>
                    </View>
                  );
                }
                return (
                  <View key={`${isSpecial ? 's' : 'm'}-${idx}`} style={[styles.emptyCircle, { borderColor: color }]} />
                );
              };

              return (
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, flex: 1 }}>
                  {/* Main numbers */}
                  {Array.from({ length: reqMain }).map((_, idx) =>
                    renderLottoBall(board.numbers[idx], false, idx)
                  )}

                  {/* Divider */}
                  <View key="lotto-divider" style={{ width: 1.5, height: 20, backgroundColor: '#D0D5DD', marginHorizontal: 2 }} />

                  {/* Special numbers */}
                  {Array.from({ length: reqSpecial }).map((_, idx) =>
                    renderLottoBall(board.specialNumbers ? board.specialNumbers[idx] : undefined, true, idx)
                  )}
                </View>
              );
            };

            const renderLoto235Circles = () => {
              const reqCount = getLoto235RequiredCount(loto235PlayType);
              return (
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  {Array.from({ length: reqCount }).map((_, idx) => {
                    const num = board.numbers[idx];
                    const isFilled = num !== undefined && num !== '';
                    return (
                      <TouchableOpacity
                        key={idx}
                        activeOpacity={0.7}
                        onPress={() => handleOpenStandardBoardModal(index, idx)}
                        style={[
                          isFilled ? styles.filledCircle : styles.emptyCircle,
                          { borderColor: '#0B3A60', backgroundColor: isFilled ? '#0B3A60' : 'transparent' }
                        ]}
                      >
                        {isFilled && <Text style={styles.filledCircleText}>{num}</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            };

            const renderLotoCapCircles = () => {
              const reqCount = isTruotLoto
                ? getTruotLotoRequiredCount(truotLotoPlayType)
                : getLotoCapRequiredCount(lotoCapPlayType);

              return (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {Array.from({ length: reqCount }).map((_, idx) => {
                    const num = board.numbers[idx];
                    if (num !== undefined && num !== '') {
                      return (
                        <View key={idx} style={[styles.filledCircle, { backgroundColor: '#0B3A60', borderColor: '#0B3A60' }]}>
                          <Text style={styles.filledCircleText}>{num}</Text>
                        </View>
                      );
                    }
                    return (
                      <View key={idx} style={[styles.emptyCircle, { borderColor: '#0B3A60' }]} />
                    );
                  })}
                </View>
              );
            };

            const renderDientoan636Circles = () => {
              const reqCount = 6;
              return (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {Array.from({ length: reqCount }).map((_, idx) => {
                    const num = board.numbers[idx];
                    if (num !== undefined && num !== '') {
                      return (
                        <View key={idx} style={[styles.filledCircle, { backgroundColor: '#0B3A60', borderColor: '#0B3A60' }]}>
                          <Text style={styles.filledCircleText}>{num}</Text>
                        </View>
                      );
                    }
                    return (
                      <View key={idx} style={[styles.emptyCircle, { borderColor: '#0B3A60' }]} />
                    );
                  })}
                </View>
              );
            };

            const renderThanTaiCircles = () => {
              if (thanTaiPlayType === 'Thần tài 4') {
                return (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {Array.from({ length: 4 }).map((_, idx) => {
                      const num = board.numbers[idx];
                      if (num !== undefined && num !== '') {
                        return (
                          <View key={idx} style={[styles.filledCircle, { backgroundColor: '#0B3A60', borderColor: '#0B3A60' }]}>
                            <Text style={styles.filledCircleText}>{num}</Text>
                          </View>
                        );
                      }
                      return (
                        <View key={idx} style={[styles.emptyCircle, { borderColor: '#0B3A60' }]} />
                      );
                    })}
                  </View>
                );
              } else {
                return (
                  <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                    {(() => {
                      const val1 = board.numbers[0];
                      const filled = val1 !== undefined && val1 !== '';
                      return (
                        <View style={[filled ? styles.filledCircle : styles.emptyCircle, { borderColor: '#0B3A60', backgroundColor: filled ? '#0B3A60' : 'transparent', minWidth: 38, paddingHorizontal: 6 }]}>
                          <Text style={filled ? styles.filledCircleText : { color: '#8F9BB3' }}>
                            {filled ? val1 : '?'}
                          </Text>
                        </View>
                      );
                    })()}

                    <View style={{ width: 1.5, height: 18, backgroundColor: '#D0D5DD', marginHorizontal: 2 }} />

                    {(() => {
                      const val1 = board.numbers[1];
                      const val2 = board.numbers[2];
                      const filled1 = val1 !== undefined && val1 !== '';
                      const filled2 = val2 !== undefined && val2 !== '';
                      const text = `${filled1 ? val1 : '?'}${filled2 ? val2 : '?'}`;
                      const hasAny = filled1 || filled2;
                      return (
                        <View style={[hasAny ? styles.filledCircle : styles.emptyCircle, { borderColor: '#0B3A60', backgroundColor: hasAny ? '#0B3A60' : 'transparent', minWidth: 44, paddingHorizontal: 6 }]}>
                          <Text style={hasAny ? styles.filledCircleText : { color: '#8F9BB3' }}>
                            {text}
                          </Text>
                        </View>
                      );
                    })()}

                    <View style={{ width: 1.5, height: 18, backgroundColor: '#D0D5DD', marginHorizontal: 2 }} />

                    {(() => {
                      const val1 = board.numbers[3];
                      const val2 = board.numbers[4];
                      const val3 = board.numbers[5];
                      const filled1 = val1 !== undefined && val1 !== '';
                      const filled2 = val2 !== undefined && val2 !== '';
                      const filled3 = val3 !== undefined && val3 !== '';
                      const text = `${filled1 ? val1 : '?'}${filled2 ? val2 : '?'}${filled3 ? val3 : '?'}`;
                      const hasAny = filled1 || filled2 || filled3;
                      return (
                        <View style={[hasAny ? styles.filledCircle : styles.emptyCircle, { borderColor: '#0B3A60', backgroundColor: hasAny ? '#0B3A60' : 'transparent', minWidth: 50, paddingHorizontal: 6 }]}>
                          <Text style={hasAny ? styles.filledCircleText : { color: '#8F9BB3' }}>
                            {text}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                );
              }
            };

            const isSplitLayout = (isMax3d || isMax4d) && (standardPlayType === 'Max3D+' || standardPlayType === 'Max3D Pro');

            return (
              <View key={board.id} style={styles.standardBoardRow}>
                {/* Left Label (A, B, C...) */}
                <Text style={[styles.standardBoardLetter, (isMax3d || isMax4d || isLottoGame || isLoto235 || isLotoCap || isDientoan636 || isThanTai4) && { color: '#0F2942' }]}>{board.id}</Text>

                {/* Center Circles grid */}
                {isLoto235 ? (
                  <View style={styles.standardCirclesGrid}>
                    {renderLoto235Circles()}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.standardCirclesGrid}
                    onPress={() => handleOpenStandardBoardModal(index)}
                  >
                    {isLottoGame ? (
                      renderLottoCircles()
                    ) : (isLotoCap || isTruotLoto) ? (
                      renderLotoCapCircles()
                    ) : isDientoan636 ? (
                      renderDientoan636Circles()
                    ) : isThanTai4 ? (
                      renderThanTaiCircles()
                    ) : isSplitLayout ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {/* First 3 circles */}
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          {Array.from({ length: 3 }).map((_, idx) => renderSingleCircle(idx))}
                        </View>

                        {/* Divider */}
                        <View style={{ width: 1.5, height: 20, backgroundColor: '#D0D5DD', marginHorizontal: 4 }} />

                        {/* Last 3 circles */}
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          {Array.from({ length: 3 }).map((_, idx) => renderSingleCircle(idx + 3))}
                        </View>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {Array.from({ length: requiredCount }).map((_, idx) => renderSingleCircle(idx))}
                      </View>
                    )}
                  </TouchableOpacity>
                )}

                {/* Right control (refresh/delete + multiplier for all standard games) */}
                <View style={styles.standardRowControls}>
                  {hasContent ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.max3dPill}
                        onPress={() => {
                          setActiveMultiplierBoardIndex(index);
                          setIsLotoMultiplierModalVisible(true);
                        }}
                      >
                        <Text style={styles.max3dPillText}>
                          {(((board.multiplier || 10000)) / 1000).toString()}K
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rowDeleteBtn}
                        onPress={() => handleClearBoard(index)}
                      >
                        <Trash2 size={20} color="#8F9BB3" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TouchableOpacity
                        style={styles.max3dPill}
                        onPress={() => {
                          setActiveMultiplierBoardIndex(index);
                          setIsLotoMultiplierModalVisible(true);
                        }}
                      >
                        <Text style={styles.max3dPillText}>
                          {(((board.multiplier || 10000)) / 1000).toString()}K
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rowRefreshBtn}
                        onPress={() => handleAutoPickBoard(index)}
                      >
                        <RotateCw size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Sticky Bottom checkout */}
      <View style={[styles.standardFooter, { paddingBottom: Math.max(16, insets.bottom) + 16 }]}>
        {isLoto235 || isLotoCap || isDientoan636 || isThanTai4 ? (
          (isLoto235 ? loto235PlayType !== 'Bao 2 số' : isDientoan636 ? dientoan636PlayType !== 'Bao 6x36' : true) && (
            <View style={{ alignItems: 'center', width: '100%', marginBottom: 12 }}>
              <TouchableOpacity
                style={[styles.standardPillBtn, { width: '90%', justifyContent: 'center', borderWidth: 1, borderColor: '#D0D5DD', paddingVertical: 10, borderRadius: 24 }]}
                onPress={handleChọnNhanh}
              >
                <RotateCw size={14} color="#0084FA" />
                <Text style={styles.standardPillBtnText}>Chọn nhanh</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.standardFooterButtons}>
            <TouchableOpacity style={styles.standardPillBtn} onPress={handleChọnNhanh}>
              <RotateCw size={14} color="#0084FA" />
              <Text style={styles.standardPillBtnText}>Chọn nhanh</Text>
            </TouchableOpacity>



            <TouchableOpacity style={styles.standardPillBtn} onPress={handleAddBoard}>
              <Plus size={14} color="#FF8A00" />
              <Text style={[styles.standardPillBtnText, { color: '#FF8A00' }]}>Thêm dãy số</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.standardTotalRow}>
          <Text style={styles.standardTotalLabel}>Tạm tính:</Text>
          <Text style={styles.standardTotalVal}>
            {(isDientoan636 ? getDientoan636TotalCost() : (isLotoCap || isTruotLoto) ? getLotoCapTotalCost() : isLoto235 ? getLoto235TotalCost() : isLottoGame ? getLottoTotalCost() : getStandardTotalCost()).toLocaleString('vi-VN')} VNĐ
          </Text>
        </View>

        {isDientoan636 ? (
          <View style={[styles.standardTotalRow, { marginTop: 0, paddingTop: 4 }]}>
            <Text style={[styles.standardTotalLabel, { color: '#00BA00', fontSize: 13 }]}>Giải đặc biệt:</Text>
            <Text style={[styles.standardTotalVal, { color: '#00BA00', fontSize: 13 }]}>
              500.000.000 VNĐ
            </Text>
          </View>
        ) : isThanTai4 ? (
          <View style={[styles.standardTotalRow, { marginTop: 0, paddingTop: 4 }]}>
            <Text style={[styles.standardTotalLabel, { color: '#00BA00', fontSize: 13 }]}>Giải thưởng:</Text>
            <Text style={[styles.standardTotalVal, { color: '#00BA00', fontSize: 13 }]}>
              {thanTaiPlayType === 'Thần tài 4' ? '179.000.000 VNĐ' : '139.000.000 VNĐ'}
            </Text>
          </View>
        ) : getEstimatedWinInfo() && (
          <View style={[styles.standardTotalRow, { marginTop: 0, paddingTop: 4 }]}>
            <Text style={[styles.standardTotalLabel, { color: '#00BA00', fontSize: 13 }]}>Thắng tạm tính:</Text>
            <Text style={[styles.standardTotalVal, { color: '#00BA00', fontSize: 13 }]}>
              {(getEstimatedWinInfo()!.estimatedWin).toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
        )}

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <TouchableOpacity
            style={[styles.standardCheckoutBtn, { flex: 1, backgroundColor: COLORS.secondary }]}
            onPress={() => {
              isAddingToCart.current = true;
              handleStandardCheckout();
            }}
          >
            <Text style={styles.standardCheckoutBtnText}>Thêm vé</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.standardCheckoutBtn, { flex: 1 }]}
            onPress={() => {
              isAddingToCart.current = false;
              handleStandardCheckout();
            }}
          >
            <Text style={styles.standardCheckoutBtnText}>Cược ngay</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal Selector */}
      {isStandardNumberModalVisible && (
        <View style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, (isMax3d || isMax4d || isLottoGame || isLoto235) && { backgroundColor: isLottoGame ? '#0056B3' : (isMax3d || isMax4d) ? '#E0115F' : '#0084FA' }]}>
              <Text style={styles.modalTitle}>
                Dãy {activeBoardIndex !== null ? standardBoards[activeBoardIndex]?.id : ''}
                {gameId === 'dientoan_636' ? ` - Chọn ${getModalReqCount()} số` : ''}
              </Text>
              <TouchableOpacity onPress={() => setIsStandardNumberModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={[styles.modalInnerBody, { paddingBottom: Math.max(16, insets.bottom + 16) }]}>
              {isLottoGame ? (
                // Lotto 535 Grid Selector: Main (1-35) + Special (1-12)
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                  {/* Main Grid */}
                  <View style={styles.modalGrid}>
                    {Array.from({ length: maxNumber }, (_, i) => i + 1).map((val) => {
                      const numStr = String(val).padStart(2, '0');
                      const isSelected = tempStandardNumbers.includes(numStr);
                      return (
                        <TouchableOpacity
                          key={`main-${val}`}
                          style={[
                            styles.modalGridBall,
                            isSelected && { backgroundColor: '#E51F27', borderColor: '#E51F27' }
                          ]}
                          onPress={() => {
                            const { main: reqMain } = getLottoRequiredCounts();
                            if (tempStandardNumbers.includes(numStr)) {
                              setTempStandardNumbers(tempStandardNumbers.filter(n => n !== numStr));
                            } else {
                              if (tempStandardNumbers.length >= reqMain) {
                                Alert.alert('Thông báo', `Bạn chỉ được chọn tối đa ${reqMain} số chính.`);
                                return;
                              }
                              setTempStandardNumbers([...tempStandardNumbers, numStr].sort());
                            }
                          }}
                        >
                          <Text style={[
                            styles.modalGridBallText,
                            isSelected && styles.modalGridBallTextSelected
                          ]}>
                            {numStr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Section Divider */}
                  <View style={styles.lottoSpecialDivider}>
                    <View style={styles.lottoDividerLine} />
                    <Text style={styles.lottoDividerText}>Số đặc biệt</Text>
                    <View style={styles.lottoDividerLine} />
                  </View>

                  {/* Special Grid */}
                  <View style={styles.modalGrid}>
                    {Array.from({ length: gameId === 'lotto_570' ? 24 : 12 }, (_, i) => i + 1).map((val) => {
                      const numStr = String(val).padStart(2, '0');
                      const isSelected = tempLottoSpecialNumbers.includes(numStr);
                      return (
                        <TouchableOpacity
                          key={`spec-${val}`}
                          style={[
                            styles.modalGridBall,
                            isSelected && { backgroundColor: '#FF8A00', borderColor: '#FF8A00' }
                          ]}
                          onPress={() => toggleLottoSpecialNumber(numStr)}
                        >
                          <Text style={[
                            styles.modalGridBallText,
                            isSelected && styles.modalGridBallTextSelected
                          ]}>
                            {numStr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              ) : isDigitPicker ? (
                // Max3D / Loto235 Digit Slots selector (Screenshot 3 style)
                <View style={styles.max3dSlotsWrapper}>
                  <View style={styles.max3dSlotsRow}>
                    {tempMax3dSlots.map((val, idx) => {
                      const reqCount = tempMax3dSlots.length;
                      const isActive = idx === activeSlotIndex;

                      return (
                        <React.Fragment key={idx}>
                          {isThanTai4 && thanTaiPlayType === 'Điện toán 1-2-3' ? (
                            (idx === 1 || idx === 3) && (
                              <View style={{ width: 2, height: 32, backgroundColor: '#D0D5DD', marginHorizontal: 6 }} />
                            )
                          ) : (
                            idx === 3 && reqCount === 6 && (
                              <View style={{ width: 2, height: 32, backgroundColor: '#D0D5DD', marginHorizontal: 8 }} />
                            )
                          )}
                          <TouchableOpacity
                            style={[
                              styles.max3dSlotBox,
                              isLoto235 && { width: 44, height: 44, borderRadius: 8 },
                              isActive && [styles.max3dSlotBoxActive, isLoto235 && { borderColor: '#0084FA', shadowColor: '#0084FA' }],
                              val !== '' && [styles.max3dSlotBoxFilled, isLoto235 && { backgroundColor: '#0084FA', borderColor: '#0084FA' }]
                            ]}
                            onPress={() => setActiveSlotIndex(idx)}
                          >
                            <Text style={[
                              styles.max3dSlotText,
                              isLoto235 && { fontSize: 18 },
                              isActive && [styles.max3dSlotTextActive, isLoto235 && { color: '#0084FA' }],
                              val !== '' && styles.max3dSlotTextFilled
                            ]}>
                              {val === '' ? '?' : val}
                            </Text>
                          </TouchableOpacity>
                        </React.Fragment>
                      );
                    })}
                  </View>

                  {/* Keyboard Grid */}
                  <View style={styles.max3dKeyboardGrid}>
                    {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <TouchableOpacity
                        key={digit}
                        style={styles.max3dKeyBtn}
                        onPress={() => handleMax3dDigitPress(digit)}
                      >
                        <Text style={styles.max3dKeyText}>{digit}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                // Number Selection Grid for Power/Mega/Lotto
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollGrid}>
                  <View style={styles.modalGrid}>
                    {Array.from({ length: (isLotoCap || isTruotLoto) ? 100 : maxNumber }, (_, i) => {
                      const val = (isLotoCap || isTruotLoto || isLoto235) ? i : i + 1;
                      const numStr = isLoto235 ? String(val) : String(val).padStart(2, '0');
                      const isSelected = tempStandardNumbers.includes(numStr);
                      return (
                        <TouchableOpacity
                          key={val}
                          style={[
                            styles.modalGridBall,
                            isSelected && styles.modalGridBallSelected
                          ]}
                          onPress={() => toggleStandardModalNumber(numStr)}
                        >
                          <Text style={[
                            styles.modalGridBallText,
                            isSelected && styles.modalGridBallTextSelected
                          ]}>
                            {numStr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              )}

              {/* Modal Footer */}
              <View style={styles.newModalFooter}>
                <View style={styles.modalActionButtonsRow}>
                  <TouchableOpacity
                    style={styles.modalActionBtnClear}
                    onPress={
                      isLottoGame
                        ? () => { setTempStandardNumbers([]); setTempLottoSpecialNumbers([]); }
                        : isDigitPicker
                          ? handleMax3dClear
                          : () => setTempStandardNumbers([])
                    }
                  >
                    <Text style={styles.modalActionBtnTextClear}>Xoá</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalActionBtnRandom}
                    onPress={
                      isLottoGame
                        ? handleLottoModalRandom
                        : isDigitPicker
                          ? handleMax3dRandom
                          : standardModalAutoSelect
                    }
                  >
                    <Text style={styles.modalActionBtnTextRandom}>Ngẫu nhiên</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.modalBtnContinue,
                    isLoto235 && { backgroundColor: '#0084FA' },
                    isLottoGame
                      ? ((tempStandardNumbers.length !== getLottoRequiredCounts().main || tempLottoSpecialNumbers.length !== getLottoRequiredCounts().special) && styles.modalBtnContinueDisabled)
                      : isDigitPicker
                        ? (tempMax3dSlots.some((s) => s === '') && styles.modalBtnContinueDisabled)
                        : (tempStandardNumbers.length !== getModalReqCount() && styles.modalBtnContinueDisabled)
                  ]}
                  onPress={
                    isLottoGame
                      ? handleLottoModalConfirm
                      : isDigitPicker
                        ? handleMax3dConfirm
                        : confirmStandardModalNumbers
                  }
                >
                  <Text style={styles.modalBtnContinueText}>Tiếp tục</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Chọn kỳ mua Lô tô 235 Modal */}
      {isLoto235DrawPickerVisible && (
        <View style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={{ width: '85%', backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden' }}>
            <View style={{ backgroundColor: '#0084FA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>Chọn kỳ mua</Text>
              <TouchableOpacity onPress={() => setIsLoto235DrawPickerVisible(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 8, paddingHorizontal: 16 }}>
              {[1, 2, 5, 10].map((count, index) => {
                const isSelected = loto235DrawCount === count;
                return (
                  <TouchableOpacity
                    key={count}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 14,
                      borderBottomWidth: index === 3 ? 0 : 1,
                      borderBottomColor: '#F0F2F5',
                    }}
                    onPress={() => {
                      setLoto235DrawCount(count);
                      if (drawCycles && drawCycles.length > 0) {
                        setSelectedDraws(drawCycles.slice(0, count).map((d: any) => d.id));
                      }
                      setIsLoto235DrawPickerVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#0F2942' }}>
                      {count} kỳ
                    </Text>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        borderWidth: isSelected ? 6 : 1.5,
                        borderColor: isSelected ? '#E51F27' : '#D0D5DD',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}

      {/* Chọn kỳ mua Standard Modal */}
      {isStandardDrawPickerVisible && (
        <View style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, justifyContent: 'flex-end' }]}>
          <View style={styles.drawModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn kỳ mua</Text>
              <TouchableOpacity onPress={() => setIsStandardDrawPickerVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawModalScrollList} showsVerticalScrollIndicator={false}>
              {isDrawLoading || standardDrawCycles.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="#00A859" />
                  <Text style={{ marginTop: 10, color: '#7F8E9C', fontSize: 14 }}>Đang tải danh sách kỳ quay...</Text>
                </View>
              ) : (
                standardDrawCycles.map((cycle, idx) => {
                  const isSelected = tempSelectedDrawIndex === idx;
                  return (
                    <TouchableOpacity
                      key={cycle.id}
                      style={styles.drawModalItem}
                      onPress={() => setTempSelectedDrawIndex(idx)}
                    >
                      <View style={styles.drawModalLeftGroup}>
                        <View style={[styles.drawCheckbox, isSelected && styles.drawCheckboxChecked]}>
                          {isSelected && (
                            <Check size={14} color="#FF3B30" strokeWidth={3} />
                          )}
                        </View>
                        <Text style={styles.drawModalItemText}>
                          {cycle.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <View style={[styles.drawModalFooter, { paddingBottom: Math.max(16, insets.bottom + 12) }]}>
              <TouchableOpacity
                style={styles.drawConfirmBtn}
                onPress={() => {
                  setSelectedDrawIndex(tempSelectedDrawIndex);
                  setIsStandardDrawPickerVisible(false);
                }}
              >
                <Text style={styles.drawConfirmBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Chọn mệnh giá Loto Multiplier Modal */}
      {isLotoMultiplierModalVisible && (
        <View style={[styles.pickerOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, width: '85%', overflow: 'hidden' }}>
            {/* Header */}
            <View style={{ backgroundColor: '#0084FA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' }}>Chọn mệnh giá</Text>
              <TouchableOpacity onPress={() => setIsLotoMultiplierModalVisible(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* List options */}
            <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
              {[10000, 20000, 30000, 40000, 50000].map((val) => {
                let isSelected = false;
                if (activeMultiplierBoardIndex !== null) {
                  isSelected = (standardBoards[activeMultiplierBoardIndex]?.multiplier || 10000) === val;
                } else {
                  isSelected = loto235Bao2Multiplier === val;
                }
                return (
                  <TouchableOpacity
                    key={val}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: '#F2F4F7'
                    }}
                    onPress={() => {
                      if (activeMultiplierBoardIndex !== null) {
                        const updated = [...standardBoards];
                        updated[activeMultiplierBoardIndex].multiplier = val;
                        setStandardBoards(updated);
                      } else {
                        setLoto235Bao2Multiplier(val);
                      }
                      setIsLotoMultiplierModalVisible(false);
                    }}
                  >
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1D2939' }}>
                      {val.toLocaleString('vi-VN')} đ
                    </Text>
                    <View style={[
                      { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D0D5DD', justifyContent: 'center', alignItems: 'center' },
                      isSelected && { borderColor: '#FF0000' }
                    ]}>
                      {isSelected && (
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF0000' }} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}


