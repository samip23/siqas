import { useState, useEffect } from 'react'
import {
  Box, Typography, TextField, Button, Avatar,
  CircularProgress, Snackbar, Alert, Tooltip,
  Divider,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import SaveIcon from '@mui/icons-material/Save'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../hooks/useProfile'

const AVATAR_COLORS = [
  { hex: '#F59E0B', label: 'Amber'   },
  { hex: '#818CF8', label: 'Indigo'  },
  { hex: '#10B981', label: 'Emerald' },
  { hex: '#F87171', label: 'Rose'    },
  { hex: '#8B5CF6', label: 'Violet'  },
  { hex: '#38BDF8', label: 'Sky'     },
  { hex: '#34D399', label: 'Teal'    },
  { hex: '#FB923C', label: 'Orange'  },
]

const INIT = { displayName: '', jobTitle: '', department: '', bio: '', avatarColor: '#F59E0B' }

export default function Profile() {
  const { currentUser } = useAuth()
  const { profile, loading, saving, error: hookError, saveProfile } = useProfile(currentUser?.uid)

  const [form, setForm]           = useState(INIT)
  const [formError, setFormError] = useState('')
  const [success, setSuccess]     = useState(false)

  // Populate form once profile loads
  useEffect(() => {
    if (profile) setForm(profile)
  }, [profile])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const setColor = hex => setForm(f => ({ ...f, avatarColor: hex }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.displayName.trim()) { setFormError('Display name is required.'); return }
    setFormError('')
    try {
      await saveProfile(form)
      setSuccess(true)
    } catch {
      // error shown via hookError
    }
  }

  const avatarLetter = (form.displayName || currentUser?.email || '?')[0].toUpperCase()

  return (
    <Box sx={{ maxWidth: 680, mx: 'auto' }}>

      {/* Hero */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #1a1f3a 50%, #0F172A 100%)',
        borderRadius: 3,
        border: '1px solid rgba(129,140,248,0.20)',
        p: { xs: 3, sm: 4 },
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative dot grid */}
        <Box sx={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(rgba(238,240,255,0.8) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          pointerEvents: 'none',
        }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'rgba(129,140,248,0.18)',
            border: '1px solid rgba(129,140,248,0.30)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PersonIcon sx={{ color: '#818CF8', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{
              fontFamily: '"Syne",sans-serif', fontWeight: 800,
              fontSize: { xs: '1.4rem', sm: '1.75rem' },
              color: '#EEF0FF', lineHeight: 1.15,
            }}>
              Your Profile
            </Typography>
            <Typography sx={{ color: 'rgba(238,240,255,0.45)', fontSize: '0.88rem', mt: 0.25 }}>
              Customise how you appear across the app
            </Typography>
          </Box>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#818CF8' }} />
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

          {/* Avatar preview + colour picker */}
          <Box sx={{
            bgcolor: '#141720',
            border: '1px solid rgba(238,240,255,0.08)',
            borderRadius: 3,
            p: 3,
          }}>
            <Typography sx={{ color: 'rgba(238,240,255,0.55)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
              Avatar
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Avatar sx={{
                width: 72, height: 72,
                background: `linear-gradient(135deg, ${form.avatarColor}, ${form.avatarColor}CC)`,
                color: '#0C0E14',
                fontSize: '1.8rem', fontWeight: 800,
                fontFamily: '"Syne",sans-serif',
                boxShadow: `0 4px 20px ${form.avatarColor}55`,
                flexShrink: 0,
              }}>
                {avatarLetter}
              </Avatar>
              <Box>
                <Typography sx={{ color: 'rgba(238,240,255,0.45)', fontSize: '0.80rem', mb: 1.5 }}>
                  Choose a colour
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {AVATAR_COLORS.map(({ hex, label }) => (
                    <Tooltip key={hex} title={label} placement="top">
                      <Box
                        onClick={() => setColor(hex)}
                        sx={{
                          width: 30, height: 30, borderRadius: '50%',
                          bgcolor: hex, cursor: 'pointer',
                          border: form.avatarColor === hex
                            ? `3px solid #EEF0FF`
                            : '3px solid transparent',
                          boxShadow: form.avatarColor === hex ? `0 0 0 1px ${hex}` : 'none',
                          transition: 'all 0.15s ease',
                          '&:hover': { transform: 'scale(1.15)' },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Profile info form */}
          <Box sx={{
            bgcolor: '#141720',
            border: '1px solid rgba(238,240,255,0.08)',
            borderRadius: 3,
            p: 3,
            display: 'flex', flexDirection: 'column', gap: 2.5,
          }}>
            <Typography sx={{ color: 'rgba(238,240,255,0.55)', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Profile Info
            </Typography>

            <TextField
              label="Display Name"
              value={form.displayName}
              onChange={set('displayName')}
              required
              fullWidth
              error={!!formError}
              helperText={formError || 'Shown in the navbar and across the app'}
              inputProps={{ maxLength: 40 }}
            />

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                label="Job Title"
                value={form.jobTitle}
                onChange={set('jobTitle')}
                fullWidth
                placeholder="e.g. QA Engineer"
                inputProps={{ maxLength: 60 }}
              />
              <TextField
                label="Department"
                value={form.department}
                onChange={set('department')}
                fullWidth
                placeholder="e.g. Engineering"
                inputProps={{ maxLength: 60 }}
              />
            </Box>

            <TextField
              label="Bio"
              value={form.bio}
              onChange={set('bio')}
              fullWidth
              multiline
              rows={3}
              placeholder="A short description about yourself…"
              inputProps={{ maxLength: 200 }}
              helperText={`${form.bio.length}/200`}
            />

            <Divider sx={{ borderColor: 'rgba(238,240,255,0.08)' }} />

            {/* Read-only email */}
            <Box>
              <Typography sx={{ color: 'rgba(238,240,255,0.35)', fontSize: '0.76rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.75 }}>
                Email (not editable)
              </Typography>
              <Typography sx={{ color: 'rgba(238,240,255,0.45)', fontSize: '0.93rem' }}>
                {currentUser?.email}
              </Typography>
            </Box>
          </Box>

          {/* Error from hook */}
          {hookError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>{hookError}</Alert>
          )}

          {/* Save button */}
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <SaveIcon />}
            sx={{
              alignSelf: 'flex-start',
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              color: '#fff',
              fontWeight: 700,
              px: 3.5, py: 1.1,
              borderRadius: '10px',
              fontSize: '0.92rem',
              boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
              '&:hover': { background: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)' },
              '&.Mui-disabled': { opacity: 0.6 },
            }}
          >
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
        </Box>
      )}

      {/* Success snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccess(false)}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          Profile updated!
        </Alert>
      </Snackbar>
    </Box>
  )
}
