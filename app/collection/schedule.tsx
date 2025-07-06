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

interface DaySchedule {
  loans: Loan[];
  borrowers: { [borrowerId: string]: any };
  totalOutstanding: number;
  totalLoans: number;
}

interface WeeklySchedule {
  [day: string]: DaySchedule;
}

export default function WeeklyScheduleScreen() {
  const { theme } = useThemeContext();
  const [schedule, setSchedule] = useState<WeeklySchedule>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');

  const days = [
    { key: 'monday', label: 'Monday', short: 'Mon' },
    { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
    { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
    { key: 'thursday', label: 'Thursday', short: 'Thu' },
    { key: 'friday', label: 'Friday', short: 'Fri' },
    { key: 'saturday', label: 'Saturday', short: 'Sat' },
    { key: 'sunday', label: 'Sunday', short: 'Sun' },
  ];

  useEffect(() => {
    loadWeeklySchedule();
  }, []);

  const loadWeeklySchedule = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getWeeklyCollectionSchedule();
      
      if (response.success) {
        setSchedule(response.data);
        // Set today as default selected day
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        setSelectedDay(today);
      } else {
        Alert.alert('Error', 'Failed to load weekly schedule');
      }
    } catch (error) {
      console.error('Error loading weekly schedule:', error);
      Alert.alert('Error', 'Failed to load weekly schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadWeeklySchedule();
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

  const getTodayKey = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  };

  const handleCollectPayment = (loan: Loan) => {
    router.push({
      pathname: '/collection/new',
      params: { loanId: loan._id, borrowerName: loan.borrower.name }
    });
  };

  const handleViewLoanDetails = (loan: Loan) => {
    router.push(`/loan/${loan._id}`);
  };

  const renderLoanCard = ({ item: loan }: { item: Loan }) => (
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading weekly schedule...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const selectedDayData = schedule[selectedDay] || { loans: [], borrowers: {}, totalOutstanding: 0, totalLoans: 0 };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Weekly Schedule</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Day Selector */}
        <View style={styles.daySelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {days.map((day) => {
              const isToday = day.key === getTodayKey();
              const isSelected = day.key === selectedDay;
              const dayData = schedule[day.key] || { loans: [], borrowers: {}, totalOutstanding: 0, totalLoans: 0 };
              
              return (
                <TouchableOpacity
                  key={day.key}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: isToday ? theme.warning : theme.border,
                      borderWidth: isToday ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedDay(day.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.dayButtonText,
                    { color: isSelected ? theme.buttonText : theme.text }
                  ]}>
                    {day.short}
                  </Text>
                  <Text style={[
                    styles.dayButtonCount,
                    { color: isSelected ? theme.buttonText : theme.textSecondary }
                  ]}>
                    {dayData.loans.length}
                  </Text>
                  {isToday && (
                    <View style={[styles.todayIndicator, { backgroundColor: theme.warning }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Selected Day Info */}
        <View style={[styles.dayInfo, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.dayInfoHeader}>
            <Ionicons name="calendar" size={24} color={theme.primary} />
            <View style={styles.dayInfoText}>
              <Text style={[styles.dayInfoTitle, { color: theme.text }]}>
                {days.find(d => d.key === selectedDay)?.label || 'Select Day'}
              </Text>
              <Text style={[styles.dayInfoSubtitle, { color: theme.textSecondary }]}>
                Collection Route
              </Text>
            </View>
          </View>
          <View style={styles.dayStats}>
            <View style={styles.dayStat}>
              <Text style={[styles.dayStatNumber, { color: theme.text }]}>
                {Object.keys(selectedDayData.borrowers).length}
              </Text>
              <Text style={[styles.dayStatLabel, { color: theme.textSecondary }]}>
                Borrowers
              </Text>
            </View>
            <View style={styles.dayStat}>
              <Text style={[styles.dayStatNumber, { color: theme.text }]}>
                {selectedDayData.totalLoans}
              </Text>
              <Text style={[styles.dayStatLabel, { color: theme.textSecondary }]}>
                Active Loans
              </Text>
            </View>
            <View style={styles.dayStat}>
              <Text style={[styles.dayStatNumber, { color: theme.text }]}>
                {formatCurrency(selectedDayData.totalOutstanding)}
              </Text>
              <Text style={[styles.dayStatLabel, { color: theme.textSecondary }]}>
                Outstanding
              </Text>
            </View>
          </View>
        </View>

        {/* Loans List */}
        <View style={styles.loansSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedDayData.loans.length > 0 
              ? `${selectedDayData.loans.length} Loans for ${days.find(d => d.key === selectedDay)?.label}`
              : `No collections scheduled for ${days.find(d => d.key === selectedDay)?.label}`
            }
          </Text>
          
          {selectedDayData.loans.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="calendar-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Collections Scheduled
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                No loans are scheduled for collection on this day.
              </Text>
            </View>
          ) : (
            <FlatList
              data={selectedDayData.loans}
              renderItem={renderLoanCard}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  daySelector: {
    marginBottom: 20,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    minWidth: 60,
    position: 'relative',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayButtonCount: {
    fontSize: 12,
    marginTop: 2,
  },
  todayIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayInfo: {
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
  dayInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayInfoText: {
    marginLeft: 12,
  },
  dayInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayInfoSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  dayStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  dayStat: {
    alignItems: 'center',
  },
  dayStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dayStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  loansSection: {
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
    fontSize: 14,
  },
  loanActions: {
    flexDirection: 'row',
    gap: 8,
  },
  collectionDays: {
    marginTop: 12,
  },
  collectionDaysLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noDaysText: {
    fontSize: 12,
    marginTop: 8,
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
}); 