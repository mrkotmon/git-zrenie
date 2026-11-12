const DAY = 24 * 60 * 60 * 1000;

export const UNKNOWN_AUTHOR = 'Неизвестный автор';

export function commitDate(commit) {
  return new Date(commit.commit?.author?.date ?? commit.commit?.committer?.date ?? 0);
}

export function authorName(commit) {
  return commit.author?.login ?? commit.commit?.author?.name ?? UNKNOWN_AUTHOR;
}

export function firstLine(message) {
  return String(message ?? '').split('\n')[0];
}

function dayKey(date) {
  return date.toISOString().slice(0, 10);
}

function weekStart(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const shift = (d.getUTCDay() + 6) % 7; // понедельник — начало недели
  return new Date(d.getTime() - shift * DAY);
}

function monthStart(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function nextBucket(date, unit) {
  if (unit === 'day') return new Date(date.getTime() + DAY);
  if (unit === 'week') return new Date(date.getTime() + 7 * DAY);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

function bucketStart(date, unit) {
  if (unit === 'day') return new Date(dayKey(date));
  if (unit === 'week') return weekStart(date);
  return monthStart(date);
}

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function bucketLabel(date, unit) {
  const day = date.getUTCDate();
  const month = MONTHS[date.getUTCMonth()];
  if (unit === 'month') return `${month} ${date.getUTCFullYear()}`;
  return `${day} ${month}`;
}

/**
 * Число коммитов по дням. Если история длиннее двух месяцев — по неделям,
 * длиннее двух лет — по месяцам, чтобы столбики оставались читаемыми.
 * Пустые периоды между первым и последним коммитом тоже попадают в результат.
 */
export function commitsOverTime(commits) {
  const dates = commits.map(commitDate).filter((d) => !Number.isNaN(d.getTime()) && d.getTime());
  if (dates.length === 0) return { unit: 'day', buckets: [] };

  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates));
  const spanDays = (max - min) / DAY;
  const unit = spanDays <= 60 ? 'day' : spanDays <= 730 ? 'week' : 'month';

  const counts = new Map();
  for (const date of dates) {
    const key = dayKey(bucketStart(date, unit));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const buckets = [];
  for (let d = bucketStart(min, unit); d <= max; d = nextBucket(d, unit)) {
    const key = dayKey(d);
    buckets.push({ key, label: bucketLabel(d, unit), value: counts.get(key) ?? 0 });
  }
  return { unit, buckets };
}

/** Авторы по числу коммитов; всех, кто не попал в первые `limit`, объединяем в «Остальные». */
export function commitsByAuthor(commits, limit = 8) {
  const counts = new Map();
  for (const commit of commits) {
    const name = authorName(commit);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  const sorted = [...counts]
    .map(([label, value]) => ({ key: label, label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

  if (sorted.length <= limit) return sorted;
  const rest = sorted.slice(limit - 1).reduce((sum, item) => sum + item.value, 0);
  return [...sorted.slice(0, limit - 1), { key: 'rest', label: 'Остальные', value: rest }];
}

/** Короткая сводка для карточек над графиками. */
export function summarize(commits) {
  const dates = commits.map(commitDate).filter((d) => d.getTime());
  return {
    total: commits.length,
    authors: new Set(commits.map(authorName)).size,
    first: dates.length ? new Date(Math.min(...dates)) : null,
    last: dates.length ? new Date(Math.max(...dates)) : null,
  };
}
