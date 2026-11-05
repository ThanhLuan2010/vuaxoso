import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { styles } from '../walletStyles';

interface WalletHeaderProps {
  topInset: number;
  onBack: () => void;
  title?: string;
}

export default function WalletHeader({ topInset, onBack, title = 'NẠP/RÚT' }: WalletHeaderProps) {
  return (
    <View style={[styles.header, { paddingTop: Math.max(topInset, 16) }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
        <ChevronLeft size={24} color="#0A3B7C" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerBtn} />
    </View>
  );
}

