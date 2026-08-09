import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { ArrowLeft, ShoppingCart, Delete } from 'lucide-react-native';

export default function GameLayoutBScreen({ route, navigation }: any) {
  const { gameId } = route.params;
  const addToCart = useAppStore((state) => state.addToCart);

  // Set initial config
  let initialName = 'LÔ TÔ';
  let initialRate = '🏆 x20.000 lần';
  let initialSlots = 2; // Default 2 numbers

  if (gameId === 'loto_235') {
    initialName = 'LÔ TÔ 2, 3, 5 Số';
    initialRate = '🏆 x20.000 lần';
    initialSlots = 2;
  } else if (gameId === 'loto_cap') {
    initialName = 'LÔ TÔ 2, 3, 4 Cặp';
    initialRate = '🏆 x110 lần';
    initialSlots = 4; // 2 pairs (4 digits)
  } else if (gameId === 'dientoan_636' || gameId === 'bao_636') {
    initialName = gameId === 'dientoan_636' ? 'ĐIỆN TOÁN 6x36' : 'BAO 6x36';
    initialRate = '🏆 Lịch mở: T4 & T7';
    initialSlots = 6;
  } else if (gameId === 'than_tai_4') {
    initialName = 'Thần Tài 4 / ĐT 1-2-3';
    initialRate = '🏆 Trúng đến x1.220 lần';
    initialSlots = 4;
  } else {
    initialName = 'BAO LÔ TÔ 2 Số';
    initialRate = '🏆 Tỉ lệ hấp dẫn';
    initialSlots = 2;
  }

  const [activeSlotTab, setActiveSlotTab] = useState<number>(initialSlots); // Toggle tabs for Loto 2,3,5
  const [slots, setSlots] = useState<string[]>(Array(initialSlots).fill(''));
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  // Dynamically reset slots when changing subclass for loto_235
  const handleLotoSubclassChange = (num: number) => {
    setActiveSlotTab(num);
    setSlots(Array(num).fill(''));
    setActiveSlotIndex(0);
  };

  const handleKeyPress = (val: string) => {
    const updated = [...slots];
    updated[activeSlotIndex] = val;
    setSlots(updated);

    // Auto advance
    if (activeSlotIndex < slots.length - 1) {
      setActiveSlotIndex(activeSlotIndex + 1);
    }
  };

  const handleDelete = () => {
    const updated = [...slots];
    updated[activeSlotIndex] = '';
    setSlots(updated);
    
    // Auto retreat
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

  const handleAddToCart = () => {
    if (slots.some((s) => s === '')) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ tất cả các chữ số.');
      return;
    }

    const numberStr = slots.join('');
    const cost = 10000; // 10k VND standard price

    navigation.navigate('GamePayment', {
      gameId,
      gameName: initialName,
      playType: gameId === 'loto_235' ? `Lô tô ${activeSlotTab} số` : 'Vé Điện Toán',
      boards: [{
        id: 'A',
        isTC: false,
        numbers: [numberStr],
        cost: cost
      }],
      totalCost: cost
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{initialName}</Text>
          <Text style={styles.headerSubtitle}>{initialRate}</Text>
        </View>
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

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerCostLabel}>Tổng tiền:</Text>
          <Text style={styles.footerCostVal}>10.000 đ</Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
          <ShoppingCart size={20} color={COLORS.textLight} />
          <Text style={styles.addBtnText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitleContainer: {
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.secondary,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    marginTop: 2,
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
    marginBottom: SPACING.xl,
  },
  autoFillBtnText: {
    color: COLORS.gray600,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
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
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.medium,
  },
  addBtnText: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
});
