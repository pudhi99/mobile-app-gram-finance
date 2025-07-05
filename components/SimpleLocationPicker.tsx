import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useThemeContext } from '../contexts/ThemeContext';

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface SimpleLocationPickerProps {
  initialLocation?: LocationData;
  onLocationSelect: (location: LocationData) => void;
  onClose?: () => void;
  title?: string;
  visible: boolean;
}

export default function SimpleLocationPicker({
  initialLocation,
  onLocationSelect,
  onClose,
  title = 'Select Location',
  visible,
}: SimpleLocationPickerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useThemeContext();

  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to get your current location.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Get address from coordinates
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = reverseGeocode[0]
        ? `${reverseGeocode[0].street || ''} ${reverseGeocode[0].city || ''} ${reverseGeocode[0].region || ''} ${reverseGeocode[0].country || ''}`.trim()
        : undefined;

      onLocationSelect({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address,
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to get current location. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLocation = () => {
    // Show a list of common locations
    Alert.alert(
      'Select Location',
      'Choose a location:',
      [
        {
          text: 'Hyderabad, India',
          onPress: () => onLocationSelect({
            latitude: 17.3850,
            longitude: 78.4867,
            address: 'Hyderabad, Telangana, India',
          }),
        },
        {
          text: 'Mumbai, India',
          onPress: () => onLocationSelect({
            latitude: 19.0760,
            longitude: 72.8777,
            address: 'Mumbai, Maharashtra, India',
          }),
        },
        {
          text: 'Delhi, India',
          onPress: () => onLocationSelect({
            latitude: 28.7041,
            longitude: 77.1025,
            address: 'Delhi, India',
          }),
        },
        {
          text: 'Bangalore, India',
          onPress: () => onLocationSelect({
            latitude: 12.9716,
            longitude: 77.5946,
            address: 'Bangalore, Karnataka, India',
          }),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { 
          borderBottomColor: theme.border,
          backgroundColor: theme.background 
        }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[styles.optionButton, {
                backgroundColor: theme.card,
                borderColor: theme.border,
              }]}
              onPress={handleUseCurrentLocation}
              disabled={isLoading}
            >
              <View style={styles.optionIcon}>
                {isLoading ? (
                  <ActivityIndicator size="large" color={theme.primary} />
                ) : (
                  <Ionicons name="locate" size={32} color={theme.primary} />
                )}
              </View>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                Use Current Location
              </Text>
              <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>
                Get your current GPS location
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionContainer}>
            <TouchableOpacity
              style={[styles.optionButton, {
                backgroundColor: theme.card,
                borderColor: theme.border,
              }]}
              onPress={handleManualLocation}
            >
              <View style={styles.optionIcon}>
                <Ionicons name="location" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.optionTitle, { color: theme.text }]}>
                Select from List
              </Text>
              <Text style={[styles.optionSubtitle, { color: theme.textMuted }]}>
                Choose from common Indian cities
              </Text>
            </TouchableOpacity>
          </View>

          {initialLocation && (
            <View style={[styles.currentLocationContainer, {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderLeftColor: theme.primary,
            }]}>
              <Text style={[styles.currentLocationTitle, { color: theme.text }]}>
                Current Location:
              </Text>
              <Text style={[styles.currentLocationText, { color: theme.textMuted }]}>
                {initialLocation.latitude.toFixed(6)}, {initialLocation.longitude.toFixed(6)}
              </Text>
              {initialLocation.address && (
                <Text style={[styles.currentLocationAddress, { color: theme.textMuted }]}>
                  {initialLocation.address}
                </Text>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  optionContainer: {
    marginBottom: 20,
  },
  optionButton: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'center',
  },
  optionIcon: {
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  currentLocationContainer: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  currentLocationText: {
    fontSize: 14,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  currentLocationAddress: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 