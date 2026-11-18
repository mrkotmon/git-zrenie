// Недавно открытые репозитории. Хранятся в браузере, пока на сервере нет истории разборов.
const KEY = 'gz:recent-repos';
const LIMIT = 10;

export function loadRecentRepos() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // localStorage может быть недоступен (приватный режим) — просто не запоминаем
  }
  return list;
}

const sameRepo = (a, b) =>
  a.owner.toLowerCase() === b.owner.toLowerCase() && a.name.toLowerCase() === b.name.toLowerCase();

/** Поднимает репозиторий в начало списка и обновляет данные о последнем открытии. */
export function rememberRepo(repo, now = new Date()) {
  const entry = { ...repo, openedAt: now.toISOString() };
  return save([entry, ...loadRecentRepos().filter((r) => !sameRepo(r, repo))].slice(0, LIMIT));
}

export function forgetRepo(repo) {
  return save(loadRecentRepos().filter((r) => !sameRepo(r, repo)));
}
