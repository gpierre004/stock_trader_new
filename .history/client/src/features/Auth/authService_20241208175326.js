import api from '../../services/api';  

const login = async (userData) => {  
  const response = await api.post('/auth/login', userData);  
  return response.data;  
};  

const authService = { login };  
export default authService;  