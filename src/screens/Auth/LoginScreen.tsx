import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useAppStore } from '../../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme/theme';

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, register: registerApi } = useAppStore();
  const { control, handleSubmit, formState: { errors }, reset } = useForm();

  const toggleMode = () => {
    setIsRegister(!isRegister);
    reset(); // clear form
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
      const { success, message } = await login(data.phone, data.password);
      if (success) {
        Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đăng nhập thành công!' });
      } else {
        Toast.show({ type: 'error', text1: 'Thất bại', text2: message || 'Sai số điện thoại hoặc mật khẩu' });
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

      <TouchableOpacity style={styles.toggleBtn} onPress={toggleMode}>
        <Text style={styles.toggleText}>
          {isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký ngay'}
        </Text>
      </TouchableOpacity>
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
});
