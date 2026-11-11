import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Login from './Login.jsx';
import { createStore } from '../../store/store.js';
import { theme } from '../../theme/theme.js';

const demoUser = {
  id: 1,
  github_id: 12345678,
  login: 'demo-user',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
  created_at: '2026-09-11T10:00:00Z',
};

function renderLogin({ preloadedState = {} } = {}) {
  return render(
    <Provider store={createStore(preloadedState)}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/login']}>
          <Login />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
}

describe('Login page', () => {
  it('не вошёл: показывает заголовок и кнопку входа через GitHub', () => {
    renderLogin();

    expect(
      screen.getByRole('heading', { name: 'Вход в Git Зрение' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Войти через GitHub/ })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Продолжить в приложение' })
    ).not.toBeInTheDocument();
  });

  it('вошёл: показывает кнопку продолжения и скрывает кнопку входа', () => {
    renderLogin({
      preloadedState: {
        auth: {
          user: demoUser,
          loading: false,
          error: null,
          isAuthenticated: true,
          initialized: true,
        },
      },
    });

    expect(
      screen.getByRole('button', { name: 'Продолжить в приложение' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Войти через GitHub/ })
    ).not.toBeInTheDocument();
  });

  it('загрузка сессии: показывает заглушку "Вход…"', () => {
    renderLogin({
      preloadedState: {
        auth: {
          user: null,
          loading: true,
          error: null,
          isAuthenticated: false,
          initialized: false,
        },
      },
    });

    expect(screen.getByText('Вход…')).toBeInTheDocument();
  });
});