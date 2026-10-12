import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import Spinner from '../components/Spinner'

export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Spinner label="Checking your session" />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />
  return children
}

export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner label="Loading" />
  return user ? <Navigate to="/dashboard" replace /> : children
}
