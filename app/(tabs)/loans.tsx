import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { apiService, Loan as ApiLoan } from '@/lib/api';

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
  createdAt: string;
}

export default function LoansScreen() {
  const { theme } = useThemeContext();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for development
  const mockLoans: Loan[] = [
    {
      id: '1',
      loanNumber: 'L001',
      borrowerName: 'Ramesh Kumar',
      borrowerId: '1',
      principalAmount: 50000,
      disbursedAmount: 45000,
      outstandingAmount: 25000,
      totalPaid: 20000,
      termWeeks: 12,
      startDate: '2024-01-01',
      status: 'ACTIVE',
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      loanNumber: 'L002',
      borrowerName: 'Sita Devi',
      borrowerId: '2',
      principalAmount: 30000,
      disbursedAmount: 30000,
      outstandingAmount: 15000,
      totalPaid: 15000,
      termWeeks: 8,
      startDate: '2024-01-15',
      status: 'ACTIVE',
      createdAt: '2024-01-15',
    },
    {
      id: '3',
      loanNumber: 'L003',
      borrowerName: 'Lakshmi Bai',
      borrowerId: '3',
      principalAmount: 40000,
      disbursedAmount: 40000,
      outstandingAmount: 0,
      totalPaid: 40000,
      termWeeks: 10,
      startDate: '2023-11-01',
      status: 'COMPLETED',
      createdAt: '2023-11-01',
    },
    {
      id: '4',
      loanNumber: 'L004',
      borrowerName: 'Mohan Singh',
      borrowerId: '4',
      principalAmount: 60000,
      disbursedAmount: 60000,
      outstandingAmount: 35000,
      totalPaid: 25000,
      termWeeks: 16,
      startDate: '2024-01-10',
      status: 'ACTIVE',
      createdAt: '2024-01-10',
    },
  ];

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [loans, searchQuery, statusFilter]);

  const loadLoans = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getLoans();
      if (response.success) {
        // Convert API loans to local format
        const convertedLoans: Loan[] = response.data.map((apiLoan: ApiLoan) => ({
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
          createdAt: apiLoan.createdAt || new Date().toISOString(),
        }));
        setLoans(convertedLoans);
      } else {
        // Fallback to mock data for development
        setLoans(mockLoans);
      }
    } catch (error) {
      console.error('Error loading loans:', error);
      // Fallback to mock data for development
      setLoans(mockLoans);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoans();
    setRefreshing(false);
  };

  const filterLoans = () => {
    let filtered = loans;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(loan =>
        loan.loanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(loan => loan.status === statusFilter);
    }

    setFilteredLoans(filtered);
  };

  const handleAddLoan = () => {
    router.push('/loan/new' as any);
  };

  const handleLoanPress = (loan: Loan) => {
    router.push(`/loan/${loan.id}` as any);
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

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN');
  };

  const stats = {
    total: loans.length,
    active: loans.filter(l => l.status === 'ACTIVE').length,
    completed: loans.filter(l => l.status === 'COMPLETED').length,
    defaulted: loans.filter(l => l.status === 'DEFAULTED').length,
    totalOutstanding: loans.reduce((sum, l) => sum + l.outstandingAmount, 0),
    totalDisbursed: loans.reduce((sum, l) => sum + l.disbursedAmount, 0),
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading loans...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Loans</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={handleAddLoan}
          >
            <Ionicons name="add" size={24} color={theme.buttonText} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="card" size={24} color={theme.primary} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="checkmark-circle" size={24} color={theme.success} />
            <Text style={[styles.statNumber, { color: theme.text }]}>{stats.active}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="cash" size={24} color={theme.warning} />
            <Text style={[styles.statNumber, { color: theme.text }]}>
              {formatCurrency(stats.totalOutstanding)}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Outstanding</Text>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search loans..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Status Filter */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'All', icon: 'list' },
              { key: 'ACTIVE', label: 'Active', icon: 'checkmark-circle' },
              { key: 'COMPLETED', label: 'Completed', icon: 'checkmark-done-circle' },
              { key: 'DEFAULTED', label: 'Defaulted', icon: 'close-circle' },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: statusFilter === filter.key ? theme.primary : theme.card,
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => setStatusFilter(filter.key as any)}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={16}
                  color={statusFilter === filter.key ? theme.buttonText : theme.textSecondary}
                />
                <Text style={[
                  styles.filterText,
                  { color: statusFilter === filter.key ? theme.buttonText : theme.textSecondary }
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Loans List */}
        <View style={styles.loansContainer}>
          {filteredLoans.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="card-outline" size={64} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery || statusFilter !== 'all' ? 'No loans found' : 'No loans yet'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create the first loan for your borrowers'
                }
              </Text>
              {!searchQuery && statusFilter === 'all' && (
                <TouchableOpacity
                  style={[styles.addFirstButton, { backgroundColor: theme.primary }]}
                  onPress={handleAddLoan}
                >
                  <Ionicons name="add" size={20} color={theme.buttonText} />
                  <Text style={[styles.addFirstText, { color: theme.buttonText }]}>
                    Create First Loan
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredLoans.map((loan) => (
              <TouchableOpacity
                key={loan.id}
                style={[styles.loanCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => handleLoanPress(loan)}
              >
                <View style={styles.loanHeader}>
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

                <View style={styles.loanDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Principal</Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {formatCurrency(loan.principalAmount)}
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Outstanding</Text>
                      <Text style={[styles.detailValue, { color: theme.warning }]}>
                        {formatCurrency(loan.outstandingAmount)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Term</Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {loan.termWeeks} weeks
                      </Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={[styles.detailLabel, { color: theme.textMuted }]}>Start Date</Text>
                      <Text style={[styles.detailValue, { color: theme.text }]}>
                        {formatDate(loan.startDate)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.loanFooter}>
                  <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                </View>
              </TouchableOpacity>
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
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  searchContainer: {
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  loansContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addFirstText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  loanNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  borrowerName: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loanDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  loanFooter: {
    alignItems: 'flex-end',
  },
}); 