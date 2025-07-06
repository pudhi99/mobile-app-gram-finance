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
import { router } from 'expo-router';
import { apiService, PopulatedCollection as ApiCollection } from '@/lib/api';

interface Collection {
  _id: string;
  amount: number;
  paymentDate: string;
  notes?: string;
  installmentId: {
    _id: string;
    installmentNumber: number;
    dueDate: string;
    status: string;
    amount: number;
  };
  collectorId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface CollectionStats {
  totalCollected: number;
  totalCollections: number;
  todayCollections: number;
  pendingInstallments: number;
}

export default function CollectionsScreen() {
  const { theme } = useThemeContext();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [stats, setStats] = useState<CollectionStats>({
    totalCollected: 0,
    totalCollections: 0,
    todayCollections: 0,
    pendingInstallments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'today' | 'week' | 'month'>('all');

  useEffect(() => {
    loadCollections();
  }, [filterStatus]);

  const loadCollections = async () => {
    try {
      setIsLoading(true);
      
      // Calculate date range based on filter
      let startDate: string | undefined;
      const now = new Date();
      
      switch (filterStatus) {
        case 'today':
          startDate = now.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          startDate = weekAgo.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          startDate = monthAgo.toISOString().split('T')[0];
          break;
      }

      const response = await apiService.getCollections({
        startDate,
        limit: 50,
      });

      if (response.success) {
        const convertedCollections: Collection[] = response.data.map((collection: ApiCollection) => ({
          _id: collection._id || '',
          amount: collection.amount || 0,
          paymentDate: collection.paymentDate || new Date().toISOString(),
          notes: collection.notes,
          installmentId: {
            _id: collection.installmentId?._id || '',
            installmentNumber: collection.installmentId?.installmentNumber || 0,
            dueDate: collection.installmentId?.dueDate || new Date().toISOString(),
            status: collection.installmentId?.status || 'PENDING',
            amount: collection.installmentId?.amount || 0,
          },
          collectorId: {
            _id: collection.collectorId?._id || '',
            name: collection.collectorId?.name || 'Unknown',
            email: collection.collectorId?.email || '',
          },
          createdAt: collection.createdAt || new Date().toISOString(),
        }));

        setCollections(convertedCollections);
        calculateStats(convertedCollections);
      } else {
        Alert.alert('Error', 'Failed to load collections');
      }
    } catch (error) {
      console.error('Error loading collections:', error);
      Alert.alert('Error', 'Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (collectionsData: Collection[]) => {
    const totalCollected = collectionsData.reduce((sum, collection) => sum + collection.amount, 0);
    const totalCollections = collectionsData.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayCollections = collectionsData.filter(
      collection => collection.paymentDate.startsWith(today)
    ).length;

    setStats({
      totalCollected,
      totalCollections,
      todayCollections,
      pendingInstallments: 0, // This would need to be calculated from installments API
    });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadCollections();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return theme.success;
      case 'PENDING':
        return theme.warning;
      case 'OVERDUE':
        return theme.error;
      default:
        return theme.textMuted;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'checkmark-circle';
      case 'PENDING':
        return 'time';
      case 'OVERDUE':
        return 'warning';
      default:
        return 'help-circle';
    }
  };

  const filteredCollections = collections.filter(collection => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        collection.installmentId.installmentNumber.toString().includes(query) ||
        collection.collectorId.name.toLowerCase().includes(query) ||
        collection.notes?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading collections...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Collections</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/collection/select-loan' as any)}
          >
            <Ionicons name="add" size={24} color={theme.buttonText} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="cash" size={20} color={theme.primary} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {formatCurrency(stats.totalCollected)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Total Collected
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.success + '20' }]}>
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {stats.totalCollections}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Total Collections
              </Text>
            </View>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.card }]}>
            <View style={[styles.statIcon, { backgroundColor: theme.warning + '20' }]}>
              <Ionicons name="today" size={20} color={theme.warning} />
            </View>
            <View style={styles.statContent}>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {stats.todayCollections}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Today
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'today', 'week', 'month'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                {
                  backgroundColor: filterStatus === filter ? theme.primary : theme.card,
                  borderColor: theme.border,
                }
              ]}
              onPress={() => setFilterStatus(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color: filterStatus === filter ? theme.buttonText : theme.text,
                  }
                ]}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Collections List */}
        <View style={styles.collectionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Collections ({filteredCollections.length})
          </Text>

          {filteredCollections.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="cash-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                No collections found
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Start collecting payments to see them here
              </Text>
            </View>
          ) : (
            filteredCollections.map((collection) => (
              <TouchableOpacity
                key={collection._id}
                style={[styles.collectionCard, { backgroundColor: theme.card }]}
                onPress={() => router.push(`/collection/${collection._id}` as any)}
              >
                <View style={styles.collectionHeader}>
                  <View style={styles.collectionInfo}>
                    <Text style={[styles.collectionAmount, { color: theme.text }]}>
                      {formatCurrency(collection.amount)}
                    </Text>
                    <Text style={[styles.collectionDate, { color: theme.textSecondary }]}>
                      {formatDate(collection.paymentDate)}
                    </Text>
                  </View>
                  <View style={styles.collectionStatus}>
                    <Ionicons
                      name={getStatusIcon(collection.installmentId.status)}
                      size={20}
                      color={getStatusColor(collection.installmentId.status)}
                    />
                  </View>
                </View>

                <View style={styles.collectionDetails}>
                  <Text style={[styles.installmentInfo, { color: theme.textSecondary }]}>
                    Installment #{collection.installmentId.installmentNumber}
                  </Text>
                  <Text style={[styles.collectorInfo, { color: theme.textSecondary }]}>
                    Collected by {collection.collectorId.name}
                  </Text>
                </View>

                {collection.notes && (
                  <Text style={[styles.notes, { color: theme.textSecondary }]}>
                    {collection.notes}
                  </Text>
                )}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  collectionsContainer: {
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  collectionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  collectionDate: {
    fontSize: 14,
  },
  collectionStatus: {
    alignItems: 'center',
  },
  collectionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  installmentInfo: {
    fontSize: 14,
  },
  collectorInfo: {
    fontSize: 14,
  },
  notes: {
    fontSize: 14,
    fontStyle: 'italic',
  },
}); 