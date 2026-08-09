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
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, UserCircle2, Info, Camera } from 'lucide-react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import api from '../../services/api';

export default function AccountInfoScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const { user, updateProfile } = useAppStore();

  const [name, setName] = useState(user?.name || '');
  const [idCard, setIdCard] = useState(user?.cccdNumber || '');
  const [address, setAddress] = useState(user?.address || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cccdImage, setCccdImage] = useState(user?.cccdImage || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    if (!name.trim() || !idCard.trim() || !address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ Họ và tên, CMND/CCCD và Địa chỉ');
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
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          <TextInput 
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Nhập email"
            placeholderTextColor={COLORS.gray400}
            editable={!isInfoUpdated}
          />
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
  input: {
    fontSize: 16,
    color: COLORS.textDark,
    padding: 0,
    height: 24,
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
});
