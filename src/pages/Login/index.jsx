import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, Stack, Link, InputAdornment, IconButton,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import LoginIcon from '@mui/icons-material/Login'
import { useAuth } from '../../context/AuthContext'
import { QAShieldMark } from '../../components/illustrations/Illustrations'

export default function Login() {
  const navigate = useNavigate()
  const { logIn } = useAuth()

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await logIn(email, password)
      navigate('/upload', { replace: true })
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A1C42 0%, #1A3A6B 55%, #1D5FA8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      p: 2,
    }}>
      <Card sx={{ width: '100%', maxWidth: 420, borderRadius: 4, boxShadow: '0 24px 80px rgba(10,28,66,0.50)' }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>

          {/* Logo */}
          <Stack alignItems="center" spacing={1} mb={3.5}>
            <QAShieldMark size={52} color="#1A3A6B" accentColor="#0EA5E9" />
            <Box textAlign="center">
              <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', letterSpacing: '-0.4px', color: '#0F1929', lineHeight: 1.1 }}>
                SIQAS
              </Typography>
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 600, color: 'text.secondary', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                QA Feature Tracker
              </Typography>
            </Box>
          </Stack>

          <Typography variant="h5" fontWeight={800} mb={0.5} textAlign="center">
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
                autoFocus
              />
              <TextField
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPwd(v => !v)} edge="end" size="small">
                        {showPwd ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={!loading && <LoginIcon />}
                sx={{ py: 1.4, fontWeight: 700, fontSize: '0.95rem' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/signup" fontWeight={700} underline="hover">
              Create one
            </Link>
          </Typography>

        </CardContent>
      </Card>
    </Box>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password. Please try again.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact your administrator.'
    default:
      return 'Sign in failed. Please check your credentials and try again.'
  }
}
