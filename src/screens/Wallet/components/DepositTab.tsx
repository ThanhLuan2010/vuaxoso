import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { QrCode, Copy, Image as ImageIcon } from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { SvgUri } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SPACING, SHADOWS } from '../../../theme/theme';
import api from '../../../services/api';
import { styles } from '../walletStyles';
import AccountBalanceCard from './AccountBalanceCard';

interface DepositTabProps {
  user: any;
  depositConfig: any;
  binanceConfig: any;
  bottomInset: number;
  onRequestDeposit: (
    amount: number,
    receiptImage?: string,
    txId?: string,
    paymentMethod?: string,
    destinationInfo?: any
  ) => Promise<{ success: boolean; message?: string }>;
}

const getFullImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const base = api.defaults.baseURL ? api.defaults.baseURL.replace(/\/api$/, '') : 'https://api-vuaxoso.vipmarts.com';
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};

const isSvgImage = (url?: string) => {
  if (!url) return false;
  return url.toLowerCase().split('?')[0].endsWith('.svg');
};

export default function DepositTab({
  user,
  depositConfig,
  binanceConfig,
  bottomInset,
  onRequestDeposit,
}: DepositTabProps) {
  const navigation = useNavigation<any>();

  const [depositAmountStr, setDepositAmountStr] = useState('');
  const [receiptImageUri, setReceiptImageUri] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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

  const [binanceAmountStr, setBinanceAmountStr] = useState('');
  const [selectedBinanceWalletIndex, setSelectedBinanceWalletIndex] = useState(0);
  const [isBinanceWalletDropdownOpen, setIsBinanceWalletDropdownOpen] = useState(false);

  const txTimeSuffix = useMemo(() => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${dd}${mm}${yyyy}${hh}${min}${ss}`;
  }, []);

  const handleDepositAmountChange = (text: string) => {
    const numericValue = text.replace(/\D/g, '');
    if (!numericValue) {
      setDepositAmountStr('');
      return;
    }
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    setDepositAmountStr(formatted);
  };

  const handlePickReceipt = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 1024, maxHeight: 1024 });
    if (result.didCancel || !result.assets?.[0]) return;
    setReceiptImageUri(result.assets[0].uri || '');
  };

  const handleDepositSubmit = async () => {
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
        const activeBinanceWallet =
          binanceWallets[selectedBinanceWalletIndex] ||
          (binanceConfig?.walletAddress
            ? { walletAddress: binanceConfig.walletAddress, network: 'USDT TRC20/BEP20' }
            : null);
        const amtUsdt = parseFloat(binanceAmountStr.replace(/,/g, ''));
        destinationInfo = {
          network: activeBinanceWallet?.network,
          walletAddress: activeBinanceWallet?.walletAddress,
          amountUsdt: amtUsdt,
        };
      }

      const { success, message } = await onRequestDeposit(
        amt,
        uploadedImageUrl,
        transferContent,
        selectedGateway === 'bank' ? 'manual' : selectedGateway,
        destinationInfo
      );

      if (success) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: message });
        setDepositAmountStr('');
        setReceiptImageUri('');
        setScratchSeri('');
        setScratchPin('');
        setBinanceAmountStr('');
        navigation.navigate('MainTabs');
      } else {
        Toast.show({ type: 'error', text1: 'Thất bại', text2: message || 'Có lỗi xảy ra.' });
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: err.response?.data?.message || 'Có lỗi khi tải lên biên lai' });
    } finally {
      setIsUploading(false);
    }
  };

  const prefix = depositConfig?.transferPrefix || 'VXS';
  const identifierField = depositConfig?.transferIdentifier || 'phone';
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

  const activeGateways = GATEWAYS.filter((g) => g.active);
  const gatewayItems = activeGateways.map((g) => ({ label: g.name, value: g.id }));
  const banks = depositConfig?.banks || [];
  const bankItems = banks.map((b: any, i: number) => ({ label: b.bankName, value: i }));
  const activeBank = banks[selectedBankIndex] || banks[0];

  return (
    <ScrollView
      contentContainerStyle={[styles.depositContent, { paddingBottom: Math.max(bottomInset, 24) }]}
      showsVerticalScrollIndicator={false}
    >
      <AccountBalanceCard phone={user?.phone} name={user?.name} balance={user?.balance} />

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

          <View
            style={[
              styles.qrSection,
              {
                backgroundColor: '#fff',
                marginHorizontal: SPACING.md,
                borderRadius: 16,
                marginTop: 8,
                padding: 16,
                ...SHADOWS.light,
              },
            ]}
          >
            <View style={styles.qrPlaceholder}>
              {activeBank?.qrImage ? (
                isSvgImage(activeBank.qrImage) ? (
                  <SvgUri uri={getFullImageUrl(activeBank.qrImage)} width="220" height="220" />
                ) : (
                  <Image
                    source={{ uri: getFullImageUrl(activeBank.qrImage) }}
                    style={{ width: 220, height: 220, borderRadius: 12 }}
                    resizeMode="contain"
                  />
                )
              ) : activeBank?.accountNumber && activeBank?.bankName ? (
                <Image
                  source={{
                    uri: `https://img.vietqr.io/image/${activeBank.bankName.toLowerCase()}-${activeBank.accountNumber}-compact2.png?addInfo=${encodeURIComponent(
                      transferContent
                    )}`,
                  }}
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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f0f0f0',
                }}
              >
                <Text style={{ color: '#666', fontSize: 13 }}>Ngân hàng</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>
                  {activeBank?.bankName || 'MB Bank'}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f0f0f0',
                }}
              >
                <Text style={{ color: '#666', fontSize: 13, marginRight: 16 }}>Chủ tài khoản</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333', flexShrink: 1, textAlign: 'right' }}>
                  {activeBank?.accountName || 'VUA XO SO'}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                  paddingBottom: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f0f0f0',
                }}
              >
                <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Số tài khoản</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 16,
                      color: '#0066FF',
                      marginRight: 8,
                      flexShrink: 1,
                      textAlign: 'right',
                    }}
                  >
                    {activeBank?.accountNumber || '0123456789'}
                  </Text>
                  <TouchableOpacity style={{ padding: 4, backgroundColor: '#e6f0fa', borderRadius: 6 }}>
                    <Copy size={14} color="#0066FF" />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Nội dung CK</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      fontSize: 16,
                      color: '#E51F27',
                      marginRight: 8,
                      flexShrink: 1,
                      textAlign: 'right',
                    }}
                  >
                    {transferContent}
                  </Text>
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
                style={{
                  alignSelf: 'center',
                  width: 200,
                  height: 320,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderColor: '#E2E8F0',
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderRadius: 12,
                  backgroundColor: '#F8FAFC',
                  overflow: 'hidden',
                  marginTop: 8,
                }}
                onPress={handlePickReceipt}
              >
                {receiptImageUri ? (
                  <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                ) : (
                  <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                    <ImageIcon size={40} color={COLORS.gray400} />
                    <Text
                      style={{
                        color: COLORS.gray500,
                        marginTop: 12,
                        textAlign: 'center',
                        fontSize: 13,
                        lineHeight: 20,
                      }}
                    >
                      Nhấn để tải lên ảnh chụp màn hình giao dịch
                    </Text>
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
            <TouchableOpacity
              style={{
                alignSelf: 'center',
                width: 200,
                height: 320,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: '#E2E8F0',
                borderStyle: 'dashed',
                borderWidth: 2,
                borderRadius: 12,
                backgroundColor: '#F8FAFC',
                overflow: 'hidden',
                marginTop: 8,
              }}
              onPress={handlePickReceipt}
            >
              {receiptImageUri ? (
                <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
              ) : (
                <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                  <ImageIcon size={40} color={COLORS.gray400} />
                  <Text
                    style={{
                      color: COLORS.gray500,
                      marginTop: 12,
                      textAlign: 'center',
                      fontSize: 13,
                      lineHeight: 20,
                    }}
                  >
                    Nhấn để tải lên ảnh thẻ cào
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : ['momo', 'zalopay', 'vnpay', 'ninepay', 'shopeepay', 'tiktokpay', 'lazadapay', 'paypal'].includes(
          selectedGateway
        ) ? (
        (() => {
          const wallet = depositConfig?.walletsConfig?.[selectedGateway];
          return (
            <>
              <View
                style={[
                  styles.qrSection,
                  {
                    backgroundColor: '#fff',
                    marginHorizontal: SPACING.md,
                    borderRadius: 16,
                    marginTop: 8,
                    padding: 16,
                    ...SHADOWS.light,
                  },
                ]}
              >
                <View style={styles.qrPlaceholder}>
                  {wallet?.qrImage ? (
                    isSvgImage(wallet.qrImage) ? (
                      <SvgUri uri={getFullImageUrl(wallet.qrImage)} width="220" height="220" />
                    ) : (
                      <Image
                        source={{ uri: getFullImageUrl(wallet.qrImage) }}
                        style={{ width: 220, height: 220, borderRadius: 12 }}
                        resizeMode="contain"
                      />
                    )
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
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 8,
                      paddingBottom: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f0f0f0',
                    }}
                  >
                    <Text style={{ color: '#666', fontSize: 13 }}>Loại ví</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333' }}>
                      {selectedGateway.toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                      paddingBottom: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f0f0f0',
                    }}
                  >
                    <Text style={{ color: '#666', fontSize: 13, marginRight: 16 }}>Chủ tài khoản</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#333', flexShrink: 1, textAlign: 'right' }}>
                      {wallet?.accountName || 'VUA XO SO'}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                      paddingBottom: 8,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f0f0f0',
                    }}
                  >
                    <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Số tài khoản</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          color: '#0066FF',
                          marginRight: 8,
                          flexShrink: 1,
                          textAlign: 'right',
                        }}
                      >
                        {wallet?.accountNumber || '0123456789'}
                      </Text>
                      <TouchableOpacity style={{ padding: 4, backgroundColor: '#e6f0fa', borderRadius: 6 }}>
                        <Copy size={14} color="#0066FF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: '#666', fontSize: 13, marginRight: 16, marginTop: 2 }}>Nội dung CK</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          fontSize: 16,
                          color: '#E51F27',
                          marginRight: 8,
                          flexShrink: 1,
                          textAlign: 'right',
                        }}
                      >
                        {transferContent}
                      </Text>
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
                    style={{
                      alignSelf: 'center',
                      width: 200,
                      height: 320,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderColor: '#E2E8F0',
                      borderStyle: 'dashed',
                      borderWidth: 2,
                      borderRadius: 12,
                      backgroundColor: '#F8FAFC',
                      overflow: 'hidden',
                      marginTop: 8,
                    }}
                    onPress={handlePickReceipt}
                  >
                    {receiptImageUri ? (
                      <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    ) : (
                      <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                        <ImageIcon size={40} color={COLORS.gray400} />
                        <Text
                          style={{
                            color: COLORS.gray500,
                            marginTop: 12,
                            textAlign: 'center',
                            fontSize: 13,
                            lineHeight: 20,
                          }}
                        >
                          Nhấn để tải lên ảnh chụp màn hình giao dịch
                        </Text>
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
          const activeBinanceWallet =
            binanceWallets[selectedBinanceWalletIndex] ||
            (binanceConfig?.walletAddress
              ? { walletAddress: binanceConfig.walletAddress, network: 'USDT TRC20/BEP20' }
              : null);
          const binanceWalletItems = binanceWallets.map((w: any, index: number) => ({
            label: w.network || `Ví ${index + 1}`,
            value: index,
          }));

          return (
            <View style={{ paddingHorizontal: SPACING.md, marginTop: 16 }}>
              {binanceWallets.length > 1 && (
                <View style={{ marginBottom: 16, zIndex: 3000 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>
                    Chọn mạng (TRC20/BEP20)
                  </Text>
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

              <View
                style={{
                  backgroundColor: '#FFF',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  {activeBinanceWallet?.qrImage ? (
                    isSvgImage(activeBinanceWallet.qrImage) ? (
                      <SvgUri uri={getFullImageUrl(activeBinanceWallet.qrImage)} width="160" height="160" />
                    ) : (
                      <Image
                        source={{ uri: getFullImageUrl(activeBinanceWallet.qrImage) }}
                        style={{ width: 160, height: 160 }}
                      />
                    )
                  ) : activeBinanceWallet?.walletAddress ? (
                    <Image
                      source={{
                        uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeBinanceWallet.walletAddress}`,
                      }}
                      style={{ width: 160, height: 160 }}
                    />
                  ) : (
                    <View style={{ padding: 12, backgroundColor: '#f0f0f0', borderRadius: 12 }}>
                      <QrCode size={160} color="#ccc" />
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 13, color: COLORS.textLight, marginBottom: 4 }}>
                  Địa chỉ ví ({activeBinanceWallet?.network || 'TRC20'}):
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: COLORS.gray100,
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 14, color: COLORS.textDark, flex: 1 }} numberOfLines={2}>
                    {activeBinanceWallet?.walletAddress || 'Chưa cấu hình'}
                  </Text>
                  <TouchableOpacity style={{ padding: 4 }}>
                    <Copy size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 13, color: COLORS.error, marginTop: 4 }}>
                  Vui lòng chuyển USDT vào đúng địa chỉ ví ở trên.
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.error, marginTop: 4 }}>
                  Tỷ giá hiện tại: 1 USDT = {binanceConfig?.exchangeRate?.toLocaleString('vi-VN') || '25,000'} VNĐ
                </Text>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>Số USDT nạp</Text>
                <View
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderColor: '#E2E8F0',
                      backgroundColor: '#FFF',
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                    },
                  ]}
                >
                  <TextInput
                    style={{ flex: 1, fontSize: 18, color: COLORS.primary, paddingVertical: 12, fontWeight: 'bold' }}
                    value={binanceAmountStr}
                    onChangeText={(text) => {
                      const numericValue = text.replace(/\D/g, '');
                      if (!numericValue) {
                        setBinanceAmountStr('');
                        return;
                      }
                      setBinanceAmountStr(numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
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
                  style={{
                    alignSelf: 'center',
                    width: 200,
                    height: 320,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderColor: '#E2E8F0',
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderRadius: 12,
                    backgroundColor: '#F8FAFC',
                    overflow: 'hidden',
                    marginTop: 8,
                  }}
                  onPress={handlePickReceipt}
                >
                  {receiptImageUri ? (
                    <Image source={{ uri: receiptImageUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                  ) : (
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                      <ImageIcon size={40} color={COLORS.gray400} />
                      <Text
                        style={{
                          color: COLORS.gray500,
                          marginTop: 12,
                          textAlign: 'center',
                          fontSize: 13,
                          lineHeight: 20,
                        }}
                      >
                        Nhấn để tải lên ảnh chụp màn hình giao dịch
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })()
      ) : (
        <View
          style={{
            padding: 24,
            alignItems: 'center',
            backgroundColor: '#f0f5fa',
            borderRadius: 8,
            marginHorizontal: SPACING.md,
          }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 16 }}>Tính năng đang được phát triển</Text>
          <Text style={{ color: COLORS.gray600, textAlign: 'center', marginTop: 8 }}>
            Cổng thanh toán này hiện đang trong quá trình bảo trì hoặc nâng cấp. Vui lòng chọn phương thức khác!
          </Text>
        </View>
      )}

      <View style={[styles.withdrawFooter, { marginTop: 24 }]}>
        <TouchableOpacity
          style={styles.historyLinkBtn}
          onPress={() => navigation.navigate('TransactionHistory', { initialTab: 'deposit' })}
        >
          <Text style={styles.historyLinkText}>Lịch sử nạp tiền</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, { marginTop: 16 }]}
          onPress={handleDepositSubmit}
          disabled={isUploading}
        >
          <Text style={styles.submitBtnText}>{isUploading ? 'Đang tải lên...' : 'Xác Nhận Nạp Tiền'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

