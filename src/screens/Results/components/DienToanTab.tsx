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
import { styles, DIENTOAN_COLORS } from '../resultsStyles';

export default function DienToanTab() {
  const [subTab, setSubTab] = useState<'dientoan_636' | 'than_tai_4' | 'dientoan_123'>('dientoan_636');
  const [page, setPage] = useState(1);

  // React Query cached query
  const { data: results = [], isLoading, isFetching, refetch } = usePaginatedResultsQuery(
    'dientoan',
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
    const dayNames = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = dayNames[d.getDay()];
    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    const numbers = item.winningNumbers || [];

    return (
      <View style={styles.dtCard}>
        <Text style={styles.dtDateText}>
          {dayName} - {dateStr} (Kỳ: {item.drawCode})
        </Text>

        {subTab === 'dientoan_636' && (
          <View style={styles.dtBallRow}>
            {numbers.map((num: string, i: number) => (
              <View
                key={i}
                style={[styles.dtBall6x36, { borderColor: DIENTOAN_COLORS[i % DIENTOAN_COLORS.length] }]}
              >
                <Text style={styles.dtBallTextDark}>{num}</Text>
              </View>
            ))}
          </View>
        )}

        {subTab === 'than_tai_4' && (
          <View style={styles.dtBallRowCentered}>
            {numbers.map((num: string, i: number) => (
              <View key={i} style={styles.dtBallThanTai}>
                <Text style={styles.dtBallTextLight}>{num}</Text>
              </View>
            ))}
          </View>
        )}

        {subTab === 'dientoan_123' && (
          <View style={styles.dtBallRowCentered}>
            {numbers.map((num: string, i: number) => (
              <View key={i} style={styles.dtOval123}>
                <Text style={styles.dtBallTextLight}>{num}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.tabContentContainer}>
      <View style={styles.subTabSegmented}>
        {[
          { id: 'dientoan_636', label: '6x36' },
          { id: 'than_tai_4', label: 'Thần tài' },
          { id: 'dientoan_123', label: '1-2-3' },
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
        contentContainerStyle={styles.dtList}
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

