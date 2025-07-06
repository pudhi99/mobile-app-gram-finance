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
import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService, Installment as ApiInstallment, CreateCollectionData } from '@/lib/api';
import * as Location from 'expo-location';

interface Installment {
  _id: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';
  loanId: string;
  installmentNumber: number;
}

interface CollectionForm {
  installmentId: string;
  amount: string;
  paymentDate: string;
  notes: string;
  gpsLat?: number;
  gpsLng?: number;
}

export default function NewCollectionScreen() {
  const { theme } = useThemeContext();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const loanId = params.loanId as string;
  
  const [formData, setFormData] = useState<CollectionForm>({
    installmentId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<CollectionForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isLoadingInstallments, setIsLoadingInstallments] = useState(false);
  const [showInstallmentPicker, setShowInstallmentPicker] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (loanId) {
      loadInstallments();
    }
  }, [loanId]);

  const loadInstallments = async () => {
    setIsLoadingInstallments(true);
    try {
      const response = await apiService.getInstallments(loanId);
      if (response.success) {
        const convertedInstallments: Installment[] = response.data.map((installment: ApiInstallment) => ({
          _id: installment._id,
          amount: installment.amount,
          dueDate: installment.dueDate,
          status: installment.status,
          loanId: installment.loanId,
          installmentNumber: installment.installmentNumber,
        }));
        setInstallments(convertedInstallments);
      } else {
        Alert.alert('Error', 'Failed to load installments');
      }
    } catch (error) {
      console.error('Error loading installments:', error);
      Alert.alert('Error', 'Failed to load installments');
    } finally {
      setIsLoadingInstallments(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to get GPS coordinates');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData(prev => ({
        ...prev,
        gpsLat: location.coords.latitude,
        gpsLng: location.coords.longitude,
      }));
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CollectionForm> = {};

    if (!formData.installmentId) {
      newErrors.installmentId = 'Please select an installment';
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      }
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'Payment date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated. Please login again.');
      return;
    }

    setIsSubmitting(true);
    try {
      const collectionData: CreateCollectionData = {
        installmentId: formData.installmentId,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        notes: formData.notes,
        collectorId: user.id, // Use the authenticated user's ID
        gpsLat: formData.gpsLat,
        gpsLng: formData.gpsLng,
      };

      const response = await apiService.createCollection(collectionData);
      if (response.success) {
        Alert.alert(
          'Success',
          'Payment collected successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to collect payment');
      }
    } catch (error) {
      console.error('Error collecting payment:', error);
      Alert.alert('Error', 'Failed to collect payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof CollectionForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const selectInstallment = (installment: Installment) => {
    setFormData(prev => ({ 
      ...prev, 
      installmentId: installment._id,
      amount: installment.amount.toString(),
    }));
    setShowInstallmentPicker(false);
  };

  const getSelectedInstallment = () => {
    return installments.find(i => i._id === formData.installmentId);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  const handleCurrencyChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    updateFormData('amount', digits);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Collect Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Installment Selection */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select Installment
          </Text>
          <TouchableOpacity
            style={[
              styles.installmentSelector,
              {
                borderColor: errors.installmentId ? theme.error : theme.border,
                backgroundColor: theme.background,
              }
            ]}
            onPress={() => setShowInstallmentPicker(true)}
            disabled={isLoadingInstallments}
          >
            {isLoadingInstallments ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                  Loading installments...
                </Text>
              </View>
            ) : getSelectedInstallment() ? (
              <View style={styles.selectedInstallment}>
                <View style={styles.installmentInfo}>
                  <Text style={[styles.installmentNumber, { color: theme.text }]}>
                    Installment #{getSelectedInstallment()?.installmentNumber}
                  </Text>
                  <Text style={[styles.installmentDetails, { color: theme.textSecondary }]}>
                    {formatCurrency(getSelectedInstallment()?.amount || 0)} • Due: {formatDate(getSelectedInstallment()?.dueDate || '')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            ) : (
              <View style={styles.placeholderInstallment}>
                <Ionicons name="calendar" size={24} color={theme.textMuted} />
                <Text style={[styles.placeholderText, { color: theme.textMuted }]}>
                  Select an installment
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            )}
          </TouchableOpacity>
          {errors.installmentId && (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {errors.installmentId}
            </Text>
          )}
        </View>

        {/* Payment Details */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Payment Details
          </Text>
          
          {/* Amount */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="cash" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Amount Collected
              </Text>
            </View>
            <View style={styles.currencyInputContainer}>
              <Text style={[styles.currencySymbol, { color: theme.textMuted }]}>₹</Text>
              <TextInput
                style={[
                  styles.currencyInput,
                  {
                    color: theme.text,
                    borderColor: errors.amount ? theme.error : theme.border,
                    backgroundColor: theme.background,
                  }
                ]}
                placeholder="0"
                placeholderTextColor={theme.textMuted}
                value={formData.amount ? formatCurrency(parseFloat(formData.amount)) : ''}
                onChangeText={handleCurrencyChange}
                keyboardType="numeric"
              />
            </View>
            {errors.amount && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.amount}
              </Text>
            )}
          </View>

          {/* Payment Date */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="calendar" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Payment Date
              </Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  borderColor: errors.paymentDate ? theme.error : theme.border,
                  backgroundColor: theme.background,
                }
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textMuted}
              value={formData.paymentDate}
              onChangeText={(text) => updateFormData('paymentDate', text)}
            />
            {errors.paymentDate && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.paymentDate}
              </Text>
            )}
          </View>

          {/* GPS Location */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="location" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                GPS Location
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.locationButton,
                {
                  backgroundColor: formData.gpsLat ? theme.success : theme.primary,
                  borderColor: theme.border,
                }
              ]}
              onPress={getCurrentLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color={theme.buttonText} />
              ) : (
                <Ionicons 
                  name={formData.gpsLat ? "checkmark-circle" : "location"} 
                  size={16} 
                  color={theme.buttonText} 
                />
              )}
              <Text style={[styles.locationButtonText, { color: theme.buttonText }]}>
                {formData.gpsLat ? 'Location Captured' : 'Get Current Location'}
              </Text>
            </TouchableOpacity>
            {formData.gpsLat && (
              <Text style={[styles.locationText, { color: theme.textSecondary }]}>
                Lat: {formData.gpsLat.toFixed(6)}, Lng: {formData.gpsLng?.toFixed(6)}
              </Text>
            )}
          </View>

          {/* Notes */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="document-text" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Notes (Optional)
              </Text>
            </View>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: theme.text,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                }
              ]}
              placeholder="Add any additional notes..."
              placeholderTextColor={theme.textMuted}
              value={formData.notes}
              onChangeText={(text) => updateFormData('notes', text)}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isSubmitting ? theme.textMuted : theme.primary,
                opacity: isSubmitting ? 0.7 : 1,
              }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.buttonText} />
                <Text style={[styles.submitText, { color: theme.buttonText }]}>
                  Collecting...
                </Text>
              </View>
            ) : (
              <View style={styles.submitContainer}>
                <Ionicons name="checkmark" size={20} color={theme.buttonText} />
                <Text style={[styles.submitText, { color: theme.buttonText }]}>
                  Collect Payment
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Installment Picker Modal */}
      {showInstallmentPicker && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select Installment
              </Text>
              <TouchableOpacity onPress={() => setShowInstallmentPicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.installmentList}>
              {installments
                .filter(installment => installment.status !== 'PAID')
                .map((installment) => (
                <TouchableOpacity
                  key={installment._id}
                  style={[styles.installmentItem, { borderBottomColor: theme.border }]}
                  onPress={() => selectInstallment(installment)}
                >
                  <View style={styles.installmentItemInfo}>
                    <Text style={[styles.installmentItemNumber, { color: theme.text }]}>
                      Installment #{installment.installmentNumber}
                    </Text>
                    <Text style={[styles.installmentItemDetails, { color: theme.textSecondary }]}>
                      {formatCurrency(installment.amount)} • Due: {formatDate(installment.dueDate)}
                    </Text>
                  </View>
                  <View style={styles.installmentItemStatus}>
                    <Ionicons
                      name={installment.status === 'OVERDUE' ? 'warning' : 'time'}
                      size={16}
                      color={getStatusColor(installment.status)}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
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
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  installmentSelector: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    minHeight: 60,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
  },
  selectedInstallment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  installmentInfo: {
    flex: 1,
  },
  installmentNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  installmentDetails: {
    fontSize: 14,
  },
  placeholderInstallment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeholderText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  locationButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 44,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 44,
  },
  submitSection: {
    marginTop: 32,
    marginBottom: 40,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  installmentList: {
    maxHeight: 400,
  },
  installmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  installmentItemInfo: {
    flex: 1,
  },
  installmentItemNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  installmentItemDetails: {
    fontSize: 14,
  },
  installmentItemStatus: {
    alignItems: 'center',
  },
}); 