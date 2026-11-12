import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ProvinceItem, DaySchedule, PROVINCE_SCHEDULES } from '../utils/constants';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';

// Custom circular logos for each province matching screenshot colors
const ProvinceLogo = () => {
  return (
    <View style={[styles.logoCircle, { borderColor: '#0056B3', backgroundColor: '#FFFFFF' }]}>
      <View style={[styles.logoInner, { backgroundColor: '#FFD700' }]} />
    </View>
  );
};

export default function KienThietMatrix() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const rawSchedule = useAppStore((state) => state.kienThietSchedule);
  const fetchKienThietSchedule = useAppStore((state) => state.fetchKienThietSchedule);
  const schedule = (rawSchedule && rawSchedule.length > 0) ? rawSchedule : PROVINCE_SCHEDULES;

  const [currentVnMinutes, setCurrentVnMinutes] = React.useState(() => {
    const now = new Date();
    const vnTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false, hour: '2-digit', minute: '2-digit' });
    const [h, m] = vnTimeStr.split(':').map(Number);
    return h * 60 + m;
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const vnTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false, hour: '2-digit', minute: '2-digit' });
      const [h, m] = vnTimeStr.split(':').map(Number);
      setCurrentVnMinutes(h * 60 + m);
      fetchKienThietSchedule();
    }, 15000);
    return () => clearInterval(timer);
  }, [fetchKienThietSchedule]);

  const handleProvinceClick = (
    prov: ProvinceItem,
    dateString: string,
    region: 'MB' | 'MT' | 'MN',
    provinceList?: ProvinceItem[]
  ) => {
    navigation.navigate('GameLayoutC', {
      provinceId: prov.id,
      provinceName: prov.name,
      drawDate: dateString,
      region,
      provinces: provinceList,
    });
  };

  // Helper to format date block dynamically
  const getFormattedDateBlocks = (offset: number) => {
    const today = new Date();
    const target = new Date(today);
    target.setDate(today.getDate() + offset);

    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[target.getDay()];
    const dateNum = String(target.getDate()).padStart(2, '0');
    const monthNum = String(target.getMonth() + 1).padStart(2, '0');
    const year = target.getFullYear();

    let prefix = '';
    if (offset === 1) prefix = 'Ngày\nmai';
    if (offset === 2) prefix = 'Ngày\nkia';

    return {
      prefix,
      dayName,
      dateNum,
      monthStr: `Thg ${monthNum}`,
      year,
    };
  };

  const renderProvinceBtn = (
    prov: ProvinceItem,
    dateString: string,
    region: 'MB' | 'MT' | 'MN',
    provinceList?: ProvinceItem[]
  ) => {
    return (
      <TouchableOpacity
        key={prov.id}
        style={styles.logoBtn}
        onPress={() => handleProvinceClick(prov, dateString, region, provinceList)}
      >
        <ProvinceLogo />
        <Text style={styles.logoLabel} numberOfLines={1}>{prov.code}</Text>
      </TouchableOpacity>
    );
  };

  // 18h15 auto chuyển sang ngày bán vé kế tiếp của 3 miền
  const isPast1815 = currentVnMinutes >= 18 * 60 + 15;

  return (
    <View style={styles.container}>
      {/* Table Headers */}
      <View style={styles.tableHeader}>
        <View style={[styles.headerCell, styles.dateCol, styles.headerCellRed]}>
          <Text style={styles.headerTextWhite}>Ngày</Text>
        </View>
        <View style={[styles.headerCell, styles.regionCol]}>
          <Text style={styles.headerTextRed}>Miền Bắc</Text>
        </View>
        <View style={[styles.headerCell, styles.regionCol]}>
          <Text style={styles.headerTextRed}>Miền Trung</Text>
        </View>
        <View style={[styles.headerCell, styles.regionCol]}>
          <Text style={styles.headerTextRed}>Miền Nam</Text>
        </View>
      </View>

      {/* Table Rows */}
      {schedule && schedule.map((row: any, index: number) => {
        // Tự động chuyển ngày kế tiếp nếu sau 18h15
        let actualOffset = row.offset !== undefined ? row.offset : index;
        if (isPast1815 && actualOffset === index && row.offset === undefined) {
          actualOffset = index + 1;
        }

        const dateBlocks = getFormattedDateBlocks(actualOffset);
        const isRowToday = actualOffset === 0;

        // 16h10 vé miền nam ngày đó tắt; 17h10 vé miền trung tắt; 18h10 vé miền bắc tắt
        const isMBClosed = isRowToday && currentVnMinutes >= 18 * 60 + 10;
        const isMTClosed = isRowToday && currentVnMinutes >= 17 * 60 + 10;
        const isMNClosed = isRowToday && currentVnMinutes >= 16 * 60 + 10;

        const effectiveMB = isMBClosed ? [] : (row.mb || []);
        const effectiveMT = isMTClosed ? [] : (row.mt || []);
        const effectiveMN = isMNClosed ? [] : (row.mn || []);

        return (
          <View key={index} style={styles.tableRow}>
            {/* Column 1: Date Sidebar */}
            <View style={[
              styles.cell,
              styles.dateCol,
              styles.center,
              (index === 0) ? styles.dateBgToday : styles.dateBgFuture
            ]}>
              {dateBlocks.prefix ? (
                <Text style={styles.prefixText}>{dateBlocks.prefix}</Text>
              ) : null}
              <Text style={styles.dayText}>{dateBlocks.dayName}</Text>
              <Text style={styles.dateNumText}>{dateBlocks.dateNum}</Text>
              <Text style={styles.monthText}>{dateBlocks.monthStr}</Text>
              <Text style={styles.yearText}>{dateBlocks.year}</Text>
            </View>

            {/* Column 2: Miền Bắc */}
            <View style={[styles.cell, styles.regionCol, styles.center, styles.borderDashed]}>
              {effectiveMB.length > 0 ? (
                <View style={styles.gridContainer}>
                  {effectiveMB.map((prov: any) =>
                    renderProvinceBtn(
                      prov,
                      row.dateString,
                      'MB',
                      effectiveMB.map((p: any) => ({ ...p, region: 'MB' }))
                    )
                  )}
                </View>
              ) : (
                <View style={styles.closedContainer}>
                  <Text style={styles.closedBadge}>Đã chốt</Text>
                </View>
              )}
            </View>

            {/* Column 3: Miền Trung */}
            <View style={[styles.cell, styles.regionCol, styles.borderDashed]}>
              {effectiveMT.length > 0 ? (
                <View style={styles.gridContainer}>
                  {effectiveMT.map((prov: any) =>
                    renderProvinceBtn(
                      prov,
                      row.dateString,
                      'MT',
                      effectiveMT.map((p: any) => ({ ...p, region: 'MT' }))
                    )
                  )}
                </View>
              ) : (
                <View style={styles.closedContainer}>
                  <Text style={styles.closedBadge}>Đã chốt</Text>
                </View>
              )}
            </View>

            {/* Column 4: Miền Nam */}
            <View style={[styles.cell, styles.regionCol]}>
              {effectiveMN.length > 0 ? (
                <View style={styles.gridContainer}>
                  {effectiveMN.map((prov: any) =>
                    renderProvinceBtn(
                      prov,
                      row.dateString,
                      'MN',
                      effectiveMN.map((p: any) => ({ ...p, region: 'MN' }))
                    )
                  )}
                </View>
              ) : (
                <View style={styles.closedContainer}>
                  <Text style={styles.closedBadge}>Đã chốt</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#EBF0F3',
    ...SHADOWS.light,
  },
  tableHeader: {
    flexDirection: 'row',
    height: 38,
    borderBottomWidth: 1.5,
    borderBottomColor: '#EBF0F3',
  },
  headerCell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCellRed: {
    backgroundColor: '#E51F27',
  },
  headerTextWhite: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  headerTextRed: {
    color: '#E51F27',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#EBF0F3',
  },
  cell: {
    paddingVertical: SPACING.md,
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  dateCol: {
    width: '18%',
  },
  regionCol: {
    width: '27.3%',
  },
  borderDashed: {
    borderRightWidth: 1,
    borderRightColor: '#EBF0F3',
    borderStyle: 'dashed',
  },
  dateBgToday: {
    backgroundColor: '#503598', // Deep violet
  },
  dateBgFuture: {
    backgroundColor: '#5C6B73', // Faded dark grey
  },
  prefixText: {
    color: '#FFFFFF',
    fontSize: 8,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 10,
    marginBottom: 2,
  },
  dayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 10,
    textAlign: 'center',
  },
  dateNumText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    marginVertical: 1,
    textAlign: 'center',
  },
  monthText: {
    color: '#FFFFFF',
    fontSize: 8,
    textAlign: 'center',
  },
  yearText: {
    color: '#FFFFFF',
    fontSize: 7,
    opacity: 0.8,
    marginTop: 1,
    textAlign: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  logoBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    marginVertical: 4,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  logoInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  logoLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#334D5C',
    marginTop: 4,
    textAlign: 'center',
  },
  closedContainer: {
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  closedBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
});
