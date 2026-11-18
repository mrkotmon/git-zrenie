import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createStore } from '../store/store.js';
import { theme } from '../theme/theme.js';
import App from '../App.jsx';

export const demoUser = {
  id: 1,
  github_id: 42,
  login: 'ada',
  avatar_url: 'https://avatars.example/ada.png',
  created_at: '2026-09-15T10:00:00Z',
};

export const signedInState = {
  auth: {
    user: demoUser,
    loading: false,
    error: null,
    isAuthenticated: true,
    initialized: true,
    logoutRequested: false,
  },
};

export const signedOutState = {
  auth: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    initialized: true,
    logoutRequested: false,
  },
};

/** Показывает текущий адрес для проверки переходов в тестах. */
export function CurrentPath() {
  return <p data-testid="path">{useLocation().pathname}</p>;
}

/**
 * Рендерит переданный компонент на одном маршруте.
 * Используется для тестов отдельных компонентов.
 */
export function renderWithStore(
  element,
  { path = '/', url = path, preloadedState } = {},
) {
  const store = createStore(preloadedState);

  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path={path} element={element} />
            <Route path="*" element={<CurrentPath />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );

  return store;
}

/**
 * Рендерит всё приложение с настоящими маршрутами и эффектами App.
 * Используется в тестах, которым нужна логика App, например выход.
 */
export function renderApp({ url = '/', preloadedState } = {}) {
  const store = createStore(preloadedState);

  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[url]}>
          <App />
          <CurrentPath />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );

  return store;
}