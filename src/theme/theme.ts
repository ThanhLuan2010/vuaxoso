export const COLORS = {
  primary: '#E51F27',      // Vietlott Red
  secondary: '#FF8A00',    // Vietlott Orange
  background: '#F6F7FA',   // Premium off-white back
  cardBackground: '#FFFFFF',
  textDark: '#1E2022',
  textLight: '#FFFFFF',
  textMuted: '#8F9BB3',
  border: '#EDF1F7',
  
  // Game branding colors
  keno: '#FF4D15',
  kenoBg: '#FFF2EE',
  power: '#D0021B',
  powerBg: '#FCE8EA',
  mega: '#004F9F',
  megaBg: '#E6EEF7',
  max3d: '#E0115F',
  max3dBg: '#FCE7F0',
  lotto: '#8B008B',
  lottoBg: '#F5E6F5',
  dienToan: '#FF9A00',
  dienToanBg: '#FFF8F0',
  
  // Regional lottery colors
  mienBac: '#7B2CBF',       // Royal Purple for Today/MB
  mienTrung: '#0096C7',     // Sky Blue
  mienNam: '#2D6A4F',       // Forest Green
  
  // Status colors
  success: '#00E096',
  warning: '#FFC94D',
  danger: '#FF3D71',
  info: '#0095FF',
  
  // Neutral colors
  gray100: '#F7F9FC',
  gray200: '#EDF1F7',
  gray300: '#E4E9F2',
  gray400: '#C5CEE0',
  gray500: '#8F9BB3',
  gray600: '#2E3A59',
  
  // Shadow and opacity colors
  shadow: 'rgba(46, 58, 89, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1.5,
    shadowRadius: 16,
    elevation: 6,
  },
  dark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};
