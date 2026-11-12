import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
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

function renderLogin({ preloadedState = {}, initialEntries = ['/login'] } = {}) {
  return render(
    <Provider store={createStore(preloadedState)}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={initialEntries}>
          <Login />
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
    expect(screen.queryByRole('link', { name: 'Продолжить в приложение' })).not.toBeInTheDocument();
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

    expect(screen.getByRole('link', { name: 'Продолжить в приложение' })).toBeInTheDocument();
    expect(screen.getByText('@demo-user')).toBeInTheDocument();
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
  it('если есть ?code в URL — обменивает его вместе со state и показывает пользователя', async () => {
    vi.mocked(exchangeGithubCode).mockResolvedValue({ user: demoUser });

    renderLogin({ initialEntries: ['/login?code=abc123&state=st-1'] });

    expect(exchangeGithubCode).toHaveBeenCalledWith('abc123', 'st-1');
    await screen.findByRole('link', { name: 'Продолжить в приложение' });
    expect(screen.getByText('@demo-user')).toBeInTheDocument();
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

    expect(await screen.findByText('@demo-user')).toBeInTheDocument();
  });

  it('кнопка «Выйти» завершает сессию', async () => {
    const realFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('') });
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

    fireEvent.click(screen.getByRole('button', { name: 'Выйти' }));
    expect(await screen.findByRole('link', { name: /Войти через GitHub/ })).toBeInTheDocument();
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
    globalThis.fetch = realFetch;
  });
});
