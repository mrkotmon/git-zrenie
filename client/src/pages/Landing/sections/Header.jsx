import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Drawer, IconButton } from '@mui/material';
import logoUrl from '../../../assets/icons/logo.svg';
import BurgerIcon from '../../../components/icons/BurgerIcon.jsx';
import GithubIcon from '../../../components/icons/GithubIcon.jsx';

const NAV_ITEMS = [
  { label: 'Для кого', href: '#audience' },
  { label: 'Возможности', href: '#features' },
  { label: 'Как это работает', href: '#how-it-works' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="container header__inner">
        <RouterLink className="header__logo" to="/" onClick={closeMenu}>
          <img src={logoUrl} alt="" width="30" height="30" />
          <span className="header__brand">Git Зрение</span>
        </RouterLink>
        <nav className="header__nav" aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} className="header__link" href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header__actions">
          <Button
            className="header__login"
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/login"
            startIcon={<GithubIcon size={16} />}
          >
            Войти
          </Button>
          <IconButton
            className="header__burger"
            aria-label="Открыть меню"
            onClick={() => setMenuOpen(true)}
          >
            <BurgerIcon />
          </IconButton>
        </div>
      </div>
      <Drawer anchor="right" open={menuOpen} onClose={closeMenu}>
        <nav className="drawer" aria-label="Мобильная навигация">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} className="drawer__link" href={item.href} onClick={closeMenu}>
              {item.label}
            </a>
          ))}
          <Button
            className="drawer__login"
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/login"
            onClick={closeMenu}
            startIcon={<GithubIcon />}
          >
            Войти
          </Button>
        </nav>
      </Drawer>
    </header>
  );
}
