import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import Runs from './Runs.jsx';
import { rememberRepo } from '../../lib/recentRepos.js';
import { renderWithStore, signedInState } from '../../test/renderWithStore.jsx';

function renderRuns() {
  return renderWithStore(<Runs />, { path: '/runs', preloadedState: signedInState });
}

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('Мои разборы', () => {
  it('показывает профиль пользователя из базы', () => {
    renderRuns();

    const profile = screen.getByRole('complementary', { name: 'Профиль' });
    expect(profile).toHaveTextContent('@ada');
    expect(profile).toHaveTextContent('В Git Зрении с 15 сентября 2026');
    expect(screen.getByRole('link', { name: /github\.com\/ada/ })).toHaveAttribute(
      'href',
      'https://github.com/ada',
    );
  });

  it('без истории предлагает примеры', () => {
    renderRuns();

    expect(screen.getByRole('heading', { name: 'Разберём первый репозиторий' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /vitejs\/vite/ }));
    expect(screen.getByTestId('path')).toHaveTextContent('/repo/vitejs/vite');
  });

  it('открывает репозиторий по ссылке или owner/name', () => {
    renderRuns();

    fireEvent.change(screen.getByLabelText('Репозиторий GitHub'), {
      target: { value: 'https://github.com/facebook/react' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Разобрать' }));

    expect(screen.getByTestId('path')).toHaveTextContent('/repo/facebook/react');
  });

  it('показывает ошибку для неверного ввода и сбрасывает её при правке', () => {
    renderRuns();
    const input = screen.getByLabelText('Репозиторий GitHub');

    fireEvent.change(input, { target: { value: 'не репозиторий' } });
    fireEvent.click(screen.getByRole('button', { name: 'Разобрать' }));
    expect(screen.getByRole('alert')).toHaveTextContent('owner/name');

    fireEvent.change(input, { target: { value: 'acme/app' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('показывает недавно открытые, открывает и удаляет их', () => {
    rememberRepo({ owner: 'acme', name: 'app' });
    rememberRepo({ owner: 'vitejs', name: 'vite' });
    renderRuns();

    expect(screen.getByRole('heading', { name: /Недавно открытые/ })).toHaveTextContent('2');
    fireEvent.click(screen.getByRole('button', { name: 'Убрать vitejs/vite из списка' }));
    expect(screen.queryByText('vitejs/vite')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Открыть' }));
    expect(screen.getByTestId('path')).toHaveTextContent('/repo/acme/app');
  });

  it('кнопка «Выйти» завершает сессию', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve('') }),
    );
    const store = renderRuns();

    fireEvent.click(screen.getByRole('button', { name: /Выйти/ }));

    expect(await screen.findByTestId('path')).toHaveTextContent('/');
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});
