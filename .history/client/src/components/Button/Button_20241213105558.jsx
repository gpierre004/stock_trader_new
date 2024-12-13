import React from 'react';

const Button = ({ 
  children, 
  type = 'button', 
  onClick, 
  disabled,
  style: customStyle 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.button,
        ...(disabled ? styles.disabled : {}),
        ...customStyle
      }}
    >
      {children}
    </button>
  );
};

const styles = {
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#0056b3'
    },
    '&:focus': {
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(0,123,255,0.25)'
    }
  },
  disabled: {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: '#cccccc'
    }
  }
};

export default Button;
