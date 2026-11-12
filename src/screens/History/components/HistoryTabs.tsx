import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../historyStyles';

interface HistoryTabsProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

const TABS = ['Chờ in', 'Hoàn thành', 'Vé huỷ'];

export default function HistoryTabs({ activeTab, onSelectTab }: HistoryTabsProps) {
  return (
    <View style={styles.tabContainer}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
          onPress={() => onSelectTab(tab)}
        >
          <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

