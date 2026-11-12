import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { COLORS } from '../../theme/theme';

interface LoadingViewProps {
  message?: string;
  color?: string;
  size?: 'small' | 'large';
}

export default function LoadingView({
  message,
  color = COLORS.primary,
  size = 'large',
}: LoadingViewProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray500,
  },
});

