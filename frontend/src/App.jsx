import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { ProtectedRoute, PublicOnlyRoute } from './auth/routes'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'
import NotFound from './pages/NotFound'

// Chunk 1: landing, register, login and dashboard.
// Pages built in later weeks show a "coming soon" placeholder so no link is broken.
export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

          {/* Later weeks */}
          <Route path="/search" element={<ComingSoon title="Search" />} />
          <Route path="/emergency" element={<ComingSoon title="Emergency search" />} />
          <Route path="/dsa" element={<ComingSoon title="The DSA lab" />} />
          <Route path="/providers/:id" element={<ComingSoon title="Provider profile" />} />
          <Route path="/providers/:id/book" element={<ProtectedRoute role="customer"><ComingSoon title="Booking" /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute role="customer"><ComingSoon title="My bookings" /></ProtectedRoute>} />
          <Route path="/bookings/:id" element={<ProtectedRoute><ComingSoon title="Booking details" /></ProtectedRoute>} />
          <Route path="/provider/bookings" element={<ProtectedRoute role="provider"><ComingSoon title="Provider jobs" /></ProtectedRoute>} />
          <Route path="/provider/settings" element={<ProtectedRoute role="provider"><ComingSoon title="Provider settings" /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ComingSoon title="Profile" /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
