import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Dimensions, NativeScrollEvent, NativeSyntheticEvent, Image } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { SPACING, BORDER_RADIUS } from '../theme/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_WIDTH = SCREEN_WIDTH - (SPACING.lg * 2);

export default function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { banners } = useAppStore();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / (CAROUSEL_WIDTH + 12));
    setActiveIndex(index);
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}
        decelerationRate="fast"
        snapToInterval={CAROUSEL_WIDTH + 12}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContentStyle}
      >
        {banners.map((banner, index) => {
          return (
            <View key={banner._id || index} style={styles.slide}>
              <Image 
                source={{ uri: banner.imageUrl }} 
                style={styles.image} 
                resizeMode="cover"
              />
            </View>
          );
        })}
      </ScrollView>

      {/* Dot Indicators */}
      <View style={styles.pagination}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              activeIndex === index ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.lg,
  },
  scrollContentStyle: {
    paddingHorizontal: SPACING.lg,
    paddingRight: SPACING.lg + 12,
  },
  slide: {
    width: CAROUSEL_WIDTH,
    height: 160,
    borderRadius: BORDER_RADIUS.xl,
    marginRight: 12,
    overflow: 'hidden',
    backgroundColor: '#e1e1e1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#E51F27',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#E0E0E0',
  },
});
