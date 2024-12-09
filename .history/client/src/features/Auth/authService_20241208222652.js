import api from '../../services/api';

const login = async (userData) => {
  try {
    const response = await api.post('/users/login', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  } catch (error) {
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

const logout = () => {
  localStorage.removeItem('token');
};

const authService = {
  login,
  register,
  logout
};

export default authService;
