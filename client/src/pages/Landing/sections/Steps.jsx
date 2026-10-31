const STEPS = [
  {
    number: '01',
    title: 'Войдите через GitHub',
    text: 'Пароль не нужен — только права на чтение.',
  },
  {
    number: '02',
    title: 'Вставьте ссылку',
    text: 'Публичный или приватный репозиторий, к которому у вас есть доступ.',
  },
  {
    number: '03',
    title: 'Изучайте',
    text: 'Граф, маршрут новичка и экран спринта — сразу после разбора.',
  },
];

export default function Steps() {
  return (
    <section id="how-it-works" className="section" aria-labelledby="steps-title">
      <div className="container">
        <p className="eyebrow">Три шага</p>
        <h2 id="steps-title" className="section__title">
          От ссылки до графа за минуту
        </h2>
        <div className="steps__grid">
          {STEPS.map((step) => (
            <article key={step.number} className="card steps__card">
              <p className="steps__number">{step.number}</p>
              <h3 className="steps__title">{step.title}</h3>
              <p className="card__text">{step.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
