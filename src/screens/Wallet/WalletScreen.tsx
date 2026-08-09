import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, QrCode, Copy } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, requestWithdraw, requestDeposit } = useAppStore();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawMethod, setWithdrawMethod] = useState<'ticket' | 'bank'>('ticket');
  const [amountStr, setAmountStr] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  const [bankConfig, setBankConfig] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchBankConfig = async () => {
      try {
        const res = await api.get('/settings/bank_config');
        if (res.data) setBankConfig(res.data);
      } catch (err) {
        console.error('Error fetching bank config:', err);
      }
    };
    fetchBankConfig();
  }, []);

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + 'đ';
  };

  const handleAmountChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    if (!numericValue) {
      setAmountStr('');
      return;
    }
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setAmountStr(formatted);
  };

  const handleWithdraw = async () => {
    const amt = parseInt(amountStr.replace(/\D/g, ''), 10);
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
    const { success, message } = await requestWithdraw(amt, withdrawPassword, selectedDestination);
    if (success) {
      Toast.show({ type: 'success', text1: 'Thành công', text2: message || `Đã gửi yêu cầu rút ${formatVND(amt)}.` });
      setAmountStr('');
      setWithdrawPassword('');
      setSelectedDestination(null);
    } else {
      Toast.show({ type: 'error', text1: 'Thất bại', text2: message || 'Có lỗi xảy ra.' });
    }
  };

  const handleDepositMock = async () => {
    const { success, message } = await requestDeposit(0);
    if (success) {
      Toast.show({ type: 'success', text1: 'Thành công', text2: message });
    } else {
      Toast.show({ type: 'error', text1: 'Thất bại', text2: message || 'Có lỗi xảy ra.' });
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color="#0A3B7C" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>NẠP/RÚT</Text>
      <View style={styles.headerBtn} />
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'deposit' && styles.tabItemActive]}
        onPress={() => setActiveTab('deposit')}
      >
        <Text style={[styles.tabText, activeTab === 'deposit' && styles.tabTextActive]}>Nạp tiền</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabItem, activeTab === 'withdraw' && styles.tabItemActive]}
        onPress={() => setActiveTab('withdraw')}
      >
        <Text style={[styles.tabText, activeTab === 'withdraw' && styles.tabTextActive]}>Rút tiền</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDeposit = () => {
    const transferContent = `VXS ${user?.phone || ''}`;

    return (
      <ScrollView
        contentContainerStyle={[styles.depositContent, { paddingBottom: Math.max(insets.bottom, 24) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.accountInfoCenter}>
          <Text style={styles.accLabel}>Tài khoản: {user?.phone || '0899955742'}</Text>
          <Text style={styles.accName}>{user?.name || 'Guest'}</Text>
          <Text style={styles.accBalance}>Số dư: {formatVND(user?.balance || 0)}</Text>
        </View>

        <Text style={styles.depositInstruction}>
          Để nạp tiền vào tài khoản Vua xổ số{"\n"}
          Quý khách vui lòng chuyển khoản vào tài khoản sau:
        </Text>

        <View style={styles.qrSection}>
          <Text style={styles.qrLabel}>Hoặc quét mã QR dưới đây</Text>
          <View style={styles.qrCard}>
            <View style={styles.qrPlaceholder}>
              {bankConfig?.accountNumber && bankConfig?.bankName ? (
                <Image
                  source={{ uri: `https://img.vietqr.io/image/${bankConfig.bankName.toLowerCase()}-${bankConfig.accountNumber}-compact2.png?addInfo=${encodeURIComponent(transferContent)}` }}
                  style={{ width: 280, height: 280 }}
                  resizeMode="contain"
                />
              ) : (
                <>
                  <QrCode size={180} color="#000" strokeWidth={1} />
                  <View style={styles.qrCenterLogo}>
                    <Text style={styles.qrLogoText}>v</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.bankInfoRow}>
              <View style={styles.bankInfoLeft}>
                <Text style={styles.bankLabel}>Ngân hàng: <Text style={styles.bankValueBold}>{bankConfig?.bankName || 'MB Bank'}</Text></Text>
                <Text style={styles.bankLabel}>Chủ tài khoản: <Text style={styles.bankValueBold}>{bankConfig?.accountName || 'CÔNG TY CỔ PHẦN DỊCH VỤ THƯƠNG MẠI HỢP PHONG'}</Text></Text>

                <View style={styles.stkRow}>
                  <Text style={styles.bankLabel}>STK: <Text style={styles.bankValueBlue}>{bankConfig?.accountNumber || 'MBVXS0899955742'}</Text></Text>
                  <TouchableOpacity style={styles.copyBtn}>
                    <Copy size={16} color="#00A859" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.stkRow, { marginTop: 4 }]}>
                  <Text style={styles.bankLabel}>Nội dung CK: <Text style={styles.bankValueBlue}>{transferContent}</Text></Text>
                  <TouchableOpacity style={styles.copyBtn}>
                    <Copy size={16} color="#00A859" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.bankInfoRight}>
                <Text style={styles.mbLogoText}>{bankConfig?.bankName?.substring(0, 3) || 'MB'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.withdrawFooter}>
          <TouchableOpacity
            style={styles.historyLinkBtn}
            onPress={() => navigation.navigate('TransactionHistory' as never, { initialTab: 'deposit' } as never)}
          >
            <Text style={styles.historyLinkText}>Lịch sử nạp tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.submitBtn, { marginTop: 16 }]} onPress={handleDepositMock}>
            <Text style={styles.submitBtnText}>Xác nhận đã chuyển khoản</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, marginHorizontal: 24 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.gray200 }} />
            <Text style={{ marginHorizontal: 8, color: COLORS.textLight, ...TYPOGRAPHY.body2 }}>HOẶC</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.gray200 }} />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, { marginTop: 16, backgroundColor: '#F3BA2F' }]} 
            onPress={() => navigation.navigate('DepositBinance' as never)}
          >
            <Text style={[styles.submitBtnText, { color: '#000' }]}>Nạp tự động qua Binance</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderWithdraw = () => {
    const banks = user?.banks || [];
    const wallets = user?.wallets || [];
    const hasMethods = banks.length > 0 || wallets.length > 0;

    return (
      <ScrollView contentContainerStyle={[styles.withdrawContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <View style={[styles.accountInfoCenter, { marginTop: 16, marginBottom: 24, padding: 16, backgroundColor: '#FFF', borderRadius: 12 }]}>
          <Text style={styles.accLabel}>Tài khoản: {user?.phone || '0899955742'}</Text>
          <Text style={styles.accName}>{user?.name || 'Guest'}</Text>
          <Text style={styles.accBalance}>Số dư: {formatVND(user?.balance || 0)}</Text>
        </View>

        {!hasMethods ? (
          <View style={{ alignItems: 'center', marginVertical: 20 }}>
            <Text style={{ textAlign: 'center', color: COLORS.textDark, marginBottom: 12 }}>Bạn chưa cấu hình phương thức nhận tiền.</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods' as never)} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>Thêm phương thức nhận tiền</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ ...TYPOGRAPHY.subtitle2, marginBottom: 8, color: '#0A3B7C' }}>Chọn phương thức nhận tiền</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {banks.map((b: any, i: number) => (
                <TouchableOpacity
                  key={`b-${i}`}
                  style={[
                    styles.methodCard,
                    selectedDestination === b && styles.methodCardActive
                  ]}
                  onPress={() => setSelectedDestination(b)}
                >
                  <Text style={[styles.methodCardTitle, selectedDestination === b && styles.methodCardTextActive]}>{b.bankName}</Text>
                  <Text style={[styles.methodCardDesc, selectedDestination === b && styles.methodCardTextActive]}>{b.accountNumber}</Text>
                </TouchableOpacity>
              ))}
              {wallets.map((w: any, i: number) => (
                <TouchableOpacity
                  key={`w-${i}`}
                  style={[
                    styles.methodCard,
                    selectedDestination === w && styles.methodCardActive
                  ]}
                  onPress={() => setSelectedDestination(w)}
                >
                  <Text style={[styles.methodCardTitle, selectedDestination === w && styles.methodCardTextActive]}>Ví {w.network}</Text>
                  <Text style={[styles.methodCardDesc, selectedDestination === w && styles.methodCardTextActive]}>
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
              keyboardType="number-pad"
            />
            <Text style={styles.currencyText}>VNĐ</Text>
          </View>
        </View>

        <View style={[styles.inputContainer, { marginTop: 24 }]}>
          <View style={styles.floatingLabelContainer}>
            <Text style={styles.floatingLabel}>Mật khẩu rút tiền</Text>
          </View>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.amountInput}
              value={withdrawPassword}
              onChangeText={setWithdrawPassword}
              placeholder="Nhập mật khẩu rút tiền"
              placeholderTextColor={COLORS.gray400}
              secureTextEntry
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <View style={[styles.withdrawFooter, { marginTop: 40 }]}>
          <TouchableOpacity
            style={styles.historyLinkBtn}
            onPress={() => navigation.navigate('TransactionHistory' as never, { initialTab: 'withdraw' } as never)}
          >
            <Text style={styles.historyLinkText}>Lịch sử rút tiền</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitBtn} onPress={handleWithdraw}>
            <Text style={styles.submitBtnText}>Rút tiền</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {renderHeader()}
      {renderTabs()}

      {activeTab === 'deposit' ? renderDeposit() : renderWithdraw()}

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A3B7C',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#0066FF',
  },
  tabText: {
    fontSize: 14,
    color: '#0A3B7C',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#0066FF',
  },

  // Deposit Tab
  depositContent: {
    flexGrow: 1,
  },
  accountInfoCenter: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  accLabel: {
    fontSize: 14,
    color: '#0A3B7C',
    marginBottom: 4,
  },
  accName: {
    fontSize: 16,
    color: '#0A3B7C',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  accBalance: {
    fontSize: 18,
    color: '#E51F27',
    fontWeight: 'bold',
  },
  depositInstruction: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  qrSection: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 14,
    color: '#0A3B7C',
    marginBottom: SPACING.md,
  },
  qrCard: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
    ...SHADOWS.light,
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
  },
  qrCenterLogo: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  qrLogoText: {
    color: '#E51F27',
    fontWeight: '900',
    fontSize: 18,
  },
  bankInfoRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bankInfoLeft: {
    flex: 1,
    gap: 4,
  },
  bankLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  bankValueBold: {
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  stkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankValueBlue: {
    fontWeight: 'bold',
    color: '#0066FF',
  },
  copyBtn: {
    padding: 2,
  },
  bankInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  mbLogoStar: {
    color: '#E51F27',
    fontSize: 32,
    marginRight: 2,
  },
  mbLogoText: {
    color: '#0066FF',
    fontSize: 24,
    fontWeight: '900',
  },

  // Withdraw Tab
  withdrawContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: SPACING.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.xl,
  },
  segmentBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.light,
  },
  segmentBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  segmentText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  segmentTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'relative',
    marginTop: 8,
  },
  floatingLabelContainer: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  floatingLabel: {
    fontSize: 14,
    color: '#0A3B7C',
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0A3B7C',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFF',
  },
  amountInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.textDark,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  withdrawFooter: {
    alignItems: 'center',
    marginHorizontal: 20
  },
  historyLinkBtn: {
    marginBottom: SPACING.lg,
  },
  historyLinkText: {
    color: '#00A859',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  methodCard: {
    padding: SPACING.sm,
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 120,
    justifyContent: 'center',
  },
  methodCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  methodCardTitle: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.text,
  },
  methodCardDesc: {
    ...TYPOGRAPHY.body2,
    color: COLORS.textSecondary,
  },
  methodCardTextActive: {
    color: '#FFF',
  },
});
