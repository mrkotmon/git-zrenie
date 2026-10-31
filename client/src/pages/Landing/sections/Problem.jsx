import branchesIcon from '../../../assets/icons/branches.svg';
import docsIcon from '../../../assets/icons/docs.svg';
import questionIcon from '../../../assets/icons/question.svg';

const PROBLEMS = [
  {
    icon: branchesIcon,
    title: 'В репозитории 40 веток',
    text: 'Какая из них живая, куда делать PR и что уже заброшено — непонятно.',
  },
  {
    icon: questionIcon,
    title: 'Спросить некого',
    text: 'Автор модуля давно ушёл, а в git log — только «fix» и «wip».',
  },
  {
    icon: docsIcon,
    title: 'Спринт идёт, а кода нет',
    text: 'По доске задачи «в работе», но по ним ни одного коммита.',
  },
];

export default function Problem() {
  return (
    <section className="section section--first" aria-labelledby="problem-title">
      <div className="container">
        <p className="eyebrow">Знакомая ситуация?</p>
        <h2 id="problem-title" className="section__title">
          Git хранит всю историю, но не отвечает на вопросы
        </h2>
        <div className="problem__grid">
          {PROBLEMS.map((item) => (
            <article key={item.title} className="card problem__card">
              <img className="problem__icon" src={item.icon} alt="" width="44" height="44" />
              <h3 className="problem__title">{item.title}</h3>
              <p className="problem__text">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
