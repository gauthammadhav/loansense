import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import Register from './pages/Register';

import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplyWizard from './pages/applicant/Apply';
import ApplicantResult from './pages/applicant/Result';
import OfficerDashboard from './pages/officer/Dashboard';
import OfficerReview from './pages/officer/Review';
import OfficerAnalytics from './pages/officer/Analytics';
import Landing from './pages/Landing';
// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, role } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Applicant Routes enclosed in AppShell */}
        <Route element={<ProtectedRoute allowedRole="applicant"><AppShell /></ProtectedRoute>}>
          <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
          <Route path="/applicant/apply" element={<ApplyWizard />} />
          <Route path="/applicant/result" element={<ApplicantResult />} />
        </Route>

        {/* Officer Routes enclosed in AppShell */}
        <Route element={<ProtectedRoute allowedRole="officer"><AppShell /></ProtectedRoute>}>
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />
          <Route path="/officer/review" element={<OfficerReview />} />
          <Route path="/officer/analytics" element={<OfficerAnalytics />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
