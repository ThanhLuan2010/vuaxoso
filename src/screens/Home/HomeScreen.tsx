import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import Header from '../../components/Header';
import BannerCarousel from '../../components/BannerCarousel';
import GameCard from '../../components/GameCard';
import KienThietMatrix from '../../components/KienThietMatrix';
import { COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '../../theme/theme';
import { useAppStore } from '../../store/useAppStore';
import { ShoppingCart } from 'lucide-react-native';

export default function HomeScreen({ navigation }: any) {
  const { cart, games, activeDraws, fetchGames, fetchActiveDraws, fetchDrawResults, fetchBanners, fetchKienThietSchedule } = useAppStore();
  const cartCount = cart.length;

  useEffect(() => {
    fetchGames();
    fetchActiveDraws();
    fetchDrawResults();
    fetchBanners();
    fetchKienThietSchedule();
  }, []);

  const vietlottGames = games.filter(g => g.type === 'vietlott' && g.code !== 'max_3d_pro' && g.code !== 'mua_chung' && g.code !== 'lotto_535');
  const dientoanGames = games.filter(g => g.type === 'dientoan');
  const lodeGames = games.filter(g => g.code === 'lotto_535');

  const getActiveDraw = (code: string) => {
    return activeDraws.find(d => d.game && d.game.code === code);
  };

  const handleGamePress = (gameId: string) => {
    if (gameId === 'mua_chung') {
      navigation.navigate('CoBuy');
      return;
    }
    // Determine layout mapping
    if (
      gameId === 'keno' || 
      gameId === 'bao_keno' || 
      gameId === 'power_655' || 
      gameId === 'mega_645' || 
      gameId === 'max_3d' ||
      gameId === 'loto_235' ||
      gameId === 'loto_cap' ||
      gameId === 'dientoan_636' ||
      gameId === 'truot_loto' ||
      gameId === 'bao_636' ||
      gameId === 'than_tai_4'
    ) {
      if (gameId === 'bao_keno') {
        navigation.navigate('GameLayoutA', { gameId: 'keno', initialTab: 'bao' });
      } else if (gameId === 'bao_636') {
        navigation.navigate('GameLayoutA', { gameId: 'dientoan_636', initialTab: 'Bao 6x36' });
      } else {
        navigation.navigate('GameLayoutA', { gameId });
      }
    } else if (gameId === 'lotto_535') {
      navigation.navigate('GameLayoutLode', { gameId });
    } else {
      navigation.navigate('GameLayoutB', { gameId });
    }
  };

  return (
    <View style={styles.safeArea}>
      <Header />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* SECTION 1: VIETLOTT */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>VIETLOTT</Text>
          </View>

          {/* Grid 3x2 */}
          <View style={styles.grid}>
            {vietlottGames.map((item) => (
              <View key={item._id} style={styles.gridItem}>
                <GameCard 
                  item={item} 
                  activeDraw={getActiveDraw(item.code)}
                  onPress={() => handleGamePress(item.code)} 
                />
              </View>
            ))}
          </View>


        </View>

        {/* SECTION 2: ĐIỆN TOÁN */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ĐIỆN TOÁN</Text>
          </View>

          {/* Grid 3x2 */}
          <View style={styles.grid}>
            {dientoanGames.map((item) => (
              <View key={item._id} style={styles.gridItem}>
                <GameCard 
                  item={item} 
                  activeDraw={getActiveDraw(item.code)}
                  onPress={() => handleGamePress(item.code)} 
                />
              </View>
            ))}
          </View>
        </View>

        {/* SECTION 2.5: XỔ SỐ 3 MIỀN (LÔ ĐỀ) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>XỔ SỐ 3 MIỀN</Text>
          </View>
          <View style={styles.grid}>
            {lodeGames.map((item) => (
              <View key={item._id} style={{ width: '100%', padding: 4 }}>
                <GameCard 
                  item={item} 
                  activeDraw={getActiveDraw(item.code)}
                  onPress={() => handleGamePress(item.code)} 
                  isHorizontal={true}
                />
              </View>
            ))}
          </View>
        </View>

        {/* SECTION 3: KIẾN THIẾT */}
        <View style={[styles.section, { marginBottom: SPACING.xxl }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>KIẾN THIẾT</Text>
          </View>

          <KienThietMatrix />
        </View>
      </ScrollView>

      {/* Floating Shopping Cart Button */}
      {cartCount > 0 && (
        <TouchableOpacity 
          style={styles.floatingCart}
          onPress={() => navigation.navigate('Cart')}
        >
          <ShoppingCart size={24} color={COLORS.textLight} />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 80, // Space for tabbar and padding
  },
  section: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F2942',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  gridItem: {
    width: '33.33%',
    padding: 4,
  },
  horizontalCardWrapper: {
    marginTop: SPACING.sm,
  },
  floatingCart: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.dark,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.secondary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.textLight,
  },
  cartBadgeText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
