import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService, PopulatedCollection as ApiCollection } from '@/lib/api';

interface Collection {
  _id: string;
  amount: number;
  paymentDate: string;
  gpsLat?: number;
  gpsLng?: number;
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

export default function CollectionDetailsScreen() {
  const { theme } = useThemeContext();
  const params = useLocalSearchParams();
  const collectionId = params.id as string;
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCollection();
  }, [collectionId]);

  const loadCollection = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCollection(collectionId);
      if (response.success) {
        const convertedCollection: Collection = {
          _id: response.data._id || '',
          amount: response.data.amount || 0,
          paymentDate: response.data.paymentDate || new Date().toISOString(),
          gpsLat: response.data.gpsLat,
          gpsLng: response.data.gpsLng,
          notes: response.data.notes,
          installmentId: {
            _id: response.data.installmentId?._id || '',
            installmentNumber: response.data.installmentId?.installmentNumber || 0,
            dueDate: response.data.installmentId?.dueDate || new Date().toISOString(),
            status: response.data.installmentId?.status || 'PENDING',
            amount: response.data.installmentId?.amount || 0,
          },
          collectorId: {
            _id: response.data.collectorId?._id || '',
            name: response.data.collectorId?.name || 'Unknown',
            email: response.data.collectorId?.email || '',
          },
          createdAt: response.data.createdAt || new Date().toISOString(),
        };
        setCollection(convertedCollection);
      } else {
        Alert.alert('Error', 'Failed to load collection details');
      }
    } catch (error) {
      console.error('Error loading collection:', error);
      Alert.alert('Error', 'Failed to load collection details');
    } finally {
      setIsLoading(false);
    }
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
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openMap = () => {
    if (collection?.gpsLat && collection?.gpsLng) {
      const url = `https://www.google.com/maps?q=${collection.gpsLat},${collection.gpsLng}`;
      Linking.openURL(url);
    }
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

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading collection details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!collection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.text }]}>
            Collection not found
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={loadCollection}
          >
            <Text style={[styles.retryButtonText, { color: theme.buttonText }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Payment Amount Card */}
        <View style={[styles.amountCard, { backgroundColor: theme.primary }]}>
          <View style={styles.amountHeader}>
            <Ionicons name="cash" size={32} color={theme.buttonText} />
            <Text style={[styles.amountLabel, { color: theme.buttonText }]}>
              Amount Collected
            </Text>
          </View>
          <Text style={[styles.amountValue, { color: theme.buttonText }]}>
            {formatCurrency(collection.amount)}
          </Text>
        </View>

        {/* Collection Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Collection Information
          </Text>
          
          <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="calendar" size={16} color={theme.textSecondary} />
                <Text style={[styles.detailLabelText, { color: theme.textSecondary }]}>
                  Payment Date
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDate(collection.paymentDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="person" size={16} color={theme.textSecondary} />
                <Text style={[styles.detailLabelText, { color: theme.textSecondary }]}>
                  Collected By
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {collection.collectorId.name}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="time" size={16} color={theme.textSecondary} />
                <Text style={[styles.detailLabelText, { color: theme.textSecondary }]}>
                  Recorded At
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDateTime(collection.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* Installment Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Installment Information
          </Text>
          
          <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="list" size={16} color={theme.textSecondary} />
                <Text style={[styles.detailLabelText, { color: theme.textSecondary }]}>
                  Installment Number
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                #{collection.installmentId.installmentNumber}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="calendar" size={16} color={theme.textSecondary} />
                <Text style={[styles.detailLabelText, { color: theme.textSecondary }]}>
                  Due Date
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatDate(collection.installmentId.dueDate)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="cash" size={16} color={theme.textSecondary} />
                <Text style={[styles.detailLabelText, { color: theme.textSecondary }]}>
                  Installment Amount
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {formatCurrency(collection.installmentId.amount)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailLabel}>
                <Ionicons name="checkmark-circle" size={16} color={theme.textSecondary} />
                <Text style={[styles.detailLabelText, { color: theme.textSecondary }]}>
                  Status
                </Text>
              </View>
              <View style={styles.statusContainer}>
                <Ionicons
                  name={getStatusIcon(collection.installmentId.status)}
                  size={16}
                  color={getStatusColor(collection.installmentId.status)}
                />
                <Text style={[styles.statusText, { color: getStatusColor(collection.installmentId.status) }]}>
                  {collection.installmentId.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location Information */}
        {collection.gpsLat && collection.gpsLng && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Location Information
            </Text>
            
            <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabel}>
                  <Ionicons name="location" size={16} color={theme.textSecondary} />
                  <Text style={[styles.detailLabelText, { color: theme.textSecondary }]}>
                    GPS Coordinates
                  </Text>
                </View>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {collection.gpsLat?.toFixed(6) || 'N/A'}, {collection.gpsLng?.toFixed(6) || 'N/A'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.mapButton, { backgroundColor: theme.primary }]}
                onPress={openMap}
              >
                <Ionicons name="map" size={16} color={theme.buttonText} />
                <Text style={[styles.mapButtonText, { color: theme.buttonText }]}>
                  Open in Maps
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notes */}
        {collection.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Notes
            </Text>
            
            <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.notesText, { color: theme.text }]}>
                {collection.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.error }]}
            onPress={() => {
              Alert.alert(
                'Delete Collection',
                'Are you sure you want to delete this collection? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => {
                    // TODO: Implement delete functionality
                    Alert.alert('Not implemented', 'Delete functionality will be implemented in the next phase');
                  }},
                ]
              );
            }}
          >
            <Ionicons name="trash" size={20} color={theme.buttonText} />
            <Text style={[styles.actionButtonText, { color: theme.buttonText }]}>
              Delete Collection
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingTop: 20,
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
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
  amountCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailCard: {
    padding: 16,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabelText: {
    fontSize: 14,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  mapButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 