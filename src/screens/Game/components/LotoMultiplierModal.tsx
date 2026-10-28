import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { X } from 'lucide-react-native';

interface LotoMultiplierModalProps {
  visible: boolean;
  currentMultiplier: number;
  options?: number[];
  onSelect: (val: number) => void;
  onClose: () => void;
}

export default function LotoMultiplierModal({
  visible,
  currentMultiplier,
  options = [10000, 20000, 30000, 40000, 50000],
  onSelect,
  onClose,
}: LotoMultiplierModalProps) {
  if (!visible) return null;

  return (
    <View style={[styles.pickerOverlay, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }]}>
      <View style={styles.modalContent}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Chọn mệnh giá</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* List options */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {options.map((val) => {
            const isSelected = currentMultiplier === val;
            return (
              <TouchableOpacity
                key={val}
                style={styles.optionRow}
                onPress={() => onSelect(val)}
              >
                <Text style={styles.optionText}>{val.toLocaleString('vi-VN')} đ</Text>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pickerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#0084FA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F7',
  },
  optionText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1D2939',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D0D5DD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#FF0000',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF0000',
  },
});
