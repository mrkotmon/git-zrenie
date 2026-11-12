export function loadConfig(env = process.env) {
  return {
    port: Number(env.PORT ?? 3001),
    host: env.HOST ?? '127.0.0.1',
    githubClientId: env.GITHUB_CLIENT_ID ?? '',
    githubClientSecret: env.GITHUB_CLIENT_SECRET ?? '',
    // Куда GitHub вернёт пользователя после входа: страница /login клиента.
    oauthRedirectUri: env.OAUTH_REDIRECT_URI ?? 'http://localhost:5173/login',
    sessionSecret: env.SESSION_SECRET ?? '',
    // Если DATABASE_URL не задан, используем встроенный PostgreSQL (PGlite) в папке .data.
    databaseUrl: env.DATABASE_URL ?? '',
    dataDir: env.PGLITE_DIR ?? '.data/pglite',
    production: env.NODE_ENV === 'production',
  };
}

export function missingSettings(config) {
  const required = {
    GITHUB_CLIENT_ID: config.githubClientId,
    GITHUB_CLIENT_SECRET: config.githubClientSecret,
    SESSION_SECRET: config.sessionSecret,
  };
  return Object.entries(required)
    .filter(([, value]) => !value)
    .map(([name]) => name);
}
