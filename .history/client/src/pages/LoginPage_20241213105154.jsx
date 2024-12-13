import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../features/Auth/authSlice';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log('Attempting login with:', { email: formData.email, password: '****' });
      const actionResult = await dispatch(login(formData));
      
      console.log('Login action result:', actionResult);
      
      if (actionResult.error) {
        throw new Error(actionResult.error.message || 'Login failed');
      }

      if (actionResult.payload) {
        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        throw new Error('No response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Investment Portfolio Login</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            style={styles.input}
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            style={styles.input}
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            style={styles.button}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <p style={styles.registerLink}>
          Don't have an account?{' '}
          <span 
            onClick={() => navigate('/register')} 
            style={styles.link}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '1rem'
  },
  formContainer: {
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: '#333',
    fontSize: '1.5rem',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    '&:focus': {
      borderColor: '#007bff',
      outline: 'none'
    }
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#0056b3'
    },
    '&:disabled': {
      backgroundColor: '#ccc',
      cursor: 'not-allowed'
    }
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
    padding: '0.75rem',
    marginBottom: '1rem',
    textAlign: 'center'
  },
  registerLink: {
    textAlign: 'center',
    marginTop: '1rem',
    color: '#666'
  },
  link: {
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
};

export default LoginPage;
