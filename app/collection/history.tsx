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
import { apiService, PopulatedCollection } from '@/lib/api';

interface CollectionStats {
  totalCollected: number;
  totalCollections: number;
  todayCollections: number;
  weekCollections: number;
}

export default function CollectionHistoryScreen() {
  const { theme } = useThemeContext();
  const [collections, setCollections] = useState<PopulatedCollection[]>([]);
  const [stats, setStats] = useState<CollectionStats>({
    totalCollected: 0,
    totalCollections: 0,
    todayCollections: 0,
    weekCollections: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
        limit: 100,
      });

      if (response.success) {
        setCollections(response.data);
        calculateStats(response.data);
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

  const calculateStats = (collectionsData: PopulatedCollection[]) => {
    const totalCollected = collectionsData.reduce((sum, collection) => sum + collection.amount, 0);
    const totalCollections = collectionsData.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayCollections = collectionsData.filter(
      collection => collection.paymentDate.startsWith(today)
    ).length;

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const weekCollections = collectionsData.filter(
      collection => collection.paymentDate >= weekAgo
    ).length;

    setStats({
      totalCollected,
      totalCollections,
      todayCollections,
      weekCollections,
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

  const renderCollectionCard = ({ item: collection }: { item: PopulatedCollection }) => (
    <TouchableOpacity
      style={[styles.collectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={() => router.push(`/collection/${collection._id}`)}
      activeOpacity={0.8}
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
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
        </View>
      </View>

      <View style={styles.collectionDetails}>
        <Text style={[styles.installmentInfo, { color: theme.textSecondary }]}>
          Installment #{collection.installmentId?.installmentNumber || 'N/A'}
        </Text>
        <Text style={[styles.collectorInfo, { color: theme.textSecondary }]}>
          Collected by {collection.collectorId?.name || 'Unknown'}
        </Text>
      </View>

      {collection.notes && (
        <Text style={[styles.notes, { color: theme.textSecondary }]}>
          {collection.notes}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading collection history...
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
        <Text style={[styles.title, { color: theme.text }]}>Collection History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="cash" size={24} color={theme.success} />
            <Text style={[styles.statCardNumber, { color: theme.text }]}>
              {formatCurrency(stats.totalCollected)}
            </Text>
            <Text style={[styles.statCardLabel, { color: theme.textSecondary }]}>
              Total Collected
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="checkmark-circle" size={24} color={theme.info} />
            <Text style={[styles.statCardNumber, { color: theme.text }]}>
              {stats.totalCollections}
            </Text>
            <Text style={[styles.statCardLabel, { color: theme.textSecondary }]}>
              Total Collections
            </Text>
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
        <View style={styles.collectionsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Collections ({collections.length})
          </Text>
          
          {collections.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="cash-outline" size={48} color={theme.textMuted} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Collections Found
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                No collections match the current filter criteria.
              </Text>
            </View>
          ) : (
            <FlatList
              data={collections}
              renderItem={renderCollectionCard}
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
  collectionsSection: {
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
  collectionCard: {
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