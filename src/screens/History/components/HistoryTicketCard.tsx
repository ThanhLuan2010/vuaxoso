import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Timer } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../../theme/theme';
import { styles } from '../historyStyles';
import { evaluateWinningCombo, parseWinningNumbers, evaluateItemCombo, parseMaxGameDigits, calculateTicketWinningStatus } from '../../../utils/lotteryResultHelper';

interface HistoryTicketCardProps {
  ticket: any;
  index: number;
  prevTicket?: any;
}

const getDateGroupLabel = (dateStr: string) => {
  const date = new Date(dateStr);
  return `Ngày ${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

const getCardSpecialNumbers = (itemObj: any, ticketObj: any): string[] => {
  const raw = itemObj?.specialNumbers ?? itemObj?.special_numbers ?? ticketObj?.specialNumbers ?? ticketObj?.special_numbers;
  if (Array.isArray(raw)) return raw.map((s: any) => String(s).trim()).filter(Boolean);
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((s: any) => String(s).trim()).filter(Boolean);
    } catch {}
    return raw.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
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
      case 'max_3d_pro': ticketTypeStr = 'MAX 3D PRO'; break;
      case 'max_3d_plus': ticketTypeStr = 'MAX 3D+'; break;
      case 'max_4d': ticketTypeStr = 'MAX 4D'; break;
      case 'lotto_535': ticketTypeStr = 'LOTTO 5/35'; break;
      case 'lotto_570': ticketTypeStr = 'LOTTO 5/70'; break;
      case 'loto_235': ticketTypeStr = 'LÔ TÔ 235'; break;
      case 'loto_cap': ticketTypeStr = 'LÔ TÔ CẶP'; break;
      case 'than_tai_4': ticketTypeStr = 'THẦN TÀI 4'; break;
      case 'dientoan_123': ticketTypeStr = 'ĐIỆN TOÁN 1-2-3'; break;
      case 'dientoan_636': ticketTypeStr = 'ĐIỆN TOÁN 636'; break;
      default: ticketTypeStr = ticket.gameType ? ticket.gameType.replace(/_/g, ' ').toUpperCase() : 'VÉ SỐ'; break;
    }
  }

  const rawWins = parseWinningNumbers(ticket.winningNumbers || ticket.draw?.winningNumbers);
  const ticketWinningStatus = calculateTicketWinningStatus(ticket, rawWins);
  const isWinning = ticketWinningStatus.isWinning;
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

          {(() => {
            const rawWins = parseWinningNumbers(ticket.winningNumbers || ticket.draw?.winningNumbers);
            return ticket.items && ticket.items.length > 0 ? (
              <>
                {ticket.items.slice(0, 3).map((item: any, idx: number) => {
                  const itemEval = evaluateItemCombo(item, ticket, rawWins);
                  const isCombo = itemEval.isComboBet;
                  const isItemWinning = isWinning && itemEval.isWinning;
                  const rawItemNums: string[] = Array.isArray(item.numbers)
                    ? item.numbers
                    : (typeof item.numbers === 'string' ? [item.numbers] : []);
                  const hasEmbeddedAmp = rawItemNums.some((n: string) => n.includes('&'));
                  const hasMoreNumbers = rawItemNums.length > 10;
                  const displayNumbers = hasMoreNumbers ? rawItemNums.slice(0, 10) : rawItemNums;

                  return (
                    <View
                      key={idx}
                      style={[
                        styles.ticketBallsRow,
                        isItemWinning && {
                          backgroundColor: '#FFF1F2',
                          borderRadius: 6,
                          paddingHorizontal: 4,
                          paddingVertical: 2,
                          marginVertical: 1,
                        }
                      ]}
                    >
                      <Text style={[styles.ticketRowLabel, isItemWinning && { color: '#E11D48', fontWeight: 'bold' }]}>
                        {item.id || String.fromCharCode(65 + idx)}
                      </Text>

                      {(() => {
                        const maxInfo = parseMaxGameDigits(rawItemNums, ticket.gameType, item.playType || ticket.playType);
                        if (maxInfo) {
                          if (maxInfo.isSplit) {
                            return (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <View style={{ flexDirection: 'row', gap: 4 }}>
                                  {maxInfo.set1.map((d: string, di: number) => {
                                    const isHit = itemEval.hitIndices?.has(di) ?? false;
                                    return (
                                      <View key={`s1-${di}`} style={[styles.ticketBall, isHit && styles.ticketBallWinning, { backgroundColor: isHit ? '#E11D48' : '#E0115F' }]}>
                                        <Text style={[styles.ticketBallText, { color: '#FFF', fontWeight: 'bold' }]}>{d}</Text>
                                      </View>
                                    );
                                  })}
                                </View>
                                <View style={{ width: 1.5, height: 18, backgroundColor: '#D0D5DD', marginHorizontal: 2 }} />
                                <View style={{ flexDirection: 'row', gap: 4 }}>
                                  {(maxInfo.set2 || []).map((d: string, di: number) => {
                                    const isHit = itemEval.hitIndices?.has(di + 3) ?? false;
                                    return (
                                      <View key={`s2-${di}`} style={[styles.ticketBall, isHit && styles.ticketBallWinning, { backgroundColor: isHit ? '#E11D48' : '#E0115F' }]}>
                                        <Text style={[styles.ticketBallText, { color: '#FFF', fontWeight: 'bold' }]}>{d}</Text>
                                      </View>
                                    );
                                  })}
                                </View>
                                {isItemWinning && (
                                  <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                                )}
                              </View>
                            );
                          }

                          return (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              {maxInfo.set1.map((d: string, di: number) => {
                                const isHit = itemEval.hitIndices?.has(di) ?? false;
                                return (
                                  <View key={`d-${di}`} style={[styles.ticketBall, isHit && styles.ticketBallWinning, { backgroundColor: isHit ? '#E11D48' : '#E0115F' }]}>
                                    <Text style={[styles.ticketBallText, { color: '#FFF', fontWeight: 'bold' }]}>{d}</Text>
                                  </View>
                                );
                              })}
                              {isItemWinning && (
                                <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                              )}
                            </View>
                          );
                        }

                        if (ticket.gameType === 'dientoan_123' && (rawItemNums.length === 6 || rawItemNums.length === 3)) {
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

                          return (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <View style={[styles.ticketBall, { minWidth: 26, paddingHorizontal: 4 }, isB1Win && styles.ticketBallWinning]}>
                                <Text style={[styles.ticketBallText, isB1Win && { color: '#FFF', fontWeight: 'bold' }]}>{b1}</Text>
                              </View>
                              <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 4, fontSize: 12 }}>|</Text>
                              <View style={[styles.ticketBall, { minWidth: 32, paddingHorizontal: 4 }, isB2Win && styles.ticketBallWinning]}>
                                <Text style={[styles.ticketBallText, isB2Win && { color: '#FFF', fontWeight: 'bold' }]}>{b2}</Text>
                              </View>
                              <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 4, fontSize: 12 }}>|</Text>
                              <View style={[styles.ticketBall, { minWidth: 38, paddingHorizontal: 4 }, isB3Win && styles.ticketBallWinning]}>
                                <Text style={[styles.ticketBallText, isB3Win && { color: '#FFF', fontWeight: 'bold' }]}>{b3}</Text>
                              </View>
                              {isItemWinning && (
                                <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                              )}
                            </View>
                          );
                        }

                        if (isCombo && !hasEmbeddedAmp && rawItemNums.length <= 10) {
                          return (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: isItemWinning ? '#E11D48' : '#0F2942',
                                  fontWeight: isItemWinning ? 'bold' : '600',
                                }}
                              >
                                {rawItemNums.join(' ')}
                              </Text>
                              {isItemWinning && (
                                <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold', marginLeft: 6 }}>
                                  (Trúng)
                                </Text>
                              )}
                            </View>
                          );
                        }

                        return (
                          <>
                            {displayNumbers.map((n: string, i: number) => {
                              const evalRes = evaluateWinningCombo(n, ticket, rawWins);
                              const isWinningNum = isWinning && (
                                (itemEval.hitIndices && itemEval.hitIndices.size > 0)
                                  ? itemEval.hitIndices.has(i)
                                  : evalRes.isWinning
                              );
                              const hasAmp = n.includes('&');
                              if (hasAmp) {
                                return (
                                  <View
                                    key={i}
                                    style={[
                                      { flexDirection: 'row', alignItems: 'center', marginRight: 4, marginBottom: 2 },
                                      isWinningNum && { backgroundColor: '#FFF1F2', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, borderWidth: 0.5, borderColor: '#FECDD3' }
                                    ]}
                                  >
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        color: isWinningNum ? '#E11D48' : '#0F2942',
                                        fontWeight: isWinningNum ? 'bold' : '500',
                                      }}
                                    >
                                      {n}
                                    </Text>
                                    {isWinningNum && (
                                      <Text style={{ color: '#E11D48', fontSize: 9, fontWeight: 'bold', marginLeft: 2 }}>(Trúng)</Text>
                                    )}
                                  </View>
                                );
                              }

                              return (
                                <View key={i} style={[styles.ticketBall, isWinningNum && styles.ticketBallWinning]}>
                                  <Text style={[styles.ticketBallText, isWinningNum && { color: '#FFF', fontWeight: 'bold' }]}>
                                    {n}
                                  </Text>
                                </View>
                              );
                            })}
                          </>
                        );
                      })()}

                      {(() => {
                        const itemSpecials = getCardSpecialNumbers(item, ticket);
                        if (itemSpecials.length === 0) return null;
                        const drawSpecial = rawWins.length > 5 ? String(rawWins[5]).trim().padStart(2, '0') : null;
                        return (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4, flexShrink: 0 }}>
                            <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginRight: 4 }}>|</Text>
                            {itemSpecials.map((sn: string, si: number) => {
                              const isSpecialMatched = drawSpecial ? String(sn).trim().padStart(2, '0') === drawSpecial : false;
                              return (
                                <View
                                  key={`spec-${si}`}
                                  style={[
                                    styles.ticketBall,
                                    { backgroundColor: '#FFF7ED', borderColor: '#FDBA74', borderWidth: 0.5 },
                                    isSpecialMatched && { backgroundColor: '#FF8A00', borderColor: '#FF8A00' }
                                  ]}
                                >
                                  <Text style={[styles.ticketBallText, { color: isSpecialMatched ? '#FFF' : '#EA580C', fontWeight: 'bold' }]}>
                                    {sn}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        );
                      })()}

                      {hasMoreNumbers && (
                        <View style={{ width: '100%', marginTop: 4 }}>
                          <TouchableOpacity
                            style={[styles.moreBallBtn, { alignSelf: 'flex-start', marginLeft: 0 }]}
                            onPress={() => navigation.navigate('HistoryDetail', { ticket })}
                          >
                            <Text style={styles.moreBallText}>+{rawItemNums.length - 10} Xem thêm</Text>
                          </TouchableOpacity>
                        </View>
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
                {(() => {
                  const rawTicketNums: string[] = Array.isArray(ticket.numbers)
                    ? ticket.numbers
                    : (typeof ticket.numbers === 'string' ? [ticket.numbers] : []);
                  const hasEmbeddedAmp = rawTicketNums.some((n: string) => n.includes('&'));
                  const itemEval = evaluateItemCombo({ numbers: ticket.numbers }, ticket, rawWins);
                  const isCombo = itemEval.isComboBet;
                  const isItemWinning = isWinning && itemEval.isWinning;
                  const hasMoreNumbers = rawTicketNums.length > 10;
                  const displayNumbers = hasMoreNumbers ? rawTicketNums.slice(0, 10) : rawTicketNums;

                  const maxInfo = parseMaxGameDigits(rawTicketNums, ticket.gameType, ticket.playType);
                  if (maxInfo) {
                    if (maxInfo.isSplit) {
                      return (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <View style={{ flexDirection: 'row', gap: 4 }}>
                            {maxInfo.set1.map((d: string, di: number) => {
                              const isHit = itemEval.hitIndices?.has(di) ?? false;
                              return (
                                <View key={`d1-${di}`} style={[styles.ticketBall, isHit && styles.ticketBallWinning, { backgroundColor: isHit ? '#E11D48' : '#E0115F' }]}>
                                  <Text style={[styles.ticketBallText, { color: '#FFF', fontWeight: 'bold' }]}>{d}</Text>
                                </View>
                              );
                            })}
                          </View>
                          <View style={{ width: 1.5, height: 18, backgroundColor: '#D0D5DD', marginHorizontal: 2 }} />
                          <View style={{ flexDirection: 'row', gap: 4 }}>
                            {(maxInfo.set2 || []).map((d: string, di: number) => {
                              const isHit = itemEval.hitIndices?.has(di + 3) ?? false;
                              return (
                                <View key={`d2-${di}`} style={[styles.ticketBall, isHit && styles.ticketBallWinning, { backgroundColor: isHit ? '#E11D48' : '#E0115F' }]}>
                                  <Text style={[styles.ticketBallText, { color: '#FFF', fontWeight: 'bold' }]}>{d}</Text>
                                </View>
                              );
                            })}
                          </View>
                          {isItemWinning && (
                            <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                          )}
                        </View>
                      );
                    }

                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        {maxInfo.set1.map((d: string, di: number) => {
                          const isHit = itemEval.hitIndices?.has(di) ?? false;
                          return (
                            <View key={`d-${di}`} style={[styles.ticketBall, isHit && styles.ticketBallWinning, { backgroundColor: isHit ? '#E11D48' : '#E0115F' }]}>
                              <Text style={[styles.ticketBallText, { color: '#FFF', fontWeight: 'bold' }]}>{d}</Text>
                            </View>
                          );
                        })}
                        {isItemWinning && (
                          <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                        )}
                      </View>
                    );
                  }

                  if (ticket.gameType === 'dientoan_123' && (rawTicketNums.length === 6 || rawTicketNums.length === 3)) {
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

                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.ticketBall, { minWidth: 26, paddingHorizontal: 4 }, isB1Win && styles.ticketBallWinning]}>
                          <Text style={[styles.ticketBallText, isB1Win && { color: '#FFF', fontWeight: 'bold' }]}>{b1}</Text>
                        </View>
                        <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 4, fontSize: 12 }}>|</Text>
                        <View style={[styles.ticketBall, { minWidth: 32, paddingHorizontal: 4 }, isB2Win && styles.ticketBallWinning]}>
                          <Text style={[styles.ticketBallText, isB2Win && { color: '#FFF', fontWeight: 'bold' }]}>{b2}</Text>
                        </View>
                        <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginHorizontal: 4, fontSize: 12 }}>|</Text>
                        <View style={[styles.ticketBall, { minWidth: 38, paddingHorizontal: 4 }, isB3Win && styles.ticketBallWinning]}>
                          <Text style={[styles.ticketBallText, isB3Win && { color: '#FFF', fontWeight: 'bold' }]}>{b3}</Text>
                        </View>
                        {isItemWinning && (
                          <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold', marginLeft: 4 }}>(Trúng)</Text>
                        )}
                      </View>
                    );
                  }

                  if (isCombo && !hasEmbeddedAmp && rawTicketNums.length <= 10) {
                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                          style={{
                            fontSize: 14,
                            color: isItemWinning ? '#E11D48' : '#0F2942',
                            fontWeight: isItemWinning ? 'bold' : '600',
                          }}
                        >
                          {rawTicketNums.join(' ')}
                        </Text>
                        {isItemWinning && (
                          <Text style={{ color: '#E11D48', fontSize: 11, fontWeight: 'bold', marginLeft: 6 }}>
                            (Trúng)
                          </Text>
                        )}
                      </View>
                    );
                  }

                  return (
                    <>
                      {displayNumbers.map((n: string, i: number) => {
                        const evalRes = evaluateWinningCombo(n, ticket, rawWins);
                        const isWinningNum = isWinning && (
                          (itemEval.hitIndices && itemEval.hitIndices.size > 0)
                            ? itemEval.hitIndices.has(i)
                            : evalRes.isWinning
                        );
                        const hasAmp = n.includes('&');
                        if (hasAmp) {
                          return (
                            <View
                              key={i}
                              style={[
                                { flexDirection: 'row', alignItems: 'center', marginRight: 4, marginBottom: 2 },
                                isWinningNum && { backgroundColor: '#FFF1F2', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, borderWidth: 0.5, borderColor: '#FECDD3' }
                              ]}
                            >
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: isWinningNum ? '#E11D48' : '#0F2942',
                                  fontWeight: isWinningNum ? 'bold' : '500',
                                }}
                              >
                                {n}
                              </Text>
                              {isWinningNum && (
                                <Text style={{ color: '#E11D48', fontSize: 9, fontWeight: 'bold', marginLeft: 2 }}>(Trúng)</Text>
                              )}
                            </View>
                          );
                        }

                        return (
                          <View key={i} style={[styles.ticketBall, isWinningNum && styles.ticketBallWinning]}>
                            <Text style={[styles.ticketBallText, isWinningNum && { color: '#FFF', fontWeight: 'bold' }]}>
                              {n}
                            </Text>
                          </View>
                        );
                      })}
                      {(() => {
                        const ticketSpecials = getCardSpecialNumbers(null, ticket);
                        if (ticketSpecials.length === 0) return null;
                        const drawSpecial = rawWins.length > 5 ? String(rawWins[5]).trim().padStart(2, '0') : null;
                        return (
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4, flexShrink: 0 }}>
                            <Text style={{ color: '#94A3B8', fontWeight: 'bold', marginRight: 4 }}>|</Text>
                            {ticketSpecials.map((sn: string, si: number) => {
                              const isSpecialMatched = drawSpecial ? String(sn).trim().padStart(2, '0') === drawSpecial : false;
                              return (
                                <View
                                  key={`spec-${si}`}
                                  style={[
                                    styles.ticketBall,
                                    { backgroundColor: '#FFF7ED', borderColor: '#FDBA74', borderWidth: 0.5 },
                                    isSpecialMatched && { backgroundColor: '#FF8A00', borderColor: '#FF8A00' }
                                  ]}
                                >
                                  <Text style={[styles.ticketBallText, { color: isSpecialMatched ? '#FFF' : '#EA580C', fontWeight: 'bold' }]}>
                                    {sn}
                                  </Text>
                                </View>
                              );
                            })}
                          </View>
                        );
                      })()}
                      {hasMoreNumbers && (
                        <View style={{ width: '100%', marginTop: 4 }}>
                          <TouchableOpacity
                            style={[styles.moreBallBtn, { alignSelf: 'flex-start', marginLeft: 0 }]}
                            onPress={() => navigation.navigate('HistoryDetail', { ticket })}
                          >
                            <Text style={styles.moreBallText}>+{rawTicketNums.length - 10} Xem thêm</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  );
                })()}
              </View>
            );
          })()}

          {(() => {
            const rawCode = ticket.drawCode || ticket.draw?.drawCode || (ticket.drawId && ticket.drawId !== ticket.drawDate && !ticket.drawId.match(/^[0-9a-f]{24}$/i) ? ticket.drawId : '');
            const cleanCode = rawCode ? String(rawCode).replace(/^#+/, '') : '';
            const drawCodeStr = cleanCode ? `#${cleanCode}` : '';
            let cleanDrawDate = ticket.drawDate ? String(ticket.drawDate).replace(/#+/g, '#') : '';

            let displayStr = 'Đang cập nhật';
            if (cleanDrawDate) {
              if (drawCodeStr && !cleanDrawDate.includes(drawCodeStr) && !cleanDrawDate.includes(cleanCode)) {
                displayStr = `${cleanDrawDate} (${drawCodeStr})`;
              } else {
                displayStr = cleanDrawDate;
              }
            } else if (drawCodeStr) {
              displayStr = drawCodeStr;
            } else if (ticket.drawId) {
              displayStr = ticket.drawId;
            }

            return (
              <Text style={styles.ticketKy}>
                Kỳ QSMT: {displayStr}
              </Text>
            );
          })()}

          <View style={styles.ticketBottomRow}>
            <View style={styles.timeRow}>
              <Timer size={14} color={isWinning ? '#E11D48' : COLORS.gray500} />
              <Text style={[styles.timeText, isWinning && { color: '#BE123C' }]}>{timeStr}</Text>
            </View>
            {isWinning && ticketWinningStatus.prizeAmount > 0 ? (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.winningPrizeText}>
                  +{ticketWinningStatus.prizeAmount.toLocaleString('vi-VN')}đ
                </Text>
                <Text style={styles.originalPriceSub}>{formattedPrice}</Text>
              </View>
            ) : isWinning && ticket.prizeAmount && Number(ticket.prizeAmount) > 0 ? (
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

