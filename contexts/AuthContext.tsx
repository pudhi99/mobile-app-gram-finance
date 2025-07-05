import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, User, LoginCredentials } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const authenticated = await AuthService.isAuthenticated();
      if (authenticated) {
        const storedUser = await AuthService.getStoredUser();
        setUser(storedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting login process...');
      const response = await AuthService.login(credentials);
      console.log('AuthContext: Login response:', response);
      
      if (response.success && response.data) {
        console.log('AuthContext: Setting user and authentication state...');
        setUser(response.data.user);
        setIsAuthenticated(true);
        console.log('AuthContext: Login successful, user set:', response.data.user);
        return { success: true };
      } else {
        console.log('AuthContext: Login failed:', response.error);
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Starting logout process...');
      await AuthService.logout();
      setUser(null);
      setIsAuthenticated(false);
      console.log('AuthContext: Logout successful, user cleared');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      const success = await AuthService.updateProfile(profileData);
      if (success && user) {
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
      }
      return success;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 