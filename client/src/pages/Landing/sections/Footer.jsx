import logoUrl from '../../../assets/icons/logo.svg';
import GithubIcon from '../../../components/icons/GithubIcon.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <img src={logoUrl} alt="" width="30" height="30" />
          <span className="footer__name">Git Зрение</span>
        </div>
        <p className="footer__meta">Курсовой проект «Веб-приложения», ИТМО, 2026</p>
        <p className="footer__team">Казорин Даниил · Немыкин Ярослав · Павлов Руслан</p>
        <a
          className="footer__link"
          href="https://github.com/mrkotmon/git-zrenie"
          target="_blank"
          rel="noreferrer"
        >
          <GithubIcon size={16} />
          mrkotmon/git-zrenie
        </a>
      </div>
    </footer>
  );
}
