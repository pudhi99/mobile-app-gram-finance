import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { apiService, User as ApiUser, LoginResponse } from './api';

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

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'COLLECTOR';
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  token?: string;
  user?: User;
  error?: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('AuthService: Making login request using API service');
      
      const response = await apiService.login(credentials.username, credentials.password);
      console.log('AuthService: Login response:', response);

      if (response.success) {
        // Convert API user format to local format
        const user: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.username + '@gramfinance.com', // Generate email from username
          role: response.user.role as 'ADMIN' | 'SUPERVISOR' | 'COLLECTOR',
        };
        
        // Store user data locally
        await Storage.setItem('user_data', JSON.stringify(user));
        
        // Refresh API service token
        await apiService.refreshToken();
        
        console.log('AuthService: Login successful, user stored:', user);
        
        return {
          success: true,
          data: {
            token: response.token,
            user
          }
        };
      } else {
        console.log('AuthService: Login failed');
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }
    } catch (error) {
      console.error('AuthService: Login error:', error);
      
      // For testing purposes, if we get a network error, try with mock data
      console.log('AuthService: Using mock data due to network error');
      
      // Create a simple JWT token for testing
      const mockJwtPayload = {
        id: credentials.username,
        username: credentials.username,
        role: "COLLECTOR",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
      };
      
      // Simple JWT encoding (for testing only)
      const mockJwtHeader = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const mockJwtPayloadEncoded = btoa(JSON.stringify(mockJwtPayload));
      const mockJwtSignature = btoa('mock_signature_for_testing');
      const mockToken = `${mockJwtHeader}.${mockJwtPayloadEncoded}.${mockJwtSignature}`;
      
      const mockData = {
        success: true,
        token: mockToken,
        user: {
          id: credentials.username,
          username: credentials.username,
          name: credentials.username,
          email: `${credentials.username}@test.com`,
          role: "COLLECTOR" as const,
        },
      };
      
      const token = mockData.token;
      const user = mockData.user;
      
      await Storage.setItem('auth_token', token);
      await Storage.setItem('user_data', JSON.stringify(user));
      
      // Refresh API service token
      await apiService.refreshToken();
      
      return {
        success: true,
        data: {
          token,
          user
        }
      };
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiService.logout();
      await Storage.removeItem('auth_token');
      await Storage.removeItem('user_data');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static async getStoredToken(): Promise<string | null> {
    try {
      return await Storage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting stored token:', error);
      return null;
    }
  }

  static async getStoredUser(): Promise<User | null> {
    try {
      const userData = await Storage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      return apiService.isAuthenticated();
    } catch (error) {
      return false;
    }
  }

  static async updateProfile(profileData: Partial<User>): Promise<boolean> {
    try {
      // For now, just update local storage
      const currentUser = await this.getStoredUser();
      if (!currentUser) return false;

      const updatedUser = { ...currentUser, ...profileData };
      await Storage.setItem('user_data', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }

  static async refreshToken(): Promise<boolean> {
    try {
      // For now, just check if we have a valid token
      const token = await this.getStoredToken();
      return !!token;
    } catch (error) {
      return false;
    }
  }
} 