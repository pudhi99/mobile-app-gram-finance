import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { theme } = useThemeContext();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const settingsItems = [
    {
      title: 'Profile',
      subtitle: user?.name || 'User Profile',
      icon: 'person',
      onPress: () => router.push('/profile'),
    },
    {
      title: 'Theme',
      subtitle: 'Customize app appearance',
      icon: 'color-palette',
      onPress: () => router.push('/theme-settings'),
    },
    {
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      icon: 'notifications',
      onPress: () => router.push('/notifications'),
    },
    {
      title: 'About',
      subtitle: 'App version and information',
      icon: 'information-circle',
      onPress: () => router.push('/about'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <ThemeSwitcher />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Ionicons name="person" size={32} color={theme.buttonText} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: theme.text }]}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.userRole, { color: theme.textSecondary }]}>
              {user?.role || 'COLLECTOR'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textMuted }]}>
              {user?.email || 'user@example.com'}
            </Text>
          </View>
        </View>

        {/* Settings Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            General
          </Text>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.settingItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name={item.icon as any} size={20} color={theme.primary} />
                </View>
                <View style={styles.settingText}>
                  <Text style={[styles.settingTitle, { color: theme.text }]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.error }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out" size={20} color={theme.buttonText} />
            <Text style={[styles.logoutText, { color: theme.buttonText }]}>
              Logout
            </Text>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 