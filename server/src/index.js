import { buildApp } from './app.js';
import { loadConfig, missingSettings } from './config.js';
import { createDb, migrate } from './db.js';
import { createGithubClient } from './github.js';

const config = loadConfig();
const missing = missingSettings(config);
if (missing.length > 0) {
  console.error(`Не заданы ${missing.join(', ')}. Скопируйте server/.env.example в server/.env.`);
  process.exit(1);
}

const db = await createDb(config);
if (await migrate(db)) console.log('База создана по database/initialBd.sql');

const github = createGithubClient({
  clientId: config.githubClientId,
  clientSecret: config.githubClientSecret,
  redirectUri: config.oauthRedirectUri,
});

const app = buildApp({ db, github, config, logger: true });

async function shutdown() {
  await app.close();
  await db.close();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

await app.listen({ port: config.port, host: config.host });
