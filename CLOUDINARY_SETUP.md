# Cloudinary Setup Guide

## Overview
This guide will help you set up Cloudinary for image uploads in the GramFinance mobile app.

## Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com/](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your Cloud Name

1. Log in to your Cloudinary dashboard
2. Your cloud name is displayed at the top of the dashboard
3. It looks like: `dxxxxx` or `your-name`

## Step 3: Create Upload Preset

1. In your Cloudinary dashboard, go to **Settings** > **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**
4. Set the following:
   - **Preset name**: `gramfinance`
   - **Signing Mode**: `Unsigned` (for client-side uploads)
   - **Folder**: `gramfinance/borrowers` (optional)
5. Click **Save**

## Step 4: Update Configuration

1. Open `mobile-app/lib/cloudinary-config.ts`
2. Update the configuration:

```typescript
export const CLOUDINARY_CONFIG = {
  // Replace with your actual cloud name
  CLOUD_NAME: 'your-actual-cloud-name',
  
  // This should match the preset name you created
  UPLOAD_PRESET: 'gramfinance',
  
  // Optional - only needed for server-side operations
  API_KEY: 'your-api-key',
  API_SECRET: 'your-api-secret',
};
```

## Step 5: Test the Integration

1. Run the mobile app
2. Go to **Borrowers** > **Add New Borrower**
3. Tap the photo upload area
4. Choose **Camera** or **Gallery**
5. Take or select a photo
6. The image should upload to Cloudinary and display

## Features Implemented

### ✅ Image Upload Component
- Camera integration
- Gallery selection
- Automatic upload to Cloudinary
- Progress indicator
- Error handling
- Image preview

### ✅ Cloudinary Integration
- Direct upload to Cloudinary
- Image optimization
- Secure URLs
- Folder organization
- Multiple image support

### ✅ Borrower Management
- Photo upload in new borrower form
- Photo display in borrower details
- Photo storage in database

## Troubleshooting

### Issue: Upload Fails
**Solution**: Check your Cloudinary configuration
1. Verify cloud name is correct
2. Ensure upload preset exists and is set to "Unsigned"
3. Check network connectivity

### Issue: Permission Denied
**Solution**: Grant camera and photo library permissions
1. Go to device settings
2. Find the GramFinance app
3. Enable camera and photo library access

### Issue: Images Not Displaying
**Solution**: Check image URLs
1. Verify the image URL is valid
2. Check if the image was uploaded successfully
3. Ensure the URL is accessible

## Advanced Configuration

### Custom Transformations
You can add image transformations in the upload options:

```typescript
<ImageUpload
  transformation="w_300,h_300,c_fill,q_auto"
  quality="high"
  folder="borrowers/profile"
/>
```

### Multiple Image Upload
For multiple images (e.g., documents):

```typescript
const uploadMultiple = async (images: string[]) => {
  const result = await uploadMultipleToCloudinary(images, {
    folder: 'borrowers/documents',
    quality: 'medium'
  });
  return result.successful;
};
```

### Image Optimization
Cloudinary automatically optimizes images, but you can customize:

```typescript
// Generate optimized URL
const optimizedUrl = getOptimizedImageUrl(publicId, {
  width: 300,
  height: 300,
  crop: 'fill',
  quality: 'auto',
  format: 'webp'
});
```

## Security Notes

1. **Upload Preset**: Use unsigned uploads for client-side operations
2. **API Keys**: Keep API keys secure and only use server-side
3. **Folders**: Organize uploads in folders for better management
4. **Transformations**: Use transformations to control image size and quality

## Next Steps

1. **Document Upload**: Add support for document scanning
2. **Bulk Upload**: Implement multiple image upload
3. **Image Editing**: Add basic image editing features
4. **Offline Support**: Cache images for offline viewing

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your Cloudinary configuration
3. Test with a simple image first
4. Check network connectivity 