import { randomBytes } from 'node:crypto';
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { findUserById, upsertUser } from './users.js';

const SESSION_COOKIE = 'gz_session';
const STATE_COOKIE = 'gz_oauth_state';
const WEEK = 7 * 24 * 60 * 60;

export function buildApp({ db, github, config, logger = false }) {
  const app = Fastify({ logger });
  app.register(cookie, { secret: config.sessionSecret });

  // Подписанная cookie: подделать id пользователя без SESSION_SECRET нельзя,
  // а JavaScript страницы её не видит (httpOnly).
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: config.production,
    signed: true,
  };

  function readSignedCookie(request, name) {
    const raw = request.cookies[name];
    if (!raw) return null;
    const result = request.unsignCookie(raw);
    return result.valid ? result.value : null;
  }

  app.get('/api/health', async () => ({ ok: true }));

  // Шаг 1: отправляем пользователя на GitHub. state защищает от подмены входа (CSRF).
  app.get('/api/auth/github', async (request, reply) => {
    const state = randomBytes(16).toString('hex');
    reply.setCookie(STATE_COOKIE, state, { ...cookieOptions, maxAge: 600 });
    return reply.redirect(github.authorizeUrl(state));
  });

  // Шаг 2: GitHub вернул пользователя на /login?code=…&state=…, клиент присылает их сюда.
  app.post(
    '/api/auth/github/callback',
    {
      schema: {
        body: {
          type: 'object',
          required: ['code', 'state'],
          properties: {
            code: { type: 'string', minLength: 1 },
            state: { type: 'string', minLength: 1 },
          },
        },
      },
    },
    async (request, reply) => {
      const expectedState = readSignedCookie(request, STATE_COOKIE);
      reply.clearCookie(STATE_COOKIE, { path: '/' });
      if (!expectedState || expectedState !== request.body.state) {
        return reply.code(400).send({
          error: 'invalid_state',
          message: 'Сессия входа устарела. Начните вход заново.',
        });
      }

      let profile;
      try {
        const token = await github.exchangeCode(request.body.code);
        profile = await github.fetchProfile(token);
      } catch (error) {
        request.log.warn({ err: error }, 'GitHub OAuth failed');
        return reply.code(401).send({
          error: 'github_auth_failed',
          message: 'GitHub не подтвердил вход. Попробуйте ещё раз.',
        });
      }

      const user = await upsertUser(db, profile);
      reply.setCookie(SESSION_COOKIE, String(user.id), { ...cookieOptions, maxAge: WEEK });
      return { user };
    },
  );

  app.get('/api/auth/me', async (request, reply) => {
    const userId = Number(readSignedCookie(request, SESSION_COOKIE));
    const user = userId ? await findUserById(db, userId) : null;
    if (!user) {
      // Чистим только испорченную или устаревшую cookie. Если cookie не было, ответ без
      // Set-Cookie: иначе запоздавший 401 стёр бы сессию, только что выданную при входе.
      if (request.cookies[SESSION_COOKIE]) reply.clearCookie(SESSION_COOKIE, { path: '/' });
      return reply.code(401).send({ error: 'unauthorized' });
    }
    return user;
  });

  app.post('/api/auth/logout', async (request, reply) => {
    reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return reply.code(204).send();
  });

  return app;
}
