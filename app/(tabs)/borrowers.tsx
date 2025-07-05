import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { apiService, Borrower as ApiBorrower } from '@/lib/api';

interface Borrower {
  id: string;
  name: string;
  phone: string;
  village: string;
  status: 'active' | 'inactive';
  totalLoans: number;
  outstandingAmount: number;
  lastCollection: string;
  photo?: string;
}

export default function BorrowersScreen() {
  const { theme } = useThemeContext();
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [filteredBorrowers, setFilteredBorrowers] = useState<Borrower[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for development
  const mockBorrowers: Borrower[] = [
    {
      id: '1',
      name: 'Ramesh Kumar',
      phone: '+91 98765 43210',
      village: 'Village A',
      status: 'active',
      totalLoans: 3,
      outstandingAmount: 25000,
      lastCollection: '2024-01-15',
    },
    {
      id: '2',
      name: 'Sita Devi',
      phone: '+91 98765 43211',
      village: 'Village B',
      status: 'active',
      totalLoans: 1,
      outstandingAmount: 15000,
      lastCollection: '2024-01-10',
    },
    {
      id: '3',
      name: 'Lakshmi Bai',
      phone: '+91 98765 43212',
      village: 'Village A',
      status: 'inactive',
      totalLoans: 2,
      outstandingAmount: 0,
      lastCollection: '2023-12-20',
    },
    {
      id: '4',
      name: 'Mohan Singh',
      phone: '+91 98765 43213',
      village: 'Village C',
      status: 'active',
      totalLoans: 4,
      outstandingAmount: 35000,
      lastCollection: '2024-01-18',
    },
  ];

  useEffect(() => {
    loadBorrowers();
  }, []);

  useEffect(() => {
    filterBorrowers();
  }, [borrowers, searchQuery, statusFilter]);

  const loadBorrowers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getBorrowers();
      if (response.success) {
        // Convert API borrowers to local format
        const convertedBorrowers: Borrower[] = response.data.map((apiBorrower: ApiBorrower) => ({
          id: apiBorrower._id,
          name: apiBorrower.name,
          phone: apiBorrower.phone || 'N/A',
          village: apiBorrower.village,
          status: apiBorrower.isActive ? 'active' : 'inactive',
          totalLoans: 0, // Will be updated when we integrate loans
          outstandingAmount: 0, // Will be updated when we integrate loans
          lastCollection: new Date(apiBorrower.updatedAt).toISOString().split('T')[0],
          photo: apiBorrower.photoUrl,
        }));
        setBorrowers(convertedBorrowers);
      } else {
        // Fallback to mock data for development
        setBorrowers(mockBorrowers);
      }
    } catch (error) {
      console.error('Error loading borrowers:', error);
      // Fallback to mock data for development
      setBorrowers(mockBorrowers);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBorrowers();
    setRefreshing(false);
  };

  const filterBorrowers = () => {
    let filtered = borrowers;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(borrower =>
        borrower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        borrower.phone.includes(searchQuery) ||
        borrower.village.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(borrower => borrower.status === statusFilter);
    }

    setFilteredBorrowers(filtered);
  };

  const handleAddBorrower = () => {
    router.push('/borrower/new');
  };

  const handleBorrowerPress = (borrower: Borrower) => {
    router.push(`/borrower/${borrower.id}` as any);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? theme.success : theme.error;
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const stats = {
    total: borrowers.length,
    active: borrowers.filter(b => b.status === 'active').length,
    totalOutstanding: borrowers.reduce((sum, b) => sum + b.outstandingAmount, 0),
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Borrowers</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAddBorrower}
        >
          <Ionicons name="add" size={24} color={theme.buttonText} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="people" size={24} color={theme.primary} />
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

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search borrowers..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'active', 'inactive'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                {
                  backgroundColor: statusFilter === filter ? theme.primary : theme.card,
                  borderColor: theme.border,
                }
              ]}
              onPress={() => setStatusFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                { color: statusFilter === filter ? theme.buttonText : theme.textSecondary }
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Borrowers List */}
        <View style={styles.listContainer}>
          {filteredBorrowers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                {searchQuery || statusFilter !== 'all' ? 'No borrowers found' : 'No borrowers yet'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Add your first borrower to get started'
                }
              </Text>
              {!searchQuery && statusFilter === 'all' && (
                <TouchableOpacity
                  style={[styles.emptyButton, { backgroundColor: theme.primary }]}
                  onPress={handleAddBorrower}
                >
                  <Text style={[styles.emptyButtonText, { color: theme.buttonText }]}>
                    Add First Borrower
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredBorrowers.map((borrower) => (
              <TouchableOpacity
                key={borrower.id}
                style={[styles.borrowerCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => handleBorrowerPress(borrower)}
                activeOpacity={0.7}
              >
                <View style={styles.borrowerHeader}>
                  <View style={styles.borrowerInfo}>
                    <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
                      <Ionicons name="person" size={24} color={theme.primary} />
                    </View>
                    <View style={styles.borrowerDetails}>
                      <Text style={[styles.borrowerName, { color: theme.text }]}>
                        {borrower.name}
                      </Text>
                      <Text style={[styles.borrowerPhone, { color: theme.textSecondary }]}>
                        {borrower.phone}
                      </Text>
                      <Text style={[styles.borrowerVillage, { color: theme.textMuted }]}>
                        {borrower.village}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(borrower.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(borrower.status) }]}>
                      {borrower.status.charAt(0).toUpperCase() + borrower.status.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.borrowerStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      {borrower.totalLoans}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                      Loans
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.warning }]}>
                      {formatCurrency(borrower.outstandingAmount)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                      Outstanding
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.textSecondary }]}>
                      {formatDate(borrower.lastCollection)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                      Last Collection
                    </Text>
                  </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  statItemLabel: {
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  borrowerCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  borrowerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  borrowerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  borrowerDetails: {
    flex: 1,
  },
  borrowerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  borrowerPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  borrowerVillage: {
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  borrowerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  borrowerStatLabel: {
    fontSize: 12,
  },
}); 