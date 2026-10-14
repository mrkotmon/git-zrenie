/**
 * Утилиты для анализа Git-данных и подготовки их к визуализации.
 * Эти функции намеренно не покрыты тестами для демонстрации порога CI (G3.5).
 */

/**
 * Категоризирует тип коммита по его сообщению для цветовой индикации на графе.
 * @param {string|null} message - Сообщение коммита
 * @returns {'feat' | 'fix' | 'docs' | 'chore' | 'merge' | 'wip' | 'other'}
 */
export function categorizeCommitMessage(message) {
  if (!message || typeof message !== 'string') return 'other';
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('merge pull request') || lowerMsg.includes('merge branch')) {
    return 'merge';
  }
  if (lowerMsg.startsWith('wip') || lowerMsg.includes('work in progress')) {
    return 'wip';
  }
  if (lowerMsg.startsWith('feat') || lowerMsg.includes('add ')) {
    return 'feat';
  }
  if (lowerMsg.startsWith('fix') || lowerMsg.includes('resolve ') || lowerMsg.includes('bug')) {
    return 'fix';
  }
  if (lowerMsg.startsWith('docs') || lowerMsg.includes('readme')) {
    return 'docs';
  }
  if (lowerMsg.startsWith('chore') || lowerMsg.includes('update dependency')) {
    return 'chore';
  }
  return 'other';
}

/**
 * Определяет статус ветки на основе даты последнего коммита и количества открытых PR.
 * @param {string} lastCommitDate - ISO строка даты
 * @param {number} openPrCount - Количество открытых PR в эту ветку
 * @returns {'active' | 'stale' | 'abandoned' | 'ready'}
 */
export function getBranchStatus(lastCommitDate, openPrCount) {
  if (!lastCommitDate) return 'abandoned';

  const lastCommitTime = new Date(lastCommitDate).getTime();
  const now = Date.now();
  const daysSinceLastCommit = (now - lastCommitTime) / (1000 * 60 * 60 * 24);

  if (openPrCount > 0 && daysSinceLastCommit < 3) {
    return 'active';
  }
  if (openPrCount > 0 && daysSinceLastCommit >= 3) {
    return 'ready'; // Готова к ревью, но зависла
  }
  if (daysSinceLastCommit > 30) {
    return 'abandoned';
  }
  if (daysSinceLastCommit > 14) {
    return 'stale';
  }
  return 'active';
}

/**
 * Hit-detection для 2.5D Canvas: находит ближайший коммит к клику мыши.
 * Учитывает глубину (depth), чтобы кликать по верхним элементам.
 * @param {number} mouseX - Координата X клика
 * @param {number} mouseY - Координата Y клика
 * @param {Array<{sha: string, sx: number, sy: number, depth: number, radius: number}>} projectedCommits
 * @returns {string|null} SHA найденного коммита или null
 */
export function findClickedCommit(mouseX, mouseY, projectedCommits) {
  if (!projectedCommits || projectedCommits.length === 0) return null;

  // Фильтруем коммиты, в которые попал клик, и сортируем по глубине (ближние первыми)
  const hits = projectedCommits
    .filter((commit) => {
      const dx = mouseX - commit.sx;
      const dy = mouseY - commit.sy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= commit.radius;
    })
    .sort((a, b) => b.depth - a.depth);

  return hits.length > 0 ? hits[0].sha : null;
}

/**
 * Рассчитывает "Bus Factor" (фактор автобуса) для массива файлов на основе истории коммитов.
 * Возвращает автора, который сделал большинство изменений в каждом файле.
 * @param {Array<{file: string, author: string, linesChanged: number}>} fileHistory
 * @returns {Record<string, string>} Словарь { fileName: mainAuthor }
 */
export function calculateFileOwnership(fileHistory) {
  if (!fileHistory || !Array.isArray(fileHistory)) return {};

  const stats = {};

  for (const record of fileHistory) {
    if (!stats[record.file]) {
      stats[record.file] = {};
    }
    if (!stats[record.file][record.author]) {
      stats[record.file][record.author] = 0;
    }
    stats[record.file][record.author] += record.linesChanged;
  }

  const ownership = {};
  for (const [file, authors] of Object.entries(stats)) {
    let maxLines = -1;
    let mainAuthor = 'unknown';

    for (const [author, lines] of Object.entries(authors)) {
      if (lines > maxLines) {
        maxLines = lines;
        mainAuthor = author;
      }
    }
    ownership[file] = mainAuthor;
  }

  return ownership;
}

/**
 * Генерирует детерминированный HEX-цвет для ветки на основе её имени.
 * @param {string} branchName
 * @returns {string} HEX цвет (например, '#a3f1c2')
 */
export function generateBranchColor(branchName) {
  if (!branchName) return '#808080';
  if (branchName === 'main' || branchName === 'master') return '#22c55e'; // green-500
  if (branchName === 'develop') return '#3b82f6'; // blue-500
  if (branchName.startsWith('hotfix/')) return '#ef4444'; // red-500
  if (branchName.startsWith('release/')) return '#f59e0b'; // amber-500

  // Простой хеш строки для генерации цвета
  let hash = 0;
  for (let i = 0; i < branchName.length; i++) {
    hash = branchName.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 60%)`.replace(
    /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/,
    (match, _h, _s, _l) => {
      return match;
    },
  );
}
