import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const { theme } = useThemeContext();
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    loanUpdates: true,
    paymentReminders: true,
    collectionAlerts: true,
    systemUpdates: false,
    marketing: false,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00',
  });

  const handleToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const notificationCategories = [
    {
      title: 'Loan Management',
      items: [
        {
          key: 'loanUpdates' as keyof typeof notifications,
          title: 'Loan Updates',
          description: 'Get notified about loan status changes',
          icon: 'document-text',
        },
        {
          key: 'paymentReminders' as keyof typeof notifications,
          title: 'Payment Reminders',
          description: 'Receive reminders for upcoming payments',
          icon: 'calendar',
        },
        {
          key: 'collectionAlerts' as keyof typeof notifications,
          title: 'Collection Alerts',
          description: 'Alerts for overdue payments and collections',
          icon: 'alert-circle',
        },
      ],
    },
    {
      title: 'System & Marketing',
      items: [
        {
          key: 'systemUpdates' as keyof typeof notifications,
          title: 'System Updates',
          description: 'Important app updates and maintenance',
          icon: 'settings',
        },
        {
          key: 'marketing' as keyof typeof notifications,
          title: 'Marketing Messages',
          description: 'Promotional content and offers',
          icon: 'megaphone',
        },
      ],
    },
  ];

  const deliveryMethods = [
    {
      key: 'pushEnabled' as keyof typeof notifications,
      title: 'Push Notifications',
      description: 'Receive notifications on your device',
      icon: 'phone-portrait',
    },
    {
      key: 'emailEnabled' as keyof typeof notifications,
      title: 'Email Notifications',
      description: 'Get notifications via email',
      icon: 'mail',
    },
    {
      key: 'smsEnabled' as keyof typeof notifications,
      title: 'SMS Notifications',
      description: 'Receive text message notifications',
      icon: 'chatbubble',
    },
  ];

  const handleSaveSettings = () => {
    Alert.alert('Success', 'Notification settings saved successfully!');
  };

  const handleTestNotification = () => {
    Alert.alert(
      'Test Notification',
      'This is a test notification to verify your settings are working correctly.',
      [{ text: 'OK' }]
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
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveSettings}
        >
          <Text style={[styles.saveText, { color: theme.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Test Notification */}
        <View style={[styles.testCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.testContent}>
            <View>
              <Text style={[styles.testTitle, { color: theme.text }]}>
                Test Your Settings
              </Text>
              <Text style={[styles.testDescription, { color: theme.textSecondary }]}>
                Send a test notification to verify your settings
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: theme.primary }]}
              onPress={handleTestNotification}
            >
              <Ionicons name="notifications" size={20} color={theme.buttonText} />
              <Text style={[styles.testButtonText, { color: theme.buttonText }]}>
                Test
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Delivery Methods
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {deliveryMethods.map((method) => (
              <View key={method.key} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name={method.icon as any} size={20} color={theme.primary} />
                  </View>
                  <View style={styles.settingContent}>
                    <Text style={[styles.settingTitle, { color: theme.text }]}>
                      {method.title}
                    </Text>
                    <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                      {method.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notifications[method.key]}
                  onValueChange={() => handleToggle(method.key)}
                  trackColor={{ false: theme.border, true: theme.primary + '40' }}
                  thumbColor={notifications[method.key] ? theme.primary : theme.textMuted}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Notification Categories */}
        {notificationCategories.map((category, categoryIndex) => (
          <View key={categoryIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {category.title}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {category.items.map((item) => (
                <View key={item.key} style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                      <Ionicons name={item.icon as any} size={20} color={theme.primary} />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={[styles.settingTitle, { color: theme.text }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={notifications[item.key]}
                    onValueChange={() => handleToggle(item.key)}
                    trackColor={{ false: theme.border, true: theme.primary + '40' }}
                    thumbColor={notifications[item.key] ? theme.primary : theme.textMuted}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Quiet Hours */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Quiet Hours
          </Text>
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="moon" size={20} color={theme.primary} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[styles.settingTitle, { color: theme.text }]}>
                    Do Not Disturb
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Silence notifications during quiet hours
                  </Text>
                </View>
              </View>
              <Switch
                value={notifications.quietHours}
                onValueChange={() => handleToggle('quietHours')}
                trackColor={{ false: theme.border, true: theme.primary + '40' }}
                thumbColor={notifications.quietHours ? theme.primary : theme.textMuted}
              />
            </View>
            {notifications.quietHours && (
              <View style={styles.quietHoursInfo}>
                <Text style={[styles.quietHoursText, { color: theme.textSecondary }]}>
                  Quiet hours: {notifications.quietStart} - {notifications.quietEnd}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="information-circle" size={24} color={theme.info} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>
              Notification Tips
            </Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              • Enable push notifications to stay updated on loan activities{'\n'}
              • Payment reminders help ensure timely collections{'\n'}
              • Quiet hours prevent notifications during your rest time
            </Text>
          </View>
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
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  testCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  testContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  testButtonText: {
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  quietHoursInfo: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  quietHoursText: {
    fontSize: 14,
    fontStyle: 'italic',
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
  infoContent: {
    flex: 1,
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