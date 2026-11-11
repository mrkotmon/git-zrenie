export const REPOSITORY = Object.freeze({
  owner: 'acme',
  name: 'payments-service',
  branches: 9,
  commits: 49,
  members: 5,
});

export const BRANCHES = [
  { name: 'main', color: '#dfe4ec', status: 'Основная', tone: 'neutral' },
  { name: 'hotfix/1.4.1', color: '#ff5f57', status: 'Слита', tone: 'success' },
  { name: 'release/1.x', color: '#e89a3c', status: 'Поддержка 1.x', tone: 'warning' },
  { name: 'release/2.x', color: '#d8c44a', status: 'Стабилизация', tone: 'warning' },
  { name: 'develop', color: '#3f8fe8', status: 'Интеграция', tone: 'info' },
  { name: 'feature/auth', color: '#41c987', status: 'Слита', tone: 'success' },
  { name: 'feature/search', color: '#a06af5', status: 'Слита', tone: 'success' },
  { name: 'feature/graph-v2', color: '#7f8794', status: 'Заброшена · 17 дн.', tone: 'danger' },
  { name: 'feature/export', color: '#ef7db4', status: 'PR ждёт ревью', tone: 'warning' },
];

export const THEMES = [
  { id: 'graphite', label: 'Граф' },
  { id: 'paper', label: 'Бумага' },
  { id: 'blueprint', label: 'Чертёж' },
];

export const NODE_STYLES = [
  { id: 'commits', label: 'Коммиты' },
  { id: 'spheres', label: 'Сферы' },
  { id: 'rings', label: 'Кольца' },
  { id: 'flat', label: 'Плоские' },
];

export const VIEWS = [
  { id: 'iso', label: 'Изометрия', yaw: 324, pitch: 36 },
  { id: 'top', label: 'Сверху', yaw: 0, pitch: 86 },
  { id: 'side', label: 'Сбоку', yaw: 0, pitch: 6 },
];

export const SPRINTS = [
  { id: 'sprint-1', label: 'Спринт 1', range: '16.06–29.06', commits: 5 },
  { id: 'sprint-2', label: 'Спринт 2', range: '30.06–13.07', commits: 5 },
  { id: 'sprint-3', label: 'Спринт 3', range: '14.07–27.07', commits: 5 },
  { id: 'sprint-4', label: 'Спринт 4', range: '28.07–10.08', commits: 6 },
  { id: 'sprint-5', label: 'Спринт 5', range: '11.08–24.08', commits: 8 },
  { id: 'sprint-6', label: 'Спринт 6', range: '25.08–07.09', commits: 6 },
  { id: 'sprint-7', label: 'Спринт 7', range: '08.09–21.09', commits: 6 },
  { id: 'sprint-8', label: 'Спринт 8', range: '22.09–05.10', commits: 0, current: true },
];

export const SELECTED_COMMIT = {
  branch: 'feature/search',
  branchColor: '#a06af5',
  title: 'Пагинация результатов',
  sha: '062ef5a',
  date: '08.08.2026',
  sprint: 'спринт 4',
  author: 'Анна Смирнова',
  authorInitials: 'АС',
  added: 56,
  removed: 26,
  files: ['src/search/index.ts', 'src/search/query.ts'],
  task: 'PAY-225',
  pullRequest: '—',
  reviewer: 'Анна Смирнова',
  contribution: '55% строк',
  note: 'Слита в develop в спринте 5. Ветку можно удалить.',
  githubUrl: 'https://github.com/acme/payments-service/commit/062ef5a',
};
