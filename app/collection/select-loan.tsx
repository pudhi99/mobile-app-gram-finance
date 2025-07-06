import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { apiService, Loan as ApiLoan } from '@/lib/api';

interface Loan {
  _id: string;
  loanNumber: string;
  principalAmount: number;
  disbursedAmount: number;
  outstandingAmount: number;
  totalPaid: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
  borrower: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

export default function SelectLoanScreen() {
  const { theme } = useThemeContext();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLoans();
  }, []);

  useEffect(() => {
    filterLoans();
  }, [loans, searchQuery]);

  const loadLoans = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getLoans();
      if (response.success) {
        // Convert API loans to local format and filter only active loans
        const convertedLoans: Loan[] = response.data
          .map((apiLoan: ApiLoan) => ({
            _id: apiLoan._id,
            loanNumber: apiLoan.loanNumber || 'N/A',
            principalAmount: apiLoan.principalAmount || 0,
            disbursedAmount: apiLoan.disbursedAmount || 0,
            outstandingAmount: apiLoan.outstandingAmount || 0,
            totalPaid: apiLoan.totalPaid || 0,
            status: apiLoan.status || 'ACTIVE',
            borrower: {
              _id: apiLoan.borrower?._id || '',
              name: apiLoan.borrower?.name || 'Unknown',
            },
            createdAt: apiLoan.createdAt || new Date().toISOString(),
          }))
          .filter(loan => loan.status === 'ACTIVE' && loan.outstandingAmount > 0); // Only show active loans with outstanding amounts

        setLoans(convertedLoans);
      } else {
        Alert.alert('Error', 'Failed to load loans');
      }
    } catch (error) {
      console.error('Error loading loans:', error);
      Alert.alert('Error', 'Failed to load loans');
    } finally {
      setIsLoading(false);
    }
  };

  const filterLoans = () => {
    let filtered = loans;

    if (searchQuery.trim()) {
      filtered = filtered.filter(loan =>
        loan.loanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loan.borrower.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLoans(filtered);
  };

  const handleLoanSelect = (loan: Loan) => {
    router.push(`/collection/new?loanId=${loan._id}` as any);
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '₹0';
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading loans...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>Select Loan</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Search by loan number or borrower name..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Loans List */}
        <View style={styles.loansContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Active Loans ({filteredLoans.length})
          </Text>

          {filteredLoans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                {searchQuery ? 'No loans found' : 'No active loans'}
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                {searchQuery ? 'Try a different search term' : 'All loans are completed or have no outstanding amounts'}
              </Text>
            </View>
          ) : (
            filteredLoans.map((loan) => (
              <TouchableOpacity
                key={loan._id}
                style={[styles.loanCard, { backgroundColor: theme.card }]}
                onPress={() => handleLoanSelect(loan)}
              >
                <View style={styles.loanHeader}>
                  <View style={styles.loanInfo}>
                    <Text style={[styles.loanNumber, { color: theme.text }]}>
                      {loan.loanNumber}
                    </Text>
                    <Text style={[styles.borrowerName, { color: theme.textSecondary }]}>
                      {loan.borrower.name}
                    </Text>
                  </View>
                  <View style={styles.loanStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: theme.success + '20' }]}>
                      <Text style={[styles.statusText, { color: theme.success }]}>
                        Active
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.loanDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Principal Amount:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {formatCurrency(loan.principalAmount)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Outstanding:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.error }]}>
                      {formatCurrency(loan.outstandingAmount)}
                    </Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                      Total Paid:
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.success }]}>
                      {formatCurrency(loan.totalPaid)}
                    </Text>
                  </View>
                </View>

                <View style={styles.selectButton}>
                  <Ionicons name="arrow-forward" size={20} color={theme.primary} />
                  <Text style={[styles.selectText, { color: theme.primary }]}>
                    Collect Payment
                  </Text>
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
  content: {
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
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
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
  loansContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  loanCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  borrowerName: {
    fontSize: 14,
  },
  loanStatus: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loanDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  selectText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
}); 