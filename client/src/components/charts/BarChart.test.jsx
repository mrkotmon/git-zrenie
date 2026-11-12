import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import BarChart, { drawBarChart } from './BarChart.jsx';

function fakeContext() {
  return {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    setTransform: vi.fn(),
  };
}

const colors = { bar: 'red', barActive: 'white', grid: 'gray', text: 'silver' };
const data = [
  { key: 'a', label: '1 ноя', value: 2 },
  { key: 'b', label: '2 ноя', value: 0 },
  { key: 'c', label: '3 ноя', value: 4 },
];

describe('drawBarChart', () => {
  it('рисует по столбику на каждое значение, высота пропорциональна числу', () => {
    const ctx = fakeContext();
    const bars = drawBarChart(ctx, data, { width: 300, height: 200, colors });

    expect(bars).toHaveLength(3);
    expect(ctx.fillRect).toHaveBeenCalledTimes(3);
    expect(bars[1].height).toBe(0);
    expect(bars[2].height).toBeCloseTo(bars[0].height * 2);
  });

  it('выделяет активный столбик другим цветом', () => {
    const ctx = fakeContext();
    const styles = [];
    ctx.fillRect.mockImplementation(() => styles.push(ctx.fillStyle));
    drawBarChart(ctx, data, { width: 300, height: 200, colors, activeIndex: 2 });

    expect(styles).toEqual(['red', 'red', 'white']);
  });

  it('сокращает длинные подписи, чтобы они не наезжали друг на друга', () => {
    const ctx = fakeContext();
    ctx.measureText = (text) => ({ width: text.length * 7 });
    const long = [
      { key: 'a', label: 'очень-длинное-имя-автора', value: 1 },
      { key: 'b', label: 'b', value: 1 },
    ];
    drawBarChart(ctx, long, { width: 250, height: 200, colors });

    const labels = ctx.fillText.mock.calls.map((call) => call[0]);
    expect(labels).toContain('b');
    expect(labels.find((t) => t.startsWith('очень'))).toMatch(/…$/);
  });

  it('ничего не рисует без данных', () => {
    const ctx = fakeContext();
    expect(drawBarChart(ctx, [], { width: 300, height: 200, colors })).toEqual([]);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});

describe('BarChart', () => {
  afterEach(() => vi.restoreAllMocks());

  it('рисует на canvas и дублирует данные таблицей для скринридеров', () => {
    const ctx = fakeContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);

    render(<BarChart data={data} label="Коммиты по дням" />);

    expect(screen.getByRole('img', { name: 'Коммиты по дням' })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Коммиты по дням' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: '3 ноя' })).toBeInTheDocument();
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  it('показывает значение столбика под курсором', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(fakeContext());
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);
    vi.spyOn(HTMLCanvasElement.prototype, 'getBoundingClientRect').mockReturnValue({ left: 0 });

    render(<BarChart data={data} label="Коммиты по дням" />);
    const canvas = screen.getByRole('img', { name: 'Коммиты по дням' });

    // Третий столбик занимает правую часть области графика.
    fireEvent.mouseMove(canvas, { clientX: 250 });
    expect(screen.getByText('3 ноя: 4')).toBeInTheDocument();

    fireEvent.mouseLeave(canvas);
    expect(screen.queryByText('3 ноя: 4')).not.toBeInTheDocument();
    expect(screen.getByText('Наведите на столбик, чтобы увидеть число')).toBeInTheDocument();
  });
});
