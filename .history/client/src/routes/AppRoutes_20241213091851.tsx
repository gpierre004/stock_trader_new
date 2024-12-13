import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import PortfolioOverview from '../pages/PortfolioOverview';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Dashboard route */}
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* Portfolio Overview route */}
      <Route path="/portfolio" element={<PortfolioOverview />} />
      
      {/* Catch all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
