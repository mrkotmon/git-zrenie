import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import searchIcon from '../../../assets/icons/search.svg';
import { normalizeRepoUrl, repoSubmitted, repoUrlChanged } from '../../../store/landingSlice.js';

export default function Cta() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const repoUrl = useSelector((state) => state.landing.repoUrl);
  const error = useSelector((state) => state.landing.error);

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(repoSubmitted());
    const normalized = normalizeRepoUrl(repoUrl);
    if (normalized) {
      // https://github.com/owner/repo(.git) → /repo/owner/repo
      navigate(`/repo/${normalized.replace('https://github.com/', '').replace(/\.git$/, '')}`);
    }
  };

  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="container">
        <div className="cta__card">
          <h2 id="cta-title" className="cta__title">
            Попробуйте на своём репозитории
          </h2>
          <p className="cta__subtitle">
            Вставьте ссылку — через минуту увидите граф, маршрут новичка и состояние спринта.
          </p>
          <form
            className={`cta__form${error ? ' cta__form--invalid' : ''}`}
            onSubmit={handleSubmit}
            noValidate
          >
            <img className="cta__icon" src={searchIcon} alt="" width="22" height="22" />
            <label className="visually-hidden" htmlFor="repo-url">
              Ссылка на репозиторий GitHub
            </label>
            <input
              id="repo-url"
              className="cta__input"
              name="repo"
              type="text"
              inputMode="url"
              autoComplete="off"
              placeholder="github.com/owner/repository"
              value={repoUrl}
              onChange={(event) => dispatch(repoUrlChanged(event.target.value))}
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'repo-error' : undefined}
            />
            <Button className="cta__submit" type="submit" variant="contained" size="large">
              Разобрать
              <span className="cta__arrow" aria-hidden="true">
                →
              </span>
            </Button>
          </form>
          {error && (
            <p id="repo-error" className="cta__error" role="alert">
              {error}
            </p>
          )}
          <p className="cta__hint">Публичные репозитории открываются без входа</p>
        </div>
      </div>
    </section>
  );
}
