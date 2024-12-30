import axios from 'axios';
import store from '../store/store';
import { clearAuth } from '../features/Auth/authSlice';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  // Only treat 2xx status codes as successful
  validateStatus: function (status) {
    return status >= 200 && status < 300;
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
      // Only dispatch clearAuth action to clean up Redux state
      // Let React Router handle the navigation through component useEffect
      store.dispatch(clearAuth());
    }

    // Enhance error message based on the type of error
    if (error.response) {
      // Server responded with an error status code
      error.message = error.response.data.error || error.response.data.message || 'Server error occurred';
    } else if (error.request) {
      // Request was made but no response received
      error.message = 'No response received from server. Please check if the server is running.';
    }

    return Promise.reject(error);
  }
);

export default api;
