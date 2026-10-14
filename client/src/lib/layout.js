/**
 * Раскладка коммитов для графа 2.5D: X — время, Z — ветка, Y — объём изменений.
 * Чистые функции без DOM — их удобно тестировать и переносить в Web Worker.
 */

/** @typedef {{ sha: string, branch: string, date: string, added: number, removed: number }} Commit */

const DAY = 24 * 60 * 60 * 1000;

/**
 * Порядок дорожек: main сверху, затем develop, release/*, hotfix/*, остальные по алфавиту.
 * @param {string[]} branches
 * @returns {Map<string, number>}
 */
export function assignLanes(branches) {
  const rank = (name) => {
    if (name === 'main' || name === 'master') return 0;
    if (name.startsWith('hotfix/')) return 1;
    if (name.startsWith('release/')) return 2;
    if (name === 'develop') return 3;
    return 4;
  };
  const sorted = [...new Set(branches)].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  return new Map(sorted.map((name, i) => [name, i]));
}

/**
 * Высота столбика коммита: логарифм числа изменённых строк, чтобы крупные коммиты
 * не «улетали» вверх. Пустой коммит — 0.
 * @param {number} added
 * @param {number} removed
 */
export function commitHeight(added, removed) {
  const lines = Math.max(0, added) + Math.max(0, removed);
  return lines === 0 ? 0 : Math.round(Math.log10(lines + 1) * 100) / 100;
}

/**
 * Координаты коммитов в мировой системе сцены.
 * @param {Commit[]} commits
 * @returns {{ sha: string, x: number, y: number, z: number }[]}
 */
export function layoutCommits(commits) {
  if (commits.length === 0) return [];
  const lanes = assignLanes(commits.map((c) => c.branch));
  const start = Math.min(...commits.map((c) => Date.parse(c.date)));
  return commits.map((c) => ({
    sha: c.sha,
    x: Math.round((Date.parse(c.date) - start) / DAY),
    y: commitHeight(c.added, c.removed),
    z: lanes.get(c.branch),
  }));
}

/**
 * Проекция точки сцены на экран: поворот вокруг вертикали (yaw) и наклон (pitch).
 * @param {{ x: number, y: number, z: number }} p
 * @param {number} yaw
 * @param {number} pitch
 */
export function project(p, yaw, pitch) {
  const rx = p.x * Math.cos(yaw) - p.z * Math.sin(yaw);
  const rz = p.x * Math.sin(yaw) + p.z * Math.cos(yaw);
  return {
    sx: Math.round(rx * 1000) / 1000,
    sy: Math.round((rz * Math.sin(pitch) - p.y * Math.cos(pitch)) * 1000) / 1000,
    depth: rz,
  };
}
