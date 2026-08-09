import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme/theme';

const GUIDE_DATA = [
  {
    id: '1',
    title: 'Hướng dẫn chơi Xổ Số Loto 2,3,5 số',
    subtitle: 'Lịch quay: 18h15 – 18h30 hàng ngày',
    iconType: 'X',
  },
  {
    id: '2',
    title: 'Hướng dẫn chơi Xổ Số Điện Toán 6x36',
    subtitle: 'Lịch quay: 18h15 thứ 4 và thứ 7 hàng tuần',
    iconType: 'X',
  },
  {
    id: '3',
    title: 'Hướng dẫn cách chơi xổ số kiến thiết Bắc, Trung, Nam',
    subtitle: 'Lịch quay: 18h15 – 18h30 hàng ngày',
    iconType: 'X',
  },
  {
    id: '4',
    title: 'Hướng dẫn chơi Xổ Số Loto 2,3,4 cặp số',
    subtitle: 'Lịch quay: 18h15 – 18h30 hàng ngày',
    iconType: 'X',
  },
  {
    id: '5',
    title: 'Hướng dẫn chơi KENO',
    subtitle: 'Lịch quay: 8 phút quay số một lần, 119 kỳ/ngày, từ 6:00 đến 21:52, tất cả các ngày trong tuần.',
    iconType: 'KENO',
  },
  {
    id: '6',
    title: 'Hướng dẫn tham gia MUA CHUNG',
    subtitle: '',
    iconType: 'MUACHUNG',
  },
  {
    id: '7',
    title: 'Hướng dẫn chơi Power 6/55',
    subtitle: '',
    iconType: 'POWER',
  },
  {
    id: '8',
    title: 'Hướng dẫn chơi Mega 6/45',
    subtitle: '',
    iconType: 'MEGA',
  },
  {
    id: '9',
    title: 'Hướng dẫn chơi BAO Xổ Số Điện Toán 6x36',
    subtitle: 'Lịch quay: 18h15 thứ 4 và thứ 7 hàng tuần',
    iconType: 'X',
  },
];

export default function GuideScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>HƯỚNG DẪN</Text>
      <View style={styles.headerBtn} />
    </View>
  );

  const renderIcon = (type: string) => {
    switch (type) {
      case 'X':
        return (
          <View style={styles.iconXContainer}>
            <Text style={styles.iconXText}>X</Text>
          </View>
        );
      case 'KENO':
        return <Text style={styles.logoKeno}>KENO</Text>;
      case 'MUACHUNG':
        return (
          <View style={styles.logoMuaChung}>
            <Text style={styles.logoMuaText}>MUA</Text>
            <Text style={styles.logoChungText}>CHUNG</Text>
          </View>
        );
      case 'POWER':
        return (
          <View style={styles.logoVietlott}>
            <Text style={styles.logoPowerText}>POWER</Text>
            <Text style={styles.logoNumberText}>6/55</Text>
          </View>
        );
      case 'MEGA':
        return (
          <View style={styles.logoVietlott}>
            <Text style={styles.logoMegaText}>MEGA</Text>
            <Text style={styles.logoNumberText}>6/45</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {renderHeader()}
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {GUIDE_DATA.map((item) => (
          <TouchableOpacity key={item.id} style={styles.itemCard}>
            <View style={styles.itemIconWrapper}>
              {renderIcon(item.iconType)}
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
              ) : null}
            </View>
            <ChevronRight size={20} color={COLORS.gray400} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    paddingTop: SPACING.md,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  itemIconWrapper: {
    width: 60,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A3B7C',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
    lineHeight: 16,
  },
  // Logos
  iconXContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E51F27',
    borderRightWidth: 16,
    borderRightColor: '#0066FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  iconXText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    position: 'absolute',
    left: 10,
  },
  logoKeno: {
    color: '#FF5C00',
    fontSize: 18,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  logoMuaChung: {
    alignItems: 'center',
  },
  logoMuaText: {
    color: '#0A3B7C',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoChungText: {
    color: '#FF5C00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoVietlott: {
    alignItems: 'center',
  },
  logoPowerText: {
    color: '#D9981B',
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  logoMegaText: {
    color: '#E51F27',
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  logoNumberText: {
    color: '#D9981B',
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
  },
});
