import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

export default function ThemeSettingsScreen() {
  const { theme, themeMode, setThemeMode, isDark } = useThemeContext();

  const themeOptions = [
    {
      id: 'light' as const,
      title: 'Light Theme',
      subtitle: 'Clean and bright interface',
      icon: 'sunny',
      description: 'Perfect for daytime use with high contrast',
    },
    {
      id: 'dark' as const,
      title: 'Dark Theme',
      subtitle: 'Easy on the eyes',
      icon: 'moon',
      description: 'Reduces eye strain in low-light conditions',
    },
    {
      id: 'system' as const,
      title: 'System Default',
      subtitle: 'Follows your device settings',
      icon: 'settings',
      description: 'Automatically switches based on your device theme',
    },
  ];

  const themeFeatures = [
    {
      title: 'Auto-switch',
      description: 'Automatically change theme based on time of day',
      icon: 'time',
      enabled: false,
    },
    {
      title: 'High Contrast',
      description: 'Enhanced contrast for better readability',
      icon: 'contrast',
      enabled: false,
    },
    {
      title: 'Reduced Motion',
      description: 'Minimize animations for accessibility',
      icon: 'accessibility',
      enabled: false,
    },
  ];

  const handleThemeChange = async (newMode: 'light' | 'dark' | 'system') => {
    await setThemeMode(newMode);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Theme Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Theme Preview */}
        <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.previewTitle, { color: theme.text }]}>
            Current Theme Preview
          </Text>
          <View style={styles.previewContent}>
            <View style={[styles.previewItem, { backgroundColor: theme.background }]}>
              <Ionicons name="home" size={20} color={theme.primary} />
              <Text style={[styles.previewText, { color: theme.text }]}>
                Sample content
              </Text>
            </View>
            <View style={[styles.previewButton, { backgroundColor: theme.primary }]}>
              <Text style={[styles.previewButtonText, { color: theme.buttonText }]}>
                Sample Button
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Options */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Choose Theme
          </Text>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.themeOption,
                { 
                  backgroundColor: theme.card, 
                  borderColor: themeMode === option.id ? theme.primary : theme.border 
                }
              ]}
              onPress={() => handleThemeChange(option.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View style={[
                  styles.optionIcon, 
                  { backgroundColor: theme.primary + '20' }
                ]}>
                  <Ionicons name={option.icon as any} size={24} color={theme.primary} />
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionTitle, { color: theme.text }]}>
                    {option.title}
                  </Text>
                  <Text style={[styles.optionSubtitle, { color: theme.textSecondary }]}>
                    {option.subtitle}
                  </Text>
                  <Text style={[styles.optionDescription, { color: theme.textMuted }]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              {themeMode === option.id && (
                <View style={[styles.selectedIndicator, { backgroundColor: theme.primary }]}>
                  <Ionicons name="checkmark" size={16} color={theme.buttonText} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Theme Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Theme Features
          </Text>
          <View style={[styles.featuresCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {themeFeatures.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureLeft}>
                  <View style={[styles.featureIcon, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name={feature.icon as any} size={20} color={theme.primary} />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={[styles.featureTitle, { color: theme.text }]}>
                      {feature.title}
                    </Text>
                    <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={feature.enabled}
                  onValueChange={() => {}}
                  trackColor={{ false: theme.border, true: theme.primary + '40' }}
                  thumbColor={feature.enabled ? theme.primary : theme.textMuted}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Theme Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="information-circle" size={24} color={theme.info} />
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            Theme Information
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Your theme preference is automatically saved and will be applied across all app sessions. 
            The system theme option will follow your device's appearance settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  previewCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  previewContent: {
    gap: 12,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewText: {
    fontSize: 14,
  },
  previewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  previewButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuresCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 