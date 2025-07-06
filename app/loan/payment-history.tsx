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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService, Loan } from '@/lib/api';

interface Payment {
  id: string;
  loanId: string;
  amount: number;
  paymentDate: string;
  collectorName: string;
  collectorId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  notes?: string;
  createdAt: string;
}

export default function PaymentHistoryScreen() {
  const { theme } = useThemeContext();
  const { loanId } = useLocalSearchParams<{ loanId: string }>();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loan, setLoan] = useState<Loan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loanId) {
      loadPaymentHistory();
    }
  }, [loanId]);

  const loadPaymentHistory = async () => {
    if (!loanId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load loan details
      const loanResponse = await apiService.getLoan(loanId);
      if (loanResponse.success) {
        setLoan(loanResponse.data);
      }

      // Load payment history
      const paymentsResponse = await apiService.getPaymentHistory(loanId);
      if (paymentsResponse.success) {
        setPayments(paymentsResponse.data);
      } else {
        setError(paymentsResponse.error || 'Failed to load payment history');
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
      setError('Failed to load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadPaymentHistory();
    setIsRefreshing(false);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Time';
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return theme.success;
      case 'PENDING':
        return theme.warning;
      case 'FAILED':
        return theme.error;
      default:
        return theme.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time';
      case 'FAILED':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Payment History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textMuted }]}>
            Loading payment history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Payment History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={loadPaymentHistory}
          >
            <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Payment History</Text>
        <View style={styles.placeholder} />
      </View>

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
        {/* Loan Summary */}
        {loan && (
          <View style={[styles.loanSummary, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.loanNumber, { color: theme.text }]}>
              {loan.loanNumber || 'N/A'}
            </Text>
            <Text style={[styles.borrowerName, { color: theme.textSecondary }]}>
              {loan.borrower?.name || 'Unknown Borrower'}
            </Text>
            <View style={styles.loanStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Principal</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {formatCurrency(loan.principalAmount)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Outstanding</Text>
                <Text style={[styles.statValue, { color: theme.error }]}>
                  {formatCurrency(loan.outstandingAmount)}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>Total Paid</Text>
                <Text style={[styles.statValue, { color: theme.success }]}>
                  {formatCurrency(loan.totalPaid)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Payment History */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Payment History ({payments.length})
          </Text>
          
          {payments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No payments found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Payment history will appear here once payments are collected
              </Text>
            </View>
          ) : (
            payments.map((payment) => (
              <View
                key={payment.id}
                style={[styles.paymentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <Text style={[styles.paymentAmount, { color: theme.text }]}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <View style={styles.paymentMeta}>
                      <Text style={[styles.paymentDate, { color: theme.textSecondary }]}>
                        {formatDate(payment.paymentDate)}
                      </Text>
                      <Text style={[styles.paymentTime, { color: theme.textMuted }]}>
                        {formatTime(payment.paymentDate)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusContainer}>
                    <Ionicons
                      name={getStatusIcon(payment.status) as any}
                      size={20}
                      color={getStatusColor(payment.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                      {payment.status}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.paymentDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Collector</Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {payment.collectorName}
                    </Text>
                  </View>
                  
                  {payment.notes && (
                    <View style={styles.detailRow}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Notes</Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {payment.notes}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
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
  loanSummary: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  loanNumber: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  borrowerName: {
    fontSize: 16,
    marginBottom: 16,
  },
  loanStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  paymentCard: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentDate: {
    fontSize: 14,
    marginRight: 8,
  },
  paymentTime: {
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  paymentDetails: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
}); 