import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../../theme/theme';
import { styles } from '../walletStyles';
import AccountBalanceCard from './AccountBalanceCard';

interface WithdrawTabProps {
  user: any;
  binanceConfig: any;
  bottomInset: number;
  onRequestWithdraw: (
    amount: number,
    withdrawPassword?: string,
    destinationInfo?: any
  ) => Promise<{ success: boolean; message?: string }>;
}

export default function WithdrawTab({
  user,
  binanceConfig,
  bottomInset,
  onRequestWithdraw,
}: WithdrawTabProps) {
  const navigation = useNavigation<any>();

  const [amountStr, setAmountStr] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [showWithdrawPassword, setShowWithdrawPassword] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const formatVND = (num: number) => num.toLocaleString('vi-VN') + 'đ';

  const handleAmountChange = (text: string) => {
    const isCrypto = !!selectedDestination?.network;
    if (isCrypto) {
      const numericValue = text.replace(/[^0-9.]/g, '');
      setAmountStr(numericValue);
    } else {
      const numericValue = text.replace(/\D/g, '');
      if (!numericValue) {
        setAmountStr('');
        return;
      }
      const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      setAmountStr(formatted);
    }
  };

  const handleWithdraw = async () => {
    if (isWithdrawing) return;
    const isCrypto = !!selectedDestination?.network;
    const rate = binanceConfig?.exchangeRate || 25000;

    let amt = 0;
    let usdtAmount = 0;
    if (isCrypto) {
      usdtAmount = parseFloat(amountStr);
      amt = usdtAmount * rate;
    } else {
      amt = parseInt(amountStr.replace(/\D/g, ''), 10);
    }

    if (isNaN(amt) || amt <= 0) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập số tiền hợp lệ.' });
      return;
    }
    if (!user || amt > user.balance) {
      Toast.show({ type: 'error', text1: 'Thất bại', text2: 'Số dư không đủ để thực hiện giao dịch.' });
      return;
    }
    if (!selectedDestination) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn tài khoản/ví nhận tiền.' });
      return;
    }
    if (!withdrawPassword) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập mật khẩu rút tiền.' });
      return;
    }

    const destInfo = { ...selectedDestination };
    if (isCrypto) {
      destInfo.amountUsdt = usdtAmount;
    }

    setIsWithdrawing(true);
    try {
      const { success, message } = await onRequestWithdraw(amt, withdrawPassword, destInfo);
      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Thành công',
          text2: message || `Đã gửi yêu cầu rút ${formatVND(amt)}.`,
        });
        setAmountStr('');
        setWithdrawPassword('');
        setSelectedDestination(null);
        navigation.navigate('MainTabs');
      } else {
        Toast.show({ type: 'error', text1: 'Thất bại', text2: message || 'Có lỗi xảy ra.' });
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  const banks = user?.banks || [];
  const wallets = user?.wallets || [];
  const hasMethods = banks.length > 0 || wallets.length > 0;

  const isSelected = (method: any) => {
    if (!selectedDestination) return false;
    if (method.accountNumber && selectedDestination.accountNumber) {
      return method.accountNumber === selectedDestination.accountNumber;
    }
    if (method.address && selectedDestination.address) {
      return method.address === selectedDestination.address;
    }
    return false;
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.withdrawContent, { paddingBottom: Math.max(bottomInset, 24) }]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.accountInfoCenter,
          { marginTop: 16, marginBottom: 24, padding: 16, backgroundColor: '#FFF', borderRadius: 12 },
        ]}
      >
        <Text style={styles.accLabel}>Tài khoản: {user?.phone || '0899955742'}</Text>
        <Text style={styles.accName}>{user?.name || 'Guest'}</Text>
        <Text style={styles.accBalance}>Số dư: {formatVND(user?.balance || 0)}</Text>
      </View>

      {!hasMethods ? (
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <Text style={{ textAlign: 'center', color: COLORS.textDark, marginBottom: 12 }}>
            Bạn chưa cấu hình phương thức nhận tiền.
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')} style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Thêm phương thức nhận tiền</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: TYPOGRAPHY.fontSize.md,
              fontWeight: TYPOGRAPHY.fontWeight.semiBold,
              marginBottom: 8,
              color: '#0A3B7C',
            }}
          >
            Chọn phương thức nhận tiền
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {banks.map((b: any, i: number) => (
              <TouchableOpacity
                key={`b-${i}`}
                style={[styles.methodCard, isSelected(b) && styles.methodCardActive]}
                onPress={() => setSelectedDestination(b)}
              >
                <Text style={[styles.methodCardTitle, isSelected(b) && styles.methodCardTextActive]}>
                  {b.bankName}
                </Text>
                <Text style={[styles.methodCardDesc, isSelected(b) && styles.methodCardTextActive]}>
                  {b.accountNumber}
                </Text>
              </TouchableOpacity>
            ))}
            {wallets.map((w: any, i: number) => (
              <TouchableOpacity
                key={`w-${i}`}
                style={[styles.methodCard, isSelected(w) && styles.methodCardActive]}
                onPress={() => setSelectedDestination(w)}
              >
                <Text style={[styles.methodCardTitle, isSelected(w) && styles.methodCardTextActive]}>
                  Ví {w.network}
                </Text>
                <Text style={[styles.methodCardDesc, isSelected(w) && styles.methodCardTextActive]}>
                  {w.address.substring(0, 10)}...
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.floatingLabelContainer}>
          <Text style={styles.floatingLabel}>Số tiền rút</Text>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.amountInput}
            value={amountStr}
            onChangeText={handleAmountChange}
            placeholder="Nhập số tiền"
            placeholderTextColor={COLORS.gray400}
            keyboardType={selectedDestination?.network ? 'decimal-pad' : 'number-pad'}
          />
          <Text style={styles.currencyText}>{selectedDestination?.network ? 'USDT' : 'VNĐ'}</Text>
        </View>
      </View>

      <View style={[styles.inputContainer, { marginTop: 24 }]}>
        <View style={styles.floatingLabelContainer}>
          <Text style={styles.floatingLabel}>Mật khẩu rút tiền</Text>
        </View>
        <View style={[styles.inputRow, { paddingRight: 16 }]}>
          <TextInput
            style={[styles.amountInput, { flex: 1 }]}
            value={withdrawPassword}
            onChangeText={setWithdrawPassword}
            placeholder="Nhập mật khẩu rút tiền"
            placeholderTextColor={COLORS.gray400}
            secureTextEntry={!showWithdrawPassword}
          />
          <TouchableOpacity onPress={() => setShowWithdrawPassword(!showWithdrawPassword)}>
            {showWithdrawPassword ? (
              <EyeOff size={20} color={COLORS.gray500} />
            ) : (
              <Eye size={20} color={COLORS.gray500} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          marginTop: 24,
          padding: 16,
          backgroundColor: '#f9f9f9',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#eee',
        }}
      >
        <Text style={{ fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Quy định rút tiền:</Text>
        <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>• Số lần rút: Tối đa 5 lần/ngày</Text>
        {selectedDestination?.network ? (
          <>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>• Tối thiểu: 10 USDT/lần</Text>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>• Tối đa: 8000 USDT/lần</Text>
          </>
        ) : (
          <>
            <Text style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>• Tối thiểu: 200,000 VNĐ/lần</Text>
            <Text style={{ fontSize: 13, color: '#666' }}>• Tối đa: 200,000,000 VNĐ/lần</Text>
          </>
        )}
      </View>

      <View style={[styles.withdrawFooter, { marginTop: 40 }]}>
        <TouchableOpacity
          style={styles.historyLinkBtn}
          onPress={() => navigation.navigate('TransactionHistory', { initialTab: 'withdraw' })}
        >
          <Text style={styles.historyLinkText}>Lịch sử rút tiền</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.submitBtn, isWithdrawing && { opacity: 0.7 }]}
          onPress={handleWithdraw}
          disabled={isWithdrawing}
        >
          <Text style={styles.submitBtnText}>{isWithdrawing ? 'Đang xử lý...' : 'Rút tiền'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

