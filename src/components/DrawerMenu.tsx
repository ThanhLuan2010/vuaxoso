import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { 
  User, 
  Edit3, 
  Wallet, 
  Trophy, 
  Home, 
  BookOpen, 
  UserCircle, 
  FileText, 
  LogOut,
  CreditCard,
  Lock 
} from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { useAppStore } from '../store/useAppStore';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [showModal, setShowModal] = React.useState(visible);

  const { user } = useAppStore();

  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + 'đ';
  };

  useEffect(() => {
    if (visible) {
      setShowModal(true);
      // Wait for modal to mount before animating
      setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false, // Avoid native driver crash on unmounted modal
        }).start();
      }, 50);
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowModal(false);
      });
    }
  }, [visible, slideAnim]);

  const handleNavigate = (screen: string) => {
    onClose();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 300); // Wait for drawer to close
  };

  return (
    showModal ? (
      <View style={styles.modalOverlayWrapper}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.background} />
          </TouchableWithoutFeedback>
          
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
            <View style={styles.userInfoRow}>
              <View style={styles.avatarContainer}>
                <User size={32} color="#FFF" />
              </View>
              <View style={styles.userInfoText}>
                <Text style={styles.phoneText}>{user?.phone || '0899955742'}</Text>
                <Text style={styles.nameText}>{user?.name || 'Guest'}</Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => handleNavigate('AccountInfo')}>
                <Edit3 size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.balanceContainer}>
              <View style={styles.balanceRow}>
                <View style={styles.balanceLeft}>
                  <View style={styles.walletIconWrapper}>
                    <Wallet size={16} color="#0066FF" />
                  </View>
                  <Text style={styles.balanceText}>{formatVND(user?.balance || 0)}</Text>
                </View>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleNavigate('Wallet')}>
                  <Text style={styles.actionBtnText}>Nạp/Rút</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('MainTabs')}>
              <Home size={24} color={COLORS.primary} />
              <Text style={styles.menuText}>Trang chủ</Text>
              <View style={styles.flex1} />
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('Guide')}>
              <BookOpen size={24} color="#E51F27" />
              <Text style={styles.menuText}>Hướng dẫn</Text>
              <View style={styles.flex1} />
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('AccountInfo')}>
              <UserCircle size={24} color="#0066FF" />
              <Text style={styles.menuText}>Thông tin cá nhân</Text>
              <View style={styles.flex1} />
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('PaymentMethods')}>
              <CreditCard size={24} color="#E51F27" />
              <Text style={styles.menuText}>Phương thức thanh toán</Text>
              <View style={styles.flex1} />
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('WithdrawPassword')}>
              <Lock size={24} color="#52c41a" />
              <Text style={styles.menuText}>Mật khẩu rút tiền</Text>
              <View style={styles.flex1} />
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <FileText size={24} color="#0A3B7C" />
              <Text style={styles.menuText}>Điều khoản và chính sách</Text>
              <View style={styles.flex1} />
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity style={styles.logoutBtn}>
              <LogOut size={24} color="#0A3B7C" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
            <Text style={styles.versionText}>Build version SCR-1.1.28</Text>
          </View>
        </Animated.View>
      </View>
    </View>
    ) : null
  );
}

const styles = StyleSheet.create({
  modalOverlayWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  background: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFF',
    ...SHADOWS.medium,
  },
  header: {
    backgroundColor: '#007AFF', // Standard iOS blue, fits screenshot
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF5C00',
  },
  userInfoText: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  phoneText: {
    color: '#FFF',
    fontSize: 14,
  },
  nameText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editBtn: {
    padding: 8,
  },
  balanceContainer: {
    gap: SPACING.md,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  prizeText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionBtn: {
    borderWidth: 1,
    borderColor: '#FFF',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  actionBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  menuContainer: {
    flex: 1,
    paddingTop: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  menuText: {
    marginLeft: SPACING.md,
    fontSize: 16,
    color: COLORS.textDark,
  },
  flex1: {
    flex: 1,
  },
  chevron: {
    fontSize: 20,
    color: COLORS.gray400,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  versionText: {
    fontSize: 12,
    color: COLORS.gray500,
  },
});
