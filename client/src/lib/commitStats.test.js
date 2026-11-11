import { describe, expect, it } from 'vitest';
import {
  UNKNOWN_AUTHOR,
  authorName,
  commitsByAuthor,
  commitsOverTime,
  firstLine,
  summarize,
} from './commitStats.js';

function commit(date, login, name = login) {
  return {
    sha: `${login}-${date}`,
    author: login ? { login } : null,
    commit: { message: 'msg', author: { name, date } },
  };
}

describe('authorName', () => {
  it('берёт логин GitHub, иначе имя из git, иначе запасной текст', () => {
    expect(authorName(commit('2026-11-01T10:00:00Z', 'ada'))).toBe('ada');
    expect(authorName(commit('2026-11-01T10:00:00Z', null, 'Ada Lovelace'))).toBe('Ada Lovelace');
    expect(authorName({ commit: {} })).toBe(UNKNOWN_AUTHOR);
  });
});

describe('firstLine', () => {
  it('возвращает первую строку сообщения', () => {
    expect(firstLine('Заголовок\n\nтело')).toBe('Заголовок');
    expect(firstLine(undefined)).toBe('');
  });
});

describe('commitsOverTime', () => {
  it('считает коммиты по дням и заполняет пустые дни', () => {
    const result = commitsOverTime([
      commit('2026-11-01T10:00:00Z', 'a'),
      commit('2026-11-01T18:00:00Z', 'b'),
      commit('2026-11-03T09:00:00Z', 'a'),
    ]);

    expect(result.unit).toBe('day');
    expect(result.buckets.map((b) => [b.key, b.value])).toEqual([
      ['2026-11-01', 2],
      ['2026-11-02', 0],
      ['2026-11-03', 1],
    ]);
    expect(result.buckets[0].label).toBe('1 ноя');
  });

  it('переходит на недели для истории длиннее двух месяцев', () => {
    const result = commitsOverTime([
      commit('2026-01-05T10:00:00Z', 'a'), // понедельник
      commit('2026-01-07T10:00:00Z', 'a'),
      commit('2026-04-01T10:00:00Z', 'a'),
    ]);

    expect(result.unit).toBe('week');
    expect(result.buckets[0]).toMatchObject({ key: '2026-01-05', value: 2 });
    expect(result.buckets.reduce((sum, b) => sum + b.value, 0)).toBe(3);
  });

  it('переходит на месяцы для истории длиннее двух лет', () => {
    const result = commitsOverTime([
      commit('2023-03-15T10:00:00Z', 'a'),
      commit('2026-03-20T10:00:00Z', 'a'),
    ]);

    expect(result.unit).toBe('month');
    expect(result.buckets[0]).toMatchObject({ key: '2023-03-01', label: 'мар 2023', value: 1 });
    expect(result.buckets.at(-1)).toMatchObject({ key: '2026-03-01', value: 1 });
  });

  it('возвращает пустой список без коммитов', () => {
    expect(commitsOverTime([])).toEqual({ unit: 'day', buckets: [] });
  });
});

describe('commitsByAuthor', () => {
  it('сортирует авторов по числу коммитов', () => {
    const result = commitsByAuthor([
      commit('2026-11-01T10:00:00Z', 'b'),
      commit('2026-11-01T10:00:00Z', 'a'),
      commit('2026-11-02T10:00:00Z', 'a'),
    ]);

    expect(result.map((r) => [r.label, r.value])).toEqual([
      ['a', 2],
      ['b', 1],
    ]);
  });

  it('объединяет хвост в «Остальные»', () => {
    const list = ['a', 'a', 'b', 'c', 'd'].map((login) => commit('2026-11-01T10:00:00Z', login));
    const result = commitsByAuthor(list, 3);

    expect(result.map((r) => [r.label, r.value])).toEqual([
      ['a', 2],
      ['b', 1],
      ['Остальные', 2],
    ]);
  });
});

describe('summarize', () => {
  it('считает коммиты, авторов и период', () => {
    const result = summarize([
      commit('2026-11-03T10:00:00Z', 'a'),
      commit('2026-11-01T10:00:00Z', 'b'),
    ]);

    expect(result.total).toBe(2);
    expect(result.authors).toBe(2);
    expect(result.first.toISOString()).toBe('2026-11-01T10:00:00.000Z');
    expect(result.last.toISOString()).toBe('2026-11-03T10:00:00.000Z');
  });

  it('работает с пустым списком', () => {
    expect(summarize([])).toEqual({ total: 0, authors: 0, first: null, last: null });
  });
});
