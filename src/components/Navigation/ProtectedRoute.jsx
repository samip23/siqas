import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

export default function ProtectedRoute() {
  const { currentUser, authLoading } = useAuth()

  if (authLoading) return <LoadingSpinner message="Checking authentication…" />
  if (!currentUser) return <Navigate to="/login" replace />
  return <Outlet />
}
