import { ArrowLeft, HelpCircle, Info, RotateCw, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import { SHADOWS } from '../../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function CoBuyDetailScreen({ route, navigation }: any) {
  const { roomId, roomNum, baoType, totalCost, progress: initialProgress = 20, minGop = 3500, isCompleted = false, gameType = 'mega', ticketNumbers: routeTicketNumbers } = route.params;
  const insets = useSafeAreaInsets();
  const addToCart = useAppStore((state) => state.addToCart);

  // Set default numbers based on baoType
  const defaultNumbers = routeTicketNumbers || ['04', '06', '09', '19', '24', '28', '44', '51', '55', '60', '62', '65', '71'].slice(0, baoType);
  const [ticketNumbers, setTicketNumbers] = useState<string[]>(defaultNumbers);

  // User selection states
  const [selectedPercentage, setSelectedPercentage] = useState<number>(5); // Default 5%
  const [customPercentage, setCustomPercentage] = useState<string>('');
  const [isCustomActive, setIsCustomActive] = useState<boolean>(false);

  // Custom Shares Selector Modal
  const [isCustomPickerVisible, setIsCustomPickerVisible] = useState(false);
  const [tempPercentage, setTempPercentage] = useState<number>(5);

  const maxAvailablePercent = 100 - initialProgress;
  const customChoices: number[] = [];
  for (let p = 5; p <= maxAvailablePercent; p += 5) {
    customChoices.push(p);
  }

  // Proposed circles: show the ticket numbers or generate random subset
  const [proposedNumbers, setProposedNumbers] = useState<string[]>(defaultNumbers);

  const handleRandomizeProposed = () => {
    // Shuffles and takes a subset of the ticket numbers
    const shuffled = [...ticketNumbers].sort(() => 0.5 - Math.random());
    setProposedNumbers(shuffled);
  };

  const getCostForPercent = (percent: number) => {
    return Math.round((totalCost * percent) / 100);
  };

  // Fixed options: 5%, 10%, 15%, 20%, 25%
  const percentageOptions = [5, 10, 15, 20, 25];

  const handlePercentPress = (val: number) => {
    setSelectedPercentage(val);
    setIsCustomActive(false);
  };

  const handleCustomSubmit = () => {
    const parsed = parseFloat(customPercentage);
    if (isNaN(parsed) || parsed <= 0 || parsed > (100 - initialProgress)) {
      Alert.alert('Lỗi', `Vui lòng nhập phần trăm hợp lệ (từ 0.1% đến ${100 - initialProgress}%).`);
      return;
    }
    setSelectedPercentage(parsed);
    setIsCustomActive(true);
  };

  const currentCost = getCostForPercent(selectedPercentage);

  const handleJoinGroup = () => {
    navigation.navigate('CoBuyPayment', {
      roomId,
      baoType,
      roomNum,
      cost: currentCost,
      percent: selectedPercentage,
      gameType
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F2942" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>BAO {baoType} {roomNum}</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <HelpCircle size={14} color="#FF8A00" />
          <Text style={styles.helpText}>Hướng dẫn</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress header bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressTextRow}>
            <View style={styles.progressLabelLeft}>
              <Users size={16} color="#0056B3" />
              <Text style={styles.progressLabelText}>Nhóm đã góp:</Text>
            </View>
            <Text style={styles.progressPercentage}>{initialProgress}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFilled, { width: `${initialProgress}%` }]} />
          </View>
        </View>

        {/* Expected Printed Numbers Card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketSubLabel}>MEGA 6/45</Text>
            <Text style={styles.ticketTitle}>Bộ số dự kiến in:</Text>
            <TouchableOpacity>
              <Info size={18} color="#00A859" />
            </TouchableOpacity>
          </View>

          <View style={styles.ballsRow}>
            {ticketNumbers.map((num, idx) => (
              <View key={idx} style={styles.ballCircle}>
                <Text style={styles.ballText}>{num}</Text>
              </View>
            ))}
          </View>

          <View style={styles.ticketFooter}>
            <Text style={styles.ticketFooterLabel}>$ Giá vé: {totalCost.toLocaleString('vi-VN')}đ</Text>
            <Text style={styles.ticketFooterLabel}>Kỳ quay: 1533 - 08/07/2026</Text>
          </View>
        </View>

        {/* Co-buy actions section */}
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Chọn bộ số đề xuất và mức góp</Text>

          <View style={styles.proposedRow}>
            <View style={styles.proposedCircles}>
              {proposedNumbers.slice(0, 7).map((num, idx) => (
                <View key={idx} style={styles.proposedCircle}>
                  <Text style={styles.proposedText}>{num}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.proposedRefreshBtn} onPress={handleRandomizeProposed}>
              <RotateCw size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* Option grids */}
          <View style={styles.gridOptions}>
            {percentageOptions.map((opt) => {
              const isSelected = selectedPercentage === opt && !isCustomActive;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.gridBtn, isSelected && styles.gridBtnActive]}
                  onPress={() => handlePercentPress(opt)}
                >
                  <Text style={[styles.gridPercent, isSelected && styles.gridPercentActive]}>{opt}%</Text>
                  <Text style={[styles.gridMoney, isSelected && styles.gridMoneyActive]}>
                    {getCostForPercent(opt).toLocaleString('vi-VN')}đ
                  </Text>
                </TouchableOpacity>
              );
            })}

            {/* Custom Modal Option */}
            <TouchableOpacity
              style={[styles.gridBtn, isCustomActive && styles.gridBtnActive]}
              onPress={() => {
                setTempPercentage(selectedPercentage);
                setIsCustomPickerVisible(true);
              }}
            >
              <Text style={[styles.gridPercent, { fontWeight: 'bold' }, isCustomActive && styles.gridPercentActive]}>
                Tùy chọn ▼
              </Text>
            </TouchableOpacity>
          </View>

          {/* User shares details */}
          <View style={styles.userShareRow}>
            <View style={styles.userShareLeft}>
              <Text style={styles.userShareLabel}>Bạn chưa góp</Text>
              <Text style={styles.userShareVal}>{isCompleted ? '0%' : `${selectedPercentage}%`}</Text>
            </View>
            <Text style={styles.userShareDesc}>Bạn nhận phần trúng thưởng theo % mức góp</Text>
          </View>
          <View style={styles.userShareBarBg}>
            <View style={[styles.userShareBarFilled, { width: isCompleted ? '0%' : `${selectedPercentage}%` }]} />
          </View>
        </View>

        {/* Member List */}
        <View style={styles.membersCard}>
          <Text style={styles.membersTitle}>Danh sách thành viên (1 người):</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol, { flex: 2, fontWeight: 'bold' }]}>Thành viên</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>Số tiền</Text>
            <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', fontWeight: 'bold' }]}>Góp</Text>
          </View>

          <View style={styles.memberItem}>
            <View style={styles.memberMainRow}>
              <Text style={[styles.tableCol, { flex: 2, color: '#0F2942' }]}>#1: xxxxxx6727</Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', color: '#0F2942', fontWeight: 'bold' }]}>14.000đ</Text>
              <Text style={[styles.tableCol, { flex: 1, textAlign: 'right', color: '#0F2942', fontWeight: 'bold' }]}>20%</Text>
            </View>
            <Text style={styles.memberNumbersText}>04 06 09 19 24 28 44</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout Footer */}
      {!isCompleted && (
        <View style={[styles.footerContainer, { paddingBottom: 16 + insets.bottom }]}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerLabel}>Tạm tính:</Text>
            <Text style={styles.footerValue}>{currentCost.toLocaleString('vi-VN')}đ</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleJoinGroup}>
            <Text style={styles.checkoutBtnText}>Góp nhóm</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chọn cổ phần Modal */}
      <Modal
        visible={isCustomPickerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsCustomPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sharesModalContent}>
            <View style={styles.sharesModalHeader}>
              <Text style={styles.sharesModalTitle}>Chọn cổ phần</Text>
              <TouchableOpacity onPress={() => setIsCustomPickerVisible(false)}>
                <X size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sharesModalList} showsVerticalScrollIndicator={false}>
              {customChoices.map((p) => {
                const isSelected = tempPercentage === p;
                const costVal = getCostForPercent(p);
                return (
                  <TouchableOpacity
                    key={p}
                    style={styles.sharesModalItem}
                    onPress={() => setTempPercentage(p)}
                  >
                    <Text style={styles.sharesModalMoneyText}>{costVal.toLocaleString('vi-VN')}đ</Text>
                    <Text style={styles.sharesModalPercentText}>{p}%</Text>
                    <View style={[styles.sharesRadioButton, isSelected && styles.sharesRadioButtonSelected]}>
                      {isSelected && <View style={styles.sharesRadioButtonInner} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.sharesModalFooter}>
              <TouchableOpacity
                style={styles.sharesCloseBtn}
                onPress={() => setIsCustomPickerVisible(false)}
              >
                <Text style={styles.sharesCloseBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sharesConfirmBtn}
                onPress={() => {
                  setSelectedPercentage(tempPercentage);
                  setIsCustomActive(true);
                  setIsCustomPickerVisible(false);
                }}
              >
                <Text style={styles.sharesConfirmBtnText}>Tiếp tục</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  helpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE8CC',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFF9DB',
  },
  helpText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF8A00',
    marginLeft: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  progressSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressLabelText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7F8E9C',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E51F27',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: '#E51F27',
    borderRadius: 4,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE3E3',
    ...SHADOWS.light,
  },
  ticketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketSubLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#E51F27',
    marginRight: 8,
  },
  ticketTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
    flex: 1,
  },
  ballsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  ballCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E51F27',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  ballText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    paddingTop: 12,
  },
  ticketFooterLabel: {
    fontSize: 11,
    color: '#7F8E9C',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
    marginBottom: 12,
    textAlign: 'center',
  },
  proposedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  proposedCircles: {
    flexDirection: 'row',
    gap: 6,
  },
  proposedCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#0056B3',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proposedText: {
    color: '#0056B3',
    fontSize: 11,
    fontWeight: 'bold',
  },
  proposedRefreshBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E6F4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gridBtn: {
    width: (SCREEN_WIDTH - 64 - 10) / 3,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBtnActive: {
    borderColor: '#FF8A00',
    borderWidth: 1.5,
    backgroundColor: '#FFF9F2',
  },
  gridPercent: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#7F8E9C',
  },
  gridPercentActive: {
    color: '#FF8A00',
  },
  gridMoney: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F2942',
    marginTop: 2,
  },
  gridMoneyActive: {
    color: '#FF8A00',
  },
  customInput: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F2942',
    padding: 0,
  },
  customInputActive: {
    color: '#FF8A00',
  },
  customApplyBtn: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: '#FF8A00',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  customApplyBtnText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  userShareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  userShareLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userShareLabel: {
    fontSize: 12,
    color: '#7F8E9C',
  },
  userShareVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  userShareDesc: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#7F8E9C',
  },
  userShareBarBg: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    overflow: 'hidden',
  },
  userShareBarFilled: {
    height: '100%',
    backgroundColor: '#4B5563',
    borderRadius: 3,
  },
  membersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.light,
  },
  membersTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableCol: {
    fontSize: 12,
    color: '#7F8E9C',
  },
  memberItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
    paddingVertical: 8,
  },
  memberMainRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  memberNumbersText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E51F27',
    letterSpacing: 0.5,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    color: '#7F8E9C',
  },
  footerValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0056B3',
    marginTop: 2,
  },
  checkoutBtn: {
    backgroundColor: '#0084FA',
    borderRadius: 22,
    height: 44,
    paddingHorizontal: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharesModalContent: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: 500,
    overflow: 'hidden',
  },
  sharesModalHeader: {
    height: 48,
    backgroundColor: '#0084FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  sharesModalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sharesModalList: {
    paddingHorizontal: 16,
    maxHeight: 320,
  },
  sharesModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  sharesModalMoneyText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
    flex: 1,
  },
  sharesModalPercentText: {
    fontSize: 13,
    color: '#7F8E9C',
    fontWeight: '500',
    flex: 1,
  },
  sharesRadioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D0D5DD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharesRadioButtonSelected: {
    borderColor: '#0056B3',
  },
  sharesRadioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0056B3',
  },
  sharesModalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    gap: 12,
  },
  sharesCloseBtn: {
    flex: 1,
    backgroundColor: '#FFF0F2',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharesCloseBtnText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sharesConfirmBtn: {
    flex: 1,
    backgroundColor: '#0084FA',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharesConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
