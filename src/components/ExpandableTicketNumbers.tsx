import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, BORDER_RADIUS, SPACING } from '../theme/theme';

interface Props {
  numbers: string[];
  winningNumbers?: string[];
  label?: string;
  maxVisible?: number;
  containerStyle?: StyleProp<ViewStyle>;
  ballStyle?: StyleProp<ViewStyle>;
  ballTextStyle?: StyleProp<TextStyle>;
  variant?: 'ball' | 'text' | 'tag';
  modalTitle?: string;
  useModal?: boolean; // If true, opens a modal popup; if false, expands inline
}

export default function ExpandableTicketNumbers({
  numbers = [],
  winningNumbers,
  label,
  maxVisible = 10,
  containerStyle,
  ballStyle,
  ballTextStyle,
  variant = 'ball',
  modalTitle = 'Danh sách bộ số',
  useModal = false,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  if (!numbers || numbers.length === 0) return null;

  const total = numbers.length;
  const isOverflow = total > maxVisible;
  const visibleNumbers = (!isOverflow || isExpanded) ? numbers : numbers.slice(0, maxVisible);
  const remainingCount = total - maxVisible;

  const handlePressMore = () => {
    if (useModal) {
      setModalVisible(true);
    } else {
      setIsExpanded(true);
    }
  };

  const handleCollapse = () => {
    setIsExpanded(false);
  };

  const renderSingleItem = (num: string, index: number) => {
    const isWinning = winningNumbers && winningNumbers.includes(num);

    if (variant === 'text') {
      return (
        <Text
          key={index}
          style={[
            styles.textItem,
            isWinning && styles.winningText,
            ballTextStyle,
          ]}
        >
          {num}
        </Text>
      );
    }

    if (variant === 'tag') {
      return (
        <View
          key={index}
          style={[
            styles.tagItem,
            isWinning && styles.winningTag,
            ballStyle,
          ]}
        >
          <Text
            style={[
              styles.tagText,
              isWinning && styles.winningTagText,
              ballTextStyle,
            ]}
          >
            {num}
          </Text>
        </View>
      );
    }

    // Default: 'ball'
    return (
      <View
        key={index}
        style={[
          styles.ballItem,
          isWinning && styles.winningBall,
          ballStyle,
        ]}
      >
        <Text
          style={[
            styles.ballText,
            isWinning && styles.winningBallText,
            ballTextStyle,
          ]}
        >
          {num}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.numbersRow}>
        {visibleNumbers.map((num, idx) => renderSingleItem(num, idx))}

        {/* More button when collapsed */}
        {isOverflow && !isExpanded && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={handlePressMore}
            activeOpacity={0.7}
          >
            <Text style={styles.moreButtonText}>+{remainingCount} Xem thêm</Text>
          </TouchableOpacity>
        )}

        {/* Collapse button when expanded inline */}
        {isOverflow && isExpanded && !useModal && (
          <TouchableOpacity
            style={styles.collapseButton}
            onPress={handleCollapse}
            activeOpacity={0.7}
          >
            <Text style={styles.collapseButtonText}>Thu gọn</Text>
            <ChevronUp size={14} color="#0084FA" />
          </TouchableOpacity>
        )}
      </View>

      {/* Full Numbers Modal */}
      {useModal && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {modalTitle} ({total} số)
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                  <X size={20} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={numbers}
                keyExtractor={(item, index) => `${item}_${index}`}
                numColumns={5}
                contentContainerStyle={styles.modalList}
                renderItem={({ item }) => {
                  const isWinning = winningNumbers && winningNumbers.includes(item);
                  return (
                    <View
                      style={[
                        styles.modalBall,
                        isWinning && styles.winningBall,
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalBallText,
                          isWinning && styles.winningBallText,
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  );
                }}
              />

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalConfirmBtnText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 6,
    marginBottom: 4,
  },
  numbersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  ballItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F3F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ballText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  winningBall: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  winningBallText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  textItem: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F2942',
    marginRight: 6,
  },
  winningText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  tagItem: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  winningTag: {
    backgroundColor: '#FEE2E2',
    borderColor: '#EF4444',
  },
  winningTagText: {
    color: '#DC2626',
    fontWeight: 'bold',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  moreButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0084FA',
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    gap: 2,
  },
  collapseButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0084FA',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxHeight: '75%',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalList: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  modalBall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  modalBallText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  modalConfirmBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  modalConfirmBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
