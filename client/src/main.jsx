import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '@fontsource-variable/ibm-plex-sans';
import './index.css';
import App from './App.jsx';
import { store } from './store/store.js';
import { theme } from './theme/theme.js';
import { setupWorker } from 'msw/browser';
import { handlers } from './mocks/handlers.js';

// В dev-режиме MSW моки для авторизации
if (import.meta.env.DEV) {
  const worker = setupWorker(...handlers);
  worker.start();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
