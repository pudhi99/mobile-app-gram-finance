import { useColorScheme } from 'react-native';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Border and divider colors
  border: string;
  divider: string;
  
  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputPlaceholder: string;
  
  // Button colors
  buttonPrimary: string;
  buttonSecondary: string;
  buttonText: string;
  
  // Shadow colors
  shadow: string;
}

export const lightTheme: ThemeColors = {
  // Primary colors
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',
  
  // Background colors
  background: '#ffffff',
  surface: '#f8fafc',
  card: '#ffffff',
  
  // Text colors
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Border and divider colors
  border: '#e2e8f0',
  divider: '#f1f5f9',
  
  // Input colors
  inputBackground: '#ffffff',
  inputBorder: '#d1d5db',
  inputPlaceholder: '#9ca3af',
  
  // Button colors
  buttonPrimary: '#2563eb',
  buttonSecondary: '#f1f5f9',
  buttonText: '#ffffff',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkTheme: ThemeColors = {
  // Primary colors
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  primaryDark: '#2563eb',
  
  // Background colors
  background: '#0f172a',
  surface: '#1e293b',
  card: '#334155',
  
  // Text colors
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  
  // Status colors
  success: '#22c55e',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',
  
  // Border and divider colors
  border: '#475569',
  divider: '#334155',
  
  // Input colors
  inputBackground: '#1e293b',
  inputBorder: '#475569',
  inputPlaceholder: '#64748b',
  
  // Button colors
  buttonPrimary: '#3b82f6',
  buttonSecondary: '#475569',
  buttonText: '#ffffff',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.3)',
};

export const useTheme = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkTheme : lightTheme;
};

export const getTheme = (isDark: boolean) => {
  return isDark ? darkTheme : lightTheme;
}; 