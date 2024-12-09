import React from 'react';  
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  
import LoginPage from '../pages/LoginPage';  
import RegisterPage from '../pages/RegisterPage';  
import DashboardPage from '../pages/DashboardPage';  
import MainLayout from '../layouts/MainLayout';  

const AppRoutes = () => {  
  return (  
    <Router>  
      <Routes>  
        <Route path="/" element={<LoginPage />} />  
        <Route path="/register" element={<RegisterPage />} />  
        <Route path="/dashboard" element={<MainLayout />}>  
          <Route index element={<DashboardPage />} />  
        </Route>  
      </Routes>  
    </Router>  
  );  
};  

export default AppRoutes;  