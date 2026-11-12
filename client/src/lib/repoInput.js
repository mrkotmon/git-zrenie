const PART = /^[\w.-]+$/;

/**
 * Разбирает то, что пользователь ввёл в поиск: ссылку на GitHub или owner/name.
 * Возвращает { owner, name } или null, если это не репозиторий GitHub.
 */
export function parseRepoInput(value) {
  let text = String(value ?? '').trim();
  text = text.replace(/^(?:https?:\/\/)?(?:www\.)?github\.com\//i, '');
  text = text.replace(/\/+$/, '').replace(/\.git$/i, '');

  const parts = text.split('/');
  if (parts.length !== 2) return null;
  const [owner, name] = parts;
  if (!PART.test(owner) || !PART.test(name) || name === '.' || name === '..') return null;
  return { owner, name };
}

export function repoPath({ owner, name }) {
  return `/repo/${owner}/${name}`;
}
