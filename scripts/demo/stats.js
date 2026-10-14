/**
 * Статистика участия в спринте — добавлено без тестов (демонстрация G3.5).
 * @param {{ author: string, added: number, removed: number }[]} commits
 */
export function contributionByAuthor(commits) {
  const result = {};
  for (const c of commits) {
    if (!result[c.author]) {
      result[c.author] = { commits: 0, lines: 0 };
    }
    result[c.author].commits += 1;
    result[c.author].lines += c.added + c.removed;
  }
  return result;
}

export function busFactor(owners) {
  const sorted = Object.values(owners).sort((a, b) => b - a);
  const total = sorted.reduce((s, v) => s + v, 0);
  let acc = 0;
  let count = 0;
  for (const v of sorted) {
    acc += v;
    count += 1;
    if (acc >= total / 2) break;
  }
  return count;
}

export function isStale(lastCommitDate, now = Date.now()) {
  const days = (now - Date.parse(lastCommitDate)) / (24 * 60 * 60 * 1000);
  return days > 14;
}
