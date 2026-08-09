import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import api from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CoBuyPaymentScreen({ route, navigation }: any) {
  const { roomId, baoType, roomNum, cost, percent, gameType } = route.params;
  const insets = useSafeAreaInsets();
  
  // App store states & actions
  const { user, fetchProfile } = useAppStore();

  // Toggle collapsible cards
  const [isCustomerInfoExpanded, setIsCustomerInfoExpanded] = useState(true);
  const [isProductInfoExpanded, setIsProductInfoExpanded] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    if (!user || cost > (user.balance || 0)) {
      Alert.alert('Lỗi', 'Số dư tài khoản mua vé không đủ. Vui lòng nạp thêm tiền vào ví.');
      return;
    }

    setIsLoading(true);

    try {
      if (!roomId) {
        throw new Error('Thiếu ID phòng');
      }

      await api.post(`/cobuy/rooms/${roomId}/join`, {
        percent: percent,
        cost: cost
      });

      await fetchProfile();
      
      setIsLoading(false);
      Alert.alert('Thành công', 'Thanh toán góp nhóm thành công!', [
        { text: 'Đóng', onPress: () => navigation.popToTop() }
      ]);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Thất bại', error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F2942" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Nguồn thanh toán */}
        <Text style={styles.sectionHeading}>Nguồn thanh toán:</Text>
        <View style={styles.paymentSourceBox}>
          <View style={styles.paymentSourceLeft}>
            {/* Vietlott style gold circular badge */}
            <View style={styles.goldBadge}>
              <Text style={styles.goldBadgeText}>VT</Text>
            </View>
            <Text style={styles.paymentSourceTitle}>TÀI KHOẢN MUA VÉ:</Text>
          </View>
          <View style={styles.paymentSourceRight}>
            <Text style={styles.balanceText}>{user?.balance.toLocaleString('vi-VN')}đ</Text>
            <View style={styles.radioSelectedOuter}>
              <View style={styles.radioSelectedInner} />
            </View>
          </View>
        </View>

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
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoValue}>0899955742</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Họ tên:</Text>
              <Text style={styles.infoValue}>{user?.name}</Text>
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
              Mua chung - {gameType === 'mega' ? 'Mega 6/45' : 'Power 6/55'} - Bao {baoType}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={[styles.footerContainer, { paddingBottom: 16 + insets.bottom }]}>
        <View style={styles.footerInfo}>
          <Text style={styles.footerLabel}>Tổng tiền:</Text>
          <Text style={styles.footerValue}>{cost.toLocaleString('vi-VN')}đ</Text>
        </View>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
          <Text style={styles.payBtnText}>Thanh toán</Text>
        </TouchableOpacity>
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
    paddingBottom: 100,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2942',
    marginBottom: 12,
  },
  paymentSourceBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E51F27',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    marginBottom: 20,
    ...SHADOWS.light,
  },
  paymentSourceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  goldBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF9DB',
    borderWidth: 1,
    borderColor: '#FFD43B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#E51F27',
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
  radioSelectedOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E51F27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelectedInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
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
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
    padding: 16,
    gap: 12,
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
    backgroundColor: '#F1F3F5',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  productText: {
    fontSize: 13,
    color: '#0F2942',
    fontWeight: '500',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 13,
    color: '#7F8E9C',
  },
  footerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E51F27',
    marginTop: 2,
  },
  payBtn: {
    backgroundColor: '#0084FA',
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
