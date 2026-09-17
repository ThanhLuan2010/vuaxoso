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
  Alert,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Info, Copy, QrCode, ImageIcon } from 'lucide-react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { SvgUri } from 'react-native-svg';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';

export default function DepositBinanceScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, requestDeposit } = useAppStore();
  const [activeMode, setActiveMode] = useState<'auto' | 'manual'>('auto');
  const [receiptImageUri, setReceiptImageUri] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [binanceConfig, setBinanceConfig] = useState<any>(null);

  const [selectedWalletIndex, setSelectedWalletIndex] = useState(0);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);

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
    const numericValue = text.replace(/[^0-9]/g, '');
    if (!numericValue) {
      setAmountStr('');
      return;
    }
    // Add comma thousand separators
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    setAmountStr(formatted);
  };

  const handlePickReceipt = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });
    if (result.didCancel || !result.assets?.[0]) return;
    setReceiptImageUri(result.assets[0].uri || '');
  };

  const handleDeposit = async () => {
    if (activeMode === 'auto') {
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
    } else {
      const amtUsdt = parseFloat(amountStr.replace(/,/g, ''));
      if (isNaN(amtUsdt) || amtUsdt <= 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập số tiền USDT nạp hợp lệ.');
        return;
      }
      if (!receiptImageUri) {
        Alert.alert('Lỗi', 'Vui lòng chọn ảnh biên lai.');
        return;
      }
      setLoading(true);
      try {
        const formData = new FormData();
        const ext = receiptImageUri.split('.').pop() || 'jpg';
        formData.append('image', {
          uri: Platform.OS === 'ios' ? receiptImageUri.replace('file://', '') : receiptImageUri,
          type: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
          name: `receipt.${ext}`,
        } as any);

        const res = await api.post('/upload?folder=ImageDEP', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadedImageUrl = res.data.url;

        const rate = binanceConfig?.exchangeRate || 25000;
        const vndAmount = amtUsdt * rate;

        const prefix = 'VXS';
        const identifierValue = user ? (user as any).phone || '' : '';
        const transferContent = `${prefix} ${identifierValue} ${txTimeSuffix}`.trim();
        const destinationInfo = { network: activeWallet?.network, walletAddress: activeWallet?.walletAddress };

        const { success, message } = await requestDeposit(vndAmount, uploadedImageUrl, transferContent, 'binance', destinationInfo);

        if (success) {
          Alert.alert('Thành công', 'Gửi yêu cầu nạp thủ công thành công!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else {
          Alert.alert('Thất bại', message || 'Có lỗi xảy ra.');
        }
      } catch (err: any) {
        Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi khi tải lên biên lai');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInfoPress = () => {
    Alert.alert(
      'Hướng Dẫn Nạp Tiền USDT',
      'Để nạp tiền, bạn vui lòng copy địa chỉ ví hoặc quét mã QR.\nLưu ý chọn đúng mạng TRC20 hoặc BEP20 để tránh mất tiền.\n\nXem chi tiết tại: https://vuaxoso.com/huong-dan-usdt'
    );
  };

  const wallets = binanceConfig?.wallets || [];
  const activeWallet = wallets[selectedWalletIndex] || (binanceConfig?.walletAddress ? { walletAddress: binanceConfig.walletAddress, network: 'USDT TRC20/BEP20' } : null);
  const walletItems = wallets.map((w: any, index: number) => ({ label: w.network || `Ví ${index + 1}`, value: index }));

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
        <TouchableOpacity style={styles.headerBtn} onPress={handleInfoPress}>
          <Info size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabItem, activeMode === 'auto' && styles.tabItemActive]}
            onPress={() => setActiveMode('auto')}
          >
            <Text style={[styles.tabText, activeMode === 'auto' && styles.tabTextActive]}>Tự động</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeMode === 'manual' && styles.tabItemActive]}
            onPress={() => setActiveMode('manual')}
          >
            <Text style={[styles.tabText, activeMode === 'manual' && styles.tabTextActive]}>Thủ công</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { zIndex: 10 }]}>
          <Text style={styles.sectionTitle}>1. Thông tin ví nhận</Text>

          {wallets.length > 1 && (
            <View style={{ marginBottom: SPACING.md, zIndex: 20 }}>
              <DropDownPicker
                open={isWalletDropdownOpen}
                value={selectedWalletIndex}
                items={walletItems}
                setOpen={setIsWalletDropdownOpen}
                setValue={setSelectedWalletIndex}
                listMode="SCROLLVIEW"
                style={{ borderColor: '#E2E8F0', borderWidth: 1 }}
                dropDownContainerStyle={{ borderColor: '#E2E8F0', borderWidth: 1, zIndex: 1000 }}
                textStyle={{ fontSize: 16, color: '#333' }}
                placeholder="Chọn mạng (TRC20/BEP20)"
                zIndex={2000}
                zIndexInverse={1000}
              />
            </View>
          )}

          <View style={styles.cardInfo}>
            <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
              {activeWallet?.qrImage ? (
                <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 12, ...SHADOWS.light }}>
                  {activeWallet.qrImage.toLowerCase().endsWith('.svg') ? (
                    <SvgUri uri={activeWallet.qrImage} width="160" height="160" />
                  ) : (
                    <Image
                      source={{ uri: activeWallet.qrImage }}
                      style={{ width: 160, height: 160 }}
                    />
                  )}
                </View>
              ) : activeWallet?.walletAddress ? (
                <View style={{ padding: 12, backgroundColor: '#fff', borderRadius: 12, ...SHADOWS.light }}>
                  <Image
                    source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${activeWallet.walletAddress}` }}
                    style={{ width: 160, height: 160 }}
                  />
                </View>
              ) : (
                <View style={{ padding: 12, backgroundColor: '#f0f0f0', borderRadius: 12 }}>
                  <QrCode size={160} color="#ccc" />
                </View>
              )}
            </View>
            <Text style={styles.label}>Địa chỉ ví ({activeWallet?.network || 'TRC20'}):</Text>
            <View style={styles.addressRow}>
              <Text style={styles.addressText} numberOfLines={2}>{activeWallet?.walletAddress || 'Chưa cấu hình'}</Text>
              <TouchableOpacity style={styles.copyBtn}>
                <Copy size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.noteText}>Vui lòng chuyển USDT vào đúng địa chỉ ví ở trên.</Text>
            <Text style={styles.noteText}>Tỷ giá hiện tại: 1 USDT = {binanceConfig?.exchangeRate?.toLocaleString('vi-VN') || '25,000'} VNĐ</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Số USDT nạp</Text>
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

        {activeMode === 'auto' ? (
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
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Ảnh biên lai</Text>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickReceipt}>
              {receiptImageUri ? (
                <Image source={{ uri: receiptImageUri }} style={styles.receiptImage} resizeMode="contain" />
              ) : (
                <View style={styles.imagePickerPlaceholder}>
                  <ImageIcon size={32} color={COLORS.gray400} />
                  <Text style={styles.imagePickerText}>Nhấn để tải lên ảnh chụp màn hình chuyển khoản thành công</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 4,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.small,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.textLight,
  },
  tabTextActive: {
    color: '#FFF',
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
  imagePickerBtn: {
    width: '100%',
    height: 200,
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imagePickerPlaceholder: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  imagePickerText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
});
