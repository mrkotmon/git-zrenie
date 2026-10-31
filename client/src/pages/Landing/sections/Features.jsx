import featuresGraph from '../../../assets/images/features-graph.png';
import themeBlueprint from '../../../assets/images/theme-blueprint.png';
import themeGraphite from '../../../assets/images/theme-graphite.png';
import themePaper from '../../../assets/images/theme-paper.png';
import searchIcon from '../../../assets/icons/search.svg';

const THEMES = [
  { image: themeGraphite, label: 'Графит' },
  { image: themePaper, label: 'Бумага' },
  { image: themeBlueprint, label: 'Чертёж' },
];

export default function Features() {
  return (
    <section id="features" className="section" aria-labelledby="features-title">
      <div className="container">
        <p className="eyebrow">Возможности</p>
        <h2 id="features-title" className="section__title">
          Всё, чтобы понять историю проекта
        </h2>
        <div className="features__grid">
          <article className="card features__card">
            <h3 className="card__title">Граф 2.5D</h3>
            <p className="card__text">
              Время × ветки × объём изменений. Вращайте сцену, смотрите сверху или сбоку, фильтруйте
              по спринтам.
            </p>
            <div className="features__media">
              <img src={featuresGraph} alt="Сцена графа: время, ветки и объём изменений" />
            </div>
          </article>

          <article className="card features__card">
            <h3 className="card__title">Детали по клику</h3>
            <p className="card__text">
              Автор, строки, файлы, задача и PR — без перехода на GitHub.
            </p>
            <div className="features__media features__media--empty" aria-hidden="true" />
          </article>

          <article className="card features__card">
            <h3 className="card__title">Три стиля оформления</h3>
            <p className="card__text">
              Графит для работы, Бумага для печати и презентаций, Чертёж — для любителей схем.
            </p>
            <div className="features__themes">
              {THEMES.map((theme) => (
                <figure key={theme.label} className="features__theme">
                  <img src={theme.image} alt={`Граф в стиле «${theme.label}»`} />
                  <figcaption>{theme.label}</figcaption>
                </figure>
              ))}
            </div>
          </article>

          <article className="card features__card">
            <h3 className="card__title card__title--with-icon">
              <img className="card__icon" src={searchIcon} alt="" width="22" height="22" />
              Поиск по коммитам
            </h3>
            <p className="card__text">
              По автору, хешу или словам в сообщении — найденный коммит подсветится на графе.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
