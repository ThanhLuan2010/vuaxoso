
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Trophy, X, Award } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';
import { useOrderDetailQuery } from '../../hooks/queries';

const parseWinningNumbers = (raw: any): string[] => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === 'string') {
    return raw.split(/[,;\s]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export default function HistoryDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { ticket: initialTicket, orderId } = (route.params as any) || {};
  
  const [ticket, setTicket] = useState<any>(initialTicket);
  const [loading, setLoading] = useState(!initialTicket);
  const [refreshing, setRefreshing] = useState(false);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [allNumbersModalVisible, setAllNumbersModalVisible] = useState(false);
  const [allItemsModalVisible, setAllItemsModalVisible] = useState(false);
  const [drawInfo, setDrawInfo] = useState<any>(null);

  const fetchOrderDetail = useCallback(async (isRefresh = false) => {
    const idToFetch = orderId || ticket?._id || ticket?.id || ticket?.orderId;
    if (!idToFetch) return;
    try {
      if (isRefresh) setRefreshing(true);
      const res = await api.get(`/orders/${idToFetch}`);
      setTicket(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId, ticket?._id, ticket?.id, ticket?.orderId]);

  useEffect(() => {
    if (orderId && (!ticket || (ticket.orderId !== orderId && ticket._id !== orderId))) {
      fetchOrderDetail();
    }
  }, [orderId, fetchOrderDetail]);

  // Đồng bộ kết quả chi tiết của kỳ quay từ backend nếu cần
  useEffect(() => {
    const fetchDrawResult = async () => {
      try {
        // 1. Ưu tiên sử dụng draw đã được đính kèm từ backend (qua getOrderById)
        if (ticket?.draw) {
          setDrawInfo(ticket.draw);
          if (ticket.draw.status === 'open' || (ticket.draw.closeTime && new Date(ticket.draw.closeTime).getTime() > Date.now())) {
            return; // Kỳ quay đang mở hoặc ở tương lai -> dừng ngay, không query kết quả cũ!
          }
        }

        // 2. Nếu vé có ngày quay ở tương lai, không gọi API kết quả
        if (ticket?.drawDate) {
          const parts = ticket.drawDate.split('/');
          if (parts.length === 3) {
            const drawDayStart = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 0, 0, 0);
            if (Date.now() < drawDayStart.getTime()) {
              return;
            }
          }
        }

        let code = ticket?.gameType;
        if (code === 'xoso_3mien' && ticket?.region) {
          code = ticket.region.toUpperCase();
        }
        if (!code) return;

        const res = await api.get('/draws/results', { params: { code, limit: 30 } }).catch(() => null);
        if (res?.data && Array.isArray(res.data)) {
          const cleanDrawId = (ticket.drawId || '').replace(/^#/, '').trim();
          const targetProv = (ticket.provinceName || '').toLowerCase().trim();

          const found = res.data.find((d: any) => {
            // Kiểm tra khớp ObjectId chính xác nếu có
            if (ticket.draw?._id && String(d._id) === String(ticket.draw._id)) return true;
            if (ticket.drawId && String(d._id) === String(ticket.drawId)) return true;

            // Kiểm tra mã kỳ quay
            const dCode = (d.drawCode || '').replace(/^#/, '').trim();
            const isCodeMatch = cleanDrawId && dCode === cleanDrawId;
            if (!isCodeMatch) return false;

            // NẾU KHỚP MÃ KỲ QUAY: BẮT BUỘC PHẢI KHỚP CẢ ĐÀI LẪN NGÀY!
            if (targetProv) {
              const dProvName = (d.province?.name || d.provinceName || d.provinceId || '').toLowerCase().trim();
              if (dProvName && !dProvName.includes(targetProv) && !targetProv.includes(dProvName)) {
                return false; // Khác đài!
              }
            }

            if (ticket.drawDate) {
              const dCloseTime = d.closeTime || d.drawTime;
              if (dCloseTime) {
                const dt = new Date(dCloseTime);
                const dVnDate = dt.toLocaleDateString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' });
                if (dVnDate !== ticket.drawDate) {
                  return false; // Khác ngày!
                }
              }
            }

            return true;
          });

          if (found) {
            setDrawInfo(found);
          }
        }
      } catch (e) {
        console.log('Error fetching draw result in HistoryDetail:', e);
      }
    };
    if (ticket) {
      fetchDrawResult();
    }
  }, [ticket?.gameType, ticket?.drawId, ticket?.region, ticket?.provinceName, ticket?.drawDate, ticket?.draw]);

  const onRefresh = useCallback(() => {
    fetchOrderDetail(true);
  }, [fetchOrderDetail]);

  // TẤT CẢ CÁC HOOKS PHẢI ĐƯỢC GỌI Ở ĐẦU COMPONENT TRƯỚC CÁC LỆNH RETURN ĐIỀU KIỆN
  const isWinning = ticket?.isWinner === true || (ticket?.prizeAmount != null && Number(ticket.prizeAmount) > 0);

  const winningNumbersList = useMemo(() => {
    // 1. Nếu kỳ quay có trạng thái 'open' (đang mở đặt cược), chắc chắn 100% chưa có kết quả
    if (drawInfo?.status === 'open' || ticket?.draw?.status === 'open') {
      return [];
    }

    // 2. Nếu thời gian chốt cược của kỳ quay nằm trong tương lai, chưa có kết quả
    const targetCloseTime = drawInfo?.closeTime || ticket?.draw?.closeTime;
    if (targetCloseTime && new Date(targetCloseTime).getTime() > Date.now()) {
      return [];
    }

    // 3. Nếu ngày quay là ngày tương lai (ví dụ 13/11 mà nay là 12/11), chưa có kết quả
    if (ticket?.drawDate) {
      const parts = ticket.drawDate.split('/');
      if (parts.length === 3) {
        const drawDateStart = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 0, 0, 0);
        if (Date.now() < drawDateStart.getTime()) {
          return [];
        }
      }
    }

    // 4. Nếu vé đang chờ ('pending') và chưa có cờ trúng thưởng, và drawInfo không phải là completed
    if (ticket?.status === 'pending' && !isWinning && drawInfo?.status !== 'completed' && ticket?.draw?.status !== 'completed') {
      return [];
    }

    const fromTicket = parseWinningNumbers(ticket?.winningNumbers);
    if (fromTicket.length > 0) return fromTicket;
    const fromDraw = parseWinningNumbers(drawInfo?.winningNumbers || ticket?.draw?.winningNumbers || ticket?.drawResult?.winningNumbers);
    if (fromDraw.length > 0 && (drawInfo?.status === 'completed' || ticket?.draw?.status === 'completed' || ticket?.status === 'completed')) return fromDraw;
    return [];
  }, [ticket?.winningNumbers, drawInfo?.winningNumbers, drawInfo?.status, drawInfo?.closeTime, ticket?.draw, ticket?.drawResult, ticket?.drawDate, ticket?.status, isWinning]);

  const userBetNumbers = useMemo(() => {
    const set = new Set<string>();
    if (Array.isArray(ticket?.items)) {
      ticket.items.forEach((it: any) => {
        if (Array.isArray(it.numbers)) {
          it.numbers.forEach((n: any) => {
            const s = String(n).trim();
            if (s) set.add(s);
          });
        }
      });
    }
    if (Array.isArray(ticket?.numbers)) {
      ticket.numbers.forEach((n: any) => {
        const s = String(n).trim();
        if (s) set.add(s);
      });
    }
    return set;
  }, [ticket?.items, ticket?.numbers]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={{ fontSize: 16, color: COLORS.textDark, marginBottom: 12 }}>Không tìm thấy thông tin đơn vé</Text>
        <TouchableOpacity style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.primary, borderRadius: 8 }} onPress={() => navigation.goBack()}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isKienThiet = ticket?.gameType?.startsWith('kienthiet');
  const isLode = ['xoso_3mien', 'lode', 'MB', 'MT', 'MN', 'mb', 'mt', 'mn', 'lode_3mien'].includes(ticket?.gameType);
  let ticketTypeStr = 'GAME';
  if (isKienThiet) {
    const parts = ticket.gameType.split('_');
    ticketTypeStr = parts[1] ? `KIẾN THIẾT ${parts[1].toUpperCase()}` : 'KIẾN THIẾT';
  } else if (isLode) {
    if (['MB', 'mb'].includes(ticket.gameType)) {
      ticketTypeStr = 'LÔ ĐỀ MIỀN BẮC';
    } else if (['MT', 'mt'].includes(ticket.gameType)) {
      ticketTypeStr = 'LÔ ĐỀ MIỀN TRUNG';
    } else if (['MN', 'mn'].includes(ticket.gameType)) {
      ticketTypeStr = 'LÔ ĐỀ MIỀN NAM';
    } else {
      ticketTypeStr = 'LÔ ĐỀ 3 MIỀN';
    }
  } else if (ticket?.gameType) {
    ticketTypeStr = ticket.gameType.replace(/_/g, ' ').toUpperCase();
  }

  const statusStr = isWinning ? 'Trúng thưởng' : (ticket?.status === 'pending' ? 'Chờ in' : (ticket?.status === 'completed' ? 'Hoàn thành' : 'Đã huỷ'));
  const formattedPrice = ticket?.totalCost ? ticket.totalCost.toLocaleString('vi-VN') + 'đ' : '0đ';
  const dateObj = new Date(ticket?.createdAt || Date.now());
  const timeStr = `⏰${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')} - ${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
  const prizeAmount = ticket?.prizeAmount ? ticket.prizeAmount.toLocaleString('vi-VN') + 'đ' : '0 đ';
  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseURL = (api.defaults.baseURL as string) || '';
    const host = baseURL.replace(/\/api\/?$/, '');
    if (path.startsWith('/')) {
      return `${host}${path}`;
    }
    return `${host}/${path}`;
  };

  const hasRealImage = Boolean(
    ticket?.ticketImageUrl &&
    typeof ticket.ticketImageUrl === 'string' &&
    ticket.ticketImageUrl.trim().length > 0 &&
    !ticket.ticketImageUrl.includes('mock_ticket')
  );

  const imageUrl = hasRealImage ? { uri: getImageUrl(ticket.ticketImageUrl) } : null;

  const isMatchNumber = (winNum: string) => {
    if (!winNum || typeof winNum !== 'string') return false;
    const cleanWin = winNum.trim();
    if (!cleanWin) return false;
    if (userBetNumbers.has(cleanWin)) return true;
    const isDau = ticket?.playType?.toLowerCase()?.includes('đầu');
    for (const bet of userBetNumbers) {
      if (!bet) continue;
      if (isDau && bet.length >= 2 && cleanWin.startsWith(bet)) return true;
      if (bet.length >= 2 && cleanWin.endsWith(bet)) return true;
    }
    return false;
  };

  const getPrizeRows = (numbers: string[], gameType?: string, provinceOrRegion?: string) => {
    if (!numbers || numbers.length === 0) return [];

    const provStr = (provinceOrRegion || '').toLowerCase();
    const gType = (gameType || '').toLowerCase();
    const isMB =
      numbers.length >= 27 ||
      gType.includes('mb') ||
      gType.includes('bac') ||
      ['loto_235', 'loto_cap', 'bao_loto_2', 'truot_loto'].includes(gType) ||
      provStr.includes('bắc') ||
      provStr.includes('bac') ||
      provStr.includes('hà nội') ||
      provStr === 'mb';

    if (isMB && numbers.length >= 27) {
      return [
        { label: 'Đặc biệt', isSpecial: true, numbers: [numbers[0]] },
        { label: 'Giải Nhất', isSpecial: false, numbers: [numbers[1]] },
        { label: 'Giải Nhì', isSpecial: false, numbers: numbers.slice(2, 4) },
        { label: 'Giải Ba', isSpecial: false, numbers: numbers.slice(4, 10) },
        { label: 'Giải Tư', isSpecial: false, numbers: numbers.slice(10, 14) },
        { label: 'Giải Năm', isSpecial: false, numbers: numbers.slice(14, 20) },
        { label: 'Giải Sáu', isSpecial: false, numbers: numbers.slice(20, 23) },
        { label: 'Giải Bảy', isSpecial: false, numbers: numbers.slice(23, 27) },
      ];
    }

    if (numbers.length >= 18) {
      return [
        { label: 'Đặc biệt', isSpecial: true, numbers: [numbers[0]] },
        { label: 'Giải Nhất', isSpecial: false, numbers: [numbers[1]] },
        { label: 'Giải Nhì', isSpecial: false, numbers: [numbers[2]] },
        { label: 'Giải Ba', isSpecial: false, numbers: numbers.slice(3, 5) },
        { label: 'Giải Tư', isSpecial: false, numbers: numbers.slice(5, 12) },
        { label: 'Giải Năm', isSpecial: false, numbers: [numbers[12]] },
        { label: 'Giải Sáu', isSpecial: false, numbers: numbers.slice(13, 16) },
        { label: 'Giải Bảy', isSpecial: false, numbers: [numbers[16]] },
        { label: 'Giải Tám', isSpecial: false, numbers: [numbers[17]] },
      ];
    }

    return [
      { label: 'Đặc biệt', isSpecial: true, numbers: [numbers[0]] },
      { label: 'Các giải khác', isSpecial: false, numbers: numbers.slice(1) }
    ];
  };

  const getDrawDateTimeStr = () => {
    const targetDraw = ticket?.draw || drawInfo;
    const drawDateObj = targetDraw?.drawTime || targetDraw?.closeTime;
    if (drawDateObj) {
      const dt = new Date(drawDateObj);
      const vnDate = dt.toLocaleDateString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' });
      const vnTime = dt.toLocaleTimeString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false, hour: '2-digit', minute: '2-digit' });
      if (!ticket?.drawDate || ticket.drawDate === vnDate) {
        return `${vnTime} - ${vnDate}`;
      }
    }
    if (ticket?.drawDate) {
      return ticket.drawTime ? `${ticket.drawTime} - ${ticket.drawDate}` : ticket.drawDate;
    }
    const dt = new Date(ticket?.createdAt || Date.now());
    const vnDate = dt.toLocaleDateString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' });
    const vnTime = dt.toLocaleTimeString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false, hour: '2-digit', minute: '2-digit' });
    return `${vnTime} - ${vnDate}`;
  };

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Đơn {ticket?.orderId}</Text>
      <View style={styles.headerBtn} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {renderHeader()}
      
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <View style={[styles.card, isWinning && styles.cardWinning]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.logoText, isWinning && { color: '#E11D48' }]}>{ticketTypeStr}</Text>
            <Text style={[styles.statusText, isWinning && { color: '#E11D48' }]}>{statusStr}</Text>
          </View>

          <View style={styles.dashedDivider} />

          {ticket?.items && ticket.items.length > 0 ? (
            <>
              {ticket.items.slice(0, 10).map((item: any, idx: number) => (
                <View key={idx} style={styles.ticketRow}>
                  <Text style={styles.ticketLabel}>{item.id || String.fromCharCode(65 + idx)}</Text>
                  <View style={styles.ticketNumbers}>
                    {item.numbers?.slice(0, 10).map((n: string, i: number) => {
                      const isWinningNumber = ticket.winningNumbers && ticket.winningNumbers.includes(n);
                      return (
                        <Text 
                          key={i} 
                          style={[
                            styles.ticketNumText,
                            isWinningNumber && { color: '#E51F27', fontWeight: 'bold' }
                          ]}
                        >
                          {n}
                        </Text>
                      );
                    })}
                    {item.numbers?.length > 10 && (
                      <TouchableOpacity onPress={() => {
                        setSelectedNumbers(item.numbers);
                        setAllNumbersModalVisible(true);
                      }}>
                        <Text style={[styles.ticketNumText, { color: '#0084FA', fontWeight: 'bold' }]}>+{item.numbers.length - 10} Xem thêm</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.ticketPrice}>{item.cost.toLocaleString('vi-VN')}đ</Text>
                </View>
              ))}
              {ticket.items.length > 10 && (
                <TouchableOpacity onPress={() => setAllItemsModalVisible(true)} style={{ padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#0084FA', fontWeight: 'bold' }}>Xem thêm {ticket.items.length - 10} dãy số khác...</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>A</Text>
              <View style={styles.ticketNumbers}>
                {ticket.numbers?.slice(0, 10).map((n: string, i: number) => {
                    const isWinningNumber = ticket.winningNumbers && ticket.winningNumbers.includes(n);
                    return (
                      <Text 
                        key={i} 
                        style={[
                          styles.ticketNumText,
                          isWinningNumber && { color: '#E51F27', fontWeight: 'bold' }
                        ]}
                      >
                        {n}
                      </Text>
                    );
                  })}
                {ticket.numbers?.length > 10 && (
                  <TouchableOpacity onPress={() => {
                    setSelectedNumbers(ticket.numbers);
                    setAllNumbersModalVisible(true);
                  }}>
                    <Text style={[styles.ticketNumText, { color: '#0084FA', fontWeight: 'bold' }]}>+{ticket.numbers.length - 10} Xem thêm</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.ticketPrice}>{formattedPrice}</Text>
            </View>
          )}

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{timeStr}</Text>
          </View>

          {(ticket?.balanceBefore != null && ticket?.balanceAfter != null) && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số dư trước cược</Text>
                <Text style={styles.infoValue}>{ticket.balanceBefore.toLocaleString('vi-VN')}đ</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số dư sau cược</Text>
                <Text style={styles.infoValue}>{ticket.balanceAfter.toLocaleString('vi-VN')}đ</Text>
              </View>
            </>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Kỳ QSMT</Text>
            {(() => {
              const rawCode = ticket?.drawCode || ticket?.draw?.drawCode || drawInfo?.drawCode || (ticket?.drawId && ticket?.drawId !== ticket?.drawDate && !ticket.drawId.match(/^[0-9a-f]{24}$/i) ? ticket.drawId : '');
              const drawCodeStr = rawCode ? (String(rawCode).startsWith('#') ? rawCode : `#${rawCode}`) : '';
              return (
                <Text style={styles.infoValue}>
                  {ticket?.drawDate
                    ? (drawCodeStr ? `${ticket.drawDate} (${drawCodeStr})` : ticket.drawDate)
                    : (drawCodeStr || ticket?.drawId || 'Đang cập nhật')}
                </Text>
              );
            })()}
          </View>

          {ticket?.playType ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cách chơi:</Text>
              <Text style={styles.infoValueBold}>{ticket.playType}{ticket.provinceName ? ` (${ticket.provinceName})` : ''}</Text>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thanh toán:</Text>
            <Text style={styles.infoValueBold}>{formattedPrice}</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, isWinning && { color: '#E11D48', fontWeight: 'bold' }]}>Trúng thưởng:</Text>
            <View style={styles.prizeRow}>
              <Trophy size={16} color={isWinning ? '#E11D48' : '#FF5C00'} />
              <Text style={[styles.prizeText, isWinning && { color: '#E11D48', fontWeight: 'bold' }]}>{prizeAmount}</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Khối hiển thị Kết quả kỳ quay + Ngày giờ kỳ quay */}
          <View style={styles.resultSection}>
            <View style={styles.resultSectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Trophy size={18} color="#0A3B7C" />
                <Text style={styles.resultSectionTitle}>
                  Kết quả kỳ quay: <Text style={{ color: COLORS.primary }}>{ticket?.drawId || drawInfo?.drawCode || 'Đang cập nhật'}</Text>
                </Text>
              </View>
            </View>

            <View style={styles.resultMetaRow}>
              <Text style={styles.resultMetaText}>
                ⏰ Ngày giờ quay: <Text style={{ fontWeight: '600', color: COLORS.textDark }}>{getDrawDateTimeStr()}</Text>
              </Text>
              {(ticket?.provinceName || drawInfo?.province?.name) ? (
                <Text style={[styles.resultMetaText, { marginTop: 4 }]}>
                  📍 Đài mở thưởng: <Text style={{ fontWeight: '600', color: COLORS.textDark }}>{ticket?.provinceName || drawInfo?.province?.name}</Text>
                </Text>
              ) : null}
            </View>

            {winningNumbersList.length > 0 ? (
              <View style={styles.resultNumbersContainer}>
                {(isLode || isKienThiet || ['loto_235', 'loto_cap', 'bao_loto_2', 'truot_loto'].includes(ticket?.gameType)) && winningNumbersList.length >= 8 ? (
                  <View style={styles.prizeTableContainer}>
                    {getPrizeRows(
                      winningNumbersList,
                      ticket?.gameType,
                      ticket?.provinceName || drawInfo?.province?.name || drawInfo?.game?.code
                    ).map((row, rIdx, arr) => {
                      const isSpecialRow = row.isSpecial;
                      return (
                        <View
                          key={rIdx}
                          style={[
                            styles.prizeTableRow,
                            isSpecialRow && styles.prizeTableRowSpecial,
                            rIdx === arr.length - 1 && { borderBottomWidth: 0 }
                          ]}
                        >
                          <View style={[styles.prizeLabelCol, isSpecialRow && styles.prizeLabelColSpecial]}>
                            <Text style={[styles.prizeLabelText, isSpecialRow && styles.prizeLabelTextSpecial]}>
                              {row.label}
                            </Text>
                          </View>
                          <View style={styles.prizeNumbersCol}>
                            {row.numbers.map((num, nIdx) => {
                              const isMatch = isMatchNumber(num);
                              return (
                                <View
                                  key={nIdx}
                                  style={[
                                    styles.winningTag,
                                    isSpecialRow && styles.winningTagSpecial,
                                    isMatch && styles.winningTagMatch
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.winningTagText,
                                      isSpecialRow && styles.winningTagTextSpecial,
                                      isMatch && styles.winningTagTextMatch
                                    ]}
                                  >
                                    {num}
                                  </Text>
                                  {isMatch && (
                                    <View style={styles.matchBadge}>
                                      <Text style={styles.matchBadgeText}>Trúng</Text>
                                    </View>
                                  )}
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.winningGrid}>
                    {winningNumbersList.map((num: string, idx: number) => {
                      const isMatch = isMatchNumber(num);
                      return (
                        <View key={idx} style={[styles.winningTag, isMatch && styles.winningTagMatch]}>
                          <Text style={[styles.winningTagText, isMatch && styles.winningTagTextMatch]}>
                            {num}
                          </Text>
                          {isMatch && (
                            <View style={styles.matchBadge}>
                              <Text style={styles.matchBadgeText}>Trúng</Text>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.waitingResultBox}>
                <Text style={styles.waitingResultText}>
                  {ticket?.status === 'completed' || isWinning
                    ? 'Đang đồng bộ kết quả chi tiết của kỳ quay...'
                    : 'Kỳ quay chưa diễn ra. Kết quả sẽ tự động hiển thị sau khi mở thưởng.'}
                </Text>
              </View>
            )}
          </View>

          {/* Hình ảnh vé thực tế: CHỈ HIỂN THỊ KHI ADMIN CÓ UPLOAD ẢNH THẬT */}
          {hasRealImage && imageUrl && (
            <>
              <View style={styles.dashedDivider} />
              <View style={styles.ticketImageContainer}>
                <Text style={styles.ticketImageLabel}>Hình ảnh vé thực tế:</Text>
                <TouchableOpacity style={{ width: '100%' }} onPress={() => setImageViewerVisible(true)}>
                  <Image 
                    source={imageUrl} 
                    style={styles.mockTicketImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal xem ảnh phóng to: chỉ khi có ảnh thực tế */}
      {hasRealImage && imageUrl && (
        <Modal visible={imageViewerVisible} transparent={true} animationType="fade" onRequestClose={() => setImageViewerVisible(false)}>
          <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center'}}>
            <TouchableOpacity style={{position: 'absolute', top: Math.max(insets.top, 20), right: 20, zIndex: 10}} onPress={() => setImageViewerVisible(false)}>
              <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', padding: 10}}>ĐÓNG</Text>
            </TouchableOpacity>
            <Image source={imageUrl} style={{width: '95%', height: '80%'}} resizeMode="contain" />
          </View>
        </Modal>
      )}

      {/* Items Modal */}
      <Modal visible={allItemsModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '80%', padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0F2942' }}>Tất cả {ticket?.items?.length} dãy số</Text>
              <TouchableOpacity onPress={() => setAllItemsModalVisible(false)}>
                <X size={24} color="#0F2942" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ticket?.items || []}
              keyExtractor={(it, idx) => (it.id || idx).toString()}
              renderItem={({ item, index }) => (
                <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
                  <Text style={{ color: '#7F8E9C', fontWeight: 'bold', marginBottom: 4 }}>Dãy {item.id || String.fromCharCode(65 + index)} - Cược: {item.cost?.toLocaleString('vi-VN')}đ</Text>
                  <Text style={{ fontSize: 16, color: '#0F2942', fontWeight: '500' }}>
                    {item.numbers?.join(' ')}
                  </Text>
                </View>
              )}
              initialNumToRender={20}
              maxToRenderPerBatch={50}
              windowSize={5}
            />
          </View>
        </View>
      </Modal>

      {/* Numbers Modal */}
      <Modal visible={allNumbersModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, height: '80%', padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0F2942' }}>Tất cả {selectedNumbers.length} số</Text>
              <TouchableOpacity onPress={() => setAllNumbersModalVisible(false)}>
                <X size={24} color="#0F2942" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedNumbers}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item, index }) => {
                const isWinningNumber = ticket?.winningNumbers && ticket.winningNumbers.includes(item);
                return (
                  <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', flexDirection: 'row' }}>
                    <Text style={{ width: 40, color: '#7F8E9C', fontWeight: 'bold' }}>#{index + 1}</Text>
                    <Text style={{ fontSize: 16, color: isWinningNumber ? '#E51F27' : '#0F2942', fontWeight: isWinningNumber ? 'bold' : '500' }}>
                      {item}
                    </Text>
                  </View>
                );
              }}
              initialNumToRender={20}
              maxToRenderPerBatch={50}
              windowSize={5}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: '#0A3B7C',
  },
  content: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.light,
  },
  cardWinning: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FECDD3',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logoText: {
    color: '#FF5C00',
    fontSize: 20,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  statusText: {
    color: '#0A3B7C',
    fontWeight: 'bold',
    fontSize: 14,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: SPACING.md,
    borderRadius: 1,
  },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  ticketLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.gray600,
    marginRight: SPACING.md,
  },
  ticketNumbers: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ticketNumText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  ticketPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  timeRow: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  timeText: {
    color: COLORS.gray500,
    fontSize: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  infoValueBold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prizeText: {
    color: '#FF5C00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ticketImageContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  ticketImageLabel: {
    fontSize: 14,
    color: COLORS.gray600,
    marginBottom: SPACING.md,
    alignSelf: 'flex-start',
    fontWeight: 'bold',
  },
  mockTicketImage: {
    width: '100%',
    height: 400,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#F1F5F9',
  },
  resultSection: {
    marginTop: SPACING.md,
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  resultSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultSectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  resultMetaRow: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  resultMetaText: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
  },
  resultNumbersContainer: {
    marginTop: 4,
  },
  prizeTableContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  prizeTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    minHeight: 46,
  },
  prizeTableRowSpecial: {
    backgroundColor: '#FFF5F5',
  },
  prizeLabelCol: {
    width: 86,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  prizeLabelColSpecial: {
    backgroundColor: '#FEE2E2',
    borderRightColor: '#FECACA',
  },
  prizeLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  prizeLabelTextSpecial: {
    color: '#DC2626',
    fontWeight: '800',
    fontSize: 13,
  },
  prizeNumbersCol: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 6,
  },
  winningTagSpecial: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  winningTagTextSpecial: {
    color: '#DC2626',
    fontWeight: '900',
    fontSize: 17,
    letterSpacing: 2,
  },
  specialPrizeBox: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  specialPrizeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 1,
    marginBottom: 4,
  },
  specialPrizeNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 3,
  },
  subPrizesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: 8,
  },
  winningGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  winningTag: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  winningTagMatch: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1.5,
  },
  winningTagText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  winningTagTextMatch: {
    color: '#047857',
    fontWeight: '800',
  },
  matchBadge: {
    backgroundColor: '#10B981',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
  },
  matchBadgeText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: 'bold',
  },
  waitingResultBox: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingResultText: {
    fontSize: 13,
    color: COLORS.gray500,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
