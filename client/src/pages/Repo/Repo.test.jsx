import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Repo from './Repo.jsx';
import { createStore } from '../../store/store.js';
import { theme } from '../../theme/theme.js';
import { getRepoCommits } from '../../api/github.js';
import { loadRecentRepos } from '../../lib/recentRepos.js';

vi.mock('../../api/github.js', () => ({ getRepoCommits: vi.fn() }));

const commits = [
  {
    sha: 'a1b2c3d4e5',
    parents: [{ sha: 'f6' }],
    author: { login: 'ada' },
    commit: {
      message: 'Добавить граф\n\nПодробное описание',
      author: { name: 'Ada', date: '2026-11-03T10:00:00Z' },
    },
    html_url: 'https://github.com/acme/app/commit/a1b2c3d4e5',
  },
  {
    sha: 'f6e5d4c3b2',
    parents: [],
    author: null,
    commit: { message: 'Начало', author: { name: 'Bob', date: '2026-11-01T10:00:00Z' } },
  },
];

function renderRepo(store = createStore()) {
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/repo/acme/app']}>
          <Routes>
            <Route path="/repo/:owner/:name" element={<Repo />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
  return store;
}

describe('Repo', () => {
  beforeEach(() => {
    vi.mocked(getRepoCommits).mockReset();
  });

  it('загружает коммиты репозитория из адреса и показывает графики', async () => {
    vi.mocked(getRepoCommits).mockResolvedValue(commits);
    renderRepo();

    expect(screen.getByRole('status')).toHaveTextContent('Загружаем коммиты');
    expect(await screen.findByRole('img', { name: 'Коммиты по дням' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Коммиты по авторам' })).toBeInTheDocument();
    expect(getRepoCommits).toHaveBeenCalledWith('acme', 'app', expect.any(Object));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('acme/app');
    expect(screen.getByText('последних коммитов основной ветки').previousSibling).toHaveTextContent(
      '2',
    );
  });

  it('запоминает открытый репозиторий для «Моих разборов»', async () => {
    localStorage.clear();
    vi.mocked(getRepoCommits).mockResolvedValue(commits);
    renderRepo();

    await screen.findByRole('img', { name: 'Коммиты по дням' });
    expect(loadRecentRepos()).toMatchObject([{ owner: 'acme', name: 'app' }]);
    localStorage.clear();
  });

  it('показывает детали коммита по клику и закрывает их', async () => {
    vi.mocked(getRepoCommits).mockResolvedValue(commits);
    renderRepo();

    fireEvent.click(await screen.findByRole('button', { name: /Добавить граф/ }));
    const details = screen.getByRole('complementary', { name: 'Детали коммита' });
    expect(details).toHaveTextContent('Подробное описание');
    expect(details).toHaveTextContent('ada');
    expect(details).toHaveTextContent('a1b2c3d');
    expect(screen.getByRole('link', { name: 'Открыть на GitHub' })).toHaveAttribute(
      'href',
      commits[0].html_url,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Закрыть детали' }));
    expect(details).toHaveTextContent('Выберите коммит');
  });

  it('пишет автора из git, если у коммита нет аккаунта GitHub', async () => {
    vi.mocked(getRepoCommits).mockResolvedValue(commits);
    renderRepo();

    fireEvent.click(await screen.findByRole('button', { name: /Начало/ }));
    expect(screen.getByRole('complementary', { name: 'Детали коммита' })).toHaveTextContent('Bob');
  });

  it.each([
    ['not_found', 'Репозиторий не найден'],
    ['rate_limit', 'ограничил запросы'],
    ['network', 'Нет связи с GitHub'],
    ['http_error', 'Не удалось загрузить коммиты'],
  ])('показывает понятную ошибку: %s', async (code, text) => {
    vi.mocked(getRepoCommits).mockRejectedValue(Object.assign(new Error('x'), { code }));
    renderRepo();

    expect(await screen.findByRole('alert')).toHaveTextContent(text);
    expect(screen.getByRole('link', { name: 'На главную' })).toHaveAttribute('href', '/');
  });

  it('повторяет запрос по кнопке «Попробовать снова»', async () => {
    vi.mocked(getRepoCommits)
      .mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'network' }))
      .mockResolvedValueOnce(commits);
    renderRepo();

    fireEvent.click(await screen.findByRole('button', { name: 'Попробовать снова' }));
    expect(await screen.findByRole('img', { name: 'Коммиты по дням' })).toBeInTheDocument();
    expect(getRepoCommits).toHaveBeenCalledTimes(2);
  });

  it('сообщает, если коммитов нет', async () => {
    vi.mocked(getRepoCommits).mockResolvedValue([]);
    renderRepo();

    expect(await screen.findByText('В репозитории пока нет коммитов.')).toBeInTheDocument();
  });
});
