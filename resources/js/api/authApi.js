import httpClient from './httpClient';

// Auth API functions
const authApi = {
  // User login
  loginUser: (credentials) => {
    return httpClient.post('/auth/login', credentials);
  },

  // Admin login
  loginAdmin: (credentials) => {
    return httpClient.post('/auth/admin-login', credentials);
  },

  // User registration
  register: (userData) => {
    return httpClient.post('/auth/register', userData);
  },

  // Get authenticated user
  getUser: () => {
    return httpClient.get('/user');
  },

  // User logout
  logout: () => {
    return httpClient.post('/auth/logout');
  },

  // Generate OTP
  generateOTP: (emailData) => {
    return httpClient.post('/auth/generate-otp', emailData);
  },

  // Verify OTP
  verifyOTP: (otpData) => {
    return httpClient.post('/auth/verify-otp', otpData);
  },

  // Confirm new password
  confirmPassword: (passwordData) => {
    return httpClient.post('/auth/confirm-password', passwordData);
  }
};

export default authApi;