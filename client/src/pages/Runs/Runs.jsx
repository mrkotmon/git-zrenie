import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import searchIcon from '../../assets/icons/search.svg';
import AppHeader from '../../components/AppHeader.jsx';
import GithubIcon from '../../components/icons/GithubIcon.jsx';
import { forgetRepo, loadRecentRepos } from '../../lib/recentRepos.js';
import { parseRepoInput, repoPath } from '../../lib/repoInput.js';
import { logoutUser } from '../../store/authSlice.js';
import './Runs.css';

const EXAMPLES = [
  { owner: 'facebook', name: 'react', note: 'большой проект' },
  { owner: 'vitejs', name: 'vite', note: 'много релизных веток' },
  { owner: 'mrkotmon', name: 'git-zrenie', note: 'наш проект' },
];

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

function ProfileCard({ user, recentCount, onLogout }) {
  if (!user) return null;
  return (
    <aside className="runs-side" aria-label="Профиль">
      <section className="runs-card runs-profile">
        <div className="runs-profile__head">
          {user.avatar_url && <img className="runs-profile__avatar" src={user.avatar_url} alt="" />}
          <div>
            <h2 className="runs-profile__name">{user.login}</h2>
            <p className="runs-profile__login">@{user.login}</p>
          </div>
        </div>
        <a
          className="runs-profile__github"
          href={`https://github.com/${user.login}`}
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon size={16} />
          github.com/{user.login}
        </a>
        {user.created_at && (
          <p className="runs-profile__since">
            В Git Зрении с {dateFormat.format(new Date(user.created_at))}
          </p>
        )}
        <div className="runs-profile__stat">
          <span className="runs-profile__stat-value">{recentCount}</span>
          <span className="runs-profile__stat-label">недавних репозиториев</span>
        </div>
      </section>
      <button type="button" className="runs-logout" onClick={onLogout}>
        Выйти
      </button>
    </aside>
  );
}

export default function Runs() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [query, setQuery] = useState('');
  const [error, setError] = useState(null);
  const [recent, setRecent] = useState(loadRecentRepos);

  const open = (repo) => navigate(repoPath(repo));

  const handleSubmit = (event) => {
    event.preventDefault();
    const repo = parseRepoInput(query);
    if (!repo) {
      setError('Введите ссылку на репозиторий GitHub или owner/name');
      return;
    }
    open(repo);
  };

  // Сначала уходим со страницы — она доступна только после входа.
  const logout = () => {
    navigate('/', { replace: true });
    dispatch(logoutUser());
  };

  return (
    <div className="runs-page">
      <AppHeader />
      <main className="runs-main">
        <ProfileCard user={user} recentCount={recent.length} onLogout={logout} />

        <div className="runs-content">
          <h1 className="runs-title">Мои разборы</h1>
          <p className="runs-subtitle">
            Вставьте ссылку — увидите коммиты, авторов и активность по дням.
          </p>

          <form className="runs-search" onSubmit={handleSubmit} noValidate>
            <img className="runs-search__icon" src={searchIcon} alt="" width="22" height="22" />
            <label className="visually-hidden" htmlFor="runs-repo">
              Репозиторий GitHub
            </label>
            <input
              id="runs-repo"
              className="runs-search__input"
              placeholder="Вставьте ссылку на репозиторий или owner/name…"
              autoComplete="off"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setError(null);
              }}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'runs-repo-error' : undefined}
            />
            <Button type="submit" variant="contained" size="large">
              Разобрать
            </Button>
          </form>
          {error && (
            <p id="runs-repo-error" className="runs-search__error" role="alert">
              {error}
            </p>
          )}

          {recent.length > 0 ? (
            <section className="runs-card runs-history" aria-labelledby="runs-history-title">
              <div className="runs-history__head">
                <h2 id="runs-history-title" className="runs-history__title">
                  Недавно открытые <span>{recent.length}</span>
                </h2>
                <p className="runs-history__hint">Список хранится в этом браузере</p>
              </div>
              <ul className="runs-history__list">
                {recent.map((repo) => (
                  <li key={`${repo.owner}/${repo.name}`} className="runs-history__item">
                    <div className="runs-history__repo">
                      <span className="runs-history__name">
                        {repo.owner}/{repo.name}
                      </span>
                      <span className="runs-history__date">
                        {dateTimeFormat.format(new Date(repo.openedAt))}
                      </span>
                    </div>
                    <Button variant="outlined" color="inherit" onClick={() => open(repo)}>
                      Открыть
                    </Button>
                    <button
                      type="button"
                      className="runs-history__remove"
                      aria-label={`Убрать ${repo.owner}/${repo.name} из списка`}
                      onClick={() => setRecent(forgetRepo(repo))}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="runs-card runs-empty" aria-labelledby="runs-empty-title">
              <h2 id="runs-empty-title" className="runs-empty__title">
                Разберём первый репозиторий
              </h2>
              <p className="runs-empty__text">Вставьте ссылку выше или попробуйте на примере.</p>
              <div className="runs-empty__examples">
                {EXAMPLES.map((repo) => (
                  <button
                    key={repo.name}
                    type="button"
                    className="runs-example"
                    onClick={() => open(repo)}
                  >
                    <span className="runs-example__name">
                      {repo.owner}/{repo.name}
                    </span>
                    <span className="runs-example__note">{repo.note}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
