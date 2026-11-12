import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Timer } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme/theme';
import { styles } from '../historyStyles';

interface HistoryTicketCardProps {
  ticket: any;
  index: number;
  prevTicket?: any;
}

const getDateGroupLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  return `Ngày ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

export default function HistoryTicketCard({ ticket, index, prevTicket }: HistoryTicketCardProps) {
  const navigation = useNavigation<any>();

  const isKienThiet = ticket.gameType?.startsWith('kienthiet');
  const isLode = ['xoso_3mien', 'lode', 'MB', 'MT', 'MN', 'mb', 'mt', 'mn', 'lode_3mien'].includes(ticket.gameType);
  let ticketTypeStr = ticket.gameType ? ticket.gameType.toUpperCase() : 'VÉ SỐ';
  if (isKienThiet) {
    const parts = ticket.gameType.split('_');
    ticketTypeStr = parts[1] ? `K.THIẾT ${parts[1].toUpperCase()}` : 'KIẾN THIẾT';
  } else if (isLode) {
    if (['MB', 'mb'].includes(ticket.gameType)) {
      ticketTypeStr = 'LÔ ĐỀ MB';
    } else if (['MT', 'mt'].includes(ticket.gameType)) {
      ticketTypeStr = 'LÔ ĐỀ MT';
    } else if (['MN', 'mn'].includes(ticket.gameType)) {
      ticketTypeStr = 'LÔ ĐỀ MN';
    } else {
      ticketTypeStr = 'LÔ ĐỀ';
    }
  } else {
    switch (ticket.gameType) {
      case 'max_3d': ticketTypeStr = 'MAX 3D'; break;
      case 'max_4d': ticketTypeStr = 'MAX 4D'; break;
      case 'lotto_535': ticketTypeStr = 'LOTTO 5/35'; break;
      case 'lotto_570': ticketTypeStr = 'LOTTO 5/70'; break;
      case 'loto_235': ticketTypeStr = 'LÔ TÔ 235'; break;
      case 'loto_cap': ticketTypeStr = 'LÔ TÔ CẶP'; break;
      case 'than_tai_4': ticketTypeStr = 'THẦN TÀI 4'; break;
      case 'dientoan_636': ticketTypeStr = 'ĐIỆN TOÁN 636'; break;
      default: ticketTypeStr = ticket.gameType ? ticket.gameType.replace(/_/g, ' ').toUpperCase() : 'VÉ SỐ'; break;
    }
  }

  const isWinning = ticket.isWinner === true || (ticket.prizeAmount != null && Number(ticket.prizeAmount) > 0);
  const formattedPrice = (ticket.totalCost || 0).toLocaleString('vi-VN') + 'đ';
  const dateObj = new Date(ticket.createdAt || Date.now());
  const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:${String(dateObj.getSeconds()).padStart(2, '0')} - ${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;

  // Date grouping header check
  const currentGroup = getDateGroupLabel(ticket.createdAt);
  const prevGroup = prevTicket ? getDateGroupLabel(prevTicket.createdAt) : null;
  const showDateHeader = currentGroup !== prevGroup;

  return (
    <View key={ticket._id || index}>
      {showDateHeader && <Text style={styles.groupTitle}>{currentGroup}</Text>}

      <TouchableOpacity
        style={[styles.ticketCard, isWinning && styles.ticketCardWinning]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('HistoryDetail', { ticket })}
      >
        <View style={[styles.ticketLeft, isWinning && styles.ticketLeftWinning]}>
          <Text style={[styles.ticketType, isWinning && { color: '#E11D48' }]}>{ticketTypeStr}</Text>
          {isWinning && (
            <View style={styles.winPill}>
              <Text style={styles.winPillText}>THẮNG</Text>
            </View>
          )}
        </View>

        {/* Dotted border line */}
        <View style={styles.ticketDivider}>
          <View style={[styles.dottedLine, isWinning && { borderColor: '#FECDD3' }]} />
          <View style={[styles.halfCircleTop, isWinning && { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' }]} />
          <View
            style={[styles.halfCircleBottom, isWinning && { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' }]}
          />
        </View>

        <View style={styles.ticketRight}>
          <View style={styles.ticketHeaderRow}>
            <Text style={styles.ticketIdLabel} numberOfLines={1} ellipsizeMode="tail">
              Mã đơn:<Text style={styles.ticketIdVal}> {ticket.orderId}</Text>
            </Text>
            {isWinning && (
              <View style={styles.winningBadge}>
                <Text style={styles.winningBadgeText}>TRÚNG THƯỞNG</Text>
              </View>
            )}
          </View>

          {ticket.playType ? (
            <View style={styles.playTypeContainer}>
              <Text style={styles.playTypeLabel}>
                Cách chơi: <Text style={styles.playTypeVal}>{ticket.playType}</Text>
              </Text>
              {ticket.provinceName ? (
                <Text style={styles.provinceNameText}>({ticket.provinceName})</Text>
              ) : null}
            </View>
          ) : null}

          {ticket.items && ticket.items.length > 0 ? (
            <>
              {ticket.items.slice(0, 3).map((item: any, idx: number) => {
                const hasMoreNumbers = item.numbers && item.numbers.length > 10;
                const displayNumbers = hasMoreNumbers ? item.numbers.slice(0, 10) : item.numbers || [];
                return (
                  <View key={idx} style={styles.ticketBallsRow}>
                    <Text style={styles.ticketRowLabel}>{item.id || String.fromCharCode(65 + idx)}</Text>
                    {displayNumbers.map((n: string, i: number) => (
                      <View key={i} style={[styles.ticketBall, isWinning && styles.ticketBallWinning]}>
                        <Text style={styles.ticketBallText}>{n}</Text>
                      </View>
                    ))}
                    {hasMoreNumbers && (
                      <TouchableOpacity
                        style={styles.moreBallBtn}
                        onPress={() => navigation.navigate('HistoryDetail', { ticket })}
                      >
                        <Text style={styles.moreBallText}>+{item.numbers.length - 10} Xem thêm</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              {ticket.items.length > 3 && (
                <Text style={{ fontSize: 13, color: '#0066FF', marginBottom: 8, fontStyle: 'italic' }}>
                  + {ticket.items.length - 3} dãy số khác (xem chi tiết)
                </Text>
              )}
            </>
          ) : (
            <View style={styles.ticketBallsRow}>
              <Text style={styles.ticketRowLabel}>A</Text>
              {(ticket.numbers && ticket.numbers.length > 10
                ? ticket.numbers.slice(0, 10)
                : ticket.numbers || []
              ).map((n: string, i: number) => (
                <View key={i} style={[styles.ticketBall, isWinning && styles.ticketBallWinning]}>
                  <Text style={styles.ticketBallText}>{n}</Text>
                </View>
              ))}
              {ticket.numbers && ticket.numbers.length > 10 && (
                <TouchableOpacity
                  style={styles.moreBallBtn}
                  onPress={() => navigation.navigate('HistoryDetail', { ticket })}
                >
                  <Text style={styles.moreBallText}>+{ticket.numbers.length - 10} Xem thêm</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {(() => {
            const rawCode = ticket.drawCode || ticket.draw?.drawCode || (ticket.drawId && ticket.drawId !== ticket.drawDate && !ticket.drawId.match(/^[0-9a-f]{24}$/i) ? ticket.drawId : '');
            const drawCodeStr = rawCode ? (String(rawCode).startsWith('#') ? rawCode : `#${rawCode}`) : '';
            return (
              <Text style={styles.ticketKy}>
                Kỳ QSMT:{' '}
                {ticket.drawDate
                  ? (drawCodeStr ? `${ticket.drawDate} (${drawCodeStr})` : ticket.drawDate)
                  : (drawCodeStr || ticket.drawId || 'Đang cập nhật')}
              </Text>
            );
          })()}

          <View style={styles.ticketBottomRow}>
            <View style={styles.timeRow}>
              <Timer size={14} color={isWinning ? '#E11D48' : COLORS.gray500} />
              <Text style={[styles.timeText, isWinning && { color: '#BE123C' }]}>{timeStr}</Text>
            </View>
            {isWinning && ticket.prizeAmount && Number(ticket.prizeAmount) > 0 ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.winningPrizeText}>
                  +{Number(ticket.prizeAmount).toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.originalPriceSub}>{formattedPrice}</Text>
              </View>
            ) : (
              <Text style={styles.priceText}>{formattedPrice}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

