import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Landing from './Landing.jsx';
import { createStore } from '../../store/store.js';
import { theme } from '../../theme/theme.js';

function renderLanding(preloadedState) {
  return render(
    <Provider store={createStore(preloadedState)}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <Landing />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
}

describe('Landing', () => {
  it('показывает hero и ключевые секции', () => {
    renderLanding();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Каждый коммит как часть истории' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Войти через GitHub' })).toBeInTheDocument();
    expect(screen.getByText('В репозитории 40 веток')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Одна история — два взгляда' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Всё, чтобы понять историю проекта' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'От ссылки до графа за минуту' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ваш код остаётся вашим' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Попробуйте на своём репозитории' }),
    ).toBeInTheDocument();
  });

  it('открывает и закрывает мобильное меню', async () => {
    renderLanding();

    expect(screen.getByRole('link', { name: 'Возможности' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Открыть меню' }));
    const drawerLink = await screen.findByRole('link', { name: 'Возможности' });
    expect(drawerLink).toHaveClass('drawer__link');

    fireEvent.click(drawerLink);
    await waitFor(() => {
      expect(drawerLink).not.toBeInTheDocument();
    });
  });

  it('показывает ошибку для неверной ссылки и сбрасывает её при вводе', () => {
    renderLanding();
    const input = screen.getByLabelText('Ссылка на репозиторий GitHub');

    fireEvent.change(input, { target: { value: 'не ссылка' } });
    fireEvent.click(screen.getByRole('button', { name: 'Разобрать' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Введите ссылку на репозиторий GitHub');

    fireEvent.change(input, { target: { value: 'gitlab.com/a/b' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('после входа вместо «Войти» показывает меню пользователя и «Мои разборы»', () => {
    renderLanding({
      auth: {
        user: { id: 1, login: 'ada', avatar_url: null },
        loading: false,
        error: null,
        isAuthenticated: true,
        initialized: true,
      },
    });

    expect(screen.getByRole('button', { name: 'Меню пользователя @ada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Мои разборы' })).toHaveAttribute('href', '/runs');
    expect(screen.queryByRole('link', { name: 'Войти через GitHub' })).not.toBeInTheDocument();
  });
});
