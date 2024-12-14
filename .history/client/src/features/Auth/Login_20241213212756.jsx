import React, { useState } from 'react';  
import { useDispatch } from 'react-redux';  
import { login } from './authSlice';  
import { useNavigate, useLocation } from 'react-router-dom';  
import Input from '../../components/Input/Input';  
import Button from '../../components/Button/Button';  

const Login = () => {  
  const [formData, setFormData] = useState({ email: '', password: '' });  
  const [error, setError] = useState('');
  const dispatch = useDispatch();  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path from state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {  
    const { name, value } = e.target;  
    setFormData({ ...formData, [name]: value });  
    setError(''); // Clear any previous errors
  };  

  const handleSubmit = async (e) => {  
    e.preventDefault();
    console.log('Form submitted with data:', { ...formData, password: '[REDACTED]' });
    
    try {
      const result = await dispatch(login(formData));
      console.log('Login result:', result);
      
      if (result.error) {
        console.error('Login failed:', result.error);
        setError(result.error.message || 'Login failed. Please try again.');
        return;
      }
      
      if (result.payload) {  
        console.log('Login successful, navigating to:', from);
        navigate(from);  
      } else {
        console.error('Login failed: No payload in result');
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };  

  return (  
    <form onSubmit={handleSubmit} style={styles.form}>  
      <h2 style={styles.title}>Login</h2>
      {error && <div style={styles.error}>{error}</div>}
      <Input  
        label="Email"  
        name="email"  
        type="email"  
        value={formData.email}  
        onChange={handleChange}  
        required
      />  
      <Input  
        label="Password"  
        name="password"  
        type="password"  
        value={formData.password}  
        onChange={handleChange}  
        required
      />  
      <Button type="submit" variant="primary">  
        Login  
      </Button>  
    </form>  
  );  
};  

const styles = {
  form: {
    maxWidth: '400px',
    margin: '40px auto',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#333',
  },
  error: {
    color: '#dc3545',
    marginBottom: '16px',
    padding: '10px',
    backgroundColor: '#f8d7da',
    borderRadius: '4px',
    textAlign: 'center',
  }
};

export default Login;
