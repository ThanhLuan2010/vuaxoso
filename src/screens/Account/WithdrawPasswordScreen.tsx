import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import api from '../../services/api';

export default function WithdrawPasswordScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, updateProfile } = useAppStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isSettingNew = !user?.hasWithdrawPassword;

  const handleSave = async () => {
    if (!password || !confirmPassword) {
      return Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mật khẩu');
    }
    if (password !== confirmPassword) {
      return Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
    }
    if (password.length < 6) {
      return Alert.alert('Lỗi', 'Mật khẩu rút tiền phải từ 6 ký tự trở lên');
    }

    setIsSaving(true);
    try {
      const res = await updateProfile({ withdrawPassword: password } as any);
      if (res.success) {
        Alert.alert('Thành công', isSettingNew ? 'Đã cài đặt mật khẩu rút tiền' : 'Đã thay đổi mật khẩu rút tiền', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Lỗi', res.message || 'Có lỗi xảy ra');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSaving(false);
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
        <Text style={styles.headerTitle}>{isSettingNew ? 'Cài đặt Mật khẩu rút tiền' : 'Đổi Mật khẩu rút tiền'}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Lock size={48} color={COLORS.primary} />
          <Text style={styles.descText}>
            {isSettingNew 
              ? 'Tạo mật khẩu rút tiền để bảo vệ tài sản của bạn. Mật khẩu này sẽ được yêu cầu mỗi khi bạn thực hiện lệnh rút.' 
              : 'Bạn đã cài đặt mật khẩu rút tiền thành công. Vì lý do bảo mật, bạn không thể thay đổi mật khẩu rút tiền. Nếu bạn quên, vui lòng liên hệ CSKH.'}
          </Text>
        </View>

        {isSettingNew && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu rút tiền mới"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu rút tiền mới"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Lưu Cài Đặt</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    padding: SPACING.md,
  },
  iconContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  descText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  form: {
    backgroundColor: '#FFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
  },
  input: {
    backgroundColor: '#F8F9FA',
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveBtn: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  saveBtnText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFF',
  },
});
