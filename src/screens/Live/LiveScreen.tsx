import { Timer } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '../../theme/theme';

import { useAppStore } from '../../store/useAppStore';

const ORANGE = '#FF5C00';
const TABLE_BLUE = '#1A4B7A';

// Helper to calculate Keno Tags
const getKenoTags = (balls: string[]) => {
  const nums = balls.map(b => parseInt(b, 10)).filter(n => !isNaN(n));
  let countChan = 0, countLe = 0, countLon = 0, countNho = 0;
  nums.forEach(n => {
    if (n % 2 === 0) countChan++; else countLe++;
    if (n >= 41 && n <= 80) countLon++; else countNho++;
  });
  return [
    { label: 'LỚN', active: countLon >= 13 },
    { label: 'NHỎ', active: countNho >= 13 },
    { label: 'CHẴN', active: countChan >= 13 },
    { label: 'LẺ', active: countLe >= 13 },
    { label: 'CHẴN 11-12', active: countChan === 11 || countChan === 12 },
    { label: 'LẺ 11-12', active: countLe === 11 || countLe === 12 },
    { label: 'HOÀ LN', active: countLon === 10 },
    { label: 'HOÀ CL', active: countChan === 10 },
  ];
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function BallGrid({ balls }: { balls: string[] }) {
  return (
    <View style={styles.ballContainer}>
      {balls.map((num, idx) => (
        <View key={idx} style={styles.ball}>
          <Text style={styles.ballText}>{num}</Text>
        </View>
      ))}
    </View>
  );
}

function TagGrid({ tags }: { tags: { label: string; active: boolean }[] }) {
  return (
    <View style={styles.tagContainer}>
      {tags.map((tag, idx) => (
        <View
          key={idx}
          style={[styles.tag, tag.active && styles.tagActive]}
        >
          <Text style={[styles.tagText, tag.active && styles.tagTextActive]}>
            {tag.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

type SubTab = 'kyTruoc' | 'thongKe';

import api from '../../services/api';

export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const [subTab, setSubTab] = useState<SubTab>('kyTruoc');
  const { activeDraws } = useAppStore();

  const activeKeno = activeDraws.find(d => d.game && d.game.code === 'keno');

  const [kenoDraws, setKenoDraws] = useState<any[]>([]);

  const latestResult = kenoDraws.length > 0 ? kenoDraws[0] : null;
  const previousResults = kenoDraws.slice(1, 10);

  const [countdown, setCountdown] = useState(0);
  const isFetchingRef = React.useRef(false);

  const fetchKenoDraws = async () => {
    try {
      const res = await api.get('/draws/results?code=keno&limit=10');
      setKenoDraws(res.data);
    } catch (err) {
      console.log('Error fetching keno draws in LiveScreen', err);
    }
  };

  React.useEffect(() => {
    fetchKenoDraws();
  }, []);

  React.useEffect(() => {
    if (!activeKeno || !activeKeno.closeTime) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const interval = setInterval(async () => {
      const now = new Date().getTime();
      const close = new Date(activeKeno.closeTime).getTime();
      const diff = Math.floor((close - now) / 1000);

      setCountdown(Math.max(0, diff));

      // Auto reload results when countdown is 0
      if (diff <= 0 && !isFetchingRef.current) {
        isFetchingRef.current = true;
        try {
          // Trigger reload from backend
          await useAppStore.getState().fetchActiveDraws();
          await fetchKenoDraws();
        } finally {
          // Wait a few seconds before allowing another fetch attempt
          timeoutId = setTimeout(() => {
            isFetchingRef.current = false;
          }, 3000);
        }
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, [activeKeno]);

  const formatCountdown = (secs: number) => {
    if (secs <= 0) return 'Đang đóng';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return {
      day: dayNames[d.getDay()],
      date: `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`
    };
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.headerTitle}>Trực tiếp</Text>
      </View>

      {/* Title Sub-header */}
      <View style={styles.subHeader}>
        <Text style={styles.subHeaderTitle}>Trực tiếp Keno</Text>
        <View style={styles.subHeaderUnderline} />
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* Current Draw Section */}
        {latestResult && (
          <View style={styles.currentDrawSection}>
            <BallGrid balls={latestResult.winningNumbers || []} />
            <TagGrid tags={getKenoTags(latestResult.winningNumbers || [])} />

            <View style={styles.currentDrawFooter}>
              <View style={styles.countdownRow}>
                <Timer size={16} color={ORANGE} />
                <Text style={styles.countdownText}>
                  Kỳ tiếp theo: <Text style={{ color: '#E51F27' }}>{activeKeno ? formatCountdown(countdown) : '---'}</Text>
                </Text>
              </View>
              <Text style={styles.kyText}>Kỳ HT: {latestResult.drawCode}</Text>
            </View>
          </View>
        )}

        {/* Tab section: KỲ TRƯỚC | THỐNG KÊ KENO */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, subTab === 'kyTruoc' && styles.tabBtnActive]}
            onPress={() => setSubTab('kyTruoc')}
          >
            <Text style={[styles.tabText, subTab === 'kyTruoc' && styles.tabTextActive]}>
              KỲ TRƯỚC
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, subTab === 'thongKe' && styles.tabBtnActive]}
            onPress={() => setSubTab('thongKe')}
          >
            <Text style={[styles.tabText, subTab === 'thongKe' && styles.tabTextActive]}>
              THỐNG KÊ KENO
            </Text>
          </TouchableOpacity>
        </View>

        {/* List of past draws */}
        {subTab === 'kyTruoc' ? (
          <View style={styles.pastDrawsSection}>
            <Text style={styles.pastDrawsTitle}>Kết quả các kỳ quay trước</Text>

            {previousResults.map((draw, idx) => {
              const { day, date } = formatDateLabel(draw.closeTime);
              return (
                <View key={draw._id} style={styles.pastDrawCard}>
                  <View style={styles.pastDrawHeader}>
                    <Text style={styles.pastDrawKy}>Kỳ quay: <Text style={{ color: ORANGE }}>{draw.drawCode}</Text></Text>
                    <Text style={styles.pastDrawDate}>
                      <Text style={{ color: TABLE_BLUE, fontWeight: TYPOGRAPHY.fontWeight.bold }}>{day}</Text> ngày {date}
                    </Text>
                  </View>

                  <BallGrid balls={draw.winningNumbers || []} />
                  <TagGrid tags={getKenoTags(draw.winningNumbers || [])} />
                </View>
              );
            })}

            <View style={{ height: 24 }} />
          </View>
        ) : (
          <View style={styles.emptyTabSection}>
            <Text style={styles.emptyTabText}>Dữ liệu thống kê Keno đang được cập nhật...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBackground,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: TABLE_BLUE,
  },
  subHeader: {
    backgroundColor: COLORS.cardBackground,
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subHeaderTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: TABLE_BLUE,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: 8,
  },
  subHeaderUnderline: {
    width: '100%',
    height: 3,
    backgroundColor: TABLE_BLUE,
  },

  // Current Draw Section
  currentDrawSection: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  ballContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  ball: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ballText: {
    color: COLORS.textLight,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    backgroundColor: COLORS.cardBackground,
    minWidth: 70,
    alignItems: 'center',
  },
  tagActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  tagText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textDark,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  tagTextActive: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  currentDrawFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countdownText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
  },
  kyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: TABLE_BLUE,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  tabTextActive: {
    color: TABLE_BLUE,
  },

  // Past Draws
  pastDrawsSection: {
    paddingHorizontal: SPACING.md,
  },
  pastDrawsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: TABLE_BLUE,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  pastDrawCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pastDrawHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pastDrawKy: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  pastDrawDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
  },

  emptyTabSection: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    fontStyle: 'italic',
  }
});
