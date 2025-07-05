import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  timestamp?: number;
}

export interface LocationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
}

// Request location permissions
export const requestLocationPermissions = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'This app needs location access to mark borrower locations on the map.',
        [{ text: 'OK' }]
      );
    }
    
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
      status,
    };
  } catch (error) {
    console.error('Location permission error:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: Location.PermissionStatus.DENIED,
    };
  }
};

// Check current location permissions
export const checkLocationPermissions = async (): Promise<LocationPermissionStatus> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
      status,
    };
  } catch (error) {
    console.error('Check location permission error:', error);
    return {
      granted: false,
      canAskAgain: false,
      status: Location.PermissionStatus.DENIED,
    };
  }
};

// Get current location
export const getCurrentLocation = async (): Promise<LocationData | null> => {
  try {
    // Check permissions first
    const permissionStatus = await checkLocationPermissions();
    if (!permissionStatus.granted) {
      const requestResult = await requestLocationPermissions();
      if (!requestResult.granted) {
        return null;
      }
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    });

    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || undefined,
      timestamp: location.timestamp,
    };

    // Get address from coordinates
    try {
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      });

      if (addressResponse.length > 0) {
        const address = addressResponse[0];
        locationData.address = [
          address.street,
          address.district,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(', ');
      }
    } catch (addressError) {
      console.log('Could not get address:', addressError);
    }

    return locationData;
  } catch (error) {
    console.error('Get current location error:', error);
    Alert.alert(
      'Location Error',
      'Could not get your current location. Please check your GPS settings.',
      [{ text: 'OK' }]
    );
    return null;
  }
};

// Get address from coordinates
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const addressResponse = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (addressResponse.length > 0) {
      const address = addressResponse[0];
      return [
        address.street,
        address.district,
        address.city,
        address.region,
        address.country,
      ]
        .filter(Boolean)
        .join(', ');
    }

    return null;
  } catch (error) {
    console.error('Get address error:', error);
    return null;
  }
};

// Get coordinates from address
export const getCoordinatesFromAddress = async (
  address: string
): Promise<LocationData | null> => {
  try {
    const geocodeResponse = await Location.geocodeAsync(address);

    if (geocodeResponse.length > 0) {
      const location = geocodeResponse[0];
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        address,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocode error:', error);
    return null;
  }
};

// Calculate distance between two points (in meters)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Format distance for display
export const formatDistance = (distanceInMeters: number): string => {
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)}m`;
  } else {
    return `${(distanceInMeters / 1000).toFixed(1)}km`;
  }
};

// Validate coordinates
export const isValidCoordinates = (
  latitude: number,
  longitude: number
): boolean => {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}; 