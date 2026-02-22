import { Box, Typography, Button } from '@mui/material'
import InboxIcon from '@mui/icons-material/Inbox'

export default function EmptyState({ icon, title = 'No data yet', description, action, actionLabel }) {
  const Icon = icon ?? InboxIcon
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          opacity: 0.08,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
          position: 'relative',
        }}
      >
        <Icon
          sx={{
            fontSize: 36,
            color: 'primary.main',
            opacity: 1,
            position: 'absolute',
          }}
        />
      </Box>
      <Typography variant="h6" color="text.primary" fontWeight={600}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={360}>
          {description}
        </Typography>
      )}
      {action && actionLabel && (
        <Button variant="contained" sx={{ mt: 1 }} onClick={action}>
          {actionLabel}
        </Button>
      )}
    </Box>
  )
}
