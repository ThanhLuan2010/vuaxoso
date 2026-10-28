import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DrawCycle {
  id: string;
  drawCode: string;
  label: string;
  timeStr: string;
  dateStr: string;
}

interface DrawPickerModalProps {
  visible: boolean;
  isDrawLoading: boolean;
  drawCycles: DrawCycle[];
  tempSelectedDraws: string[];
  setTempSelectedDraws: (draws: string[]) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DrawPickerModal({
  visible,
  isDrawLoading,
  drawCycles,
  tempSelectedDraws,
  setTempSelectedDraws,
  onConfirm,
  onClose,
}: DrawPickerModalProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <View style={[styles.modalOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
      <View style={styles.drawModalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chọn kỳ mua</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.drawModalScrollList} showsVerticalScrollIndicator={false}>
          {isDrawLoading || drawCycles.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color="#00A859" />
              <Text style={{ marginTop: 10, color: '#7F8E9C', fontSize: 14 }}>Đang tải danh sách kỳ quay...</Text>
            </View>
          ) : (
            drawCycles.map((cycle) => {
              const isChecked = tempSelectedDraws.includes(cycle.id);
              return (
                <TouchableOpacity
                  key={cycle.id}
                  style={styles.drawModalItem}
                  onPress={() => {
                    if (isChecked) {
                      if (tempSelectedDraws.length > 1) {
                        setTempSelectedDraws(tempSelectedDraws.filter((id) => id !== cycle.id));
                      }
                    } else {
                      setTempSelectedDraws([...tempSelectedDraws, cycle.id]);
                    }
                  }}
                >
                  <View style={styles.drawModalLeftGroup}>
                    <View style={[styles.drawCheckbox, isChecked && styles.drawCheckboxChecked]}>
                      {isChecked && <Check size={14} color="#FF3B30" strokeWidth={3} />}
                    </View>
                    <Text style={styles.drawModalItemText}>{cycle.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        <View style={[styles.drawModalFooter, { paddingBottom: Math.max(16, insets.bottom + 12) }]}>
          <TouchableOpacity style={styles.drawConfirmBtn} onPress={onConfirm}>
            <Text style={styles.drawConfirmBtnText}>Xác nhận</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: 320,
  },
  modalHeader: {
    backgroundColor: '#0084FA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  drawModalScrollList: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  drawModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F6',
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
    paddingHorizontal: 16,
    paddingTop: 12,
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
});
