import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Platform-specific storage functions
const Storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    } else {
      return SecureStore.setItemAsync(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    } else {
      return SecureStore.getItemAsync(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    } else {
      return SecureStore.deleteItemAsync(key);
    }
  }
};

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export class BiometricService {
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Biometric availability check error:', error);
      return false;
    }
  }

  static async authenticateWithBiometrics(): Promise<BiometricAuthResult> {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to login',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error || 'Biometric authentication failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Biometric authentication error' 
      };
    }
  }

  static async saveBiometricCredentials(credentials: { username: string; password: string }): Promise<void> {
    try {
      await Storage.setItem('biometric_credentials', JSON.stringify(credentials));
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
    }
  }

  static async getBiometricCredentials(): Promise<{ username: string; password: string } | null> {
    try {
      const credentials = await Storage.getItem('biometric_credentials');
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.error('Error getting biometric credentials:', error);
      return null;
    }
  }

  static async removeBiometricCredentials(): Promise<void> {
    try {
      await Storage.removeItem('biometric_credentials');
    } catch (error) {
      console.error('Error removing biometric credentials:', error);
    }
  }

  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const credentials = await this.getBiometricCredentials();
      return !!credentials;
    } catch (error) {
      return false;
    }
  }
} 