import { Alert, AlertTitle, Button, Collapse } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'

export default function ErrorAlert({ title = 'Something went wrong', message, onRetry, sx }) {
  return (
    <Collapse in>
      <Alert
        severity="error"
        sx={{ borderRadius: 2, ...sx }}
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              Retry
            </Button>
          )
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Collapse>
  )
}
