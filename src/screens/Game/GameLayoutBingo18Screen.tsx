import { ArrowLeft } from 'iconsax-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GameLayoutBingo18Screen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { gameId, initialTab } = route.params || {};

  const [gameName] = useState('BINGO18');
  const [playType, setPlayType] = useState(initialTab || 'Cơ bản'); // 'Cơ bản', 'Cộng tổng', 'Tài Xỉu Hoà'

  // Selections
  const [selections, setSelections] = useState<string[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const baseCost = 10000;

  useEffect(() => {
    // Clear selections on tab change
    setSelections([]);
    setMultiplier(1);
  }, [playType]);

  const toggleSelection = (sel: string) => {
    if (selections.includes(sel)) {
      setSelections(selections.filter(s => s !== sel));
    } else {
      setSelections([...selections, sel]);
    }
  };

  const handleCheckout = () => {
    if (selections.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một số/tổng/ô cược.');
      return;
    }

    const boards = selections.map((sel, idx) => ({
      id: String.fromCharCode(65 + idx),
      numbers: [sel],
      isTC: false,
      cost: baseCost * multiplier
    }));

    navigation.navigate('GamePayment', {
      gameId: 'bingo18',
      gameName,
      playType,
      drawIds: [],
      boards,
      totalCost: boards.length * baseCost * multiplier
    });
  };

  const getEstimatedWinInfo = () => {
    if (selections.length === 0) return null;
    const totalCost = selections.length * baseCost * multiplier;

    let estimatedWin = 0;
    if (playType === 'Cơ bản') {
      // Max win in Cơ bản is 3-so-trung (x120)
      estimatedWin = 1200000 * multiplier;
    } else if (playType === 'Cộng tổng') {
      estimatedWin = 1200000 * multiplier; // max x120
    } else if (playType === 'Tài Xỉu Hoà') {
      estimatedWin = 200000 * multiplier; // max x20 for Hoa
    }
    return { multiplier, totalCost, estimatedWin };
  };

  const winInfo = getEstimatedWinInfo();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.header, { paddingTop: insets.top, height: 56 + insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0F2942" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{gameName}</Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {['Cơ bản', 'Cộng tổng', 'Tài Xỉu Hoà'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, playType === tab && styles.tabBtnActive]}
            onPress={() => setPlayType(tab)}
          >
            <Text style={[styles.tabBtnText, playType === tab && styles.tabBtnTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {playType === 'Cơ bản' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Một số (x10 - x50 - x120)</Text>
            <View style={styles.grid}>
              {['1', '2', '3', '4', '5', '6'].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[styles.box, selections.includes(num) && styles.boxActive]}
                  onPress={() => toggleSelection(num)}
                >
                  <Text style={[styles.boxText, selections.includes(num) && styles.boxTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Hai số trùng (x50)</Text>
            <View style={styles.grid}>
              {['11', '22', '33', '44', '55', '66'].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[styles.box, selections.includes(num) && styles.boxActive]}
                  onPress={() => toggleSelection(num)}
                >
                  <Text style={[styles.boxText, selections.includes(num) && styles.boxTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Ba số trùng (x120)</Text>
            <View style={styles.grid}>
              {['111', '222', '333', '444', '555', '666'].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[styles.box, selections.includes(num) && styles.boxActive]}
                  onPress={() => toggleSelection(num)}
                >
                  <Text style={[styles.boxText, selections.includes(num) && styles.boxTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {playType === 'Cộng tổng' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn Tổng của 3 con số (x5 - x120)</Text>
            <View style={styles.grid}>
              {Array.from({ length: 16 }, (_, i) => String(i + 3)).map(sum => (
                <TouchableOpacity
                  key={sum}
                  style={[styles.box, selections.includes(sum) && styles.boxActive]}
                  onPress={() => toggleSelection(sum)}
                >
                  <Text style={[styles.boxText, selections.includes(sum) && styles.boxTextActive]}>{sum}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {playType === 'Tài Xỉu Hoà' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dự đoán tổng kết quả</Text>
            <View style={styles.grid}>
              {[
                { id: 'Tài', label: 'Tài (12-18)', rate: 'x2' },
                { id: 'Hoà', label: 'Hoà (10-11)', rate: 'x20' },
                { id: 'Xỉu', label: 'Xỉu (3-9)', rate: 'x2' }
              ].map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.boxBig, selections.includes(item.id) && styles.boxActive]}
                  onPress={() => toggleSelection(item.id)}
                >
                  <Text style={[styles.boxText, selections.includes(item.id) && styles.boxTextActive]}>{item.label}</Text>
                  <Text style={[styles.boxSubText, selections.includes(item.id) && styles.boxTextActive]}>{item.rate}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Multiplier Selector */}
        <View style={styles.multiplierContainer}>
          <Text style={styles.multiplierTitle}>Cấp nhân (Tiền xác 10,000đ/vé)</Text>
          <View style={styles.multiplierRow}>
            {[1, 2, 5, 10, 20].map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.multiplierBtn, multiplier === m && styles.multiplierBtnActive]}
                onPress={() => setMultiplier(m)}
              >
                <Text style={[styles.multiplierBtnText, multiplier === m && styles.multiplierBtnTextActive]}>x{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerInfo}>
          {winInfo ? (
            <>
              <Text style={styles.footerTotalLabel}>Thanh toán: <Text style={styles.footerTotalValue}>{winInfo.totalCost.toLocaleString('vi-VN')} đ</Text></Text>
              <Text style={styles.footerWinLabel}>Thắng tạm tính (Max): <Text style={styles.footerWinValue}>{winInfo.estimatedWin.toLocaleString('vi-VN')} đ</Text></Text>
            </>
          ) : (
            <Text style={styles.footerTotalLabel}>Vui lòng chọn số</Text>
          )}
        </View>
        <TouchableOpacity style={[styles.checkoutBtn, selections.length === 0 && { opacity: 0.5 }]} onPress={handleCheckout}>
          <Text style={styles.checkoutBtnText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EBF0F3',
    justifyContent: 'space-between',
  },
  backButton: { padding: 4 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#0F2942', fontSize: 18, fontWeight: '700' },
  cartButton: { padding: 4 },
  cartBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#E51F27',
    borderRadius: 10,
    width: 16, height: 16,
    justifyContent: 'center', alignItems: 'center'
  },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#EEE'
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderColor: 'transparent'
  },
  tabBtnActive: { borderColor: '#0055A5' },
  tabBtnText: { fontSize: 14, color: '#8F9BB3', fontWeight: '600' },
  tabBtnTextActive: { color: '#0055A5', fontWeight: 'bold' },

  content: { flex: 1, padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  box: {
    width: '30%',
    height: 70,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxBig: {
    width: '46%',
    height: 80,
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxActive: {
    backgroundColor: '#0055A5',
    borderColor: '#0055A5'
  },
  boxText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333'
  },
  boxSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  boxTextActive: {
    color: '#FFF'
  },

  multiplierContainer: {
    marginTop: 12,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  multiplierTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  multiplierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  multiplierBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center'
  },
  multiplierBtnActive: {
    backgroundColor: '#E51F27',
    borderColor: '#E51F27'
  },
  multiplierBtnText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600'
  },
  multiplierBtnTextActive: {
    color: '#FFF'
  },

  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: '#EEE',
    alignItems: 'center'
  },
  footerInfo: { flex: 1 },
  footerTotalLabel: { fontSize: 14, color: '#666' },
  footerTotalValue: { fontSize: 16, fontWeight: 'bold', color: '#E51F27' },
  footerWinLabel: { fontSize: 12, color: '#999', marginTop: 4 },
  footerWinValue: { fontSize: 12, fontWeight: 'bold', color: '#0055A5' },
  checkoutBtn: {
    backgroundColor: '#E51F27',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  checkoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
