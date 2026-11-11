import './monitoring/sentry';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource-variable/ibm-plex-sans';
import './index.css';
import App from './App.jsx';
import AppErrorBoundary from './components/AppErrorBoundary';
import { store } from './store/store.js';
import { theme } from './theme/theme.js';

// Моки MSW включаются только при разработке и только если не запущен настоящий сервер:
// VITE_USE_MOCKS=false в client/.env.local отправляет /api на server.
// Динамический import не даёт MSW попасть в сборку для GitHub Pages.
async function enableMocks() {
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCKS?.trim() === 'false') return;
  const { setupWorker } = await import('msw/browser');
  const { handlers } = await import('./mocks/handlers.js');
  await setupWorker(...handlers).start({ onUnhandledRequest: 'bypass' });
}

await enableMocks();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <AppErrorBoundary>
            <App />
          </AppErrorBoundary>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
