# API Client Documentation

This directory contains the HTTP client configuration and API functions for the PetStory application.

## Files

1. `httpClient.js` - Configures the Axios instance with base URL, interceptors, and error handling
2. `authApi.js` - Contains all authentication-related API functions

## HttpClient Configuration

The `httpClient.js` file creates an Axios instance with:

- Base URL set to `/api` (matches Laravel's API routes)
- Default headers for JSON requests
- Request interceptor that adds the authentication token to headers
- Response interceptor that handles common error responses

### Interceptors

**Request Interceptor:**
- Automatically adds the `Authorization: Bearer <token>` header if a token exists in localStorage

**Response Interceptor:**
- Handles common HTTP error statuses:
  - 401: Unauthorized - Clears auth token and redirects to login
  - 403: Forbidden - Logs error message
  - 422: Validation errors - Logs error details
  - 500: Server errors - Logs error message
  - Other errors - Logs appropriate messages

## Auth API Functions

The `authApi.js` file provides functions for all authentication operations:

1. `loginUser(credentials)` - User login
2. `loginAdmin(credentials)` - Admin login
3. `register(userData)` - User registration
4. `logout()` - User logout
5. `generateOTP(emailData)` - Generate OTP for verification
6. `verifyOTP(otpData)` - Verify OTP code
7. `confirmPassword(passwordData)` - Confirm and update password

## Usage Examples

### Login
```javascript
import authApi from './api/authApi';

const handleLogin = async (email, password) => {
  try {
    const response = await authApi.loginUser({ email, password });
    if (response.success) {
      localStorage.setItem('authToken', response.data.token);
      // Redirect user or update app state
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Registration
```javascript
import authApi from './api/authApi';

const handleRegister = async (userData) => {
  try {
    const response = await authApi.register(userData);
    if (response.success) {
      // Proceed to OTP verification step
    }
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

## Error Handling

All API functions return promises and should be used with async/await or .then()/.catch() for proper error handling. The httpClient automatically handles common HTTP errors through interceptors.