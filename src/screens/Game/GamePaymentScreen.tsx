import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp, Info, Check } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import api from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PaymentMethod = 'wallet' | 'momo' | 'viettel' | 'qr';

export default function GamePaymentScreen({ route, navigation }: any) {
  const { gameId, gameName, playType, boards, totalCost, drawIds, drawDate } = route.params;
  const insets = useSafeAreaInsets();
  
  // App store states & actions
  const { user, fetchProfile } = useAppStore();

  // Selected payment method
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('wallet');

  // Toggle collapsible cards
  const [isCustomerInfoExpanded, setIsCustomerInfoExpanded] = useState(true);
  const [isProductInfoExpanded, setIsProductInfoExpanded] = useState(true);



  // Loading state when placing ticket
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (selectedMethod !== 'wallet') {
      Alert.alert('Thông báo', 'Hiện tại hệ thống chỉ hỗ trợ thanh toán qua Tài khoản mua vé. Vui lòng chọn Tài khoản mua vé.');
      return;
    }

    if (!user || totalCost > (user.balance || 0)) {
      Alert.alert('Thất bại', 'Số dư không đủ! Vui lòng nạp thêm tiền.');
      return;
    }

    setIsLoading(true);

    try {
      const itemsPayload = boards.map((board: any) => ({
        id: board.id,
        numbers: board.isTC ? ['TC'] : board.numbers,
        cost: board.cost || (totalCost / boards.length),
      }));

      // If drawIds is passed (Matrix/Keno games), create an order for each draw
      // If drawDate is passed (KienThiet games), just pass drawId as drawDate for now, or fetch active draw
      const targetDrawIds = drawIds && drawIds.length > 0 ? drawIds : [drawDate || 'DUMMY_DRAW_ID'];

      for (const drawId of targetDrawIds) {
        await api.post('/orders', {
          gameType: gameId,
          playType: playType,
          drawId: drawId,
          items: itemsPayload
        });
      }

      await fetchProfile();
      
      setIsLoading(false);
      Alert.alert('Thành công', 'Đặt vé thành công!', [
        { text: 'Đóng', onPress: () => navigation.popToTop() }
      ]);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Thất bại', error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F2942" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Nguồn thanh toán */}
        <Text style={styles.sectionHeading}>Nguồn thanh toán:</Text>

        {/* TÀI KHOẢN MUA VÉ */}
        <TouchableOpacity 
          style={[styles.paymentSourceBox, selectedMethod === 'wallet' && styles.paymentSourceBoxSelected]}
          onPress={() => setSelectedMethod('wallet')}
        >
          <View style={styles.paymentSourceLeft}>
            <View style={styles.vtBadge}>
              <Text style={styles.vtBadgeText}>VT</Text>
            </View>
            <Text style={styles.paymentSourceTitle}>TÀI KHOẢN MUA VÉ:</Text>
          </View>
          <View style={styles.paymentSourceRight}>
            <Text style={styles.balanceText}>{ (user?.balance || 0).toLocaleString('vi-VN')}đ</Text>
            <View style={[styles.radioButton, selectedMethod === 'wallet' && styles.radioButtonSelected]}>
              {selectedMethod === 'wallet' && <View style={styles.radioButtonInner} />}
            </View>
          </View>
        </TouchableOpacity>

        {/* Thông tin khách hàng */}
        <View style={styles.collapsibleHeader}>
          <Text style={styles.collapsibleTitle}>Thông tin khách hàng</Text>
          <TouchableOpacity onPress={() => setIsCustomerInfoExpanded(!isCustomerInfoExpanded)}>
            {isCustomerInfoExpanded ? (
              <ChevronUp size={20} color="#0F2942" />
            ) : (
              <ChevronDown size={20} color="#0F2942" />
            )}
          </TouchableOpacity>
        </View>

        {isCustomerInfoExpanded && (
          <View style={styles.customerInfoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Luan</Text>
              <Text style={styles.infoValue}>0899955742</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>CCCD:</Text>
              <Text style={styles.infoValue}>070200112465</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>--</Text>
            </View>
          </View>
        )}

        {/* Thông tin sản phẩm */}
        <View style={styles.collapsibleHeader}>
          <Text style={styles.collapsibleTitle}>Thông tin sản phẩm</Text>
          <TouchableOpacity onPress={() => setIsProductInfoExpanded(!isProductInfoExpanded)}>
            {isProductInfoExpanded ? (
              <ChevronUp size={20} color="#0F2942" />
            ) : (
              <ChevronDown size={20} color="#0F2942" />
            )}
          </TouchableOpacity>
        </View>

        {isProductInfoExpanded && (
          <View style={styles.productInfoCard}>
            <Text style={styles.productText}>
              {gameName}-{playType}
            </Text>
            
            {/* Show board numbers breakdown */}
            <View style={styles.boardsBreakdown}>
              {boards.map((board: any, idx: number) => (
                <View key={board.id} style={styles.boardDetailRow}>
                  <Text style={styles.boardDetailId}>Dãy {board.id}:</Text>
                  <Text style={styles.boardDetailNumbers}>
                    {board.isTC 
                      ? 'Tự chọn (TC)' 
                      : gameId === 'lotto_535'
                        ? `${board.numbers.join(' ')} | ${board.specialNumbers ? board.specialNumbers.join(' ') : ''}`
                        : ((gameId === 'loto_235' && playType.includes('Bao 2 số')) || (gameId === 'dientoan_636' && playType.includes('Bao')))
                          ? `Danh sách bộ số: ${board.numbers.join(', ')}`
                          : (gameId === 'max_3d' && board.numbers.length === 6)
                            ? `${board.numbers.slice(0, 3).join(' ')} | ${board.numbers.slice(3, 6).join(' ')}`
                            : board.numbers.join(' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Warning Note */}
        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>Thời gian chốt vé tự động của ngày:</Text>
          <Text style={styles.warningText}>1. Vé số Vietlott và Điện toán thủ đô: trước 17:20 ngày quay thưởng.</Text>
          <Text style={styles.warningText}>2. Sản phẩm Lotto 5/35 có 2 kỳ quay/ngày: trước 12h00 và 20h00 của kỳ quay thưởng.</Text>
          <Text style={styles.warningText}>3. Xổ số kiến thiết Miền Nam: trước 15:40 ngày quay thưởng.</Text>
          <Text style={styles.warningText}>4. Xổ số kiến thiết Miền Trung: trước 16:40 ngày quay thưởng.</Text>
          <Text style={styles.warningText}>5. Xổ số kiến thiết Miền Bắc: trước 17:30 ngày quay thưởng.</Text>
          <Text style={[styles.warningText, { marginTop: 8, fontStyle: 'italic', fontWeight: 'bold' }]}>CSKH chỉ tiếp nhận và xử lý các báo lỗi được gửi trong thời gian trên.</Text>
          <Text style={[styles.warningText, { marginTop: 4, color: '#E51F27', fontWeight: 'bold' }]}>⚠️ Sau thời gian trên, thông tin trên vé vật lý và ảnh vé trong lịch sử mua vé được xem là chính xác và là căn cứ duy nhất để xác định kết quả trúng thưởng.</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={[styles.footerContainer, { paddingBottom: 16 + insets.bottom }]}>

        <View style={styles.footerActionRow}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>Tổng tiền:</Text>
            <View style={styles.totalAmountValRow}>
              <Text style={styles.footerValue}>{totalCost.toLocaleString('vi-VN')}đ</Text>
              <ChevronDown size={16} color="#FF3B30" style={{ marginLeft: 4 }} />
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.payBtn, isLoading && styles.payBtnDisabled]} 
            onPress={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.payBtnText}>Đặt vé</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 160,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2942',
    marginBottom: 12,
  },
  warningContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEEBA',
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 2,
    lineHeight: 18,
  },
  paymentSourceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 10,
    ...SHADOWS.light,
  },
  paymentSourceBoxSelected: {
    borderColor: '#E51F27',
    borderWidth: 1.5,
  },
  paymentSourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vtBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF9DB',
    borderWidth: 1,
    borderColor: '#FFD43B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vtBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E51F27',
  },
  paymentIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIconBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  paymentSourceTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  paymentSourceRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2F9E44',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#E51F27',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E51F27',
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  collapsibleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  customerInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    ...SHADOWS.light,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#7F8E9C',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  productInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    ...SHADOWS.light,
  },
  productText: {
    fontSize: 13,
    color: '#0F2942',
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 8,
    marginBottom: 8,
  },
  boardsBreakdown: {
    gap: 6,
  },
  boardDetailRow: {
    flexDirection: 'row',
  },
  boardDetailId: {
    width: 60,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7F8E9C',
  },
  boardDetailNumbers: {
    flex: 1,
    fontSize: 12,
    color: '#0F2942',
    fontWeight: 'bold',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    ...SHADOWS.dark,
  },
  confirmEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: '#0084FA',
    backgroundColor: '#0084FA',
  },
  confirmEmailText: {
    fontSize: 12,
    color: '#7F8E9C',
    flex: 1,
  },
  infoIconBtn: {
    padding: 2,
  },
  footerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    color: '#7F8E9C',
  },
  totalAmountValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  footerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  payBtn: {
    backgroundColor: '#0084FA',
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 36,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  payBtnDisabled: {
    backgroundColor: '#B0D4FF',
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
