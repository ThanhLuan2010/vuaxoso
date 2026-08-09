import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Info, Copy } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';

export default function DepositBinanceScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [amountStr, setAmountStr] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [binanceConfig, setBinanceConfig] = useState<any>(null);

  useEffect(() => {
    fetchBinanceConfig();
  }, []);

  const fetchBinanceConfig = async () => {
    try {
      const { data } = await api.get('/settings/binance_config');
      setBinanceConfig(data);
    } catch (error) {
      console.log('Error fetching config', error);
    }
  };

  const handleAmountChange = (text: string) => {
    const formatted = text.replace(/[^0-9]/g, '');
    setAmountStr(formatted);
  };

  const handleDeposit = async () => {
    if (!txId) {
      Alert.alert('Lỗi', 'Vui lòng nhập Mã giao dịch (TxID)');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/wallet/deposit/binance', { txId });
      Alert.alert('Thành công', 'Nạp tiền tự động qua Binance thành công!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nạp Tiền qua Binance</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <Info size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Thông tin ví nhận (USDT TRC20/BEP20)</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.label}>Địa chỉ ví:</Text>
            <View style={styles.addressRow}>
              <Text style={styles.addressText}>{binanceConfig?.walletAddress || 'Chưa cấu hình'}</Text>
              <TouchableOpacity style={styles.copyBtn}>
                <Copy size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.noteText}>Vui lòng chuyển USDT vào đúng địa chỉ ví ở trên.</Text>
            <Text style={styles.noteText}>Tỷ giá hiện tại: 1 USDT = {binanceConfig?.exchangeRate?.toLocaleString('vi-VN') || '25,000'} VNĐ</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Số tiền dự kiến nạp (Tùy chọn ghi nhớ)</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.amountInput}
                value={amountStr}
                onChangeText={handleAmountChange}
                placeholder="Nhập số USDT đã chuyển"
                placeholderTextColor={COLORS.gray400}
                keyboardType="decimal-pad"
              />
              <Text style={styles.currencyText}>USDT</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Nhập Mã Giao Dịch (TxID)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.txIdInput}
              value={txId}
              onChangeText={setTxId}
              placeholder="VD: 5543bd12..."
              placeholderTextColor={COLORS.gray400}
            />
          </View>
          <Text style={styles.noteText}>Sau khi chuyển khoản thành công trên app Binance (hoặc ví khác), copy mã TxID điền vào đây để hệ thống tự động duyệt.</Text>
        </View>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]} 
          onPress={handleDeposit}
          disabled={loading}
        >
          <Text style={styles.submitBtnText}>{loading ? 'Đang kiểm tra...' : 'Xác nhận Nạp'}</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: '#FFF',
    ...SHADOWS.small,
    zIndex: 10,
  },
  headerBtn: {
    padding: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textDark,
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  cardInfo: {
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  label: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray100,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  addressText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textDark,
    flex: 1,
  },
  copyBtn: {
    padding: 4,
  },
  noteText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.error,
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  amountInput: {
    flex: 1,
    ...TYPOGRAPHY.h2,
    color: COLORS.primary,
    paddingVertical: SPACING.md,
  },
  currencyText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textLight,
  },
  txIdInput: {
    ...TYPOGRAPHY.body1,
    color: COLORS.textDark,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.gray400,
  },
  submitBtnText: {
    ...TYPOGRAPHY.h4,
    color: '#FFF',
  },
});
