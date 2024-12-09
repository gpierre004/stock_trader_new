import React from 'react';  
import styles from './Button.module.css';  

const Button = ({ children, onClick, type = 'button', variant = 'primary' }) => {  
  return (  
    <button  
      className={`${styles.button} ${styles[variant]}`}  
      type={type}  
      onClick={onClick}  
    >  
      {children}  
    </button>  
  );  
};  

export default Button;  