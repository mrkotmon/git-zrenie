import { useEffect, useRef, useState } from 'react';

const PADDING = { top: 16, right: 12, bottom: 36, left: 36 };

// Верх шкалы — чётное «круглое» число, чтобы средняя отметка тоже была целой.
function niceMax(value) {
  if (value <= 10) return Math.max(2, Math.ceil(value / 2) * 2);
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
}

function fitLabel(ctx, text, maxWidth) {
  if (!ctx.measureText || ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) cut = cut.slice(0, -1);
  return `${cut}…`;
}

/**
 * Рисует столбчатую диаграмму на Canvas. Вынесена отдельно от React,
 * чтобы проверять отрисовку в тестах на подменённом контексте.
 * Возвращает прямоугольники столбиков — по ним определяем наведение мыши.
 */
export function drawBarChart(ctx, data, { width, height, colors, activeIndex = -1 }) {
  ctx.clearRect(0, 0, width, height);
  if (data.length === 0) return [];

  const plotW = width - PADDING.left - PADDING.right;
  const plotH = height - PADDING.top - PADDING.bottom;
  const max = niceMax(Math.max(...data.map((d) => d.value)));

  ctx.font = '12px "IBM Plex Sans Variable", system-ui, sans-serif';
  ctx.textBaseline = 'middle';

  // Сетка и подписи оси Y: 0, половина, максимум.
  for (const value of [0, max / 2, max]) {
    const y = PADDING.top + plotH - (value / max) * plotH;
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING.left, y);
    ctx.lineTo(width - PADDING.right, y);
    ctx.stroke();
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'right';
    ctx.fillText(String(Math.round(value)), PADDING.left - 8, y);
  }

  const slot = plotW / data.length;
  const barW = Math.max(2, Math.min(40, slot * 0.7));
  const labelEvery = Math.ceil(data.length / Math.max(1, Math.floor(plotW / 56)));

  return data.map((item, i) => {
    const h = (item.value / max) * plotH;
    const x = PADDING.left + i * slot + (slot - barW) / 2;
    const y = PADDING.top + plotH - h;

    ctx.fillStyle = i === activeIndex ? colors.barActive : colors.bar;
    ctx.fillRect(x, y, barW, h);

    if (i % labelEvery === 0) {
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      const room = slot * labelEvery - 4;
      ctx.fillText(fitLabel(ctx, item.label, room), x + barW / 2, height - PADDING.bottom / 2);
    }
    // slotX/slotWidth — вся колонка столбика, чтобы наведение срабатывало и между столбиками.
    return { x, y, width: barW, height: h, slotX: PADDING.left + i * slot, slotWidth: slot };
  });
}

function readColors(element) {
  const css = getComputedStyle(element);
  const read = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  return {
    bar: read('--gz-accent', '#d0302a'),
    barActive: read('--gz-text', '#ffffff'),
    grid: read('--gz-border', '#272c36'),
    text: read('--gz-text-muted', '#7b828c'),
  };
}

export default function BarChart({ data, label, height = 220 }) {
  const canvasRef = useRef(null);
  const barsRef = useRef([]);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const update = () => setWidth(canvas.parentElement?.clientWidth ?? 0);
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = width > 0 ? canvas.getContext('2d') : null;
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    barsRef.current = drawBarChart(ctx, data, {
      width,
      height,
      colors: readColors(canvas),
      activeIndex: hover,
    });
  }, [data, width, height, hover]);

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    setHover(barsRef.current.findIndex((bar) => x >= bar.slotX && x < bar.slotX + bar.slotWidth));
  };

  const active = data[hover];

  return (
    <figure className="bar-chart">
      <div className="bar-chart__canvas">
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height }}
          role="img"
          aria-label={label}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(-1)}
        />
      </div>
      <figcaption className="bar-chart__caption" aria-live="polite">
        {active ? `${active.label}: ${active.value}` : 'Наведите на столбик, чтобы увидеть число'}
      </figcaption>
      <table className="visually-hidden">
        <caption>{label}</caption>
        <tbody>
          {data.map((item) => (
            <tr key={item.key}>
              <th scope="row">{item.label}</th>
              <td>{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
