import { createTheme } from '@mui/material/styles'

const AMBER  = { main: '#F59E0B', light: '#FCD34D', dark: '#D97706', glow: 'rgba(245,158,11,0.22)' }
const INDIGO = { main: '#818CF8', light: '#A5B4FC', dark: '#4F46E5' }
const EMERALD = { main: '#10B981', light: '#34D399', dark: '#059669' }
const ROSE   = { main: '#F87171', light: '#FECACA', dark: '#EF4444' }
const SKY    = { main: '#60A5FA', light: '#93C5FD', dark: '#2563EB' }

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:   { main: AMBER.main,   light: AMBER.light,   dark: AMBER.dark,   contrastText: '#0C0E14' },
    secondary: { main: INDIGO.main,  light: INDIGO.light,  dark: INDIGO.dark,  contrastText: '#fff' },
    success:   { main: EMERALD.main, light: EMERALD.light, dark: EMERALD.dark },
    warning:   { main: AMBER.main,   light: AMBER.light,   dark: AMBER.dark },
    error:     { main: ROSE.main,    light: ROSE.light,    dark: ROSE.dark },
    info:      { main: SKY.main,     light: SKY.light,     dark: SKY.dark },
    background: { default: '#0D0F18', paper: '#141720' },
    text:       { primary: '#EEF0FF', secondary: '#8891A8', disabled: '#3D4458' },
    divider:    'rgba(238,240,255,0.07)',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans","Figtree",sans-serif',
    h1: { fontFamily: '"Syne",sans-serif', fontWeight: 800, letterSpacing: '-1px' },
    h2: { fontFamily: '"Syne",sans-serif', fontWeight: 800, letterSpacing: '-0.75px' },
    h3: { fontFamily: '"Syne",sans-serif', fontWeight: 700, letterSpacing: '-0.5px' },
    h4: { fontFamily: '"Syne",sans-serif', fontWeight: 700, letterSpacing: '-0.3px' },
    h5: { fontFamily: '"Syne",sans-serif', fontWeight: 700, letterSpacing: '-0.2px' },
    h6: { fontFamily: '"Syne",sans-serif', fontWeight: 700, letterSpacing: '-0.1px' },
    subtitle1: { fontWeight: 600, lineHeight: 1.5 },
    subtitle2: { fontWeight: 600, letterSpacing: '0.01em' },
    body1:  { lineHeight: 1.65 },
    body2:  { lineHeight: 1.6 },
    caption: { fontSize: '0.72rem', letterSpacing: '0.02em' },
    overline: { fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em' },
    button:  { fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0 1px 4px rgba(0,0,0,0.30)',
    '0 2px 8px rgba(0,0,0,0.35)',
    '0 4px 16px rgba(0,0,0,0.40)',
    '0 6px 24px rgba(0,0,0,0.45)',
    '0 8px 32px rgba(0,0,0,0.50)',
    ...Array(19).fill('0 16px 56px rgba(0,0,0,0.55)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#2A2E3E transparent',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(13,15,24,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(238,240,255,0.07)',
          boxShadow: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: '#141720',
          border: '1px solid rgba(238,240,255,0.07)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.40)',
          borderRadius: 16,
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 14 },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 9, padding: '8px 22px', fontSize: '0.875rem' },
        containedPrimary: {
          background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
          color: '#0C0E14',
          fontWeight: 800,
          boxShadow: '0 2px 12px rgba(245,158,11,0.30)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
            boxShadow: '0 4px 24px rgba(245,158,11,0.45)',
          },
          '&:disabled': { opacity: 0.5, color: '#0C0E14' },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #818CF8 0%, #4F46E5 100%)',
          boxShadow: '0 2px 12px rgba(129,140,248,0.30)',
          '&:hover': { boxShadow: '0 4px 24px rgba(129,140,248,0.45)' },
        },
        outlinedPrimary: {
          borderColor: 'rgba(245,158,11,0.35)',
          borderWidth: 1.5,
          '&:hover': { borderWidth: 1.5, borderColor: AMBER.main, bgcolor: AMBER.glow },
        },
        outlinedSecondary: {
          borderWidth: 1.5,
          '&:hover': { borderWidth: 1.5 },
        },
        outlinedError: {
          borderWidth: 1.5,
          '&:hover': { borderWidth: 1.5 },
        },
        text: {
          '&:hover': { bgcolor: 'rgba(238,240,255,0.06)' },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(238,240,255,0.12)', transition: 'border-color 0.18s' },
            '&:hover fieldset': { borderColor: 'rgba(238,240,255,0.28)' },
            '&.Mui-focused fieldset': { borderColor: AMBER.main, borderWidth: 1.5 },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: AMBER.main },
          '& .MuiInputBase-input': { fontFamily: '"Plus Jakarta Sans",sans-serif' },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 700, fontSize: '0.74rem', borderRadius: 6 } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12, borderWidth: 1, borderStyle: 'solid' },
        standardInfo:    { borderColor: 'rgba(96,165,250,0.30)',  backgroundColor: 'rgba(96,165,250,0.08)' },
        standardSuccess: { borderColor: 'rgba(16,185,129,0.30)', backgroundColor: 'rgba(16,185,129,0.08)' },
        standardWarning: { borderColor: 'rgba(245,158,11,0.30)', backgroundColor: 'rgba(245,158,11,0.08)' },
        standardError:   { borderColor: 'rgba(248,113,113,0.30)',backgroundColor: 'rgba(248,113,113,0.08)' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 800,
          fontSize: '0.72rem',
          color: '#8891A8',
          backgroundColor: '#1A1E2C',
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        },
        body: { borderColor: 'rgba(238,240,255,0.06)' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 99, backgroundColor: 'rgba(238,240,255,0.08)' },
        bar:  { borderRadius: 99 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E2235',
          fontSize: '0.78rem',
          fontWeight: 500,
          borderRadius: 8,
          padding: '6px 12px',
          border: '1px solid rgba(238,240,255,0.10)',
        },
        arrow: { color: '#1E2235' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 18,
          boxShadow: '0 24px 80px rgba(0,0,0,0.65)',
          background: '#141720',
          border: '1px solid rgba(238,240,255,0.08)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontFamily: '"Syne",sans-serif', fontWeight: 700 },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: 'rgba(238,240,255,0.07)' } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { background: '#141720', borderColor: 'rgba(238,240,255,0.07)' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-selected': {
            backgroundColor: 'rgba(245,158,11,0.12)',
            '& .MuiListItemIcon-root': { color: AMBER.main },
            '& .MuiListItemText-primary': { color: AMBER.main, fontWeight: 700 },
            '&:hover': { backgroundColor: 'rgba(245,158,11,0.18)' },
          },
          '&:hover': { backgroundColor: 'rgba(238,240,255,0.05)' },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: { root: { color: '#8891A8' } },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { fontFamily: '"Plus Jakarta Sans",sans-serif' },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: { color: '#8891A8' },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected': { backgroundColor: 'rgba(245,158,11,0.12)' },
          '&:hover': { backgroundColor: 'rgba(238,240,255,0.05)' },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(238,240,255,0.07)',
          '--DataGrid-containerBackground': '#1A1E2C',
        },
        columnHeader: { backgroundColor: '#1A1E2C' },
        row: {
          '&:hover': { backgroundColor: 'rgba(238,240,255,0.03)' },
          '&.Mui-selected': { backgroundColor: 'rgba(245,158,11,0.08)', '&:hover': { backgroundColor: 'rgba(245,158,11,0.12)' } },
        },
        cell: { borderColor: 'rgba(238,240,255,0.05)' },
        footerContainer: { borderColor: 'rgba(238,240,255,0.07)', backgroundColor: '#1A1E2C' },
      },
    },
  },
})

export default theme
