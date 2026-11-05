import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../../../theme/theme';
import { usePaginatedResultsQuery } from '../../../hooks/queries';
import { styles } from '../resultsStyles';

export default function KienThietTab() {
  const [subTab, setSubTab] = useState<'mien_bac' | 'mien_trung' | 'mien_nam'>('mien_trung');
  const [page, setPage] = useState(1);

  // React Query cached query
  const { data: results = [], isLoading, isFetching, refetch } = usePaginatedResultsQuery(
    'kienthiet',
    subTab,
    page,
    20
  );

  const onRefresh = () => {
    setPage(1);
    refetch();
  };

  const renderFooter = () => {
    if (!isFetching) return <View style={{ height: 24 }} />;
    return <ActivityIndicator style={{ marginVertical: 20 }} color={COLORS.primary} />;
  };

  const renderItem = ({ item }: { item: any }) => {
    const d = new Date(item.closeTime);
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const numbers = item.winningNumbers || [];

    const prizeLabels = [
      'Đặc biệt',
      'Giải Nhất',
      'Giải Nhì',
      'Giải Ba',
      'Giải Tư',
      'Giải Năm',
      'Giải Sáu',
      'Giải Bảy',
      'Giải Tám',
    ];

    return (
      <View
        style={{
          marginBottom: 16,
          backgroundColor: COLORS.cardBackground,
          borderRadius: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#EEEEEE',
        }}
      >
        <View style={{ backgroundColor: '#005baa', padding: 12 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>
            {item.game?.name}
            {item.province?.name ? ` - ${item.province.name}` : ''}
          </Text>
          <Text style={{ color: '#E0E0E0', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
            Kỳ quay: {item.drawCode} - Ngày: {dateStr}
          </Text>
        </View>
        <View>
          {numbers.map((num: string, idx: number) => {
            const isSpecial = idx === 0;
            return (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  borderBottomWidth: idx === numbers.length - 1 ? 0 : 1,
                  borderBottomColor: '#EEEEEE',
                  backgroundColor: isSpecial ? '#FFF9E6' : 'white',
                }}
              >
                <View
                  style={{
                    width: 100,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRightWidth: 1,
                    borderRightColor: '#EEEEEE',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontWeight: 'bold', color: isSpecial ? '#D32F2F' : COLORS.textDark, fontSize: 14 }}>
                    {prizeLabels[idx] || `Giải ${idx}`}
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: isSpecial ? '#D32F2F' : COLORS.textDark,
                      fontSize: isSpecial ? 20 : 16,
                      letterSpacing: 2,
                    }}
                  >
                    {num}
                  </Text>
                </View>
              </View>
            );
          })}
          {numbers.length === 0 && (
            <Text style={{ textAlign: 'center', padding: 20, color: COLORS.gray500 }}>Chưa có kết quả</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.tabContentContainer}>
      <View style={styles.subTabSegmented}>
        {[
          { id: 'mien_bac', label: 'Miền Bắc' },
          { id: 'mien_trung', label: 'Miền Trung' },
          { id: 'mien_nam', label: 'Miền Nam' },
        ].map((t) => (
          <TouchableOpacity
            key={t.id}
            style={[styles.subTabBtn, subTab === t.id && styles.subTabBtnActiveDT]}
            onPress={() => {
              setSubTab(t.id as any);
              setPage(1);
            }}
          >
            <Text style={[styles.subTabText, subTab === t.id && styles.subTabTextActiveDT]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.ktContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={{ textAlign: 'center', color: COLORS.gray500, marginTop: 20 }}>
              Không có dữ liệu
            </Text>
          ) : null
        }
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      />
    </View>
  );
}

