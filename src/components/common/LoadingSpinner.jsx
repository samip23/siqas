import { Box, CircularProgress, Typography } from '@mui/material'

export default function LoadingSpinner({ message = 'Loading…', size = 48, fullPage = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullPage
          ? { position: 'fixed', inset: 0, bgcolor: 'rgba(255,255,255,0.85)', zIndex: 9999 }
          : { py: 8 }),
      }}
    >
      <CircularProgress size={size} thickness={4} sx={{ color: 'primary.main' }} />
      {message && (
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {message}
        </Typography>
      )}
    </Box>
  )
}
