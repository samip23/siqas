import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Navigation/Navbar'
import ProtectedRoute from './components/Navigation/ProtectedRoute'
import FeatureUpload from './pages/FeatureUpload'
import Dashboard from './pages/Dashboard'
import TestGenerator from './pages/TestGenerator'
import Bulletin from './pages/Bulletin'
import Defects from './pages/Defects'
import TestPlans from './pages/TestPlans'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Layout shown to authenticated users: Navbar + page content
function AppLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, bgcolor: 'background.default', py: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Outlet />
      </Box>
    </Box>
  )
}

// Redirects authenticated users away from /login and /signup
function PublicOnlyRoute({ children }) {
  const { currentUser, authLoading } = useAuth()
  if (authLoading) return null
  if (currentUser) return <Navigate to="/upload" replace />
  return children
}

function AppShell() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"  element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />

      {/* Protected routes — require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/"          element={<Navigate to="/upload" replace />} />
          <Route path="/upload"          element={<FeatureUpload />} />
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/test-generator"  element={<TestGenerator />} />
          <Route path="/bulletin"        element={<Bulletin />} />
          <Route path="/defects"         element={<Defects />} />
          <Route path="/test-plans"      element={<TestPlans />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="*"          element={<Navigate to="/upload" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}
