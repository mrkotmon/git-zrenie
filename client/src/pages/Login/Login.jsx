import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@mui/material';
import logoUrl from '../../assets/icons/logo.svg';
import GithubIcon from '../../components/icons/GithubIcon.jsx';
import { AUTH_ENDPOINTS, exchangeGithubCode, fetchCurrentUserApi } from '../../lib/authApi.js';
import { logoutUser, setUser, setInitialized } from '../../store/authSlice.js';
import './Login.css';

const PERMISSIONS = [
  {
    title: 'Чтение репозиториев',
    scope: 'repo',
    description: 'Ветки, коммиты и PR — включая приватные, если вы разрешите.',
  },
  {
    title: 'Чтение досок Projects',
    scope: 'read:project',
    description: 'Чтобы сопоставить задачи спринта с кодом.',
  },
  {
    title: 'Профиль',
    scope: 'read:user',
    description: 'Имя, логин и аватар для вашей страницы.',
  },
];

function CheckIcon() {
  return (
    <span className="login__check" aria-hidden="true">
      ✓
    </span>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" className="login__lock" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export default function Login() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { user, loading, isAuthenticated, initialized } = useSelector((state) => state.auth);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const [authError, setAuthError] = useState(null);
  // Код GitHub одноразовый: в StrictMode эффект запускается дважды, второй обмен не нужен.
  const exchangedCode = useRef(null);

  useEffect(() => {
    if (code) {
      if (exchangedCode.current === code) return;
      exchangedCode.current = code;
      exchangeGithubCode(code, state)
        .then((data) => {
          dispatch(setUser(data.user));
          // Убираем code из адреса, чтобы при обновлении страницы не отправлять его снова
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          setAuthError(err.message || 'Не удалось войти через GitHub.');
          dispatch(setInitialized());
        });
    } else if (!initialized && !loading) {
      // Проверяем, есть ли уже сессия на сервере
      fetchCurrentUserApi()
        .then((data) => {
          if (data) dispatch(setUser(data));
          else dispatch(setInitialized());
        })
        .catch(() => {
          dispatch(setInitialized());
        });
    }
  }, [code, state, dispatch, initialized, loading]);

  // Уже вошёл: показываем, кто в системе (данные из таблицы users)
  if (isAuthenticated || (initialized && user)) {
    return (
      <main className="login-page login-page--centered">
        <section className="login__signed-in" aria-label="Вы вошли">
          {user?.avatar_url && (
            <img className="login__avatar" src={user.avatar_url} alt="" width="72" height="72" />
          )}
          <p className="login__signed-in-text">
            Вы вошли как <strong>@{user?.login}</strong>
          </p>
          <Button variant="contained" size="large" component={Link} to="/">
            Продолжить в приложение
          </Button>
          <Button variant="outlined" color="inherit" onClick={() => dispatch(logoutUser())}>
            Выйти
          </Button>
        </section>
      </main>
    );
  }

  // Загрузка сессии — показываем заглушку
  if (loading && !initialized) {
    return (
      <main className="login-page login-page--centered">
        <div className="login__loading">Вход…</div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <header className="login-header">
        <Link className="login-header__brand" to="/" aria-label="Git Зрение — главная">
          <img src={logoUrl} alt="" width="40" height="40" />
          <span>Git Зрение</span>
        </Link>
        <Button
          className="login-header__home"
          component={Link}
          to="/"
          variant="outlined"
          color="inherit"
        >
          На главную
        </Button>
      </header>

      <section className="login" aria-labelledby="login-title">
        <div className="login__card">
          <div className="login__content">
            <img className="login__logo" src={logoUrl} alt="" width="64" height="64" />
            <h1 id="login-title">Вход в Git Зрение</h1>
            <p className="login__intro">
              Мы читаем историю репозиториев от вашего имени, поэтому вход только через GitHub.
              Пароль не нужен.
            </p>

            {authError && (
              <p className="login__error" role="alert">
                {authError}
              </p>
            )}

            <Button
              className="login__oauth"
              component="a"
              href={AUTH_ENDPOINTS.githubStart}
              variant="contained"
              color="inherit"
              startIcon={<GithubIcon size={20} />}
              disabled={loading}
            >
              {loading ? 'Вход через GitHub…' : 'Войти через GitHub'}
            </Button>

            <div className="login__divider" />
            <h2 className="login__permissions-title">Что мы попросим у GitHub</h2>
            <ul className="login__permissions">
              {PERMISSIONS.map(({ title, scope, description }) => (
                <li className="login__permission" key={scope}>
                  <CheckIcon />
                  <div>
                    <div className="login__permission-heading">
                      <span>{title}</span>
                      <code>{scope}</code>
                    </div>
                    <p>{description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="login__privacy">
              <LockIcon />
              <p>
                Мы ничего не пишем в ваши репозитории. Доступ можно отозвать в настройках GitHub.
              </p>
            </aside>

            <div>
              <p className="login__demo">
                Хотите сначала посмотреть? <Link to="/demo">Открыть демо без входа</Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
