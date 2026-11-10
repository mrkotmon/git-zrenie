import eyeIcon from '../../../assets/icons/eye.svg';
import lockIcon from '../../../assets/icons/lock.svg';
import undoIcon from '../../../assets/icons/undo.svg';

const GUARANTEES = [
  {
    icon: eyeIcon,
    title: 'Только чтение',
    text: 'Мы не пишем в репозитории и не создаём PR.',
  },
  {
    icon: lockIcon,
    title: 'Минимум прав',
    text: 'repo, read:project, read:user — и ничего больше.',
  },
  {
    icon: undoIcon,
    title: 'Доступ отзывается',
    text: 'В один клик в настройках GitHub.',
  },
];

export default function Security() {
  return (
    <section className="section section--security" aria-labelledby="security-title">
      <div className="container">
        <div className="security__card">
          <div className="security__intro">
            <p className="eyebrow">Безопасность</p>
            <h2 id="security-title" className="security__title">
              Ваш код остаётся вашим
            </h2>
          </div>
          <div className="security__items">
            {GUARANTEES.map((item) => (
              <div key={item.title} className="security__item">
                <div className="security__item-head">
                  <img className="security__icon" src={item.icon} alt="" width="20" height="20" />
                  <span className="security__item-title">{item.title}</span>
                </div>
                <p className="security__item-text">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
