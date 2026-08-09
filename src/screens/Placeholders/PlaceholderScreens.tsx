import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import { BarChart2, ChevronRight } from 'lucide-react-native';

export function StatsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thống kê tần suất</Text>
        <Text style={styles.headerSubtitle}>Phân tích tần suất xuất hiện của các cặp số</Text>
      </View>

      <View style={styles.statCard}>
        <View style={styles.iconContainer}>
          <BarChart2 size={24} color={COLORS.primary} />
        </View>
        <View style={styles.statTextContainer}>
          <Text style={styles.statCardTitle}>Lô gan Miền Bắc</Text>
          <Text style={styles.statCardDesc}>Các số đã lâu chưa xuất hiện trên bảng kết quả</Text>
        </View>
        <ChevronRight size={20} color={COLORS.gray500} />
      </View>

      <View style={styles.statCard}>
        <View style={[styles.iconContainer, { backgroundColor: COLORS.megaBg }]}>
          <BarChart2 size={24} color={COLORS.mega} />
        </View>
        <View style={styles.statTextContainer}>
          <Text style={styles.statCardTitle}>Tần suất Mega 6/45</Text>
          <Text style={styles.statCardDesc}>Thống kê số lượng lượt về của 45 quả bóng</Text>
        </View>
        <ChevronRight size={20} color={COLORS.gray500} />
      </View>

      <View style={styles.statCard}>
        <View style={[styles.iconContainer, { backgroundColor: COLORS.powerBg }]}>
          <BarChart2 size={24} color={COLORS.power} />
        </View>
        <View style={styles.statTextContainer}>
          <Text style={styles.statCardTitle}>Tần suất Power 6/55</Text>
          <Text style={styles.statCardDesc}>Các bộ số hay xuất hiện cùng nhau</Text>
        </View>
        <ChevronRight size={20} color={COLORS.gray500} />
      </View>

      <View style={styles.placeholderBox}>
        <Text style={styles.placeholderText}>Tính năng phân tích nâng cao đang được cập nhật...</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    marginTop: 4,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.kenoBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  statTextContainer: {
    flex: 1,
  },
  statCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  statCardDesc: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    marginTop: 2,
  },
  placeholderBox: {
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    fontStyle: 'italic',
  }
});
