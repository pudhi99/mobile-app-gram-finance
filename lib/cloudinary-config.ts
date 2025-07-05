// Cloudinary Configuration
// Update these values with your actual Cloudinary credentials

export const CLOUDINARY_CONFIG = {
  // Your Cloudinary cloud name (found in your Cloudinary dashboard)
  CLOUD_NAME: 'drrlgn5mf',
  
  // Upload preset name (create this in your Cloudinary dashboard)
  UPLOAD_PRESET: 'gramfinance',
  
  // API Key (optional, only needed for server-side operations)
  API_KEY: '755216328563697',
  
  // API Secret (optional, only needed for server-side operations)
  API_SECRET: '1cPRJ40IrFsNhyk2OWu7O4IeNU4',
};


// Instructions to set up Cloudinary:
// 1. Go to https://cloudinary.com/ and create an account
// 2. Get your cloud name from the dashboard
// 3. Go to Settings > Upload > Upload presets
// 4. Create a new upload preset named 'gramfinance'
// 5. Set it to 'Unsigned' for client-side uploads
// 6. Update the CLOUD_NAME and UPLOAD_PRESET values above

export default CLOUDINARY_CONFIG; 