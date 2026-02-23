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
import BugReportIcon from '@mui/icons-material/BugReport'
import { QAShieldMark } from '../illustrations/Illustrations'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { label: 'Feature Upload',    path: '/upload',         icon: <UploadFileIcon   fontSize="small" /> },
  { label: 'Dashboard',         path: '/dashboard',      icon: <DashboardIcon    fontSize="small" /> },
  { label: 'Test Generator',    path: '/test-generator', icon: <AutoAwesomeIcon  fontSize="small" /> },
  { label: 'Bulletin Board',    path: '/bulletin',       icon: <CampaignIcon     fontSize="small" /> },
  { label: 'Defects',           path: '/defects',        icon: <BugReportIcon    fontSize="small" /> },
]

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const theme     = useTheme()
  const isMobile  = useMediaQuery(theme.breakpoints.down('sm'))
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
        <Toolbar sx={{ gap: 0.5, minHeight: { xs: 60, sm: 64 }, px: { xs: 2, sm: 3 } }}>

          {/* Logo */}
          <Box
            onClick={() => navigate('/upload')}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.25,
              cursor: 'pointer', mr: { sm: 4 },
              flexGrow: { xs: 1, sm: 0 }, userSelect: 'none',
              '&:hover': { opacity: 0.80 }, transition: 'opacity 0.18s',
            }}
          >
            <QAShieldMark size={30} color="#F59E0B" accentColor="#FCD34D" />
            <Box>
              <Typography sx={{
                fontFamily: '"Syne",sans-serif',
                fontWeight: 800, fontSize: '1.05rem',
                letterSpacing: '-0.2px', color: '#EEF0FF', lineHeight: 1.1,
              }}>
                SIQAS
              </Typography>
              <Typography sx={{
                fontSize: '0.58rem', fontWeight: 600,
                color: 'rgba(238,240,255,0.30)',
                letterSpacing: '0.10em', textTransform: 'uppercase', lineHeight: 1,
              }}>
                QA Tracker
              </Typography>
            </Box>
          </Box>

          {/* Desktop nav links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.25, flexGrow: 1 }}>
              {NAV_LINKS.map(link => {
                const active = isActive(link.path)
                return (
                  <Button
                    key={link.path}
                    startIcon={link.icon}
                    onClick={() => navigate(link.path)}
                    sx={{
                      color: active ? '#F59E0B' : 'rgba(238,240,255,0.45)',
                      bgcolor: active ? 'rgba(245,158,11,0.10)' : 'transparent',
                      border: active ? '1px solid rgba(245,158,11,0.20)' : '1px solid transparent',
                      borderRadius: '8px',
                      px: 1.75, py: 0.85,
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.84rem',
                      transition: 'all 0.16s ease',
                      '& .MuiButton-startIcon': {
                        color: active ? '#F59E0B' : 'rgba(238,240,255,0.30)',
                        transition: 'color 0.16s',
                      },
                      '&:hover': {
                        bgcolor: 'rgba(238,240,255,0.06)',
                        color: 'rgba(238,240,255,0.85)',
                        border: '1px solid rgba(238,240,255,0.08)',
                        '& .MuiButton-startIcon': { color: 'rgba(238,240,255,0.60)' },
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                )
              })}
            </Box>
          )}

          {/* Desktop: user info + logout */}
          {!isMobile && currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={currentUser.email} placement="bottom-end">
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  bgcolor: 'rgba(238,240,255,0.04)',
                  border: '1px solid rgba(238,240,255,0.08)',
                  borderRadius: '9px', px: 1.25, py: 0.55,
                  cursor: 'default',
                }}>
                  <Avatar sx={{
                    width: 24, height: 24,
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    color: '#0C0E14',
                    fontSize: '0.68rem', fontWeight: 800,
                  }}>
                    {avatarLetter}
                  </Avatar>
                  <Typography sx={{
                    color: 'rgba(238,240,255,0.55)',
                    fontSize: '0.80rem', fontWeight: 500,
                    maxWidth: 150, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {currentUser.email}
                  </Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Sign out">
                <IconButton
                  onClick={handleLogout}
                  size="small"
                  sx={{
                    color: 'rgba(238,240,255,0.30)',
                    transition: 'all 0.16s',
                    '&:hover': { color: '#F87171', bgcolor: 'rgba(248,113,113,0.10)' },
                  }}
                >
                  <LogoutIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ ml: 'auto', color: 'rgba(238,240,255,0.60)' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 265,
            borderRadius: '16px 0 0 16px',
            background: '#141720',
            borderLeft: '1px solid rgba(238,240,255,0.07)',
          },
        }}
      >
        {/* Drawer header */}
        <Box sx={{
          p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5,
          borderBottom: '1px solid rgba(238,240,255,0.07)',
        }}>
          <QAShieldMark size={30} color="#F59E0B" accentColor="#FCD34D" />
          <Box>
            <Typography sx={{
              fontFamily: '"Syne",sans-serif',
              fontWeight: 800, color: '#EEF0FF', fontSize: '1.0rem', lineHeight: 1.1,
            }}>
              SIQAS
            </Typography>
            <Typography sx={{
              fontSize: '0.60rem', color: 'rgba(238,240,255,0.30)',
              letterSpacing: '0.09em', textTransform: 'uppercase',
            }}>
              QA Feature Tracker
            </Typography>
          </Box>
        </Box>

        {/* User info */}
        {currentUser && (
          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Avatar sx={{
              width: 30, height: 30,
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: '#0C0E14', fontSize: '0.76rem', fontWeight: 800,
            }}>
              {avatarLetter}
            </Avatar>
            <Typography
              variant="caption"
              fontWeight={600}
              sx={{ color: '#8891A8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {currentUser.email}
            </Typography>
          </Box>
        )}
        <Divider />

        <List sx={{ pt: 1, px: 1 }}>
          {NAV_LINKS.map(link => {
            const active = isActive(link.path)
            return (
              <ListItemButton
                key={link.path}
                selected={active}
                onClick={() => { navigate(link.path); setDrawerOpen(false) }}
                sx={{ my: 0.25 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{link.icon}</ListItemIcon>
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 700 : 400 }}
                />
              </ListItemButton>
            )
          })}
        </List>

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(238,240,255,0.07)' }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={() => { setDrawerOpen(false); handleLogout() }}
            sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.85rem' }}
          >
            Sign Out
          </Button>
        </Box>
      </Drawer>
    </>
  )
}
