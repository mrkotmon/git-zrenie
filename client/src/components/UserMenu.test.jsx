import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import UserMenu from './UserMenu.jsx';
import RequireAuth from './RequireAuth.jsx';
import { renderWithStore, signedInState, signedOutState } from '../test/renderWithStore.jsx';

afterEach(() => vi.unstubAllGlobals());

describe('UserMenu', () => {
  it('до входа — кнопка «Войти» на страницу входа', () => {
    renderWithStore(<UserMenu />, { preloadedState: signedOutState });

    expect(screen.getByRole('link', { name: 'Войти' })).toHaveAttribute('href', '/login');
  });

  it('после входа — аватар и логин, меню с разделами', () => {
    renderWithStore(<UserMenu />, { preloadedState: signedInState });

    const trigger = screen.getByRole('button', { name: 'Меню пользователя @ada' });
    expect(trigger).toHaveTextContent('ada');
    expect(screen.queryByRole('link', { name: 'Войти' })).not.toBeInTheDocument();

    fireEvent.click(trigger);
    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Мои разборы' })).toHaveAttribute(
      'href',
      '/runs',
    );
    expect(within(menu).getByRole('menuitem', { name: 'Профиль на GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/ada',
    );
  });

  it('«Выйти» завершает сессию на сервере и ведёт на главную', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('') });
    vi.stubGlobal('fetch', fetchMock);
    const store = renderWithStore(<UserMenu />, {
      path: '/runs',
      preloadedState: signedInState,
    });

    fireEvent.click(screen.getByRole('button', { name: /Меню пользователя/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Выйти' }));

    expect(await screen.findByTestId('path')).toHaveTextContent('/');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('без аватара показывает первую букву логина', () => {
    renderWithStore(<UserMenu />, {
      preloadedState: {
        auth: { ...signedInState.auth, user: { ...signedInState.auth.user, avatar_url: null } },
      },
    });

    expect(screen.getByRole('button', { name: /Меню пользователя/ })).toHaveTextContent('A');
  });
});

describe('RequireAuth', () => {
  const page = (
    <RequireAuth>
      <p>Секретная страница</p>
    </RequireAuth>
  );

  it('пока проверяем вход — показывает загрузку', () => {
    renderWithStore(page, {
      path: '/runs',
      preloadedState: { auth: { ...signedOutState.auth, initialized: false } },
    });

    expect(screen.getByRole('status', { name: 'Проверяем вход' })).toBeInTheDocument();
  });

  it('не вошёл — отправляет на /login', () => {
    renderWithStore(page, { path: '/runs', preloadedState: signedOutState });

    expect(screen.getByTestId('path')).toHaveTextContent('/login');
  });

  it('вошёл — показывает страницу', () => {
    renderWithStore(page, { path: '/runs', preloadedState: signedInState });

    expect(screen.getByText('Секретная страница')).toBeInTheDocument();
  });
});
