import { ArrowLeft } from 'iconsax-react-native';
import { BarChart2, Check, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

export default function GameLayoutBingo18Screen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { addToCart } = useAppStore();

  const isAddingToCart = React.useRef(false);

  const processCheckout = (payload: any) => {
    if (isAddingToCart.current) {
      if (!payload.boards || payload.boards.length === 0) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không có vé nào để thêm.' });
        return;
      }

      const allNumbers = payload.boards.reduce((acc: string[], b: any) => {
        if (b.numbers) {
          const numStr = b.specialNumbers
            ? `${b.numbers.join(' ')} | ${b.specialNumbers.join(' ')}`
            : b.numbers.join(' ');
          acc.push(`Dãy ${b.id}: ${numStr}`);
        }
        return acc;
      }, []);

      const totalCost = payload.boards.reduce((sum: number, b: any) => sum + (b.cost || 0), 0);

      const drawDateStr = payload.drawDate || (activeDraw ? `${activeDraw.drawCode} - ${activeDraw.dateStr}` : undefined);

      addToCart({
        gameId: payload.gameId,
        gameName: payload.gameName,
        playType: payload.playType,
        numbers: allNumbers,
        cost: totalCost,
        baseCost: payload.boards[0]?.cost || 10000,
        quantity: payload.drawIds ? payload.drawIds.length : 1,
        drawDate: drawDateStr,
        boards: payload.boards,
      });

      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã thêm vé vào giỏ hàng' });
      isAddingToCart.current = false;
    } else {
      const drawDateStr = payload.drawDate || (activeDraw ? `${activeDraw.drawCode} - ${activeDraw.dateStr}` : undefined);
      navigation.navigate('GamePayment', {
        ...payload,
        drawDate: drawDateStr,
      });
    }
  };

  const { gameId, initialTab } = route.params || {};

  const [gameName] = useState('BINGO18');
  const [playType, setPlayType] = useState(initialTab || 'Cơ bản'); // 'Cơ bản', 'Cộng tổng', 'Tài Xỉu Hoà'

  // Selections
  const [selections, setSelections] = useState<string[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const baseCost = 10000;

  // Draw cycles state
  const [drawCycles, setDrawCycles] = useState<any[]>([]);
  const [selectedDrawIndex, setSelectedDrawIndex] = useState(0);
  const [tempSelectedDrawIndex, setTempSelectedDrawIndex] = useState(0);
  const [isDrawPickerVisible, setIsDrawPickerVisible] = useState(false);
  const [isDrawLoading, setIsDrawLoading] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);

  const generateBingo18Draws = (drawsFromApi?: any[]) => {
    const now = new Date();
    const nowMs = now.getTime();

    if (drawsFromApi && Array.isArray(drawsFromApi)) {
      const activeForBingo = drawsFromApi
        .filter((d: any) => {
          if (!d.game || (d.game.code !== 'bingo18' && d.game.code !== 'bingo_18')) return false;
          if (new Date(d.closeTime).getTime() <= nowMs) return false;
          if (typeof d.drawCode === 'string' && d.drawCode.match(/^#10\d{2}/)) return false;
          return true;
        })
        .slice(0, 10);

      if (activeForBingo.length > 0) {
        return activeForBingo.map((d: any) => {
          const closeTime = new Date(d.closeTime);
          const day = String(closeTime.getDate()).padStart(2, '0');
          const month = String(closeTime.getMonth() + 1).padStart(2, '0');
          const year = closeTime.getFullYear();
          const hrs = String(closeTime.getHours()).padStart(2, '0');
          const mins = String(closeTime.getMinutes()).padStart(2, '0');
          const dateFormatted = `${day}/${month}/${year} ${hrs}:${mins}`;

          return {
            id: d._id,
            drawCode: d.drawCode,
            label: `${d.drawCode} - ${dateFormatted}`,
            dateStr: dateFormatted,
            closeTime: closeTime.toISOString()
          };
        });
      }
    }

    // Generator for 10 upcoming 8-minute slots between 06:00 and 22:00
    const result: any[] = [];
    let currentSlot = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0);

    while (currentSlot.getTime() <= nowMs) {
      currentSlot = new Date(currentSlot.getTime() + 8 * 60 * 1000);
    }

    for (let i = 0; i < 10; i++) {
      const cutoffOfDay = new Date(currentSlot.getFullYear(), currentSlot.getMonth(), currentSlot.getDate(), 21, 56, 0);
      if (currentSlot.getTime() > cutoffOfDay.getTime()) {
        currentSlot = new Date(currentSlot.getFullYear(), currentSlot.getMonth(), currentSlot.getDate() + 1, 6, 0, 0);
      }

      const day = String(currentSlot.getDate()).padStart(2, '0');
      const month = String(currentSlot.getMonth() + 1).padStart(2, '0');
      const year = currentSlot.getFullYear();
      const hrs = String(currentSlot.getHours()).padStart(2, '0');
      const mins = String(currentSlot.getMinutes()).padStart(2, '0');

      const sixAmToday = new Date(currentSlot.getFullYear(), currentSlot.getMonth(), currentSlot.getDate(), 6, 0, 0);
      const minutesFromSixAm = Math.floor((currentSlot.getTime() - sixAmToday.getTime()) / 60000);
      const drawNumberInDay = Math.floor(minutesFromSixAm / 8) + 1;
      const drawCode = `#${String(drawNumberInDay).padStart(5, '0')}`;
      const dateFormatted = `${day}/${month}/${year} ${hrs}:${mins}`;

      result.push({
        id: `bingo18_${currentSlot.getFullYear()}${month}${day}_${hrs}${mins}`,
        drawCode,
        label: `${drawCode} - ${dateFormatted}`,
        dateStr: dateFormatted,
        closeTime: currentSlot.toISOString()
      });

      currentSlot = new Date(currentSlot.getTime() + 8 * 60 * 1000);
    }

    return result;
  };

  const fetchBingo18Draws = async () => {
    setIsDrawLoading(true);
    try {
      let apiDraws: any[] = [];
      try {
        const res = await api.get('/draws/active');
        apiDraws = res.data;
      } catch (e) { }

      const generated = generateBingo18Draws(apiDraws);
      setDrawCycles(generated);
      if (generated.length > 0) {
        setSelectedDrawIndex(0);
        setTempSelectedDrawIndex(0);
      }
    } catch (err) {
      console.error('Lỗi lấy kỳ quay Bingo18:', err);
    } finally {
      setIsDrawLoading(false);
    }
  };

  useEffect(() => {
    fetchBingo18Draws();
  }, []);

  const activeDraw = drawCycles[selectedDrawIndex];

  useEffect(() => {
    if (activeDraw && activeDraw.closeTime) {
      const closeTimeMs = new Date(activeDraw.closeTime).getTime();
      const diffSecs = Math.max(0, Math.floor((closeTimeMs - Date.now()) / 1000));
      setCountdown(diffSecs);
    }
  }, [activeDraw]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0 && drawCycles.length > 0) {
      fetchBingo18Draws();
    }
  }, [countdown]);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStatsPress = () => {
    navigation.navigate('StatsKeno', { gameId: 'bingo18' });
  };

  useEffect(() => {
    // Clear selections on tab change
    setSelections([]);
    setMultiplier(1);
  }, [playType]);

  const toggleSelection = (sel: string) => {
    if (selections.includes(sel)) {
      setSelections(selections.filter(s => s !== sel));
    } else {
      setSelections([...selections, sel]);
    }
  };

  const handleCheckout = () => {
    if (selections.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một số/tổng/ô cược.');
      return;
    }

    const boards = selections.map((sel, idx) => ({
      id: String.fromCharCode(65 + idx),
      numbers: [sel],
      isTC: false,
      cost: baseCost * multiplier
    }));

    processCheckout({
      gameId: 'bingo18',
      gameName,
      playType,
      drawIds: activeDraw ? [activeDraw.id] : [],
      boards,
      totalCost: boards.length * baseCost * multiplier
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F2942" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{gameName}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Cơ bản', 'Cộng tổng', 'Tài Xỉu Hoà'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, playType === tab && styles.tabBtnActive]}
            onPress={() => setPlayType(tab)}
          >
            <Text style={[styles.tabBtnText, playType === tab && styles.tabBtnTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Period/Draw Selection Row (Synchronized layout matching GameLayoutA) */}
      <View style={styles.periodRowContainer}>
        <TouchableOpacity
          style={styles.periodBox}
          onPress={() => {
            setTempSelectedDrawIndex(selectedDrawIndex);
            setIsDrawPickerVisible(true);
          }}
        >
          <Text style={styles.periodLabel}>Kỳ quay:</Text>
          <Text style={styles.periodValueRed}>
            {isDrawLoading || !activeDraw
              ? 'Đang tải...'
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

      <ScrollView style={styles.content}>
        {playType === 'Cơ bản' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Một số</Text>
            <View style={styles.grid}>
              {['1', '2', '3', '4', '5', '6'].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[styles.box, selections.includes(num) && styles.boxActive]}
                  onPress={() => toggleSelection(num)}
                >
                  <Text style={[styles.boxText, selections.includes(num) && styles.boxTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Hai số trùng</Text>
            <View style={styles.grid}>
              {['11', '22', '33', '44', '55', '66'].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[styles.box, selections.includes(num) && styles.boxActive]}
                  onPress={() => toggleSelection(num)}
                >
                  <Text style={[styles.boxText, selections.includes(num) && styles.boxTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Ba số trùng</Text>
            <View style={styles.grid}>
              {['111', '222', '333', '444', '555', '666'].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[styles.box, selections.includes(num) && styles.boxActive]}
                  onPress={() => toggleSelection(num)}
                >
                  <Text style={[styles.boxText, selections.includes(num) && styles.boxTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {playType === 'Cộng tổng' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn Tổng của 3 con số</Text>
            <View style={styles.grid}>
              {Array.from({ length: 16 }, (_, i) => String(i + 3)).map(sum => (
                <TouchableOpacity
                  key={sum}
                  style={[styles.box, selections.includes(sum) && styles.boxActive]}
                  onPress={() => toggleSelection(sum)}
                >
                  <Text style={[styles.boxText, selections.includes(sum) && styles.boxTextActive]}>{sum}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {playType === 'Tài Xỉu Hoà' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dự đoán tổng kết quả</Text>
            <View style={styles.grid}>
              {[
                { id: 'Tài', label: 'Tài (12-18)', rate: 'x2' },
                { id: 'Hoà', label: 'Hoà (10-11)', rate: 'x3' },
                { id: 'Xỉu', label: 'Xỉu (3-9)', rate: 'x2' }
              ].map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.boxBig, selections.includes(item.id) && styles.boxActive]}
                  onPress={() => toggleSelection(item.id)}
                >
                  <Text style={[styles.boxText, selections.includes(item.id) && styles.boxTextActive]}>{item.label}</Text>
                  <Text style={[styles.boxSubText, selections.includes(item.id) && styles.boxTextActive]}>{item.rate}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Multiplier Selector */}
        <View style={styles.multiplierContainer}>
          <Text style={styles.multiplierTitle}>Cấp nhân (Tiền xác 10,000đ/vé)</Text>
          <View style={styles.multiplierRow}>
            {[1, 2, 5, 10, 20].map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.multiplierBtn, multiplier === m && styles.multiplierBtnActive]}
                onPress={() => setMultiplier(m)}
              >
                <Text style={[styles.multiplierBtnText, multiplier === m && styles.multiplierBtnTextActive]}>x{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 120 + Math.max(16, insets.bottom) }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) + 16 }]}>
        <View style={styles.footerInfo}>
          {selections.length > 0 ? (
            <Text style={styles.footerTotalLabel}>
              Thanh toán: <Text style={styles.footerTotalValue}>{(selections.length * baseCost * multiplier).toLocaleString('vi-VN')} đ</Text>
            </Text>
          ) : (
            <Text style={styles.footerTotalLabel}>Vui lòng chọn số</Text>
          )}
          <Text style={styles.footerMaxPrizeText}>🏆️ Giải thưởng 79.000.000 VNĐ</Text>
        </View>
        <TouchableOpacity style={[styles.checkoutBtn, selections.length === 0 && { opacity: 0.5 }]} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>

      {/* Draw Picker Modal */}
      <Modal
        visible={isDrawPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDrawPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Chọn kỳ quay (6 phút / kỳ)</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsDrawPickerVisible(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawModalScrollList} showsVerticalScrollIndicator={false}>
              {isDrawLoading || drawCycles.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <ActivityIndicator size="small" color="#0055A5" />
                  <Text style={{ marginTop: 10, color: '#7F8E9C', fontSize: 14 }}>Đang tải danh sách kỳ quay...</Text>
                </View>
              ) : (
                drawCycles.map((cycle, idx) => {
                  const isSelected = tempSelectedDrawIndex === idx;
                  return (
                    <TouchableOpacity
                      key={cycle.id}
                      style={styles.drawModalItem}
                      onPress={() => setTempSelectedDrawIndex(idx)}
                    >
                      <View style={styles.drawModalLeftGroup}>
                        <View style={[styles.drawCheckbox, isSelected && styles.drawCheckboxChecked]}>
                          {isSelected && <Check size={14} color="#E51F27" strokeWidth={3} />}
                        </View>
                        <Text style={styles.drawModalItemText}>{cycle.label}</Text>
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
                  setIsDrawPickerVisible(false);
                }}
              >
                <Text style={styles.drawConfirmBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBF0F3',
    justifyContent: 'space-between',
  },
  backButton: { padding: 4 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#0F2942', fontSize: 18, fontWeight: '700' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#EEE'
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: 'transparent'
  },
  tabBtnActive: { borderColor: '#0055A5' },
  tabBtnText: { fontSize: 14, color: '#8F9BB3', fontWeight: '600' },
  tabBtnTextActive: { color: '#0055A5', fontWeight: 'bold' },

  // Synchronized Period Row styles matching GameLayoutA
  periodRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBF0F3',
  },
  periodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF0F3',
    borderRadius: 6,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
    flex: 1,
    marginRight: 10,
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
  chartBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EBF0F3',
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  box: {
    width: '30%',
    height: 70,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxBig: {
    width: '46%',
    height: 80,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxActive: {
    backgroundColor: '#0055A5',
    borderColor: '#0055A5'
  },
  boxText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333'
  },
  boxSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  boxTextActive: {
    color: '#FFF'
  },

  multiplierContainer: {
    marginTop: 12,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  multiplierTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  multiplierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  multiplierBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center'
  },
  multiplierBtnActive: {
    backgroundColor: '#E51F27',
    borderColor: '#E51F27'
  },
  multiplierBtnText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600'
  },
  multiplierBtnTextActive: {
    color: '#FFF'
  },

  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center'
  },
  footerInfo: { flex: 1 },
  footerTotalLabel: { fontSize: 14, color: '#666' },
  footerTotalValue: { fontSize: 16, fontWeight: 'bold', color: '#E51F27' },
  footerMaxPrizeText: { fontSize: 13, fontWeight: '700', color: '#D0021B', marginTop: 4 },
  checkoutBtn: {
    backgroundColor: '#E51F27',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  checkoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  modalHeader: {
    backgroundColor: '#0055A5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    padding: 4,
  },
  drawModalScrollList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  drawModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
  },
  drawModalLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  drawCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#BDC5D1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  drawCheckboxChecked: {
    borderColor: '#E51F27',
    backgroundColor: '#FFF0F0',
  },
  drawModalItemText: {
    fontSize: 14,
    color: '#0F2942',
    fontWeight: '500',
  },
  drawModalFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F3F6',
  },
  drawConfirmBtn: {
    backgroundColor: '#E51F27',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  drawConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
