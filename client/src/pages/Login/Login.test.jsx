import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Login from './Login.jsx';
import { createStore } from '../../store/store.js';
import { theme } from '../../theme/theme.js';
import { exchangeGithubCode, fetchCurrentUserApi } from '../../lib/authApi.js';

vi.mock('../../lib/authApi.js', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    exchangeGithubCode: vi.fn(),
    fetchCurrentUserApi: vi.fn().mockResolvedValue(null),
  };
});

beforeEach(() => {
  vi.mocked(exchangeGithubCode).mockReset();
  vi.mocked(fetchCurrentUserApi).mockResolvedValue(null);
});

const demoUser = {
  id: 1,
  github_id: 12345678,
  login: 'demo-user',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
  created_at: '2026-09-11T10:00:00Z',
};

const signedIn = {
  auth: { user: demoUser, loading: false, error: null, isAuthenticated: true, initialized: true },
};

function CurrentPath() {
  return <p data-testid="path">{useLocation().pathname}</p>;
}

function renderLogin({ preloadedState = {}, initialEntries = ['/login'] } = {}) {
  return render(
    <Provider store={createStore(preloadedState)}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<CurrentPath />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
}

describe('Login page', () => {
  it('не вошёл: показывает заголовок и ссылку входа через GitHub', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: 'Вход в Git Зрение' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Войти через GitHub/ })).toBeInTheDocument();
  });

  it('вошёл: сразу переводит в «Мои разборы»', () => {
    renderLogin({ preloadedState: signedIn });

    expect(screen.getByTestId('path')).toHaveTextContent('/runs');
  });

  it('возвращает на страницу, с которой отправили на вход', () => {
    renderLogin({
      preloadedState: signedIn,
      initialEntries: [{ pathname: '/login', state: { from: '/repo/acme/app' } }],
    });

    expect(screen.getByTestId('path')).toHaveTextContent('/repo/acme/app');
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
  it('обменивает ?code вместе со state и переводит в «Мои разборы»', async () => {
    vi.mocked(exchangeGithubCode).mockResolvedValue({ user: demoUser });

    renderLogin({ initialEntries: ['/login?code=abc123&state=st-1'] });

    expect(await screen.findByTestId('path')).toHaveTextContent('/runs');
    expect(exchangeGithubCode).toHaveBeenCalledWith('abc123', 'st-1');
    expect(exchangeGithubCode).toHaveBeenCalledTimes(1);
  });

  it('показывает ошибку, если сервер не подтвердил вход', async () => {
    vi.mocked(exchangeGithubCode).mockRejectedValue(new Error('Сессия входа устарела.'));

    renderLogin({ initialEntries: ['/login?code=abc123&state=st-1'] });

    expect(await screen.findByRole('alert')).toHaveTextContent('Сессия входа устарела.');
    expect(screen.getByRole('link', { name: /Войти через GitHub/ })).toBeInTheDocument();
  });

  it('находит существующую сессию без кода в адресе', async () => {
    vi.mocked(fetchCurrentUserApi).mockResolvedValue(demoUser);

    renderLogin();

    expect(await screen.findByTestId('path')).toHaveTextContent('/runs');
  });
});
