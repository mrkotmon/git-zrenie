import {
  ChevronDownIcon,
  ChevronUpIcon,
  FullscreenIcon,
  MinusIcon,
  PlusIcon,
  RefreshIcon,
  ResetIcon,
} from '../../../components/icons/GraphIcons.jsx';

export default function GraphStage({
  expanded,
  refreshKey,
  nodeStyleLabel,
  sprintLabel,
  zoom,
  onReset,
  onRefresh,
  onPitchUp,
  onPitchDown,
  onZoomIn,
  onZoomOut,
  onToggleExpanded,
}) {
  return (
    <section
      className={`graph-stage${expanded ? ' graph-stage--expanded' : ''}`}
      aria-labelledby="graph-stage-title"
    >
      <h2 id="graph-stage-title" className="visually-hidden">
        Сцена графа 2.5D
      </h2>

      <div className="graph-stage__grid" aria-hidden="true" />

      <div key={refreshKey} className="graph-stage__empty">
        <span className="graph-stage__badge">2.5D</span>
        <p className="graph-stage__title">Здесь будет граф веток и коммитов</p>
        <p className="graph-stage__text">
          Сцена, ракурс и фильтры готовы. Отрисовка графа появится отдельным этапом.
        </p>
        <p className="graph-stage__meta">
          Узлы: {nodeStyleLabel} · {sprintLabel} · масштаб {zoom}%
        </p>
      </div>

      <div className="graph-stage__controls" role="group" aria-label="Управление сценой">
        <button
          type="button"
          className="graph-control"
          aria-label="Сбросить ракурс"
          onClick={onReset}
        >
          <ResetIcon />
        </button>
        <button
          type="button"
          className="graph-control"
          aria-label="Обновить сцену"
          onClick={onRefresh}
        >
          <RefreshIcon />
        </button>
        <button
          type="button"
          className="graph-control"
          aria-label="Повернуть камеру вверх"
          onClick={onPitchUp}
        >
          <ChevronUpIcon />
        </button>
        <button
          type="button"
          className="graph-control"
          aria-label="Повернуть камеру вниз"
          onClick={onPitchDown}
        >
          <ChevronDownIcon />
        </button>
        <button type="button" className="graph-control" aria-label="Приблизить" onClick={onZoomIn}>
          <PlusIcon />
        </button>
        <button type="button" className="graph-control" aria-label="Отдалить" onClick={onZoomOut}>
          <MinusIcon />
        </button>
        <button
          type="button"
          className="graph-control"
          aria-label={expanded ? 'Свернуть сцену' : 'Развернуть сцену'}
          aria-pressed={expanded}
          onClick={onToggleExpanded}
        >
          <FullscreenIcon />
        </button>
      </div>
    </section>
  );
}
