import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme/theme';

import { ArrowLeft, BarChart2, Check, Plus, RefreshCw, RotateCw, Trash2, X } from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Board {
  id: string; // A, B, C, D, E, F
  numbers: string[];
}

export default function GameLayoutAScreen({ route, navigation }: any) {
  const { gameId, initialTab } = route.params;
  const addToCart = useAppStore((state) => state.addToCart);
  const insets = useSafeAreaInsets();

  // Keno Specific States
  const [kenoTab, setKenoTab] = useState<'basic' | 'bao' | 'cl_ln'>(
    initialTab || (gameId === 'bao_keno' ? 'bao' : gameId === 'clln_keno' ? 'cl_ln' : 'basic')
  );
  const [kenoBac, setKenoBac] = useState<number>(2); // Default Bậc 2
  const [kenoBoards, setKenoBoards] = useState<Board[]>([
    { id: 'A', numbers: [] },
    { id: 'B', numbers: [] },
    { id: 'C', numbers: [] },
    { id: 'D', numbers: [] },
    { id: 'E', numbers: [] },
    { id: 'F', numbers: [] },
  ]);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [tempSelectedNumbers, setTempSelectedNumbers] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Bao Keno States
  const [baoType, setBaoType] = useState<number>(3); // Default Bao 3
  const [baoBac, setBaoBac] = useState<number>(2); // Default Bậc 2
  const [baoNumbers, setBaoNumbers] = useState<string[]>([]);
  const [isBaoTypePickerVisible, setIsBaoTypePickerVisible] = useState(false);
  const [isBaoBacPickerVisible, setIsBaoBacPickerVisible] = useState(false);

  // CL - LN State
  const [clLnBoards, setClLnBoards] = useState<Array<{ id: string; type: 'ln' | 'cl'; selection: string | null }>>([
    { id: 'A', type: 'ln', selection: null },
    { id: 'B', type: 'ln', selection: null },
    { id: 'C', type: 'cl', selection: null },
    { id: 'D', type: 'cl', selection: null },
  ]);

  // Draw Cycles State
  const [isDrawPickerVisible, setIsDrawPickerVisible] = useState(false);
  const [selectedDraws, setSelectedDraws] = useState<string[]>(['#287264']);
  const [tempSelectedDraws, setTempSelectedDraws] = useState<string[]>(['#287264']);

  const [drawCycles, setDrawCycles] = useState<any[]>([]);
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

  // General Game configurations
  const isLottoGame = gameId === 'lotto_535' || gameId === 'lotto_570';
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
    gameName = 'XỔ SỐ THỦ ĐÔ';
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

  // Loto Cap States
  const [lotoCapPlayType, setLotoCapPlayType] = useState<string>('Lô tô 2 cặp');

  // Truot Loto States
  const [truotLotoPlayType, setTruotLotoPlayType] = useState<string>('Trượt 4');

  // Dientoan 636 States
  const [dientoan636PlayType, setDientoan636PlayType] = useState<string>(
    initialTab === 'Bao 6x36' ? 'Bao 6x36' : 'Cơ bản'
  );
  const [dientoan636BaoType, setDientoan636BaoType] = useState<number>(7);

  // Than Tai 4 States
  const [thanTaiPlayType, setThanTaiPlayType] = useState<string>('Thần tài 4');

  const standardDrawCycles = drawCycles;

  const handleStandardPlayTypeChange = (type: string) => {
    setStandardPlayType(type);
    setIsBaoDropdownOpen(false);
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
    if (standardBoards.length >= 10) {
      Alert.alert('Thông báo', 'Tối đa 10 dãy số.');
      return;
    }
    const nextId = String.fromCharCode(65 + standardBoards.length);
    setStandardBoards([
      ...standardBoards,
      { id: nextId, numbers: [], specialNumbers: [], isTC: false, multiplier: 10000 }
    ]);
  };

  const handleSelectMultiplier = (index: number) => {
    Alert.alert('Chọn mệnh giá', 'Vui lòng chọn mức tiền cho dãy này:', [
      {
        text: '10K',
        onPress: () => {
          const updated = [...standardBoards];
          updated[index].multiplier = 10000;
          setStandardBoards(updated);
        }
      },
      {
        text: '20K',
        onPress: () => {
          const updated = [...standardBoards];
          updated[index].multiplier = 20000;
          setStandardBoards(updated);
        }
      },
      {
        text: '30K',
        onPress: () => {
          const updated = [...standardBoards];
          updated[index].multiplier = 30000;
          setStandardBoards(updated);
        }
      },
      {
        text: '50K',
        onPress: () => {
          const updated = [...standardBoards];
          updated[index].multiplier = 50000;
          setStandardBoards(updated);
        }
      },
      {
        text: '100K',
        onPress: () => {
          const updated = [...standardBoards];
          updated[index].multiplier = 100000;
          setStandardBoards(updated);
        }
      },
    ]);
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
    if (gameId === 'max_3d' || gameId === 'max_4d') {
      return standardBoards
        .filter((b) => b.numbers.length > 0 || b.isTC)
        .reduce((sum, b) => sum + (b.multiplier || 10000), 0);
    }
    return getActiveBoardsCount() * getCostPerBoard(standardPlayType);
  };

  const handleOpenStandardBoardModal = (index: number) => {
    setActiveBoardIndex(index);
    const boardToEdit = standardBoards[index];

    if (gameId === 'max_3d' || gameId === 'max_4d' || gameId === 'than_tai_4' || gameId === 'loto_235') {
      const reqCount = gameId === 'than_tai_4' ? (thanTaiPlayType === 'Thần tài 4' ? 4 : 6) : gameId === 'loto_235' ? getLoto235RequiredCount(loto235PlayType) : getRequiredNumbersCount(standardPlayType);
      const initialSlots = Array(reqCount).fill('');
      if (boardToEdit && boardToEdit.numbers.length === reqCount) {
        for (let i = 0; i < reqCount; i++) {
          initialSlots[i] = boardToEdit.numbers[i];
        }
      }
      setTempMax3dSlots(initialSlots);
      setActiveSlotIndex(0);
    } else {
      setTempStandardNumbers(boardToEdit ? [...boardToEdit.numbers] : []);
      if (isLottoGame) {
        setTempLottoSpecialNumbers(boardToEdit && boardToEdit.specialNumbers ? [...boardToEdit.specialNumbers] : []);
      }
    }
    setIsStandardNumberModalVisible(true);
  };

  const toggleStandardModalNumber = (numStr: string) => {
    const reqCount = gameId === 'loto_cap' ? getLotoCapRequiredCount(lotoCapPlayType) : gameId === 'truot_loto' ? getTruotLotoRequiredCount(truotLotoPlayType) : getRequiredNumbersCount(standardPlayType);
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
    const reqCount = gameId === 'loto_cap' ? getLotoCapRequiredCount(lotoCapPlayType) : gameId === 'truot_loto' ? getTruotLotoRequiredCount(truotLotoPlayType) : getRequiredNumbersCount(standardPlayType);
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
    const reqCount = gameId === 'loto_cap' ? getLotoCapRequiredCount(lotoCapPlayType) : gameId === 'truot_loto' ? getTruotLotoRequiredCount(truotLotoPlayType) : getRequiredNumbersCount(standardPlayType);
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
      Alert.alert('Lỗi', 'Vui lòng chọn số hoặc tự chọn cho ít nhất 1 dãy.');
      return;
    }

    const reqCount = getRequiredNumbersCount(standardPlayType);
    const invalidBoard = activeBoards.find((b) => !b.isTC && b.numbers.length !== reqCount);
    if (invalidBoard) {
      Alert.alert('Lỗi', `Dãy ${invalidBoard.id} chưa được chọn đủ ${reqCount} số.`);
      return;
    }

    navigation.navigate('GamePayment', {
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
      Alert.alert('Lỗi', 'Vui lòng chọn số hoặc tự chọn cho ít nhất 1 dãy.');
      return;
    }

    const { main: reqMain, special: reqSpecial } = getLottoRequiredCounts();
    const invalidBoard = activeBoards.find((b) => !b.isTC && (b.numbers.length !== reqMain || !b.specialNumbers || b.specialNumbers.length !== reqSpecial));
    if (invalidBoard) {
      Alert.alert('Lỗi', `Dãy ${invalidBoard.id} chưa chọn đủ số chính hoặc số đặc biệt.`);
      return;
    }

    let displayPlayType = lottoPlayType;
    if (lottoPlayType === 'Bao số chính') displayPlayType = `Bao số chính (Bao ${lottoMainBao})`;
    if (lottoPlayType === 'Bao số đặc biệt') displayPlayType = `Bao số đặc biệt (Bao ${lottoSpecialBao})`;

    navigation.navigate('GamePayment', {
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

  const getDientoan636TotalCost = () => {
    if (dientoan636PlayType === 'Cơ bản') {
      const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
      return activeBoards.length * 5000;
    } else {
      const boardA = standardBoards[0];
      const comb = getDientoan636CombinationsCount(dientoan636BaoType, boardA.numbers.length);
      return comb * 5000;
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
        Alert.alert('Lỗi', 'Vui lòng chọn số cho ít nhất 1 dãy.');
        return;
      }
      const invalidBoard = activeBoards.find((b) => b.numbers.length !== 6);
      if (invalidBoard) {
        Alert.alert('Lỗi', `Dãy ${invalidBoard.id} chưa chọn đủ 6 số.`);
        return;
      }
      navigation.navigate('GamePayment', {
        gameId,
        gameName,
        playType: dientoan636PlayType,
        drawIds: selectedDraws,
        boards: activeBoards.map(b => ({
          id: b.id,
          isTC: false,
          numbers: b.numbers,
          cost: 5000
        })),
        totalCost: getDientoan636TotalCost()
      });
    } else {
      const boardA = standardBoards[0];
      if (boardA.numbers.length < dientoan636BaoType) {
        Alert.alert('Lỗi', `Vui lòng chọn đủ ${dientoan636BaoType} số cho Bao ${dientoan636BaoType}.`);
        return;
      }
      const comb = getDientoan636CombinationsCount(dientoan636BaoType, boardA.numbers.length);
      navigation.navigate('GamePayment', {
        gameId,
        gameName,
        playType: `Bao ${dientoan636BaoType}`,
        drawIds: selectedDraws,
        boards: [{
          id: 'A',
          isTC: false,
          numbers: boardA.numbers,
          cost: comb * 5000
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
      Alert.alert('Lỗi', 'Vui lòng chọn số cho ít nhất 1 dãy.');
      return;
    }
    const reqCount = thanTaiPlayType === 'Thần tài 4' ? 4 : 6;
    const invalidBoard = activeBoards.find((b) => b.numbers.length !== reqCount);
    if (invalidBoard) {
      Alert.alert('Lỗi', `Dãy ${invalidBoard.id} chưa chọn đủ số.`);
      return;
    }
    navigation.navigate('GamePayment', {
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
    const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
    return activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000), 0);
  };

  const handleLotoCapCheckout = () => {
    const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
    if (activeBoards.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn số cho ít nhất 1 dãy.');
      return;
    }

    const reqCount = gameId === 'truot_loto' ? getTruotLotoRequiredCount(truotLotoPlayType) : getLotoCapRequiredCount(lotoCapPlayType);
    const invalidBoard = activeBoards.find((b) => b.numbers.length !== reqCount);
    if (invalidBoard) {
      Alert.alert('Lỗi', `Dãy ${invalidBoard.id} chưa chọn đủ ${reqCount} cặp.`);
      return;
    }

    navigation.navigate('GamePayment', {
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
    if (loto235PlayType === 'Bao 2 số') {
      let count = loto235Bao2Numbers.length;
      if (loto235Bao2Filter === 'ĐẦU' || loto235Bao2Filter === 'ĐUÔI') {
        count = count * 10;
      }
      return count * (loto235Bao2Multiplier || 10000);
    }
    const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
    let capNhan = 4;
    if (loto235PlayType === 'Lô tô 5 số') capNhan = 27;
    return activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000) * capNhan, 0);
  };

  const getEstimatedWinInfo = () => {
    let multiplier = 0;
    if (isLoto235) {
      if (loto235PlayType === 'Lô tô 2 số' || loto235PlayType === 'Bao 2 số') multiplier = 90;
      else if (loto235PlayType === 'Lô tô 3 số') multiplier = 900;
      else if (loto235PlayType === 'Lô tô 5 số') multiplier = 8000;
    } else if (isLotoCap) {
      if (lotoCapPlayType === 'Lô tô 2 cặp') multiplier = 15;
      else if (lotoCapPlayType === 'Lô tô 3 cặp') multiplier = 65;
      else if (lotoCapPlayType === 'Lô tô 4 cặp') multiplier = 170;
    }

    if (isDientoan636) {
      const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
      let totalCost = getDientoan636TotalCost();
      if (totalCost === 0) return null;
      // Trúng 6 số (100,000 * multiplier)
      let estimatedWin = 500000000;
      if (dientoan636PlayType !== 'Cơ bản') {
        // Tính the win potential for Bao based on hitting all 6 numbers.
        // If a player hits 6 numbers with Bao, their prize is complex, but usually max is displayed.
        // In standard ticket, base win is 500M. The UI image shows Max win for Bao is also 500,000,000.
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
        // Max prize is x10,000 for winning exact 4 digits
        estimatedWin = baseCostSum * 10000;
      } else if (thanTaiPlayType === 'Điện toán 1-2-3') {
        const baseCostSum = activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000), 0);
        // Max prize is x1000 + x75 + x5 = x1080 (if all 3 parts win max)
        estimatedWin = baseCostSum * 1080;
      }
      return { multiplier: 1, totalCost, estimatedWin };
    }

    if (!multiplier) return null;

    // For normal loto235, the estimated win is the base ticket price (e.g. 10000) * multiplier
    // not the total cost (which includes capNhan). So we extract the base cost.
    let estimatedWin = 0;
    let totalCost = 0;
    if (isLoto235) {
      if (loto235PlayType === 'Bao 2 số') {
        const count = loto235Bao2Numbers.length * (loto235Bao2Filter === 'ĐẦU' || loto235Bao2Filter === 'ĐUÔI' ? 10 : 1);
        totalCost = count * (loto235Bao2Multiplier || 10000);
        estimatedWin = (loto235Bao2Multiplier || 10000) * multiplier * count; // each hit wins multiplier * base
      } else {
        const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
        totalCost = getLoto235TotalCost();
        // Assume maximum potential win (hitting all positions is unlikely, but UI shows multiplier * base cost)
        const baseCostSum = activeBoards.reduce((sum, b) => sum + (b.multiplier || 10000), 0);
        estimatedWin = baseCostSum * multiplier;
      }
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
        Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 bộ số.');
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

      navigation.navigate('GamePayment', {
        gameId,
        gameName,
        playType: `Bao 2 số (${loto235Bao2Filter})`,
        drawIds: selectedDraws,
        boards: [{
          id: 'A',
          isTC: false,
          numbers: finalNumbers,
          cost: loto235Bao2Multiplier || 10000
        }],
        totalCost: getLoto235TotalCost()
      });
      return;
    }

    const activeBoards = standardBoards.slice(0, 5).filter((b) => b.numbers.length > 0);
    if (activeBoards.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn số cho ít nhất 1 dãy.');
      return;
    }

    const reqCount = getLoto235RequiredCount(loto235PlayType);
    const invalidBoard = activeBoards.find((b) => b.numbers.length !== reqCount);
    if (invalidBoard) {
      Alert.alert('Lỗi', `Dãy ${invalidBoard.id} chưa được điền đầy đủ các ô số.`);
      return;
    }

    navigation.navigate('GamePayment', {
      gameId,
      gameName,
      playType: loto235PlayType,
      drawIds: selectedDraws,
      boards: activeBoards.map(b => ({
        id: b.id,
        isTC: false,
        numbers: b.numbers,
        cost: b.multiplier || 10000
      })),
      totalCost: getLoto235TotalCost()
    });
  };

  useEffect(() => {
    if (gameId === 'loto_235' && loto235PlayType === 'Bao 2 số') {
      applyLoto235Bao2Filter(loto235Bao2Filter);
    }
  }, [loto235PlayType, loto235Bao2Filter]);

  // Fetch real countdown and draw cycles from API
  useEffect(() => {
    const fetchActiveDraw = async () => {
      try {
        const res = await api.get('/draws/active');
        const draws = res.data;
        // Map UI gameId to backend game code
        let mappedGameCode = gameId;
        if (gameId === 'bao_keno' || gameId === 'clln_keno') mappedGameCode = 'keno';

        // Find all active draws for this game
        const activeDrawsForGame = draws.filter((d: any) => d.game && d.game.code === mappedGameCode);

        if (activeDrawsForGame.length > 0) {
          const formattedDraws = activeDrawsForGame.map((d: any) => {
            const closeTime = new Date(d.closeTime);
            const day = String(closeTime.getDate()).padStart(2, '0');
            const month = String(closeTime.getMonth() + 1).padStart(2, '0');
            const year = closeTime.getFullYear();
            const hrs = String(closeTime.getHours()).padStart(2, '0');
            const mins = String(closeTime.getMinutes()).padStart(2, '0');
            const secs = String(closeTime.getSeconds()).padStart(2, '0');

            return {
              id: d._id,
              drawCode: d.drawCode,
              label: `${d.drawCode} - ${day}/${month}/${year} ${hrs}:${mins}:${secs}`,
              timeStr: `${hrs}:${mins}:${secs}`,
              dateStr: `${day}/${month}`
            };
          });

          setDrawCycles(formattedDraws);

          // Select the first active draw by default
          if (formattedDraws.length > 0) {
            setSelectedDraws([formattedDraws[0].id]);
            setTempSelectedDraws([formattedDraws[0].id]);
          }

          const activeDraw = activeDrawsForGame[0];
          if (activeDraw && activeDraw.closeTime) {
            const closeTimeMs = new Date(activeDraw.closeTime).getTime();
            const nowMs = Date.now();
            const diffSecs = Math.max(0, Math.floor((closeTimeMs - nowMs) / 1000));
            setCountdown(diffSecs);
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin kỳ quay:', error);
      }
    };
    fetchActiveDraw();
  }, [gameId]);

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : initialCountdown));
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

  // Keno Mode: auto select a board
  const autoSelectBoard = (boardId: string, count: number) => {
    const numbers: string[] = [];
    while (numbers.length < count) {
      const rand = Math.floor(Math.random() * 80) + 1;
      const randStr = String(rand).padStart(2, '0');
      if (!numbers.includes(randStr)) {
        numbers.push(randStr);
      }
    }
    setKenoBoards((prev) =>
      prev.map((b) => (b.id === boardId ? { ...b, numbers: numbers.sort() } : b))
    );
  };

  // Keno Mode: auto select all empty boards
  const autoSelectAllBoards = () => {
    setKenoBoards((prev) =>
      prev.map((b) => {
        const numbers: string[] = [];
        while (numbers.length < kenoBac) {
          const rand = Math.floor(Math.random() * 80) + 1;
          const randStr = String(rand).padStart(2, '0');
          if (!numbers.includes(randStr)) {
            numbers.push(randStr);
          }
        }
        return { ...b, numbers: numbers.sort() };
      })
    );
  };

  const handleOpenBoardModal = (boardId: string) => {
    setActiveBoardId(boardId);
    const board = kenoBoards.find((b) => b.id === boardId);
    setTempSelectedNumbers(board ? [...board.numbers] : []);
    setIsModalVisible(true);
  };

  const toggleModalNumber = (numStr: string) => {
    const requiredCount = activeBoardId === 'BAO' ? baoType : kenoBac;
    if (tempSelectedNumbers.includes(numStr)) {
      setTempSelectedNumbers(tempSelectedNumbers.filter((n) => n !== numStr));
    } else {
      if (tempSelectedNumbers.length >= requiredCount) {
        Alert.alert('Thông báo', `Bạn chỉ được chọn tối đa ${requiredCount} số.`);
        return;
      }
      setTempSelectedNumbers([...tempSelectedNumbers, numStr].sort());
    }
  };

  const confirmModalNumbers = () => {
    const requiredCount = activeBoardId === 'BAO' ? baoType : kenoBac;
    if (tempSelectedNumbers.length !== requiredCount) {
      Alert.alert('Thông báo', `Vui lòng chọn đủ ${requiredCount} số.`);
      return;
    }
    if (activeBoardId === 'BAO') {
      setBaoNumbers(tempSelectedNumbers);
    } else {
      setKenoBoards((prev) =>
        prev.map((b) => (b.id === activeBoardId ? { ...b, numbers: tempSelectedNumbers } : b))
      );
    }
    setIsModalVisible(false);
  };

  const modalAutoSelect = () => {
    const requiredCount = activeBoardId === 'BAO' ? baoType : kenoBac;
    const numbers: string[] = [];
    while (numbers.length < requiredCount) {
      const rand = Math.floor(Math.random() * 80) + 1;
      const randStr = String(rand).padStart(2, '0');
      if (!numbers.includes(randStr)) {
        numbers.push(randStr);
      }
    }
    setTempSelectedNumbers(numbers.sort());
  };

  const handleKenoCheckout = () => {
    const activeBoards = kenoBoards.filter((b) => b.numbers.length === kenoBac);
    if (activeBoards.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn số cho ít nhất 1 bảng.');
      return;
    }

    const drawCount = selectedDraws.length || 1;
    const totalCost = activeBoards.length * 10000 * drawCount;

    navigation.navigate('GamePayment', {
      gameId: 'keno',
      gameName: 'KENO',
      playType: `Bậc ${kenoBac} (${drawCount} kỳ)`,
      drawIds: selectedDraws,
      boards: activeBoards.map(board => ({
        id: board.id,
        isTC: false,
        numbers: board.numbers,
        cost: 10000 * drawCount
      })),
      totalCost
    });
  };

  // Bao Keno Helpers & Checkouts
  const getCombinationsCount = (n: number, k: number): number => {
    if (k > n) return 0;
    if (k === n || k === 0) return 1;
    let res = 1;
    for (let i = 1; i <= k; i++) {
      res = res * (n - i + 1) / i;
    }
    return Math.round(res);
  };

  const getCombinations = (array: string[], k: number): string[][] => {
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

  const autoSelectBaoNumbers = () => {
    const numbers: string[] = [];
    while (numbers.length < baoType) {
      const rand = Math.floor(Math.random() * 80) + 1;
      const randStr = String(rand).padStart(2, '0');
      if (!numbers.includes(randStr)) {
        numbers.push(randStr);
      }
    }
    setBaoNumbers(numbers.sort());
  };

  const handleOpenBaoModal = () => {
    setActiveBoardId('BAO');
    setTempSelectedNumbers([...baoNumbers]);
    setIsModalVisible(true);
  };

  const handleBaoCheckout = () => {
    if (baoNumbers.length !== baoType) {
      Alert.alert('Lỗi', `Vui lòng chọn đủ ${baoType} số cho Bao này.`);
      return;
    }

    const combinationsList = getCombinations(baoNumbers, baoBac);
    const drawCount = selectedDraws.length || 1;
    const cost = combinationsList.length * 10000 * drawCount;

    navigation.navigate('GamePayment', {
      gameId: 'keno',
      gameName: 'KENO',
      playType: `Bao ${baoType} - Bậc ${baoBac} (${drawCount} kỳ)`,
      drawIds: selectedDraws,
      boards: combinationsList.map((combo, idx) => ({
        id: `B${idx + 1}`,
        isTC: false,
        numbers: combo,
        cost: 10000 * drawCount
      })),
      totalCost: cost
    });
  };

  // CL - LN Checkout
  const autoSelectClLnBoard = (boardId: string) => {
    setClLnBoards((prev) =>
      prev.map((b) => {
        if (b.id === boardId) {
          const options = b.type === 'ln'
            ? ['Lớn', 'Hòa LN', 'Nhỏ']
            : ['Chẵn', 'Hòa CL', 'Lẻ', 'Chẵn 11-12', 'Lẻ 11-12'];
          const randomOpt = options[Math.floor(Math.random() * options.length)];
          return { ...b, selection: randomOpt };
        }
        return b;
      })
    );
  };

  const autoSelectAllClLnBoards = () => {
    setClLnBoards((prev) =>
      prev.map((b) => {
        const options = b.type === 'ln'
          ? ['Lớn', 'Hòa LN', 'Nhỏ']
          : ['Chẵn', 'Hòa CL', 'Lẻ', 'Chẵn 11-12', 'Lẻ 11-12'];
        const randomOpt = options[Math.floor(Math.random() * options.length)];
        return { ...b, selection: randomOpt };
      })
    );
  };

  const addClLnBoard = () => {
    if (clLnBoards.length >= 6) {
      Alert.alert('Thông báo', 'Tối đa 6 dãy số.');
      return;
    }
    const nextId = String.fromCharCode(65 + clLnBoards.length); // A, B, C, D -> E -> F
    const type = clLnBoards.length % 2 === 0 ? 'ln' : 'cl';
    setClLnBoards((prev) => [...prev, { id: nextId, type, selection: null }]);
  };

  const handleClLnCheckout = () => {
    const activeBoards = clLnBoards.filter((b) => b.selection !== null);
    if (activeBoards.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất 1 cửa đặt.');
      return;
    }

    const drawCount = selectedDraws.length || 1;
    const totalCost = activeBoards.length * 10000 * drawCount;

    navigation.navigate('GamePayment', {
      gameId: 'clln_keno',
      gameName: 'KENO - CL/LN',
      playType: `Chẵn Lẻ / Lớn Nhỏ (${drawCount} kỳ)`,
      drawIds: selectedDraws,
      boards: activeBoards.map(board => ({
        id: board.id,
        isTC: false,
        numbers: [board.selection!],
        cost: 10000 * drawCount
      })),
      totalCost
    });
  };

  // Standard Matrix Functions
  const handleSelectNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= requiredSelectCount) {
        Alert.alert('Thông báo', `Bạn chỉ được chọn tối đa ${requiredSelectCount} số.`);
        return;
      }
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleAutoSelect = () => {
    const numbers: number[] = [];
    while (numbers.length < requiredSelectCount) {
      const rand = Math.floor(Math.random() * maxNumber) + 1;
      if (!numbers.includes(rand)) {
        numbers.push(rand);
      }
    }
    setSelectedNumbers(numbers.sort((a, b) => a - b));
  };

  const handleAddToCart = () => {
    if (selectedNumbers.length !== requiredSelectCount) {
      Alert.alert('Lỗi', `Vui lòng chọn đúng ${requiredSelectCount} số.`);
      return;
    }

    const formattedNumbers = selectedNumbers.map((n) => String(n).padStart(2, '0'));

    navigation.navigate('GamePayment', {
      gameId,
      gameName,
      playType: 'Vé thường',
      drawIds: selectedDraws,
      boards: [{
        id: 'A',
        isTC: false,
        numbers: formattedNumbers,
        cost: 10000
      }],
      totalCost: 10000
    });
  };

  // Reset Keno Boards when Level changes
  const handleBacChange = (val: number) => {
    setKenoBac(val);
    setKenoBoards([
      { id: 'A', numbers: [] },
      { id: 'B', numbers: [] },
      { id: 'C', numbers: [] },
      { id: 'D', numbers: [] },
      { id: 'E', numbers: [] },
      { id: 'F', numbers: [] },
    ]);
  };

  const activeKenoBoardsCount = kenoBoards.filter((b) => b.numbers.length === kenoBac).length;
  const totalCost = activeKenoBoardsCount * 10000 * (selectedDraws.length || 1);

  const handleAddKenoBoard = () => {
    if (kenoBoards.length >= 10) {
      Alert.alert('Thông báo', 'Tối đa 10 dãy số.');
      return;
    }
    const nextId = String.fromCharCode(65 + kenoBoards.length);
    setKenoBoards([
      ...kenoBoards,
      { id: nextId, numbers: [] }
    ]);
  };

  if (gameId === 'keno') {
    return (
      <View style={styles.container}>
        {/* Custom Header */}
        <View style={[styles.customHeader, { paddingTop: insets.top, height: 56 + insets.top }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#0F2942" />
          </TouchableOpacity>
          <Text style={styles.customHeaderTitle}>KENO</Text>
          <View style={styles.infoBtn} />
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, kenoTab === 'basic' && styles.tabItemActive]}
            onPress={() => setKenoTab('basic')}
          >
            <Text style={[styles.tabText, kenoTab === 'basic' && styles.tabTextActive]}>Cơ bản</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, kenoTab === 'bao' && styles.tabItemActive]}
            onPress={() => setKenoTab('bao')}
          >
            <Text style={[styles.tabText, kenoTab === 'bao' && styles.tabTextActive]}>Bao Keno</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, kenoTab === 'cl_ln' && styles.tabItemActive]}
            onPress={() => setKenoTab('cl_ln')}
          >
            <Text style={[styles.tabText, kenoTab === 'cl_ln' && styles.tabTextActive]}>Chẵn Lẻ - Lớn Nhỏ</Text>
          </TouchableOpacity>
        </View>

        {kenoTab === 'basic' ? (
          <>
            {/* Level ("Bậc") Selector Grid */}
            <View style={styles.bacSelectorContainer}>
              <View style={styles.bacGrid}>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.bacBtn, kenoBac === val && styles.bacBtnActive]}
                    onPress={() => handleBacChange(val)}
                  >
                    <Text style={[styles.bacBtnText, kenoBac === val && styles.bacBtnTextActive]}>
                      Bậc {val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Draw Information Bar */}
            <View style={styles.drawInfoBarContainer}>
              <TouchableOpacity style={styles.drawBox} onPress={handleOpenDrawPicker}>
                <Text style={styles.drawLabel}>Kỳ quay:</Text>
                <Text style={styles.drawCycleRed}>{(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.drawCode || 'Đang tải...'} - {(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.timeStr || ''}</Text>
                <Text style={styles.drawTime}>
                  {selectedDraws.length > 1 ? `+${selectedDraws.length - 1} kỳ` : `${formatTime(countdown)} ▼`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chartBtn} onPress={handleStatsPress}>
                <BarChart2 size={18} color="#00A859" />
              </TouchableOpacity>
            </View>

            {/* Boards List */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.boardsContent}>
              {kenoBoards.map((board) => {
                const hasNumbers = board.numbers.length === kenoBac;

                // Calculate dynamic sizing for circles based on Bậc selection
                const isLargeBac = kenoBac > 5;
                const ballSize = isLargeBac ? (kenoBac > 7 ? 26 : 30) : 36;
                const ballGap = isLargeBac ? (kenoBac > 7 ? 4 : 6) : 8;
                const ballFontSize = isLargeBac ? (kenoBac > 7 ? 10 : 12) : 13;

                return (
                  <View key={board.id} style={styles.boardRow}>
                    {/* Board Letter */}
                    <Text style={styles.boardLetter}>{board.id}</Text>

                    {/* Empty or filled circles */}
                    <TouchableOpacity
                      style={[styles.circlesContainer, { gap: ballGap }]}
                      onPress={() => handleOpenBoardModal(board.id)}
                    >
                      {Array.from({ length: kenoBac }).map((_, idx) => {
                        const num = board.numbers[idx];
                        return (
                          <View
                            key={idx}
                            style={[
                              styles.circleBall,
                              { width: ballSize, height: ballSize, borderRadius: ballSize / 2 },
                              num !== undefined && styles.circleBallFilled
                            ]}
                          >
                            <Text style={[
                              styles.circleBallText,
                              { fontSize: ballFontSize },
                              num !== undefined && styles.circleBallTextFilled
                            ]}>
                              {num !== undefined ? num : ''}
                            </Text>
                          </View>
                        );
                      })}
                    </TouchableOpacity>

                    {/* Refresh Auto-select & Price */}
                    <View style={styles.boardControls}>
                      <TouchableOpacity
                        style={styles.refreshBtn}
                        onPress={() => autoSelectBoard(board.id, kenoBac)}
                      >
                        <RefreshCw size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.pricePill}>
                        <Text style={styles.pricePillText}>10K</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Bottom Actions */}
            <View style={[styles.footerContainer, { paddingBottom: 12 + insets.bottom }]}>
              <View style={styles.footerButtons}>
                <TouchableOpacity style={styles.pillActionBtn} onPress={autoSelectAllBoards}>
                  <RefreshCw size={14} color="#007AFF" />
                  <Text style={styles.pillActionBtnText}>Chọn nhanh</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pillActionBtn} onPress={autoSelectAllBoards}>
                  <RotateCw size={14} color="#007AFF" />
                  <Text style={styles.pillActionBtnText}>TC</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pillActionBtn} onPress={handleAddKenoBoard}>
                  <Plus size={14} color="#FF6F00" />
                  <Text style={[styles.pillActionBtnText, { color: '#FF6F00' }]}>Thêm dãy số</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tạm tính:</Text>
                <Text style={styles.totalValue}>{totalCost.toLocaleString('vi-VN')} VNĐ</Text>
              </View>

              <TouchableOpacity style={styles.checkoutBtn} onPress={handleKenoCheckout}>
                <Text style={styles.checkoutBtnText}>Đặt vé</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : kenoTab === 'bao' ? (
          <>
            {/* Dropdowns selectors Row */}
            <View style={styles.dropdownsRow}>
              {/* Dropdown 1: Loại bao */}
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setIsBaoTypePickerVisible(true)}
              >
                <Text style={styles.dropdownLabel}>Loại bao: <Text style={styles.dropdownValue}>Bao {baoType}</Text></Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              {/* Dropdown 2: Bậc chơi */}
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setIsBaoBacPickerVisible(true)}
              >
                <Text style={styles.dropdownLabel}>Bậc chơi: <Text style={styles.dropdownValue}>Bậc {baoBac}</Text></Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Draw Information Bar */}
            <View style={styles.drawInfoBarContainer}>
              <TouchableOpacity style={styles.drawBox} onPress={handleOpenDrawPicker}>
                <Text style={styles.drawLabel}>Kỳ quay:</Text>
                <Text style={styles.drawCycleRed}>{(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.drawCode || 'Đang tải...'} - {(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.timeStr || ''}</Text>
                <Text style={styles.drawTime}>
                  {selectedDraws.length > 1 ? `+${selectedDraws.length - 1} kỳ` : `${formatTime(countdown)} ▼`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chartBtn} onPress={handleStatsPress}>
                <BarChart2 size={18} color="#00A859" />
              </TouchableOpacity>
            </View>

            {/* Selection Section */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.boardsContent}>
              <Text style={styles.sectionHeading}>Chọn số:</Text>

              <View style={styles.boardRow}>
                {/* Board Letter */}
                <Text style={styles.boardLetter}>A</Text>

                {/* Empty or filled circles */}
                <TouchableOpacity
                  style={[styles.circlesContainer, { gap: 8 }]}
                  onPress={handleOpenBaoModal}
                >
                  {Array.from({ length: baoType }).map((_, idx) => {
                    const num = baoNumbers[idx];
                    const ballSize = 32;
                    const ballFontSize = 12;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.circleBall,
                          { width: ballSize, height: ballSize, borderRadius: ballSize / 2 },
                          num !== undefined && styles.circleBallFilled
                        ]}
                      >
                        <Text style={[
                          styles.circleBallText,
                          { fontSize: ballFontSize },
                          num !== undefined && styles.circleBallTextFilled
                        ]}>
                          {num !== undefined ? num : ''}
                        </Text>
                      </View>
                    );
                  })}
                </TouchableOpacity>

                {/* Trash & Price Controls */}
                <View style={styles.boardControls}>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={() => setBaoNumbers([])}
                  >
                    <Trash2 size={18} color="#0084FA" />
                  </TouchableOpacity>
                  <View style={styles.pricePill}>
                    <Text style={styles.pricePillText}>10K</Text>
                  </View>
                </View>
              </View>

              {/* Generated combinations display */}
              {baoNumbers.length === baoType && (
                <View style={styles.generatedCombosContainer}>
                  <Text style={styles.generatedTitle}>Bộ số được tạo({getCombinations(baoNumbers, baoBac).length})</Text>
                  <View style={styles.combosList}>
                    {getCombinations(baoNumbers, baoBac).slice(0, 50).map((combo, idx) => (
                      <Text key={idx} style={styles.comboText}>
                        {combo.join(' ')}
                      </Text>
                    ))}
                    {getCombinations(baoNumbers, baoBac).length > 50 && (
                      <Text style={[styles.comboText, { fontStyle: 'italic', color: '#7F8E9C' }]}>
                        ... và {getCombinations(baoNumbers, baoBac).length - 50} bộ số khác
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Bottom Actions for Bao */}
            <View style={[styles.footerContainer, { paddingBottom: 12 + insets.bottom }]}>
              <View style={styles.footerButtons}>
                <TouchableOpacity
                  style={styles.singlePillActionBtn}
                  onPress={autoSelectBaoNumbers}
                >
                  <RefreshCw size={14} color="#007AFF" />
                  <Text style={styles.pillActionBtnText}>Chọn nhanh</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tạm tính:</Text>
                <Text style={styles.totalValue}>
                  {((baoNumbers.length === baoType ? getCombinationsCount(baoType, baoBac) : 0) * 10000 * (selectedDraws.length || 1)).toLocaleString('vi-VN')} VNĐ
                </Text>
              </View>

              <TouchableOpacity style={styles.checkoutBtn} onPress={handleBaoCheckout}>
                <Text style={styles.checkoutBtnText}>Đặt vé</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {/* CL - LN Layout */}
            <View style={styles.drawInfoBarContainer}>
              <TouchableOpacity style={styles.drawBox} onPress={handleOpenDrawPicker}>
                <Text style={styles.drawLabel}>Kỳ quay:</Text>
                <Text style={styles.drawCycleRed}>{(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.drawCode || 'Đang tải...'} - {(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.timeStr || ''}</Text>
                <Text style={styles.drawTime}>
                  {selectedDraws.length > 1 ? `+${selectedDraws.length - 1} kỳ` : `${formatTime(countdown)} ▼`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chartBtn} onPress={handleStatsPress}>
                <BarChart2 size={18} color="#00A859" />
              </TouchableOpacity>
            </View>

            {/* CLLN Boards List */}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.boardsContent}>
              {clLnBoards.map((board) => {
                const isLN = board.type === 'ln';
                return (
                  <View key={board.id} style={styles.clLnBoardRow}>
                    {/* Board Letter */}
                    <Text style={styles.boardLetter}>{board.id}</Text>

                    {/* Options list */}
                    <View style={styles.clLnOptionsContainer}>
                      {isLN ? (
                        <View style={styles.clLnOptionsSubRow}>
                          {['Lớn', 'Hòa LN', 'Nhỏ'].map((opt) => {
                            const isSelected = board.selection === opt;
                            return (
                              <TouchableOpacity
                                key={opt}
                                style={[
                                  styles.clLnPillBtn,
                                  isSelected && styles.clLnPillBtnActive
                                ]}
                                onPress={() => {
                                  setClLnBoards((prev) =>
                                    prev.map((b) =>
                                      b.id === board.id
                                        ? { ...b, selection: isSelected ? null : opt }
                                        : b
                                    )
                                  );
                                }}
                              >
                                <Text
                                  style={[
                                    styles.clLnPillBtnText,
                                    isSelected && styles.clLnPillBtnTextActive,
                                  ]}
                                >
                                  {opt}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ) : (
                        <View style={styles.clLnOptionsGrid}>
                          <View style={styles.clLnOptionsSubRow}>
                            {['Chẵn', 'Hòa CL', 'Lẻ'].map((opt) => {
                              const isSelected = board.selection === opt;
                              return (
                                <TouchableOpacity
                                  key={opt}
                                  style={[
                                    styles.clLnPillBtn,
                                    isSelected && styles.clLnPillBtnActive
                                  ]}
                                  onPress={() => {
                                    setClLnBoards((prev) =>
                                      prev.map((b) =>
                                        b.id === board.id
                                          ? { ...b, selection: isSelected ? null : opt }
                                          : b
                                      )
                                    );
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.clLnPillBtnText,
                                      isSelected && styles.clLnPillBtnTextActive,
                                    ]}
                                  >
                                    {opt}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                          <View style={styles.clLnOptionsSubRow}>
                            {['Chẵn 11-12', 'Lẻ 11-12'].map((opt) => {
                              const isSelected = board.selection === opt;
                              return (
                                <TouchableOpacity
                                  key={opt}
                                  style={[
                                    styles.clLnPillBtn,
                                    isSelected && styles.clLnPillBtnActive
                                  ]}
                                  onPress={() => {
                                    setClLnBoards((prev) =>
                                      prev.map((b) =>
                                        b.id === board.id
                                          ? { ...b, selection: isSelected ? null : opt }
                                          : b
                                      )
                                    );
                                  }}
                                >
                                  <Text
                                    style={[
                                      styles.clLnPillBtnText,
                                      isSelected && styles.clLnPillBtnTextActive,
                                    ]}
                                  >
                                    {opt}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Refresh & Price Controls */}
                    <View style={styles.boardControls}>
                      <TouchableOpacity
                        style={styles.refreshBtn}
                        onPress={() => autoSelectClLnBoard(board.id)}
                      >
                        <RefreshCw size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                      <View style={styles.pricePill}>
                        <Text style={styles.pricePillText}>10K</Text>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* Prize Structure Card */}
              <View style={styles.prizeStructureContainer}>
                <Text style={styles.prizeStructureTitle}>Cơ cấu giải thưởng</Text>

                {/* CHẴN */}
                <View style={styles.prizeRow}>
                  <View style={styles.prizeLeftCol}>
                    <Text style={styles.prizeTypeTitle}>CHẴN</Text>
                  </View>
                  <View style={styles.prizeRightCol}>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>TH1: KQ có 15 số chẵn trở lên</Text>
                      <Text style={styles.prizeValueRed}>x20</Text>
                    </View>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>TH2: KQ có 13 hoặc 14 số chẵn</Text>
                      <Text style={styles.prizeValueRed}>x4</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.prizeDivider} />

                {/* CHẴN 11-12 */}
                <View style={styles.prizeRow}>
                  <View style={styles.prizeLeftCol}>
                    <Text style={styles.prizeTypeTitle}>CHẴN 11-12</Text>
                  </View>
                  <View style={styles.prizeRightCol}>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>KQ có 11 hoặc 12 số chẵn</Text>
                      <Text style={styles.prizeValueRed}>x2</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.prizeDivider} />

                {/* HOÀ (Chẵn Lẻ) */}
                <View style={styles.prizeRow}>
                  <View style={styles.prizeLeftCol}>
                    <Text style={styles.prizeTypeTitle}>HOÀ</Text>
                  </View>
                  <View style={styles.prizeRightCol}>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>KQ có 10 số chẵn và 10 số lẻ</Text>
                      <Text style={styles.prizeValueRed}>x2</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.prizeDivider} />

                {/* LẺ 11-12 */}
                <View style={styles.prizeRow}>
                  <View style={styles.prizeLeftCol}>
                    <Text style={styles.prizeTypeTitle}>LẺ 11-12</Text>
                  </View>
                  <View style={styles.prizeRightCol}>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>KQ có 11 hoặc 12 số lẻ</Text>
                      <Text style={styles.prizeValueRed}>x2</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.prizeDivider} />

                {/* LẺ */}
                <View style={styles.prizeRow}>
                  <View style={styles.prizeLeftCol}>
                    <Text style={styles.prizeTypeTitle}>LẺ</Text>
                  </View>
                  <View style={styles.prizeRightCol}>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>TH1: có 13 hoặc 14 số lẻ</Text>
                      <Text style={styles.prizeValueRed}>x4</Text>
                    </View>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>TH2: có 15 số lẻ trở lên</Text>
                      <Text style={styles.prizeValueRed}>x20</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.prizeDivider} />

                {/* LỚN */}
                <View style={styles.prizeRow}>
                  <View style={styles.prizeLeftCol}>
                    <Text style={styles.prizeTypeTitle}>LỚN</Text>
                  </View>
                  <View style={styles.prizeRightCol}>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>TH1: KQ có 13 số lớn trở lên</Text>
                      <Text style={styles.prizeValueRed}>x2.6</Text>
                    </View>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>TH2: KQ có 11 hoặc 12 số lớn</Text>
                      <Text style={styles.prizeValueRed}>x1</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.prizeDivider} />

                {/* HOÀ (Lớn Nhỏ) */}
                <View style={styles.prizeRow}>
                  <View style={styles.prizeLeftCol}>
                    <Text style={styles.prizeTypeTitle}>HOÀ</Text>
                  </View>
                  <View style={styles.prizeRightCol}>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>KQ có 10 số lớn và 10 số nhỏ</Text>
                      <Text style={styles.prizeValueRed}>x2.6</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.prizeDivider} />

                {/* NHỎ */}
                <View style={styles.prizeRow}>
                  <View style={styles.prizeLeftCol}>
                    <Text style={styles.prizeTypeTitle}>NHỎ</Text>
                  </View>
                  <View style={styles.prizeRightCol}>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>TH1: KQ có 11 hoặc 12 số nhỏ</Text>
                      <Text style={styles.prizeValueRed}>x1</Text>
                    </View>
                    <View style={styles.prizeDetailRow}>
                      <Text style={styles.prizeDetailText}>TH2: KQ có 13 số nhỏ trở lên</Text>
                      <Text style={styles.prizeValueRed}>x2.6</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions for CLLN */}
            <View style={[styles.footerContainer, { paddingBottom: 12 + insets.bottom }]}>
              <View style={styles.footerButtons}>
                <TouchableOpacity
                  style={styles.pillActionBtn}
                  onPress={autoSelectAllClLnBoards}
                >
                  <RefreshCw size={14} color="#0084FA" />
                  <Text style={[styles.pillActionBtnText, { color: '#0084FA' }]}>Chọn nhanh</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.pillActionBtn} onPress={addClLnBoard}>
                  <Plus size={14} color="#FF6F00" />
                  <Text style={[styles.pillActionBtnText, { color: '#FF6F00' }]}>Thêm dãy số</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tạm tính:</Text>
                <Text style={styles.totalValue}>
                  {(clLnBoards.filter((b) => b.selection !== null).length * 10000).toLocaleString('vi-VN')} VNĐ
                </Text>
              </View>

              <TouchableOpacity style={styles.checkoutBtn} onPress={handleClLnCheckout}>
                <Text style={styles.checkoutBtnText}>Đặt vé</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* 1-80 Numbers Selector Modal */}
        {isModalVisible && (
          <View style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
            <View style={styles.modalContent}>
              {/* Redesigned Blue Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {activeBoardId === 'BAO' ? `Chọn số cho Bao ${baoType}` : `Dãy ${activeBoardId}`}
                </Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalCloseBtn}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={[styles.modalInnerBody, { paddingBottom: Math.max(16, insets.bottom + 16) }]}>
                {/* 80 grid numbers scroll (10 columns grid) */}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalScrollGrid}
                >
                  <View style={styles.modalGrid}>
                    {Array.from({ length: 80 }, (_, i) => i + 1).map((val) => {
                      const numStr = String(val).padStart(2, '0');
                      const isSelected = tempSelectedNumbers.includes(numStr);
                      return (
                        <TouchableOpacity
                          key={val}
                          style={[
                            styles.modalGridBall,
                            isSelected && styles.modalGridBallSelected
                          ]}
                          onPress={() => toggleModalNumber(numStr)}
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

                {/* Redesigned Bottom Actions Row */}
                <View style={styles.newModalFooter}>
                  <View style={styles.modalActionButtonsRow}>
                    <TouchableOpacity
                      style={styles.modalActionBtnClear}
                      onPress={() => setTempSelectedNumbers([])}
                    >
                      <Text style={styles.modalActionBtnTextClear}>Xoá</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.modalActionBtnRandom}
                      onPress={modalAutoSelect}
                    >
                      <Text style={styles.modalActionBtnTextRandom}>Ngẫu nhiên</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.modalBtnContinue,
                      tempSelectedNumbers.length !== (activeBoardId === 'BAO' ? baoType : kenoBac) && styles.modalBtnContinueDisabled
                    ]}
                    onPress={confirmModalNumbers}
                  >
                    <Text style={styles.modalBtnContinueText}>Tiếp tục</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Loại Bao Picker Modal */}
        {isBaoTypePickerVisible && (
          <View style={[styles.pickerOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Chọn Loại Bao</Text>
              <ScrollView style={styles.pickerList}>
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.pickerItem, baoType === val && styles.pickerItemActive]}
                    onPress={() => {
                      setBaoType(val);
                      if (baoBac >= val) {
                        setBaoBac(val - 1);
                      }
                      setBaoNumbers([]);
                      setIsBaoTypePickerVisible(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, baoType === val && styles.pickerItemTextActive]}>
                      Bao {val} (Chọn {val} số)
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.pickerCloseBtn}
                onPress={() => setIsBaoTypePickerVisible(false)}
              >
                <Text style={styles.pickerCloseBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bậc Chơi Picker Modal */}
        {isBaoBacPickerVisible && (
          <View style={[styles.pickerOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
            <View style={styles.pickerContent}>
              <Text style={styles.pickerTitle}>Chọn Bậc Chơi</Text>
              <ScrollView style={styles.pickerList}>
                {Array.from({ length: Math.min(baoType - 1, 10) }, (_, i) => i + 1).map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.pickerItem, baoBac === val && styles.pickerItemActive]}
                    onPress={() => {
                      setBaoBac(val);
                      setBaoNumbers([]);
                      setIsBaoBacPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, baoBac === val && styles.pickerItemTextActive]}>
                      Bậc {val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.pickerCloseBtn}
                onPress={() => setIsBaoBacPickerVisible(false)}
              >
                <Text style={styles.pickerCloseBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Chọn kỳ mua Modal */}
        {isDrawPickerVisible && (
          <View style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
            <View style={styles.drawModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chọn kỳ mua</Text>
                <TouchableOpacity onPress={() => setIsDrawPickerVisible(false)} style={styles.modalCloseBtn}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.drawModalScrollList} showsVerticalScrollIndicator={false}>
                {drawCycles.map((cycle) => {
                  const isChecked = tempSelectedDraws.includes(cycle.id);
                  return (
                    <TouchableOpacity
                      key={cycle.id}
                      style={styles.drawModalItem}
                      onPress={() => {
                        if (isChecked) {
                          if (tempSelectedDraws.length > 1) {
                            setTempSelectedDraws(tempSelectedDraws.filter(id => id !== cycle.id));
                          }
                        } else {
                          setTempSelectedDraws([...tempSelectedDraws, cycle.id]);
                        }
                      }}
                    >
                      <View style={[styles.drawCheckbox, isChecked && styles.drawCheckboxChecked]}>
                        {isChecked && (
                          <Check size={14} color="#FF3B30" strokeWidth={3} />
                        )}
                      </View>
                      <Text style={styles.drawModalItemText}>
                        {cycle.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.drawModalFooter}>
                <TouchableOpacity
                  style={styles.drawConfirmBtn}
                  onPress={() => {
                    setSelectedDraws(tempSelectedDraws);
                    setIsDrawPickerVisible(false);
                  }}
                >
                  <Text style={styles.drawConfirmBtnText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Render STANDARD LAYOUT A (Mega/Power/Lotto/Max3D/Lotto535)
  const isPower = gameId === 'power_655';
  const isMega = gameId === 'mega_645';
  const isMax3d = gameId === 'max_3d';
  const isMax4d = gameId === 'max_4d';

  const isLoto235 = gameId === 'loto_235';
  const isThanTai4 = gameId === 'than_tai_4';
  const isDigitPicker = isMax3d || isMax4d || isThanTai4;
  const isLotoCap = gameId === 'loto_cap';
  const isTruotLoto = gameId === 'truot_loto';
  const isDientoan636 = gameId === 'dientoan_636';
  const activeDraw = standardDrawCycles.length > 0 ? standardDrawCycles[selectedDrawIndex] : null;

  // Dynamic color branding
  const activeColor = (isMax3d || isMax4d) ? '#E0115F' : isLottoGame ? '#E51F27' : '#C77A1E';

  return (
    <View style={styles.container}>
      {/* Header */}
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
            setTempSelectedDrawIndex(selectedDrawIndex);
            setIsStandardDrawPickerVisible(true);
          }}
        >
          <Text style={styles.periodLabel}>Kỳ quay:</Text>
          <Text style={styles.periodValueRed}>
            {activeDraw?.drawCode || 'Đang tải...'} - {activeDraw?.dateStr || ''}
          </Text>
          <Text style={styles.periodTime}>
            {formatTime(countdown)} ▼
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chartBtn} onPress={handleStatsPress}>
          <BarChart2 size={18} color="#00A859" />
        </TouchableOpacity>
      </View>

      {/* Boards List */}
      {isDientoan636 && dientoan636PlayType === 'Bao 6x36' ? (
        <ScrollView contentContainerStyle={styles.bao2ScrollContent} showsVerticalScrollIndicator={false}>
          {/* Bao options */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
            {[4, 5, 7, 8, 9, 10, 11, 12].map((baoNum) => {
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
          {standardBoards[0]?.numbers.length >= (dientoan636BaoType === 4 ? 4 : dientoan636BaoType === 5 ? 5 : 6) && (
            <View style={{ gap: 8, alignItems: 'center', marginTop: 12, paddingBottom: 32 }}>
              {getCombinationsList(standardBoards[0].numbers, 6).slice(0, 100).map((combo, idx) => (
                <View key={idx} style={{ flexDirection: 'row', gap: 6 }}>
                  {combo.map((num, ballIdx) => (
                    <View key={ballIdx} style={[styles.filledCircle, { backgroundColor: '#0B3A60', borderColor: '#0B3A60', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={[styles.filledCircleText, { fontSize: 13 }]}>{num}</Text>
                    </View>
                  ))}
                </View>
              ))}
              {getCombinationsList(standardBoards[0].numbers, 6).length > 100 && (
                <Text style={{ fontSize: 13, color: '#8F9BB3', fontStyle: 'italic', marginTop: 8, textAlign: 'center' }}>
                  Hiển thị 100 trên tổng số {getCombinationsList(standardBoards[0].numbers, 6).length} bộ số được tạo.
                </Text>
              )}
            </View>
          )}
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

          {/* List Title */}
          <Text style={styles.bao2ListHeading}>
            Danh sách các bộ số được tạo ({loto235Bao2Numbers.length} bộ số)
          </Text>

          {/* Numbers Grid */}
          <View style={styles.bao2NumbersGrid}>
            {Array.from({ length: 10 }, (_, i) => {
              const numStr = String(i);
              const isSelected = loto235Bao2Numbers.includes(numStr);
              return (
                <TouchableOpacity
                  key={numStr}
                  style={[
                    styles.bao2NumberBall,
                    isSelected && styles.bao2NumberBallSelected
                  ]}
                  onPress={() => toggleLoto235Bao2Number(numStr)}
                >
                  <Text style={[
                    styles.bao2NumberBallText,
                    isSelected && styles.bao2NumberBallTextSelected
                  ]}>
                    {numStr}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.boardsScrollContent} showsVerticalScrollIndicator={false}>
          {((isLoto235 || isLotoCap || isDientoan636) ? standardBoards.slice(0, 5) : standardBoards).map((board, index) => {
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {/* Main numbers */}
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    {Array.from({ length: reqMain }).map((_, idx) =>
                      renderLottoBall(board.numbers[idx], false, idx)
                    )}
                  </View>

                  {/* Divider */}
                  <View style={{ width: 1.5, height: 20, backgroundColor: '#D0D5DD', marginHorizontal: 4 }} />

                  {/* Special numbers */}
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                    {Array.from({ length: reqSpecial }).map((_, idx) =>
                      renderLottoBall(board.specialNumbers ? board.specialNumbers[idx] : undefined, true, idx)
                    )}
                  </View>
                </View>
              );
            };

            const renderLoto235Circles = () => {
              const reqCount = getLoto235RequiredCount(loto235PlayType);
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

            const renderLotoCapCircles = () => {
              const reqCount = getLotoCapRequiredCount(lotoCapPlayType);
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
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {(() => {
                      const val1 = board.numbers[0];
                      const filled = val1 !== undefined && val1 !== '';
                      return (
                        <View style={[filled ? styles.filledCircle : styles.emptyCircle, { borderColor: '#0B3A60', backgroundColor: filled ? '#0B3A60' : 'transparent', minWidth: 42, paddingHorizontal: 6 }]}>
                          <Text style={filled ? styles.filledCircleText : { color: '#8F9BB3' }}>
                            {filled ? val1 : '?'}
                          </Text>
                        </View>
                      );
                    })()}

                    {(() => {
                      const val1 = board.numbers[1];
                      const val2 = board.numbers[2];
                      const filled1 = val1 !== undefined && val1 !== '';
                      const filled2 = val2 !== undefined && val2 !== '';
                      const text = `${filled1 ? val1 : '?'}${filled2 ? val2 : '?'}`;
                      const hasAny = filled1 || filled2;
                      return (
                        <View style={[hasAny ? styles.filledCircle : styles.emptyCircle, { borderColor: '#0B3A60', backgroundColor: hasAny ? '#0B3A60' : 'transparent', minWidth: 42, paddingHorizontal: 6 }]}>
                          <Text style={hasAny ? styles.filledCircleText : { color: '#8F9BB3' }}>
                            {text}
                          </Text>
                        </View>
                      );
                    })()}

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
                        <View style={[hasAny ? styles.filledCircle : styles.emptyCircle, { borderColor: '#0B3A60', backgroundColor: hasAny ? '#0B3A60' : 'transparent', minWidth: 42, paddingHorizontal: 6 }]}>
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
                <TouchableOpacity
                  style={styles.standardCirclesGrid}
                  onPress={() => handleOpenStandardBoardModal(index)}
                >
                  {isLottoGame ? (
                    renderLottoCircles()
                  ) : isLoto235 ? (
                    renderLoto235Circles()
                  ) : isLotoCap ? (
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

                {/* Right control (refresh/delete + multiplier for Max3D / Loto 235 / Loto Cap) */}
                <View style={styles.standardRowControls}>
                  {hasContent ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {(isMax3d || isMax4d || isLoto235 || isLotoCap) && (
                        <TouchableOpacity
                          style={styles.max3dPill}
                          onPress={() => {
                            if (isLoto235 || isLotoCap) {
                              setActiveMultiplierBoardIndex(index);
                              setIsLotoMultiplierModalVisible(true);
                            } else {
                              handleSelectMultiplier(index);
                            }
                          }}
                        >
                          <Text style={styles.max3dPillText}>
                            {(((isLoto235 || isLotoCap ? board.multiplier : board.multiplier) || 10000) / 1000).toString()}K
                          </Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.rowDeleteBtn}
                        onPress={() => handleClearBoard(index)}
                      >
                        <Trash2 size={20} color="#8F9BB3" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {(isMax3d || isMax4d || isLoto235 || isLotoCap) && (
                        <TouchableOpacity
                          style={styles.max3dPill}
                          onPress={() => {
                            if (isLoto235 || isLotoCap) {
                              setActiveMultiplierBoardIndex(index);
                              setIsLotoMultiplierModalVisible(true);
                            } else {
                              handleSelectMultiplier(index);
                            }
                          }}
                        >
                          <Text style={styles.max3dPillText}>
                            {(((isLoto235 || isLotoCap ? board.multiplier : board.multiplier) || 10000) / 1000).toString()}K
                          </Text>
                        </TouchableOpacity>
                      )}
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
      <View style={[styles.standardFooter, { paddingBottom: 16 + insets.bottom }]}>
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

            {/* Omit TC button for Max3D Pro and Lotto 535 */}
            {!isLottoGame && standardPlayType !== 'Max3D Pro' && (
              <TouchableOpacity style={styles.standardPillBtn} onPress={handleTCAll}>
                <RotateCw size={14} color="#0084FA" />
                <Text style={styles.standardPillBtnText}>TC</Text>
              </TouchableOpacity>
            )}

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

        {getEstimatedWinInfo() && (
          <View style={[styles.standardTotalRow, { marginTop: 0, paddingTop: 4 }]}>
            <Text style={[styles.standardTotalLabel, { color: '#00BA00', fontSize: 13 }]}>Thắng tạm tính:</Text>
            <Text style={[styles.standardTotalVal, { color: '#00BA00', fontSize: 13 }]}>
              = {getEstimatedWinInfo()?.totalCost.toLocaleString('vi-VN')} * {getEstimatedWinInfo()?.multiplier} = {(getEstimatedWinInfo()!.estimatedWin).toLocaleString('vi-VN')} VNĐ
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.standardCheckoutBtn} onPress={handleStandardCheckout}>
          <Text style={styles.standardCheckoutBtnText}>Đặt vé</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Selector */}
      {isStandardNumberModalVisible && (
        <View style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, (isMax3d || isMax4d || isLottoGame) && { backgroundColor: isLottoGame ? '#0056B3' : '#E0115F' }]}>
              <Text style={styles.modalTitle}>
                Dãy {activeBoardIndex !== null ? standardBoards[activeBoardIndex]?.id : ''}
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
                          {idx === 3 && reqCount === 6 && (
                            <View style={{ width: 2, height: 32, backgroundColor: '#D0D5DD', marginHorizontal: 8 }} />
                          )}
                          <TouchableOpacity
                            style={[
                              styles.max3dSlotBox,
                              isActive && styles.max3dSlotBoxActive,
                              val !== '' && styles.max3dSlotBoxFilled
                            ]}
                            onPress={() => setActiveSlotIndex(idx)}
                          >
                            <Text style={[
                              styles.max3dSlotText,
                              isActive && styles.max3dSlotTextActive,
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
                    isLottoGame
                      ? ((tempStandardNumbers.length !== getLottoRequiredCounts().main || tempLottoSpecialNumbers.length !== getLottoRequiredCounts().special) && styles.modalBtnContinueDisabled)
                      : isDigitPicker
                        ? (tempMax3dSlots.some((s) => s === '') && styles.modalBtnContinueDisabled)
                        : (tempStandardNumbers.length !== getRequiredNumbersCount(standardPlayType) && styles.modalBtnContinueDisabled)
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

      {/* Chọn kỳ mua Standard Modal */}
      {isStandardDrawPickerVisible && (
        <View style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
          <View style={styles.drawModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn kỳ mua</Text>
              <TouchableOpacity onPress={() => setIsStandardDrawPickerVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawModalScrollList} showsVerticalScrollIndicator={false}>
              {standardDrawCycles.map((cycle, idx) => {
                const isSelected = tempSelectedDrawIndex === idx;
                return (
                  <TouchableOpacity
                    key={cycle.id}
                    style={styles.drawModalItem}
                    onPress={() => setTempSelectedDrawIndex(idx)}
                  >
                    <View style={[styles.drawCheckbox, isSelected && styles.drawCheckboxChecked]}>
                      {isSelected && (
                        <Check size={14} color="#FF3B30" strokeWidth={3} />
                      )}
                    </View>
                    <Text style={styles.drawModalItemText}>
                      {cycle.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.drawModalFooter}>
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
                const isSelected = activeMultiplierBoardIndex !== null
                  ? (standardBoards[activeMultiplierBoardIndex]?.multiplier || 10000) === val
                  : loto235Bao2Multiplier === val;
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.powerBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  timerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  instructionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  selectedRow: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  selectedLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  selectedBallsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  emptyBallsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
  selectedBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  selectedBallText: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  matrixContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.light,
  },
  matrixBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixBallSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  matrixBallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  matrixBallTextSelected: {
    color: COLORS.textLight,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.dark,
  },
  footerInfo: {
    flex: 1,
  },
  footerCostLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
  },
  footerCostVal: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  autoBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoBtnText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.medium,
  },
  addBtnText: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },

  // ===================================
  // CUSTOM KENO INTERFACE STYLES
  // ===================================
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  customHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  infoBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EBF0F3',
    height: 44,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#0056B3',
  },
  tabText: {
    fontSize: 13,
    color: '#7F8E9C',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#0056B3',
  },
  bacSelectorContainer: {
    backgroundColor: '#F7F9FB',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  bacGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bacBtn: {
    width: (SCREEN_WIDTH - 48) / 5,
    height: 34,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EBF0F3',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  bacBtnActive: {
    backgroundColor: '#FF8A00',
    borderColor: '#FF8A00',
  },
  bacBtnText: {
    fontSize: 11,
    color: '#0F2942',
    fontWeight: 'bold',
  },
  bacBtnTextActive: {
    color: '#FFFFFF',
  },
  drawInfoBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  drawBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF0F3',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 36,
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  drawLabel: {
    fontSize: 11,
    color: '#334D5C',
    fontWeight: 'bold',
  },
  drawCycleRed: {
    fontSize: 11,
    color: '#E51F27',
    fontWeight: 'bold',
  },
  drawTime: {
    fontSize: 11,
    color: '#334D5C',
  },
  chartBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EBF0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boardsContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    paddingBottom: 220,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 6,
    paddingVertical: 4,
    minHeight: 48,
  },
  boardLetter: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F2942',
    width: 18,
  },
  circlesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  circleBall: {
    borderWidth: 1.5,
    borderColor: '#FF8A00',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBallFilled: {
    backgroundColor: '#FF8A00',
  },
  circleBallText: {
    fontWeight: 'bold',
    color: '#FF8A00',
  },
  circleBallTextFilled: {
    color: '#FFFFFF',
  },
  boardControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pricePill: {
    backgroundColor: '#EDF1F7',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  pricePillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#EBF0F3',
    padding: SPACING.md,
    ...SHADOWS.dark,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pillActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#EBF0F3',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  pillActionBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 13,
    color: '#7F8E9C',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    color: '#E51F27',
    fontWeight: 'bold',
  },
  checkoutBtn: {
    backgroundColor: '#0084FA',
    borderRadius: 8,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Modal selector styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0084FA',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    padding: 2,
  },
  modalInnerBody: {
    padding: 16,
  },
  modalScrollGrid: {
    paddingBottom: 12,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  modalGridBall: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalGridBallSelected: {
    backgroundColor: '#FF8A00',
  },
  modalGridBallText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  modalGridBallTextSelected: {
    color: '#FFFFFF',
  },
  newModalFooter: {
    marginTop: 14,
    gap: 12,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalActionBtnClear: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFEBEB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionBtnTextClear: {
    color: '#E51F27',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalActionBtnRandom: {
    flex: 1,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E6F0FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionBtnTextRandom: {
    color: '#0056B3',
    fontWeight: 'bold',
    fontSize: 13,
  },
  modalBtnContinue: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0084FA',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalBtnContinueDisabled: {
    backgroundColor: '#72B5F6',
  },
  modalBtnContinueText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // ===================================
  // BAO KENO SPECIFIC STYLES
  // ===================================
  dropdownsRow: {
    flexDirection: 'row',
    backgroundColor: '#F7F9FB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
    zIndex: 99,
    elevation: 99,
  },
  dropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBF0F3',
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 38,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.light,
  },
  dropdownLabel: {
    fontSize: 12,
    color: '#334D5C',
    fontWeight: 'bold',
  },
  dropdownValue: {
    color: '#FF6F00',
    fontWeight: '900',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#7F8E9C',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2942',
    marginVertical: 12,
    paddingHorizontal: 4,
  },
  singlePillActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#EBF0F3',
    borderRadius: 18,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '100%',
    maxHeight: '60%',
    padding: 16,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2942',
    textAlign: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    paddingBottom: 8,
  },
  pickerList: {
    marginBottom: 12,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F9FB',
  },
  pickerItemActive: {
    backgroundColor: '#E6F0FA',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#334D5C',
  },
  pickerItemTextActive: {
    color: '#0084FA',
    fontWeight: 'bold',
  },
  pickerCloseBtn: {
    backgroundColor: '#0084FA',
    borderRadius: 6,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // CLLN Specific Styles
  clLnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 8,
  },
  clLnBoardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F8',
  },
  clLnOptionsContainer: {
    flex: 1,
    marginHorizontal: 12,
    gap: 8,
  },
  clLnOptionsSubRow: {
    flexDirection: 'row',
    gap: 8,
  },
  clLnOptionsGrid: {
    gap: 8,
  },
  clLnPillBtn: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  clLnPillBtnActive: {
    backgroundColor: '#0056B3',
    borderColor: '#0056B3',
  },
  clLnPillBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#344054',
  },
  clLnPillBtnTextActive: {
    color: '#FFFFFF',
  },
  prizeStructureContainer: {
    backgroundColor: '#FFFDF9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAC7',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  prizeStructureTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D48C00',
    textAlign: 'center',
    marginBottom: 12,
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
  },
  prizeLeftCol: {
    width: 90,
  },
  prizeTypeTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  prizeRightCol: {
    flex: 1,
    gap: 4,
  },
  prizeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeDetailText: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
    paddingRight: 8,
  },
  prizeValueRed: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E51F27',
  },
  prizeDivider: {
    height: 1,
    backgroundColor: '#FFEAC7',
    marginVertical: 8,
  },
  drawModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: SCREEN_HEIGHT * 0.75,
    overflow: 'hidden',
  },
  drawModalScrollList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  drawModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  drawCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawCheckboxChecked: {
    borderColor: '#FF3B30',
  },
  drawModalItemText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  drawModalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  drawConfirmBtn: {
    backgroundColor: '#0084FA',
    borderRadius: 22,
    height: 44,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  trashBtn: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatedCombosContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  generatedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2942',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  combosList: {
    alignItems: 'center',
    gap: 6,
  },
  comboText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2942',
    letterSpacing: 0.5,
  },

  // Standard Redesign Styles
  playTabsWrapper: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    position: 'relative',
    zIndex: 10,
  },
  playTabsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  playTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTabBtnActive: {
    backgroundColor: '#C77A1E',
    borderColor: '#C77A1E',
  },
  playTabBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334D5C',
  },
  playTabBtnTextActive: {
    color: '#FFFFFF',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 42,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    width: 100,
    zIndex: 20,
    ...SHADOWS.light,
  },
  dropdownMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  dropdownMenuItemText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F2942',
    textAlign: 'center',
  },
  periodRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  periodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF0F3',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  periodLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  periodValueRed: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  periodTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F2942',
    marginLeft: 'auto',
  },
  boardsScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 220,
  },
  standardBoardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    minHeight: 44,
  },
  standardBoardLetter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0056B3',
    width: 20,
  },
  standardCirclesGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginHorizontal: 12,
  },
  emptyCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#C77A1E',
    backgroundColor: '#FFFFFF',
  },
  filledCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#C77A1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledCircleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tcCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#C77A1E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tcCircleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  standardRowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 32,
  },
  rowDeleteBtn: {
    padding: 4,
  },
  rowRefreshBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0084FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  standardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#E9ECEF',
    padding: 16,
    ...SHADOWS.dark,
  },
  standardFooterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  standardPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    ...SHADOWS.light,
  },
  standardPillBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0084FA',
  },
  standardTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  standardTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7F8E9C',
  },
  standardTotalVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  standardCheckoutBtn: {
    backgroundColor: '#0084FA',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  standardCheckoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Max3D Redesign Styles
  max3dTabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  max3dTabBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  max3dPill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
  },
  max3dPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  max3dSlotsWrapper: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  max3dSlotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  max3dSlotBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  max3dSlotBoxActive: {
    borderColor: '#E0115F',
    backgroundColor: '#FFFFFF',
    shadowColor: '#E0115F',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  max3dSlotBoxFilled: {
    backgroundColor: '#E0115F',
    borderColor: '#E0115F',
  },
  max3dSlotText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#98A2B3',
  },
  max3dSlotTextActive: {
    color: '#E0115F',
  },
  max3dSlotTextFilled: {
    color: '#FFFFFF',
  },
  max3dKeyboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: 12,
  },
  max3dKeyBtn: {
    width: '17%',
    aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#F2F4F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  max3dKeyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#344054',
  },

  // Lotto 535 Redesign Styles
  lottoTabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  lottoTabBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  lottoSubBaoWrapper: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  lottoSubBaoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-start',
  },
  lottoSubBaoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 54,
  },
  lottoSubBaoBtnActive: {
    backgroundColor: '#FF8A00',
    borderColor: '#FF8A00',
  },
  lottoSubBaoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334D5C',
  },
  lottoSubBaoTextActive: {
    color: '#FFFFFF',
  },
  lottoSpecialDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
    width: '100%',
  },
  lottoDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E4E7EC',
  },
  lottoDividerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#344054',
    marginHorizontal: 12,
  },

  // Loto 235 Redesign Styles
  bao2ScrollContent: {
    padding: 16,
  },
  bao2FilterRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    width: '100%',
  },
  bao2FilterLeftGrid: {
    flex: 1,
    gap: 8,
  },
  bao2FilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bao2FilterBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bao2FilterBtnActive: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  bao2FilterBtnLarge: {
    flex: 1.5,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bao2FilterBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  bao2FilterBtnTextActive: {
    color: '#FFFFFF',
  },
  bao2MultiplierBox: {
    width: 60,
    height: 108,
    borderRadius: 8,
    backgroundColor: '#EAECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bao2MultiplierBoxText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  bao2ListHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0B3A60',
    textAlign: 'center',
    marginBottom: 16,
  },
  bao2NumbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingBottom: 24,
  },
  bao2NumberBall: {
    width: '8%',
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    minWidth: 32,
  },
  bao2NumberBallSelected: {
    backgroundColor: '#0B3A60',
    borderColor: '#0B3A60',
  },
  bao2NumberBallText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B3A60',
  },
  bao2NumberBallTextSelected: {
    color: '#FFFFFF',
  },
});
