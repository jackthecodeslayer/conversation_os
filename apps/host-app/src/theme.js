// CVOS Design Tokens & Style Foundations
// Shared across the Mobile Host App (React Native)

export const THEME = {
  colors: {
    // Brand identity
    brandPrimary: '#0066FF',
    brandSecondary: '#FF8C42',
    brandDark: '#0A192F',
    
    // Backgrounds & Surface Hierarchy
    bgApp: '#F8FAFC',
    bgChat: '#F1F5F9',
    surfaceCard: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceMuted: '#F8FAFC',
    dockBg: '#E2E8F0',
    
    // Text
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',
    
    // Borders & Accents
    borderSubtle: '#E2E8F0',
    borderProminent: '#CBD5E1',
    borderActive: '#0066FF',
    
    // Status & Feedback
    success: '#10B981',
    successBg: '#ECFDF5',
    warning: '#F59E0B',
    warningBg: '#FFFBEB',
    danger: '#EF4444',
  },
  
  shadows: {
    soft: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    card: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    dock: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 8,
    },
    sheet: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
    }
  },
  
  radii: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 26,
    full: 9999,
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  }
};
