import { describe, expect, it } from 'vitest';
import { loadConfig, missingSettings } from '../src/config.js';

describe('config', () => {
  it('берёт значения по умолчанию для локального запуска', () => {
    const config = loadConfig({});
    expect(config).toMatchObject({
      port: 3001,
      oauthRedirectUri: 'http://localhost:5173/login',
      databaseUrl: '',
      production: false,
    });
  });

  it('называет незаполненные обязательные настройки', () => {
    expect(missingSettings(loadConfig({ GITHUB_CLIENT_ID: 'x' }))).toEqual([
      'GITHUB_CLIENT_SECRET',
      'SESSION_SECRET',
    ]);
    expect(
      missingSettings(
        loadConfig({ GITHUB_CLIENT_ID: 'x', GITHUB_CLIENT_SECRET: 'y', SESSION_SECRET: 'z' }),
      ),
    ).toEqual([]);
  });
});
