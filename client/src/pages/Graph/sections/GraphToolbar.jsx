import { NODE_STYLES, THEMES, VIEWS } from '../graphData.js';

export default function GraphToolbar({
  theme,
  onThemeChange,
  nodeStyle,
  onNodeStyleChange,
  shadows,
  onShadowsChange,
  view,
  onViewChange,
  yaw,
  pitch,
  zoom,
}) {
  return (
    <div className="graph-toolbar">
      <div className="graph-toolbar__row">
        <span className="graph-toolbar__label">Стиль</span>

        <div className="graph-toolbar__group" role="group" aria-label="Оформление графа">
          {THEMES.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`graph-chip${theme === option.id ? ' graph-chip--active' : ''}`}
              aria-pressed={theme === option.id}
              onClick={() => onThemeChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="graph-toolbar__group" role="group" aria-label="Форма узлов">
          {NODE_STYLES.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`graph-chip${nodeStyle === option.id ? ' graph-chip--soft-active' : ''}`}
              aria-pressed={nodeStyle === option.id}
              onClick={() => onNodeStyleChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`graph-shadows${shadows ? ' graph-shadows--on' : ''}`}
          aria-pressed={shadows}
          onClick={onShadowsChange}
        >
          Тени: {shadows ? 'вкл' : 'выкл'}
        </button>
      </div>

      <div className="graph-toolbar__row graph-toolbar__row--views">
        <div className="graph-toolbar__group" role="group" aria-label="Проекция">
          {VIEWS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`graph-chip${view === option.id ? ' graph-chip--active' : ''}`}
              aria-pressed={view === option.id}
              onClick={() => onViewChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="graph-toolbar__hint">
          Перетаскивайте сцену, чтобы вращать · клик по коммиту — детали · поворот {yaw}°, наклон{' '}
          {pitch}° · масштаб {zoom}%
        </p>
      </div>
    </div>
  );
}
