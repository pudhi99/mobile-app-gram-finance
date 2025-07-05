import { config } from './config';

export const testApiConnection = async () => {
  const testUrl = `${config.api.baseUrl}/auth/login`;
  
  console.log('Testing API connection to:', testUrl);
  
  try {
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        username: 'test',
        password: 'test'
      }),
    });
    
    console.log('Test response status:', response.status);
    console.log('Test response headers:', response.headers);
    
    const data = await response.json();
    console.log('Test response data:', data);
    
    return {
      success: true,
      status: response.status,
      data
    };
  } catch (error) {
    console.error('API test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const testSimpleGet = async () => {
  const testUrl = config.api.baseUrl.replace('/api', '');
  
  console.log('Testing simple GET to:', testUrl);
  
  try {
    const response = await fetch(testUrl);
    console.log('Simple GET status:', response.status);
    return {
      success: true,
      status: response.status
    };
  } catch (error) {
    console.error('Simple GET failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 