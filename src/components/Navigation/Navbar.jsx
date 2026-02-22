import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Button, Box,
  IconButton, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, Divider, useMediaQuery, useTheme,
  Tooltip, Avatar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LogoutIcon from '@mui/icons-material/Logout'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import CampaignIcon from '@mui/icons-material/Campaign'
import { QAShieldMark } from '../illustrations/Illustrations'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { label: 'Feature Upload',    path: '/upload',         icon: <UploadFileIcon   fontSize="small" /> },
  { label: 'Dashboard',         path: '/dashboard',      icon: <DashboardIcon    fontSize="small" /> },
  { label: 'Test Generator',    path: '/test-generator', icon: <AutoAwesomeIcon  fontSize="small" /> },
  { label: 'Bulletin Board',    path: '/bulletin',       icon: <CampaignIcon     fontSize="small" /> },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { currentUser, logOut } = useAuth()
  const isActive = path => location.pathname === path

  const avatarLetter = currentUser?.email?.[0]?.toUpperCase() ?? '?'

  async function handleLogout() {
    await logOut()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 1, minHeight: { xs: 60, sm: 64 }, px: { xs: 2, sm: 3 } }}>

          {/* Logo */}
          <Box onClick={() => navigate('/upload')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: 'pointer', mr: { sm: 4 }, flexGrow: { xs: 1, sm: 0 }, userSelect: 'none' }}>
            <QAShieldMark size={34} color="#FFFFFF" accentColor="#0EA5E9" />
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.4px', color: 'white', lineHeight: 1.1 }}>SIQAS</Typography>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 500, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1 }}>
                QA Feature Tracker
              </Typography>
            </Box>
          </Box>

          {/* Desktop nav links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
              {NAV_LINKS.map(link => {
                const active = isActive(link.path)
                return (
                  <Button key={link.path} startIcon={link.icon} onClick={() => navigate(link.path)}
                    sx={{
                      color: active ? 'white' : 'rgba(255,255,255,0.65)',
                      bgcolor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                      borderRadius: '8px', px: 2, py: 0.85, fontWeight: active ? 700 : 500, fontSize: '0.875rem',
                      position: 'relative', transition: 'all 0.18s ease',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.10)', color: 'white' },
                      '&::after': active ? {
                        content: '""', position: 'absolute', bottom: 0, left: '50%',
                        transform: 'translateX(-50%)', width: '60%', height: '2.5px',
                        bgcolor: '#0EA5E9', borderRadius: '2px 2px 0 0',
                      } : {},
                    }}
                  >{link.label}</Button>
                )
              })}
            </Box>
          )}

          {/* Desktop: user avatar + email + logout */}
          {!isMobile && currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={currentUser.email} placement="bottom">
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '8px', px: 1.25, py: 0.5, cursor: 'default',
                }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: '#0EA5E9', fontSize: '0.70rem', fontWeight: 800 }}>
                    {avatarLetter}
                  </Avatar>
                  <Typography sx={{
                    color: 'rgba(255,255,255,0.80)', fontSize: '0.80rem', fontWeight: 500,
                    maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {currentUser.email}
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Sign out">
                <IconButton onClick={handleLogout} size="small" sx={{
                  color: 'rgba(255,255,255,0.65)',
                  '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.10)' },
                }}>
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {isMobile && (
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ ml: 'auto' }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 260, borderRadius: '16px 0 0 16px' } }}>
        <Box sx={{ background: 'linear-gradient(135deg, #0A1C42 0%, #1A3A6B 100%)', p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <QAShieldMark size={32} color="#FFFFFF" accentColor="#0EA5E9" />
          <Box>
            <Typography sx={{ fontWeight: 900, color: 'white', fontSize: '1.05rem', lineHeight: 1.1 }}>SIQAS</Typography>
            <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              QA Feature Tracker
            </Typography>
          </Box>
        </Box>
        <Divider />

        {/* User info */}
        {currentUser && (
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#0EA5E9', fontSize: '0.78rem', fontWeight: 800 }}>
              {avatarLetter}
            </Avatar>
            <Typography variant="caption" fontWeight={600} color="text.secondary"
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser.email}
            </Typography>
          </Box>
        )}
        <Divider />

        <List sx={{ pt: 1 }}>
          {NAV_LINKS.map(link => {
            const active = isActive(link.path)
            return (
              <ListItemButton key={link.path} selected={active}
                onClick={() => { navigate(link.path); setDrawerOpen(false) }}
                sx={{ mx: 1, my: 0.25, borderRadius: 2,
                  '&.Mui-selected': { bgcolor: '#EFF4FB', '& .MuiListItemIcon-root': { color: 'primary.main' }, '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 } } }}>
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'text.secondary' }}>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 700 : 400 }} />
              </ListItemButton>
            )
          })}
        </List>

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button fullWidth variant="outlined" color="error" startIcon={<LogoutIcon />}
            onClick={() => { setDrawerOpen(false); handleLogout() }}
            sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}>
            Sign Out
          </Button>
        </Box>
      </Drawer>
    </>
  )
}
