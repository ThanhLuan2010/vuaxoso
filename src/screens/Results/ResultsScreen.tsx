import React, { useState } from 'react';
import { View, Text, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/theme';
import { styles } from './resultsStyles';
import VietlottTab from './components/VietlottTab';
import DienToanTab from './components/DienToanTab';
import KienThietTab from './components/KienThietTab';

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const [mainTab, setMainTab] = useState<'vietlott' | 'dientoan' | 'kienthiet'>('vietlott');

  const mainTabs = [
    { id: 'vietlott', label: 'Vietlott' },
    { id: 'dientoan', label: 'Điện Toán\nThủ Đô' },
    { id: 'kienthiet', label: 'Xổ Số\nKiến Thiết' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.cardBackground} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.headerTitle}>Kết quả</Text>
      </View>

      {/* Main Tabs */}
      <View style={styles.mainTabsRow}>
        {mainTabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.mainTab, mainTab === tab.id && styles.mainTabActive]}
            onPress={() => setMainTab(tab.id as any)}
          >
            <Text style={[styles.mainTabText, mainTab === tab.id && styles.mainTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {mainTab === 'vietlott' && <VietlottTab />}
        {mainTab === 'dientoan' && <DienToanTab />}
        {mainTab === 'kienthiet' && <KienThietTab />}
      </View>
    </View>
  );
}
