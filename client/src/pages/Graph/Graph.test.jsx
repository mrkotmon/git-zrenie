import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Graph from './Graph.jsx';

function renderGraph() {
  return render(
    <MemoryRouter>
      <Graph />
    </MemoryRouter>,
  );
}

describe('Graph', () => {
  it('показывает окружение графа и панель выбранного коммита', () => {
    renderGraph();

    expect(screen.getByText('Здесь будет граф веток и коммитов')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ветки' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'develop, Интеграция' })).toBeInTheDocument();
    expect(screen.getByText('Пагинация результатов')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Спринт 8/ })).toBeInTheDocument();
    expect(screen.getByText('Выбранный коммит')).toBeInTheDocument();
  });

  it('переключает тему, форму узлов и тени', () => {
    const { container } = renderGraph();

    fireEvent.click(screen.getByRole('button', { name: 'Бумага' }));
    expect(container.querySelector('.graph-page')).toHaveAttribute('data-theme', 'paper');
    expect(screen.getByRole('button', { name: 'Бумага' })).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Сферы' }));
    expect(screen.getByText(/Узлы: сферы/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Тени: вкл' }));
    expect(screen.getByRole('button', { name: 'Тени: выкл' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('выбирает и скрывает ветку', () => {
    renderGraph();
    const develop = screen.getByRole('button', { name: 'develop, Интеграция' });

    fireEvent.click(develop);
    expect(develop).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Скрыть ветку develop' }));
    expect(screen.getByRole('button', { name: 'Показать ветку develop' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Показать ветку develop' }));
    expect(screen.getByRole('button', { name: 'Скрыть ветку develop' })).toBeInTheDocument();
  });

  it('управляет ракурсом, масштабом и полноэкранным режимом', () => {
    const { container } = renderGraph();

    fireEvent.click(screen.getByRole('button', { name: 'Сверху' }));
    expect(screen.getByText(/поворот 0°, наклон 86°/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Приблизить' }));
    expect(screen.getByText(/Узлы: коммиты · все спринты · масштаб 125%/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Отдалить' }));
    expect(screen.getByText(/Узлы: коммиты · все спринты · масштаб 100%/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Повернуть камеру вниз' }));
    expect(screen.getByText(/наклон 80°/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Сбросить ракурс' }));
    expect(screen.getByText(/поворот 324°, наклон 36°/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Повернуть камеру вверх' }));
    expect(screen.getByText(/наклон 42°/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Развернуть сцену' }));
    expect(container.querySelector('.graph-stage')).toHaveClass('graph-stage--expanded');

    fireEvent.click(screen.getByRole('button', { name: 'Свернуть сцену' }));
    expect(container.querySelector('.graph-stage')).not.toHaveClass('graph-stage--expanded');
  });

  it('фильтрует спринты и переключает подписи файлов', () => {
    renderGraph();

    fireEvent.click(screen.getByRole('button', { name: /Спринт 3/ }));
    expect(screen.getByText(/Узлы: коммиты · спринт 3 · масштаб 100%/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Файлы на карте' }));
    expect(screen.getByRole('button', { name: 'Файлы на карте' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Обновить сцену' }));
    fireEvent.click(screen.getByRole('button', { name: 'Все' }));
    expect(screen.getByText(/все спринты/)).toBeInTheDocument();
  });
});
