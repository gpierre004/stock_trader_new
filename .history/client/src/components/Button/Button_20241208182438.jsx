import React from 'react';

const Button = ({ children, type = 'button', onClick }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      style={styles.button}
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
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#0056b3',
    },
    '&:focus': {
      outline: 'none',
      boxShadow: '0 0 0 2px rgba(0,123,255,0.25)',
    },
  },
};

export default Button;
