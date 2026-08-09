import React, { useMemo, useEffect, useState } from 'react';
import api from '../../services/api';
import { ActivityIndicator, FlatList } from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Timer } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';

const { width } = Dimensions.get('window');

// --- Game Config & Prize Structure ---
const LOTTO_DATA = {
  color1: '#00A859', color2: '#006D32',
  jackpot1: 'Đang cập nhật',
  jackpot2: 'Đang cập nhật',
  jackpot: 'Đang cập nhật',
  prizes: [
    { name: 'Đặc biệt', result: '5/5+1', num: 0, val: '6.804.070.000' },
    { name: 'Giải Nhất', result: '5/5', num: 0, val: '10.000.000.000' },
    { name: 'Giải Nhì', result: '4/5+1', num: 1, val: '5.000.000.000' },
    { name: 'Giải Ba', result: '4/5', num: 47, val: '500.000.000' },
    { name: 'Giải Tư', result: '3/5+1', num: 137, val: '100.000.000' },
    { name: 'Giải Năm', result: '3/5', num: 1589, val: '30.000.000' },
    { name: 'Giải Khuyến\nKhích', result: '2/5+1', num: 10747, val: '10.000.000' },
  ],
};

const POWER_DATA = {
  color1: '#E51F27', color2: '#9B0000',
  jackpot1: 'Đang cập nhật',
  jackpot2: 'Đang cập nhật',
  jackpot: 'Đang cập nhật',
  prizes: [
    { name: 'Jackpot 1', result: '6', num: 0, val: '113.626.837.200' },
    { name: 'Jackpot 2', result: '5+1', num: 1, val: '4.869.215.150' },
    { name: 'Giải nhất', result: '5', num: 47, val: '40.000.000' },
    { name: 'Giải nhì', result: '4', num: 2137, val: '500.000' },
    { name: 'Giải ba', result: '3', num: 39589, val: '50.000' },
  ],
};

const MEGA_DATA = {
  color1: '#E51F27', color2: '#9B0000',
  jackpot1: 'Đang cập nhật',
  jackpot2: 'Đang cập nhật',
  jackpot: 'Đang cập nhật',
  prizes: [
    { name: 'Jackpot', result: '6', num: 0, val: '113.626.837.200' },
    { name: 'Giải nhất', result: '5', num: 47, val: '40.000.000' },
    { name: 'Giải nhì', result: '4', num: 2137, val: '500.000' },
    { name: 'Giải ba', result: '3', num: 39589, val: '50.000' },
  ],
};

const MAX3D_DATA = {
  color1: '#8B008B', color2: '#4B004B',
  jackpot: '1.000.000.000',
  numJackpot: 0,
  subJackpot: '40.000.000',
  numSubJackpot: 0,
  g1: [{a: '---', b: '---'}, {a: '---', b: '---'}],
  g2: [{a: '---', b: '---'}, {a: '---', b: '---'}, {a: '---', b: '---'}],
  g3: [{a: '---', b: '---'}, {a: '---', b: '---'}, {a: '---', b: '---'}, {a: '---', b: '---'}],
};


export default function VietlottDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { type, code } = route.params as { type: string; code?: string };

  let title = type.toUpperCase();
  if (title === 'LOTTO') title = 'LOTTO 5/35';
  if (title === 'MAX3D') title = 'MAX 3D';
  if (title === 'MAX3DPRO') title = 'MAX 3D PRO';

  const isKeno = type === 'keno';
  const isMax3D = type === 'max3d' || type === 'max3dpro';

  const [pastDraws, setPastDraws] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchDraws = async (pageNum: number) => {
    // Nếu không có code thì không thể fetch
    if (!code || loading || (!hasMore && pageNum > 1)) return;
    try {
      setLoading(true);
      const res = await api.get(`/draws/results?code=${code}&page=${pageNum}&limit=10`);
      const data = res.data;
      if (pageNum === 1) {
        setPastDraws(data);
      } else {
        setPastDraws(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 10);
      setPage(pageNum);
    } catch (err) {
      console.log('Error fetching draws', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraws(1);
  }, [code]);

  const handleLoadMore = () => {
    fetchDraws(page + 1);
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.backBtn} />
    </View>
  );

  const renderKenoTags = () => (
    <View style={styles.tagsContainer}>
      <View style={styles.tagRow}>
        <View style={styles.tag}><Text style={styles.tagText}>LỚN</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>NHỎ</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>CHẴN</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>LẺ</Text></View>
      </View>
      <View style={styles.tagRow}>
        <View style={[styles.tag, styles.tagActive]}><Text style={styles.tagTextActive}>CHẴN 11-12</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>LẺ 11-12</Text></View>
        <View style={styles.tag}><Text style={styles.tagText}>HOÀ LN</Text></View>
        <View style={[styles.tag, styles.tagActive]}><Text style={styles.tagTextActive}>HOÀ CL</Text></View>
      </View>
    </View>
  );

  const renderKeno = () => (
    <View style={styles.kenoContainer}>
      {/* Current Draw */}
      {pastDraws.length > 0 && (() => {
        const latest = pastDraws[0];
        const latestD = new Date(latest.closeTime);
        return (
          <View>
            {/* Current Draw */}
            <View style={styles.kenoBallsGrid}>
              {(latest.winningNumbers || []).map((n: string, i: number) => (
                <View key={i} style={styles.kenoBall}>
                  <Text style={styles.kenoBallText}>{n}</Text>
                </View>
              ))}
            </View>
            {renderKenoTags()}
            <View style={styles.kenoInfoRow}>
              <View style={styles.countdownRow}>
                <Timer size={16} color="#FF5C00" />
                <Text style={styles.countdownText}>
                  Kỳ quay: <Text style={{ color: '#E51F27' }}>{latest.drawCode}</Text>
                </Text>
              </View>
              <Text style={styles.kyText}>{latestD.toLocaleDateString('vi-VN')}</Text>
            </View>
          </View>
        );
      })()}

      <Text style={styles.sectionTitleCenter}>Kết quả các kỳ quay trước</Text>
      {pastDraws.slice(1).map((draw, idx) => {
        const d = new Date(draw.closeTime);
        const dateStr = d.toLocaleDateString('vi-VN');
        // Simple day string, normally use date-fns or similar
        const dayStr = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][d.getDay()];

        return (
          <View key={draw._id} style={styles.pastDrawCard}>
            <Text style={styles.pastDrawKy}>Kỳ quay:<Text style={styles.pastDrawKyBold}> #{draw.drawCode}</Text></Text>
            <Text style={styles.pastDrawDate}><Text style={styles.pastDrawDay}>{dayStr}</Text> ngày <Text style={styles.pastDrawDateBold}>{dateStr}</Text></Text>
            
            <View style={styles.kenoBallsGridCard}>
              {(draw.winningNumbers || []).map((n: string, i: number) => (
                <View key={i} style={styles.kenoBall}>
                  <Text style={styles.kenoBallText}>{n}</Text>
                </View>
              ))}
            </View>
            {renderKenoTags()}
          </View>
        );
      })}

      {hasMore && (
        <TouchableOpacity style={{ padding: 12, alignItems: 'center' }} onPress={handleLoadMore}>
          <Text style={{ color: '#0A3B7C', fontWeight: 'bold' }}>Tải thêm kỳ quay</Text>
        </TouchableOpacity>
      )}
      {loading && <ActivityIndicator style={{ marginVertical: 20 }} color="#E51F27" />}
    </View>
  );

  const renderStandardLotto = () => {
    let data: any;
    if (type === 'lotto') data = LOTTO_DATA;
    else if (type === 'power') data = POWER_DATA;
    else data = MEGA_DATA;

    const latest = pastDraws[0];

    return (
      <View style={styles.standardContainer}>
        {/* Hero Card */}
        {latest && (() => {
          const latestD = new Date(latest.closeTime);
          const dateStr = latestD.toLocaleDateString('vi-VN');
          const dayStr = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][latestD.getDay()];
          const winningNumbers = latest.winningNumbers || data.numbers;

          return (
            <View style={[styles.heroCard, { backgroundColor: data.color1 }]}>
              <View style={styles.heroTopRow}>
                <Text style={styles.heroKyText}>Kỳ: #{latest.drawCode} {dayStr}, {dateStr}</Text>
                <Text style={[styles.heroLogoText, { color: data.color2 }]}>{title.replace(' ', '\n')}</Text>
              </View>
              <View style={styles.heroBallsRow}>
                {winningNumbers.map((n: string, i: number) => {
                  const isBonus = i === winningNumbers.length - 1 && (type === 'lotto' || type === 'power');
                  const ballColor = isBonus ? (type === 'lotto' ? '#FF5C00' : '#E51F27') : data.color1;
                  return (
                    <View key={i} style={[styles.heroBall, { backgroundColor: ballColor, borderColor: '#FFF', borderWidth: 2 }]}>
                      <Text style={styles.heroBallText}>{n}</Text>
                    </View>
                  );
                })}
              </View>
              
              {type === 'power' ? (
                 <View style={styles.jackpotValuesContainer}>
                   <Text style={styles.jackpotLabel}>Giá trị Jackpot 1</Text>
                   <Text style={styles.jackpotValue}>{latest.jackpotPrize ? latest.jackpotPrize.toLocaleString('vi-VN') : data.jackpot1}</Text>
                   <Text style={styles.jackpotLabel}>Giá trị Jackpot 2</Text>
                   <Text style={styles.jackpotValueSmall}>{data.jackpot2}</Text>
                 </View>
              ) : (
                <View style={styles.jackpotValuesContainer}>
                  <Text style={styles.jackpotLabel}>Giá trị Jackpot</Text>
                  <Text style={styles.jackpotValue}>{latest.jackpotPrize ? latest.jackpotPrize.toLocaleString('vi-VN') : data.jackpot}</Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* Prize Table */}
        <View style={styles.prizeTable}>
          <View style={styles.ptHeaderRow}>
            <Text style={[styles.ptHeaderCol, { flex: 2 }]}>Giải thưởng</Text>
            <Text style={[styles.ptHeaderCol, { flex: 2 }]}>Kết quả</Text>
            <Text style={[styles.ptHeaderCol, { flex: 1.5, textAlign: 'center' }]}>Số lượng giải</Text>
            <Text style={[styles.ptHeaderCol, { flex: 2, textAlign: 'right' }]}>Giá trị giải(đ)</Text>
          </View>
          {data.prizes.map((p: any, i: number) => (
            <View key={i} style={styles.ptRow}>
              <Text style={[styles.ptColName, { flex: 2 }]}>{p.name}</Text>
              <View style={[styles.ptColResult, { flex: 2 }]}>
                {/* Dots visualization for result matching */}
                <View style={styles.dotsRow}>
                  {Array.from({ length: 6 }).map((_, di) => {
                    let color = '#CCC';
                    if (p.result.includes(di.toString())) color = data.color1;
                    if (di === 5 && p.result.includes('+1')) color = (type === 'lotto' ? '#FF5C00' : '#E51F27');
                    return <View key={di} style={[styles.resultDot, { backgroundColor: color }]} />;
                  })}
                </View>
              </View>
              <Text style={[styles.ptColNum, { flex: 1.5, textAlign: 'center' }]}>{p.num}</Text>
              <Text style={[styles.ptColVal, { flex: 2, textAlign: 'right' }]}>{p.val}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitleCenter}>Kết quả các kỳ quay trước</Text>
        {pastDraws.slice(1).map((draw, idx) => {
          const d = new Date(draw.closeTime);
          const dateStr = d.toLocaleDateString('vi-VN');
          const dayStr = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][d.getDay()];
          const winningNumbers = draw.winningNumbers || [];

          return (
            <View key={draw._id} style={styles.pastDrawCardSmall}>
              <Text style={styles.pastDrawKySmall}>Kỳ quay:<Text style={styles.pastDrawKyBoldSmall}> #{draw.drawCode}</Text> - <Text style={styles.pastDrawDaySmall}>{dayStr}</Text> ngày <Text style={styles.pastDrawDateBoldSmall}>{dateStr}</Text></Text>
              
              <View style={styles.pastBallsRowSmall}>
                {winningNumbers.map((n: string, i: number) => {
                  const isBonus = i === winningNumbers.length - 1 && (type === 'lotto' || type === 'power');
                  const ballColor = isBonus ? (type === 'lotto' ? '#FF5C00' : '#E51F27') : data.color1;
                  return (
                    <View key={i} style={[styles.heroBallSmall, { backgroundColor: ballColor }]}>
                      <Text style={styles.heroBallTextSmall}>{n}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {hasMore && (
          <TouchableOpacity style={{ padding: 12, alignItems: 'center' }} onPress={handleLoadMore}>
            <Text style={{ color: '#0A3B7C', fontWeight: 'bold' }}>Tải thêm kỳ quay</Text>
          </TouchableOpacity>
        )}
        {loading && <ActivityIndicator style={{ marginVertical: 20 }} color="#E51F27" />}
      </View>
    );
  };

  const renderMax3D = () => {
    const latest = pastDraws[0];

    return (
      <View style={styles.standardContainer}>
        {latest && (() => {
          const latestD = new Date(latest.closeTime);
          const dateStr = latestD.toLocaleDateString('vi-VN');
          const dayStr = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][latestD.getDay()];
          const winningNumbers = latest.winningNumbers || [];
          const dbStr = winningNumbers[0] || '---';
          const dbArr = dbStr.split('');
          const phudbStr = winningNumbers[1] || '---';
          const phudbArr = phudbStr.split('');

          return (
            <View style={[styles.heroCardMax3D, { backgroundColor: MAX3D_DATA.color1 }]}>
              <Text style={styles.heroKyTextMax3D}>Kỳ: #{latest.drawCode} {dayStr}, {dateStr}</Text>
              <Text style={styles.max3dLogoText}>Max{'\n'}3D</Text>
              
              <View style={styles.max3dRow}>
                {dbArr.map((n: string, i: number) => (
                  <React.Fragment key={i}>
                    <View style={styles.max3dBall}><Text style={styles.max3dBallText}>{n}</Text></View>
                    {i === 2 && <View style={styles.max3dDivider} />}
                  </React.Fragment>
                ))}
              </View>
              <Text style={styles.jackpotLabelMax3D}>Giải đặc biệt(VNĐ)</Text>
              <Text style={styles.jackpotValueMax3D}>{MAX3D_DATA.jackpot}</Text>
              <Text style={styles.jackpotNumMax3D}>Số lượng giải: {MAX3D_DATA.numJackpot}</Text>
              
              <View style={styles.max3dSubCard}>
                 <Text style={styles.heroKyTextMax3DSub}>Kỳ: #{latest.drawCode} {dayStr}, {dateStr}</Text>
                 <View style={styles.max3dRowSub}>
                  {phudbArr.map((n: string, i: number) => (
                    <React.Fragment key={i}>
                      <View style={styles.max3dBall}><Text style={styles.max3dBallText}>{n}</Text></View>
                      {i === 2 && <View style={styles.max3dDivider} />}
                    </React.Fragment>
                  ))}
                </View>
            <View style={styles.max3dSubBottomRow}>
              <View>
                <Text style={styles.jackpotLabelMax3DSub}>Giải phụ đặc biệt</Text>
                <Text style={styles.jackpotValueMax3DSub}>{MAX3D_DATA.subJackpot}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.jackpotLabelMax3DSub}>SL giải</Text>
                <Text style={styles.jackpotValueMax3DSub}>{MAX3D_DATA.numSubJackpot}</Text>
              </View>
            </View>
          </View>
          </View>
        );
      })()}
        <Text style={styles.max3dMidTitle}>Trùng 2 bộ 3 số bất kỳ</Text>

        <View style={styles.max3dPrizeTable}>
          {[{name: 'Giải nhất', data: MAX3D_DATA.g1}, {name: 'Giải nhì', data: MAX3D_DATA.g2}, {name: 'Giải ba', data: MAX3D_DATA.g3}].map((prize, idx) => (
            <View key={idx} style={styles.max3dPrizeRow}>
              <Text style={styles.max3dPrizeName}>{prize.name}</Text>
              <View style={styles.max3dPrizeGrid}>
                {prize.data.map((pair, pIdx) => (
                  <View key={pIdx} style={styles.max3dPairRow}>
                    {pair.a.split('').map((n, i) => <View key={`a-${i}`} style={styles.max3dSmallBall}><Text style={styles.max3dSmallBallText}>{n}</Text></View>)}
                    {pair.b.split('').map((n, i) => <View key={`b-${i}`} style={styles.max3dSmallBall}><Text style={styles.max3dSmallBallText}>{n}</Text></View>)}
                  </View>
                ))}
              </View>
              <Text style={styles.max3dPrizeNum}>SL giải</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitleCenter}>Kết quả các kỳ quay trước</Text>
        {pastDraws.slice(1).map((draw, idx) => {
          const d = new Date(draw.closeTime);
          const dateStr = d.toLocaleDateString('vi-VN');
          const dayStr = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][d.getDay()];
          const winningNumbers = draw.winningNumbers || [];

          return (
            <View key={draw._id} style={styles.pastDrawCardSmall}>
              <Text style={styles.pastDrawKySmall}>Kỳ quay:<Text style={[styles.pastDrawKyBoldSmall, { color: MAX3D_DATA.color1 }]}> #{draw.drawCode}</Text> - <Text style={styles.pastDrawDaySmall}>{dayStr}</Text> ngày <Text style={styles.pastDrawDateBoldSmall}>{dateStr}</Text></Text>
              
              <View style={styles.pastBallsRowSmall}>
                {winningNumbers.map((n: string, i: number) => (
                  <View key={i} style={[styles.heroBallSmall, { backgroundColor: MAX3D_DATA.color1 }]}>
                    <Text style={styles.heroBallTextSmall}>{n}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {hasMore && (
          <TouchableOpacity style={{ padding: 12, alignItems: 'center' }} onPress={handleLoadMore}>
            <Text style={{ color: '#0A3B7C', fontWeight: 'bold' }}>Tải thêm kỳ quay</Text>
          </TouchableOpacity>
        )}
        {loading && <ActivityIndicator style={{ marginVertical: 20 }} color="#E51F27" />}

      </View>
    );
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isKeno ? renderKeno() : (isMax3D ? renderMax3D() : renderStandardLotto())}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A3B7C',
  },
  content: {
    paddingBottom: 40,
  },
  
  // --- Keno Specific ---
  kenoContainer: {
    padding: SPACING.md,
  },
  kenoBallsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  kenoBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF5C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kenoBallText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tagsContainer: {
    marginBottom: SPACING.md,
    gap: 8,
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  tag: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingVertical: 6,
    alignItems: 'center',
  },
  tagActive: {
    backgroundColor: '#FF2E00',
    borderColor: '#FF2E00',
  },
  tagText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  tagTextActive: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFF',
  },
  kenoInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countdownText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  kyText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  sectionTitleCenter: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A3B7C',
    textAlign: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  pastDrawCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  pastDrawKy: {
    textAlign: 'center',
    color: COLORS.gray500,
    fontSize: 13,
  },
  pastDrawKyBold: {
    color: '#D9981B',
    fontWeight: 'bold',
  },
  pastDrawDate: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
  },
  pastDrawDay: {
    color: '#0A3B7C',
    fontWeight: 'bold',
  },
  pastDrawDateBold: {
    color: '#0A3B7C',
    fontWeight: 'bold',
  },
  kenoBallsGridCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginBottom: SPACING.md,
  },

  // --- Standard Lotto/Power/Mega ---
  standardContainer: {
    padding: SPACING.md,
  },
  heroCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  heroKyText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  heroLogoText: {
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  heroBallsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  heroBall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBallText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  jackpotValuesContainer: {
    alignItems: 'center',
  },
  jackpotLabel: {
    color: '#FFF',
    fontSize: 14,
    marginBottom: 4,
  },
  jackpotValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  jackpotValueSmall: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  prizeTable: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  ptHeaderRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  ptHeaderCol: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  ptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ptColName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
  ptColResult: {
    justifyContent: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  resultDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ptColNum: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
  ptColVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
  },
  
  pastDrawCardSmall: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  pastDrawKySmall: {
    color: COLORS.gray600,
    fontSize: 13,
    marginBottom: SPACING.sm,
  },
  pastDrawKyBoldSmall: {
    color: '#00A859', // Will be dynamic in a real app, but using green for Lotto default
    fontWeight: 'bold',
  },
  pastDrawDaySmall: {
    color: '#0A3B7C',
    fontWeight: 'bold',
  },
  pastDrawDateBoldSmall: {
    color: '#0A3B7C',
    fontWeight: 'bold',
  },
  pastBallsRowSmall: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBallSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroBallTextSmall: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // --- Max3D Specific ---
  heroCardMax3D: {
    borderRadius: BORDER_RADIUS.lg,
    paddingTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  heroKyTextMax3D: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: SPACING.sm,
  },
  max3dLogoText: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    fontSize: 24,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#A6006B',
    textAlign: 'right',
  },
  max3dRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A6006B',
    alignSelf: 'center',
    padding: 8,
    borderRadius: 30,
    marginBottom: SPACING.md,
    marginTop: 30,
  },
  max3dBall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D2008E',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  max3dBallText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  max3dDivider: {
    width: 2,
    height: 20,
    backgroundColor: '#FFF',
    marginHorizontal: 8,
  },
  jackpotLabelMax3D: {
    color: '#FFF',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  jackpotValueMax3D: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  jackpotNumMax3D: {
    color: '#FFF',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  max3dSubCard: {
    backgroundColor: '#A6006B',
    marginHorizontal: -SPACING.lg,
    padding: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
    borderBottomRightRadius: BORDER_RADIUS.lg,
  },
  heroKyTextMax3DSub: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  max3dRowSub: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#670046',
    alignSelf: 'center',
    padding: 8,
    borderRadius: 30,
    marginBottom: SPACING.md,
  },
  max3dSubBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  jackpotLabelMax3DSub: {
    color: '#FFF',
    fontSize: 12,
    marginBottom: 2,
  },
  jackpotValueMax3DSub: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  max3dMidTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 14,
    color: COLORS.textDark,
    marginVertical: SPACING.md,
  },
  max3dPrizeTable: {
    backgroundColor: '#FDF2F8',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  max3dPrizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FBCFE8',
    paddingVertical: SPACING.md,
  },
  max3dPrizeName: {
    width: 60,
    fontSize: 13,
    color: COLORS.gray600,
  },
  max3dPrizeGrid: {
    flex: 1,
    gap: 8,
  },
  max3dPairRow: {
    flexDirection: 'row',
    gap: 4,
  },
  max3dSmallBall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D2008E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  max3dSmallBallText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  max3dPrizeNum: {
    width: 50,
    textAlign: 'right',
    fontSize: 13,
    color: COLORS.gray600,
  }
});
