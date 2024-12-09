import api from '../../services/api';  

const login = async (userData) => {  
  const response = await api.post('/users/login', userData);  
  return response.data;  
};  

const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

const authService = { login, register };  
export default authService;
