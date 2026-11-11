import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { init } from '@sentry/react';

vi.mock('@sentry/react', () => ({ init: vi.fn() }));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('P3.14: инициализация Sentry', () => {
  it('не запускается без DSN', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', '');
    await import('./sentry');

    expect(init).not.toHaveBeenCalled();
  });

  it('подключается с DSN из окружения', async () => {
    vi.stubEnv('VITE_SENTRY_DSN', 'https://public@example.ingest.sentry.io/1');
    await import('./sentry');

    expect(init).toHaveBeenCalledWith({
      dsn: 'https://public@example.ingest.sentry.io/1',
      environment: 'test',
      sendDefaultPii: false,
    });
  });
});
