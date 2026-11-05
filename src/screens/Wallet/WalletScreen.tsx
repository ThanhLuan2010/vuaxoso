import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { useDepositConfigQuery, useBinanceConfigQuery } from '../../hooks/queries';
import { styles } from './walletStyles';
import WalletHeader from './components/WalletHeader';
import DepositTab from './components/DepositTab';
import WithdrawTab from './components/WithdrawTab';

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, requestWithdraw, requestDeposit, fetchProfile } = useAppStore();

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  // React Query queries with automatic caching and refetching
  const { data: depositConfig } = useDepositConfigQuery();
  const { data: binanceConfig } = useBinanceConfigQuery();

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      const interval = setInterval(() => {
        fetchProfile();
      }, 5000);
      return () => clearInterval(interval);
    }, [fetchProfile])
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <WalletHeader topInset={insets.top} onBack={() => navigation.goBack()} />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'deposit' && styles.tabItemActive]}
          onPress={() => setActiveTab('deposit')}
        >
          <Text style={[styles.tabText, activeTab === 'deposit' && styles.tabTextActive]}>Nạp tiền</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'withdraw' && styles.tabItemActive]}
          onPress={() => setActiveTab('withdraw')}
        >
          <Text style={[styles.tabText, activeTab === 'withdraw' && styles.tabTextActive]}>Rút tiền</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'deposit' ? (
        <DepositTab
          user={user}
          depositConfig={depositConfig}
          binanceConfig={binanceConfig}
          bottomInset={insets.bottom}
          onRequestDeposit={requestDeposit}
        />
      ) : (
        <WithdrawTab
          user={user}
          binanceConfig={binanceConfig}
          bottomInset={insets.bottom}
          onRequestWithdraw={requestWithdraw}
        />
      )}
    </KeyboardAvoidingView>
  );
}
