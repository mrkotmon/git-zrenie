export class GithubAuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'GithubAuthError';
  }
}

/**
 * Вход через GitHub OAuth: ссылка на страницу GitHub, обмен кода на токен, профиль.
 * Токен нужен только чтобы прочитать профиль, поэтому мы его не храним.
 */
export function createGithubClient({ clientId, clientSecret, redirectUri, fetchImpl = fetch }) {
  return {
    authorizeUrl(state) {
      const url = new URL('https://github.com/login/oauth/authorize');
      url.searchParams.set('client_id', clientId);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('scope', 'read:user');
      url.searchParams.set('state', state);
      return url.toString();
    },

    async exchangeCode(code) {
      const response = await fetchImpl('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      });
      const data = await response.json().catch(() => ({}));
      // При неверном коде GitHub отвечает 200, но с полем error.
      if (!response.ok || data.error || !data.access_token) {
        throw new GithubAuthError(data.error_description ?? 'GitHub не выдал токен');
      }
      return data.access_token;
    },

    async fetchProfile(token) {
      const response = await fetchImpl('https://api.github.com/user', {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'git-zrenie',
          'X-GitHub-Api-Version': '2026-03-10',
        },
      });
      if (!response.ok) throw new GithubAuthError(`GitHub вернул ${response.status} на /user`);
      const user = await response.json();
      return { githubId: user.id, login: user.login, avatarUrl: user.avatar_url };
    },
  };
}
