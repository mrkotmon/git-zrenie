export const GITHUB_ERROR = Object.freeze({
  INVALID_REPOSITORY: 'invalid_repository',
  NOT_FOUND: 'not_found',
  RATE_LIMIT: 'rate_limit',
  NETWORK: 'network',
  HTTP: 'http_error',
  INVALID_RESPONSE: 'invalid_response',
});

export class GitHubApiError extends Error {
  constructor(code, message, options = {}) {
    super(message, { cause: options.cause });
    this.name = 'GitHubApiError';
    this.code = code;
    this.status = options.status ?? null;
  }
}

function validateRepositoryPart(value) {
  return (
    typeof value === 'string' && value !== '.' && value !== '..' && /^[a-zA-Z0-9_.-]+$/.test(value)
  );
}

// Для G4 получаем до 100 коммитов из основной ветки публичного репозитория.
export async function getRepoCommits(owner, repo, { signal, fetchImpl = fetch } = {}) {
  if (!validateRepositoryPart(owner) || !validateRepositoryPart(repo)) {
    throw new GitHubApiError(
      GITHUB_ERROR.INVALID_REPOSITORY,
      'Некорректное имя владельца или репозитория.',
    );
  }

  const url =
    `https://api.github.com/repos/${encodeURIComponent(owner)}/` +
    `${encodeURIComponent(repo)}/commits?per_page=100`;
  let response;

  try {
    response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2026-03-10',
      },
      signal,
    });
  } catch (cause) {
    // Отмена запроса не считается сетевой ошибкой.
    if (cause?.name === 'AbortError') throw cause;
    throw new GitHubApiError(GITHUB_ERROR.NETWORK, 'Нет сети. Проверьте подключение.', { cause });
  }

  if (response.status === 404) {
    throw new GitHubApiError(GITHUB_ERROR.NOT_FOUND, 'Репозиторий не найден.', { status: 404 });
  }

  if (response.status === 403 || response.status === 429) {
    // Для G4 оба статуса показываем как ограничение запросов.
    throw new GitHubApiError(
      GITHUB_ERROR.RATE_LIMIT,
      'GitHub временно ограничил запросы. Попробуйте позже.',
      { status: response.status },
    );
  }

  if (!response.ok) {
    throw new GitHubApiError(
      GITHUB_ERROR.HTTP,
      'GitHub не смог обработать запрос. Попробуйте позже.',
      { status: response.status },
    );
  }

  let commits;
  try {
    commits = await response.json();
  } catch (cause) {
    if (cause?.name === 'AbortError') throw cause;
    throw new GitHubApiError(GITHUB_ERROR.INVALID_RESPONSE, 'GitHub вернул некорректные данные.', {
      status: response.status,
      cause,
    });
  }

  if (!Array.isArray(commits)) {
    throw new GitHubApiError(GITHUB_ERROR.INVALID_RESPONSE, 'GitHub вернул некорректные данные.', {
      status: response.status,
    });
  }

  return commits.slice(0, 100);
}
