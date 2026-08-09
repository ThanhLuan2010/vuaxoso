import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../theme/theme';
import { Menu, Bell } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DrawerMenu from './DrawerMenu';

export default function Header() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, unreadNotifications } = useAppStore();
  const insets = useSafeAreaInsets();
  const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <View style={styles.leftRow}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => {
              console.log('MENU BUTTON PRESSED');
              setIsDrawerVisible(true);
            }}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Menu size={24} color="#0F2942" />
          </TouchableOpacity>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeLabel}>Xin chào</Text>
          <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Nút Nạp/Rút viền đen/xanh */}
        <TouchableOpacity 
          style={styles.walletBtn}
          onPress={() => navigation.navigate('Wallet')}
        >
          <Text style={styles.walletBtnText}>Nạp/rút</Text>
        </TouchableOpacity>

        {/* Chuông thông báo */}
        <TouchableOpacity 
          style={styles.bellBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Bell size={24} color="#0F2942" />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadNotifications}</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
    <DrawerMenu visible={isDrawerVisible} onClose={() => setIsDrawerVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBtn: {
    padding: 4,
  },
  welcomeContainer: {
    justifyContent: 'center',
    marginLeft: 2,
  },
  welcomeLabel: {
    fontSize: 11,
    color: '#7F8E9C',
    lineHeight: 14,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F2942',
    lineHeight: 18,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  walletBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0F2942',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 8,
  },
  walletBtnText: {
    color: '#0F2942',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bellBtn: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF9A00',
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
});

