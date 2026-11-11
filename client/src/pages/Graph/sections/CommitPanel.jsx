import GithubIcon from '../../../components/icons/GithubIcon.jsx';
import { SELECTED_COMMIT } from '../graphData.js';

export default function CommitPanel({ showFiles, onToggleFiles }) {
  return (
    <aside className="commit" aria-labelledby="commit-heading">
      <h2 id="commit-heading" className="commit__eyebrow">
        Выбранный коммит
      </h2>

      <p className="commit__branch">
        <span
          className="commit__dot"
          style={{ backgroundColor: SELECTED_COMMIT.branchColor }}
          aria-hidden="true"
        />
        {SELECTED_COMMIT.branch}
      </p>

      <h3 className="commit__title">{SELECTED_COMMIT.title}</h3>
      <p className="commit__meta">
        {SELECTED_COMMIT.sha} · {SELECTED_COMMIT.date} · {SELECTED_COMMIT.sprint}
      </p>

      <div className="commit__author">
        <span className="commit__avatar" aria-hidden="true">
          {SELECTED_COMMIT.authorInitials}
        </span>
        <span className="commit__author-text">
          <strong>{SELECTED_COMMIT.author}</strong>
          <small>автор коммита</small>
        </span>
      </div>

      <div className="commit__stats">
        <div className="commit__stat commit__stat--added">
          <strong>+{SELECTED_COMMIT.added}</strong>
          <span>строк добавлено</span>
        </div>
        <div className="commit__stat commit__stat--removed">
          <strong>−{SELECTED_COMMIT.removed}</strong>
          <span>строк удалено</span>
        </div>
      </div>

      <section className="commit__section" aria-labelledby="commit-files-title">
        <h4 id="commit-files-title">Изменённые файлы</h4>
        <ul className="commit__files">
          {SELECTED_COMMIT.files.map((file) => (
            <li key={file}>{file}</li>
          ))}
        </ul>
      </section>

      <dl className="commit__facts">
        <div>
          <dt>Задача</dt>
          <dd>{SELECTED_COMMIT.task}</dd>
        </div>
        <div>
          <dt>Pull request</dt>
          <dd>{SELECTED_COMMIT.pullRequest}</dd>
        </div>
        <div>
          <dt>Кого спросить</dt>
          <dd>{SELECTED_COMMIT.reviewer}</dd>
        </div>
        <div>
          <dt>Вклад в ветку</dt>
          <dd>{SELECTED_COMMIT.contribution}</dd>
        </div>
      </dl>

      <p className="commit__note">{SELECTED_COMMIT.note}</p>

      <div className="commit__actions">
        <a
          className="commit__primary"
          href={SELECTED_COMMIT.githubUrl}
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon size={16} />
          Открыть на GitHub
        </a>
        <button
          type="button"
          className={`commit__secondary${showFiles ? ' commit__secondary--active' : ''}`}
          aria-pressed={showFiles}
          onClick={onToggleFiles}
        >
          Файлы на карте
        </button>
      </div>
    </aside>
  );
}
