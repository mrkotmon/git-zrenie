import { Link } from 'react-router-dom';
import logoUrl from '../../../assets/icons/logo.svg';
import { REPOSITORY } from '../graphData.js';

export default function GraphHeader() {
  return (
    <header className="graph-header">
      <div className="graph-header__inner">
        <Link className="graph-header__logo" to="/">
          <img src={logoUrl} alt="" width="30" height="30" />
          <span className="graph-header__brand">Git Зрение</span>
        </Link>

        <p className="graph-header__repo">
          <span>{REPOSITORY.owner}</span>
          <span className="graph-header__slash">/</span>
          <strong>{REPOSITORY.name}</strong>
        </p>

        <nav className="graph-header__nav" aria-label="Разделы разбора">
          <Link
            className="graph-header__link graph-header__link--active"
            to="/graph"
            aria-current="page"
          >
            Граф 2.5D
          </Link>
          <a className="graph-header__link" href="#onboarding">
            Новичку
          </a>
          <a className="graph-header__link" href="#lead">
            Тимлиду и скрам-мастеру
          </a>
        </nav>

        <p className="graph-header__stats">
          {REPOSITORY.branches} веток · {REPOSITORY.commits} коммитов · {REPOSITORY.members}{' '}
          участников
        </p>

        <span className="graph-header__avatar" role="img" aria-label="Профиль: Анна Смирнова">
          АС
        </span>
      </div>
    </header>
  );
}
