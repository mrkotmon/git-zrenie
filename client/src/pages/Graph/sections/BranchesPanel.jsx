import { EyeIcon, EyeOffIcon } from '../../../components/icons/GraphIcons.jsx';
import { BRANCHES } from '../graphData.js';

export default function BranchesPanel({
  selectedBranch,
  hiddenBranches,
  onSelectBranch,
  onToggleBranch,
}) {
  return (
    <aside className="branches" aria-labelledby="branches-title">
      <div className="branches__head">
        <h2 id="branches-title" className="branches__title">
          Ветки
        </h2>
        <p className="branches__hint">клик — последний коммит</p>
      </div>

      <ul className="branches__list">
        {BRANCHES.map((branch) => {
          const isHidden = hiddenBranches.has(branch.name);
          const isSelected = selectedBranch === branch.name;

          return (
            <li
              key={branch.name}
              className={[
                'branch',
                isSelected ? 'branch--selected' : '',
                isHidden ? 'branch--hidden' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <button
                type="button"
                className="branch__select"
                aria-pressed={isSelected}
                aria-label={`${branch.name}, ${branch.status}`}
                onClick={() => onSelectBranch(branch.name)}
              >
                <span
                  className="branch__dot"
                  style={{ backgroundColor: branch.color }}
                  aria-hidden="true"
                />
                <span className="branch__body">
                  <span className="branch__name">{branch.name}</span>
                  <span className={`branch__status branch__status--${branch.tone}`}>
                    {branch.status}
                  </span>
                </span>
              </button>

              <button
                type="button"
                className="branch__eye"
                aria-pressed={!isHidden}
                aria-label={`${isHidden ? 'Показать' : 'Скрыть'} ветку ${branch.name}`}
                onClick={() => onToggleBranch(branch.name)}
              >
                {isHidden ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </li>
          );
        })}
      </ul>

      <section className="branches__help" aria-labelledby="branches-help-title">
        <h3 id="branches-help-title">Как читать</h3>
        <p>X — время, Z — ветки, высота над плоскостью — объём изменений в коммите.</p>
        <p>
          Двойное кольцо — merge. Пунктирная дорожка — заброшенная ветка. Тень показывает место
          коммита на дорожке.
        </p>
      </section>
    </aside>
  );
}
