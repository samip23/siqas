import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, TextField, Button,
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

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

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
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#0D0F18' }}>

      {/* ── Left brand panel (desktop only) ──────────────────────────────── */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: '0 0 46%',
        flexDirection: 'column',
        justifyContent: 'center',
        p: { md: 7, lg: 9 },
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #0D0F18 0%, #111520 60%, #161B2A 100%)',
        borderRight: '1px solid rgba(238,240,255,0.06)',
      }}>

        {/* Decorative amber glow — top right */}
        <Box sx={{
          position: 'absolute', top: -120, right: -120,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Decorative indigo glow — bottom left */}
        <Box sx={{
          position: 'absolute', bottom: -80, left: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Subtle grid texture */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: `
            repeating-linear-gradient(0deg, #EEF0FF 0px, #EEF0FF 1px, transparent 1px, transparent 40px),
            repeating-linear-gradient(90deg, #EEF0FF 0px, #EEF0FF 1px, transparent 1px, transparent 40px)
          `,
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 5 }}>
            <QAShieldMark size={42} color="#F59E0B" accentColor="#FCD34D" />
            <Box>
              <Typography sx={{
                fontFamily: '"Syne",sans-serif', fontWeight: 800,
                fontSize: '1.35rem', color: '#EEF0FF', lineHeight: 1,
              }}>
                SIQAS
              </Typography>
              <Typography sx={{
                fontSize: '0.62rem', fontWeight: 600,
                color: 'rgba(238,240,255,0.30)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                QA Feature Tracker
              </Typography>
            </Box>
          </Box>

          <Typography sx={{
            fontFamily: '"Syne",sans-serif', fontWeight: 800,
            fontSize: { md: '2.4rem', lg: '2.8rem' },
            color: '#EEF0FF', lineHeight: 1.12, mb: 2,
            letterSpacing: '-0.5px',
          }}>
            Quality starts<br />
            <Box component="span" sx={{ color: '#F59E0B' }}>here.</Box>
          </Typography>

          <Typography sx={{
            color: '#5A6480', fontSize: '0.95rem', lineHeight: 1.75,
            maxWidth: 340, mb: 5,
          }}>
            Precision tools for QA teams — track sprint features,
            generate AI-powered test cases, and keep your team in sync.
          </Typography>

          <Stack spacing={1.75}>
            {[
              { label: 'Sprint feature tracking',       dot: '#F59E0B' },
              { label: 'AI-powered test generation',    dot: '#818CF8' },
              { label: 'Real-time team bulletin board', dot: '#10B981' },
              { label: 'Analytics & sprint dashboards', dot: '#60A5FA' },
            ].map(f => (
              <Box key={f.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 7, height: 7, borderRadius: '50%',
                  bgcolor: f.dot, flexShrink: 0,
                  boxShadow: `0 0 8px ${f.dot}80`,
                }} />
                <Typography sx={{ color: '#5A6480', fontSize: '0.9rem', fontWeight: 500 }}>
                  {f.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Status indicator */}
        <Box sx={{
          position: 'absolute', bottom: 28, left: { md: 56, lg: 72 },
          display: 'flex', alignItems: 'center', gap: 1,
        }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10B981', boxShadow: '0 0 6px #10B98180' }} />
          <Typography sx={{ fontSize: '0.72rem', color: '#3D4458', fontWeight: 500 }}>
            All systems operational
          </Typography>
        </Box>
      </Box>

      {/* ── Right form panel ──────────────────────────────────────────────── */}
      <Box sx={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', p: { xs: 3, sm: 4 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <QAShieldMark size={34} color="#F59E0B" accentColor="#FCD34D" />
            <Box>
              <Typography sx={{
                fontFamily: '"Syne",sans-serif', fontWeight: 800,
                color: '#EEF0FF', fontSize: '1.1rem', lineHeight: 1.1,
              }}>
                SIQAS
              </Typography>
              <Typography sx={{
                fontSize: '0.60rem', color: 'rgba(238,240,255,0.30)',
                letterSpacing: '0.10em', textTransform: 'uppercase',
              }}>
                QA Feature Tracker
              </Typography>
            </Box>
          </Box>

          <Typography sx={{
            fontFamily: '"Syne",sans-serif', fontWeight: 800,
            fontSize: '1.85rem', color: '#EEF0FF', mb: 0.75, letterSpacing: '-0.3px',
          }}>
            Welcome back
          </Typography>
          <Typography sx={{ color: '#5A6480', mb: 4, fontSize: '0.94rem' }}>
            Sign in to your workspace to continue.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
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
                required fullWidth autoComplete="email" autoFocus
              />
              <TextField
                label="Password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required fullWidth autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPwd(v => !v)}
                        edge="end" size="small"
                        sx={{ color: '#5A6480', '&:hover': { color: '#EEF0FF' } }}
                      >
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
                sx={{ py: 1.5, mt: 0.5 }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Typography variant="body2" textAlign="center" mt={4} sx={{ color: '#3D4458' }}>
            Don't have an account?{' '}
            <Link component={RouterLink} to="/signup" fontWeight={700} underline="hover" sx={{ color: '#F59E0B' }}>
              Create one
            </Link>
          </Typography>
        </Box>
      </Box>
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
