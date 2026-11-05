import { StyleSheet, Dimensions } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';

const { width } = Dimensions.get('window');

// ─── Colors ───────────────────────────────────────────────────────────────────
export const TABLE_BLUE = '#1A4B7A';
export const TABLE_RED = '#E51F27';
export const KENO_ORANGE = '#FF5C00';
export const LOTTO_GREEN = '#00843D';
export const POWER_GOLD = '#B68A2E';
export const MEGA_RED = '#E51F27';
export const MAX3D_MAGENTA = '#D2008E';
export const DIENTOAN_BLUE = '#005CB9';
export const DIENTOAN_COLORS = ['#00A3E0', '#FFCD00', '#E51F27', '#E51F27', '#00A3E0', '#FFCD00'];

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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

  // Main Tabs
  mainTabsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mainTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  mainTabActive: {
    borderBottomColor: TABLE_BLUE,
  },
  mainTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray500,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  mainTabTextActive: {
    color: TABLE_BLUE,
  },

  // Shared
  tabContentContainer: {
    flex: 1,
  },

  // Vietlott Tab
  vietlottContainer: {
    padding: SPACING.md,
  },
  vlCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  vlLeftRibbon: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingHorizontal: 4,
  },
  vlType: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    textAlign: 'center',
  },
  vlContent: {
    flex: 1,
    padding: SPACING.md,
  },
  vlKyText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
  },
  vlBallRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  vlBall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vlBallText: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  vlBallKeno: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  vlBallTextKeno: {
    fontSize: 10,
  },
  vlPrizeText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  vlCornerStyle: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderRightWidth: 20,
    borderBottomWidth: 20,
    borderRightColor: 'transparent',
  },

  // Sub Tabs for DT / KT
  subTabSegmented: {
    flexDirection: 'row',
    margin: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    overflow: 'hidden',
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTabBtnActiveDT: {
    backgroundColor: DIENTOAN_BLUE,
  },
  subTabText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
  },
  subTabTextActiveDT: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Điện Toán Tab
  dtList: {
    paddingHorizontal: SPACING.md,
  },
  dtCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.light,
  },
  dtDateText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  dtBallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  dtBallRowCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  dtBall6x36: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    ...SHADOWS.light,
  },
  dtBallThanTai: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: TABLE_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  dtOval123: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    backgroundColor: TABLE_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    ...SHADOWS.light,
  },
  dtBallTextDark: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  dtBallTextLight: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textLight,
  },

  // Kiến Thiết Tab
  ktContainer: {
    padding: SPACING.md,
  },
  ktTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: TABLE_BLUE,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  table: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: width - SPACING.md * 2,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  thPrize: {
    width: 90,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  thCol: {
    width: 100,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  thText: {
    color: TABLE_BLUE,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.sm,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  tdPrize: {
    width: 90,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  tdPrizeName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: TABLE_BLUE,
    textAlign: 'center',
  },
  tdPrizeValue: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: TABLE_RED,
    marginTop: 2,
    textAlign: 'center',
  },
  tdCol: {
    width: 100,
    paddingVertical: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  tdNumber: {
    fontSize: TYPOGRAPHY.fontSize.md,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 22,
  },
  tdNumberSpecial: {
    color: TABLE_RED,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },

  // Miền Bắc Specific
  mbCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.light,
    overflow: 'hidden',
  },
  mbHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mbLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: TABLE_BLUE,
    borderLeftColor: TABLE_RED,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  mbLogoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mbLogoText: {
    color: TABLE_RED,
    fontWeight: 'bold',
    fontSize: 20,
  },
  mbHeaderTitle: {
    fontSize: 12,
    color: TABLE_BLUE,
    fontWeight: 'bold',
  },
  mbKyText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  mbTable: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  mbValuesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  mbValText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  mbGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  mbGridCell: {
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

