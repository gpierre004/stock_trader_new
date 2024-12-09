import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input/Input';
import Button from '../components/Button/Button';
import authService from '../features/Auth/authService';
import websocketService from '../services/websocket';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let wsConnectTimeout;
    let mounted = true;

    // Delay WebSocket connection attempt
    wsConnectTimeout = setTimeout(() => {
      if (mounted) {
        websocketService.connect();
      }
    }, 1000);

    // Subscribe to registration status updates
    const handleRegistrationStatus = (data) => {
      if (!mounted) return;

      if (data.type === 'registration_status') {
        if (data.status === 'success') {
          navigate('/login');
        } else {
          setError(data.message || 'Registration failed');
          setIsLoading(false);
        }
      }
    };

    websocketService.subscribe('registration_status', handleRegistrationStatus);

    // Cleanup on unmount
    return () => {
      mounted = false;
      clearTimeout(wsConnectTimeout);
      websocketService.unsubscribe('registration_status', handleRegistrationStatus);
      websocketService.disconnect();
    };
  }, [navigate]);

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Email and password are required');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Remove confirmPassword from the data sent to the server
      const { confirmPassword, ...registrationData } = formData;
      
      console.log('Submitting registration data:', {
        ...registrationData,
        password: '[REDACTED]'
      });

      const response = await authService.register(registrationData);
      console.log('Registration successful:', response);

      // Check WebSocket connection status
      if (!websocketService.ws || websocketService.ws.readyState !== WebSocket.OPEN) {
        console.log('WebSocket not connected, attempting to reconnect...');
        websocketService.connect();
      }

      // Navigate to login page on success
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        'Registration failed. Please try again.'
      );
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Create Account</h2>
        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.error}>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} style={styles.form}>
          <Input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading}
            style={isLoading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>
        <p style={styles.loginLink}>
          Already have an account?{' '}
          <span 
            onClick={() => !isLoading && navigate('/login')} 
            style={isLoading ? {...styles.link, ...styles.linkDisabled} : styles.link}
          >
            Login here
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
    fontSize: '1.75rem',
    fontWeight: '600'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    border: '1px solid #ffcdd2',
    borderRadius: '4px',
    padding: '0.75rem',
    marginBottom: '1rem'
  },
  error: {
    color: '#c62828',
    textAlign: 'center',
    margin: 0,
    fontSize: '0.875rem'
  },
  button: {
    marginTop: '1rem'
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#666',
    fontSize: '0.875rem'
  },
  link: {
    color: '#1976d2',
    cursor: 'pointer',
    textDecoration: 'none',
    fontWeight: '500',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  linkDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed'
  }
};

export default RegisterPage;
