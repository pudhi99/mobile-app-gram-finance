import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useThemeContext } from '@/contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, themeMode, setThemeMode, isDark } = useThemeContext();
  
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  const handleThemeChange = async (newMode: 'light' | 'dark' | 'system') => {
    // Animate the button
    scale.value = withSpring(0.9, { duration: 100 });
    rotation.value = withTiming(rotation.value + 180, { duration: 300 });
    
    setTimeout(() => {
      scale.value = withSpring(1);
    }, 100);

    await setThemeMode(newMode);
  };

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return 'sunny';
      case 'dark':
        return 'moon';
      case 'system':
        return isDark ? 'moon' : 'sunny';
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'Auto';
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.themeButton, { backgroundColor: theme.card, borderColor: theme.border }]}
        onPress={() => {
          const modes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
          const currentIndex = modes.indexOf(themeMode);
          const nextIndex = (currentIndex + 1) % modes.length;
          handleThemeChange(modes[nextIndex]);
        }}
        activeOpacity={0.8}
      >
        <Animated.View style={animatedStyle}>
          <Ionicons 
            name={getThemeIcon() as any} 
            size={20} 
            color={theme.primary} 
          />
        </Animated.View>
        <Text style={[styles.themeLabel, { color: theme.textSecondary }]}>
          {getThemeLabel()}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginLeft: 8,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
}); 