
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
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Trophy, X } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import api from '../../services/api';

export default function HistoryDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { ticket: initialTicket, orderId } = route.params as any;
  
  const [ticket, setTicket] = useState<any>(initialTicket);
  const [loading, setLoading] = useState(!initialTicket);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [allNumbersModalVisible, setAllNumbersModalVisible] = useState(false);
  const [allItemsModalVisible, setAllItemsModalVisible] = useState(false);

  useEffect(() => {
    if (!initialTicket && orderId) {
      // Find the object id based on the order ID.
      // Wait, in Notification screen, it passes item.orderId which might be the DB _id or the display string 'ORD_...'.
      // If it's the MongoDB _id, the API /api/orders/:id expects the MongoDB _id.
      api.get(`/orders/${orderId}`)
        .then(res => {
          setTicket(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [initialTicket, orderId]);

  if (loading || !ticket) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isKienThiet = ticket?.gameType?.startsWith('kienthiet');
  const ticketTypeStr = isKienThiet ? 'KIẾN THIẾT' : (ticket?.gameType ? ticket.gameType.toUpperCase() : 'GAME');
  const statusStr = ticket?.status === 'pending' ? 'Chờ in' : (ticket?.status === 'completed' ? 'Hoàn thành' : 'Đã huỷ');
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

  const imageUrl = ticket?.ticketImageUrl ? { uri: getImageUrl(ticket.ticketImageUrl) } : require('../../assets/images/mock_ticket.jpg');

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
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.logoText}>{ticketTypeStr}</Text>
            <Text style={styles.statusText}>{statusStr}</Text>
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
                        <Text style={[styles.ticketNumText, { color: '#0084FA', fontWeight: 'bold' }]}>+{item.numbers.length - 10}</Text>
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
                {ticket.numbers?.map((n: string, i: number) => {
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
            <Text style={styles.infoValue}>{ticket?.drawId || 'Đang cập nhật'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thanh toán:</Text>
            <Text style={styles.infoValueBold}>{formattedPrice}</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trúng thưởng:</Text>
            <View style={styles.prizeRow}>
              <Trophy size={16} color="#FF5C00" />
              <Text style={styles.prizeText}>{prizeAmount}</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {ticket?.status === 'completed' && (
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
          )}
        </View>
      </ScrollView>
      <Modal visible={imageViewerVisible} transparent={true} animationType="fade" onRequestClose={() => setImageViewerVisible(false)}>
        <View style={{flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity style={{position: 'absolute', top: Math.max(insets.top, 20), right: 20, zIndex: 10}} onPress={() => setImageViewerVisible(false)}>
            <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold', padding: 10}}>ĐÓNG</Text>
          </TouchableOpacity>
          <Image source={imageUrl} style={{width: '95%', height: '80%'}} resizeMode="contain" />
        </View>
      </Modal>

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
});
