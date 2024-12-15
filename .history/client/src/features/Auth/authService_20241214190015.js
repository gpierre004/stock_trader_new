import api from '../../services/api';

const login = async (userData) => {
  try {
    console.log('Attempting login for:', userData.email);
    
    if (!userData.email || !userData.password) {
      throw new Error('Email and password are required');
    }

    const response = await api.post('/users/login', userData);
    console.log('Login response received:', { 
      status: response.status,
      hasToken: !!response.data.token 
    });

    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      return response.data;
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    // Enhance error message based on the error type
    if (error.response?.status === 401) {
      throw new Error('Invalid email or password');
    } else if (error.response?.status === 404) {
      throw new Error('Login service not found. Please check if the server is running.');
    } else if (!error.response && error.message === 'Network Error') {
      throw new Error('Unable to connect to server. Please check if the server is running.');
    }
    
    throw error;
  }
};

const register = async (userData) => {
  try {
    console.log('Registering user with data:', {
      ...userData,
      password: '[REDACTED]'
    });
    const response = await api.post('/users/register', userData);
    console.log('Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Registration error in service:', error);
    throw error;
  }
};

const logout = async () => {
  try {
    // Attempt to logout on the server
    await api.post('/users/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage, even if server logout fails
    localStorage.removeItem('token');
  }
};

const authService = {
  login,
  register,
  logout
};

export default authService;
