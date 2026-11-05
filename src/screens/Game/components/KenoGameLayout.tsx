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


export default function KenoGameLayout({ route, navigation }: any) {
  const { gameId = 'keno', initialTab } = route.params || {};
  const addToCart = useAppStore((state) => state.addToCart);
  const insets = useSafeAreaInsets();
  const isAddingToCart = React.useRef(false);
  const [isLotoMultiplierModalVisible, setIsLotoMultiplierModalVisible] = useState(false);

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



  // Keno Specific States
  const [kenoTab, setKenoTab] = useState<'basic' | 'bao' | 'cl_ln'>(
    initialTab || (gameId === 'bao_keno' ? 'bao' : gameId === 'clln_keno' ? 'cl_ln' : 'basic')
  );
  const [kenoBac, setKenoBac] = useState<number>(2); // Default Bậc 2
  const [kenoBoards, setKenoBoards] = useState<Board[]>([
    { id: 'A', numbers: [], multiplier: 10000 },
    { id: 'B', numbers: [], multiplier: 10000 },
    { id: 'C', numbers: [], multiplier: 10000 },
    { id: 'D', numbers: [], multiplier: 10000 },
    { id: 'E', numbers: [], multiplier: 10000 },
    { id: 'F', numbers: [], multiplier: 10000 },
  ]);
  const [activeKenoBoardId, setActiveKenoBoardId] = useState<string | null>(null);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [tempSelectedNumbers, setTempSelectedNumbers] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Bao Keno States
  const [baoType, setBaoType] = useState<number>(3); // Default Bao 3
  const [baoBac, setBaoBac] = useState<number>(2); // Default Bậc 2
  const [baoNumbers, setBaoNumbers] = useState<string[]>([]);
  const [isAllCombosModalVisible, setIsAllCombosModalVisible] = useState(false);
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



  const isKenoGame = true;
  const gameName = 'KENO';
  const maxNumber = 80;
  const requiredSelectCount = 10;
  const initialJackpot = '2.000.000.000 đ';
  const initialCountdown = 480;

  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(initialCountdown);

  const [isMultiplierModalVisible, setIsMultiplierModalVisible] = useState(false);
  const [selectedBoardForMultiplier, setSelectedBoardForMultiplier] = useState<any>(null);

  const handleOpenMultiplierModal = (board: any) => {
    setSelectedBoardForMultiplier(board);
    setIsMultiplierModalVisible(true);
  };

  const handleMultiplierChange = (val: number) => {
    if (!selectedBoardForMultiplier) return;
    setKenoBoards(prev => prev.map(b => b.id === selectedBoardForMultiplier.id ? { ...b, multiplier: val } : b));
    setIsMultiplierModalVisible(false);
  };


  const fetchActiveDraw = async () => {
    setIsDrawLoading(true);
    try {
      const res = await api.get('/draws/active');
      const draws = res.data;
      const nowMs = Date.now();

      const kenoDraws = (draws || [])
        .filter((d: any) => d.game && d.game.code === 'keno' && new Date(d.closeTime).getTime() > nowMs)
        .sort((a: any, b: any) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime())
        .map((d: any) => {
          const closeDate = new Date(d.closeTime);
          const timeFormatted = closeDate.toTimeString().split(' ')[0];
          const dateFormatted = `${String(closeDate.getDate()).padStart(2, '0')}/${String(closeDate.getMonth() + 1).padStart(2, '0')}/${closeDate.getFullYear()}`;
          return {
            id: d._id,
            drawCode: d.drawCode,
            label: `#${d.drawCode} - ${timeFormatted} ${dateFormatted}`,
            timeStr: timeFormatted,
            dateStr: `${timeFormatted} ${dateFormatted}`,
            closeTime: d.closeTime,
          };
        });

      if (kenoDraws.length > 0) {
        setDrawCycles(kenoDraws);
        setSelectedDraws([kenoDraws[0].id]);
        const closeTimeMs = new Date(kenoDraws[0].closeTime).getTime();
        setCountdown(Math.max(0, Math.floor((closeTimeMs - Date.now()) / 1000)));
      }
    } catch (e) {
      console.log('Error fetching keno draws', e);
    } finally {
      setIsDrawLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveDraw();
    }, [])
  );

  useEffect(() => {
    fetchActiveDraw();
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      fetchActiveDraw();
    }
  }, [countdown]);

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
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn số cho ít nhất 1 bảng.' });
      return;
    }

    const drawCount = selectedDraws.length || 1;
    const totalCost = activeBoards.reduce((sum, b) => sum + ((b.multiplier || 10000) * drawCount), 0);

    processCheckout({
      gameId: 'keno',
      gameName: 'KENO',
      playType: `Bậc ${kenoBac} (${drawCount} kỳ)`,
      drawIds: selectedDraws,
      boards: activeBoards.map(board => ({
        id: board.id,
        isTC: false,
        numbers: board.numbers,
        cost: (board.multiplier || 10000) * drawCount
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
      Toast.show({ type: 'error', text1: 'Lỗi', text2: `Vui lòng chọn đủ ${baoType} số cho Bao này.` });
      return;
    }

    const numCombos = getCombinationsCount(baoType, baoBac);
    const drawCount = selectedDraws.length || 1;
    const cost = numCombos * 10000 * drawCount;

    processCheckout({
      gameId: 'bao_keno',
      gameName: 'KENO',
      playType: `Bao ${baoType} - Bậc ${baoBac} (${drawCount} kỳ)`,
      drawIds: selectedDraws,
      boards: [
        {
          id: 'A',
          isTC: false,
          numbers: baoNumbers,
          cost: cost / drawCount
        }
      ],
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
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn ít nhất 1 cửa đặt.' });
      return;
    }

    const drawCount = selectedDraws.length || 1;
    const totalCost = activeBoards.length * 10000 * drawCount;

    processCheckout({
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
      Toast.show({ type: 'error', text1: 'Lỗi', text2: `Vui lòng chọn đúng ${requiredSelectCount} số.` });
      return;
    }

    const formattedNumbers = selectedNumbers.map((n) => String(n).padStart(2, '0'));

    processCheckout({
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
  const kenoTotalCost = kenoBoards
    .filter((b) => b.numbers.length === kenoBac)
    .reduce((sum, b) => sum + ((b.multiplier || 10000) * (selectedDraws.length || 1)), 0);

  const handleAddKenoBoard = () => {
    if (kenoBoards.length >= 10) {
      Alert.alert('Thông báo', 'Tối đa 10 dãy số.');
      return;
    }
    const nextId = String.fromCharCode(65 + kenoBoards.length);
    setKenoBoards([
      ...kenoBoards,
      { id: nextId, numbers: [], multiplier: 10000 }
    ]);
  };


  const generatedBaoCombos = React.useMemo(() => {
    if (baoNumbers.length === baoType) {
      return getCombinations(baoNumbers, baoBac);
    }
    return [];
  }, [baoNumbers, baoType, baoBac]);



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
                <Text style={styles.drawCycleRed}>{isDrawLoading || drawCycles.length === 0 ? 'Đang tải...' : `${(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.drawCode || 'Đang tải...'} - ${(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.dateStr}`}</Text>
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
                      <TouchableOpacity
                        style={styles.pricePill}
                        onPress={() => {
                          setActiveKenoBoardId(board.id);
                          setIsLotoMultiplierModalVisible(true);
                        }}
                      >
                        <Text style={styles.pricePillText}>
                          {(((board.multiplier || 10000) / 1000)).toString()}K
                        </Text>
                      </TouchableOpacity>
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



                <TouchableOpacity style={styles.pillActionBtn} onPress={handleAddKenoBoard}>
                  <Plus size={14} color="#FF6F00" />
                  <Text style={[styles.pillActionBtnText, { color: '#FF6F00' }]}>Thêm dãy số</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tạm tính:</Text>
                <Text style={styles.totalValue}>{kenoTotalCost.toLocaleString('vi-VN')} VNĐ</Text>
              </View>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, width: '100%' }}>
                <TouchableOpacity
                  style={[styles.checkoutBtn, { flex: 1, backgroundColor: COLORS.secondary }]}
                  onPress={() => {
                    isAddingToCart.current = true;
                    handleKenoCheckout();
                  }}
                >
                  <Text style={styles.checkoutBtnText}>Thêm vé</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkoutBtn, { flex: 1 }]}
                  onPress={() => {
                    isAddingToCart.current = false;
                    handleKenoCheckout();
                  }}
                >
                  <Text style={styles.checkoutBtnText}>Cược ngay</Text>
                </TouchableOpacity>
              </View>
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
                <Text style={styles.drawCycleRed}>{(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.drawCode || 'Đang tải...'} - ${(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.dateStr}</Text>
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

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, width: '100%' }}>
                <TouchableOpacity
                  style={[styles.checkoutBtn, { flex: 1, backgroundColor: COLORS.secondary }]}
                  onPress={() => {
                    isAddingToCart.current = true;
                    handleBaoCheckout();
                  }}
                >
                  <Text style={styles.checkoutBtnText}>Thêm vé</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkoutBtn, { flex: 1 }]}
                  onPress={() => {
                    isAddingToCart.current = false;
                    handleBaoCheckout();
                  }}
                >
                  <Text style={styles.checkoutBtnText}>Cược ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* CL - LN Layout */}
            <View style={styles.drawInfoBarContainer}>
              <TouchableOpacity style={styles.drawBox} onPress={handleOpenDrawPicker}>
                <Text style={styles.drawLabel}>Kỳ quay:</Text>
                <Text style={styles.drawCycleRed}>{(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.drawCode || 'Đang tải...'} - ${(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.dateStr}</Text>
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

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12, width: '100%' }}>
                <TouchableOpacity
                  style={[styles.checkoutBtn, { flex: 1, backgroundColor: COLORS.secondary }]}
                  onPress={() => {
                    isAddingToCart.current = true;
                    handleClLnCheckout();
                  }}
                >
                  <Text style={styles.checkoutBtnText}>Thêm vé</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.checkoutBtn, { flex: 1 }]}
                  onPress={() => {
                    isAddingToCart.current = false;
                    handleClLnCheckout();
                  }}
                >
                  <Text style={styles.checkoutBtnText}>Cược ngay</Text>
                </TouchableOpacity>
              </View>
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
                {isDrawLoading || drawCycles.length === 0 ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="small" color="#00A859" />
                    <Text style={{ marginTop: 10, color: '#7F8E9C', fontSize: 14 }}>Đang tải danh sách kỳ quay...</Text>
                  </View>
                ) : (
                  drawCycles.map((cycle, idx) => {
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
                        <View style={styles.drawModalLeftGroup}>
                          <View style={[styles.drawCheckbox, isChecked && styles.drawCheckboxChecked]}>
                            {isChecked && (
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
        {/* Chọn mệnh giá Multiplier Modal for Keno */}
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
                  if (activeKenoBoardId !== null) {
                    const kb = kenoBoards.find((b) => b.id === activeKenoBoardId);
                    isSelected = (kb?.multiplier || 10000) === val;
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
                        if (activeKenoBoardId !== null) {
                          setKenoBoards(kenoBoards.map(b => b.id === activeKenoBoardId ? { ...b, multiplier: val } : b));
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
