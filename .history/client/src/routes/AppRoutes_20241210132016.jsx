import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/DashboardPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import MaintenancePage from '../pages/MaintenancePage';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/maintenance" element={
          <ProtectedRoute>
            <MaintenancePage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
