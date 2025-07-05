import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { apiService } from '@/lib/api';

export default function DashboardScreen() {
  const { theme } = useThemeContext();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalBorrowers: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalOutstanding: 0,
    totalCollected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Load borrowers
      const borrowersResponse = await apiService.getBorrowers();
      const totalBorrowers = borrowersResponse.success ? borrowersResponse.data.length : 0;

      // Load loans
      const loansResponse = await apiService.getLoans();
      let totalLoans = 0;
      let activeLoans = 0;
      let totalOutstanding = 0;
      let totalCollected = 0;

      if (loansResponse.success) {
        totalLoans = loansResponse.data.length;
        loansResponse.data.forEach((loan: any) => {
          if (loan.status === 'ACTIVE') {
            activeLoans++;
          }
          totalOutstanding += loan.outstandingAmount || 0;
          totalCollected += loan.totalPaid || 0;
        });
      }

      setStats({
        totalBorrowers,
        totalLoans,
        activeLoans,
        totalOutstanding,
        totalCollected,
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcomeText, { color: theme.text }]}>
            Welcome back!
          </Text>
          <Text style={[styles.userName, { color: theme.textSecondary }]}>
            {user?.name || 'User'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <ThemeSwitcher />
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: theme.error }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={20} color={theme.buttonText} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="business" size={40} color={theme.primary} />
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Village Lending Dashboard
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
            Manage your lending operations
          </Text>
        </View>

        <View style={styles.statsContainer}>
          {isLoading ? (
            <View style={[styles.loadingContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading stats...
              </Text>
            </View>
          ) : (
            <>
              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="people" size={24} color={theme.success} />
                <Text style={[styles.statNumber, { color: theme.text }]}>{stats.totalBorrowers}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Borrowers</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="card" size={24} color={theme.warning} />
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  ₹{stats.totalOutstanding.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Outstanding</Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="cash" size={24} color={theme.info} />
                <Text style={[styles.statNumber, { color: theme.text }]}>
                  ₹{stats.totalCollected.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Collected</Text>
              </View>
            </>
          )}
        </View>
      </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  userName: {
    fontSize: 14,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
});
