import { SPRINTS } from '../graphData.js';

export default function SprintsPanel({ selectedSprint, onSelectSprint }) {
  return (
    <section className="sprints" aria-label="Фильтр по спринтам">
      <button
        type="button"
        className={`sprint sprint--all${selectedSprint === 'all' ? ' sprint--active' : ''}`}
        aria-pressed={selectedSprint === 'all'}
        onClick={() => onSelectSprint('all')}
      >
        Все
      </button>

      {SPRINTS.map((sprint) => (
        <button
          key={sprint.id}
          type="button"
          className={['sprint', selectedSprint === sprint.id ? 'sprint--active' : '']
            .filter(Boolean)
            .join(' ')}
          aria-pressed={selectedSprint === sprint.id}
          onClick={() => onSelectSprint(sprint.id)}
        >
          <span className="sprint__name">{sprint.label}</span>
          <span className="sprint__range">{sprint.range}</span>
          <span className="sprint__count">
            {sprint.current ? 'идёт сейчас' : `${sprint.commits} комм.`}
            {sprint.current && <span className="sprint__dot" aria-hidden="true" />}
          </span>
        </button>
      ))}
    </section>
  );
}
