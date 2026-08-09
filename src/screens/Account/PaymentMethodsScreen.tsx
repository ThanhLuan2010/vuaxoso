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
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, PlusCircle, Trash2, CreditCard, Wallet } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import api from '../../services/api';

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, updateProfile } = useAppStore();

  const [banks, setBanks] = useState(user?.banks || []);
  const [wallets, setWallets] = useState(user?.wallets || []);
  const [isSaving, setIsSaving] = useState(false);

  const [addingBank, setAddingBank] = useState(false);
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountName: '' });

  const [addingWallet, setAddingWallet] = useState(false);
  const [newWallet, setNewWallet] = useState<{ network: 'BEP20' | 'TRC20', address: string }>({ network: 'BEP20', address: '' });

  const handleSave = async (updatedBanks: any[], updatedWallets: any[]) => {
    setIsSaving(true);
    try {
      const res = await api.put('/users/profile', { banks: updatedBanks, wallets: updatedWallets });
      updateProfile(res.data);
      setBanks(res.data.banks || []);
      setWallets(res.data.wallets || []);
      setAddingBank(false);
      setAddingWallet(false);
      setNewBank({ bankName: '', accountNumber: '', accountName: '' });
      setNewWallet({ network: 'BEP20', address: '' });
      Alert.alert('Thành công', 'Đã cập nhật phương thức thanh toán');
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

  const handleRemoveBank = (index: number) => {
    Alert.alert('Xoá Ngân Hàng', 'Bạn có chắc muốn xoá tài khoản này?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: () => {
        const newBanks = banks.filter((_, i: number) => i !== index);
        handleSave(newBanks, wallets);
      }}
    ]);
  };

  const handleAddWallet = () => {
    if (!newWallet.address) {
      return Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ ví');
    }
    const newWallets = [...wallets, newWallet];
    handleSave(banks, newWallets);
  };

  const handleRemoveWallet = (index: number) => {
    Alert.alert('Xoá Ví', 'Bạn có chắc muốn xoá ví này?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: () => {
        const newWallets = wallets.filter((_, i: number) => i !== index);
        handleSave(banks, newWallets);
      }}
    ]);
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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
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
              <TouchableOpacity onPress={() => handleRemoveBank(index)} style={styles.removeBtn}>
                <Trash2 size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}

          {banks.length < 2 && !addingBank && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddingBank(true)}>
              <PlusCircle size={20} color={COLORS.primary} />
              <Text style={styles.addBtnText}>Thêm Tài khoản Ngân Hàng</Text>
            </TouchableOpacity>
          )}

          {addingBank && (
            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Tên Ngân hàng (VD: Vietcombank)"
                value={newBank.bankName}
                onChangeText={t => setNewBank({...newBank, bankName: t})}
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
            <Text style={styles.sectionTitle}>Ví USDT ({wallets.length}/2)</Text>
          </View>
          
          {wallets.map((wallet: any, index: number) => (
            <View key={`wallet-${index}`} style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Ví USDT ({wallet.network})</Text>
                <Text style={styles.cardDesc}>{wallet.address}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveWallet(index)} style={styles.removeBtn}>
                <Trash2 size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))}

          {wallets.length < 2 && !addingWallet && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setAddingWallet(true)}>
              <PlusCircle size={20} color={COLORS.primary} />
              <Text style={styles.addBtnText}>Thêm Ví USDT</Text>
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
              </View>
              <TextInput
                style={styles.input}
                placeholder="Địa chỉ ví USDT"
                value={newWallet.address}
                onChangeText={t => setNewWallet({...newWallet, address: t})}
              />
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
