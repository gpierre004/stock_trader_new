import React from 'react';

const Input = ({ 
  type, 
  name, 
  placeholder, 
  value, 
  onChange, 
  required, 
  autoComplete,
  style: customStyle 
}) => {
  return (
    <div style={styles.container}>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        style={{ ...styles.input, ...customStyle }}
      />
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    marginBottom: '1rem'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    '&:focus': {
      borderColor: '#007bff',
      boxShadow: '0 0 0 2px rgba(0,123,255,0.25)'
    },
    '&::placeholder': {
      color: '#aaa'
    }
  }
};

export default Input;
