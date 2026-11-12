import { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Button, CircularProgress } from '@mui/material';
import logoUrl from '../../assets/icons/logo.svg';
import BarChart from '../../components/charts/BarChart.jsx';
import {
  authorName,
  commitDate,
  commitsByAuthor,
  commitsOverTime,
  firstLine,
  summarize,
} from '../../lib/commitStats.js';
import { commitSelected, loadCommits, selectSelectedCommit } from '../../store/repoSlice.js';
import './Repo.css';

const ERROR_TEXT = {
  not_found: 'Репозиторий не найден. Проверьте ссылку или откройте публичный репозиторий.',
  rate_limit: 'GitHub временно ограничил запросы без входа. Попробуйте через несколько минут.',
  network: 'Нет связи с GitHub. Проверьте подключение к интернету.',
  invalid_repository: 'Некорректное имя владельца или репозитория.',
};

const UNIT_TEXT = { day: 'по дням', week: 'по неделям', month: 'по месяцам' };

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const dateTimeFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function CommitDetails({ commit, onClose }) {
  const ref = useRef(null);

  // На узком экране панель стоит под списком — прокручиваем к ней после выбора.
  useEffect(() => {
    if (commit && window.matchMedia?.('(max-width: 900px)').matches) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [commit]);

  if (!commit) {
    return (
      <aside ref={ref} className="repo-details repo-details--empty" aria-label="Детали коммита">
        <p>Выберите коммит в списке, чтобы увидеть подробности.</p>
      </aside>
    );
  }
  const [title, ...body] = String(commit.commit?.message ?? '').split('\n');
  return (
    <aside ref={ref} className="repo-details" aria-label="Детали коммита">
      <div className="repo-details__head">
        <h2 className="repo-details__title">{title}</h2>
        <button
          type="button"
          className="repo-details__close"
          aria-label="Закрыть детали"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {body.join('\n').trim() && <pre className="repo-details__body">{body.join('\n').trim()}</pre>}
      <dl className="repo-details__meta">
        <dt>Автор</dt>
        <dd>{authorName(commit)}</dd>
        <dt>Дата</dt>
        <dd>{dateTimeFormat.format(commitDate(commit))}</dd>
        <dt>Коммит</dt>
        <dd>
          <code>{commit.sha.slice(0, 7)}</code>
        </dd>
        <dt>Родителей</dt>
        <dd>{commit.parents?.length ?? 0}</dd>
      </dl>
      {commit.html_url && (
        <Button
          variant="outlined"
          color="inherit"
          href={commit.html_url}
          target="_blank"
          rel="noreferrer"
        >
          Открыть на GitHub
        </Button>
      )}
    </aside>
  );
}

export default function Repo() {
  const { owner, name } = useParams();
  const dispatch = useDispatch();
  const { status, commits, error, key } = useSelector((state) => state.repo);
  const selected = useSelector(selectSelectedCommit);

  useEffect(() => {
    const request = dispatch(loadCommits({ owner, name }));
    return () => request.abort();
  }, [dispatch, owner, name]);

  const overTime = useMemo(() => commitsOverTime(commits), [commits]);
  const byAuthor = useMemo(() => commitsByAuthor(commits), [commits]);
  const summary = useMemo(() => summarize(commits), [commits]);

  const retry = () => dispatch(loadCommits({ owner, name }));
  const ready = status === 'succeeded' && key === `${owner}/${name}`;

  return (
    <div className="repo-page">
      <header className="repo-header">
        <Link className="repo-header__logo" to="/">
          <img src={logoUrl} alt="" width="30" height="30" />
          <span>Git Зрение</span>
        </Link>
        <h1 className="repo-header__title">
          <span>{owner}</span>
          <span className="repo-header__slash">/</span>
          <strong>{name}</strong>
        </h1>
        <a
          className="repo-header__github"
          href={`https://github.com/${owner}/${name}`}
          target="_blank"
          rel="noreferrer"
        >
          Репозиторий на GitHub
        </a>
      </header>

      <main className="repo-main">
        {(status === 'loading' || status === 'idle') && (
          <div className="repo-state" role="status">
            <CircularProgress size={32} color="inherit" />
            <p>Загружаем коммиты из GitHub…</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="repo-state repo-state--error" role="alert">
            <p>{ERROR_TEXT[error?.code] ?? 'Не удалось загрузить коммиты. Попробуйте ещё раз.'}</p>
            <div className="repo-state__actions">
              <Button variant="contained" onClick={retry}>
                Попробовать снова
              </Button>
              <Button variant="outlined" color="inherit" component={Link} to="/">
                На главную
              </Button>
            </div>
          </div>
        )}

        {ready && commits.length === 0 && (
          <div className="repo-state" role="status">
            <p>В репозитории пока нет коммитов.</p>
          </div>
        )}

        {ready && commits.length > 0 && (
          <>
            <section className="repo-summary" aria-label="Сводка">
              <div className="repo-card">
                <span className="repo-card__value">{summary.total}</span>
                <span className="repo-card__label">последних коммитов основной ветки</span>
              </div>
              <div className="repo-card">
                <span className="repo-card__value">{summary.authors}</span>
                <span className="repo-card__label">авторов</span>
              </div>
              <div className="repo-card">
                <span className="repo-card__value repo-card__value--small">
                  {dateFormat.format(summary.first)} — {dateFormat.format(summary.last)}
                </span>
                <span className="repo-card__label">период</span>
              </div>
            </section>

            <section className="repo-charts">
              <div className="repo-panel">
                <h2 className="repo-panel__title">Коммиты {UNIT_TEXT[overTime.unit]}</h2>
                <BarChart data={overTime.buckets} label={`Коммиты ${UNIT_TEXT[overTime.unit]}`} />
              </div>
              <div className="repo-panel">
                <h2 className="repo-panel__title">Коммиты по авторам</h2>
                <BarChart data={byAuthor} label="Коммиты по авторам" />
              </div>
            </section>

            <section className="repo-history">
              <div className="repo-panel">
                <h2 className="repo-panel__title">История</h2>
                <ul className="repo-commits">
                  {commits.map((commit) => (
                    <li key={commit.sha}>
                      <button
                        type="button"
                        className={`repo-commit${
                          selected?.sha === commit.sha ? ' repo-commit--active' : ''
                        }`}
                        aria-pressed={selected?.sha === commit.sha}
                        onClick={() => dispatch(commitSelected(commit.sha))}
                      >
                        <code className="repo-commit__sha">{commit.sha.slice(0, 7)}</code>
                        <span className="repo-commit__message">
                          {firstLine(commit.commit?.message)}
                        </span>
                        <span className="repo-commit__meta">
                          {authorName(commit)} · {dateTimeFormat.format(commitDate(commit))}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <CommitDetails commit={selected} onClose={() => dispatch(commitSelected(null))} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
