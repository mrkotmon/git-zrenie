import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Button, Divider, Menu, MenuItem } from '@mui/material';
import GithubIcon from './icons/GithubIcon.jsx';
import { logoutUser } from '../store/authSlice.js';
import './UserMenu.css';

/** Кнопка «Войти» до входа и аватар с меню после. */
export default function UserMenu({ className = '' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [anchor, setAnchor] = useState(null);

  if (!isAuthenticated || !user) {
    return (
      <Button
        className={`user-menu__login ${className}`}
        variant="outlined"
        color="primary"
        component={RouterLink}
        to="/login"
        startIcon={<GithubIcon size={16} />}
      >
        Войти
      </Button>
    );
  }

  const close = () => setAnchor(null);
  // Сначала уходим на главную: страница, где открыто меню, может требовать входа.
  const logout = () => {
    close();
    navigate('/', { replace: true });
    dispatch(logoutUser());
  };

  return (
    <>
      <button
        type="button"
        className={`user-menu__trigger ${className}`}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-label={`Меню пользователя @${user.login}`}
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        {user.avatar_url ? (
          <img className="user-menu__avatar" src={user.avatar_url} alt="" width="32" height="32" />
        ) : (
          <span className="user-menu__avatar user-menu__avatar--empty" aria-hidden="true">
            {user.login.slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="user-menu__login-name">{user.login}</span>
        <span className="user-menu__chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem component={RouterLink} to="/runs" onClick={close}>
          Мои разборы
        </MenuItem>
        <MenuItem
          component="a"
          href={`https://github.com/${user.login}`}
          target="_blank"
          rel="noreferrer"
          onClick={close}
        >
          Профиль на GitHub
        </MenuItem>
        <Divider />
        <MenuItem onClick={logout}>Выйти</MenuItem>
      </Menu>
    </>
  );
}
