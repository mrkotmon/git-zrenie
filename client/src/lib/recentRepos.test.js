import { afterEach, describe, expect, it, vi } from 'vitest';
import { forgetRepo, loadRecentRepos, rememberRepo } from './recentRepos.js';

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('recentRepos', () => {
  it('запоминает репозиторий и поднимает его наверх при повторном открытии', () => {
    rememberRepo({ owner: 'acme', name: 'app' }, new Date('2026-11-01T10:00:00Z'));
    rememberRepo({ owner: 'vitejs', name: 'vite' }, new Date('2026-11-02T10:00:00Z'));
    rememberRepo({ owner: 'ACME', name: 'App' }, new Date('2026-11-03T10:00:00Z'));

    expect(loadRecentRepos()).toEqual([
      { owner: 'ACME', name: 'App', openedAt: '2026-11-03T10:00:00.000Z' },
      { owner: 'vitejs', name: 'vite', openedAt: '2026-11-02T10:00:00.000Z' },
    ]);
  });

  it('хранит не больше 10 репозиториев', () => {
    for (let i = 0; i < 12; i += 1) rememberRepo({ owner: 'o', name: `r${i}` });
    expect(loadRecentRepos()).toHaveLength(10);
    expect(loadRecentRepos()[0].name).toBe('r11');
  });

  it('удаляет репозиторий из списка', () => {
    rememberRepo({ owner: 'acme', name: 'app' });
    forgetRepo({ owner: 'acme', name: 'app' });
    expect(loadRecentRepos()).toEqual([]);
  });

  it('не падает на испорченных данных и без localStorage', () => {
    localStorage.setItem('gz:recent-repos', '{не json');
    expect(loadRecentRepos()).toEqual([]);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => rememberRepo({ owner: 'a', name: 'b' })).not.toThrow();
  });
});
