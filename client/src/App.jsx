import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './pages/SearchPage';
import { ProviderDetailPage } from './pages/ProviderDetailPage';
import { BookingFlowPage } from './pages/BookingFlowPage';
import { PaymentPage } from './pages/PaymentPage';
import { CustomerBookingsPage } from './pages/CustomerBookingsPage';
import { ProviderDashboardPage } from './pages/ProviderDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { BookingTrackingPage } from './pages/BookingTrackingPage';
import { ServicesPage } from './pages/ServicesPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ForProfessionalsPage } from './pages/ForProfessionalsPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { SafetyPage } from './pages/SafetyPage';

// Role Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center text-sm font-semibold text-muted">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-bg text-ink selection:bg-accent/20">
          <Navbar />
          <div className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/providers/:id" element={<ProviderDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/for-professionals" element={<ForProfessionalsPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/safety" element={<SafetyPage />} />
              <Route path="/terms" element={<SafetyPage />} />
              <Route path="/privacy" element={<SafetyPage />} />

              {/* Live Route Tracking */}
              <Route
                path="/track/:bookingId"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                    <BookingTrackingPage />
                  </ProtectedRoute>
                }
              />

              {/* Customer Routes */}
              <Route
                path="/book/:providerId"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                    <BookingFlowPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pay/:bookingId"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
                    <PaymentPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer/bookings"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Provider Dashboard */}
              <Route
                path="/provider/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['provider']}>
                    <ProviderDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Portal */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
