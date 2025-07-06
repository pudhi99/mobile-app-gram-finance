import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { apiService, Loan } from '@/lib/api';

interface TodayRoute {
  loans: Loan[];
  borrowers: { [borrowerId: string]: any };
  totalOutstanding: number;
  totalLoans: number;
}

interface CollectionStats {
  totalCollected: number;
  totalCollections: number;
  todayCollections: number;
  pendingInstallments: number;
}

export default function CollectionsScreen() {
  const { theme } = useThemeContext();
  const [todayRoute, setTodayRoute] = useState<TodayRoute>({
    loans: [],
    borrowers: {},
    totalOutstanding: 0,
    totalLoans: 0,
  });
  const [stats, setStats] = useState<CollectionStats>({
    totalCollected: 0,
    totalCollections: 0,
    todayCollections: 0,
    pendingInstallments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('today');

  useEffect(() => {
    loadTodayRoute();
  }, []);

  const loadTodayRoute = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTodayCollectionRoute();
      
      if (response.success) {
        setTodayRoute(response.data);
        calculateStats(response.data);
      } else {
        Alert.alert('Error', 'Failed to load today\'s collection route');
      }
    } catch (error) {
      console.error('Error loading today\'s route:', error);
      Alert.alert('Error', 'Failed to load collection route');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (routeData: TodayRoute) => {
    setStats({
      totalCollected: 0, // This would need to be calculated from today's collections
      totalCollections: 0,
      todayCollections: 0,
      pendingInstallments: routeData.totalLoans,
    });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadTodayRoute();
    setIsRefreshing(false);
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '₹0';
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    });
  };

  const getTodayName = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return today;
  };

  const handleCollectPayment = (loan: Loan) => {
    // Navigate to collection form with loan pre-selected
    router.push({
      pathname: '/collection/new',
      params: { loanId: loan._id, borrowerName: loan.borrower.name }
    });
  };

  const handleViewLoanDetails = (loan: Loan) => {
    router.push(`/loan/${loan._id}`);
  };

  const handleViewBorrowerDetails = (borrowerId: string) => {
    router.push(`/borrower/${borrowerId}`);
  };

  const renderLoanCard = ({ item: loan }: { item: Loan }) => {
    const borrower = todayRoute.borrowers[loan.borrower._id];
    
    return (
      <View style={[styles.loanCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.loanHeader}>
          <View style={styles.loanInfo}>
            <Text style={[styles.borrowerName, { color: theme.text }]}>
              {loan.borrower.name}
            </Text>
            <Text style={[styles.loanNumber, { color: theme.textSecondary }]}>
              Loan #{loan.loanNumber}
            </Text>
            <Text style={[styles.loanAmount, { color: theme.textSecondary }]}>
              Outstanding: {formatCurrency(loan.outstandingAmount)}
            </Text>
          </View>
          <View style={styles.loanActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => handleCollectPayment(loan)}
              activeOpacity={0.8}
            >
              <Ionicons name="cash" size={16} color={theme.buttonText} />
              <Text style={[styles.actionButtonText, { color: theme.buttonText }]}>
                Collect
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.info }]}
              onPress={() => handleViewLoanDetails(loan)}
              activeOpacity={0.8}
            >
              <Ionicons name="eye" size={16} color={theme.buttonText} />
              <Text style={[styles.actionButtonText, { color: theme.buttonText }]}>
                View
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.collectionDays}>
          <Text style={[styles.collectionDaysLabel, { color: theme.textSecondary }]}>
            Collection Days:
          </Text>
          <View style={styles.daysContainer}>
            {loan.collectionDays?.map((day, index) => (
              <View key={index} style={[styles.dayChip, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.dayText, { color: theme.primary }]}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </Text>
              </View>
            )) || (
              <Text style={[styles.noDaysText, { color: theme.textMuted }]}>
                No collection days set
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading today's collection route...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Weekly Collections</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/collection/new')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={theme.buttonText} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Today's Route Header */}
        <View style={[styles.todayHeader, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.todayInfo}>
            <Ionicons name="calendar" size={24} color={theme.primary} />
            <View style={styles.todayText}>
              <Text style={[styles.todayTitle, { color: theme.text }]}>
                Today's Collection Route
              </Text>
              <Text style={[styles.todayDate, { color: theme.textSecondary }]}>
                {getTodayName()}
              </Text>
            </View>
          </View>
          <View style={styles.todayStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {Object.keys(todayRoute.borrowers).length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Borrowers
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {todayRoute.totalLoans}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Loans
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {formatCurrency(todayRoute.totalOutstanding)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Outstanding
              </Text>
            </View>
          </View>
        </View>

        {/* Collection Stats */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="cash" size={24} color={theme.success} />
            <Text style={[styles.statCardNumber, { color: theme.text }]}>
              {formatCurrency(stats.totalCollected)}
            </Text>
            <Text style={[styles.statCardLabel, { color: theme.textSecondary }]}>
              Today Collected
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="people" size={24} color={theme.info} />
            <Text style={[styles.statCardNumber, { color: theme.text }]}>
              {stats.todayCollections}
            </Text>
            <Text style={[styles.statCardLabel, { color: theme.textSecondary }]}>
              Collections Made
            </Text>
          </View>
        </View>

        {/* Today's Loans */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Today's Collection List ({todayRoute.totalLoans} loans)
          </Text>
          
          {todayRoute.loans.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="checkmark-circle" size={48} color={theme.success} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Collections Today
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                All loans for today have been collected or there are no collections scheduled.
              </Text>
            </View>
          ) : (
            <FlatList
              data={todayRoute.loans}
              renderItem={renderLoanCard}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push('/collection/schedule')}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={24} color={theme.primary} />
              <Text style={[styles.quickActionText, { color: theme.text }]}>
                Weekly Schedule
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => router.push('/collection/history')}
              activeOpacity={0.8}
            >
              <Ionicons name="time-outline" size={24} color={theme.info} />
              <Text style={[styles.quickActionText, { color: theme.text }]}>
                Collection History
              </Text>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  todayHeader: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  todayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  todayText: {
    marginLeft: 12,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  todayDate: {
    fontSize: 14,
    marginTop: 2,
  },
  todayStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statCardNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  loanCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loanInfo: {
    flex: 1,
  },
  borrowerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  loanNumber: {
    fontSize: 14,
    marginBottom: 2,
  },
  loanAmount: {
    fontSize: 12,
  },
  loanActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  collectionDays: {
    marginTop: 8,
  },
  collectionDaysLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  dayChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dayText: {
    fontSize: 10,
    fontWeight: '600',
  },
  noDaysText: {
    fontSize: 12,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
}); 