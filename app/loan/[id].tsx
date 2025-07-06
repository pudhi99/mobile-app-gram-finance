import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService, Loan as ApiLoan, PopulatedCollection } from '@/lib/api';

interface Loan {
  id: string;
  loanNumber: string;
  borrowerName: string;
  borrowerId: string;
  principalAmount: number;
  disbursedAmount: number;
  outstandingAmount: number;
  totalPaid: number;
  termWeeks: number;
  startDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
  collectionDays: string[];
  createdAt: string;
}

interface Payment {
  id: string;
  amount: number;
  date: string;
  type: 'INSTALLMENT' | 'EXTRA';
  notes?: string;
  installmentNumber?: number;
  collectorName?: string;
}

export default function LoanDetailsScreen() {
  const { theme } = useThemeContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [calculatedTotalPaid, setCalculatedTotalPaid] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (id) {
      loadLoanData();
    }
  }, [id]);

  const loadLoanData = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getLoan(id);
      if (response.success) {
        const apiLoan = response.data;
        const convertedLoan: Loan = {
          id: apiLoan._id,
          loanNumber: apiLoan.loanNumber || 'N/A',
          borrowerName: apiLoan.borrower?.name || 'Unknown',
          borrowerId: apiLoan.borrower?._id || '',
          principalAmount: apiLoan.principalAmount || 0,
          disbursedAmount: apiLoan.disbursedAmount || 0,
          outstandingAmount: apiLoan.outstandingAmount || 0,
          totalPaid: apiLoan.totalPaid || 0,
          termWeeks: apiLoan.termWeeks || 0,
          startDate: apiLoan.startDate || new Date().toISOString(),
          status: apiLoan.status || 'ACTIVE',
          collectionDays: apiLoan.collectionDays || [],
          createdAt: apiLoan.createdAt || new Date().toISOString(),
        };
        setLoan(convertedLoan);
        
        // Load real payment history
        await loadPaymentHistory();
      } else {
        Alert.alert('Error', 'Failed to load loan details');
      }
    } catch (error) {
      console.error('Error loading loan:', error);
      Alert.alert('Error', 'Failed to load loan details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      const collectionsResponse = await apiService.getCollectionsByLoan(id);
      if (collectionsResponse.success) {
        const convertedPayments: Payment[] = collectionsResponse.data.map((collection: PopulatedCollection) => ({
          id: collection._id,
          amount: collection.amount || 0,
          date: collection.paymentDate || new Date().toISOString(),
          type: 'INSTALLMENT',
          notes: collection.notes,
          installmentNumber: collection.installmentId?.installmentNumber,
          collectorName: collection.collectorId?.name,
        }));
        setPayments(convertedPayments);
        
        // Calculate total paid from actual payment history
        const actualTotalPaid = convertedPayments.reduce((sum, payment) => sum + payment.amount, 0);
        setCalculatedTotalPaid(actualTotalPaid);
        
        // Update loan data with calculated total paid and outstanding amount
        if (loan) {
          setLoan(prevLoan => prevLoan ? {
            ...prevLoan,
            totalPaid: actualTotalPaid,
            outstandingAmount: Math.max(0, prevLoan.principalAmount - actualTotalPaid)
          } : null);
        }
      } else {
        console.log('No payment history found or error loading payments');
        setPayments([]);
        setCalculatedTotalPaid(0);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
      setPayments([]);
      setCalculatedTotalPaid(0);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadLoanData();
    setIsRefreshing(false);
  };

  const handleRecordPayment = () => {
    // Navigate to payment collection screen
    router.push(`/collection/new?loanId=${id}` as any);
  };

  const handleEditLoan = () => {
    // Navigate to edit loan screen
    router.push(`/loan/${id}/edit` as any);
  };

  const handleCallBorrower = () => {
    // This would typically get the borrower's phone number from the API
    Alert.alert(
      'Call Borrower',
      'Would you like to call the borrower?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            // Mock phone number - would come from borrower data
            Linking.openURL('tel:+919876543210');
          }
        },
      ]
    );
  };

  const handleSendMessage = () => {
    // This would typically open SMS or WhatsApp
    Alert.alert(
      'Send Message',
      'Would you like to send a message to the borrower?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'SMS', 
          onPress: () => {
            // Mock phone number - would come from borrower data
            Linking.openURL('sms:+919876543210');
          }
        },
        { 
          text: 'WhatsApp', 
          onPress: () => {
            // Mock phone number - would come from borrower data
            Linking.openURL('whatsapp://send?phone=919876543210');
          }
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return theme.success;
      case 'COMPLETED':
        return theme.info;
      case 'DEFAULTED':
        return theme.error;
      default:
        return theme.textMuted;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'COMPLETED':
        return 'Completed';
      case 'DEFAULTED':
        return 'Defaulted';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const calculateProgress = () => {
    if (!loan) return 0;
    const total = loan.principalAmount || 0;
    // Use calculated total paid from payment history instead of loan.totalPaid
    const paid = calculatedTotalPaid || loan.totalPaid || 0;
    if (total === 0) return 0;
    return Math.min((paid / total) * 100, 100);
  };

  const getWeeksRemaining = () => {
    if (!loan) return 0;
    const startDate = new Date(loan.startDate || new Date());
    const currentDate = new Date();
    const weeksElapsed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
    return Math.max((loan.termWeeks || 0) - weeksElapsed, 0);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading loan details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!loan) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Loan not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Loan Header */}
        <View style={[styles.loanHeader, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.loanHeaderTop}>
            <View style={styles.loanInfo}>
              <Text style={[styles.loanNumber, { color: theme.text }]}>
                {loan.loanNumber}
              </Text>
              <Text style={[styles.borrowerName, { color: theme.textSecondary }]}>
                {loan.borrowerName}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(loan.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(loan.status) }]}>
                {getStatusText(loan.status)}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                Payment Progress
              </Text>
              <Text style={[styles.progressPercentage, { color: theme.text }]}>
                {calculateProgress().toFixed(1)}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: theme.primary,
                    width: `${calculateProgress()}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {formatCurrency(calculatedTotalPaid)} of {formatCurrency(loan.principalAmount)} paid
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.success }]}
              onPress={handleRecordPayment}
            >
              <Ionicons name="cash" size={20} color={theme.buttonText} />
              <Text style={[styles.actionText, { color: theme.buttonText }]}>Collect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.info }]}
              onPress={handleCallBorrower}
            >
              <Ionicons name="call" size={20} color={theme.buttonText} />
              <Text style={[styles.actionText, { color: theme.buttonText }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.warning }]}
              onPress={handleSendMessage}
            >
              <Ionicons name="chatbubble" size={20} color={theme.buttonText} />
              <Text style={[styles.actionText, { color: theme.buttonText }]}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Loan Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Loan Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.text }]}>
                {formatCurrency(loan.principalAmount)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Principal</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.warning }]}>
                {formatCurrency(Math.max(0, loan.principalAmount - calculatedTotalPaid))}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Outstanding</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.success }]}>
                {formatCurrency(calculatedTotalPaid)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Paid</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.info }]}>
                {getWeeksRemaining()}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Weeks Left</Text>
            </View>
          </View>
        </View>

        {/* Loan Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Loan Details
          </Text>
          <View style={[styles.detailsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Loan Number</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{loan.loanNumber}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Borrower</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>{loan.borrowerName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Principal Amount</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatCurrency(loan.principalAmount)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Disbursed Amount</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatCurrency(loan.disbursedAmount)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Term</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {loan.termWeeks} weeks
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Start Date</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDate(loan.startDate)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Created</Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDate(loan.createdAt)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Collection Days</Text>
              <View style={styles.collectionDaysContainer}>
                {loan.collectionDays && loan.collectionDays.length > 0 ? (
                  loan.collectionDays.map((day, index) => (
                    <View key={index} style={[styles.collectionDayChip, { backgroundColor: theme.primary + '20' }]}>
                      <Text style={[styles.collectionDayText, { color: theme.primary }]}>
                        {day.charAt(0).toUpperCase() + day.slice(1)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.detailValue, { color: theme.textMuted }]}>
                    No collection days set
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Payment History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Payment History
            </Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push(`/loan/payment-history?loanId=${loan.id}`)}
              >
                <Text style={[styles.viewAllText, { color: theme.primary }]}>View All</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRecordPayment}>
                <Ionicons name="add" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
          
          {payments.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="cash-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No payments yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Record the first payment for this loan
              </Text>
            </View>
          ) : (
            payments.map((payment) => (
              <View key={payment.id} style={[styles.paymentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <Text style={[styles.paymentAmount, { color: theme.text }]}>
                      {formatCurrency(payment.amount)}
                    </Text>
                    <Text style={[styles.paymentDate, { color: theme.textSecondary }]}>
                      {formatDate(payment.date)}
                    </Text>
                  </View>
                  <View style={[
                    styles.paymentTypeBadge, 
                    { 
                      backgroundColor: payment.type === 'INSTALLMENT' 
                        ? theme.primary + '20' 
                        : theme.warning + '20' 
                    }
                  ]}>
                    <Text style={[
                      styles.paymentTypeText,
                      { 
                        color: payment.type === 'INSTALLMENT' 
                          ? theme.primary 
                          : theme.warning 
                      }
                    ]}>
                      {payment.installmentNumber ? `#${payment.installmentNumber}` : payment.type === 'INSTALLMENT' ? 'Installment' : 'Extra'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.paymentDetails}>
                  {payment.collectorName && (
                    <Text style={[styles.paymentCollector, { color: theme.textSecondary }]}>
                      Collected by: {payment.collectorName}
                    </Text>
                  )}
                  {payment.notes && (
                    <Text style={[styles.paymentNotes, { color: theme.textSecondary }]}>
                      {payment.notes}
                    </Text>
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
  editButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loanHeader: {
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
  loanHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  loanInfo: {
    flex: 1,
  },
  loanNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  borrowerName: {
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
  },
  paymentTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paymentDetails: {
    marginTop: 8,
  },
  paymentCollector: {
    fontSize: 12,
    marginBottom: 4,
  },
  paymentNotes: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  collectionDaysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  collectionDayChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  collectionDayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllButton: {
    marginRight: 10,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 