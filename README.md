# GramFinance Mobile App

A React Native Expo mobile application for village lending operations management.

## Features Implemented

### 🔐 Authentication System
- **Beautiful Login Screen** with fluid animations
- **Light/Dark Theme** support with automatic switching
- **Fingerprint Authentication** for quick login
- **Secure Token Storage** using Expo SecureStore
- **Auto-login** for authenticated users

### 🎨 UI/UX Features
- **Smooth Animations** using React Native Reanimated
- **Responsive Design** that works on all screen sizes
- **Modern Card-based Layout** with shadows and borders
- **Icon Integration** using Expo Vector Icons
- **Loading States** and error handling

### 🔧 Technical Features
- **TypeScript** for type safety
- **Context API** for state management
- **Expo Router** for navigation
- **Theme System** with consistent colors
- **Biometric Authentication** support

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- Expo CLI
- Android Studio / Xcode (for device testing)

### Installation

1. **Install Dependencies**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Install Additional Dependencies** (if not already installed)
   ```bash
   npm install expo-local-authentication expo-secure-store @react-native-async-storage/async-storage
   ```

3. **Configure API URL**
   - Open `lib/auth.ts`
   - Update `API_BASE_URL` to point to your web portal
   - Default: `http://localhost:3000/api`

4. **Start Development Server**
   ```bash
   npm start
   ```

## Project Structure

```
mobile-app/
├── app/
│   ├── _layout.tsx          # Root layout with auth provider
│   ├── index.tsx            # Initial routing logic
│   ├── login.tsx            # Beautiful login screen
│   └── (tabs)/
│       └── index.tsx        # Dashboard screen
├── components/
│   └── AuthGuard.tsx        # Authentication guard component
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   ├── auth.ts              # Authentication service
│   ├── biometrics.ts        # Biometric authentication
│   └── theme.ts             # Theme system
└── README.md
```

## Authentication Flow

1. **App Launch**: Checks for stored authentication token
2. **If Authenticated**: Redirects to dashboard
3. **If Not Authenticated**: Shows login screen
4. **Login Options**:
   - Username/Password login
   - Fingerprint login (if enabled)
5. **After Login**: Stores token securely and redirects to dashboard

## Theme System

The app supports both light and dark themes with:
- **Automatic switching** based on system preference
- **Consistent color palette** across all components
- **Smooth transitions** between themes
- **Accessibility-friendly** color contrasts

## Biometric Authentication

- **Automatic detection** of device capabilities
- **Secure credential storage** using Expo SecureStore
- **Fallback to password** if biometric fails
- **User-friendly prompts** and error handling

## API Integration

The mobile app connects to the web portal APIs:
- **Login**: `POST /api/auth/login`
- **Token Management**: Secure storage and refresh
- **User Data**: Profile information and role-based access

## Next Steps

1. **Dashboard Implementation**: Add real data from APIs
2. **Borrower Management**: CRUD operations for borrowers
3. **Loan Management**: Create and track loans
4. **Collection System**: Record payments with GPS
5. **Offline Support**: Local database for poor connectivity
6. **Push Notifications**: Collection reminders

## Development Notes

- **TypeScript**: All components are fully typed
- **Error Handling**: Comprehensive error states and user feedback
- **Performance**: Optimized animations and efficient re-renders
- **Security**: Secure token storage and biometric authentication
- **Accessibility**: Proper contrast ratios and touch targets

## Troubleshooting

### Common Issues

1. **Biometric not working**: Ensure device has fingerprint/face ID set up
2. **API connection failed**: Check API_BASE_URL in auth.ts
3. **Animation issues**: Ensure react-native-reanimated is properly configured
4. **Theme not switching**: Check useColorScheme hook implementation

### Debug Mode

Run with debug logging:
```bash
EXPO_DEBUG=true npm start
```

## Contributing

1. Follow TypeScript best practices
2. Maintain consistent theming
3. Add proper error handling
4. Test on both iOS and Android
5. Ensure accessibility compliance
