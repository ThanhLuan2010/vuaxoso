import { StyleSheet, Dimensions } from 'react-native';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '../../theme/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    justifyContent: 'space-between',
  },
  backBtn: {
    padding: 4,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semiBold,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.powerBg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    gap: 4,
  },
  timerText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 120,
  },
  instructionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  instructionText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  selectedRow: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.light,
  },
  selectedLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    marginBottom: SPACING.sm,
  },
  selectedBallsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  emptyBallsText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.gray400,
    fontStyle: 'italic',
  },
  selectedBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  selectedBallText: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
  matrixContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.light,
  },
  matrixBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matrixBallSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  matrixBallText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.textDark,
  },
  matrixBallTextSelected: {
    color: COLORS.textLight,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.dark,
  },
  footerInfo: {
    flex: 1,
  },
  footerCostLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.gray500,
  },
  footerCostVal: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  autoBtn: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autoBtnText: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.medium,
  },
  addBtnText: {
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },

  // ===================================
  // CUSTOM KENO INTERFACE STYLES
  // ===================================
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  customHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  infoBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EBF0F3',
    height: 44,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#0084FA',
  },
  tabText: {
    fontSize: 14,
    color: '#7F8E9C',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0084FA',
    fontWeight: 'bold',
  },

  // Level selector bar
  bacSelectorContainer: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  bacGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bacBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F0F3F6',
  },
  bacBtnActive: {
    backgroundColor: '#0084FA',
  },
  bacBtnText: {
    fontSize: 12,
    color: '#4A5D6E',
    fontWeight: '500',
  },
  bacBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Draw cycles bar
  drawInfoBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  drawBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawLabel: {
    fontSize: 13,
    color: '#4A5D6E',
  },
  drawCycleRed: {
    fontSize: 13,
    color: '#FF3B30',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  drawTime: {
    fontSize: 13,
    color: '#4A5D6E',
    marginLeft: 4,
  },
  chartBtn: {
    padding: 4,
  },

  // Boards List Area
  boardsContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#EBF0F3',
  },
  boardLetter: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F2942',
    width: 20,
    textAlign: 'center',
  },
  circlesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBall: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F3F6',
    borderWidth: 1,
    borderColor: '#D0D7DE',
  },
  circleBallFilled: {
    backgroundColor: '#0084FA',
    borderColor: '#0084FA',
  },
  circleBallText: {
    fontWeight: 'bold',
    color: '#4A5D6E',
  },
  circleBallTextFilled: {
    color: '#FFFFFF',
  },
  boardControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  refreshBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0084FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pricePill: {
    backgroundColor: '#E8F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pricePillText: {
    fontSize: 11,
    color: '#0084FA',
    fontWeight: 'bold',
  },

  // Keno Footer
  footerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#EBF0F3',
    ...SHADOWS.medium,
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  pillActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F3F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pillActionBtnText: {
    fontSize: 13,
    color: '#0084FA',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  totalLabel: {
    fontSize: 14,
    color: '#4A5D6E',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  checkoutBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // 1-80 Modal Overlay & Styling
  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
    paddingBottom: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0084FA',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalCloseBtn: {
    padding: 2,
  },
  modalInnerBody: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    justifyContent: 'space-between',
  },
  modalScrollGrid: {
    paddingBottom: SPACING.md,
  },
  modalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  modalGridBall: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - 8 * 9) / 10,
    height: (SCREEN_WIDTH - SPACING.lg * 2 - 8 * 9) / 10,
    borderRadius: ((SCREEN_WIDTH - SPACING.lg * 2 - 8 * 9) / 10) / 2,
    backgroundColor: '#F0F3F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalGridBallSelected: {
    backgroundColor: '#0084FA',
  },
  modalGridBallText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A5D6E',
  },
  modalGridBallTextSelected: {
    color: '#FFFFFF',
  },

  newModalFooter: {
    gap: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  modalActionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  modalActionBtnClear: {
    flex: 1,
    backgroundColor: '#F0F3F6',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalActionBtnTextClear: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7F8E9C',
  },
  modalActionBtnRandom: {
    flex: 1,
    backgroundColor: '#F0F3F6',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalActionBtnTextRandom: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0084FA',
  },
  modalBtnContinue: {
    backgroundColor: '#0084FA',
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnContinueDisabled: {
    backgroundColor: '#C4D1DB',
  },
  modalBtnContinueText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Bao Keno Styles
  dropdownsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    gap: SPACING.md,
  },
  dropdownBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F3F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dropdownLabel: {
    fontSize: 13,
    color: '#4A5D6E',
  },
  dropdownValue: {
    fontWeight: 'bold',
    color: '#0F2942',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#7F8E9C',
    marginLeft: 4,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2942',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  trashBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F0F3F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatedCombosContainer: {
    marginTop: SPACING.md,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#EBF0F3',
  },
  generatedTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
    marginBottom: SPACING.xs,
  },
  combosList: {
    gap: 4,
  },
  comboText: {
    fontSize: 12,
    color: '#4A5D6E',
  },
  singlePillActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F3F6',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },

  // Pickers Overlays
  pickerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    maxHeight: '60%',
    padding: SPACING.lg,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2942',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  pickerList: {
    flexGrow: 0,
  },
  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    alignItems: 'center',
  },
  pickerItemActive: {
    backgroundColor: '#E8F3FF',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#4A5D6E',
  },
  pickerItemTextActive: {
    color: '#0084FA',
    fontWeight: 'bold',
  },
  pickerCloseBtn: {
    marginTop: SPACING.md,
    backgroundColor: '#F0F3F6',
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
  pickerCloseBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A5D6E',
  },

  // CL-LN Styles
  clLnBoardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: '#EBF0F3',
  },
  clLnOptionsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    marginHorizontal: SPACING.sm,
  },
  clLnOptBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#F0F3F6',
    alignItems: 'center',
  },
  clLnOptBtnSmall: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F0F3F6',
    alignItems: 'center',
  },
  clLnOptBtnSelected: {
    backgroundColor: '#0084FA',
  },
  clLnOptText: {
    fontSize: 13,
    color: '#4A5D6E',
    fontWeight: '500',
  },
  clLnOptTextSmall: {
    fontSize: 10,
    color: '#4A5D6E',
    fontWeight: '500',
  },
  clLnOptTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Draw modal picker styles
  drawModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '60%',
  },
  drawModalScrollList: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  drawModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  drawModalLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#C4D1DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawCheckboxChecked: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF0F0',
  },
  drawModalItemText: {
    fontSize: 15,
    color: '#0F2942',
    fontWeight: '500',
  },
  drawModalFooter: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#EBF0F3',
    backgroundColor: '#FFFFFF',
  },
  drawConfirmBtn: {
    backgroundColor: '#FF3B30',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  drawConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Redesigned Matrix Game Styles
  playTabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    paddingVertical: SPACING.xs,
  },
  playTabsScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  playTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EBF0F3',
    backgroundColor: '#F0F3F6',
  },
  playTabBtnActive: {
    backgroundColor: '#E51F27',
    borderColor: '#E51F27',
  },
  playTabBtnText: {
    fontSize: 13,
    color: '#4A5D6E',
    fontWeight: '500',
  },
  playTabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  lottoTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  lottoTabBtnText: {
    fontSize: 13,
    color: '#4A5D6E',
    fontWeight: '500',
  },
  max3dTabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  max3dTabBtnText: {
    fontSize: 13,
    color: '#4A5D6E',
    fontWeight: '500',
  },
  mainScrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  jackpotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E51F27',
  },
  jackpotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jackpotLabel: {
    fontSize: 11,
    color: '#7F8E9C',
    fontWeight: 'bold',
  },
  jackpotValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E51F27',
    marginTop: 2,
  },
  drawSelectorBox: {
    alignItems: 'flex-end',
  },
  drawSelectorCode: {
    fontSize: 12,
    color: '#4A5D6E',
  },
  drawSelectorTimer: {
    fontSize: 12,
    color: '#E51F27',
    fontWeight: 'bold',
    marginTop: 2,
  },
  matrixChartBtn: {
    padding: 6,
    backgroundColor: '#F0F3F6',
    borderRadius: 6,
  },
  boardsContainer: {
    gap: SPACING.sm,
  },
  boardCardRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EBF0F3',
  },
  boardCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  boardCardId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  boardCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  boardActionPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F3F6',
    borderWidth: 1,
    borderColor: '#EBF0F3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  boardActionPillActive: {
    backgroundColor: '#E51F27',
    borderColor: '#E51F27',
  },
  boardActionPillText: {
    fontSize: 11,
    color: '#4A5D6E',
    fontWeight: '500',
  },
  boardActionPillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  boardActionPillIcon: {
    padding: 4,
  },
  boardCardBallsContainer: {
    minHeight: 40,
    justifyContent: 'center',
  },
  tcNoticeBox: {
    backgroundColor: '#FFF0F0',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  tcNoticeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E51F27',
  },
  ballsGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  digitBox: {
    width: 32,
    height: 38,
    borderRadius: 6,
    backgroundColor: '#F0F3F6',
    borderWidth: 1,
    borderColor: '#D0D7DE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitBoxFilled: {
    backgroundColor: '#E51F27',
    borderColor: '#E51F27',
  },
  digitBoxText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5D6E',
  },
  digitBoxTextFilled: {
    color: '#FFFFFF',
  },
  quickPickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  quickActionPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F3F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  quickActionPillText: {
    fontSize: 12,
    color: '#0084FA',
    fontWeight: '500',
  },
  modalSlotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  modalSlotBox: {
    width: 44,
    height: 52,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#EBF0F3',
    backgroundColor: '#F0F3F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSlotBoxActive: {
    borderColor: '#E0115F',
    backgroundColor: '#FFF0F5',
  },
  modalSlotBoxFilled: {
    borderColor: '#E0115F',
  },
  modalSlotText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7F8E9C',
  },
  modalSlotTextActive: {
    color: '#E0115F',
  },
  modalSlotTextFilled: {
    color: '#0F2942',
  },
  digitKeypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  digitKeyBtn: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - 8 * 4) / 5,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F0F3F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EBF0F3',
  },
  digitKeyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  estimatedBanner: {
    backgroundColor: '#FFF9E6',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#FFE599',
  },
  estimatedText: {
    fontSize: 12,
    color: '#7F8E9C',
    textAlign: 'center',
  },
  estimatedHighlight: {
    fontWeight: 'bold',
    color: '#E51F27',
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F0F3F6',
  },
  filterPillActive: {
    backgroundColor: '#C77A1E',
  },
  filterPillText: {
    fontSize: 12,
    color: '#4A5D6E',
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bao2Container: {
    gap: SPACING.md,
  },
  bao2NumbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  bao2NumberBall: {
    width: (SCREEN_WIDTH - SPACING.md * 2 - 8 * 9) / 10,
    height: (SCREEN_WIDTH - SPACING.md * 2 - 8 * 9) / 10,
    borderRadius: ((SCREEN_WIDTH - SPACING.md * 2 - 8 * 9) / 10) / 2,
    backgroundColor: '#F0F3F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bao2NumberBallSelected: {
    backgroundColor: '#C77A1E',
  },
  bao2NumberBallText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4A5D6E',
  },
  bao2NumberBallTextSelected: {
    color: '#FFFFFF',
  },
});

export default styles;
