import CheckIcon from '../../../components/icons/CheckIcon.jsx';

const AUDIENCE = [
  {
    title: 'Новичку в команде',
    subtitle: 'Первый день в проекте с десятком версионных веток.',
    items: [
      'Карта веток с ролями: feature → develop → release → main',
      'Маршрут чтения: с каких файлов начать',
      '«Кого спросить» по каждому модулю',
      'История релизов и хотфиксов',
    ],
  },
  {
    title: 'Тимлиду и скрам-мастеру',
    subtitle: 'Видно, что происходит со спринтом, без ручных отчётов.',
    items: [
      'Заброшенные ветки и PR без ревью',
      'Задачи «в работе», по которым нет кода',
      'Нагрузка по людям: коммиты, PR, ревью',
      'Сводка к ретроспективе и экспорт в PDF',
    ],
  },
];

export default function Audience() {
  return (
    <section id="audience" className="section" aria-labelledby="audience-title">
      <div className="container">
        <p className="eyebrow">Для кого</p>
        <h2 id="audience-title" className="section__title">
          Одна история — два взгляда
        </h2>
        <div className="audience__grid">
          {AUDIENCE.map((group) => (
            <article key={group.title} className="card audience__card">
              <h3 className="audience__title">{group.title}</h3>
              <p className="audience__subtitle">{group.subtitle}</p>
              <ul className="audience__list">
                {group.items.map((item) => (
                  <li key={item} className="audience__item">
                    <span className="audience__check">
                      <CheckIcon />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
