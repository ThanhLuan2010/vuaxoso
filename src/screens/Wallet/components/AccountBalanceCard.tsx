import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../walletStyles';

interface AccountBalanceCardProps {
  phone?: string;
  name?: string;
  balance?: number;
}

export default function AccountBalanceCard({ phone, name, balance = 0 }: AccountBalanceCardProps) {
  const formatVND = (num: number) => num.toLocaleString('vi-VN') + 'đ';

  return (
    <View style={styles.accountInfoCenter}>
      <Text style={styles.accLabel}>Tài khoản: {phone || '0899955742'}</Text>
      <Text style={styles.accName}>{name || 'Guest'}</Text>
      <Text style={styles.accBalance}>Số dư: {formatVND(balance)}</Text>
    </View>
  );
}

