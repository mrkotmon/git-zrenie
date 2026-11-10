import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from './AppErrorBoundary';

function BrokenComponent() {
  throw new Error('Ошибка для теста');
}

describe('P3.14: AppErrorBoundary', () => {
  it('показывает дочерний компонент, если ошибок нет', () => {
    render(
      <AppErrorBoundary>
        <p>Приложение работает</p>
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Приложение работает')).toBeInTheDocument();
  });

  it('показывает запасной экран, если компонент упал', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      render(
        <AppErrorBoundary>
          <BrokenComponent />
        </AppErrorBoundary>,
      );

      expect(screen.getByRole('alert')).toHaveTextContent('Произошла ошибка');
      expect(screen.getByRole('button', { name: 'Попробовать снова' })).toBeInTheDocument();
    } finally {
      log.mockRestore();
    }
  });
});
