import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, PlusCircle, Trash2, CreditCard, Wallet } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import api from '../../services/api';
import { launchImageLibrary } from 'react-native-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';

const VIETNAM_BANKS = [
  { label: 'Vietcombank', value: 'Vietcombank' },
  { label: 'Vietinbank', value: 'Vietinbank' },
  { label: 'BIDV', value: 'BIDV' },
  { label: 'Agribank', value: 'Agribank' },
  { label: 'Techcombank', value: 'Techcombank' },
  { label: 'MBBank', value: 'MBBank' },
  { label: 'ACB', value: 'ACB' },
  { label: 'Sacombank', value: 'Sacombank' },
  { label: 'VPBank', value: 'VPBank' },
  { label: 'TPBank', value: 'TPBank' },
  { label: 'VIB', value: 'VIB' },
  { label: 'HDBank', value: 'HDBank' },
  { label: 'SHB', value: 'SHB' },
  { label: 'SeABank', value: 'SeABank' },
  { label: 'LienVietPostBank', value: 'LienVietPostBank' }
];

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, updateProfile } = useAppStore();

  const [banks, setBanks] = useState(user?.banks || []);
  const [wallets, setWallets] = useState(user?.wallets || []);
  const [isSaving, setIsSaving] = useState(false);

  const [addingBank, setAddingBank] = useState(false);
  const [newBank, setNewBank] = useState<{ bankName: string, accountNumber: string, accountName: string, qrCode?: string }>({ bankName: '', accountNumber: '', accountName: '' });
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);

  const [addingWallet, setAddingWallet] = useState(false);
  const [newWallet, setNewWallet] = useState<{ network: 'BEP20' | 'TRC20' | 'Binance Pay', address: string, qrCode?: string }>({ network: 'BEP20', address: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBankQr, setIsUploadingBankQr] = useState(false);

  const handleSave = async (updatedBanks: any[], updatedWallets: any[]) => {
    setIsSaving(true);
    try {
      const res = await updateProfile({ banks: updatedBanks, wallets: updatedWallets } as any);
      
      if (res.success) {
        // the store will update the user, so we should sync local state
        const updatedUser = useAppStore.getState().user;
        setBanks(updatedUser?.banks || []);
        setWallets(updatedUser?.wallets || []);
        setAddingBank(false);
        setAddingWallet(false);
        setNewBank({ bankName: '', accountNumber: '', accountName: '' });
        setNewWallet({ network: 'BEP20', address: '' });
        Alert.alert('Thành công', 'Đã cập nhật phương thức thanh toán');
      } else {
        Alert.alert('Lỗi', res.message || 'Lỗi cập nhật');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBank = () => {
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountName) {
      return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin ngân hàng');
    }
    const newBanks = [...banks, newBank];
    handleSave(newBanks, wallets);
  };

  const handleAddWallet = () => {
    if (!newWallet.address) {
      return Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ ví');
    }
    const newWallets = [...wallets, newWallet];
    handleSave(banks, newWallets);
  };

  const handleSelectImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.[0]) return;
    
    const asset = result.assets[0];
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'ios' ? asset.uri?.replace('file://', '') : asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'qrcode.jpg',
      } as any);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // API appends the base URL automatically if it's relative? 
      // Typically we'll just save the relative URL and render with base URL, or maybe just save what API returns.
      // Assuming api-vuaxoso.vipmarts.com is the backend, it serves /uploads
      let fullUrl = res.data.url;
      if (fullUrl && fullUrl.startsWith('/')) {
        fullUrl = api.defaults.baseURL?.replace('/api', '') + fullUrl;
      }
      
      setNewWallet({ ...newWallet, qrCode: fullUrl });
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Lỗi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectBankQr = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.didCancel || !result.assets?.[0]) return;
    
    const asset = result.assets[0];
    
    setIsUploadingBankQr(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: Platform.OS === 'ios' ? asset.uri?.replace('file://', '') : asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'qrcode.jpg',
      } as any);

      const res = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      let fullUrl = res.data.url;
      if (fullUrl && fullUrl.startsWith('/')) {
        fullUrl = api.defaults.baseURL?.replace('/api', '') + fullUrl;
      }
      
      setNewBank({ ...newBank, qrCode: fullUrl });
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Lỗi tải ảnh lên');
    } finally {
      setIsUploadingBankQr(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phương thức nhận tiền</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {/* Banks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <CreditCard size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Tài khoản Ngân Hàng ({banks.length}/2)</Text>
          </View>
          
          {banks.map((bank: any, index: number) => (
            <View key={`bank-${index}`} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{bank.bankName}</Text>
                <Text style={styles.cardDesc}>{bank.accountNumber}</Text>
                <Text style={styles.cardDesc}>{bank.accountName}</Text>
              </View>
              {bank.qrCode && (
                <Image source={{ uri: bank.qrCode }} style={{ width: 40, height: 40, borderRadius: 4 }} />
              )}
            </View>
          ))}

          {banks.length < 2 && !addingBank && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddingBank(true)}>
              <PlusCircle size={20} color={COLORS.primary} />
              <Text style={styles.addBtnText}>Thêm Tài khoản Ngân Hàng</Text>
            </TouchableOpacity>
          )}

          {addingBank && (
            <View style={[styles.formContainer, { zIndex: 10 }]}>
              <DropDownPicker
                open={bankDropdownOpen}
                value={newBank.bankName}
                items={VIETNAM_BANKS}
                setOpen={setBankDropdownOpen}
                setValue={(callback) => {
                  const val = typeof callback === 'function' ? callback(newBank.bankName) : callback;
                  setNewBank({...newBank, bankName: val as string});
                }}
                placeholder="Chọn Ngân Hàng"
                style={{ borderColor: '#E2E8F0', borderWidth: 1, marginBottom: 12, height: 48, borderRadius: 8, backgroundColor: '#F8FAFC' }}
                dropDownContainerStyle={{ borderColor: '#E2E8F0', zIndex: 1000 }}
                listMode="SCROLLVIEW"
                zIndex={1000}
                zIndexInverse={1000}
              />
              <TextInput
                style={styles.input}
                placeholder="Số Tài Khoản"
                keyboardType="numeric"
                value={newBank.accountNumber}
                onChangeText={t => setNewBank({...newBank, accountNumber: t})}
              />
              <TextInput
                style={styles.input}
                placeholder="Tên Chủ Thẻ"
                autoCapitalize="words"
                value={newBank.accountName}
                onChangeText={t => setNewBank({...newBank, accountName: t})}
              />
              <TouchableOpacity style={styles.qrUploadBtn} onPress={handleSelectBankQr}>
                {newBank.qrCode ? (
                  <Image source={{ uri: newBank.qrCode }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                ) : (
                  <>
                    <PlusCircle size={24} color={COLORS.gray400} />
                    <Text style={styles.qrUploadText}>
                      {isUploadingBankQr ? 'Đang tải...' : 'Tải ảnh QR Bank (Tuỳ chọn)'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelFormBtn} onPress={() => setAddingBank(false)}>
                  <Text style={styles.cancelFormText}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitFormBtn} onPress={handleAddBank} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitFormText}>Lưu</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Wallets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wallet size={20} color="#52c41a" />
            <Text style={styles.sectionTitle}>Ví USDT / Binance ({wallets.length}/2)</Text>
          </View>
          
          {wallets.map((wallet: any, index: number) => (
            <View key={`wallet-${index}`} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{wallet.network === 'Binance Pay' ? 'Binance Pay' : `Ví USDT (${wallet.network})`}</Text>
                <Text style={styles.cardDesc}>{wallet.address}</Text>
              </View>
              {wallet.qrCode && (
                <Image source={{ uri: wallet.qrCode }} style={{ width: 40, height: 40, borderRadius: 4 }} />
              )}
            </View>
          ))}

          {wallets.length < 2 && !addingWallet && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddingWallet(true)}>
              <PlusCircle size={20} color={COLORS.primary} />
              <Text style={styles.addBtnText}>Thêm USDT / Binance</Text>
            </TouchableOpacity>
          )}

          {addingWallet && (
            <View style={styles.formContainer}>
              <View style={styles.networkSelect}>
                <TouchableOpacity 
                  style={[styles.networkBtn, newWallet.network === 'BEP20' && styles.networkBtnActive]}
                  onPress={() => setNewWallet({...newWallet, network: 'BEP20'})}
                >
                  <Text style={[styles.networkText, newWallet.network === 'BEP20' && styles.networkTextActive]}>BEP20</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.networkBtn, newWallet.network === 'TRC20' && styles.networkBtnActive]}
                  onPress={() => setNewWallet({...newWallet, network: 'TRC20'})}
                >
                  <Text style={[styles.networkText, newWallet.network === 'TRC20' && styles.networkTextActive]}>TRC20</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.networkBtn, newWallet.network === 'Binance Pay' && styles.networkBtnActive]}
                  onPress={() => setNewWallet({...newWallet, network: 'Binance Pay'})}
                >
                  <Text style={[styles.networkText, newWallet.network === 'Binance Pay' && styles.networkTextActive]}>Binance Pay</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder={newWallet.network === 'Binance Pay' ? 'Binance Pay ID / Email / SĐT' : 'Địa chỉ ví USDT'}
                value={newWallet.address}
                onChangeText={t => setNewWallet({...newWallet, address: t})}
              />
              
              <TouchableOpacity style={styles.qrUploadBtn} onPress={handleSelectImage}>
                {newWallet.qrCode ? (
                  <Image source={{ uri: newWallet.qrCode }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                ) : (
                  <>
                    <PlusCircle size={24} color={COLORS.gray400} />
                    <Text style={styles.qrUploadText}>
                      {isUploading ? 'Đang tải...' : 'Tải ảnh QR Code (bắt buộc)'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.formActions}>
                <TouchableOpacity style={styles.cancelFormBtn} onPress={() => setAddingWallet(false)}>
                  <Text style={styles.cancelFormText}>Huỷ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitFormBtn} onPress={handleAddWallet} disabled={isSaving}>
                  {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitFormText}>Lưu</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: COLORS.textMuted,
  },
  removeBtn: {
    padding: 8,
  },
  qrUploadBtn: {
    height: 80,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    flexDirection: 'row',
    gap: 8,
  },
  qrUploadText: {
    color: COLORS.gray500,
    fontSize: 14,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: SPACING.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  addBtnText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.primary,
  },
  formContainer: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: '#F8F9FA',
    borderRadius: BORDER_RADIUS.md,
  },
  input: {
    backgroundColor: '#FFF',
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  networkSelect: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  networkBtn: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  networkBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  networkText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textMuted,
  },
  networkTextActive: {
    color: COLORS.primary,
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  cancelFormBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: '#E5E7EB',
  },
  cancelFormText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textDark,
  },
  submitFormBtn: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  submitFormText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: '#FFF',
  }
});
