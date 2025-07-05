import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeContext } from '@/contexts/ThemeContext';
import { BiometricService } from '@/lib/biometrics';
import { router } from 'expo-router';


const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const { login } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  // Animation values
  const logoScale = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    // Start animations
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    formTranslateY.value = withTiming(0, { duration: 800 });
    formOpacity.value = withTiming(1, { duration: 600 });

    // Check biometric availability
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricService.isBiometricAvailable();
      const enabled = await BiometricService.isBiometricEnabled();
      setIsBiometricAvailable(available);
      setIsBiometricEnabled(enabled);
    } catch (error) {
      console.error('Biometric check error:', error);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login with:', { username, password: '***' });
      const result = await login({ username, password });
      console.log('Login result:', result);
      
      if (result.success) {
        console.log('Login successful, redirecting to dashboard...');
        // Animate button press
        buttonScale.value = withSpring(0.95, { duration: 100 });
        setTimeout(() => {
          buttonScale.value = withSpring(1);
          console.log('Attempting navigation to dashboard...');
          try {
            router.replace('/(tabs)');
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback navigation
            router.push('/(tabs)' as any);
          }
        }, 100);
      } else {
        console.log('Login failed:', result.error);
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await BiometricService.authenticateWithBiometrics();
      if (result.success) {
        const credentials = await BiometricService.getBiometricCredentials();
        if (credentials) {
          setIsLoading(true);
          const loginResult = await login(credentials);
          if (loginResult.success) {
            router.replace('/(tabs)');
          } else {
            Alert.alert('Login Failed', 'Biometric login failed');
          }
        } else {
          Alert.alert('Error', 'No saved credentials found');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBiometric = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter credentials first');
      return;
    }

    try {
      await BiometricService.saveBiometricCredentials({ username, password });
      setIsBiometricEnabled(true);
      Alert.alert('Success', 'Biometric login enabled');
    } catch (error) {
      Alert.alert('Error', 'Failed to save biometric credentials');
    }
  };



  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: formOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.background === '#ffffff' ? 'dark' : 'light'} />
      
      {/* Background gradient effect */}
      <View style={[styles.gradient, { backgroundColor: theme.primary }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={[styles.logoCircle, { backgroundColor: theme.card }]}>
              <Ionicons name="business" size={60} color={theme.primary} />
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>GramFinance</Text>
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>
              Village Lending Management
            </Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View style={[styles.formContainer, formAnimatedStyle]}>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Sign in to your account
              </Text>

              {/* Username Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: theme.text, 
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder 
                  }]}
                  placeholder="Username"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { 
                    color: theme.text, 
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.inputBorder 
                  }]}
                  placeholder="Password"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity
                  style={[styles.loginButton, { backgroundColor: theme.primary }]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.buttonText} size="small" />
                  ) : (
                    <>
                      <Ionicons name="log-in" size={20} color={theme.buttonText} />
                      <Text style={[styles.loginButtonText, { color: theme.buttonText }]}>
                        Sign In
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Biometric Options */}
              {isBiometricAvailable && (
                <View style={styles.biometricContainer}>
                  {isBiometricEnabled ? (
                    <TouchableOpacity
                      style={[styles.biometricButton, { borderColor: theme.border }]}
                      onPress={handleBiometricLogin}
                      disabled={isLoading}
                    >
                      <Ionicons name="finger-print" size={24} color={theme.primary} />
                      <Text style={[styles.biometricText, { color: theme.textSecondary }]}>
                        Use Fingerprint
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.biometricButton, { borderColor: theme.border }]}
                      onPress={handleSaveBiometric}
                      disabled={isLoading}
                    >
                      <Ionicons name="finger-print-outline" size={24} color={theme.primary} />
                      <Text style={[styles.biometricText, { color: theme.textSecondary }]}>
                        Enable Fingerprint
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}




            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 44,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  biometricContainer: {
    alignItems: 'center',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderRadius: 12,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },


}); 