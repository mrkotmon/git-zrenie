import { ErrorBoundary } from '@sentry/react';
import { Alert, Button, Stack } from '@mui/material';

function ErrorFallback({ resetError }) {
  return (
    <Stack sx={{ maxWidth: 560, mx: 'auto', mt: 6, p: 2 }} spacing={2}>
      <Alert severity="error" role="alert">
        Произошла ошибка. Попробуйте ещё раз или обновите страницу.
      </Alert>
      <Button variant="contained" onClick={resetError}>
        Попробовать снова
      </Button>
    </Stack>
  );
}

export default function AppErrorBoundary({ children }) {
  return (
    <ErrorBoundary fallback={({ resetError }) => <ErrorFallback resetError={resetError} />}>
      {children}
    </ErrorBoundary>
  );
}
