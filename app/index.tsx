import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme } = useThemeContext();

  useEffect(() => {
    console.log('Index: Auth state changed:', { isAuthenticated, isLoading, user });
    if (!isLoading) {
      if (isAuthenticated) {
        console.log('Index: User authenticated, navigating to dashboard...');
        router.replace('/(tabs)');
      } else {
        console.log('Index: User not authenticated, navigating to login...');
        router.replace('/login' as any);
      }
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.background 
    }}>
      <ActivityIndicator size="large" color={theme.primary} />
    </View>
  );
} 