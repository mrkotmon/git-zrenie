import { describe, expect, it, vi } from 'vitest';
import { GithubAuthError, createGithubClient } from '../src/github.js';

function client(fetchImpl) {
  return createGithubClient({
    clientId: 'id-1',
    clientSecret: 'secret-1',
    redirectUri: 'http://localhost:5173/login',
    fetchImpl,
  });
}

function response(status, body) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) };
}

describe('createGithubClient', () => {
  it('собирает ссылку на страницу входа GitHub', () => {
    const url = new URL(client(vi.fn()).authorizeUrl('st-1'));

    expect(url.origin + url.pathname).toBe('https://github.com/login/oauth/authorize');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      client_id: 'id-1',
      redirect_uri: 'http://localhost:5173/login',
      scope: 'read:user',
      state: 'st-1',
    });
  });

  it('обменивает код на токен', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(200, { access_token: 'tok' }));
    await expect(client(fetchImpl).exchangeCode('c-1')).resolves.toBe('tok');

    const [url, options] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://github.com/login/oauth/access_token');
    expect(JSON.parse(options.body)).toMatchObject({ client_secret: 'secret-1', code: 'c-1' });
  });

  it('считает ошибкой ответ 200 с полем error', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        response(200, { error: 'bad_verification_code', error_description: 'expired' }),
      );
    await expect(client(fetchImpl).exchangeCode('c-1')).rejects.toBeInstanceOf(GithubAuthError);
  });

  it('читает профиль пользователя с токеном', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(response(200, { id: 7, login: 'ada', avatar_url: 'https://a/7.png' }));

    await expect(client(fetchImpl).fetchProfile('tok')).resolves.toEqual({
      githubId: 7,
      login: 'ada',
      avatarUrl: 'https://a/7.png',
    });
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
  });

  it('сообщает, если GitHub не отдал профиль', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(401, {}));
    await expect(client(fetchImpl).fetchProfile('tok')).rejects.toBeInstanceOf(GithubAuthError);
  });
});
