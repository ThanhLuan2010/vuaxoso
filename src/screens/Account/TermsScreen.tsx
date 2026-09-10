import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const res = await api.get('/settings/terms_policies');
        setContent(res.data);
      } catch (error) {
        setContent('Đang cập nhật nội dung...');
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điều khoản & Chính sách</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            <Text style={styles.termsText}>{content || 'Chưa có thông tin.'}</Text>
            
            <View style={styles.kenoRulesBox}>
              <Text style={styles.kenoRulesTitle}>⚠️ LUẬT CHƠI KENO (QUAN TRỌNG)</Text>
              <Text style={styles.termsText}>
                • <Text style={{fontWeight: 'bold'}}>Thời gian nhận đơn:</Text> Hệ thống dừng nhận đơn trước giờ quay số 02 phút. {'\n'}
                • <Text style={{fontWeight: 'bold'}}>Trường hợp không kịp xử lý:</Text> Nếu hệ thống chưa hoàn tất mua hộ và cập nhật ảnh vé trước giờ quay, đơn hàng sẽ bị hủy và hoàn tiền 100%. {'\n'}
                • <Text style={{fontWeight: 'bold'}}>Trách nhiệm:</Text> Quý khách cam kết không khiếu nại, đòi bồi thường hoặc quy đổi giá trị giải thưởng đối với các đơn hàng bị hủy nêu trên. {'\n'}
                • <Text style={{fontWeight: 'bold'}}>Giới hạn số:</Text> Max 60 số / 1 khách / 1 ngày. {'\n'}
                • <Text style={{fontWeight: 'bold'}}>IP/Device:</Text> Giải thưởng kỳ quay được xem như huỷ nếu IP/thiết bị device trùng với bất kỳ tài khoản khác hoặc chơi đối nghịch với các tài khoản khác hoặc với bất kỳ hành vi gian lận mà hệ thống phát hiện. {'\n'}
                • <Text style={{fontWeight: 'bold'}}>Giới hạn trả thưởng:</Text> Tối đa trả thưởng 1 kỳ quay là 10.000.000.000 VNĐ. Nếu có nhiều vé cùng trúng 10 số trong 1 kỳ quay thì 10 tỷ chia đều các vé. {'\n'}
                • <Text style={{fontWeight: 'bold'}}>Thuế:</Text> Tiền thưởng nhận được sẽ tự động trừ -10% thuế thu nhập cá nhân theo quy định pháp luật VN.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#FFF',
    textAlign: 'center',
  },
  content: {
    padding: SPACING.lg,
  },
  termsText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: COLORS.textDark,
    lineHeight: 24,
  },
  kenoRulesBox: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  kenoRulesTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  }
});
