import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/types';

type GuideDetailRouteProp = RouteProp<RootStackParamList, 'GuideDetail'>;

export default function GuideDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<GuideDetailRouteProp>();
  const { title, content } = route.params || { title: 'Hướng dẫn', content: '' };
  const { width } = useWindowDimensions();

  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
      <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
        <ChevronLeft size={24} color={COLORS.textDark} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerBtn} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      {renderHeader()}
      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {content ? (
            <RenderHtml
              contentWidth={width - 48} // 24px padding on each side approx
              source={{ html: content }}
              tagsStyles={{
                body: { color: '#495057', fontSize: 15, lineHeight: 24 },
                p: { marginVertical: 4 },
                h2: { marginTop: 16, marginBottom: 8, fontSize: 18, fontWeight: 'bold', color: '#0A3B7C' },
                h3: { marginTop: 16, marginBottom: 8, fontSize: 16, fontWeight: 'bold', color: '#0A3B7C' },
              }}
            />
          ) : (
            <Text style={styles.bodyText}>
              Nội dung hướng dẫn chi tiết đang được cập nhật...
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerBtn: {
    padding: SPACING.xs,
    width: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F2942',
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  bodyText: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 24,
  },
});
