import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useThemeContext } from '@/contexts/ThemeContext';
import { uploadToCloudinary, CloudinaryUploadResponse } from '@/lib/cloudinary';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  size?: number;
  folder?: string;
  quality?: 'auto' | 'low' | 'medium' | 'high';
  disabled?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  onError,
  placeholder = 'Add Photo',
  size = 120,
  folder = 'borrowers',
  quality = 'auto',
  disabled = false,
}: ImageUploadProps) {
  const { theme } = useThemeContext();
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera and photo library permissions are required to upload images.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add an image',
      [
        {
          text: 'Camera',
          onPress: () => takePhoto(),
        },
        {
          text: 'Gallery',
          onPress: () => pickFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      onError?.('Failed to take photo');
    }
  };

  const pickFromGallery = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      onError?.('Failed to pick image from gallery');
    }
  };

  const uploadImage = async (imageUri: string) => {
    setIsUploading(true);
    try {
      const result: CloudinaryUploadResponse = await uploadToCloudinary(imageUri, {
        folder,
        quality,
      });

      if (result.success && result.url) {
        onChange?.(result.url);
      } else {
        onError?.(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError?.('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onChange?.(''),
        },
      ]
    );
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.imageContainer,
          containerStyle,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={disabled ? undefined : showImagePicker}
        disabled={disabled || isUploading}
        activeOpacity={0.8}
      >
        {isUploading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.uploadingText, { color: theme.textSecondary }]}>
              Uploading...
            </Text>
          </View>
        ) : value ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: value }} style={[styles.image, containerStyle]} />
            {!disabled && (
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: theme.error }]}
                onPress={removeImage}
              >
                <Ionicons name="close" size={16} color={theme.buttonText} />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="camera" size={size * 0.3} color={theme.primary} />
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              {placeholder}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  uploadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  uploadingText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
}); 