import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore } from './store.js';
import { commitSelected, loadCommits, selectSelectedCommit } from './repoSlice.js';
import { getRepoCommits } from '../api/github.js';

vi.mock('../api/github.js', () => ({ getRepoCommits: vi.fn() }));

const commits = [{ sha: 'a1' }, { sha: 'b2' }];

describe('repoSlice', () => {
  beforeEach(() => {
    vi.mocked(getRepoCommits).mockReset();
  });

  it('загружает коммиты и запоминает репозиторий', async () => {
    vi.mocked(getRepoCommits).mockResolvedValue(commits);
    const store = createStore();

    const promise = store.dispatch(loadCommits({ owner: 'acme', name: 'app' }));
    expect(store.getState().repo.status).toBe('loading');
    await promise;

    expect(getRepoCommits).toHaveBeenCalledWith('acme', 'app', expect.any(Object));
    expect(store.getState().repo).toMatchObject({
      key: 'acme/app',
      status: 'succeeded',
      commits,
      error: null,
    });
  });

  it('сохраняет код ошибки GitHub', async () => {
    vi.mocked(getRepoCommits).mockRejectedValue(
      Object.assign(new Error('Репозиторий не найден.'), { code: 'not_found' }),
    );
    const store = createStore();
    await store.dispatch(loadCommits({ owner: 'acme', name: 'missing' }));

    expect(store.getState().repo.status).toBe('failed');
    expect(store.getState().repo.error).toEqual({
      code: 'not_found',
      message: 'Репозиторий не найден.',
    });
  });

  it('не показывает ошибку, если запрос отменён', async () => {
    vi.mocked(getRepoCommits).mockImplementation(
      (_owner, _name, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () =>
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
          );
        }),
    );
    const store = createStore();
    const promise = store.dispatch(loadCommits({ owner: 'acme', name: 'app' }));
    promise.abort();
    await promise;

    expect(store.getState().repo.status).toBe('loading');
    expect(store.getState().repo.error).toBeNull();
  });

  it('выбирает коммит по sha', async () => {
    vi.mocked(getRepoCommits).mockResolvedValue(commits);
    const store = createStore();
    await store.dispatch(loadCommits({ owner: 'acme', name: 'app' }));
    store.dispatch(commitSelected('b2'));

    expect(selectSelectedCommit(store.getState())).toEqual({ sha: 'b2' });
    store.dispatch(commitSelected('нет такого'));
    expect(selectSelectedCommit(store.getState())).toBeNull();
  });
});
