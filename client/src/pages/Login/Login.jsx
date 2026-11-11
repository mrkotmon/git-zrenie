import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@mui/material';
import logoUrl from '../../assets/icons/logo.svg';
import GithubIcon from '../../components/icons/GithubIcon.jsx';
import { AUTH_ENDPOINTS, exchangeGithubCode, fetchCurrentUserApi } from '../../lib/authApi.js';
import { setUser, clearError, setInitialized } from '../../store/authSlice.js';
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

  useEffect(() => {
    // Если пришёл code из GitHub — обмениваем его на бэкенде
    if (code) {
      exchangeGithubCode(code)
        .then((data) => {
          dispatch(setUser(data.user));
          // Чистим URL от параметра code, чтобы не было повторной отправки при обновлении
          window.history.replaceState({}, document.title, window.location.pathname);
        })
        .catch((err) => {
          console.error('GitHub auth error:', err);
          dispatch(clearError());
        });
    } else if (!initialized && !loading) {
      // Проверяем Existing сессию (пользователь уже был авторизован ранее в БД)
      fetchCurrentUserApi()
        .then((data) => {
          if (data) dispatch(setUser(data));
          else dispatch(setInitialized());
        })
        .catch(() => {
          // Сессии нет — просто оставляем на странице логина
          dispatch(setInitialized());
        });
    }
  }, [code, dispatch, initialized, loading]);

  // Уже авторизован — Redirect на главную
  if (isAuthenticated || (initialized && user)) {
    return (
      <main
        className="login-page"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Button variant="contained" size="large" fullWidth sx={{ maxWidth: 400, mt: 2 }}>
            Продолжить в приложение
          </Button>
        </Link>
      </main>
    );
  }

  // Загрузка сессии — показываем заглушку
  if (loading && !initialized) {
    return (
      <main
        className="login-page"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div style={{ color: 'var(--gz-text-secondary)' }}>Вход…</div>
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
