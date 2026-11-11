import { describe, expect, it, vi } from 'vitest';
import { getRepoCommits, GitHubApiError, GITHUB_ERROR } from './github.js';

const sampleCommit = {
  sha: 'abc123',
  parents: [{ sha: 'def456' }],
  commit: { message: 'Add the graph', author: { name: 'Ada', date: '2026-11-10T10:00:00Z' } },
  html_url: 'https://github.com/team/app/commit/abc123',
};

function mockResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

describe('P3.17: getRepoCommits', () => {
  it('загружает коммиты публичного репозитория без токена', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(mockResponse(200, [sampleCommit]));
    const commits = await getRepoCommits('team', 'app', { fetchImpl });

    expect(commits).toEqual([sampleCommit]);
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, options] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://api.github.com/repos/team/app/commits?per_page=100');
    expect(options.method).toBe('GET');
    expect(options.headers.Accept).toBe('application/vnd.github+json');
    expect(options.headers).not.toHaveProperty('Authorization');
  });

  it('не возвращает более 100 коммитов', async () => {
    const list = Array.from({ length: 101 }, (_, index) => ({
      ...sampleCommit,
      sha: String(index),
    }));
    const fetchImpl = vi.fn().mockResolvedValue(mockResponse(200, list));

    expect(await getRepoCommits('team', 'app', { fetchImpl })).toHaveLength(100);
  });

  it('передаёт AbortSignal в fetch', async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn().mockResolvedValue(mockResponse(200, []));
    await getRepoCommits('team', 'app', { signal: controller.signal, fetchImpl });

    expect(fetchImpl.mock.calls[0][1].signal).toBe(controller.signal);
  });

  it('сообщает о репозитории, который не найден (404)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(mockResponse(404, { message: 'Not Found' }));

    await expect(getRepoCommits('team', 'missing', { fetchImpl })).rejects.toMatchObject({
      name: 'GitHubApiError',
      code: GITHUB_ERROR.NOT_FOUND,
      status: 404,
    });
  });

  it.each([403, 429])('обрабатывает ограничение GitHub API (%s)', async (status) => {
    const fetchImpl = vi.fn().mockResolvedValue(mockResponse(status, {}));
    await expect(getRepoCommits('team', 'app', { fetchImpl })).rejects.toMatchObject({
      code: GITHUB_ERROR.RATE_LIMIT,
      status,
    });
  });

  it('отличает отсутствие сети от HTTP-ошибки', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(getRepoCommits('team', 'app', { fetchImpl })).rejects.toMatchObject({
      code: GITHUB_ERROR.NETWORK,
      status: null,
    });
  });

  it('не превращает отмену запроса в ошибку сети', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    const fetchImpl = vi.fn().mockRejectedValue(abortError);

    await expect(getRepoCommits('team', 'app', { fetchImpl })).rejects.toBe(abortError);
  });

  it('не превращает отмену при чтении JSON в ошибку формата', async () => {
    const abortError = new Error('Aborted while reading response');
    abortError.name = 'AbortError';
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(abortError),
    });

    await expect(getRepoCommits('team', 'app', { fetchImpl })).rejects.toBe(abortError);
  });

  it('возвращает пустой массив, если коммитов нет', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(mockResponse(200, []));
    await expect(getRepoCommits('team', 'app', { fetchImpl })).resolves.toEqual([]);
  });

  it('обрабатывает неожиданный статус GitHub', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(mockResponse(502, {}));
    await expect(getRepoCommits('team', 'app', { fetchImpl })).rejects.toMatchObject({
      code: GITHUB_ERROR.HTTP,
      status: 502,
    });
  });

  it('отклоняет ответ, который не является списком коммитов', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(mockResponse(200, { error: 'unexpected' }));
    await expect(getRepoCommits('team', 'app', { fetchImpl })).rejects.toMatchObject({
      code: GITHUB_ERROR.INVALID_RESPONSE,
    });
  });

  it('отклоняет невалидный JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new SyntaxError('Invalid JSON')),
    });
    await expect(getRepoCommits('team', 'app', { fetchImpl })).rejects.toMatchObject({
      code: GITHUB_ERROR.INVALID_RESPONSE,
    });
  });

  it('не принимает . и .. как имена владельца или репозитория', async () => {
    const fetchImpl = vi.fn();

    await expect(getRepoCommits('team', '..', { fetchImpl })).rejects.toMatchObject({
      code: GITHUB_ERROR.INVALID_REPOSITORY,
    });
    await expect(getRepoCommits('.', 'app', { fetchImpl })).rejects.toMatchObject({
      code: GITHUB_ERROR.INVALID_REPOSITORY,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('не позволяет внедрить дополнительные сегменты URL', async () => {
    const fetchImpl = vi.fn();
    await expect(getRepoCommits('team/other', 'app', { fetchImpl })).rejects.toBeInstanceOf(
      GitHubApiError,
    );
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
