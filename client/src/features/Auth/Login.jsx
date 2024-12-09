import React, { useState } from 'react';  
import { useDispatch } from 'react-redux';  
import { login } from './authSlice';  
import { useNavigate } from 'react-router-dom';  
import Input from '../../components/Input/Input';  
import Button from '../../components/Button/Button';  

const Login = () => {  
  const [formData, setFormData] = useState({ email: '', password: '' });  
  const dispatch = useDispatch();  
  const navigate = useNavigate();  

  const handleChange = (e) => {  
    const { name, value } = e.target;  
    setFormData({ ...formData, [name]: value });  
  };  

  const handleSubmit = async (e) => {  
    e.preventDefault();  
    const result = await dispatch(login(formData));  
    if (result.payload) {  
      navigate('/dashboard');  
    }  
  };  

  return (  
    <form onSubmit={handleSubmit}>  
      <Input  
        label="Email"  
        name="email"  
        type="email"  
        value={formData.email}  
        onChange={handleChange}  
      />  
      <Input  
        label="Password"  
        name="password"  
        type="password"  
        value={formData.password}  
        onChange={handleChange}  
      />  
      <Button type="submit" variant="primary">  
        Login  
      </Button>  
    </form>  
  );  
};  

export default Login;  