
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
import { evaluateWinningCombo, parseWinningNumbers, ComboEvalResult, isPrizeRowMatch, isCombinationBet, evaluateItemCombo, parseMaxGameDigits, calculateTicketWinningStatus, parseBingo18Dice } from '../../utils/lotteryResultHelper';

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

  // TẤT CẢ CÁC HOOKS PHẢI ĐƯỢC GỌI Ở ĐẦU COMPONENT TRƯỚC CÁC LỆNH RETURN ĐIỀU KIỆN
  const rawServerIsWinning = ticket?.isWinner === true || (ticket?.prizeAmount != null && Number(ticket.prizeAmount) > 0);

  // Đồng bộ kết quả chi tiết của kỳ quay từ backend nếu cần
  useEffect(() => {
    const fetchDrawResult = async () => {
      try {
        // 1. Ưu tiên sử dụng draw đã được đính kèm từ backend (qua getOrderById)
        if (ticket?.draw) {
          setDrawInfo(ticket.draw);
          if (ticket.draw.status === 'completed' && ticket.draw.winningNumbers?.length > 0) {
            return;
          }
          if (ticket.draw.status === 'open') {
            return;
          }
        }

        // Nếu vé đã có winningNumbers trực tiếp từ backend thì không cần query gì thêm
        if (ticket?.winningNumbers && ticket.winningNumbers.length > 0) {
          return;
        }

        // 2. Nếu vé chưa completed và có ngày quay ở tương lai, không gọi API kết quả cũ
        if (ticket?.drawDate && ticket?.status !== 'completed' && !rawServerIsWinning) {
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
            // Chỉ lấy kết quả đã completed và có winningNumbers
            if (d.status !== 'completed' || !d.winningNumbers || d.winningNumbers.length === 0) return false;

            // Kiểm tra khớp ObjectId chính xác nếu có
            if (ticket.draw?._id && String(d._id) === String(ticket.draw._id)) return true;
            if (ticket.drawId && String(d._id) === String(ticket.drawId)) return true;

            // Kiểm tra mã kỳ quay
            const dCode = (d.drawCode || '').replace(/^#/, '').trim();
            const isCodeMatch = Boolean(cleanDrawId && (dCode === cleanDrawId || cleanDrawId === (d.drawCode || '').trim()));

            // Kiểm tra khớp ngày quay (cho các vé đặt theo ngày hoặc virtual drawId như truot_20261117)
            let isDateMatch = false;
            const dCloseTime = d.closeTime || d.drawTime;
            if (dCloseTime) {
              const dt = new Date(dCloseTime);
              const dVnDate = dt.toLocaleDateString('en-GB', { timeZone: 'Asia/Ho_Chi_Minh' });
              const dIsoDate = dt.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).replace(/-/g, '');
              if (ticket.drawDate && dVnDate === ticket.drawDate) isDateMatch = true;
              if (cleanDrawId && (cleanDrawId === dVnDate || cleanDrawId.includes(dIsoDate))) isDateMatch = true;
            }

            // Nếu không khớp mã và không khớp ngày thì loại
            if (!isCodeMatch && !isDateMatch) return false;

            // NẾU KHỚP: BẮT BUỘC PHẢI KHỚP CẢ ĐÀI NẾU CÓ ĐÀI!
            if (targetProv) {
              const dProvName = (d.province?.name || d.provinceName || d.provinceId || '').toLowerCase().trim();
              if (dProvName && !dProvName.includes(targetProv) && !targetProv.includes(dProvName)) {
                return false; // Khác đài!
              }
            }

            if (ticket.drawDate && isCodeMatch && !isDateMatch) {
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
  }, [ticket?.gameType, ticket?.drawId, ticket?.region, ticket?.provinceName, ticket?.drawDate, ticket?.draw, ticket?.status, ticket?.winningNumbers, rawServerIsWinning]);

  const onRefresh = useCallback(() => {
    fetchOrderDetail(true);
  }, [fetchOrderDetail]);

  const winningNumbersList = useMemo(() => {
    // 1. ƯU TIÊN SỐ 1: Nếu vé đã có kết quả trúng/trượt (winningNumbers) được lưu trực tiếp trên vé
    const fromTicket = parseWinningNumbers(ticket?.winningNumbers);
    if (fromTicket.length > 0) {
      return fromTicket;
    }

    // 2. ƯU TIÊN SỐ 2: Nếu kỳ quay đính kèm (draw) đã có kết quả và completed
    const drawObj = drawInfo || ticket?.draw || ticket?.drawResult;
    if (drawObj?.status === 'completed') {
      const fromDraw = parseWinningNumbers(drawObj.winningNumbers);
      if (fromDraw.length > 0) return fromDraw;
    }

    // 3. Nếu vé đang chờ ('pending') hoặc kỳ quay đang mở ('open') -> chắc chắn chưa có kết quả
    if (drawObj?.status === 'open') {
      return [];
    }

    // 4. Nếu thời gian chốt cược của kỳ quay nằm trong tương lai và chưa có cờ trúng thưởng
    const targetCloseTime = drawObj?.closeTime;
    if (targetCloseTime && new Date(targetCloseTime).getTime() > Date.now() && !rawServerIsWinning && ticket?.status !== 'completed') {
      return [];
    }

    // 5. Nếu ngày quay là ngày tương lai và chưa có cờ trúng thưởng
    if (ticket?.drawDate && !rawServerIsWinning && ticket?.status !== 'completed') {
      const parts = ticket.drawDate.split('/');
      if (parts.length === 3) {
        const drawDateStart = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 0, 0, 0);
        if (Date.now() < drawDateStart.getTime()) {
          return [];
        }
      }
    }

    return [];
  }, [ticket?.winningNumbers, drawInfo?.winningNumbers, drawInfo?.status, drawInfo?.closeTime, ticket?.draw, ticket?.drawResult, ticket?.drawDate, ticket?.status, rawServerIsWinning]);

  const ticketWinningStatus = useMemo(() => {
    return calculateTicketWinningStatus(ticket, winningNumbersList);
  }, [ticket, winningNumbersList]);

  const isWinning = ticketWinningStatus.isWinning;

  const extractSpecialNumbers = (itemObj: any, ticketObj: any): string[] => {
    const raw = itemObj?.specialNumbers ?? itemObj?.special_numbers ?? ticketObj?.specialNumbers ?? ticketObj?.special_numbers;
    if (Array.isArray(raw)) return raw.map((s: any) => String(s).trim()).filter(Boolean);
    if (typeof raw === 'string' && raw.trim()) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map((s: any) => String(s).trim()).filter(Boolean);
      } catch { }
      return raw.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const userBetNumbers = useMemo(() => {
    const set = new Set<string>();
    const processNumbers = (rawNums: any) => {
      if (!rawNums) return;
      const list: string[] = Array.isArray(rawNums)
        ? rawNums.map(String)
        : (typeof rawNums === 'string' ? rawNums.split(/[\s,]+/).map(s => s.trim()).filter(Boolean) : []);

      list.forEach(n => {
        const s = String(n).trim();
        if (s) set.add(s);
      });

      const joined = list.map(n => String(n).trim()).join('');
      if (joined) set.add(joined);

      if (list.length === 6) {
        set.add(`${list[0]}${list[1]}${list[2]}`);
        set.add(`${list[3]}${list[4]}${list[5]}`);
        set.add(String(list[0]));
        set.add(`${list[1]}${list[2]}`);
        set.add(`${list[3]}${list[4]}${list[5]}`);
      } else if (list.length === 2 && list[0].length === 3 && list[1].length === 3) {
        set.add(list[0]);
        set.add(list[1]);
      }
    };

    if (Array.isArray(ticket?.items)) {
      ticket.items.forEach((it: any) => {
        processNumbers(it.numbers);
        const itSpecials = extractSpecialNumbers(it, null);
        itSpecials.forEach((sn) => set.add(sn));
      });
    }
    if (ticket?.numbers) {
      processNumbers(ticket.numbers);
    }
    const ticketSpecials = extractSpecialNumbers(null, ticket);
    ticketSpecials.forEach((sn) => set.add(sn));
    return set;
  }, [ticket?.items, ticket?.numbers, ticket?.specialNumbers, ticket?.special_numbers]);

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
  const isDienToan123 = (ticket?.gameType || '').toLowerCase() === 'dientoan_123';
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
  } else if (isDienToan123) {
    ticketTypeStr = 'ĐIỆN TOÁN 1-2-3';
  } else if (ticket?.gameType === 'than_tai_4') {
    ticketTypeStr = 'THẦN TÀI 4';
  } else if (ticket?.gameType === 'max_3d') {
    ticketTypeStr = 'MAX 3D';
  } else if (ticket?.gameType === 'max_3d_plus') {
    ticketTypeStr = 'MAX 3D+';
  } else if (ticket?.gameType === 'max_3d_pro') {
    ticketTypeStr = 'MAX 3D PRO';
  } else if (ticket?.gameType === 'max_4d') {
    ticketTypeStr = 'MAX 4D';
  } else if (ticket?.gameType) {
    ticketTypeStr = ticket.gameType.replace(/_/g, ' ').toUpperCase();
  }

  const statusStr = isWinning ? 'Trúng thưởng' : (ticket?.status === 'pending' ? 'Chờ in' : (ticket?.status === 'completed' ? 'Hoàn thành' : 'Đã huỷ'));
  const formattedPrice = ticket?.totalCost ? ticket.totalCost.toLocaleString('vi-VN') + 'đ' : '0đ';
  const dateObj = new Date(ticket?.createdAt || Date.now());
  const timeStr = `⏰${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')} - ${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
  const prizeAmount = ticketWinningStatus.prizeAmount > 0
    ? ticketWinningStatus.prizeAmount.toLocaleString('vi-VN') + 'đ'
    : (ticket?.prizeAmount ? ticket.prizeAmount.toLocaleString('vi-VN') + 'đ' : '0 đ');
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

  const isMatchNumber = (winNum: string, rowLabel?: string) => {
    return isPrizeRowMatch(winNum, rowLabel, ticket, userBetNumbers);
  };

  const renderHighlightedCombo = (
    itemStr: string,
    evalResult: ComboEvalResult,
    isWinningCombo: boolean,
    fontSize = 15
  ) => {
    if (!itemStr.includes('&')) {
      return (
        <Text
          style={{
            fontSize,
            color: isWinningCombo ? '#E11D48' : '#0F2942',
            fontWeight: isWinningCombo ? 'bold' : '500',
          }}
        >
          {itemStr}
        </Text>
      );
    }

    const parts = itemStr.split('&');
    return (
      <Text style={{ fontSize }}>
        {parts.map((p, pIdx) => {
          const cleanP = p.trim();
          const isHit = evalResult.hitNumbers.has(cleanP) || evalResult.hitNumbers.has(cleanP.padStart(2, '0'));
          const isRed = isWinningCombo || isHit;
          return (
            <React.Fragment key={pIdx}>
              <Text
                style={{
                  color: isRed ? '#E11D48' : '#0F2942',
                  fontWeight: isRed ? 'bold' : '500',
                }}
              >
                {p}
              </Text>
              {pIdx < parts.length - 1 && (
                <Text
                  style={{
                    color: isWinningCombo ? '#E11D48' : '#0F2942',
                    fontWeight: isWinningCombo ? 'bold' : '500',
                  }}
                >
                  &
                </Text>
              )}
            </React.Fragment>
          );
        })}
      </Text>
    );
  };

  const getPrizeRows = (numbers: string[], gameType?: string, provinceOrRegion?: string) => {
    if (!numbers || numbers.length === 0) return [];

    const provStr = (provinceOrRegion || '').toLowerCase();
    const gType = (gameType || '').toLowerCase();

    if (gType === 'max_3d' || gType === 'max_3d_pro' || gType === 'max_3d_plus') {
      return [
        { label: 'Đặc biệt', isSpecial: true, numbers: numbers.slice(0, 2) },
        { label: 'Giải Nhất', isSpecial: false, numbers: numbers.slice(2, 6) },
        { label: 'Giải Nhì', isSpecial: false, numbers: numbers.slice(6, 12) },
        { label: 'Giải Ba', isSpecial: false, numbers: numbers.slice(12, 20) },
      ].filter(row => row.numbers.length > 0);
    }

    if (gType === 'max_4d') {
      return [
        { label: 'Giải Nhất', isSpecial: true, numbers: numbers.slice(0, 1) },
        { label: 'Giải Nhì', isSpecial: false, numbers: numbers.slice(1, 3) },
        { label: 'Giải Ba', isSpecial: false, numbers: numbers.slice(3, 6) },
      ].filter(row => row.numbers.length > 0);
    }

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
      const cleanDrawDate = String(ticket.drawDate).replace(/#+/g, '#');
      return ticket.drawTime ? `${ticket.drawTime} - ${cleanDrawDate}` : cleanDrawDate;
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
              {ticket.items.slice(0, 10).map((item: any, idx: number) => {
                const itemEval = evaluateItemCombo(item, ticket, winningNumbersList);
                const isCombo = itemEval.isComboBet;
                const isItemWinning = isWinning && itemEval.isWinning;

                return (
                  <View
                    key={idx}
                    style={[
                      styles.ticketRow,
                      isItemWinning && {
                        backgroundColor: '#FFF1F2',
                        borderRadius: 8,
                        paddingHorizontal: 8,
                        paddingVertical: 6,
                        marginVertical: 2,
                        borderWidth: 1,
                        borderColor: '#FECDD3',
                      }
                    ]}
                  >
                    <Text style={[styles.ticketLabel, isItemWinning && { color: '#E11D48', fontWeight: 'bold' }]}>
                      {item.id || String.fromCharCode(65 + idx)}
                    </Text>

                    {(() => {
                      const rawItemNums: string[] = Array.isArray(item.numbers)
                        ? item.numbers
                        : (typeof item.numbers === 'string' ? [item.numbers] : []);
                      const hasEmbeddedAmp = rawItemNums.some((n: string) => n.includes('&'));
                      const hasMore = rawItemNums.length > 10;
                      const displayList = hasMore ? rawItemNums.slice(0, 10) : rawItemNums;
                      const isMatrixGame = [
                        'dientoan_636', 'bao_636', 'mega_645', 'power_655', 'max_3d', 'max_3d_pro', 'max_3d_plus', 'max_4d',
                        'lotto_535', 'lotto_570', 'keno', 'bao_keno', 'clln_keno', 'bingo18', 'than_tai_4', 'dientoan_123'
                      ].includes((ticket?.gameType || '').toLowerCase());
                      const shouldNoWrap = displayList.length <= 7;

                      const maxInfo = parseMaxGameDigits(rawItemNums, ticket?.gameType, item.playType || ticket?.playType);
                      if (maxInfo) {
                        if (maxInfo.isSplit) {
                          return (
                            <View style={[styles.ticketNumbers, { flexWrap: 'nowrap', alignItems: 'center', gap: 4 }]}>
                              <View style={{ flexDirection: 'row', gap: 4 }}>
                                {maxInfo.set1.map((d: string, di: number) => {
                                  const isHit = itemEval.hitIndices?.has(di) ?? false;
                                  return (
                                    <View key={`s1-${di}`} style={[styles.ticketBallCircle, isHit && styles.ticketBallCircleWinning]}>
                                      <Text style={[styles.ticketBallCircleText, isHit && { color: '#FFF' }]}>{d}</Text>
                                    </View>
                                  );
                                })}
                              </View>
                              <View style={{ width: 1.5, height: 20, backgroundColor: '#D0D5DD', marginHorizontal: 2 }} />
                              <View style={{ flexDirection: 'row', gap: 4 }}>
                                {(maxInfo.set2 || []).map((d: string, di: number) => {
                                  const isHit = itemEval.hitIndices?.has(di + 3) ?? false;
                                  return (
                                    <View key={`s2-${di}`} style={[styles.ticketBallCircle, isHit && styles.ticketBallCircleWinning]}>
                                      <Text style={[styles.ticketBallCircleText, isHit && { color: '#FFF' }]}>{d}</Text>
                                    </View>
                                  );
                                })}
                              </View>
                              {isItemWinning && (
                                <Text style={{ color: '#E11D48', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                              )}
                            </View>
                          );
                        }

                        return (
                          <View style={[styles.ticketNumbers, { flexWrap: 'nowrap', alignItems: 'center', gap: 4 }]}>
                            {maxInfo.set1.map((d: string, di: number) => {
                              const isHit = itemEval.hitIndices?.has(di) ?? false;
                              return (
                                <View key={`d-${di}`} style={[styles.ticketBallCircle, isHit && styles.ticketBallCircleWinning]}>
                                  <Text style={[styles.ticketBallCircleText, isHit && { color: '#FFF' }]}>{d}</Text>
                                </View>
                              );
                            })}
                            {isItemWinning && (
                              <Text style={{ color: '#E11D48', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                            )}
                          </View>
                        );
                      }

                      if (isDienToan123 && (rawItemNums.length === 6 || rawItemNums.length === 3)) {
                        let b1 = '', b2 = '', b3 = '';
                        if (rawItemNums.length === 6) {
                          b1 = rawItemNums[0];
                          b2 = `${rawItemNums[1]}${rawItemNums[2]}`;
                          b3 = `${rawItemNums[3]}${rawItemNums[4]}${rawItemNums[5]}`;
                        } else {
                          b1 = rawItemNums[0];
                          b2 = rawItemNums[1];
                          b3 = rawItemNums[2];
                        }

                        const isB1Win = itemEval.hitIndices ? itemEval.hitIndices.has(0) : itemEval.hitNumbers?.has(b1);
                        const isB2Win = itemEval.hitIndices
                          ? (rawItemNums.length === 6 ? (itemEval.hitIndices.has(1) && itemEval.hitIndices.has(2)) : itemEval.hitIndices.has(1))
                          : itemEval.hitNumbers?.has(b2);
                        const isB3Win = itemEval.hitIndices
                          ? (rawItemNums.length === 6 ? (itemEval.hitIndices.has(3) && itemEval.hitIndices.has(4) && itemEval.hitIndices.has(5)) : itemEval.hitIndices.has(2))
                          : itemEval.hitNumbers?.has(b3);

                        const renderSet = (val: string, isWinSet: boolean) => (
                          <View
                            style={[
                              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
                              isWinSet && { backgroundColor: '#FFF1F2', borderColor: '#FECDD3', borderWidth: 0.5 }
                            ]}
                          >
                            <Text
                              style={{
                                fontSize: 16,
                                color: isWinSet ? '#E11D48' : '#0F2942',
                                fontWeight: isWinSet ? 'bold' : '600',
                                letterSpacing: 0.5,
                              }}
                            >
                              {val}
                            </Text>
                          </View>
                        );

                        return (
                          <View style={[styles.ticketNumbers, { flexWrap: 'nowrap', alignItems: 'center', gap: 0 }]}>
                            {renderSet(b1, Boolean(isB1Win))}
                            <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 8, fontSize: 14 }}>|</Text>
                            {renderSet(b2, Boolean(isB2Win))}
                            <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 8, fontSize: 14 }}>|</Text>
                            {renderSet(b3, Boolean(isB3Win))}
                          </View>
                        );
                      }

                      if (isCombo && !hasEmbeddedAmp && rawItemNums.length <= 10) {
                        return (
                          <View style={styles.ticketNumbers}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                              <Text
                                style={{
                                  fontSize: 15,
                                  color: isItemWinning ? '#E11D48' : '#0F2942',
                                  fontWeight: isItemWinning ? 'bold' : '600',
                                }}
                              >
                                {rawItemNums.join(' ')}
                              </Text>
                              {isItemWinning && (
                                <Text style={{ color: '#E11D48', fontSize: 13, fontWeight: 'bold', marginLeft: 6 }}>
                                  (Trúng)
                                </Text>
                              )}
                            </View>
                          </View>
                        );
                      }

                      return (
                        <View style={[styles.ticketNumbers, shouldNoWrap && { flexWrap: 'nowrap', alignItems: 'center', gap: 2 }]}>
                          {displayList.map((n: string, i: number) => {
                            const evalRes = evaluateWinningCombo(n, ticket, winningNumbersList);
                            const isWinningNum = isWinning && (
                              (itemEval.hitIndices && itemEval.hitIndices.size > 0)
                                ? itemEval.hitIndices.has(i)
                                : evalRes.isWinning
                            );

                            return (
                              <View
                                key={i}
                                style={[
                                  { flexDirection: 'row', alignItems: 'center', marginRight: 3 },
                                  isWinningNum && { backgroundColor: '#FFF1F2', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, borderWidth: 0.5, borderColor: '#FECDD3' }
                                ]}
                              >
                                {renderHighlightedCombo(n, evalRes, isWinningNum, 14)}
                                {isWinningNum && !isMatrixGame && (
                                  <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>
                                    (Trúng)
                                  </Text>
                                )}
                              </View>
                            );
                          })}
                          {isItemWinning && !isMatrixGame && (
                            <View style={{ backgroundColor: '#FFF1F2', borderColor: '#FECDD3', borderWidth: 0.5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 4, alignSelf: 'center' }}>
                              <Text style={{ color: '#E11D48', fontSize: 10, fontWeight: 'bold' }}>Trúng</Text>
                            </View>
                          )}
                          {(() => {
                            const itemSpecials = extractSpecialNumbers(item, ticket);
                            if (itemSpecials.length === 0) return null;
                            return (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 2, flexShrink: 0 }}>
                                <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginRight: 4, fontSize: 13 }}>|</Text>
                                {itemSpecials.map((sn: string, si: number) => {
                                  const drawSpecial = winningNumbersList.length > 5 ? String(winningNumbersList[5]).trim().padStart(2, '0') : null;
                                  const isSpecialMatched = drawSpecial ? String(sn).trim().padStart(2, '0') === drawSpecial : false;
                                  return (
                                    <View
                                      key={`spec-${si}`}
                                      style={[
                                        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, backgroundColor: '#FFF7ED', borderWidth: 0.5, borderColor: '#FDBA74', marginRight: 2 },
                                        isSpecialMatched && { backgroundColor: '#FFEDD5', borderColor: '#EA580C', borderWidth: 1 }
                                      ]}
                                    >
                                      <Text style={{ color: '#EA580C', fontWeight: 'bold', fontSize: 13 }}>
                                        ★ {sn}
                                      </Text>
                                    </View>
                                  );
                                })}
                              </View>
                            );
                          })()}
                          {hasMore && (
                            <View style={{ width: '100%', marginTop: 8 }}>
                              <TouchableOpacity
                                onPress={() => {
                                  setSelectedNumbers(rawItemNums);
                                  setAllNumbersModalVisible(true);
                                }}
                                style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
                              >
                                <Text style={{ color: '#0084FA', fontWeight: 'bold', fontSize: 14 }}>
                                  +{rawItemNums.length - 10} Xem thêm
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      );
                    })()}

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.ticketPrice, isItemWinning && { color: '#E11D48', fontWeight: 'bold' }]}>
                        {item.cost?.toLocaleString('vi-VN')}đ
                      </Text>
                      {isItemWinning && !isCombo && (
                        <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold' }}>(Trúng)</Text>
                      )}
                    </View>
                  </View>
                );
              })}
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
                {(() => {
                  const rawTicketNums: string[] = Array.isArray(ticket.numbers)
                    ? ticket.numbers
                    : (typeof ticket.numbers === 'string' ? [ticket.numbers] : []);
                  const hasEmbeddedAmp = rawTicketNums.some((n: string) => n.includes('&'));
                  const itemEval = evaluateItemCombo({ numbers: ticket.numbers }, ticket, winningNumbersList);
                  const isCombo = itemEval.isComboBet;
                  const isItemWinning = isWinning && itemEval.isWinning;
                  const hasMore = rawTicketNums.length > 10;
                  const displayList = hasMore ? rawTicketNums.slice(0, 10) : rawTicketNums;
                  const isMatrixGame = [
                    'dientoan_636', 'bao_636', 'mega_645', 'power_655', 'max_3d', 'max_3d_pro', 'max_3d_plus', 'max_4d',
                    'lotto_535', 'lotto_570', 'keno', 'bao_keno', 'clln_keno', 'bingo18', 'than_tai_4', 'dientoan_123'
                  ].includes((ticket?.gameType || '').toLowerCase());
                  const shouldNoWrap = displayList.length <= 7;

                  const maxInfo = parseMaxGameDigits(rawTicketNums, ticket?.gameType, ticket?.playType);
                  if (maxInfo) {
                    if (maxInfo.isSplit) {
                      return (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <View style={{ flexDirection: 'row', gap: 4 }}>
                            {maxInfo.set1.map((d: string, di: number) => {
                              const isHit = itemEval.hitIndices?.has(di) ?? false;
                              return (
                                <View key={`d1-${di}`} style={[styles.ticketBallCircle, isHit && styles.ticketBallCircleWinning]}>
                                  <Text style={[styles.ticketBallCircleText, isHit && { color: '#FFF' }]}>{d}</Text>
                                </View>
                              );
                            })}
                          </View>
                          <View style={{ width: 1.5, height: 20, backgroundColor: '#D0D5DD', marginHorizontal: 2 }} />
                          <View style={{ flexDirection: 'row', gap: 4 }}>
                            {(maxInfo.set2 || []).map((d: string, di: number) => {
                              const isHit = itemEval.hitIndices?.has(di + 3) ?? false;
                              return (
                                <View key={`d2-${di}`} style={[styles.ticketBallCircle, isHit && styles.ticketBallCircleWinning]}>
                                  <Text style={[styles.ticketBallCircleText, isHit && { color: '#FFF' }]}>{d}</Text>
                                </View>
                              );
                            })}
                          </View>
                          {isItemWinning && (
                            <Text style={{ color: '#E11D48', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                          )}
                        </View>
                      );
                    }

                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        {maxInfo.set1.map((d: string, di: number) => {
                          const isHit = itemEval.hitIndices?.has(di) ?? false;
                          return (
                            <View key={`d-${di}`} style={[styles.ticketBallCircle, isHit && styles.ticketBallCircleWinning]}>
                              <Text style={[styles.ticketBallCircleText, isHit && { color: '#FFF' }]}>{d}</Text>
                            </View>
                          );
                        })}
                        {isItemWinning && (
                          <Text style={{ color: '#E11D48', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                        )}
                      </View>
                    );
                  }

                  if (isDienToan123 && (rawTicketNums.length === 6 || rawTicketNums.length === 3)) {
                    let b1 = '', b2 = '', b3 = '';
                    if (rawTicketNums.length === 6) {
                      b1 = rawTicketNums[0];
                      b2 = `${rawTicketNums[1]}${rawTicketNums[2]}`;
                      b3 = `${rawTicketNums[3]}${rawTicketNums[4]}${rawTicketNums[5]}`;
                    } else {
                      b1 = rawTicketNums[0];
                      b2 = rawTicketNums[1];
                      b3 = rawTicketNums[2];
                    }

                    const isB1Win = itemEval.hitIndices ? itemEval.hitIndices.has(0) : itemEval.hitNumbers?.has(b1);
                    const isB2Win = itemEval.hitIndices
                      ? (rawTicketNums.length === 6 ? (itemEval.hitIndices.has(1) && itemEval.hitIndices.has(2)) : itemEval.hitIndices.has(1))
                      : itemEval.hitNumbers?.has(b2);
                    const isB3Win = itemEval.hitIndices
                      ? (rawTicketNums.length === 6 ? (itemEval.hitIndices.has(3) && itemEval.hitIndices.has(4) && itemEval.hitIndices.has(5)) : itemEval.hitIndices.has(2))
                      : itemEval.hitNumbers?.has(b3);

                    const renderSet = (val: string, isWinSet: boolean) => (
                      <View
                        style={[
                          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
                          isWinSet && { backgroundColor: '#FFF1F2', borderColor: '#FECDD3', borderWidth: 0.5 }
                        ]}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: isWinSet ? '#E11D48' : '#0F2942',
                            fontWeight: isWinSet ? 'bold' : '600',
                            letterSpacing: 0.5,
                          }}
                        >
                          {val}
                        </Text>
                      </View>
                    );

                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {renderSet(b1, Boolean(isB1Win))}
                        <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 8, fontSize: 14 }}>|</Text>
                        {renderSet(b2, Boolean(isB2Win))}
                        <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 8, fontSize: 14 }}>|</Text>
                        {renderSet(b3, Boolean(isB3Win))}
                      </View>
                    );
                  }

                  if (isCombo && !hasEmbeddedAmp && rawTicketNums.length <= 10) {
                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                        <Text
                          style={{
                            fontSize: 15,
                            color: isItemWinning ? '#E11D48' : '#0F2942',
                            fontWeight: isItemWinning ? 'bold' : '600',
                          }}
                        >
                          {rawTicketNums.join(' ')}
                        </Text>
                        {isItemWinning && (
                          <Text style={{ color: '#E11D48', fontSize: 13, fontWeight: 'bold', marginLeft: 6 }}>
                            (Trúng)
                          </Text>
                        )}
                      </View>
                    );
                  }

                  return (
                    <View style={[{ flexDirection: 'row', alignItems: 'center' }, shouldNoWrap && { flexWrap: 'nowrap', gap: 2 }]}>
                      {displayList.map((n: string, i: number) => {
                        const evalRes = evaluateWinningCombo(n, ticket, winningNumbersList);
                        const isWinningNum = isWinning && (
                          (itemEval.hitIndices && itemEval.hitIndices.size > 0)
                            ? itemEval.hitIndices.has(i)
                            : evalRes.isWinning
                        );

                        return (
                          <View
                            key={i}
                            style={[
                              { flexDirection: 'row', alignItems: 'center', marginRight: 3 },
                              isWinningNum && { backgroundColor: '#FFF1F2', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, borderWidth: 0.5, borderColor: '#FECDD3' }
                            ]}
                          >
                            {renderHighlightedCombo(n, evalRes, isWinningNum, 14)}
                            {isWinningNum && !isMatrixGame && (
                              <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>
                                (Trúng)
                              </Text>
                            )}
                          </View>
                        );
                      })}
                      {isItemWinning && !isMatrixGame && (
                        <View style={{ backgroundColor: '#FFF1F2', borderColor: '#FECDD3', borderWidth: 0.5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 4, alignSelf: 'center' }}>
                          <Text style={{ color: '#E11D48', fontSize: 10, fontWeight: 'bold' }}>Trúng</Text>
                        </View>
                      )}
                      {(() => {
                        const ticketSpecials = extractSpecialNumbers(null, ticket);
                        if (ticketSpecials.length === 0) return null;
                        return (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 2, flexShrink: 0 }}>
                            <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginRight: 4, fontSize: 13 }}>|</Text>
                            {ticketSpecials.map((sn: string, si: number) => {
                              const drawSpecial = winningNumbersList.length > 5 ? String(winningNumbersList[5]).trim().padStart(2, '0') : null;
                              const isSpecialMatched = drawSpecial ? String(sn).trim().padStart(2, '0') === drawSpecial : false;
                              return (
                                <View
                                  key={`spec-${si}`}
                                  style={[
                                    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5, backgroundColor: '#FFF7ED', borderWidth: 0.5, borderColor: '#FDBA74', marginRight: 2 },
                                    isSpecialMatched && { backgroundColor: '#FFEDD5', borderColor: '#EA580C', borderWidth: 1 }
                                  ]}
                                >
                                  <Text style={{ color: '#EA580C', fontWeight: 'bold', fontSize: 13 }}>
                                    ★ {sn}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        );
                      })()}
                      {hasMore && (
                        <View style={{ width: '100%', marginTop: 8 }}>
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedNumbers(rawTicketNums);
                              setAllNumbersModalVisible(true);
                            }}
                            style={{ alignSelf: 'flex-start', paddingVertical: 4 }}
                          >
                            <Text style={{ color: '#0084FA', fontWeight: 'bold', fontSize: 14 }}>
                              +{rawTicketNums.length - 10} Xem thêm
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })()}
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
              const cleanCode = rawCode ? String(rawCode).replace(/^#+/, '') : '';
              const drawCodeStr = cleanCode ? `#${cleanCode}` : '';
              let cleanDrawDate = ticket?.drawDate ? String(ticket.drawDate).replace(/#+/g, '#') : '';

              let displayStr = 'Đang cập nhật';
              if (cleanDrawDate) {
                if (drawCodeStr && !cleanDrawDate.includes(drawCodeStr) && !cleanDrawDate.includes(cleanCode)) {
                  displayStr = `${cleanDrawDate} (${drawCodeStr})`;
                } else {
                  displayStr = cleanDrawDate;
                }
              } else if (drawCodeStr) {
                displayStr = drawCodeStr;
              } else if (ticket?.drawId) {
                displayStr = ticket.drawId;
              }

              return (
                <Text style={styles.infoValue}>{displayStr}</Text>
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
                  Kết quả kỳ quay: <Text style={{ color: COLORS.primary }}>
                    {(() => {
                      const raw = ticket?.drawCode || ticket?.draw?.drawCode || drawInfo?.drawCode || ticket?.drawId;
                      if (!raw) return 'Đang cập nhật';
                      const clean = String(raw).replace(/^#+/, '');
                      return `#${clean}`;
                    })()}
                  </Text>
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
                {((isLode || isKienThiet || ['loto_235', 'loto_cap', 'bao_loto_2', 'truot_loto'].includes(ticket?.gameType)) && winningNumbersList.length >= 8) ||
                  (['max_3d', 'max_3d_pro', 'max_3d_plus'].includes(ticket?.gameType) && winningNumbersList.length >= 2) ||
                  (ticket?.gameType === 'max_4d' && winningNumbersList.length >= 1) ? (
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
                              const isMatch = isMatchNumber(num, row.label);
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
                                  {isMatch && isWinning && ticket?.isWinner && (
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
                ) : isDienToan123 && (winningNumbersList.length === 6 || winningNumbersList.length === 3) ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginVertical: 8 }}>
                    {(() => {
                      let w1 = '', w2 = '', w3 = '';
                      if (winningNumbersList.length === 6) {
                        w1 = winningNumbersList[0];
                        w2 = `${winningNumbersList[1]}${winningNumbersList[2]}`;
                        w3 = `${winningNumbersList[3]}${winningNumbersList[4]}${winningNumbersList[5]}`;
                      } else {
                        w1 = winningNumbersList[0];
                        w2 = winningNumbersList[1];
                        w3 = winningNumbersList[2];
                      }
                      const match1 = isMatchNumber(w1);
                      const match2 = isMatchNumber(w2);
                      const match3 = isMatchNumber(w3);
                      return (
                        <>
                          <View style={[styles.winningTag, { minWidth: 38 }, match1 && styles.winningTagMatch]}>
                            <Text style={[styles.winningTagText, match1 && styles.winningTagTextMatch]}>{w1}</Text>
                          </View>
                          <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 4, fontSize: 16 }}>|</Text>
                          <View style={[styles.winningTag, { minWidth: 46 }, match2 && styles.winningTagMatch]}>
                            <Text style={[styles.winningTagText, match2 && styles.winningTagTextMatch]}>{w2}</Text>
                          </View>
                          <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 4, fontSize: 16 }}>|</Text>
                          <View style={[styles.winningTag, { minWidth: 54 }, match3 && styles.winningTagMatch]}>
                            <Text style={[styles.winningTagText, match3 && styles.winningTagTextMatch]}>{w3}</Text>
                          </View>
                        </>
                      );
                    })()}
                  </View>
                ) : ((ticket?.gameType || '').toLowerCase() === 'bingo18' || (ticket?.gameType || '').toLowerCase() === 'bingo_18') ? (
                  <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 8, gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      {(() => {
                        const dice = parseBingo18Dice(winningNumbersList);
                        const displayDice = dice.length === 3 ? dice.map(String) : winningNumbersList;
                        return displayDice.map((numStr: string, idx: number) => {
                          const isMatch = isMatchNumber(numStr);
                          return (
                            <View
                              key={idx}
                              style={[
                                styles.winningTag,
                                { minWidth: 44, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
                                isMatch && styles.winningTagMatch
                              ]}
                            >
                              <Text
                                style={[
                                  styles.winningTagText,
                                  { fontSize: 16, fontWeight: 'bold' },
                                  isMatch && styles.winningTagTextMatch
                                ]}
                              >
                                {numStr}
                              </Text>
                            </View>
                          );
                        });
                      })()}
                    </View>
                    {(() => {
                      const dice = parseBingo18Dice(winningNumbersList);
                      if (dice.length === 3) {
                        const sum = dice[0] + dice[1] + dice[2];
                        const taiXiu = sum >= 12 ? 'Tài' : (sum <= 9 ? 'Xỉu' : 'Hoà');
                        return (
                          <Text style={{ fontSize: 13, color: '#475569', fontWeight: '500' }}>
                            Tổng: <Text style={{ fontWeight: 'bold', color: COLORS.primary }}>{sum}</Text> ({taiXiu})
                          </Text>
                        );
                      }
                      return null;
                    })()}
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
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', top: Math.max(insets.top, 20), right: 20, zIndex: 10 }} onPress={() => setImageViewerVisible(false)}>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', padding: 10 }}>ĐÓNG</Text>
            </TouchableOpacity>
            <Image source={imageUrl} style={{ width: '95%', height: '80%' }} resizeMode="contain" />
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
              renderItem={({ item, index }) => {
                const itemEval = evaluateItemCombo(item, ticket, winningNumbersList);
                const isCombo = itemEval.isComboBet;
                const isItemWinning = itemEval.isWinning;

                return (
                  <View
                    style={[
                      { paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
                      isItemWinning && {
                        backgroundColor: '#FFF1F2',
                        borderColor: '#FECDD3',
                        borderWidth: 1,
                        borderRadius: 8,
                        marginVertical: 3,
                      }
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ color: isItemWinning ? '#E11D48' : '#7F8E9C', fontWeight: 'bold' }}>
                        Dãy {item.id || String.fromCharCode(65 + index)} - Cược: {item.cost?.toLocaleString('vi-VN')}đ
                      </Text>
                      {isItemWinning && (
                        <View style={{ backgroundColor: '#E11D48', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>Trúng</Text>
                        </View>
                      )}
                    </View>

                    {(() => {
                      const rawNums = Array.isArray(item.numbers)
                        ? item.numbers
                        : (typeof item.numbers === 'string' ? [item.numbers] : []);
                      const maxInfo = parseMaxGameDigits(rawNums, ticket?.gameType, item.playType || ticket?.playType);
                      if (maxInfo) {
                        if (maxInfo.isSplit) {
                          return (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <View style={{ flexDirection: 'row', gap: 4 }}>
                                {maxInfo.set1.map((d: string, di: number) => {
                                  const isHit = itemEval.hitIndices?.has(di) ?? false;
                                  return (
                                    <View key={`modal-s1-${di}`} style={[styles.ticketBallCircle, isHit && styles.ticketBallCircleWinning]}>
                                      <Text style={styles.ticketBallCircleText}>{d}</Text>
                                    </View>
                                  );
                                })}
                              </View>
                              <View style={{ width: 1.5, height: 20, backgroundColor: '#D0D5DD', marginHorizontal: 2 }} />
                              <View style={{ flexDirection: 'row', gap: 4 }}>
                                {(maxInfo.set2 || []).map((d: string, di: number) => {
                                  const isHit = itemEval.hitIndices?.has(di + 3) ?? false;
                                  return (
                                    <View key={`modal-s2-${di}`} style={[styles.ticketBallCircle, isHit && styles.ticketBallCircleWinning]}>
                                      <Text style={styles.ticketBallCircleText}>{d}</Text>
                                    </View>
                                  );
                                })}
                              </View>
                              {isItemWinning && (
                                <Text style={{ color: '#E11D48', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                              )}
                            </View>
                          );
                        }

                        return (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            {maxInfo.set1.map((d: string, di: number) => {
                              const isHit = itemEval.hitIndices?.has(di) ?? false;
                              return (
                                <View key={`modal-d-${di}`} style={[styles.ticketBallCircle, isHit && styles.ticketBallCircleWinning]}>
                                  <Text style={styles.ticketBallCircleText}>{d}</Text>
                                </View>
                              );
                            })}
                            {isItemWinning && (
                              <Text style={{ color: '#E11D48', fontSize: 12, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                            )}
                          </View>
                        );
                      }

                      return isCombo ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                          <Text
                            style={{
                              fontSize: 16,
                              color: isItemWinning ? '#E11D48' : '#0F2942',
                              fontWeight: isItemWinning ? 'bold' : '600',
                            }}
                          >
                            {Array.isArray(item.numbers) ? item.numbers.join(' ') : String(item.numbers || '')}
                          </Text>
                          {isItemWinning && (
                            <Text style={{ color: '#E11D48', fontSize: 13, fontWeight: 'bold', marginLeft: 6 }}>
                              (Trúng)
                            </Text>
                          )}
                        </View>
                      ) : isDienToan123 && (item.numbers?.length === 6 || item.numbers?.length === 3) ? (
                        (() => {
                          const rawNums = item.numbers;
                          let b1 = '', b2 = '', b3 = '';
                          if (rawNums.length === 6) {
                            b1 = rawNums[0];
                            b2 = `${rawNums[1]}${rawNums[2]}`;
                            b3 = `${rawNums[3]}${rawNums[4]}${rawNums[5]}`;
                          } else {
                            b1 = rawNums[0];
                            b2 = rawNums[1];
                            b3 = rawNums[2];
                          }
                          const isB1Win = itemEval.hitIndices ? itemEval.hitIndices.has(0) : itemEval.hitNumbers?.has(b1);
                          const isB2Win = itemEval.hitIndices
                            ? (rawNums.length === 6 ? (itemEval.hitIndices.has(1) && itemEval.hitIndices.has(2)) : itemEval.hitIndices.has(1))
                            : itemEval.hitNumbers?.has(b2);
                          const isB3Win = itemEval.hitIndices
                            ? (rawNums.length === 6 ? (itemEval.hitIndices.has(3) && itemEval.hitIndices.has(4) && itemEval.hitIndices.has(5)) : itemEval.hitIndices.has(2))
                            : itemEval.hitNumbers?.has(b3);

                          const renderSet = (val: string, isWinSet: boolean) => (
                            <View
                              style={[
                                { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
                                isWinSet && { backgroundColor: '#FFF1F2', borderColor: '#FECDD3', borderWidth: 0.5 }
                              ]}
                            >
                              <Text
                                style={{
                                  fontSize: 16,
                                  color: isWinSet ? '#E11D48' : '#0F2942',
                                  fontWeight: isWinSet ? 'bold' : '600',
                                  letterSpacing: 0.5,
                                }}
                              >
                                {val}
                              </Text>
                            </View>
                          );

                          return (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              {renderSet(b1, Boolean(isB1Win))}
                              <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 8, fontSize: 14 }}>|</Text>
                              {renderSet(b2, Boolean(isB2Win))}
                              <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 8, fontSize: 14 }}>|</Text>
                              {renderSet(b3, Boolean(isB3Win))}
                            </View>
                          );
                        })()
                      ) : (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                          {item.numbers?.map((n: string, nIdx: number) => {
                            const evalRes = evaluateWinningCombo(n, ticket, winningNumbersList);
                            const isWinningCombo = (itemEval.hitIndices && itemEval.hitIndices.size > 0)
                              ? itemEval.hitIndices.has(nIdx)
                              : evalRes.isWinning;
                            const isMatrixGame = [
                              'dientoan_636', 'bao_636', 'mega_645', 'power_655', 'max_3d', 'max_3d_pro', 'max_4d',
                              'lotto_535', 'lotto_570', 'keno', 'bao_keno', 'clln_keno', 'bingo18', 'than_tai_4', 'dientoan_123'
                            ].includes((ticket?.gameType || '').toLowerCase());
                            return (
                              <View
                                key={nIdx}
                                style={[
                                  { flexDirection: 'row', alignItems: 'center' },
                                  isWinningCombo && { backgroundColor: '#FFF1F2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 0.5, borderColor: '#FECDD3' }
                                ]}
                              >
                                {renderHighlightedCombo(n, evalRes, isWinningCombo, 15)}
                                {isWinningCombo && !isMatrixGame && (
                                  <View style={{ backgroundColor: '#E11D48', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, marginLeft: 4 }}>
                                    <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>Trúng</Text>
                                  </View>
                                )}
                              </View>
                            );
                          })}
                          {(() => {
                            const itemSpecials = extractSpecialNumbers(item, ticket);
                            if (itemSpecials.length === 0) return null;
                            return (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}>
                                <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginRight: 6 }}>|</Text>
                                {itemSpecials.map((sn: string, si: number) => {
                                  const drawSpecial = winningNumbersList.length > 5 ? String(winningNumbersList[5]).trim().padStart(2, '0') : null;
                                  const isSpecialMatched = drawSpecial ? String(sn).trim().padStart(2, '0') === drawSpecial : false;
                                  return (
                                    <View
                                      key={`spec-${si}`}
                                      style={[
                                        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#FFF7ED', borderWidth: 0.5, borderColor: '#FDBA74', marginRight: 4 },
                                        isSpecialMatched && { backgroundColor: '#FFEDD5', borderColor: '#EA580C', borderWidth: 1 }
                                      ]}
                                    >
                                      <Text style={{ color: '#EA580C', fontWeight: 'bold', fontSize: 13 }}>
                                        ★ {sn}
                                      </Text>
                                    </View>
                                  );
                                })}
                              </View>
                            );
                          })()}
                        </View>
                      );
                    })()}
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
                const evalRes = evaluateWinningCombo(item, ticket, winningNumbersList);
                const isWinningCombo = evalRes.isWinning;
                return (
                  <View
                    style={[
                      {
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F0F0F0',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      },
                      isWinningCombo && {
                        backgroundColor: '#FFF1F2',
                        borderColor: '#FECDD3',
                        borderWidth: 1,
                        borderRadius: 8,
                        marginVertical: 3,
                      }
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
                      <Text style={{ width: 44, color: isWinningCombo ? '#E11D48' : '#7F8E9C', fontWeight: 'bold' }}>
                        #{index + 1}
                      </Text>
                      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap' }}>
                        {renderHighlightedCombo(item, evalRes, isWinningCombo, 16)}
                      </View>
                    </View>
                    {isWinningCombo && (
                      <View style={{ backgroundColor: '#E11D48', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>TRÚNG</Text>
                      </View>
                    )}
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
    marginRight: 8,
  },
  ticketNumbers: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  ticketNumText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A3B7C',
  },
  ticketBallCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0115F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketBallCircleWinning: {
    backgroundColor: '#E11D48',
    borderWidth: 1.5,
    borderColor: '#BE123C',
  },
  ticketBallCircleText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
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
  _ticketBallCircleWinning: {
    backgroundColor: '#E11D48',
  },


});
