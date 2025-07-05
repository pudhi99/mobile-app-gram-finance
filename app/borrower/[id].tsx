import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService, Borrower as ApiBorrower } from '@/lib/api';
import { LocationData } from '@/lib/location';

interface Borrower {
  id: string;
  name: string;
  phone: string;
  village: string;
  address: string;
  aadharNumber: string;
  status: 'active' | 'inactive';
  photo?: string;
  joinedDate: string;
  location?: LocationData;
}

interface Loan {
  id: string;
  amount: number;
  status: 'active' | 'completed' | 'overdue';
  startDate: string;
  endDate: string;
  outstandingAmount: number;
  totalPaid: number;
  lastPayment: string;
}

export default function BorrowerDetailsScreen() {
  const { theme } = useThemeContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [borrower, setBorrower] = useState<Borrower | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  const mockBorrower: Borrower = {
    id: '1',
    name: 'Ramesh Kumar',
    phone: '+91 98765 43210',
    village: 'Village A',
    address: 'House No. 123, Main Street, Village A, District - 123456',
    aadharNumber: '1234 5678 9012',
    status: 'active',
    joinedDate: '2023-06-15',
  };

  const mockLoans: Loan[] = [
    {
      id: '1',
      amount: 50000,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-06-30',
      outstandingAmount: 25000,
      totalPaid: 25000,
      lastPayment: '2024-01-15',
    },
    {
      id: '2',
      amount: 30000,
      status: 'completed',
      startDate: '2023-07-01',
      endDate: '2023-12-31',
      outstandingAmount: 0,
      totalPaid: 30000,
      lastPayment: '2023-12-15',
    },
  ];

  useEffect(() => {
    loadBorrowerData();
  }, [id]);

  const loadBorrowerData = async () => {
    setIsLoading(true);
    try {
      if (id) {
        const response = await apiService.getBorrower(id);
        if (response.success) {
          const apiBorrower = response.data;
          const convertedBorrower: Borrower = {
            id: apiBorrower._id,
            name: apiBorrower.name,
            phone: apiBorrower.phone || 'N/A',
            village: apiBorrower.village,
            address: apiBorrower.address,
            aadharNumber: 'N/A', // Not in API yet
            status: apiBorrower.isActive ? 'active' : 'inactive',
            photo: apiBorrower.photoUrl,
            joinedDate: new Date(apiBorrower.createdAt).toISOString().split('T')[0],
            location: apiBorrower.gpsLat && apiBorrower.gpsLng ? {
              latitude: apiBorrower.gpsLat,
              longitude: apiBorrower.gpsLng,
            } : undefined,
          };
          setBorrower(convertedBorrower);
        } else {
          // Fallback to mock data
          setBorrower(mockBorrower);
        }
      } else {
        setBorrower(mockBorrower);
      }
      setLoans(mockLoans); // Keep mock loans for now
    } catch (error) {
      console.error('Error loading borrower:', error);
      // Fallback to mock data
      setBorrower(mockBorrower);
      setLoans(mockLoans);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBorrower = () => {
    router.push(`/borrower/${id}/edit` as any);
  };

  const handleNewLoan = () => {
    router.push(`/loan/new?borrowerId=${id}` as any);
  };

  const handleRecordCollection = () => {
    router.push(`/collection/new?borrowerId=${id}` as any);
  };

  const handleCallBorrower = () => {
    Alert.alert(
      'Call Borrower',
      `Call ${borrower?.name} at ${borrower?.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          // Implement phone call functionality
          Alert.alert('Call', 'Phone call functionality will be implemented');
        }},
      ]
    );
  };

  const handleSendMessage = () => {
    Alert.alert(
      'Send Message',
      `Send message to ${borrower?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => {
          // Implement SMS functionality
          Alert.alert('Message', 'SMS functionality will be implemented');
        }},
      ]
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? theme.success : theme.error;
  };

  const getLoanStatusColor = (status: string) => {
    switch (status) {
      case 'active': return theme.primary;
      case 'completed': return theme.success;
      case 'overdue': return theme.error;
      default: return theme.textSecondary;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const stats = {
    totalLoans: loans.length,
    activeLoans: loans.filter(loan => loan.status === 'active').length,
    totalOutstanding: loans.reduce((sum, loan) => sum + loan.outstandingAmount, 0),
    totalPaid: loans.reduce((sum, loan) => sum + loan.totalPaid, 0),
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={48} color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading borrower details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!borrower) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Borrower not found
          </Text>
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
        <Text style={[styles.title, { color: theme.text }]}>Borrower Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditBorrower}
        >
          <Ionicons name="create" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Borrower Profile */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
              {borrower.photo ? (
                <Image source={{ uri: borrower.photo }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={40} color={theme.primary} />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.borrowerName, { color: theme.text }]}>
                {borrower.name}
              </Text>
              <Text style={[styles.borrowerPhone, { color: theme.textSecondary }]}>
                {borrower.phone}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(borrower.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(borrower.status) }]}>
                  {borrower.status.charAt(0).toUpperCase() + borrower.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.profileDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={16} color={theme.textMuted} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {borrower.village}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="card" size={16} color={theme.textMuted} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                {borrower.aadharNumber}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar" size={16} color={theme.textMuted} />
              <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                Joined: {formatDate(borrower.joinedDate)}
              </Text>
            </View>
          </View>

          {/* Location Display */}
          {borrower.location && (
            <View style={styles.locationSection}>
              <Text style={[styles.locationTitle, { color: theme.textSecondary }]}>
                Home Location
              </Text>
              <View style={[styles.locationCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.locationHeader}>
                  <Ionicons name="location" size={20} color={theme.primary} />
                  <Text style={[styles.locationCoordinates, { color: theme.text }]}>
                    {borrower.location.latitude.toFixed(6)}, {borrower.location.longitude.toFixed(6)}
                  </Text>
                </View>
                {borrower.location.address && (
                  <Text style={[styles.locationAddress, { color: theme.textSecondary }]}>
                    {borrower.location.address}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Quick Actions
          </Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={handleCallBorrower}
            >
              <Ionicons name="call" size={20} color={theme.buttonText} />
              <Text style={[styles.actionText, { color: theme.buttonText }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.info }]}
              onPress={handleSendMessage}
            >
              <Ionicons name="chatbubble" size={20} color={theme.buttonText} />
              <Text style={[styles.actionText, { color: theme.buttonText }]}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.success }]}
              onPress={handleRecordCollection}
            >
              <Ionicons name="cash" size={20} color={theme.buttonText} />
              <Text style={[styles.actionText, { color: theme.buttonText }]}>Collect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.warning }]}
              onPress={handleNewLoan}
            >
              <Ionicons name="add-circle" size={20} color={theme.buttonText} />
              <Text style={[styles.actionText, { color: theme.buttonText }]}>New Loan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.text }]}>{stats.totalLoans}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Loans</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.primary }]}>{stats.activeLoans}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Loans</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.warning }]}>
                {formatCurrency(stats.totalOutstanding)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Outstanding</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.statNumber, { color: theme.success }]}>
                {formatCurrency(stats.totalPaid)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Paid</Text>
            </View>
          </View>
        </View>

        {/* Loan History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Loan History
            </Text>
            <TouchableOpacity onPress={handleNewLoan}>
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          
          {loans.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="document-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No loans yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Create the first loan for this borrower
              </Text>
            </View>
          ) : (
            loans.map((loan) => (
              <View key={loan.id} style={[styles.loanCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.loanHeader}>
                  <View style={styles.loanInfo}>
                    <Text style={[styles.loanAmount, { color: theme.text }]}>
                      {formatCurrency(loan.amount)}
                    </Text>
                    <Text style={[styles.loanDates, { color: theme.textSecondary }]}>
                      {formatDate(loan.startDate)} - {formatDate(loan.endDate)}
                    </Text>
                  </View>
                  <View style={[styles.loanStatus, { backgroundColor: getLoanStatusColor(loan.status) + '20' }]}>
                    <Text style={[styles.loanStatusText, { color: getLoanStatusColor(loan.status) }]}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.loanStats}>
                  <View style={styles.loanStat}>
                    <Text style={[styles.loanStatLabel, { color: theme.textSecondary }]}>Outstanding</Text>
                    <Text style={[styles.loanStatValue, { color: theme.warning }]}>
                      {formatCurrency(loan.outstandingAmount)}
                    </Text>
                  </View>
                  <View style={styles.loanStat}>
                    <Text style={[styles.loanStatLabel, { color: theme.textSecondary }]}>Paid</Text>
                    <Text style={[styles.loanStatValue, { color: theme.success }]}>
                      {formatCurrency(loan.totalPaid)}
                    </Text>
                  </View>
                  <View style={styles.loanStat}>
                    <Text style={[styles.loanStatLabel, { color: theme.textSecondary }]}>Last Payment</Text>
                    <Text style={[styles.loanStatValue, { color: theme.textSecondary }]}>
                      {formatDate(loan.lastPayment)}
                    </Text>
                  </View>
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
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
  },
  profileCard: {
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
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  profileInfo: {
    flex: 1,
  },
  borrowerName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  borrowerPhone: {
    fontSize: 16,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  profileDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 12,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  loanCard: {
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
  loanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  loanInfo: {
    flex: 1,
  },
  loanAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  loanDates: {
    fontSize: 14,
  },
  loanStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loanStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loanStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  loanStat: {
    alignItems: 'center',
    flex: 1,
  },
  loanStatLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  loanStatValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  locationCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationCoordinates: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginLeft: 8,
    flex: 1,
  },
  locationAddress: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 28,
  },
}); 