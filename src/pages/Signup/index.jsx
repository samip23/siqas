import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Alert, Stack, Link, InputAdornment, IconButton,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { useAuth } from '../../context/AuthContext'
import { QAShieldMark } from '../../components/illustrations/Illustrations'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPwd, setShowPwd]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await signUp(email, password)
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
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Get started with SIQAS today
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
                autoComplete="new-password"
                helperText="Minimum 6 characters"
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
              <TextField
                label="Confirm password"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                fullWidth
                autoComplete="new-password"
                error={confirm.length > 0 && confirm !== password}
                helperText={confirm.length > 0 && confirm !== password ? 'Passwords do not match' : ''}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(v => !v)} edge="end" size="small">
                        {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
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
                startIcon={!loading && <PersonAddIcon />}
                sx={{ py: 1.4, fontWeight: 700, fontSize: '0.95rem' }}
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" fontWeight={700} underline="hover">
              Sign in
            </Link>
          </Typography>

        </CardContent>
      </Card>
    </Box>
  )
}

function friendlyError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.'
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Contact your administrator.'
    default:
      return 'Account creation failed. Please try again.'
  }
}
