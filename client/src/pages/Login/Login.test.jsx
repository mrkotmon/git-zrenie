import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Login from './Login.jsx';
import { createStore } from '../../store/store.js';
import { theme } from '../../theme/theme.js';
import { exchangeGithubCode } from '../../lib/authApi.js';


vi.mock('../../lib/authApi.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    exchangeGithubCode: vi.fn(),
  };
});

const demoUser = {
  id: 1,
  github_id: 12345678,
  login: 'demo-user',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
  created_at: '2026-09-11T10:00:00Z',
};

function renderLogin({ preloadedState = {}, initialEntries = ['/login'] } = {}) {
  return render(
    <Provider store={createStore(preloadedState)}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={initialEntries}>
          <Login />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
}

describe('Login page', () => {
  it('не вошёл: показывает заголовок и ссылку входа через GitHub', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: 'Вход в Git Зрение' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Войти через GitHub/ })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Продолжить в приложение' }),
    ).not.toBeInTheDocument();
  });

  it('вошёл: показывает кнопку продолжения и скрывает ссылку входа', () => {
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

    expect(screen.getByRole('button', { name: 'Продолжить в приложение' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Войти через GitHub/ })).not.toBeInTheDocument();
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


describe('Login page с кодом авторизации', () => {
  it('если есть ?code в URL — обменивает его и показывает кнопку продолжения', async () => {
    vi.mocked(exchangeGithubCode).mockResolvedValue({ user: demoUser });

    renderLogin({ initialEntries: ['/login?code=abc123'] });

    expect(exchangeGithubCode).toHaveBeenCalledWith('abc123');
    await screen.findByRole('button', { name: 'Продолжить в приложение' });
  });
});