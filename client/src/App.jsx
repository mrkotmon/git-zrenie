import { layoutCommits } from './lib/layout.js';

const demo = [
  {
    sha: '062ef5a',
    branch: 'feature/search',
    date: '2026-08-08T12:00:00Z',
    added: 56,
    removed: 26,
  },
  { sha: '23e8db7', branch: 'hotfix/1.4.1', date: '2026-08-13T12:00:00Z', added: 73, removed: 34 },
  { sha: 'b63d5f1', branch: 'release/2.x', date: '2026-09-10T12:00:00Z', added: 95, removed: 44 },
];

export default function App() {
  const nodes = layoutCommits(demo);
  return (
    <main>
      <h1>Comepletely not a Git Зрение</h1>
      <p>Понять чужой репозиторий за час, а не за неделю.</p>
      <p data-testid="commit-count">Коммитов в демо: {nodes.length}</p>
      <a href="https://github.com/login/oauth/authorize">Войти через GitHub</a>
    </main>
  );
}
