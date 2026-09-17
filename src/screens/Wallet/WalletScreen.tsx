import React, { useState, useCallback } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ChevronLeft, QrCode, Copy, Image as ImageIcon, ChevronDown, Eye, EyeOff } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';
import Toast from 'react-native-toast-message';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, requestWithdraw, requestDeposit, fetchProfile } = useAppStore();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawMethod, setWithdrawMethod] = useState<'ticket' | 'bank'>('ticket');
  const [amountStr, setAmountStr] = useState('');
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [showWithdrawPassword, setShowWithdrawPassword] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);

  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [receiptImageUri, setReceiptImageUri] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [depositConfig, setDepositConfig] = React.useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      const interval = setInterval(() => {
        fetchProfile();
      }, 5000);
      return () => clearInterval(interval);
    }, [fetchProfile])
  );
  const [selectedGateway, setSelectedGateway] = useState<string>('bank');
  const [isGatewayDropdownOpen, setIsGatewayDropdownOpen] = useState(false);

  const [selectedBankIndex, setSelectedBankIndex] = useState<number>(0);
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

  const [scratchNetwork, setScratchNetwork] = useState('Viettel');
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [scratchAmount, setScratchAmount] = useState('50000');
  const [isScratchAmountDropdownOpen, setIsScratchAmountDropdownOpen] = useState(false);
  const [scratchSeri, setScratchSeri] = useState('');
  const [scratchPin, setScratchPin] = useState('');

  const [binanceConfig, setBinanceConfig] = useState<any>(null);
  const [binanceMode, setBinanceMode] = useState<'auto' | 'manual'>('auto');
  const [binanceTxId, setBinanceTxId] = useState('');
  const [binanceAmountStr, setBinanceAmountStr] = useState('');
  const [selectedBinanceWalletIndex, setSelectedBinanceWalletIndex] = useState(0);
  const [isBinanceWalletDropdownOpen, setIsBinanceWalletDropdownOpen] = useState(false);

  const txTimeSuffix = React.useMemo(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${dd}${mm}${yyyy}${hh}${min}${ss}`;
  }, []);

  React.useEffect(() => {
    const fetchDepositConfig = async () => {
      try {
        const res = await api.get('/settings/deposit_config');
        if (res.data) setDepositConfig(res.data);
      } catch (err) {
        console.error('Error fetching deposit config:', err);
      }
    };
    const fetchBinanceConfig = async () => {
      try {
        const { data } = await api.get('/settings/binance_config');
        setBinanceConfig(data);
      } catch (error) {
        console.error('Error fetching binance config', error);
      }
    };
    fetchDepositConfig();
    fetchBinanceConfig();
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

  const handleDepositAmountChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    if (!numericValue) {
      setDepositAmountStr('');
      return;
    }
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setDepositAmountStr(formatted);
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
      (navigation as any).navigate('MainTabs');
    } else {
      Toast.show({ type: 'error', text1: 'Thất bại', text2: message || 'Có lỗi xảy ra.' });
    }
  };

  const handlePickReceipt = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 1024, maxHeight: 1024 });
    if (result.didCancel || !result.assets?.[0]) return;
    setReceiptImageUri(result.assets[0].uri || '');
  };

  const handleDepositSubmit = async () => {
    if (selectedGateway === 'binance' && binanceMode === 'auto') {
      if (!binanceTxId) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập Mã giao dịch (TxID).' });
        return;
      }
      setIsUploading(true);
      try {
        await api.post('/wallet/deposit/binance', { txId: binanceTxId });
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Nạp tiền tự động qua Binance thành công!' });
        setBinanceTxId('');
        (navigation as any).navigate('MainTabs');
      } catch (error: any) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.' });
      } finally {
        setIsUploading(false);
      }
      return;
    }

    let amt = 0;
    if (selectedGateway === 'binance') {
      const amtUsdt = parseFloat(binanceAmountStr.replace(/,/g, ''));
      if (isNaN(amtUsdt) || amtUsdt <= 0) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập số tiền USDT hợp lệ.' });
        return;
      }
      const rate = binanceConfig?.exchangeRate || 25000;
      amt = amtUsdt * rate;
    } else if (selectedGateway !== 'scratch') {
      amt = parseInt(depositAmountStr.replace(/\D/g, ''), 10);
      if (isNaN(amt) || amt <= 0) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập số tiền nạp hợp lệ.' });
        return;
      }
    } else {
      if (!scratchSeri || !scratchPin || !receiptImageUri || !scratchAmount) {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập Seri, PIN, mệnh giá và chọn ảnh thẻ cào.' });
        return;
      }
      amt = parseInt(scratchAmount, 10);
    }

    if (!receiptImageUri && selectedGateway !== 'scratch' && selectedGateway !== 'binance') {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn ảnh biên lai.' });
      return;
    }
    if (selectedGateway === 'binance' && !receiptImageUri) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng chọn ảnh biên lai.' });
      return;
    }

    setIsUploading(true);
    let uploadedImageUrl = '';
    try {
      if (receiptImageUri) {
        const formData = new FormData();
        const uriParts = receiptImageUri.split('.');
        const rawExt = uriParts.length > 1 ? uriParts.pop()?.toLowerCase() : 'jpg';
        const ext = ['png', 'jpg', 'jpeg'].includes(rawExt as string) ? rawExt : 'jpg';
        formData.append('image', {
          uri: Platform.OS === 'ios' ? receiptImageUri.replace('file://', '') : receiptImageUri,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
          name: `receipt.${ext}`,
        } as any);

        const res = await api.post('/upload?folder=ImageDEP', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        uploadedImageUrl = res.data.url;
      }

      const prefix = depositConfig?.transferPrefix || 'VXS';
      const identifierField = depositConfig?.transferIdentifier || 'phone';
      const identifierValue = user ? (user as any)[identifierField] || '' : '';
      const transferContent = `${prefix} ${identifierValue} ${txTimeSuffix}`.trim();

      let destinationInfo = undefined;
      if (selectedGateway === 'scratch') {
        destinationInfo = { network: scratchNetwork, seri: scratchSeri, pin: scratchPin };
      } else if (selectedGateway === 'binance') {
        const binanceWallets = binanceConfig?.wallets || [];
        const activeBinanceWallet = binanceWallets[selectedBinanceWalletIndex] || (binanceConfig?.walletAddress ? { walletAddress: binanceConfig.walletAddress, network: 'USDT TRC20/BEP20' } : null);
        const amtUsdt = parseFloat(binanceAmountStr.replace(/,/g, ''));
        destinationInfo = { network: activeBinanceWallet?.network, walletAddress: activeBinanceWallet?.walletAddress, amountUsdt: amtUsdt };
      }

      const { success, message } = await requestDeposit(amt, uploadedImageUrl, transferContent, selectedGateway === 'bank' ? 'manual' : selectedGateway, destinationInfo);
      if (success) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: message });
        setDepositAmountStr('');
        setReceiptImageUri('');
        setScratchSeri('');
        setScratchPin('');
        setBinanceAmountStr('');
        (navigation as any).navigate('MainTabs');
      } else {
        Toast.show({ type: 'error', text1: 'Thất bại', text2: message || 'Có lỗi xảy ra.' });
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: err.response?.data?.message || 'Có lỗi khi tải lên biên lai' });
    } finally {
      setIsUploading(false);
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
    const prefix = depositConfig?.transferPrefix || 'VXS';
    const identifierField = depositConfig?.transferIdentifier || 'phone';
    // Access the field on the user object, fallback to empty string
    const identifierValue = user ? (user as any)[identifierField] || '' : '';
    const transferContent = `${prefix} ${identifierValue} ${txTimeSuffix}`.trim();

    const GATEWAYS = [
      { id: 'bank', name: 'Ngân hàng', active: true },
      { id: 'scratch', name: 'Thẻ cào', active: depositConfig?.gateways?.scratch },
      { id: 'momo', name: 'Ví Momo', active: depositConfig?.gateways?.momo },
      { id: 'zalopay', name: 'ZaloPay', active: depositConfig?.gateways?.zalopay },
      { id: 'vnpay', name: 'VNPay', active: depositConfig?.gateways?.vnpay },
      { id: 'ninepay', name: '9Pay', active: depositConfig?.gateways?.ninepay },
      { id: 'shopeepay', name: 'ShopeePay', active: depositConfig?.gateways?.shopeepay },
      { id: 'tiktokpay', name: 'TiktokPay', active: depositConfig?.gateways?.tiktokpay },
      { id: 'lazadapay', name: 'LazadaPay', active: depositConfig?.gateways?.lazadapay },
      { id: 'paypal', name: 'Paypal', active: depositConfig?.gateways?.paypal },
      { id: 'binance', name: 'Binance', active: depositConfig?.gateways?.binance !== false },
    ];

    const activeGateways = GATEWAYS.filter(g => g.active);
    const gatewayItems = activeGateways.map(g => ({ label: g.name, value: g.id }));
    const banks = depositConfig?.banks || [];
    const bankItems = banks.map((b: any, i: number) => ({ label: b.bankName, value: i }));
    const activeBank = banks[selectedBankIndex] || banks[0];

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

        <View style={{ paddingHorizontal: SPACING.md, marginBottom: 16, zIndex: 5000 }}>
          <Text style={styles.depositInstruction}>Chọn phương thức nạp tiền:</Text>
          <DropDownPicker
            open={isGatewayDropdownOpen}
            value={selectedGateway}
            items={gatewayItems}
            setOpen={setIsGatewayDropdownOpen}
            setValue={setSelectedGateway}
            listMode="SCROLLVIEW"
            style={{ borderColor: '#E2E8F0', borderWidth: 1 }}
            dropDownContainerStyle={{ borderColor: '#E2E8F0', borderWidth: 1, zIndex: 5000 }}
            textStyle={{ fontSize: 16, color: '#333' }}
            zIndex={5000}
            zIndexInverse={1000}
          />
        </View>

        {selectedGateway === 'bank' ? (
          <>
            {banks.length > 1 && (
              <View style={{ paddingHorizontal: SPACING.md, marginBottom: 16, zIndex: 10 }}>
                <DropDownPicker
                  open={isBankDropdownOpen}
                  value={selectedBankIndex}
                  items={bankItems}
                  setOpen={setIsBankDropdownOpen}
                  setValue={setSelectedBankIndex}
                  listMode="SCROLLVIEW"
                  style={{ borderColor: '#E2E8F0', borderWidth: 1 }}
                  dropDownContainerStyle={{ borderColor: '#E2E8F0', borderWidth: 1, zIndex: 1000 }}
                  textStyle={{ fontSize: 16, color: '#333' }}
                  placeholder="Chọn ngân hàng"
                  zIndex={1000}
                  zIndexInverse={2000}
                />
              </View>
            )}

            <View style={[styles.qrSection, { backgroundColor: '#fff', marginHorizontal: SPACING.md, borderRadius: 16, marginTop: 8, padding: 16, ...SHADOWS.light }]}>
              <View style={styles.qrPlaceholder}>
                {activeBank?.qrImage && (activeBank.qrImage.startsWith('http') || activeBank.qrImage.startsWith('data:')) ? (
                  <Image source={{ uri: activeBank.qrImage }} style={{ width: 220, height: 220, borderRadius: 12 }} resizeMode="contain" />
                ) : (activeBank?.accountNumber && activeBank?.bankName) ? (
                  <Image
                    source={{ uri: `https://img.vietqr.io/image/${activeBank.bankName.toLowerCase()}-${activeBank.accountNumber}-compact2.png?addInfo=${encodeURIComponent(transferContent)}` }}
                    style={{ width: 220, height: 220, borderRadius: 12 }}
                    resizeMode="contain"
                  />
                ) : (
                  <>
                    <QrCode size={120} color="#000" strokeWidth={1} />
                    <View style={styles.qrCenterLogo}>
                      <Text style={styles.qrLogoText}>v</Text>
                    </View>
                  </>
                )}
              </View>

              <View style={{ width: '100%', marginTop: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                  <Text style={{ color: '#666', fontSize: 13 }}>Ngân hàng</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>{activeBank?.bankName || 'MB Bank'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                  <Text style={{ color: '#666', fontSize: 13, marginRight: 16 }}>Chủ tài khoản</Text>
                  <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333', flexShrink: 1, textAlign: 'right' }}>{activeBank?.accountName || 'VUA XO SO'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                  <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Số tài khoản</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0066FF', marginRight: 8, flexShrink: 1, textAlign: 'right' }}>{activeBank?.accountNumber || '0123456789'}</Text>
                    <TouchableOpacity style={{ padding: 4, backgroundColor: '#e6f0fa', borderRadius: 6 }}>
                      <Copy size={14} color="#0066FF" />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Nội dung CK</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E51F27', marginRight: 8, flexShrink: 1, textAlign: 'right' }}>{transferContent}</Text>
                    <TouchableOpacity style={{ padding: 4, backgroundColor: '#ffe6e6', borderRadius: 6 }}>
                      <Copy size={14} color="#E51F27" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ paddingHorizontal: SPACING.md, marginTop: 24 }}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Số Tiền Nạp</Text>
                <View style={[styles.inputRow, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]}>
                  <TextInput
                    style={styles.amountInput}
                    value={depositAmountStr}
                    onChangeText={handleDepositAmountChange}
                    placeholder="Nhập số tiền nạp"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="number-pad"
                  />
                  <Text style={styles.currencyText}>VNĐ</Text>
                </View>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Đính kèm sao kê</Text>
                <TouchableOpacity
                  style={{ alignSelf: 'center', width: 200, height: 320, justifyContent: 'center', alignItems: 'center', borderColor: '#E2E8F0', borderStyle: 'dashed', borderWidth: 2, borderRadius: 12, backgroundColor: '#F8FAFC', overflow: 'hidden', marginTop: 8 }}
                  onPress={handlePickReceipt}
                >
                  {receiptImageUri ? (
                    <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  ) : (
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                      <ImageIcon size={40} color={COLORS.gray400} />
                      <Text style={{ color: COLORS.gray500, marginTop: 12, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>Nhấn để tải lên ảnh chụp màn hình giao dịch</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : selectedGateway === 'scratch' ? (
          <View style={{ paddingHorizontal: SPACING.md, marginTop: 16, zIndex: 10 }}>
            <View style={{ marginBottom: 16, zIndex: 2000 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Nhà mạng</Text>
              <DropDownPicker
                open={isNetworkDropdownOpen}
                value={scratchNetwork}
                items={[
                  { label: 'Viettel', value: 'Viettel' },
                  { label: 'Vinaphone', value: 'Vinaphone' },
                  { label: 'Mobifone', value: 'Mobifone' },
                  { label: 'Vietnamobile', value: 'Vietnamobile' },
                ]}
                setOpen={setIsNetworkDropdownOpen}
                setValue={setScratchNetwork}
                listMode="SCROLLVIEW"
                style={{ borderColor: '#E2E8F0', borderWidth: 1 }}
                dropDownContainerStyle={{ borderColor: '#E2E8F0', borderWidth: 1, zIndex: 2000 }}
                textStyle={{ fontSize: 16, color: '#333' }}
                zIndex={2000}
                zIndexInverse={1000}
              />
            </View>
            <View style={{ marginBottom: 16, zIndex: 1000 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Mệnh giá</Text>
              <DropDownPicker
                open={isScratchAmountDropdownOpen}
                value={scratchAmount}
                items={[
                  { label: '10.000 đ', value: '10000' },
                  { label: '20.000 đ', value: '20000' },
                  { label: '30.000 đ', value: '30000' },
                  { label: '50.000 đ', value: '50000' },
                  { label: '100.000 đ', value: '100000' },
                  { label: '200.000 đ', value: '200000' },
                  { label: '300.000 đ', value: '300000' },
                  { label: '500.000 đ', value: '500000' },
                  { label: '1.000.000 đ', value: '1000000' },
                ]}
                setOpen={setIsScratchAmountDropdownOpen}
                setValue={setScratchAmount}
                listMode="SCROLLVIEW"
                style={{ borderColor: '#E2E8F0', borderWidth: 1 }}
                dropDownContainerStyle={{ borderColor: '#E2E8F0', borderWidth: 1, zIndex: 1000 }}
                textStyle={{ fontSize: 16, color: '#333' }}
                zIndex={1000}
                zIndexInverse={2000}
              />
            </View>
            <View style={{ marginBottom: 16, zIndex: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Số Seri</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]}>
                <TextInput
                  style={styles.amountInput}
                  value={scratchSeri}
                  onChangeText={setScratchSeri}
                  placeholder="Nhập số Seri"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>
            <View style={{ marginBottom: 16, zIndex: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Mã thẻ (PIN)</Text>
              <View style={[styles.inputRow, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]}>
                <TextInput
                  style={styles.amountInput}
                  value={scratchPin}
                  onChangeText={setScratchPin}
                  placeholder="Nhập mã thẻ PIN"
                  placeholderTextColor={COLORS.gray400}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16, zIndex: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Ảnh thẻ cào</Text>
              <TouchableOpacity style={{ alignSelf: 'center', width: 200, height: 320, justifyContent: 'center', alignItems: 'center', borderColor: '#E2E8F0', borderStyle: 'dashed', borderWidth: 2, borderRadius: 12, backgroundColor: '#F8FAFC', overflow: 'hidden', marginTop: 8 }} onPress={handlePickReceipt}>
                {receiptImageUri ? (
                  <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                ) : (
                  <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                    <ImageIcon size={40} color={COLORS.gray400} />
                    <Text style={{ color: COLORS.gray500, marginTop: 12, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>Nhấn để tải lên ảnh thẻ cào</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : ['momo', 'zalopay', 'vnpay', 'ninepay', 'shopeepay', 'tiktokpay', 'lazadapay', 'paypal'].includes(selectedGateway) ? (
          (() => {
            const wallet = depositConfig?.walletsConfig?.[selectedGateway];
            return (
              <>
                <View style={[styles.qrSection, { backgroundColor: '#fff', marginHorizontal: SPACING.md, borderRadius: 16, marginTop: 8, padding: 16, ...SHADOWS.light }]}>
                  <View style={styles.qrPlaceholder}>
                    {wallet?.qrImage && (wallet.qrImage.startsWith('http') || wallet.qrImage.startsWith('data:')) ? (
                      <Image source={{ uri: wallet.qrImage }} style={{ width: 220, height: 220, borderRadius: 12 }} resizeMode="contain" />
                    ) : (
                      <>
                        <QrCode size={120} color="#000" strokeWidth={1} />
                        <View style={styles.qrCenterLogo}>
                          <Text style={styles.qrLogoText}>QR</Text>
                        </View>
                      </>
                    )}
                  </View>

                  <View style={{ width: '100%', marginTop: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                      <Text style={{ color: '#666', fontSize: 13 }}>Loại ví</Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>{selectedGateway.toUpperCase()}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                      <Text style={{ color: '#666', fontSize: 13, marginRight: 16 }}>Chủ tài khoản</Text>
                      <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333', flexShrink: 1, textAlign: 'right' }}>{wallet?.accountName || 'VUA XO SO'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
                      <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Số tài khoản</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#0066FF', marginRight: 8, flexShrink: 1, textAlign: 'right' }}>{wallet?.accountNumber || '0123456789'}</Text>
                        <TouchableOpacity style={{ padding: 4, backgroundColor: '#e6f0fa', borderRadius: 6 }}>
                          <Copy size={14} color="#0066FF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Nội dung CK</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#E51F27', marginRight: 8, flexShrink: 1, textAlign: 'right' }}>{transferContent}</Text>
                        <TouchableOpacity style={{ padding: 4, backgroundColor: '#ffe6e6', borderRadius: 6 }}>
                          <Copy size={14} color="#E51F27" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={{ paddingHorizontal: SPACING.md, marginTop: 24 }}>
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Số Tiền Nạp</Text>
                    <View style={[styles.inputRow, { borderColor: '#E2E8F0', backgroundColor: '#F8FAFC' }]}>
                      <TextInput
                        style={styles.amountInput}
                        value={depositAmountStr}
                        onChangeText={handleDepositAmountChange}
                        placeholder="Nhập số tiền nạp"
                        placeholderTextColor={COLORS.gray400}
                        keyboardType="number-pad"
                      />
                      <Text style={styles.currencyText}>VNĐ</Text>
                    </View>
                  </View>

                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Đính kèm sao kê</Text>
                    <TouchableOpacity style={{ alignSelf: 'center', width: 200, height: 320, justifyContent: 'center', alignItems: 'center', borderColor: '#E2E8F0', borderStyle: 'dashed', borderWidth: 2, borderRadius: 12, backgroundColor: '#F8FAFC', overflow: 'hidden', marginTop: 8 }} onPress={handlePickReceipt}>
                      {receiptImageUri ? (
                        <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                      ) : (
                        <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                          <ImageIcon size={40} color={COLORS.gray400} />
                          <Text style={{ color: COLORS.gray500, marginTop: 12, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>Nhấn để tải lên ảnh chụp màn hình giao dịch</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            );
          })()
        ) : selectedGateway === 'binance' ? (
          (() => {
            const binanceWallets = binanceConfig?.wallets || [];
            const activeBinanceWallet = binanceWallets[selectedBinanceWalletIndex] || (binanceConfig?.walletAddress ? { walletAddress: binanceConfig.walletAddress, network: 'USDT TRC20/BEP20' } : null);
            const binanceWalletItems = binanceWallets.map((w: any, index: number) => ({ label: w.network || `Ví ${index + 1}`, value: index }));

            return (
              <View style={{ paddingHorizontal: SPACING.md, marginTop: 16 }}>
                <View style={{ flexDirection: 'row', backgroundColor: '#FFF', padding: 4, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <TouchableOpacity
                    style={[{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 }, binanceMode === 'auto' && { backgroundColor: COLORS.primary }]}
                    onPress={() => setBinanceMode('auto')}
                  >
                    <Text style={[{ fontSize: 14, fontWeight: 'bold', color: '#666' }, binanceMode === 'auto' && { color: '#FFF' }]}>Tự động</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 }, binanceMode === 'manual' && { backgroundColor: COLORS.primary }]}
                    onPress={() => setBinanceMode('manual')}
                  >
                    <Text style={[{ fontSize: 14, fontWeight: 'bold', color: '#666' }, binanceMode === 'manual' && { color: '#FFF' }]}>Thủ công</Text>
                  </TouchableOpacity>
                </View>

                {binanceWallets.length > 1 && (
                  <View style={{ marginBottom: 16, zIndex: 3000 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Chọn mạng (TRC20/BEP20)</Text>
                    <DropDownPicker
                      open={isBinanceWalletDropdownOpen}
                      value={selectedBinanceWalletIndex}
                      items={binanceWalletItems}
                      setOpen={setIsBinanceWalletDropdownOpen}
                      setValue={setSelectedBinanceWalletIndex}
                      listMode="SCROLLVIEW"
                      style={{ borderColor: '#E2E8F0', borderWidth: 1 }}
                      dropDownContainerStyle={{ borderColor: '#E2E8F0', borderWidth: 1, zIndex: 3000 }}
                      textStyle={{ fontSize: 16, color: '#333' }}
                      zIndex={3000}
                      zIndexInverse={1000}
                    />
                  </View>
                )}

                <View style={{ backgroundColor: '#FFF', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' }}>
                  <View style={{ alignItems: 'center', marginBottom: 16 }}>
                    {activeBinanceWallet?.qrImage ? (
                      <Image source={{ uri: activeBinanceWallet.qrImage }} style={{ width: 160, height: 160 }} />
                    ) : activeBinanceWallet?.walletAddress ? (
                      <Image source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeBinanceWallet.walletAddress}` }} style={{ width: 160, height: 160 }} />
                    ) : (
                      <View style={{ padding: 12, backgroundColor: '#f0f0f0', borderRadius: 12 }}>
                        <QrCode size={160} color="#ccc" />
                      </View>
                    )}
                  </View>
                  <Text style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 4 }}>Địa chỉ ví ({activeBinanceWallet?.network || 'TRC20'}):</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.gray100, padding: 12, borderRadius: 8, marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, color: COLORS.textDark, flex: 1 }} numberOfLines={2}>{activeBinanceWallet?.walletAddress || 'Chưa cấu hình'}</Text>
                    <TouchableOpacity style={{ padding: 4 }}>
                      <Copy size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: 13, color: COLORS.error, marginTop: 4 }}>Vui lòng chuyển USDT vào đúng địa chỉ ví ở trên.</Text>
                  <Text style={{ fontSize: 13, color: COLORS.error, marginTop: 4 }}>Tỷ giá hiện tại: 1 USDT = {binanceConfig?.exchangeRate?.toLocaleString('vi-VN') || '25,000'} VNĐ</Text>
                </View>

                {binanceMode === 'auto' ? (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Mã Giao Dịch (TxID)</Text>
                    <View style={[{ borderColor: '#E2E8F0', backgroundColor: '#FFF', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }]}>
                      <TextInput
                        style={{ fontSize: 16, color: COLORS.textDark }}
                        value={binanceTxId}
                        onChangeText={setBinanceTxId}
                        placeholder="VD: 5543bd12..."
                        placeholderTextColor={COLORS.gray400}
                      />
                    </View>
                    <Text style={{ fontSize: 13, color: COLORS.textLight, marginTop: 8 }}>Sau khi chuyển khoản thành công, copy mã TxID điền vào đây để hệ thống duyệt tự động.</Text>
                  </View>
                ) : (
                  <>
                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Số USDT nạp</Text>
                      <View style={[{ flexDirection: 'row', alignItems: 'center', borderColor: '#E2E8F0', backgroundColor: '#FFF', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16 }]}>
                        <TextInput
                          style={{ flex: 1, fontSize: 18, color: COLORS.primary, paddingVertical: 12, fontWeight: 'bold' }}
                          value={binanceAmountStr}
                          onChangeText={(text) => {
                            const numericValue = text.replace(/\D/g, '');
                            if (!numericValue) {
                              setBinanceAmountStr('');
                              return;
                            }
                            setBinanceAmountStr(numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ","));
                          }}
                          placeholder="Nhập số USDT"
                          placeholderTextColor={COLORS.gray400}
                          keyboardType="decimal-pad"
                        />
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.textLight }}>USDT</Text>
                      </View>
                    </View>

                    <View style={{ marginBottom: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Ảnh biên lai</Text>
                      <TouchableOpacity
                        style={{ alignSelf: 'center', width: 200, height: 320, justifyContent: 'center', alignItems: 'center', borderColor: '#E2E8F0', borderStyle: 'dashed', borderWidth: 2, borderRadius: 12, backgroundColor: '#F8FAFC', overflow: 'hidden', marginTop: 8 }}
                        onPress={handlePickReceipt}
                      >
                        {receiptImageUri ? (
                          <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                        ) : (
                          <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                            <ImageIcon size={40} color={COLORS.gray400} />
                            <Text style={{ color: COLORS.gray500, marginTop: 12, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>Nhấn để tải lên ảnh chụp màn hình giao dịch</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            );
          })()
        ) : (
          <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#f0f5fa', borderRadius: 8, marginHorizontal: SPACING.md }}>
            <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 16 }}>Tính năng đang được phát triển</Text>
            <Text style={{ color: COLORS.gray600, textAlign: 'center', marginTop: 8 }}>
              Cổng thanh toán này hiện đang trong quá trình bảo trì hoặc nâng cấp. Vui lòng chọn phương thức khác!
            </Text>
          </View>
        )}

        <View style={[styles.withdrawFooter, { marginTop: 24 }]}>
          <TouchableOpacity
            style={styles.historyLinkBtn}
            onPress={() => (navigation as any).navigate('TransactionHistory', { initialTab: 'deposit' })}
          >
            <Text style={styles.historyLinkText}>Lịch sử nạp tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.submitBtn, { marginTop: 16 }]} onPress={handleDepositSubmit} disabled={isUploading}>
            <Text style={styles.submitBtnText}>{isUploading ? 'Đang tải lên...' : 'Xác Nhận Nạp Tiền'}</Text>
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
            <TouchableOpacity onPress={() => (navigation as any).navigate('PaymentMethods')} style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>Thêm phương thức nhận tiền</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: TYPOGRAPHY.fontSize.md, fontWeight: TYPOGRAPHY.fontWeight.semiBold, marginBottom: 8, color: '#0A3B7C' }}>Chọn phương thức nhận tiền</Text>
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
              keyboardType={selectedDestination?.network ? "decimal-pad" : "number-pad"}
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
              {showWithdrawPassword ? <EyeOff size={20} color={COLORS.gray500} /> : <Eye size={20} color={COLORS.gray500} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.withdrawFooter, { marginTop: 40 }]}>
          <TouchableOpacity
            style={styles.historyLinkBtn}
            onPress={() => (navigation as any).navigate('TransactionHistory', { initialTab: 'withdraw' })}
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
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  qrCenterLogo: {
    position: 'absolute',
    width: 32,
    height: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
  gatewayBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gatewayBtnActive: {
    backgroundColor: '#0A3B7C',
    borderColor: '#0A3B7C',
  },
  gatewayBtnText: {
    color: '#666',
    fontWeight: 'bold',
  },
  gatewayBtnTextActive: {
    color: '#fff',
  },
  bankSelectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bankSelectBtnActive: {
    backgroundColor: '#e6f0fa',
    borderColor: '#0A3B7C',
  },
  bankSelectBtnText: {
    color: '#333',
    fontWeight: 'bold',
  },
  bankSelectBtnTextActive: {
    color: '#0A3B7C',
  },

  // Withdraw Tab
  withdrawContent: {
    flexGrow: 1,
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
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textDark,
  },
  methodCardDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: COLORS.textMuted,
  },
  methodCardTextActive: {
    color: '#FFF',
  },
});
