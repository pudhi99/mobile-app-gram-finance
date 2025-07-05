import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/contexts/ThemeContext';
import { router } from 'expo-router';
import { apiService, CreateBorrowerData } from '@/lib/api';
import ImageUpload from '@/components/ImageUpload';
import SimpleLocationPicker from '@/components/SimpleLocationPicker';
import { LocationData } from '@/lib/location';

interface BorrowerForm {
  name: string;
  phone: string;
  village: string;
  address: string;
  aadharNumber: string;
  photo?: string;
  location?: LocationData;
}

export default function AddBorrowerScreen() {
  const { theme } = useThemeContext();
  const [formData, setFormData] = useState<BorrowerForm>({
    name: '',
    phone: '',
    village: '',
    address: '',
    aadharNumber: '',
  });
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [errors, setErrors] = useState<Partial<BorrowerForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<BorrowerForm> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.village.trim()) {
      newErrors.village = 'Village is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.aadharNumber.trim()) {
      newErrors.aadharNumber = 'Aadhar number is required';
    } else if (!/^[0-9]{12}$/.test(formData.aadharNumber.replace(/\s/g, ''))) {
      newErrors.aadharNumber = 'Please enter a valid 12-digit Aadhar number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    try {
      const borrowerData: CreateBorrowerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        village: formData.village.trim(),
        address: formData.address.trim(),
        photoUrl: formData.photo,
        gpsLat: formData.location?.latitude,
        gpsLng: formData.location?.longitude,
        collectionDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Default collection days
      };

      const response = await apiService.createBorrower(borrowerData);
      
      if (response.success) {
        Alert.alert(
          'Success',
          'Borrower added successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to add borrower. Please try again.');
      }
    } catch (error) {
      console.error('Error creating borrower:', error);
      Alert.alert('Error', 'Failed to add borrower. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const updateFormData = (field: keyof BorrowerForm, value: string | LocationData) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatAadharNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Format as XXXX XXXX XXXX
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8, 12)}`;
  };

  const formFields = [
    {
      label: 'Full Name',
      field: 'name' as keyof BorrowerForm,
      placeholder: 'Enter borrower\'s full name',
      icon: 'person',
      keyboardType: 'default' as const,
    },
    {
      label: 'Phone Number',
      field: 'phone' as keyof BorrowerForm,
      placeholder: 'Enter phone number',
      icon: 'call',
      keyboardType: 'phone-pad' as const,
    },
    {
      label: 'Village',
      field: 'village' as keyof BorrowerForm,
      placeholder: 'Enter village name',
      icon: 'location',
      keyboardType: 'default' as const,
    },
    {
      label: 'Address',
      field: 'address' as keyof BorrowerForm,
      placeholder: 'Enter complete address',
      icon: 'home',
      keyboardType: 'default' as const,
      multiline: true,
    },
    {
      label: 'Aadhar Number',
      field: 'aadharNumber' as keyof BorrowerForm,
      placeholder: 'XXXX XXXX XXXX',
      icon: 'card',
      keyboardType: 'numeric' as const,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Add New Borrower</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Photo Section */}
        <View style={[styles.photoSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <ImageUpload
            value={formData.photo}
            onChange={(url) => updateFormData('photo', url)}
            onError={(error) => Alert.alert('Upload Error', error)}
            placeholder="Add Photo"
            size={120}
            folder="borrowers"
            quality="medium"
          />
          <Text style={[styles.photoLabel, { color: theme.textSecondary }]}>
            Tap to add borrower photo
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {formFields.map((field) => (
            <View key={field.field} style={styles.fieldContainer}>
              <View style={styles.fieldHeader}>
                <View style={[styles.fieldIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name={field.icon as any} size={16} color={theme.primary} />
                </View>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>
                  {field.label}
                </Text>
              </View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: theme.text,
                    borderColor: errors[field.field] ? theme.error : theme.border,
                    backgroundColor: theme.background,
                  },
                  field.multiline && styles.multilineInput,
                ]}
                placeholder={field.placeholder}
                placeholderTextColor={theme.textMuted}
                value={field.field === 'aadharNumber' 
                  ? formatAadharNumber(formData[field.field] as string)
                  : (formData[field.field] as string)
                }
                onChangeText={(text) => {
                  if (field.field === 'aadharNumber') {
                    // Remove formatting for storage
                    const digits = text.replace(/\D/g, '');
                    updateFormData(field.field, digits);
                  } else {
                    updateFormData(field.field, text);
                  }
                }}
                keyboardType={field.keyboardType}
                multiline={field.multiline}
                numberOfLines={field.multiline ? 3 : 1}
              />
              {errors[field.field] && (
                <Text style={[styles.errorText, { color: theme.error }]}>
                  {errors[field.field] as string}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Location Section */}
        <View style={styles.formSection}>
          <View style={styles.fieldContainer}>
            <View style={styles.fieldHeader}>
              <View style={[styles.fieldIcon, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="location" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Home Location
              </Text>
            </View>
            
            {formData.location ? (
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  }
                ]}
                onPress={() => setShowLocationPicker(true)}
              >
                <Ionicons name="location" size={24} color={theme.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.locationButtonText, { color: theme.text }]}>
                    Location: {formData.location.latitude.toFixed(4)}, {formData.location.longitude.toFixed(4)}
                  </Text>
                  <Text style={[styles.locationButtonSubtext, { color: theme.textMuted }]}>
                    {formData.location.address || 'Tap to change location'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.locationButton,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.background,
                  }
                ]}
                onPress={() => setShowLocationPicker(true)}
              >
                <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.locationButtonText, { color: theme.text }]}>
                    Add Home Location
                  </Text>
                  <Text style={[styles.locationButtonSubtext, { color: theme.textMuted }]}>
                    Tap to select location
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
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
                <Ionicons name="hourglass" size={20} color={theme.buttonText} />
                <Text style={[styles.submitText, { color: theme.buttonText }]}>
                  Adding...
                </Text>
              </View>
            ) : (
              <View style={styles.submitContainer}>
                <Ionicons name="checkmark" size={20} color={theme.buttonText} />
                <Text style={[styles.submitText, { color: theme.buttonText }]}>
                  Add Borrower
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Location Picker Modal */}
      <SimpleLocationPicker
        visible={showLocationPicker}
        initialLocation={formData.location}
        onLocationSelect={(location: LocationData) => {
          updateFormData('location', location);
          setShowLocationPicker(false);
        }}
        onClose={() => setShowLocationPicker(false)}
        title="Select Borrower Location"
      />
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
  photoSection: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photoButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  photoPlaceholder: {
    alignItems: 'center',
  },
  photoText: {
    fontSize: 12,
    marginTop: 4,
  },
  photoLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 24,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  submitSection: {
    marginBottom: 24,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
  submitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 60,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  locationButtonSubtext: {
    fontSize: 14,
    marginTop: 2,
    marginLeft: 12,
  },
}); 