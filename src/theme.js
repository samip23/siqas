import { createTheme } from '@mui/material/styles'

const NAVY = { 50:'#EFF4FB',100:'#D6E3F3',200:'#ADC6E7',300:'#7EA2D5',400:'#4F7EC3',500:'#2860B0',600:'#1D4D9A',700:'#143A82',800:'#0F2A62',900:'#0A1C42',main:'#1A3A6B' }
const TEAL = { light:'#38BDF8', main:'#0EA5E9', dark:'#0284C7' }
const EMERALD = { light:'#34D399', main:'#059669', dark:'#047857', lighter:'#ECFDF5' }
const AMBER = { light:'#FCD34D', main:'#D97706', dark:'#B45309' }
const CRIMSON = { light:'#FCA5A5', main:'#DC2626', dark:'#B91C1C' }

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: NAVY.main,   light: NAVY[500],   dark: NAVY[900],   contrastText: '#FFF' },
    secondary:  { main: TEAL.main,   light: TEAL.light,  dark: TEAL.dark,   contrastText: '#FFF' },
    success:    { main: EMERALD.main, light: EMERALD.light, dark: EMERALD.dark, lighter: EMERALD.lighter },
    warning:    { main: AMBER.main,  light: AMBER.light,  dark: AMBER.dark },
    error:      { main: CRIMSON.main, light: CRIMSON.light, dark: CRIMSON.dark },
    background: { default: '#F1F5FA', paper: '#FFFFFF' },
    text:       { primary: '#0F1929', secondary: '#546E8A', disabled: '#9EB3C9' },
    divider:    'rgba(15,25,41,0.08)',
    navy:       NAVY,
    teal:       TEAL,
  },
  typography: {
    fontFamily: '"Inter","Roboto","Helvetica Neue","Arial",sans-serif',
    h3: { fontWeight:800, letterSpacing:'-0.75px' },
    h4: { fontWeight:800, letterSpacing:'-0.5px' },
    h5: { fontWeight:700, letterSpacing:'-0.3px' },
    h6: { fontWeight:700, letterSpacing:'-0.1px' },
    subtitle1: { fontWeight:600, lineHeight:1.5 },
    subtitle2: { fontWeight:600, color:'#546E8A', letterSpacing:'0.01em' },
    body2:     { color:'#546E8A', lineHeight:1.6 },
    caption:   { fontSize:'0.72rem', letterSpacing:'0.02em' },
    overline:  { fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.10em' },
    button:    { fontWeight:700, textTransform:'none', letterSpacing:'0.01em' },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0 1px 3px rgba(15,25,41,0.06),0 1px 2px rgba(15,25,41,0.04)',
    '0 2px 8px rgba(15,25,41,0.08)',
    '0 4px 16px rgba(15,25,41,0.10)',
    '0 6px 24px rgba(15,25,41,0.12)',
    '0 8px 32px rgba(15,25,41,0.14)',
    ...Array(19).fill('0 12px 48px rgba(15,25,41,0.16)'),
  ],
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `linear-gradient(135deg, ${NAVY[900]} 0%, ${NAVY.main} 100%)`,
          boxShadow: '0 2px 16px rgba(10,28,66,0.35)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(15,25,41,0.07)',
          border: '1px solid rgba(15,25,41,0.06)',
          borderRadius: 14,
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius:9, padding:'8px 22px', fontSize:'0.875rem' },
        containedPrimary: {
          background: `linear-gradient(135deg, ${NAVY[500]} 0%, ${NAVY.main} 100%)`,
          boxShadow: '0 2px 8px rgba(26,58,107,0.40)',
          '&:hover': {
            background: `linear-gradient(135deg, ${NAVY.main} 0%, ${NAVY[800]} 100%)`,
            boxShadow: '0 4px 14px rgba(26,58,107,0.50)',
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${TEAL.main} 0%, ${TEAL.dark} 100%)`,
          boxShadow: '0 2px 8px rgba(14,165,233,0.35)',
        },
        outlinedPrimary: { borderWidth:1.5, '&:hover':{ borderWidth:1.5 } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight:700, fontSize:'0.74rem', borderRadius:6 } },
    },
    MuiPaper: {
      styleOverrides: { rounded: { borderRadius:14 } },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius:12, borderWidth:1, borderStyle:'solid' },
        standardInfo:    { borderColor:'#BFDBFE' },
        standardSuccess: { borderColor:'#6EE7B7' },
        standardWarning: { borderColor:'#FDE68A' },
        standardError:   { borderColor:'#FCA5A5' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight:800, fontSize:'0.78rem', color:'#0F1929', backgroundColor:'#F1F5FA', letterSpacing:'0.02em', textTransform:'uppercase' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: { root:{ borderRadius:99 }, bar:{ borderRadius:99 } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: NAVY[900], fontSize:'0.78rem', fontWeight:500, borderRadius:8, padding:'6px 12px' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius:18, boxShadow:'0 24px 80px rgba(15,25,41,0.20)' },
      },
    },
  },
})

export default theme
