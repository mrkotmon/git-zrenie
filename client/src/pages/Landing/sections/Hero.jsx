import { Button } from '@mui/material';
import heroGraph from '../../../assets/images/hero-graph.png';
import GithubIcon from '../../../components/icons/GithubIcon.jsx';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__content">
          <p className="hero__badge">
            <span aria-hidden="true">//</span> визуализация истории git
          </p>
          <h1 id="hero-title" className="hero__title">
            Каждый коммит как часть истории
          </h1>
          <p className="hero__text">
            Разберитесь в чужом репозитории за час, а не за неделю. Git Зрение строит объёмную карту
            веток и коммитов и подсказывает, что читать первым, кого спросить и где застрял спринт.
          </p>
          <div className="hero__actions">
            <Button
              className="hero__primary"
              variant="contained"
              size="large"
              href="/api/auth/github"
              startIcon={<GithubIcon />}
            >
              Войти через GitHub
            </Button>
            <Button
              className="hero__secondary"
              variant="outlined"
              color="inherit"
              size="large"
              href="#features"
            >
              Посмотреть демо
              <span className="hero__arrow" aria-hidden="true">
                →
              </span>
            </Button>
          </div>
        </div>
        <div className="hero__card">
          <div className="hero__windowbar">
            <span className="hero__dot hero__dot--red" />
            <span className="hero__dot hero__dot--yellow" />
            <span className="hero__dot hero__dot--green" />
            <span className="hero__path">git-zrenie · acme / payments-service · граф 2.5D</span>
          </div>
          <img
            className="hero__image"
            src={heroGraph}
            alt="2.5D-граф веток и коммитов репозитория"
          />
        </div>
      </div>
    </section>
  );
}
