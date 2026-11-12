import { StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A3B7C',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#0066FF',
  },
  tabText: {
    fontSize: 14,
    color: '#0A3B7C',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#0066FF',
  },

  // Deposit Tab
  depositContent: {
    flexGrow: 1,
  },
  accountInfoCenter: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  accLabel: {
    fontSize: 14,
    color: '#0A3B7C',
    marginBottom: 4,
  },
  accName: {
    fontSize: 16,
    color: '#0A3B7C',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  accBalance: {
    fontSize: 18,
    color: '#E51F27',
    fontWeight: 'bold',
  },
  depositInstruction: {
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 22,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  qrSection: {
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  qrCenterLogo: {
    position: 'absolute',
    width: 32,
    height: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrLogoText: {
    color: '#E51F27',
    fontWeight: '900',
    fontSize: 18,
  },
  bankInfoRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bankInfoLeft: {
    flex: 1,
    gap: 4,
  },
  bankLabel: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  bankValueBold: {
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  stkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankValueBlue: {
    fontWeight: 'bold',
    color: '#0066FF',
  },
  copyBtn: {
    padding: 2,
  },
  bankInfoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.md,
  },
  mbLogoStar: {
    color: '#E51F27',
    fontSize: 32,
    marginRight: 2,
  },
  mbLogoText: {
    color: '#0066FF',
    fontSize: 24,
    fontWeight: '900',
  },
  gatewayBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gatewayBtnActive: {
    backgroundColor: '#0A3B7C',
    borderColor: '#0A3B7C',
  },
  gatewayBtnText: {
    color: '#666',
    fontWeight: 'bold',
  },
  gatewayBtnTextActive: {
    color: '#fff',
  },
  bankSelectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bankSelectBtnActive: {
    backgroundColor: '#e6f0fa',
    borderColor: '#0A3B7C',
  },
  bankSelectBtnText: {
    color: '#333',
    fontWeight: 'bold',
  },
  bankSelectBtnTextActive: {
    color: '#0A3B7C',
  },

  // Withdraw Tab
  withdrawContent: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    padding: SPACING.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.xl,
  },
  segmentBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.light,
  },
  segmentBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  segmentText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  segmentTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'relative',
    marginTop: 8,
  },
  floatingLabelContainer: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  floatingLabel: {
    fontSize: 14,
    color: '#0A3B7C',
    fontWeight: 'bold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0A3B7C',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: '#FFF',
  },
  amountInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: COLORS.textDark,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  withdrawFooter: {
    alignItems: 'center',
    marginHorizontal: 20
  },
  historyLinkBtn: {
    marginBottom: SPACING.lg,
  },
  historyLinkText: {
    color: '#00A859',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  submitBtn: {
    backgroundColor: '#007AFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  methodCard: {
    padding: SPACING.sm,
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 120,
    justifyContent: 'center',
  },
  methodCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  methodCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
    color: COLORS.textDark,
  },
  methodCardDesc: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.regular,
    color: COLORS.textMuted,
  },
  methodCardTextActive: {
    color: '#FFF',
  },
});

