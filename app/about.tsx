import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

export default function AboutScreen() {
  const { theme } = useThemeContext();

  const appInfo = {
    name: 'GramFinance',
    version: '1.0.0',
    build: '2024.1.0',
    description: 'Village Lending Management System',
    developer: 'GramFinance Team',
    website: 'https://gramfinance.com',
    email: 'support@gramfinance.com',
    phone: '+91 98765 43210',
  };

  const features = [
    {
      title: 'Loan Management',
      description: 'Complete loan lifecycle management',
      icon: 'card',
    },
    {
      title: 'Collection Tracking',
      description: 'Real-time collection monitoring',
      icon: 'cash',
    },
    {
      title: 'Field Operations',
      description: 'Mobile-first field collection',
      icon: 'location',
    },
    {
      title: 'Biometric Security',
      description: 'Secure fingerprint authentication',
      icon: 'finger-print',
    },
    {
      title: 'Offline Support',
      description: 'Work without internet connection',
      icon: 'cloud-offline',
    },
    {
      title: 'GPS Tracking',
      description: 'Location-based field operations',
      icon: 'navigate',
    },
  ];

  const contactMethods = [
    {
      title: 'Email Support',
      subtitle: appInfo.email,
      icon: 'mail',
      action: () => Linking.openURL(`mailto:${appInfo.email}`),
    },
    {
      title: 'Phone Support',
      subtitle: appInfo.phone,
      icon: 'call',
      action: () => Linking.openURL(`tel:${appInfo.phone}`),
    },
    {
      title: 'Website',
      subtitle: appInfo.website,
      icon: 'globe',
      action: () => Linking.openURL(appInfo.website),
    },
  ];

  const legalLinks = [
    {
      title: 'Privacy Policy',
      icon: 'shield-checkmark',
      action: () => Alert.alert('Privacy Policy', 'Privacy policy content will be displayed here.'),
    },
    {
      title: 'Terms of Service',
      icon: 'document-text',
      action: () => Alert.alert('Terms of Service', 'Terms of service content will be displayed here.'),
    },
    {
      title: 'Data Usage',
      icon: 'analytics',
      action: () => Alert.alert('Data Usage', 'Information about how your data is used.'),
    },
  ];

  const handleShareApp = () => {
    Alert.alert(
      'Share App',
      'Share GramFinance with your colleagues',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => {
          Alert.alert('Success', 'App sharing feature coming soon!');
        }},
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate App',
      'Rate GramFinance on the app store',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rate', onPress: () => {
          Alert.alert('Success', 'Rating feature coming soon!');
        }},
      ]
    );
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
        <Text style={[styles.title, { color: theme.text }]}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Header */}
        <View style={[styles.appHeader, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.appIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="business" size={40} color={theme.buttonText} />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>
            {appInfo.name}
          </Text>
          <Text style={[styles.appVersion, { color: theme.textSecondary }]}>
            Version {appInfo.version} ({appInfo.build})
          </Text>
          <Text style={[styles.appDescription, { color: theme.textSecondary }]}>
            {appInfo.description}
          </Text>
        </View>

        {/* App Features */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Features
          </Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.featureIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name={feature.icon as any} size={24} color={theme.primary} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.text }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.textSecondary }]}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Contact & Support
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactItem}
                onPress={method.action}
                activeOpacity={0.7}
              >
                <View style={styles.contactLeft}>
                  <View style={[styles.contactIcon, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name={method.icon as any} size={20} color={theme.primary} />
                  </View>
                  <View style={styles.contactContent}>
                    <Text style={[styles.contactTitle, { color: theme.text }]}>
                      {method.title}
                    </Text>
                    <Text style={[styles.contactSubtitle, { color: theme.textSecondary }]}>
                      {method.subtitle}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Legal
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {legalLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.legalItem}
                onPress={link.action}
                activeOpacity={0.7}
              >
                <View style={styles.legalLeft}>
                  <View style={[styles.legalIcon, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name={link.icon as any} size={20} color={theme.primary} />
                  </View>
                  <Text style={[styles.legalTitle, { color: theme.text }]}>
                    {link.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={handleShareApp}
              activeOpacity={0.8}
            >
              <Ionicons name="share-social" size={20} color={theme.buttonText} />
              <Text style={[styles.actionButtonText, { color: theme.buttonText }]}>
                Share App
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={handleRateApp}
              activeOpacity={0.8}
            >
              <Ionicons name="star" size={20} color={theme.primary} />
              <Text style={[styles.actionButtonText, { color: theme.primary }]}>
                Rate App
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Developer Info */}
        <View style={[styles.developerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.developerTitle, { color: theme.text }]}>
            Developed by {appInfo.developer}
          </Text>
          <Text style={[styles.developerText, { color: theme.textSecondary }]}>
            Empowering village lending with modern technology
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
  appHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 16,
    textAlign: 'center',
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
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 14,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  legalLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  developerCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  developerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  developerText: {
    fontSize: 14,
    textAlign: 'center',
  },
}); 