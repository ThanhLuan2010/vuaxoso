import { ArrowLeft, Delete, ShoppingCart, BarChart2, Check, X } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme/theme';

export default function GameLayoutBScreen({ route, navigation }: any) {
  const { gameId } = route.params;
  const addToCart = useAppStore((state) => state.addToCart);
  const isAddingToCart = React.useRef(false);
  const insets = useSafeAreaInsets();

  // Draw cycles states
  const [drawCycles, setDrawCycles] = useState<any[]>([]);
  const [selectedDraws, setSelectedDraws] = useState<string[]>([]);
  const [tempSelectedDraws, setTempSelectedDraws] = useState<string[]>([]);
  const [isDrawLoading, setIsDrawLoading] = useState(false);
  const [isDrawPickerVisible, setIsDrawPickerVisible] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const fetchActiveDraw = async () => {
    setIsDrawLoading(true);
    try {
      const nowMs = Date.now();
      const res = await api.get('/draws/active');
      const draws = res.data;

      // Filter active draws for this game in the future
      const activeDraws = (draws || [])
        .filter((d: any) => d.game && d.game.code === gameId && new Date(d.closeTime).getTime() > nowMs)
        .slice(0, 10);

      if (activeDraws.length > 0) {
        const formatted = activeDraws.map((d: any) => {
          const closeTime = new Date(d.closeTime);
          const day = String(closeTime.getDate()).padStart(2, '0');
          const month = String(closeTime.getMonth() + 1).padStart(2, '0');
          const year = closeTime.getFullYear();
          const hrs = String(closeTime.getHours()).padStart(2, '0');
          const mins = String(closeTime.getMinutes()).padStart(2, '0');
          const secs = String(closeTime.getSeconds()).padStart(2, '0');
          const dateFormatted = `${day}/${month}/${year} ${hrs}:${mins}`;
          return {
            id: d._id,
            drawCode: d.drawCode,
            label: `${d.drawCode} - ${dateFormatted}`,
            timeStr: `${hrs}:${mins}:${secs}`,
            dateStr: dateFormatted,
            closeTime: d.closeTime
          };
        });
        setDrawCycles(formatted);
        setSelectedDraws((prev) => {
          const isValidPrev = prev && prev.length > 0 && formatted.some((d: any) => prev.includes(d.id));
          return isValidPrev ? prev : [formatted[0].id];
        });
        const currentActive = formatted[0];
        if (currentActive?.closeTime) {
          const closeTimeMs = new Date(currentActive.closeTime).getTime();
          setCountdown(Math.max(0, Math.floor((closeTimeMs - Date.now()) / 1000)));
        }
      } else {
        // Fallback: Tạo 10 kỳ quay hàng ngày theo giờ xổ Miền Bắc (chốt vé 17h20, xổ 18h15)
        const generatedDraws: any[] = [];
        const now = new Date();
        const todayCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 20, 0);
        let startDayOffset = now.getTime() >= todayCutoff.getTime() ? 1 : 0;

        for (let i = 0; i < 10; i++) {
          const drawDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + startDayOffset + i, 17, 20, 0);
          const day = String(drawDate.getDate()).padStart(2, '0');
          const month = String(drawDate.getMonth() + 1).padStart(2, '0');
          const year = drawDate.getFullYear();
          const dateFormatted = `${day}/${month}/${year} 18:15`;
          const drawNum = 1350 + startDayOffset + i;
          const drawCode = `#${drawNum}`;

          generatedDraws.push({
            id: `baoloto_${year}${month}${day}`,
            drawCode: drawCode,
            label: `${drawCode} - ${dateFormatted}`,
            timeStr: '18:15:00',
            dateStr: dateFormatted,
            closeTime: drawDate.toISOString(),
          });
        }
        setDrawCycles(generatedDraws);
        setSelectedDraws([generatedDraws[0].id]);
        const closeTimeMs = new Date(generatedDraws[0].closeTime).getTime();
        setCountdown(Math.max(0, Math.floor((closeTimeMs - Date.now()) / 1000)));
      }
    } catch (error) {
      console.error('Lỗi khi tải kỳ quay:', error);
      // Fallback
      const generatedDraws: any[] = [];
      const now = new Date();
      const todayCutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 20, 0);
      let startDayOffset = now.getTime() >= todayCutoff.getTime() ? 1 : 0;

      for (let i = 0; i < 10; i++) {
        const drawDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + startDayOffset + i, 17, 20, 0);
        const day = String(drawDate.getDate()).padStart(2, '0');
        const month = String(drawDate.getMonth() + 1).padStart(2, '0');
        const year = drawDate.getFullYear();
        const dateFormatted = `${day}/${month}/${year} 18:15`;
        const drawNum = 1350 + startDayOffset + i;
        const drawCode = `#${drawNum}`;

        generatedDraws.push({
          id: `baoloto_${year}${month}${day}`,
          drawCode: drawCode,
          label: `${drawCode} - ${dateFormatted}`,
          timeStr: '18:15:00',
          dateStr: dateFormatted,
          closeTime: drawDate.toISOString(),
        });
      }
      setDrawCycles(generatedDraws);
      setSelectedDraws([generatedDraws[0].id]);
      const closeTimeMs = new Date(generatedDraws[0].closeTime).getTime();
      setCountdown(Math.max(0, Math.floor((closeTimeMs - Date.now()) / 1000)));
    } finally {
      setIsDrawLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchActiveDraw();
    }, [gameId])
  );

  const handleStatsPress = () => {
    navigation.navigate('StatsDienToan');
  };

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

      addToCart({
        gameId: payload.gameId,
        gameName: payload.gameName,
        playType: payload.playType,
        numbers: allNumbers,
        cost: totalCost,
        baseCost: payload.unitAmount || payload.boards[0]?.unitAmount || payload.boards[0]?.cost || 10000,
        unitAmount: payload.unitAmount || payload.boards[0]?.unitAmount,
        multiplier: payload.multiplier || payload.boards[0]?.multiplier,
        quantity: payload.drawIds ? payload.drawIds.length : 1,
        boards: payload.boards,
      });

      Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã thêm vé vào giỏ hàng' });
      isAddingToCart.current = false;
    } else {
      navigation.navigate('GamePayment', payload);
    }
  };

  // Set initial config
  let initialName = 'LÔ TÔ';
  let initialRate = '🏆 x20.000 lần';
  let initialSlots = 2; // Default 2 numbers

  if (gameId === 'loto_235') {
    initialName = 'LÔ TÔ 2, 3, 5 SỐ';
    initialRate = '🏆 x20.000 lần';
    initialSlots = 2;
  } else if (gameId === 'loto_cap') {
    initialName = 'LÔ TÔ 2, 3, 4 CẶP';
    initialRate = '🏆 x110 lần';
    initialSlots = 4; // 2 pairs (4 digits)
  } else if (gameId === 'dientoan_636' || gameId === 'bao_636') {
    initialName = gameId === 'dientoan_636' ? 'ĐIỆN TOÁN 6X36' : 'BAO 6X36';
    initialRate = '🏆 Lịch mở: T4 & T7';
    initialSlots = 6;
  } else if (gameId === 'than_tai_4') {
    initialName = 'THẦN TÀI 4 / ĐT 1-2-3';
    initialRate = '🏆 Giải thưởng: 179.000.000đ';
    initialSlots = 4;
  } else {
    initialName = 'BAO LÔ TÔ 2 SỐ';
    initialRate = '🏆 Tỉ lệ hấp dẫn';
    initialSlots = 2;
  }

  const [activeSlotTab, setActiveSlotTab] = useState<number>(initialSlots);
  const [slots, setSlots] = useState<string[]>(Array(initialSlots).fill(''));
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [dynamicRate, setDynamicRate] = useState<number>(99);

  useEffect(() => {
    const fetchGameConfig = async () => {
      try {
        const { data } = await api.get('/games');
        if (Array.isArray(data)) {
          const g = data.find((item: any) => item.code === gameId);
          if (g?.payoutRates?.['Bao 2 số'] || g?.payoutRates?.['bao_2']) {
            setDynamicRate(Number(g.payoutRates['Bao 2 số'] || g.payoutRates['bao_2']));
          }
        }
      } catch (e) {}
    };
    fetchGameConfig();
  }, [gameId]);

  // Amount per number (Số tiền đánh / 1 con)
  const [unitAmountStr, setUnitAmountStr] = useState<string>('1.000');
  const unitAmount = parseInt(unitAmountStr.replace(/[^0-9]/g, ''), 10) || 0;
  const drawCount = selectedDraws.length || 1;
  const singleDrawCost = unitAmount * 27;
  const totalCost = singleDrawCost * drawCount;
  const winAmount = unitAmount * dynamicRate;

  const handleLotoSubclassChange = (num: number) => {
    setActiveSlotTab(num);
    setSlots(Array(num).fill(''));
    setActiveSlotIndex(0);
  };

  const handleKeyPress = (val: string) => {
    const updated = [...slots];
    updated[activeSlotIndex] = val;
    setSlots(updated);

    if (activeSlotIndex < slots.length - 1) {
      setActiveSlotIndex(activeSlotIndex + 1);
    }
  };

  const handleDelete = () => {
    const updated = [...slots];
    updated[activeSlotIndex] = '';
    setSlots(updated);

    if (activeSlotIndex > 0) {
      setActiveSlotIndex(activeSlotIndex - 1);
    }
  };

  const handleAutoFill = () => {
    const randDigits = Array.from({ length: slots.length }, () =>
      Math.floor(Math.random() * 10).toString()
    );
    setSlots(randDigits);
    setActiveSlotIndex(slots.length - 1);
  };

  const handleCheckout = () => {
    if (slots.some((s) => s === '')) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng điền đầy đủ tất cả các chữ số.' });
      return;
    }
    if (unitAmount <= 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập số tiền cược hợp lệ.' });
      return;
    }

    processCheckout({
      gameId,
      gameName: initialName,
      playType: gameId === 'loto_235' ? `Lô tô ${activeSlotTab} số` : 'Bao lô tô 2 số',
      unitAmount: unitAmount,
      multiplier: unitAmount,
      drawIds: selectedDraws,
      boards: [
        {
          id: 'A',
          isTC: false,
          numbers: [slots.join('')],
          cost: totalCost,
          unitAmount: unitAmount,
          multiplier: unitAmount,
        },
      ],
      cost: totalCost,
      totalCost: totalCost,
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F2942" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{initialName}</Text>
        <View style={styles.infoBtn} />
      </View>

      {/* Draw Information Bar */}
      <View style={styles.drawInfoBarContainer}>
        <TouchableOpacity
          style={styles.drawBox}
          onPress={() => {
            setTempSelectedDraws([...selectedDraws]);
            setIsDrawPickerVisible(true);
          }}
        >
          <Text style={styles.drawLabel}>Kỳ quay:</Text>
          <Text style={styles.drawCycleRed}>
            {isDrawLoading || drawCycles.length === 0
              ? 'Đang tải...'
              : `${(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.drawCode || 'Đang tải...'} - ${(drawCycles.find(d => selectedDraws.includes(d.id)) || drawCycles[0])?.dateStr}`}
          </Text>
          <Text style={styles.drawTime}>
            {selectedDraws.length > 1 ? `+${selectedDraws.length - 1} kỳ` : `${formatTime(countdown)} ▼`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chartBtn} onPress={handleStatsPress}>
          <BarChart2 size={18} color="#00A859" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Toggle options for Loto 2, 3, 5 */}
        {gameId === 'loto_235' && (
          <View style={styles.tabRow}>
            {[2, 3, 5].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.tabBtn,
                  activeSlotTab === num && styles.tabBtnActive
                ]}
                onPress={() => handleLotoSubclassChange(num)}
              >
                <Text style={[styles.tabBtnText, activeSlotTab === num && styles.tabBtnTextActive]}>
                  Lô Tô {num} Số
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.instructionCard}>
          <Text style={styles.instructionText}>
            Nhấp chọn từng ô và dùng bàn phím số phía dưới để nhập dãy số dự thưởng của bạn.
          </Text>
        </View>

        {/* Input Slots */}
        <View style={styles.slotsContainer}>
          {slots.map((val, idx) => {
            const isActive = idx === activeSlotIndex;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.slotBox,
                  isActive && styles.slotBoxActive,
                  val !== '' && styles.slotBoxFilled
                ]}
                onPress={() => setActiveSlotIndex(idx)}
              >
                <Text style={[
                  styles.slotText,
                  isActive && styles.slotTextActive,
                  val !== '' && styles.slotTextFilled
                ]}>
                  {val === '' ? '?' : val}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.autoFillBtn} onPress={handleAutoFill}>
          <Text style={styles.autoFillBtnText}>Tạo Số Ngẫu Nhiên</Text>
        </TouchableOpacity>

        {/* Ô nhập số tiền cược cho 1 con */}
        <View style={styles.amountInputCard}>
          <Text style={styles.amountInputLabel}>Số tiền cược / 1 con (VNĐ):</Text>
          <View style={styles.amountInputRow}>
            <TextInput
              style={styles.amountTextInput}
              value={unitAmountStr}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, '');
                setUnitAmountStr(numeric ? Number(numeric).toLocaleString('vi-VN') : '');
              }}
              keyboardType="numeric"
              placeholder="Nhập số tiền"
              placeholderTextColor="#999"
            />
            <Text style={styles.currencyUnit}>VNĐ</Text>
          </View>
          {/* Quick Preset Buttons */}
          <View style={styles.quickAmountRow}>
            {[1000, 5000, 10000, 20000, 50000].map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.quickAmountBtn,
                  unitAmount === amt && styles.quickAmountBtnActive,
                ]}
                onPress={() => setUnitAmountStr(amt.toLocaleString('vi-VN'))}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    unitAmount === amt && styles.quickAmountTextActive,
                  ]}
                >
                  {amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}K`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Embedded Custom Numeric Keyboard */}
      <View style={styles.keyboardContainer}>
        <View style={styles.keyboardRow}>
          {['1', '2', '3'].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => handleKeyPress(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyboardRow}>
          {['4', '5', '6'].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => handleKeyPress(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyboardRow}>
          {['7', '8', '9'].map((key) => (
            <TouchableOpacity key={key} style={styles.key} onPress={() => handleKeyPress(key)}>
              <Text style={styles.keyText}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.keyboardRow}>
          <View style={[styles.key, { backgroundColor: 'transparent' }]} />
          <TouchableOpacity style={styles.key} onPress={() => handleKeyPress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.key, styles.deleteKey]} onPress={handleDelete}>
            <Delete size={24} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer UI matching other games */}
      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom) + 16 }]}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tạm tính:</Text>
          <Text style={styles.totalVal}>{totalCost.toLocaleString('vi-VN')} VNĐ</Text>
        </View>

        <View style={[styles.totalRow, { marginTop: 2 }]}>
          <Text style={[styles.totalLabel, { color: '#00A859' }]}>Thắng tạm tính:</Text>
          <Text style={[styles.totalVal, { color: '#00A859' }]}>
            {winAmount.toLocaleString('vi-VN')} VNĐ
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 10 }}>
          <TouchableOpacity
            style={[styles.checkoutBtn, { flex: 1, backgroundColor: COLORS.secondary }]}
            onPress={() => {
              isAddingToCart.current = true;
              handleCheckout();
            }}
          >
            <Text style={styles.checkoutBtnText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.checkoutBtn, { flex: 1, backgroundColor: '#E51F27' }]}
            onPress={() => {
              isAddingToCart.current = false;
              handleCheckout();
            }}
          >
            <Text style={styles.checkoutBtnText}>Đặt vé ngay</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chọn kỳ mua Modal */}
      {isDrawPickerVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.drawModalContent}>
            <View style={styles.drawModalHeader}>
              <Text style={styles.drawModalTitle}>Chọn kỳ mua</Text>
              <TouchableOpacity onPress={() => setIsDrawPickerVisible(false)} style={styles.drawModalCloseBtn}>
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
                drawCycles.map((cycle) => {
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBF0F3',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  infoBtn: {
    width: 32,
    height: 32,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.md,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  tabBtnActive: {
    backgroundColor: COLORS.cardBackground,
    ...SHADOWS.light,
  },
  tabBtnText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tabBtnTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  instructionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  slotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  slotBox: {
    width: 48,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  slotBoxActive: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.dienToanBg,
  },
  slotBoxFilled: {
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.gray400,
  },
  slotTextActive: {
    color: COLORS.secondary,
  },
  slotTextFilled: {
    color: COLORS.textDark,
  },
  autoFillBtn: {
    backgroundColor: COLORS.gray200,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  autoFillBtnText: {
    color: COLORS.gray600,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  amountInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#EBF0F3',
  },
  amountInputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0084FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F7FA',
    height: 44,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2942',
    padding: 0,
  },
  currencyUnit: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7F8E9C',
    marginLeft: 8,
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D0D7DE',
    backgroundColor: '#F0F3F6',
    alignItems: 'center',
  },
  quickAmountBtnActive: {
    backgroundColor: '#0084FA',
    borderColor: '#0084FA',
  },
  quickAmountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A5D6E',
  },
  quickAmountTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  keyboardContainer: {
    backgroundColor: COLORS.gray200,
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  keyboardRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  key: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  deleteKey: {
    backgroundColor: COLORS.gray300,
  },
  keyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBF0F3',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 13,
    color: '#7F8E9C',
    fontWeight: '500',
  },
  totalVal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  checkoutBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  drawInfoBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EBF0F3',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  drawModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '75%',
    overflow: 'hidden',
  },
  drawModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0F2942',
  },
  drawModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  drawModalCloseBtn: {
    padding: 4,
  },
  drawModalScrollList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  drawModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
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
    borderColor: '#D0D5DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawCheckboxChecked: {
    borderColor: '#FF3B30',
  },
  drawModalItemText: {
    fontSize: 14,
    fontWeight: '600',
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
    width: '100%',
    backgroundColor: '#0084FA',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  drawConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
