// Configuration for the mobile app
export const config = {
  // API Configuration
  api: {
    // Development - Update this to your local IP address when testing on device
    // baseUrl: 'http://192.168.1.100:3000/api',
    
    // Production - Update this when deploying
    baseUrl: 'https://web-portal-gram-finance.vercel.app/api',
    
    // Timeout for API requests (in milliseconds)
    timeout: 10000,
  },
  
  // App Configuration
  app: {
    name: 'GramFinance',
    version: '1.0.0',
    description: 'Village Lending Management',
  },
  
  // Feature Flags
  features: {
    biometricAuth: true,
    cameraIntegration: true,
    gpsLocation: true,
    offlineMode: false,
  },
};

// Helper function to get API URL
export const getApiUrl = (endpoint: string): string => {
  return `${config.api.baseUrl}${endpoint}`;
}; 