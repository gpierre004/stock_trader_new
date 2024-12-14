import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import PortfolioOverview from '../pages/PortfolioOverview';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import MaintenancePage from '../pages/MaintenancePage';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/portfolio" element={
        <ProtectedRoute>
          <PortfolioOverview />
        </ProtectedRoute>
      } />

      <Route path="/maintenance" element={
        <ProtectedRoute>
          <MaintenancePage />
        </ProtectedRoute>
      } />
      
      {/* Catch all route - redirect to login if not authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
