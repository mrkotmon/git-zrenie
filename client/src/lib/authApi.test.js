import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exchangeGithubCode, fetchCurrentUserApi, logoutApi } from './authApi.js';

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(response, status = 200) {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    }),
  );
}

describe('authApi', () => {
  it('exchangeGithubCode отправляет POST с кодом и возвращает пользователя', async () => {
    mockFetch({ user: { id: 1, login: 'demo' } });
    const res = await exchangeGithubCode('abc123', 'st-1');

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/github/callback',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'abc123', state: 'st-1' }),
        credentials: 'include',
      }),
    );
    expect(res).toEqual({ user: { id: 1, login: 'demo' } });
  });

  it('exchangeGithubCode показывает сообщение сервера', async () => {
    mockFetch({ error: 'invalid_state', message: 'Сессия входа устарела.' }, 400);
    await expect(exchangeGithubCode('c', 's')).rejects.toThrow('Сессия входа устарела.');
  });

  it('exchangeGithubCode бросает ошибку при 400', async () => {
    mockFetch({ error: 'bad code' }, 400);
    await expect(exchangeGithubCode('bad')).rejects.toThrow('bad code');
  });

  it('fetchCurrentUserApi возвращает пользователя при 200', async () => {
    mockFetch({ id: 1, login: 'demo' });
    const res = await fetchCurrentUserApi();

    expect(res).toEqual({ id: 1, login: 'demo' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/me',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    );
  });

  it('fetchCurrentUserApi возвращает null при 401', async () => {
    mockFetch(null, 401);
    const res = await fetchCurrentUserApi();
    expect(res).toBeNull();
  });

  it('logoutApi отправляет POST на logout', async () => {
    mockFetch(null, 204);
    await logoutApi();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
  });
});
