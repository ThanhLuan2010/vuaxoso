import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useAppStore } from '../../store/useAppStore';

export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { logout } = useAppStore();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ các trường.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      setIsLoading(false);
      Alert.alert('Thành công', 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.', [
        { text: 'OK', onPress: () => {
          logout();
        }}
      ]);
    } catch (error: any) {
      setIsLoading(false);
      Alert.alert('Lỗi', error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { height: 56 + (Platform.OS === 'android' ? insets.top : 0), paddingTop: Platform.OS === 'android' ? insets.top : 0 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.description}>
          Vui lòng cập nhật mật khẩu mới để tăng cường bảo mật cho tài khoản của bạn (yêu cầu đổi định kỳ 3 tháng/lần).
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color="#7F8E9C" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu hiện tại"
              placeholderTextColor="#ADB5BD"
              secureTextEntry={!showOldPass}
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TouchableOpacity onPress={() => setShowOldPass(!showOldPass)} style={styles.eyeBtn}>
              {showOldPass ? <Eye size={20} color="#7F8E9C" /> : <EyeOff size={20} color="#7F8E9C" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu mới</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color="#7F8E9C" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor="#ADB5BD"
              secureTextEntry={!showNewPass}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNewPass(!showNewPass)} style={styles.eyeBtn}>
              {showNewPass ? <Eye size={20} color="#7F8E9C" /> : <EyeOff size={20} color="#7F8E9C" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color="#7F8E9C" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu mới"
              placeholderTextColor="#ADB5BD"
              secureTextEntry={!showConfirmPass}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)} style={styles.eyeBtn}>
              {showConfirmPass ? <Eye size={20} color="#7F8E9C" /> : <EyeOff size={20} color="#7F8E9C" />}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitBtnText}>{isLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#0A3B7C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#E51F27',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F2942',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    height: 48,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#0F2942',
    fontSize: 15,
  },
  eyeBtn: {
    padding: 12,
  },
  submitBtn: {
    backgroundColor: '#0084FA',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  submitBtnDisabled: {
    backgroundColor: '#A5D8FF',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
