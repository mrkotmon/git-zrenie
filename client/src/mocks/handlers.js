import { http, HttpResponse } from 'msw';

/**
 * MSW моки авторизации. Позволяют разрабатывать фронт на React без запущенного бэкенда.
 * Бэкенд позже заменит эти заглушки на реальные запросы к PostgreSQL (таблица users).
 */
export const handlers = [
  // GitHub OAuth старт — в реальности браузер уйдёт на github.com, здесь просто заглушка
  http.get('/api/auth/github', () => {
    return new HttpResponse(null, {
      status: 302,
      headers: {
        Location: 'https://github.com/login/oauth/authorize',
      },
    });
  }),

  // Обмен кода на пользователя — бэкенд пишет в таблицу `users` (github_id, login, avatar_url)
  http.post('/api/auth/github/callback', async ({ request }) => {
    const body = await request.json().catch(() => ({}));
    const { code } = body;

    if (!code) {
      return HttpResponse.json({ error: 'code is required' }, { status: 400 });
    }

    // Заглушка: как будто бэкенд нашёл/создал пользователя в БД
    return HttpResponse.json({
      user: {
        id: 1,
        github_id: 12345678,
        login: 'demo-user',
        avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
        created_at: new Date().toISOString(),
      },
    });
  }),

  // Проверка сессии — бэкенд отдаёт текущего пользователя из БД
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      id: 1,
      github_id: 12345678,
      login: 'demo-user',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
    });
  }),

  // Выход
  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
