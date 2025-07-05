import { config } from './config';
import { CLOUDINARY_CONFIG } from './cloudinary-config';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = CLOUDINARY_CONFIG.CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = CLOUDINARY_CONFIG.UPLOAD_PRESET;

export interface CloudinaryUploadResponse {
  success: boolean;
  url?: string;
  publicId?: string;
  error?: string;
}

export interface ImageUploadOptions {
  folder?: string;
  transformation?: string;
  quality?: 'auto' | 'low' | 'medium' | 'high';
  format?: 'auto' | 'jpg' | 'png' | 'webp';
}

// Upload image to Cloudinary
export const uploadToCloudinary = async (
  imageUri: string,
  options: ImageUploadOptions = {}
): Promise<CloudinaryUploadResponse> => {
  try {
    console.log('Uploading image to Cloudinary:', imageUri);
    
    let base64Image = '';
    
    // Convert local file to base64
    if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
      try {
        // Read the file and convert to base64
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            
            // Prepare form data
            const formData = new FormData();
            formData.append('file', `data:image/jpeg;base64,${base64Data}`);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
            
            if (options.folder) {
              formData.append('folder', options.folder);
            }
            
            if (options.transformation) {
              formData.append('transformation', options.transformation);
            }

            try {
              // Upload to Cloudinary
              const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                  method: 'POST',
                  body: formData,
                }
              );

              const result = await uploadResponse.json();

              if (uploadResponse.ok && result.secure_url) {
                console.log('Upload successful:', result.secure_url);
                resolve({
                  success: true,
                  url: result.secure_url,
                  publicId: result.public_id,
                });
              } else {
                console.error('Upload failed:', result);
                resolve({
                  success: false,
                  error: result.error?.message || 'Upload failed',
                });
              }
            } catch (uploadError) {
              console.error('Upload request error:', uploadError);
              resolve({
                success: false,
                error: uploadError instanceof Error ? uploadError.message : 'Upload failed',
              });
            }
          };
          reader.onerror = () => {
            resolve({
              success: false,
              error: 'Failed to read image file',
            });
          };
          reader.readAsDataURL(blob);
        });
      } catch (fileError) {
        console.error('File reading error:', fileError);
        return {
          success: false,
          error: 'Failed to read image file',
        };
      }
    } else {
      // For remote URLs, upload directly
      const formData = new FormData();
      formData.append('file', imageUri);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.transformation) {
        formData.append('transformation', options.transformation);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.secure_url) {
        console.log('Upload successful:', result.secure_url);
        return {
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
        };
      } else {
        console.error('Upload failed:', result);
        return {
          success: false,
          error: result.error?.message || 'Upload failed',
        };
      }
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
};

// Delete image from Cloudinary
export const deleteFromCloudinary = async (
  publicId: string
): Promise<CloudinaryUploadResponse> => {
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_id: publicId,
        }),
      }
    );

    const result = await response.json();

    if (response.ok && result.result === 'ok') {
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'Delete failed',
      };
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'scale' | 'fit';
    quality?: 'auto' | 'low' | 'medium' | 'high';
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  } = {}
): string => {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  let transformation = '';
  
  if (width || height) {
    transformation += `w_${width || 'auto'},h_${height || 'auto'},c_${crop}`;
  }
  
  if (quality !== 'auto') {
    transformation += `,q_${quality}`;
  }
  
  if (format !== 'auto') {
    transformation += `,f_${format}`;
  }

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  
  if (transformation) {
    return `${baseUrl}/${transformation}/${publicId}`;
  }
  
  return `${baseUrl}/${publicId}`;
};

// Upload multiple images
export const uploadMultipleToCloudinary = async (
  imageUris: string[],
  options: ImageUploadOptions = {}
): Promise<{
  successful: string[];
  failed: { error: string; index: number }[];
  total: number;
}> => {
  const uploadPromises = imageUris.map(async (uri, index) => {
    const result = await uploadToCloudinary(uri, options);
    return { result, index };
  });

  const results = await Promise.all(uploadPromises);

  const successful: string[] = [];
  const failed: { error: string; index: number }[] = [];

  results.forEach(({ result, index }) => {
    if (result.success && result.url) {
      successful.push(result.url);
    } else {
      failed.push({ error: result.error || 'Unknown error', index });
    }
  });

  return {
    successful,
    failed,
    total: imageUris.length,
  };
}; 