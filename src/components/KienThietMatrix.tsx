import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ProvinceItem, DaySchedule } from '../utils/constants';
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
  const schedule = useAppStore((state) => state.kienThietSchedule);

  const handleProvinceClick = (prov: ProvinceItem, dateString: string) => {
    navigation.navigate('GameLayoutC', {
      provinceId: prov.id,
      provinceName: prov.name,
      drawDate: dateString,
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

  const renderProvinceBtn = (prov: ProvinceItem, dateString: string) => {
    return (
      <TouchableOpacity
        key={prov.id}
        style={styles.logoBtn}
        onPress={() => handleProvinceClick(prov, dateString)}
      >
        <ProvinceLogo />
        <Text style={styles.logoLabel} numberOfLines={1}>{prov.code}</Text>
      </TouchableOpacity>
    );
  };

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
      {schedule && schedule.map((row: DaySchedule, index: number) => {
        const isToday = row.isToday;
        const dateBlocks = getFormattedDateBlocks(index);

        return (
          <View key={index} style={styles.tableRow}>
            {/* Column 1: Date Sidebar */}
            <View style={[
              styles.cell, 
              styles.dateCol, 
              styles.center, 
              isToday ? styles.dateBgToday : styles.dateBgFuture
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
              <View style={styles.gridContainer}>
                {row.mb.map((prov) => renderProvinceBtn(prov, row.dateString))}
              </View>
            </View>

            {/* Column 3: Miền Trung */}
            <View style={[styles.cell, styles.regionCol, styles.borderDashed]}>
              <View style={styles.gridContainer}>
                {row.mt.map((prov) => renderProvinceBtn(prov, row.dateString))}
              </View>
            </View>

            {/* Column 4: Miền Nam */}
            <View style={[styles.cell, styles.regionCol]}>
              <View style={styles.gridContainer}>
                {row.mn.map((prov) => renderProvinceBtn(prov, row.dateString))}
              </View>
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


});
