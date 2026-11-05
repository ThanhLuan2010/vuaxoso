import React from 'react';
import { StyleSheet, Text, View, ViewStyle, TextStyle } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../theme/theme';

interface LotteryBallProps {
  number: string | number;
  color?: string;
  size?: number;
  textColor?: string;
  isWinning?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function LotteryBall({
  number,
  color = '#FF5C00',
  size = 28,
  textColor = '#FFFFFF',
  isWinning = false,
  style,
  textStyle,
}: LotteryBallProps) {
  const ballBg = isWinning ? '#E11D48' : color;

  return (
    <View
      style={[
        styles.ball,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: ballBg,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: textColor,
            fontSize: size < 24 ? 10 : size > 32 ? 14 : 12,
          },
          textStyle,
        ]}
      >
        {number}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ball: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
});

