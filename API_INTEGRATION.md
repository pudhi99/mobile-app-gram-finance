# API Integration Guide

## Overview
The mobile app is now integrated with the GramFinance web portal APIs. This document explains how to set up and use the API integration.

## Configuration

### API Base URL
Update the API base URL in `lib/config.ts`:

```typescript
export const config = {
  api: {
    // For development on device, use your computer's IP address
    baseUrl: 'http://192.168.1.100:3000/api',
    
    // For production
    // baseUrl: 'https://your-production-domain.com/api',
  },
  // ...
};
```

### Finding Your IP Address
1. **Windows**: Run `ipconfig` in Command Prompt
2. **Mac/Linux**: Run `ifconfig` in Terminal
3. Look for your local IP (usually starts with `192.168.` or `10.0.`)

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration (if needed)

### Borrowers
- `GET /borrowers` - List all borrowers
- `GET /borrowers/:id` - Get borrower details
- `POST /borrowers` - Create new borrower
- `PUT /borrowers/:id` - Update borrower
- `DELETE /borrowers/:id` - Delete borrower

### Loans
- `GET /loans` - List all loans
- `GET /loans/:id` - Get loan details
- `POST /loans` - Create new loan
- `PUT /loans/:id` - Update loan

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

## Features Implemented

### ✅ Completed
1. **Authentication**
   - Login with username/password
   - Token-based authentication
   - Secure token storage
   - Biometric authentication support

2. **Borrower Management**
   - List all borrowers with search and filter
   - View borrower details
   - Add new borrowers
   - Real-time API integration with fallback to mock data

3. **API Service**
   - Centralized API service (`lib/api.ts`)
   - Automatic token management
   - Error handling and retry logic
   - Type-safe API responses

### 🔄 In Progress
1. **Loan Management**
   - Basic structure ready
   - API integration pending

2. **Collection Management**
   - Basic structure ready
   - API integration pending

### 📋 Planned
1. **Camera Integration**
   - Photo capture for borrowers
   - Document scanning

2. **GPS Integration**
   - Location tracking
   - Route optimization

3. **Offline Mode**
   - Data synchronization
   - Offline data storage

## Testing

### Development Setup
1. Start your web portal server: `npm run dev`
2. Update the API base URL in `lib/config.ts`
3. Run the mobile app: `npm start`
4. Test on device or simulator

### API Testing
The app includes fallback to mock data when API calls fail, making it easy to test the UI even without a running server.

## Troubleshooting

### Common Issues

1. **Network Error**
   - Check if the web portal is running
   - Verify the IP address in config
   - Ensure device and computer are on same network

2. **CORS Error (Web)**
   - The web portal should handle CORS
   - Check if CORS is properly configured

3. **Authentication Error**
   - Verify login credentials
   - Check if JWT secret is configured

### Debug Mode
Enable debug logging by checking the console for API request/response logs.

## Security Notes

1. **Token Storage**: Tokens are stored securely using platform-specific storage
2. **HTTPS**: Use HTTPS in production
3. **Input Validation**: All inputs are validated before sending to API
4. **Error Handling**: Sensitive error messages are not exposed to users

## Next Steps

1. Complete loan management API integration
2. Add collection management features
3. Implement camera and GPS features
4. Add offline mode support
5. Implement push notifications 