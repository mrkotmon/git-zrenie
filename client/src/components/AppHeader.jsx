import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import logoUrl from '../assets/icons/logo.svg';
import UserMenu from './UserMenu.jsx';
import './AppHeader.css';

/** Шапка внутренних страниц: логотип, «Мои разборы» и меню пользователя. */
export default function AppHeader({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <header className="app-header">
      <Link className="app-header__logo" to="/">
        <img src={logoUrl} alt="" width="30" height="30" />
        <span>Git Зрение</span>
      </Link>
      {isAuthenticated && (
        <nav className="app-header__nav" aria-label="Разделы">
          <NavLink className="app-header__link" to="/runs">
            Мои разборы
          </NavLink>
        </nav>
      )}
      <div className="app-header__middle">{children}</div>
      <UserMenu />
    </header>
  );
}
