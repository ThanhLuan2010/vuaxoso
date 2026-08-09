import { ArrowLeft, Search } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../services/api';
import { useAppStore } from '../../store/useAppStore';
import {
  PaperTicket,
  PROVINCE_SCHEDULES,
  ProvinceItem
} from '../../utils/constants';

// ------------------------------------------------------------
// Helpers: get region label from province id
// ------------------------------------------------------------
const getRegionLabel = (region: string): string => {
  if (region === 'MB') return 'KIẾN THIẾT MIỀN BẮC';
  if (region === 'MT') return 'KIẾN THIẾT MIỀN TRUNG';
  return 'KIẾN THIẾT MIỀN NAM';
};

// ------------------------------------------------------------
// Province logo – red circle with yellow star (generic)
// ------------------------------------------------------------
const ProvinceLogo = ({ size = 22 }: { size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#E51F27',
      borderWidth: 1.5,
      borderColor: '#FFD700',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text style={{ fontSize: size * 0.45, color: '#FFD700', fontWeight: 'bold' }}>★</Text>
  </View>
);

// ------------------------------------------------------------
// Diamond logo for special tickets
// ------------------------------------------------------------
const DiamondLogo = ({ size = 22 }: { size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      backgroundColor: '#FF6B00',
      borderWidth: 1,
      borderColor: '#FF8C00',
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ rotate: '45deg' }],
    }}
  >
    <Text
      style={{
        fontSize: size * 0.35,
        color: '#FFFFFF',
        fontWeight: 'bold',
        transform: [{ rotate: '-45deg' }],
      }}
    >
      ◆
    </Text>
  </View>
);

// ------------------------------------------------------------
// Normal ticket card (xNNNNN with multiplier superscript)
// ------------------------------------------------------------
const NormalTicketCard = ({
  ticket,
  isSelected,
  onPress,
}: {
  ticket: PaperTicket;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.normalCard,
      isSelected && styles.normalCardSelected,
    ]}
    activeOpacity={0.8}
  >
    <View style={styles.normalCardInner}>
      <ProvinceLogo size={20} />
      <Text style={[styles.normalCardNumber, isSelected && styles.normalCardNumberSelected]}>
        {ticket.number}
      </Text>
      {ticket.multiplier != null && (
        <Text style={styles.normalCardMultiplier}>{ticket.multiplier}</Text>
      )}
    </View>
  </TouchableOpacity>
);

// ------------------------------------------------------------
// Special ticket card (NNNNNN with diamond, multiplier top-right)
// ------------------------------------------------------------
const SpecialTicketCard = ({
  ticket,
  isSelected,
  onPress,
}: {
  ticket: PaperTicket;
  isSelected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.specialCard,
      isSelected && styles.specialCardSelected,
    ]}
    activeOpacity={0.8}
  >
    <DiamondLogo size={22} />
    <Text style={[styles.specialCardNumber, isSelected && styles.specialCardNumberSelected]}>
      {ticket.number}
    </Text>
    {ticket.multiplier != null && (
      <Text style={styles.specialCardMultiplier}>{ticket.multiplier}</Text>
    )}
  </TouchableOpacity>
);

// ============================================================
// Main Screen
// ============================================================
export default function GameLayoutCScreen({ route, navigation }: any) {
  const { provinceId, provinceName, drawDate } = route.params;
  const insets = useSafeAreaInsets();
  const addToCart = useAppStore((state) => state.addToCart);

  // Collect all provinces in the same region on the same day
  const allProvinces: ProvinceItem[] = useMemo(() => {
    const schedule = PROVINCE_SCHEDULES.find((s) => s.dateString === drawDate);
    if (!schedule) return [{ id: provinceId, name: provinceName, code: provinceName, region: 'MN' as any }];
    const allLists = [...schedule.mb, ...schedule.mt, ...schedule.mn];
    // Find region of our province
    const myProv = allLists.find((p) => p.id === provinceId);
    if (!myProv) return [{ id: provinceId, name: provinceName, code: provinceName, region: 'MN' as any }];
    const region = myProv.region;
    const regionList = region === 'MB' ? schedule.mb : region === 'MT' ? schedule.mt : schedule.mn;
    return regionList.length > 0 ? regionList : [myProv];
  }, [provinceId, provinceName, drawDate]);

  const regionLabel = allProvinces.length > 0 ? getRegionLabel(allProvinces[0].region) : 'KIẾN THIẾT';

  const [selectedProvinceId, setSelectedProvinceId] = useState<string>(provinceId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  const [apiTickets, setApiTickets] = useState<PaperTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoadingTickets(true);
        const res = await api.get('/tickets', {
          params: { provinceId: selectedProvinceId, drawDate: drawDate }
        });
        const mapped = res.data.map((t: any) => ({
          ...t,
          id: t._id,
          sold: t.isSold,
        }));
        setApiTickets(mapped);
      } catch (error) {
        console.error('Lỗi lấy vé:', error);
      } finally {
        setLoadingTickets(false);
      }
    };
    fetchTickets();
  }, [selectedProvinceId, drawDate]);

  const tickets = apiTickets;

  // Split into normal and special
  const normalTickets = useMemo(() => {
    let list = tickets.filter((t) => t.ticketType === 'normal');
    if (searchQuery.trim()) {
      list = list.filter((t) => t.number.includes(searchQuery.trim()));
    }
    return list;
  }, [tickets, searchQuery]);

  const specialTickets = useMemo(() => {
    let list = tickets.filter((t) => t.ticketType === 'special');
    if (searchQuery.trim()) {
      list = list.filter((t) => t.number.includes(searchQuery.trim()));
    }
    return list;
  }, [tickets, searchQuery]);

  const handleToggleSelect = (ticket: PaperTicket) => {
    if (ticket.sold) return;
    if (selectedTicketIds.includes(ticket.id)) {
      setSelectedTicketIds(selectedTicketIds.filter((id) => id !== ticket.id));
    } else {
      setSelectedTicketIds([...selectedTicketIds, ticket.id]);
    }
  };

  const handleReset = () => {
    setSelectedTicketIds([]);
    setSearchQuery('');
  };

  const handleBuy = () => {
    if (selectedTicketIds.length === 0) {
      Alert.alert('Chưa chọn vé', 'Vui lòng chọn ít nhất 1 vé để đặt mua.');
      return;
    }
    const boards = selectedTicketIds.map((id, index) => {
      const ticket = tickets.find((t) => t.id === id);
      return {
        id: String.fromCharCode(65 + index), // A, B, C...
        isTC: false,
        numbers: [ticket?.number || ''],
        cost: ticket?.price || 10000
      };
    });

    const totalCost = boards.reduce((sum, b) => sum + b.cost, 0);

    navigation.navigate('GamePayment', {
      gameId: `kienthiet_${selectedProvinceId}`,
      gameName: `Kiến Thiết ${allProvinces.find((p) => p.id === selectedProvinceId)?.name ?? provinceName}`,
      playType: 'Vé Kiến Thiết',
      boards,
      totalCost,
      provinceName,
      drawDate
    });

    setSelectedTicketIds([]);
  };

  const ticketFee = selectedTicketIds.length * 10000;
  const serviceFee = 0;
  const totalFee = ticketFee + serviceFee;

  // Current selected date string for display
  const currentDay = new Date();
  const dayStr = `${String(currentDay.getDate()).padStart(2, '0')}/${String(currentDay.getMonth() + 1).padStart(2, '0')}/${currentDay.getFullYear()}`;

  // Render a grid row of 3 normal tickets
  const renderNormalGrid = () => {
    const rows: PaperTicket[][] = [];
    for (let i = 0; i < normalTickets.length; i += 3) {
      rows.push(normalTickets.slice(i, i + 3));
    }
    return (
      <View style={styles.normalGrid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.normalGridRow}>
            {row.map((ticket) => (
              <NormalTicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedTicketIds.includes(ticket.id)}
                onPress={() => handleToggleSelect(ticket)}
              />
            ))}
            {/* Fill empty spaces if row has < 3 items */}
            {row.length < 3 &&
              Array.from({ length: 3 - row.length }).map((_, i) => (
                <View key={`empty_${i}`} style={styles.normalCardPlaceholder} />
              ))}
          </View>
        ))}
      </View>
    );
  };

  const renderSpecialGrid = () => {
    const rows: PaperTicket[][] = [];
    for (let i = 0; i < specialTickets.length; i += 3) {
      rows.push(specialTickets.slice(i, i + 3));
    }
    return (
      <View style={styles.specialGrid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.specialGridRow}>
            {row.map((ticket) => (
              <SpecialTicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedTicketIds.includes(ticket.id)}
                onPress={() => handleToggleSelect(ticket)}
              />
            ))}
            {row.length < 3 &&
              Array.from({ length: 3 - row.length }).map((_, i) => (
                <View key={`empty_${i}`} style={styles.specialCardPlaceholder} />
              ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={22} color="#0F2942" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{regionLabel}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 160 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SEARCH BAR ── */}
        <View style={styles.searchBar}>
          <Search size={16} color="#8F9BB3" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm số vé..."
            placeholderTextColor="#8F9BB3"
            value={searchQuery}
            onChangeText={setSearchQuery}
            keyboardType="number-pad"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: '#E51F27', fontWeight: '600', fontSize: 13 }}>Xóa</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── PROVINCE FILTER TABS ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.provinceTabs}
        >
          {allProvinces.map((prov) => {
            const isActive = prov.id === selectedProvinceId;
            return (
              <TouchableOpacity
                key={prov.id}
                onPress={() => {
                  setSelectedProvinceId(prov.id);
                  setSelectedTicketIds([]);
                }}
                style={[styles.provinceTabBtn, isActive && styles.provinceTabBtnActive]}
              >
                <Text style={[styles.provinceTabText, isActive && styles.provinceTabTextActive]}>
                  {prov.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── DATE LABEL ── */}
        <Text style={styles.dateLabel}>{dayStr}</Text>

        {/* ── NORMAL TICKETS GRID ── */}
        {normalTickets.length > 0 && renderNormalGrid()}

        {/* ── SPECIAL TICKETS GRID ── */}
        {specialTickets.length > 0 && (
          <View style={{ marginTop: 12 }}>
            {renderSpecialGrid()}
          </View>
        )}

        {normalTickets.length === 0 && specialTickets.length === 0 && !loadingTickets && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Không tìm thấy vé phù hợp.</Text>
          </View>
        )}

        {loadingTickets && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Đang tải vé...</Text>
          </View>
        )}
      </ScrollView>

      {/* ── STICKY FOOTER ── */}
      <View style={[styles.footer, { paddingBottom: 16 + insets.bottom }]}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Tiền vé:</Text>
          <Text style={styles.footerVal}>{ticketFee.toLocaleString('vi-VN')} VNĐ</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Phí dịch vụ:</Text>
          <Text style={styles.footerVal}>{serviceFee.toLocaleString('vi-VN')} VNĐ</Text>
        </View>
        <View style={[styles.footerRow, { marginTop: 4 }]}>
          <Text style={styles.footerTotalLabel}>Tổng tiền:</Text>
          <Text style={[styles.footerTotalVal, { color: totalFee > 0 ? '#E51F27' : '#E51F27' }]}>
            {totalFee > 0 ? totalFee.toLocaleString('vi-VN') : '0'} VNĐ
          </Text>
        </View>

        <View style={styles.footerBtns}>
          <TouchableOpacity style={styles.buyBtn} onPress={handleBuy}>
            <Text style={styles.buyBtnText}>Đặt vé</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ============================================================
// Styles
// ============================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EBF0F3',
  },
  backBtn: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2942',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 14,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EBF0F3',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F2942',
    padding: 0,
    height: '100%',
  },

  // Province tabs
  provinceTabs: {
    flexDirection: 'row',
    paddingBottom: 12,
    gap: 8,
  },
  provinceTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EBF0F3',
  },
  provinceTabBtnActive: {
    backgroundColor: '#E51F27',
    borderColor: '#E51F27',
  },
  provinceTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8F9BB3',
  },
  provinceTabTextActive: {
    color: '#FFFFFF',
  },

  // Date label
  dateLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E51F27',
    marginBottom: 10,
  },

  // Normal ticket grid
  normalGrid: {
    gap: 8,
  },
  normalGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  normalCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E51F27',
    paddingVertical: 9,
    paddingHorizontal: 8,
    position: 'relative',
    minHeight: 44,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  normalCardSelected: {
    backgroundColor: '#FFF0F0',
    borderColor: '#B30000',
    borderWidth: 2,
  },
  normalCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  normalCardNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E51F27',
    flexShrink: 1,
  },
  normalCardNumberSelected: {
    color: '#B30000',
  },
  normalCardMultiplier: {
    position: 'absolute',
    top: -6,
    right: -4,
    fontSize: 9,
    fontWeight: '700',
    color: '#8F9BB3',
    backgroundColor: '#F4F6F9',
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  normalCardPlaceholder: {
    flex: 1,
  },

  // Special ticket grid
  specialGrid: {
    gap: 8,
  },
  specialGridRow: {
    flexDirection: 'row',
    gap: 8,
  },
  specialCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EBF0F3',
    paddingVertical: 9,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
    minHeight: 44,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  specialCardSelected: {
    backgroundColor: '#FFF8F0',
    borderColor: '#FF6B00',
    borderWidth: 2,
  },
  specialCardNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2942',
    flexShrink: 1,
  },
  specialCardNumberSelected: {
    color: '#FF6B00',
  },
  specialCardMultiplier: {
    position: 'absolute',
    top: -6,
    right: -4,
    fontSize: 9,
    fontWeight: '700',
    color: '#8F9BB3',
    backgroundColor: '#F4F6F9',
    paddingHorizontal: 2,
    borderRadius: 4,
  },
  specialCardPlaceholder: {
    flex: 1,
  },

  // Empty
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8F9BB3',
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EBF0F3',
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 8,
    elevation: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  footerLabel: {
    fontSize: 13,
    color: '#8F9BB3',
  },
  footerVal: {
    fontSize: 13,
    color: '#8F9BB3',
    fontWeight: '600',
  },
  footerTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2942',
  },
  footerTotalVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  footerBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E51F27',
  },
  buyBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#0B3A60',
    alignItems: 'center',
  },
  buyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
