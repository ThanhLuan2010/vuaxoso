import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../historyStyles';

interface HistoryFiltersProps {
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

const FILTERS = ['Tất cả', 'Vietlott', 'Điện toán', 'Kiến Thiết', 'Lô Đề'];

export default function HistoryFilters({ activeFilter, onSelectFilter }: HistoryFiltersProps) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={styles.filterContainer}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterItem, activeFilter === filter && styles.filterItemActive]}
            onPress={() => onSelectFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

