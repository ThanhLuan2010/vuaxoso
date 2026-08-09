import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { GameModel, DrawModel } from '../store/useAppStore';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { Users } from 'lucide-react-native';

interface GameCardProps {
  item: GameModel;
  activeDraw?: DrawModel;
  onPress: () => void;
  isHorizontal?: boolean;
}

// Custom stylized red pouch with gold coins drawing
const RedPouchIcon = () => (
  <View style={styles.pouchContainer}>
    {/* Gold coins in the background */}
    <View style={[styles.coin, { top: 0, left: 14 }]} />
    <View style={[styles.coin, { top: 4, left: 24 }]} />
    <View style={[styles.coin, { top: 6, left: 8 }]} />
    
    {/* Pouch base */}
    <View style={styles.pouchBase} />
    
    {/* Pouch gold tie ribbon */}
    <View style={styles.pouchRibbon} />
    
    {/* Pouch neck ruffle */}
    <View style={styles.pouchNeck} />
  </View>
);

export default function GameCard({ item, activeDraw, onPress, isHorizontal = false }: GameCardProps) {
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Calculate real-time countdown from activeDraw.closeTime
  useEffect(() => {
    if (!activeDraw || !activeDraw.closeTime) return;
    
    const calculateRemaining = () => {
      const now = new Date().getTime();
      const close = new Date(activeDraw.closeTime).getTime();
      return Math.max(0, Math.floor((close - now) / 1000));
    };

    setSecondsLeft(calculateRemaining());

    const timer = setInterval(() => {
      setSecondsLeft(calculateRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [activeDraw]);

  const formatCountdown = (secs: number) => {
    if (secs <= 0) return 'Đang đóng';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatJackpot = (val?: number) => {
    if (!val) return '';
    return val.toLocaleString('vi-VN') + 'đ';
  };

  // Custom styling & logo mappings according to screenshot
  const isKeno = item.code === 'keno';
  const isBaoKeno = item.code === 'bao_keno';
  const isMuaChung = item.code === 'mua_chung';
  const isPower = item.code === 'power_655';
  const isMega = item.code === 'mega_645';
  const isMax3d = item.code === 'max_3d';
  const isLotto = item.code === 'lotto_535';

  const isLoto235 = item.code === 'loto_235';
  const isLotoCap = item.code === 'loto_cap';
  const isDienToan636 = item.code === 'dientoan_636';
  const isTruotLoto = item.code === 'truot_loto';
  const isThanTai4 = item.code === 'than_tai_4';
  const isBao636 = item.code === 'bao_636';
  const isBaoLoto2 = item.code === 'bao_loto_2';

  const getPrize = () => {
    if (isPower || isMega) {
      // API currently doesn't return jackpotAmount for test data, so we mock a display if needed
      return formatJackpot(isPower ? 75980220150 : 14851168500);
    }
    if (isKeno) return '2.000.000.000đ';
    if (isMax3d) return '30.000.000.000đ';
    if (isLotto) return '6.387.047.500đ';
    return '';
  };

  const getSubtext = () => {
    if (isBaoKeno) return 'Mua nhanh trúng lớn!';
    if (isMuaChung) return 'Góp NHỎ trúng TO!';
    return '';
  };

  if (isHorizontal && isLotto) {
    return (
      <TouchableOpacity style={styles.horizontalCard} onPress={onPress}>
        <View style={styles.horizontalLeft}>
          <Text style={[styles.lottoGreenSmall, { color: '#E51F27' }]}>XỔ SỐ</Text>
          <Text style={[styles.lottoGreenBig, { color: '#1A4B7A' }]}>3 MIỀN</Text>
        </View>

        <View style={styles.horizontalCenter}>
          <Text style={styles.horizontalTitleLabel}>GIÁ TRỊ ĐỘC ĐẮC</Text>
          <Text style={styles.horizontalPrize}>🏆 {getPrize()}</Text>
          {secondsLeft > 0 && (
            <Text style={styles.horizontalTimer}>{formatCountdown(secondsLeft)}</Text>
          )}
        </View>

        <View style={styles.horizontalRight}>
          <RedPouchIcon />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {/* Top row: tags and badges */}
      <View style={styles.topRow}>
        {/* Left Fire Hot Tag */}
        {(isBaoKeno || isBaoLoto2 || isBao636) ? (
          <View style={styles.hotTag}>
            <Text style={styles.hotTagText}>🔥 HOT!</Text>
          </View>
        ) : isKeno ? (
          <Text style={styles.timerRed}>{formatCountdown(secondsLeft)}</Text>
        ) : <View />}

        {/* Right Green Pills */}
        {isKeno && (
          <View style={styles.badgeGreen}>
            <Text style={styles.badgeGreenText}>8p-1 kỳ</Text>
          </View>
        )}
        {isMax3d && (
          <View style={styles.badgeGreen}>
            <Text style={styles.badgeGreenText}>Hôm nay xổ</Text>
          </View>
        )}
        {isDienToan636 && (
          <View style={[styles.badgeGreen, { backgroundColor: '#00A859' }]}>
            <Text style={styles.badgeGreenText}>T4 & T7</Text>
          </View>
        )}
      </View>

      {/* Middle section: Brand names stylized */}
      <View style={styles.middleSection}>
        {isKeno && (
          <Text style={styles.kenoTitle}>KENO</Text>
        )}
        {isBaoKeno && (
          <Text style={styles.baoKenoTitle}>
            <Text style={styles.baoBlueItalic}>BAO </Text>
            <Text style={styles.kenoOrangeBold}>KENO</Text>
          </Text>
        )}
        {isMuaChung && (
          <View style={styles.muaChungContainer}>
            <View style={styles.muaChungIconBox}>
              <Users size={16} color="#0056B3" />
            </View>
            <Text style={styles.muaChungTitle}>MUA CHUNG</Text>
          </View>
        )}
        {isPower && (
          <View style={styles.powerMegaLabelContainer}>
            <Text style={styles.powerLabelSmall}>POWER</Text>
            <Text style={styles.powerLabelBig}>6/55</Text>
          </View>
        )}
        {isMega && (
          <View style={styles.powerMegaLabelContainer}>
            <Text style={styles.megaLabelSmall}>MEGA</Text>
            <Text style={styles.megaLabelBig}>6/45</Text>
          </View>
        )}
        {isMax3d && (
          <View style={styles.powerMegaLabelContainer}>
            <Text style={styles.max3dLabelSmall}>MAX</Text>
            <Text style={styles.max3dLabelBig}>3D/3DPro</Text>
          </View>
        )}
        {isLotto && (
          <View style={styles.powerMegaLabelContainer}>
            <Text style={styles.lottoGreenSmall}>LOTTO</Text>
            <Text style={styles.lottoGreenBig}>5/35</Text>
          </View>
        )}

        {/* Dien Toan middle section */}
        {isLoto235 && (
          <View style={styles.lotoBadgeContainer}>
            <Text style={styles.lotoRedText}>LÔ TÔ</Text>
            <View style={styles.lotoBlueBadge}>
              <Text style={styles.lotoBadgeText}>2, 3, 5 Số</Text>
            </View>
          </View>
        )}
        {isLotoCap && (
          <View style={styles.lotoBadgeContainer}>
            <Text style={styles.lotoRedText}>LÔ TÔ</Text>
            <View style={styles.lotoGoldBadge}>
              <Text style={styles.lotoBadgeText}>2, 3, 4 Cặp</Text>
            </View>
          </View>
        )}
        {isDienToan636 && (
          <View style={styles.lotoBadgeContainer}>
            <Text style={styles.dientoanGrayText}>ĐIỆN TOÁN</Text>
            <Text style={styles.dientoan636Big}>6x36</Text>
          </View>
        )}
        {isTruotLoto && (
          <View style={styles.lotoBadgeContainer}>
            <Text style={[styles.lotoRedText, { fontSize: 13, marginRight: 2 }]}>TRƯỢT LÔ TÔ</Text>
            <View style={[styles.lotoBlueBadge, { backgroundColor: '#FF8A00', paddingHorizontal: 4 }]}>
              <Text style={[styles.lotoBadgeText, { fontSize: 10 }]}>4-8-10 cặp</Text>
            </View>
          </View>
        )}
        {isThanTai4 && (
          <View style={styles.thanTaiContainer}>
            <Text style={styles.thanTaiRed}>Thần Tài 4</Text>
            <Text style={styles.thanTaiBlue}>ĐT 1-2-3</Text>
          </View>
        )}
        {isBao636 && (
          <Text style={styles.bao636Title}>
            <Text style={styles.baoBlueItalic}>BAO </Text>
            <Text style={styles.lotoRedBold}>6x36</Text>
          </Text>
        )}
        {isBaoLoto2 && (
          <Text style={styles.bao636Title}>
            <Text style={styles.baoBlueItalic}>BAO </Text>
            <Text style={styles.lotoRedBold}>LÔ TÔ 2</Text>
          </Text>
        )}
      </View>

      {/* Bottom section: Prizes, rates and subtitles */}
      <View style={styles.bottomSection}>
        {item.subtext ? (
          <Text style={item.subtext.includes('🏆') ? styles.goldPrizeText : (isBaoKeno ? styles.orangeItalicText : isMuaChung ? styles.blueItalicText : styles.orangeRateText)}>
            {item.subtext}
          </Text>
        ) : (
          <>
            {isKeno && <Text style={styles.goldPrizeText}>🏆 {getPrize()}</Text>}
            {isBaoKeno && <Text style={styles.orangeItalicText}>{getSubtext()}</Text>}
            {isMuaChung && <Text style={styles.blueItalicText}>{getSubtext()}</Text>}
            {isPower && <Text style={styles.goldPrizeText}>🏆 {getPrize()}</Text>}
            {isMega && <Text style={styles.goldPrizeText}>🏆 {getPrize()}</Text>}
            {isMax3d && <Text style={styles.goldPrizeText}>🏆 {getPrize()}</Text>}
            {isLotto && <Text style={styles.goldPrizeText}>🏆 {getPrize()}</Text>}
            {isLoto235 && <Text style={styles.orangeRateText}>🏆 x20.000 lần</Text>}
            {isLotoCap && <Text style={styles.orangeRateText}>🏆 x110 lần</Text>}
            {isDienToan636 && <Text style={styles.goldRateText}>🏆 6 Tỷ Đồng</Text>}
            {isTruotLoto && <Text style={styles.orangeRateText}>🏆 x12 lần</Text>}
            {isBao636 && <Text style={styles.orangeRateText}>Chọn nhanh - Trúng lớn</Text>}
            {isBaoLoto2 && <Text style={styles.orangeRateText}>Chọn nhanh - Trúng lớn</Text>}
            {isThanTai4 && <Text style={styles.orangeRateText}>🏆 x1220 lần</Text>}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EBF0F3',
    padding: 10,
    height: 110,
    justifyContent: 'space-between',
    ...SHADOWS.light,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 16,
  },
  timerRed: {
    color: '#E51F27',
    fontSize: 9,
    fontWeight: 'bold',
  },
  badgeGreen: {
    backgroundColor: '#00A859',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeGreenText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  hotTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotTagText: {
    color: '#FF6F00',
    fontSize: 10,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  middleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginVertical: 4,
  },
  kenoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FF6A00',
    letterSpacing: 0.5,
  },
  baoKenoTitle: {
    fontSize: 15,
  },
  baoBlueItalic: {
    color: '#0056B3',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  kenoOrangeBold: {
    color: '#FF6A00',
    fontWeight: '900',
  },
  muaChungContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  muaChungIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E6EEF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muaChungTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0056B3',
  },
  powerMegaLabelContainer: {
    alignItems: 'center',
  },
  powerLabelSmall: {
    fontSize: 9,
    color: '#D87A00',
    fontWeight: 'bold',
    lineHeight: 10,
  },
  powerLabelBig: {
    fontSize: 20,
    color: '#D87A00',
    fontWeight: '900',
    lineHeight: 22,
  },
  megaLabelSmall: {
    fontSize: 9,
    color: '#E51F27',
    fontWeight: 'bold',
    lineHeight: 10,
  },
  megaLabelBig: {
    fontSize: 20,
    color: '#E51F27',
    fontWeight: '900',
    lineHeight: 22,
  },
  max3dLabelSmall: {
    fontSize: 9,
    color: '#D11D5B',
    fontWeight: 'bold',
    lineHeight: 10,
  },
  max3dLabelBig: {
    fontSize: 16,
    color: '#D11D5B',
    fontWeight: '900',
    lineHeight: 18,
  },
  lotoBadgeContainer: {
    alignItems: 'center',
    gap: 2,
  },
  lotoRedText: {
    fontSize: 11,
    color: '#E51F27',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  lotoBlueBadge: {
    backgroundColor: '#0056B3',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  lotoGoldBadge: {
    backgroundColor: '#BFA100',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  lotoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dientoanGrayText: {
    fontSize: 9,
    color: '#5C6B73',
    fontWeight: 'bold',
  },
  dientoan636Big: {
    fontSize: 18,
    color: '#E51F27',
    fontWeight: '900',
  },
  baoLoto2Title: {
    fontSize: 14,
  },
  lotoRedBold: {
    color: '#E51F27',
    fontWeight: 'bold',
  },
  thanTaiContainer: {
    alignItems: 'center',
  },
  thanTaiRed: {
    color: '#E51F27',
    fontWeight: 'bold',
    fontSize: 13,
  },
  thanTaiBlue: {
    color: '#0056B3',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 1,
  },
  bao636Title: {
    fontSize: 14,
  },
  bottomSection: {
    alignItems: 'center',
    height: 14,
  },
  goldPrizeText: {
    color: '#D8A000',
    fontWeight: 'bold',
    fontSize: 10,
  },
  orangeItalicText: {
    color: '#D87A00',
    fontStyle: 'italic',
    fontSize: 9,
  },
  blueItalicText: {
    color: '#0056B3',
    fontStyle: 'italic',
    fontSize: 9,
  },
  orangeRateText: {
    color: '#D87A00',
    fontWeight: 'bold',
    fontSize: 10,
  },
  goldRateText: {
    color: '#D8A000',
    fontWeight: 'bold',
    fontSize: 10,
  },

  // Horizontal Card styles
  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#EBF0F3',
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.light,
  },
  horizontalLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
  },
  lottoGreenSmall: {
    fontSize: 10,
    color: '#00A859',
    fontWeight: 'bold',
  },
  lottoGreenBig: {
    fontSize: 22,
    color: '#00A859',
    fontWeight: '900',
  },
  horizontalCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalTitleLabel: {
    fontSize: 11,
    color: '#00A859',
    fontWeight: 'bold',
  },
  horizontalPrize: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#D8A000',
    marginVertical: 2,
  },
  horizontalTimer: {
    fontSize: 11,
    color: '#FF6F00',
    fontWeight: 'bold',
  },
  horizontalRight: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Custom Red Pouch illustration styles
  pouchContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pouchBase: {
    width: 36,
    height: 32,
    backgroundColor: '#E51F27',
    borderRadius: 10,
    position: 'absolute',
    bottom: 4,
    borderWidth: 1.5,
    borderColor: '#C1121F',
  },
  pouchRibbon: {
    width: 24,
    height: 6,
    backgroundColor: '#FFD700',
    borderRadius: 2,
    position: 'absolute',
    bottom: 28,
    zIndex: 2,
  },
  pouchNeck: {
    width: 28,
    height: 12,
    backgroundColor: '#E51F27',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    position: 'absolute',
    bottom: 30,
    borderWidth: 1.5,
    borderColor: '#C1121F',
  },
  coin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    position: 'absolute',
    ...SHADOWS.light,
  },
});
