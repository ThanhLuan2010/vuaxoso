import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../theme/theme';

import HomeScreen from '../screens/Home/HomeScreen';
import StatsMenuScreen from '../screens/Stats/StatsMenuScreen';
import StatsKenoScreen from '../screens/Stats/StatsKenoScreen';
import StatsDienToanScreen from '../screens/Stats/StatsDienToanScreen';
import StatsTruyenThongScreen from '../screens/Stats/StatsTruyenThongScreen';
import LiveScreen from '../screens/Live/LiveScreen';
import ResultsScreen from '../screens/Results/ResultsScreen';
import VietlottDetailScreen from '../screens/Results/VietlottDetailScreen';
import HistoryScreen from '../screens/History/HistoryScreen';
import HistoryDetailScreen from '../screens/History/HistoryDetailScreen';
import WalletScreen from '../screens/Wallet/WalletScreen';
import DepositBinanceScreen from '../screens/Wallet/DepositBinanceScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import CartScreen from '../screens/Cart/CartScreen';
import GameLayoutAScreen from '../screens/Game/GameLayoutAScreen';
import GameLayoutLodeScreen from '../screens/Game/GameLayoutLodeScreen';
import GameLayoutBScreen from '../screens/Game/GameLayoutBScreen';
import GameLayoutCScreen from '../screens/Game/GameLayoutCScreen';
import CoBuyScreen from '../screens/CoBuy/CoBuyScreen';
import CoBuyCompletedScreen from '../screens/CoBuy/CoBuyCompletedScreen';
import CoBuyDetailScreen from '../screens/CoBuy/CoBuyDetailScreen';
import CoBuyHistoryScreen from '../screens/CoBuy/CoBuyHistoryScreen';
import CoBuyPaymentScreen from '../screens/CoBuy/CoBuyPaymentScreen';
import GamePaymentScreen from '../screens/Game/GamePaymentScreen';
import AccountInfoScreen from '../screens/Account/AccountInfoScreen';
import PaymentMethodsScreen from '../screens/Account/PaymentMethodsScreen';
import WithdrawPasswordScreen from '../screens/Account/WithdrawPasswordScreen';
import TransactionHistoryScreen from '../screens/Wallet/TransactionHistoryScreen';
import GuideScreen from '../screens/Guide/GuideScreen';
import LoginScreen from '../screens/Auth/LoginScreen';

import { RootStackParamList, TabParamList } from './types';
import { Home, BarChart2, Tv, Award, History } from 'lucide-react-native';
import { NavigationContainer } from '@react-navigation/native';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} />
    </HomeStack.Navigator>
  );
}

function TabNavigator() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'HomeStack') {
            return <Home size={size} color={color} />;
          } else if (route.name === 'Stats') {
            return <BarChart2 size={size} color={color} />;
          } else if (route.name === 'Live') {
            return <Tv size={size} color={color} />;
          } else if (route.name === 'Results') {
            return <Award size={size} color={color} />;
          } else if (route.name === 'History') {
            return <History size={size} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        tabBarStyle: {
          backgroundColor: COLORS.cardBackground,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: 60 + (insets.bottom > 0 ? insets.bottom - 4 : 0),
          paddingBottom: insets.bottom > 0 ? insets.bottom - 4 : 8,
          paddingTop: 8,
          ...SHADOWS.medium,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.cardBackground,
          elevation: 2,
          shadowOpacity: 0.1,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: COLORS.textDark,
        },
      })}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator} 
        options={{ 
          tabBarLabel: 'Trang chủ',
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsMenuScreen} 
        options={{ 
          tabBarLabel: 'Thống kê',
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="Live" 
        component={LiveScreen} 
        options={{ 
          tabBarLabel: 'Trực tiếp',
          headerShown: false,
        }} 
      />
      <Tab.Screen 
        name="Results" 
        component={ResultsScreen} 
        options={{ 
          tabBarLabel: 'Kết quả',
          headerShown: false
        }} 
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ 
          tabBarLabel: 'Lịch sử',
          headerShown: false,
        }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, fetchProfile } = useAppStore();

  React.useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {token ? (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          
          <Stack.Screen name="StatsMenu" component={StatsMenuScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="StatsKeno" component={StatsKenoScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="StatsDienToan" component={StatsDienToanScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="StatsTruyenThong" component={StatsTruyenThongScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="VietlottDetail" component={VietlottDetailScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="HistoryDetail" component={HistoryDetailScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="GameLayoutA" component={GameLayoutAScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="GameLayoutLode" component={GameLayoutLodeScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="GameLayoutB" component={GameLayoutBScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="GameLayoutC" component={GameLayoutCScreen} options={{ presentation: 'card' }} />
          
          <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: false }} />
          <Stack.Screen name="DepositBinance" component={DepositBinanceScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
          <Stack.Screen 
            name="Cart" 
            component={CartScreen} 
            options={{ 
              headerShown: true, 
              headerTitle: 'Giỏ hàng',
              headerStyle: { backgroundColor: COLORS.cardBackground },
              headerTintColor: COLORS.textDark
            }}
          />

          <Stack.Screen name="CoBuy" component={CoBuyScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="CoBuyCompleted" component={CoBuyCompletedScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="CoBuyDetail" component={CoBuyDetailScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="CoBuyHistory" component={CoBuyHistoryScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="CoBuyPayment" component={CoBuyPaymentScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="GamePayment" component={GamePaymentScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="AccountInfo" component={AccountInfoScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="WithdrawPassword" component={WithdrawPasswordScreen} options={{ presentation: 'card' }} />
          <Stack.Screen name="Guide" component={GuideScreen} options={{ presentation: 'card' }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
