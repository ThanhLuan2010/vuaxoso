import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, UserCircle2, Info, Camera, CheckCircle2 } from 'lucide-react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import api from '../../services/api';

export default function AccountInfoScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { user, updateProfile, sendEmailOtp, verifyEmailOtp } = useAppStore();

  const [name, setName] = useState(user?.name || '');
  const [idCard, setIdCard] = useState(user?.cccdNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cccdImage, setCccdImage] = useState(user?.cccdImage || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const isInfoUpdated = !!user?.isInfoUpdated;

  const handleSelectImage = async () => {
    Alert.alert(
      'Chọn phương thức',
      'Bạn muốn tải ảnh lên từ đâu?',
      [
        {
          text: 'Chụp ảnh',
          onPress: async () => {
            if (Platform.OS === 'android') {
              try {
                const granted = await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.CAMERA,
                  {
                    title: 'Quyền truy cập Camera',
                    message: 'Vua Xổ Số cần quyền truy cập Camera để bạn chụp CCCD.',
                    buttonNeutral: 'Hỏi lại sau',
                    buttonNegative: 'Huỷ',
                    buttonPositive: 'Đồng ý',
                  },
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                  return;
                }
              } catch (err) {
                console.warn(err);
              }
            }
            
            const result = await launchCamera({
              mediaType: 'photo',
              quality: 0.8,
            });
            processImageResult(result);
          }
        },
        {
          text: 'Chọn từ thư viện',
          onPress: async () => {
            if (Platform.OS === 'android') {
              try {
                await PermissionsAndroid.request(
                  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                  {
                    title: 'Quyền truy cập Thư viện ảnh',
                    message: 'Vua Xổ Số cần quyền truy cập Thư viện ảnh để bạn tải CCCD lên.',
                    buttonNeutral: 'Hỏi lại sau',
                    buttonNegative: 'Huỷ',
                    buttonPositive: 'Đồng ý',
                  },
                );
              } catch (err) {
                console.warn(err);
              }
            }
            
            const result = await launchImageLibrary({
              mediaType: 'photo',
              quality: 0.8,
            });
            processImageResult(result);
          }
        },
        {
          text: 'Huỷ',
          style: 'cancel',
        }
      ]
    );
  };

  const processImageResult = async (result: any) => {
    try {
      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      setIsUploading(true);
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        type: asset.type || 'image/jpeg',
        name: asset.fileName || 'cccd.jpg',
      } as any);

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCccdImage(response.data.url);
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !idCard.trim() || !address.trim() || !email.trim() || !cccdImage) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Họ và tên, CMND/CCCD, Địa chỉ, Email và tải lên Ảnh mặt trước CCCD.');
      return;
    }
    
    setIsSaving(true);
    const res = await updateProfile({
      name,
      cccdNumber: idCard,
      address,
      email,
      cccdImage,
    });
    
    setIsSaving(false);
    if (res.success) {
      Alert.alert('Thành công', 'Cập nhật thông tin tài khoản thành công', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Lỗi', res.message || 'Cập nhật thất bại');
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email trước khi xác thực');
      return;
    }
    
    setIsSendingOtp(true);
    const res = await sendEmailOtp(email);
    setIsSendingOtp(false);
    
    if (res.success) {
      setShowOtpModal(true);
      Alert.alert('Thành công', res.message || 'Đã gửi mã OTP đến email của bạn');
    } else {
      Alert.alert('Lỗi', res.message || 'Không thể gửi mã OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }
    
    setIsVerifyingOtp(true);
    const res = await verifyEmailOtp(otp);
    setIsVerifyingOtp(false);
    
    if (res.success) {
      setShowOtpModal(false);
      setOtp('');
      Alert.alert('Thành công', 'Xác thực email thành công');
    } else {
      Alert.alert('Lỗi', res.message || 'Mã OTP không hợp lệ');
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>THÔNG TIN TÀI KHOẢN</Text>
      <View style={styles.headerBtn} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      {renderHeader()}
      
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrapper}>
          <UserCircle2 size={80} color="#0A3B7C" strokeWidth={1} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Họ và tên <Text style={styles.asterisk}>*</Text></Text>
          <TextInput 
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nhập họ và tên"
            placeholderTextColor={COLORS.gray400}
            editable={!isInfoUpdated}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>CMND/CCCD <Text style={styles.asterisk}>*</Text></Text>
          <TextInput 
            style={styles.input}
            value={idCard}
            onChangeText={setIdCard}
            keyboardType="number-pad"
            placeholder="Nhập CMND/CCCD"
            placeholderTextColor={COLORS.gray400}
            editable={!isInfoUpdated}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Địa chỉ <Text style={styles.asterisk}>*</Text></Text>
          <TextInput 
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Nhập địa chỉ"
            placeholderTextColor={COLORS.gray400}
            editable={!isInfoUpdated}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <View style={styles.emailRow}>
            <TextInput 
              style={[styles.input, { flex: 1 }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              placeholder="Nhập email"
              placeholderTextColor={COLORS.gray400}
              editable={!isInfoUpdated}
            />
            {user?.emailVerified ? (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={14} color="#34C759" style={{ marginRight: 4 }} />
                <Text style={styles.verifiedText}>Đã xác thực</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.verifyBtn} 
                onPress={handleSendOtp}
                disabled={isSendingOtp || isInfoUpdated || !email.trim()}
              >
                {isSendingOtp ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={styles.verifyBtnText}>Xác thực</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Ảnh CMND/CCCD (Mặt trước)</Text>
          <TouchableOpacity 
            style={styles.imageUploadBtn} 
            onPress={handleSelectImage}
            disabled={isUploading || isInfoUpdated}
          >
            {isUploading ? (
              <ActivityIndicator color="#007AFF" />
            ) : cccdImage ? (
              <Image source={{ uri: `https://api-vuaxoso.vipmarts.com${cccdImage}` }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Camera size={24} color={COLORS.gray500} />
                <Text style={styles.uploadText}>Bấm để tải ảnh lên</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>



        <Text style={styles.warningText}>
          Quý khách cần kiểm tra và điền đúng thông tin.{"\n"}
          Thông tin này phục vụ cho việc xác minh quyền sở{"\n"}
          hữu vé số và trả thưởng.
        </Text>
      </ScrollView>

      {!isInfoUpdated && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity 
            style={[styles.submitBtn, isSaving && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>Xác nhận thông tin</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* OTP Modal */}
      <Modal visible={showOtpModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Xác thực Email</Text>
            <Text style={styles.modalSubtitle}>Nhập mã OTP gồm 6 chữ số được gửi đến {email}</Text>
            
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Nhập mã OTP"
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel]} 
                onPress={() => setShowOtpModal(false)}
              >
                <Text style={styles.modalBtnCancelText}>Huỷ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnSubmit]} 
                onPress={handleVerifyOtp}
                disabled={isVerifyingOtp || otp.length < 6}
              >
                {isVerifyingOtp ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalBtnSubmitText}>Xác nhận</Text>
                )}
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
    backgroundColor: '#F5F5F5',
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
  content: {
    padding: SPACING.lg,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  inputGroup: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: 4,
  },
  asterisk: {
    color: '#FF3B30',
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    fontSize: 16,
    color: COLORS.textDark,
    padding: 0,
    height: 24,
  },
  verifyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#E5F1FF',
    borderRadius: BORDER_RADIUS.sm,
  },
  verifyBtnText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  verifiedText: {
    color: '#34C759',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: '#0066FF',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0066FF',
  },
  checkboxLabel: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  warningText: {
    fontSize: 13,
    color: '#0066FF',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageUploadBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: BORDER_RADIUS.md,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    marginTop: 8,
    color: COLORS.gray500,
    fontSize: 12,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: SPACING.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalBtnSubmit: {
    backgroundColor: '#007AFF',
  },
  modalBtnCancelText: {
    color: COLORS.gray600,
    fontSize: 16,
    fontWeight: '600',
  },
  modalBtnSubmitText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
