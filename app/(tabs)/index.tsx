import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { apiService } from '@/lib/api';
import { format } from 'date-fns';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalLoans: number;
  activeLoans: number;
  completedLoans: number;
  defaultedLoans: number;
  totalBorrowers: number;
  totalCollected: number;
  totalOutstanding: number;
  todayCollections: number;
  todayAmount: number;
  weeklyCollections: number;
  weeklyAmount: number;
  monthlyCollections: number;
  monthlyAmount: number;
  recentPayments: Array<{
    id: string;
    loanNumber: string;
    borrowerName: string;
    amount: number;
    collectorName: string;
    time: string;
  }>;
  topCollectors: Array<{
    name: string;
    collections: number;
    amount: number;
  }>;
  loanStatusDistribution: {
    active: number;
    completed: number;
    defaulted: number;
  };
}

export default function DashboardScreen() {
  const { theme } = useThemeContext();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'HH:mm');
  };

  const getProgressPercentage = (current: number, total: number) => {
    if (total === 0) return 0;
    return Math.min((current / total) * 100, 100);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={loadDashboardData}
          >
            <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>
              Welcome back! 👋
            </Text>
            <Text style={[styles.date, { color: theme.textSecondary }]}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.backupButton, { backgroundColor: theme.primary + '20' }]}
            onPress={() => router.push('/backup/daily')}
          >
            <Ionicons name="cloud-upload" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Key Metrics
          </Text>
          <View style={styles.metricsGrid}>
            <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.metricIcon, { backgroundColor: theme.success + '20' }]}>
                <Ionicons name="cash" size={24} color={theme.success} />
              </View>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {formatCurrency(stats.totalCollected)}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Total Collected
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.metricIcon, { backgroundColor: theme.warning + '20' }]}>
                <Ionicons name="trending-up" size={24} color={theme.warning} />
              </View>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {formatCurrency(stats.totalOutstanding)}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Outstanding
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.metricIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="people" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {stats.totalBorrowers}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Borrowers
              </Text>
            </View>

            <View style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.metricIcon, { backgroundColor: theme.info + '20' }]}>
                <Ionicons name="document-text" size={24} color={theme.info} />
              </View>
              <Text style={[styles.metricValue, { color: theme.text }]}>
                {stats.totalLoans}
              </Text>
              <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                Total Loans
              </Text>
            </View>
          </View>
        </View>

        {/* Loan Status Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Loan Status Overview
          </Text>
          <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: theme.primary }]} />
                <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Active</Text>
                <Text style={[styles.statusValue, { color: theme.text }]}>{stats.activeLoans}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
                <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Completed</Text>
                <Text style={[styles.statusValue, { color: theme.text }]}>{stats.completedLoans}</Text>
              </View>
              <View style={styles.statusItem}>
                <View style={[styles.statusDot, { backgroundColor: theme.error }]} />
                <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Defaulted</Text>
                <Text style={[styles.statusValue, { color: theme.text }]}>{stats.defaultedLoans}</Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: theme.primary,
                      width: `${getProgressPercentage(stats.activeLoans, stats.totalLoans)}%`
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: theme.success,
                      width: `${getProgressPercentage(stats.completedLoans, stats.totalLoans)}%`
                    }
                  ]} 
                />
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: theme.error,
                      width: `${getProgressPercentage(stats.defaultedLoans, stats.totalLoans)}%`
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        </View>

        {/* Collection Performance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Collection Performance
          </Text>
          <View style={styles.collectionGrid}>
            <View style={[styles.collectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.collectionIcon, { backgroundColor: theme.success + '20' }]}>
                <Ionicons name="today" size={20} color={theme.success} />
              </View>
              <Text style={[styles.collectionValue, { color: theme.text }]}>
                {stats.todayCollections}
              </Text>
              <Text style={[styles.collectionLabel, { color: theme.textSecondary }]}>
                Today's Collections
              </Text>
              <Text style={[styles.collectionAmount, { color: theme.success }]}>
                {formatCurrency(stats.todayAmount)}
              </Text>
            </View>

            <View style={[styles.collectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.collectionIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="calendar" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.collectionValue, { color: theme.text }]}>
                {stats.weeklyCollections}
              </Text>
              <Text style={[styles.collectionLabel, { color: theme.textSecondary }]}>
                This Week
              </Text>
              <Text style={[styles.collectionAmount, { color: theme.primary }]}>
                {formatCurrency(stats.weeklyAmount)}
              </Text>
            </View>

            <View style={[styles.collectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.collectionIcon, { backgroundColor: theme.warning + '20' }]}>
                <Ionicons name="calendar-outline" size={20} color={theme.warning} />
              </View>
              <Text style={[styles.collectionValue, { color: theme.text }]}>
                {stats.monthlyCollections}
              </Text>
              <Text style={[styles.collectionLabel, { color: theme.textSecondary }]}>
                This Month
              </Text>
              <Text style={[styles.collectionAmount, { color: theme.warning }]}>
                {formatCurrency(stats.monthlyAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Top Collectors */}
        {stats.topCollectors.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Top Collectors
            </Text>
            <View style={[styles.collectorsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {stats.topCollectors.map((collector, index) => (
                <View key={collector.name} style={styles.collectorRow}>
                  <View style={styles.collectorRank}>
                    <Text style={[styles.rankText, { color: theme.textSecondary }]}>
                      #{index + 1}
                    </Text>
                  </View>
                  <View style={styles.collectorInfo}>
                    <Text style={[styles.collectorName, { color: theme.text }]}>
                      {collector.name}
                    </Text>
                    <Text style={[styles.collectorStats, { color: theme.textSecondary }]}>
                      {collector.collections} collections
                    </Text>
                  </View>
                  <Text style={[styles.collectorAmount, { color: theme.success }]}>
                    {formatCurrency(collector.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Recent Payments */}
        {stats.recentPayments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Recent Payments
              </Text>
              <TouchableOpacity onPress={() => router.push('/collections')}>
                <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.paymentsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {stats.recentPayments.map((payment) => (
                <View key={payment.id} style={styles.paymentRow}>
                  <View style={styles.paymentInfo}>
                    <Text style={[styles.paymentLoan, { color: theme.text }]}>
                      {payment.loanNumber}
                    </Text>
                    <Text style={[styles.paymentBorrower, { color: theme.textSecondary }]}>
                      {payment.borrowerName}
                    </Text>
                  </View>
                  <View style={styles.paymentDetails}>
                    <Text style={[styles.paymentAmount, { color: theme.success }]}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <Text style={[styles.paymentTime, { color: theme.textMuted }]}>
                      {formatTime(payment.time)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push('/borrower/new')}
            >
              <Ionicons name="person-add" size={24} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Add Borrower</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push('/loan/new')}
            >
              <Ionicons name="add-circle" size={24} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>New Loan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push('/collection/new')}
            >
              <Ionicons name="cash" size={24} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Collect Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push('/collection/schedule')}
            >
              <Ionicons name="calendar" size={24} color={theme.primary} />
              <Text style={[styles.actionText, { color: theme.text }]}>Weekly Schedule</Text>
            </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
  },
  backupButton: {
    padding: 12,
    borderRadius: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statusItem: {
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  collectionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  collectionCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  collectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  collectionLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 4,
  },
  collectionAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  collectorsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  collectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  collectorRank: {
    width: 32,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
  },
  collectorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  collectorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  collectorStats: {
    fontSize: 12,
  },
  collectorAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLoan: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentBorrower: {
    fontSize: 12,
  },
  paymentDetails: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentTime: {
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
});
