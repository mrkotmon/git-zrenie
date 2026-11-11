/**
 * Endpoints авторизации. Бэкенд (Node.js) реализует эти маршруты
 * и пишет/обновляет пользователя в таблице `users` БД (github_id, login, avatar_url).
 */
export const AUTH_ENDPOINTS = {
  githubStart: '/api/auth/github',
  githubCallback: '/api/auth/github/callback',
  me: '/api/auth/me',
  logout: '/api/auth/logout',
};

/**
 * Отправляет GitHub OAuth code на бэкенд.
 * Бэкенд обменивает code на токен GitHub, забирает профиль пользователя,
 * создаёт/обновляет строку в таблице `users` и возвращает данные пользователя.
 *
 * @param {string} code — код из параметра URL ?code=XXX после редиректа с GitHub
 * @returns {Promise<{user: {id, github_id, login, avatar_url, created_at}}>}
 */
export async function exchangeGithubCode(code) {
  const res = await fetch(AUTH_ENDPOINTS.githubCallback, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка обмена кода GitHub');
  }
  return res.json();
}

/**
 * Проверяет текущую сессию пользователя (бэкенд возвращает запись из `users`).
 * @returns {Promise<{id, github_id, login, avatar_url, created_at} | null>}
 */
export async function fetchCurrentUserApi() {
  const res = await fetch(AUTH_ENDPOINTS.me, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) return null;
  return res.json();
}

/**
 * Выход — бэкенд уничтожает сессию.
 */
export async function logoutApi() {
  await fetch(AUTH_ENDPOINTS.logout, {
    method: 'POST',
    credentials: 'include',
  });
}
