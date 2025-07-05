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
import { apiService, Borrower as ApiBorrower, CreateLoanData } from '@/lib/api';

interface Borrower {
  id: string;
  name: string;
  phone: string;
  village: string;
  status: 'active' | 'inactive';
}

interface LoanForm {
  borrowerId: string;
  principalAmount: string;
  disbursedAmount: string;
  termWeeks: string;
  startDate: string;
}

export default function NewLoanScreen() {
  const { theme } = useThemeContext();
  const [formData, setFormData] = useState<LoanForm>({
    borrowerId: '',
    principalAmount: '',
    disbursedAmount: '',
    termWeeks: '',
    startDate: new Date().toISOString().split('T')[0], // Today's date
  });
  const [errors, setErrors] = useState<Partial<LoanForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
  const [isLoadingBorrowers, setIsLoadingBorrowers] = useState(false);
  const [showBorrowerPicker, setShowBorrowerPicker] = useState(false);

  useEffect(() => {
    loadBorrowers();
  }, []);

  const loadBorrowers = async () => {
    setIsLoadingBorrowers(true);
    try {
      const response = await apiService.getBorrowers();
      if (response.success) {
        const convertedBorrowers: Borrower[] = response.data
          .filter((borrower: ApiBorrower) => borrower.isActive)
          .map((borrower: ApiBorrower) => ({
            id: borrower._id,
            name: borrower.name,
            phone: borrower.phone || 'N/A',
            village: borrower.village,
            status: borrower.isActive ? 'active' : 'inactive',
          }));
        setBorrowers(convertedBorrowers);
      } else {
        Alert.alert('Error', 'Failed to load borrowers');
      }
    } catch (error) {
      console.error('Error loading borrowers:', error);
      Alert.alert('Error', 'Failed to load borrowers');
    } finally {
      setIsLoadingBorrowers(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoanForm> = {};

    if (!formData.borrowerId) {
      newErrors.borrowerId = 'Please select a borrower';
    }

    if (!formData.principalAmount) {
      newErrors.principalAmount = 'Principal amount is required';
    } else {
      const amount = parseFloat(formData.principalAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.principalAmount = 'Please enter a valid amount';
      }
    }

    if (!formData.disbursedAmount) {
      newErrors.disbursedAmount = 'Disbursed amount is required';
    } else {
      const amount = parseFloat(formData.disbursedAmount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.disbursedAmount = 'Please enter a valid amount';
      }
    }

    if (!formData.termWeeks) {
      newErrors.termWeeks = 'Loan term is required';
    } else {
      const weeks = parseInt(formData.termWeeks);
      if (isNaN(weeks) || weeks <= 0) {
        newErrors.termWeeks = 'Please enter a valid term';
      }
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const loanData: CreateLoanData = {
        borrowerId: formData.borrowerId,
        principalAmount: parseFloat(formData.principalAmount),
        disbursedAmount: parseFloat(formData.disbursedAmount),
        termWeeks: parseInt(formData.termWeeks),
        startDate: formData.startDate,
      };

      const response = await apiService.createLoan(loanData);
      if (response.success) {
        Alert.alert(
          'Success',
          'Loan created successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to create loan');
      }
    } catch (error) {
      console.error('Error creating loan:', error);
      Alert.alert('Error', 'Failed to create loan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof LoanForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const selectBorrower = (borrower: Borrower) => {
    setFormData(prev => ({ ...prev, borrowerId: borrower.id }));
    setShowBorrowerPicker(false);
  };

  const getSelectedBorrower = () => {
    return borrowers.find(b => b.id === formData.borrowerId);
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '';
    return num.toLocaleString();
  };

  const formatCurrencyInput = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    if (digits === '') return '';
    return parseInt(digits).toLocaleString();
  };

  const handleCurrencyChange = (field: 'principalAmount' | 'disbursedAmount', value: string) => {
    const digits = value.replace(/\D/g, '');
    updateFormData(field, digits);
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
        <Text style={[styles.title, { color: theme.text }]}>New Loan</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Borrower Selection */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Select Borrower
          </Text>
          <TouchableOpacity
            style={[
              styles.borrowerSelector,
              {
                borderColor: errors.borrowerId ? theme.error : theme.border,
                backgroundColor: theme.background,
              }
            ]}
            onPress={() => setShowBorrowerPicker(true)}
            disabled={isLoadingBorrowers}
          >
            {isLoadingBorrowers ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                  Loading borrowers...
                </Text>
              </View>
            ) : getSelectedBorrower() ? (
              <View style={styles.selectedBorrower}>
                <View style={styles.borrowerInfo}>
                  <Text style={[styles.borrowerName, { color: theme.text }]}>
                    {getSelectedBorrower()?.name}
                  </Text>
                  <Text style={[styles.borrowerDetails, { color: theme.textSecondary }]}>
                    {getSelectedBorrower()?.phone} • {getSelectedBorrower()?.village}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            ) : (
              <View style={styles.placeholderBorrower}>
                <Ionicons name="person-add" size={24} color={theme.textMuted} />
                <Text style={[styles.placeholderText, { color: theme.textMuted }]}>
                  Select a borrower
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            )}
          </TouchableOpacity>
          {errors.borrowerId && (
            <Text style={[styles.errorText, { color: theme.error }]}>
              {errors.borrowerId}
            </Text>
          )}
        </View>

        {/* Loan Details */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Loan Details
          </Text>
          
          {/* Principal Amount */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="cash" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Principal Amount
              </Text>
            </View>
            <View style={styles.currencyInputContainer}>
              <Text style={[styles.currencySymbol, { color: theme.textMuted }]}>₹</Text>
              <TextInput
                style={[
                  styles.currencyInput,
                  {
                    color: theme.text,
                    borderColor: errors.principalAmount ? theme.error : theme.border,
                    backgroundColor: theme.background,
                  }
                ]}
                placeholder="0"
                placeholderTextColor={theme.textMuted}
                value={formData.principalAmount ? formatCurrency(formData.principalAmount) : ''}
                onChangeText={(text) => handleCurrencyChange('principalAmount', text)}
                keyboardType="numeric"
              />
            </View>
            {errors.principalAmount && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.principalAmount}
              </Text>
            )}
          </View>

          {/* Disbursed Amount */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="card" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Disbursed Amount
              </Text>
            </View>
            <View style={styles.currencyInputContainer}>
              <Text style={[styles.currencySymbol, { color: theme.textMuted }]}>₹</Text>
              <TextInput
                style={[
                  styles.currencyInput,
                  {
                    color: theme.text,
                    borderColor: errors.disbursedAmount ? theme.error : theme.border,
                    backgroundColor: theme.background,
                  }
                ]}
                placeholder="0"
                placeholderTextColor={theme.textMuted}
                value={formData.disbursedAmount ? formatCurrency(formData.disbursedAmount) : ''}
                onChangeText={(text) => handleCurrencyChange('disbursedAmount', text)}
                keyboardType="numeric"
              />
            </View>
            {errors.disbursedAmount && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.disbursedAmount}
              </Text>
            )}
          </View>

          {/* Loan Term */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="calendar" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Loan Term (Weeks)
              </Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  borderColor: errors.termWeeks ? theme.error : theme.border,
                  backgroundColor: theme.background,
                }
              ]}
              placeholder="12"
              placeholderTextColor={theme.textMuted}
              value={formData.termWeeks}
              onChangeText={(text) => updateFormData('termWeeks', text)}
              keyboardType="numeric"
            />
            {errors.termWeeks && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.termWeeks}
              </Text>
            )}
          </View>

          {/* Start Date */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="today" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Start Date
              </Text>
            </View>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.text,
                  borderColor: errors.startDate ? theme.error : theme.border,
                  backgroundColor: theme.background,
                }
              ]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textMuted}
              value={formData.startDate}
              onChangeText={(text) => updateFormData('startDate', text)}
            />
            {errors.startDate && (
              <Text style={[styles.errorText, { color: theme.error }]}>
                {errors.startDate}
              </Text>
            )}
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
                  Creating...
                </Text>
              </View>
            ) : (
              <View style={styles.submitContainer}>
                <Ionicons name="checkmark" size={20} color={theme.buttonText} />
                <Text style={[styles.submitText, { color: theme.buttonText }]}>
                  Create Loan
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Borrower Picker Modal */}
      {showBorrowerPicker && (
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Select Borrower
              </Text>
              <TouchableOpacity onPress={() => setShowBorrowerPicker(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.borrowerList}>
              {borrowers.map((borrower) => (
                <TouchableOpacity
                  key={borrower.id}
                  style={[styles.borrowerItem, { borderBottomColor: theme.border }]}
                  onPress={() => selectBorrower(borrower)}
                >
                  <View style={styles.borrowerItemInfo}>
                    <Text style={[styles.borrowerItemName, { color: theme.text }]}>
                      {borrower.name}
                    </Text>
                    <Text style={[styles.borrowerItemDetails, { color: theme.textSecondary }]}>
                      {borrower.phone} • {borrower.village}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
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
  borrowerSelector: {
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
  selectedBorrower: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  borrowerInfo: {
    flex: 1,
  },
  borrowerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  borrowerDetails: {
    fontSize: 14,
  },
  placeholderBorrower: {
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
  borrowerList: {
    maxHeight: 400,
  },
  borrowerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  borrowerItemInfo: {
    flex: 1,
  },
  borrowerItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  borrowerItemDetails: {
    fontSize: 14,
  },
}); 