import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Modal } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { Headset } from 'lucide-react-native';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expiredModalVisible, setExpiredModalVisible] = useState(false);
  const [expiredPhone, setExpiredPhone] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login, register: registerApi } = useAppStore();
  const { control, handleSubmit, formState: { errors }, reset } = useForm();

  const toggleMode = () => {
    setIsRegister(!isRegister);
    reset(); // clear form
  };

  const handleResetPassword = async () => {
    if (!oldPassword || !newPassword) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập đủ thông tin' });
      return;
    }
    if (newPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Mật khẩu mới tối thiểu 6 ký tự' });
      return;
    }
    setResetLoading(true);
    try {
      // Import api or fetch directly
      const response = await fetch(`${useAppStore.getState().token ? 'http://localhost:5000' : 'https://api-vuaxoso.vipmarts.com'}/api/auth/change-expired-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: expiredPhone, oldPassword, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại!' });
        setExpiredModalVisible(false);
        setOldPassword('');
        setNewPassword('');
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: data.message || 'Lỗi đổi mật khẩu' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Lỗi kết nối' });
    } finally {
      setResetLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    if (isRegister) {
      const { success, message } = await registerApi(data.phone, data.name, data.password);
      if (success) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đăng ký thành công!' });
      } else {
        Toast.show({ type: 'error', text1: 'Thất bại', text2: message || 'Đăng ký thất bại' });
      }
    } else {
      const { success, message, code } = await login(data.phone, data.password);
      if (success) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đăng nhập thành công!' });
      } else {
        if (code === 'PASSWORD_EXPIRED') {
          setExpiredPhone(data.phone);
          setExpiredModalVisible(true);
        } else {
          Toast.show({ type: 'error', text1: 'Thất bại', text2: message || 'Sai số điện thoại hoặc mật khẩu' });
        }
      }
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegister ? 'ĐĂNG KÝ' : 'ĐĂNG NHẬP'}</Text>

      {isRegister && (
        <View style={styles.inputWrapper}>
          <Controller
            control={control}
            rules={{ required: 'Vui lòng nhập họ tên' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Họ và tên"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                placeholderTextColor={COLORS.gray400}
              />
            )}
            name="name"
          />
          {errors.name && <Text style={styles.errorText}>{String(errors.name.message)}</Text>}
        </View>
      )}

      <View style={styles.inputWrapper}>
        <Controller
          control={control}
          rules={{
            required: 'Vui lòng nhập số điện thoại',
            pattern: {
              value: /^[0-9]{9,11}$/,
              message: 'Số điện thoại không hợp lệ (9-11 số)'
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Số điện thoại"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              keyboardType="phone-pad"
              placeholderTextColor={COLORS.gray400}
            />
          )}
          name="phone"
        />
        {errors.phone && <Text style={styles.errorText}>{String(errors.phone.message)}</Text>}
      </View>

      <View style={styles.inputWrapper}>
        <Controller
          control={control}
          rules={{
            required: 'Vui lòng nhập mật khẩu',
            minLength: {
              value: 6,
              message: 'Mật khẩu phải từ 6 ký tự trở lên'
            }
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Mật khẩu"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry
              placeholderTextColor={COLORS.gray400}
            />
          )}
          name="password"
        />
        {errors.password && <Text style={styles.errorText}>{String(errors.password.message)}</Text>}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)} disabled={loading}>
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{isRegister ? 'Đăng ký' : 'Đăng nhập'}</Text>}
      </TouchableOpacity>

      {isRegister ? (
        <TouchableOpacity style={styles.toggleBtn} onPress={toggleMode}>
          <Text style={styles.toggleText}>Đã có tài khoản? Đăng nhập ngay</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.md }}>
          <TouchableOpacity onPress={() => Toast.show({ type: 'info', text1: 'Thông báo', text2: 'Vui lòng liên hệ CSKH để cấp lại mật khẩu' })}>
            <Text style={{ color: '#0A3B7C', fontSize: 14, fontWeight: '500' }}>Quên mật khẩu?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleMode}>
            <Text style={{ color: '#E51F27', fontSize: 14, fontWeight: '500' }}>Đăng ký mới</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.cskhBtn} 
        onPress={() => Linking.openURL('https://t.me/mobileappp')}
      >
        <Text style={styles.cskhText}>CSKH</Text>
        <View style={styles.cskhIconWrapper}>
          <Headset size={20} color="#FFF" />
        </View>
      </TouchableOpacity>

      <Modal visible={expiredModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mật Khẩu Đã Hết Hạn</Text>
            <Text style={styles.modalDesc}>Mật khẩu của bạn đã quá hạn sử dụng (2 tháng). Vui lòng đổi mật khẩu mới để tiếp tục.</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu hiện tại"
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <TouchableOpacity style={[styles.btn, { flex: 1, marginRight: 10, backgroundColor: COLORS.gray400 }]} onPress={() => setExpiredModalVisible(false)}>
                <Text style={styles.btnText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={handleResetPassword} disabled={resetLoading}>
                {resetLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Đổi mật khẩu</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A3B7C',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  inputWrapper: {
    marginBottom: SPACING.md,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textDark,
  },
  inputError: {
    borderColor: '#E51F27',
  },
  errorText: {
    color: '#E51F27',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  btn: {
    backgroundColor: '#E51F27',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleBtn: {
    marginTop: SPACING.lg,
    alignItems: 'center',
  },
  toggleText: {
    color: '#0066FF',
    fontSize: 14,
  },
  cskhBtn: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cskhText: {
    color: '#0084FF',
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  cskhIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0084FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E51F27',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  }
});
