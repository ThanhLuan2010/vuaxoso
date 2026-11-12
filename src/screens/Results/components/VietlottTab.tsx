import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme/theme';
import { useDrawResultsQuery } from '../../../hooks/queries';
import {
  styles,
  KENO_ORANGE,
  LOTTO_GREEN,
  POWER_GOLD,
  MEGA_RED,
  MAX3D_MAGENTA,
} from '../resultsStyles';

const HARDCODED_VIETLOTT_GAMES = [
  { code: 'keno', name: 'Keno', color: KENO_ORANGE, navType: 'keno', isKeno: true },
  { code: 'lotto_535', name: 'Lotto\n5/35', color: LOTTO_GREEN, navType: 'lotto', isKeno: false },
  { code: 'lotto_570', name: 'Lotto\n5/70', color: '#4B0082', navType: 'lotto', isKeno: false },
  { code: 'power_655', name: 'Power\n6/55', color: POWER_GOLD, navType: 'power', isKeno: false },
  { code: 'mega_645', name: 'Mega\n6/45', color: MEGA_RED, navType: 'mega', isKeno: false },
  { code: 'max_3d', name: 'Max\n3D', color: MAX3D_MAGENTA, navType: 'max3d', isKeno: false },
  { code: 'max_3d_pro', name: 'Max\n3D Pro', color: MAX3D_MAGENTA, navType: 'max3dpro', isKeno: false },
  { code: 'max_4d', name: 'Max\n4D', color: MAX3D_MAGENTA, navType: 'max4d', isKeno: false },
];

export default function VietlottTab() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  // React Query cached hook
  const { data: drawResults = [], refetch } = useDrawResultsQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.vietlottContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
    >
      {HARDCODED_VIETLOTT_GAMES.map((game) => {
        const { navType, color, isKeno, name } = game;

        // Find the latest completed draw for this game by code
        const latestDraw = drawResults.find(
          (d) => d.game?.code === game.code && d.status === 'completed'
        );

        let dateStr = '';
        let drawCodeStr = 'Đang cập nhật';
        let winningNumbers: string[] = [];
        let prizeText = 'Cập nhật liên tục';

        if (latestDraw) {
          const d = new Date(latestDraw.closeTime);
          dateStr = `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
          drawCodeStr = `Kỳ quay: ${latestDraw.drawCode} ${dateStr}`;
          winningNumbers = latestDraw.winningNumbers || [];
          if (latestDraw.jackpotPrize) {
            prizeText = `${latestDraw.jackpotPrize.toLocaleString('vi-VN')} đ`;
          }
        }

        return (
          <TouchableOpacity
            key={game.code}
            style={styles.vlCard}
            onPress={() => navigation.navigate('VietlottDetail', { type: navType, code: game.code })}
          >
            <View style={styles.vlLeftRibbon}>
              <Text
                style={[
                  styles.vlType,
                  { color: color, fontStyle: isKeno ? 'italic' : 'normal', fontSize: isKeno ? 16 : 14 },
                ]}
              >
                {name}
              </Text>
            </View>
            <View style={styles.vlContent}>
              <Text style={styles.vlKyText}>{drawCodeStr}</Text>

              {winningNumbers.length > 0 ? (
                <View style={styles.vlBallRow}>
                  {winningNumbers.map((num: string, i: number) => (
                    <View key={i} style={[styles.vlBall, { backgroundColor: color }, isKeno && styles.vlBallKeno]}>
                      <Text style={[styles.vlBallText, isKeno && styles.vlBallTextKeno]}>{num}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ height: 32, justifyContent: 'center' }}>
                  <Text style={{ color: COLORS.gray500, fontSize: 13, fontStyle: 'italic' }}>Chưa có kết quả</Text>
                </View>
              )}

              <Text style={[styles.vlPrizeText, { color: color }]}>{prizeText}</Text>
            </View>
            <View style={[styles.vlCornerStyle, { borderBottomColor: color }]} />
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

