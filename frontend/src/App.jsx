import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

import AppShell from './components/AppShell';
import PageTransition from './components/PageTransition';
import { useAuthStore } from './store/useAuthStore';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Applicant
import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplyWizard from './pages/applicant/Apply';
import ApplicantResult from './pages/applicant/Result';

// Officer
import OfficerDashboard from './pages/officer/Dashboard';
import OfficerReview from './pages/officer/Review';
import OfficerAnalytics from './pages/officer/Analytics';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, role } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  
  return children;
};

// Extracted routes to allow useLocation inside Router
function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    // Global Lenis smooth scrolling configuration
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

        {/* Applicant Routes enclosed in AppShell */}
        <Route element={<ProtectedRoute allowedRole="applicant"><AppShell role="applicant" /></ProtectedRoute>}>
          <Route path="/applicant/dashboard" element={<ApplicantDashboard />} />
          <Route path="/applicant/apply" element={<ApplyWizard />} />
          <Route path="/applicant/result/:id" element={<ApplicantResult />} />
          {/* Legacy route without id mapping just in case */}
          <Route path="/applicant/result" element={<ApplicantResult />} />
        </Route>

        {/* Officer Routes enclosed in AppShell */}
        <Route element={<ProtectedRoute allowedRole="officer"><AppShell role="officer" /></ProtectedRoute>}>
          <Route path="/officer/dashboard" element={<OfficerDashboard />} />
          <Route path="/officer/review/:id" element={<OfficerReview />} />
          <Route path="/officer/analytics" element={<OfficerAnalytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
