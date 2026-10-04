import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, StatusBar, ActivityIndicator, Modal } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAppStore, CartItem } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import { ShoppingCart, Trash2, ArrowRight, ChevronLeft, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen({ navigation }: any) {
  const { cart, user, removeFromCart, checkout } = useAppStore();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const totalCost = cart.reduce((acc, item) => acc + (item.cost * item.quantity), 0);


  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);

  const handleCheckout = async () => {
    if (isCheckoutLoading) return;
    setIsCheckoutLoading(true);
    const res = await checkout();
    setIsCheckoutLoading(false);

    if (res.success) {
      Toast.show({ type: 'success', text1: 'Thành công', text2: res.message });
      navigation.navigate('MainTabs');
    } else {
      Toast.show({ type: 'error', text1: 'Thất bại', text2: res.message });
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.gameInfo}>
          <Text style={styles.gameName}>{item.gameName}</Text>
          {item.provinceName && (
            <Text style={styles.provinceName}>{item.provinceName}</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => removeFromCart(item.id)}>
          <Trash2 size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.numbersContainer}>
        {item.numbers.slice(0, 10).map((num, index) => (
          <View key={index} style={styles.numberBall}>
            <Text style={styles.numberBallText}>{num}</Text>
          </View>
        ))}
        {item.numbers.length > 10 && (
          <TouchableOpacity
            style={[styles.numberBall, { backgroundColor: '#E8F3FF', borderColor: '#0084FA' }]}
            onPress={() => {
              setSelectedNumbers(item.numbers);
              setModalVisible(true);
            }}
          >
            <Text style={[styles.numberBallText, { color: '#0084FA' }]}>+{item.numbers.length - 10}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.typeText}>
          {item.playType ? `Loại: ${item.playType}` : 'Vé tiêu chuẩn'}
        </Text>
        <Text style={styles.costText}>
          {formatVND(item.cost * item.quantity)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top + 12 : 16 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GIỎ VÉ</Text>
        <View style={{ width: 32 }} />
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ShoppingCart size={64} color={COLORS.gray400} />
          <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
          <Text style={styles.emptySubtitle}>
            Vui lòng chọn số tại trang chủ và thêm vé vào giỏ hàng.
          </Text>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.playBtnText}>Chọn Số Ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />

          <View style={[styles.checkoutFooter, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Số dư của bạn:</Text>
              <Text style={styles.balanceValue}>{formatVND(user?.balance || 0)}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tổng thanh toán:</Text>
              <Text style={styles.totalValue}>{formatVND(totalCost)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutBtn, isCheckoutLoading && { opacity: 0.7 }]}
              onPress={handleCheckout}
              disabled={isCheckoutLoading}
            >
              {isCheckoutLoading ? (
                <ActivityIndicator color={COLORS.textLight} />
              ) : (
                <>
                  <Text style={styles.checkoutBtnText}>Thanh Toán Ngay</Text>
                  <ArrowRight size={20} color={COLORS.textLight} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Numbers Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '80%', padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0F2942' }}>Tất cả {selectedNumbers.length} bộ số</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#0F2942" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedNumbers}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ width: 40, color: '#7F8E9C', fontWeight: 'bold' }}>#{index + 1}</Text>
                  <Text style={{ fontSize: 16, color: '#0F2942', fontWeight: '500' }}>{item}</Text>
                </View>
              )}
              initialNumToRender={20}
              maxToRenderPerBatch={50}
              windowSize={5}
            />
          </View>
        </View>
      </Modal>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 220,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  provinceName: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  numbersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  numberBall: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  typeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
  },
  costText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    lineHeight: 20,
  },
  playBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.xxl,
    ...SHADOWS.medium,
  },
  playBtnText: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  checkoutFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.dark,
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  balanceLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
  },
  balanceValue: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  totalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  totalValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    ...SHADOWS.medium,
  },
  checkoutBtnText: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
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
});
