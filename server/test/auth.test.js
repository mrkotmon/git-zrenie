import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { createDb, migrate } from '../src/db.js';

const config = { sessionSecret: 'test-secret-test-secret-test-secret', production: false };

let db;
let app;
let github;

// По умолчанию PGlite. С TEST_DATABASE_URL тесты идут на настоящем PostgreSQL - то есть в нашу бд.
const databaseUrl = process.env.TEST_DATABASE_URL;

beforeEach(async () => {
  db = await createDb({ databaseUrl });
  if (databaseUrl) await db.exec('DROP TABLE IF EXISTS runs, repositories, users CASCADE');
  await migrate(db);
  github = {
    authorizeUrl: vi.fn((state) => `https://github.com/login/oauth/authorize?state=${state}`),
    exchangeCode: vi.fn().mockResolvedValue('token-123'),
    fetchProfile: vi
      .fn()
      .mockResolvedValue({ githubId: 42, login: 'ada', avatarUrl: 'https://a/42.png' }),
  };
  app = buildApp({ db, github, config });
});

afterEach(async () => {
  await app.close();
  await db.close();
});

/** Проходит первый шаг входа и возвращает state и cookie, как их получил бы браузер. */
async function startLogin() {
  const response = await app.inject({ method: 'GET', url: '/api/auth/github' });
  const state = new URL(response.headers.location).searchParams.get('state');
  const stateCookie = response.cookies.find((c) => c.name === 'gz_oauth_state');
  return { response, state, cookie: `gz_oauth_state=${stateCookie.value}` };
}

async function login(code = 'code-1') {
  const { state, cookie } = await startLogin();
  return app.inject({
    method: 'POST',
    url: '/api/auth/github/callback',
    headers: { cookie },
    payload: { code, state },
  });
}

function sessionCookie(response) {
  const session = response.cookies.find((c) => c.name === 'gz_session');
  return `gz_session=${session.value}`;
}

describe('вход через GitHub', () => {
  it('отправляет на GitHub и запоминает state в подписанной cookie', async () => {
    const { response, state } = await startLogin();

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toContain('github.com/login/oauth/authorize');
    expect(state).toMatch(/^[0-9a-f]{32}$/);
    const cookie = response.cookies.find((c) => c.name === 'gz_oauth_state');
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.value).not.toBe(state); // значение подписано
  });

  it('после возврата с GitHub создаёт пользователя в базе и ставит сессию', async () => {
    const response = await login();

    expect(response.statusCode).toBe(200);
    expect(github.exchangeCode).toHaveBeenCalledWith('code-1');
    expect(github.fetchProfile).toHaveBeenCalledWith('token-123');
    expect(response.json().user).toMatchObject({ github_id: 42, login: 'ada' });

    const { rows } = await db.query('SELECT github_id, login, avatar_url FROM users');
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ login: 'ada', avatar_url: 'https://a/42.png' });

    const session = response.cookies.find((c) => c.name === 'gz_session');
    expect(session.httpOnly).toBe(true);
  });

  it('при повторном входе обновляет пользователя, а не создаёт второго', async () => {
    await login('code-1');
    github.fetchProfile.mockResolvedValue({ githubId: 42, login: 'ada-new', avatarUrl: null });
    const response = await login('code-2');

    expect(response.json().user.login).toBe('ada-new');
    const { rows } = await db.query('SELECT login FROM users');
    expect(rows).toEqual([{ login: 'ada-new' }]);
  });

  it('отклоняет вход с чужим state', async () => {
    const { cookie } = await startLogin();
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/github/callback',
      headers: { cookie },
      payload: { code: 'code-1', state: 'подменённый' },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('invalid_state');
    expect(github.exchangeCode).not.toHaveBeenCalled();
  });

  it('отклоняет вход без cookie со state', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/github/callback',
      payload: { code: 'code-1', state: 'abc' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('требует code и state в теле запроса', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/github/callback',
      payload: { code: 'code-1' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('сообщает об ошибке, если GitHub не подтвердил код', async () => {
    github.exchangeCode.mockRejectedValue(new Error('bad_verification_code'));
    const response = await login();

    expect(response.statusCode).toBe(401);
    expect(response.json().error).toBe('github_auth_failed');
    const { rows } = await db.query('SELECT count(*)::int AS count FROM users');
    expect(rows[0].count).toBe(0);
  });
});

describe('сессия', () => {
  it('/api/auth/me возвращает пользователя из базы по cookie', async () => {
    const cookie = sessionCookie(await login());
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ github_id: 42, login: 'ada' });
  });

  it('/api/auth/me без входа отвечает 401', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/auth/me' });
    expect(response.statusCode).toBe(401);
  });

  it('не принимает подделанную cookie', async () => {
    await login();
    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { cookie: 'gz_session=1' },
    });

    expect(response.statusCode).toBe(401);
  });

  it('выход удаляет сессию', async () => {
    const response = await app.inject({ method: 'POST', url: '/api/auth/logout' });

    expect(response.statusCode).toBe(204);
    const session = response.cookies.find((c) => c.name === 'gz_session');
    expect(session.value).toBe('');
  });

  it('проверка здоровья сервера', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.json()).toEqual({ ok: true });
  });
});

describe('база на диске', () => {
  it('создаёт папку для PGlite и сохраняет пользователя между запусками', async () => {
    const { mkdtemp, rm } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');
    const base = await mkdtemp(join(tmpdir(), 'gz-'));
    const dataDir = join(base, 'nested', 'pglite');

    const first = await createDb({ dataDir });
    await migrate(first);
    await first.query("INSERT INTO users (github_id, login) VALUES (1, 'ada')");
    await first.close();

    const second = await createDb({ dataDir });
    expect(await migrate(second)).toBe(false);
    const { rows } = await second.query('SELECT login FROM users');
    expect(rows).toEqual([{ login: 'ada' }]);
    await second.close();
    await rm(base, { recursive: true, force: true });
  });
});
