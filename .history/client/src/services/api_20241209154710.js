import axios from 'axios';
import store from '../store/store';
import { clearAuth } from '../features/Auth/authSlice';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  },
  // Add timeout and retry configuration
  timeout: 10000,
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Don't reject if status is greater than 2xx but less than 500
  }
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    // Log outgoing requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data,
        headers: config.headers
      });
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Log responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    return response;
  },
  (error) => {
    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }

    if (error.response?.status === 401) {
      // Dispatch clearAuth action to clean up Redux state
      store.dispatch(clearAuth());
      // Redirect to login page
      window.location.href = '/login';
    }

    // Enhance error message based on the type of error
    if (error.response) {
      // Server responded with a status code outside of 2xx
      error.message = error.response.data.error || error.response.data.message || 'Server error occurred';
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'No response received from server';
    }

    return Promise.reject(error);
  }
);

export default api;
