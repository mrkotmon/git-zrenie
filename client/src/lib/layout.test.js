import { describe, it, expect } from 'vitest';
import { assignLanes, commitHeight, layoutCommits, project } from './layout.js';

describe('assignLanes', () => {
  it('ставит main первой, затем hotfix, release, develop и фичи по алфавиту', () => {
    const lanes = assignLanes([
      'feature/b',
      'develop',
      'release/1.x',
      'main',
      'feature/a',
      'hotfix/1',
    ]);
    expect([...lanes.keys()]).toEqual([
      'main',
      'hotfix/1',
      'release/1.x',
      'develop',
      'feature/a',
      'feature/b',
    ]);
  });

  it('убирает дубликаты и понимает master', () => {
    const lanes = assignLanes(['dev', 'master', 'dev']);
    expect(lanes.get('master')).toBe(0);
    expect(lanes.size).toBe(2);
  });
});

describe('commitHeight', () => {
  it('возвращает 0 для пустого коммита', () => {
    expect(commitHeight(0, 0)).toBe(0);
  });

  it('растёт логарифмически', () => {
    expect(commitHeight(9, 0)).toBe(1);
    expect(commitHeight(60, 39)).toBe(2);
  });

  it('игнорирует отрицательные значения', () => {
    expect(commitHeight(-5, 9)).toBe(1);
  });
});

describe('layoutCommits', () => {
  it('пустой список — пустой результат', () => {
    expect(layoutCommits([])).toEqual([]);
  });

  it('считает дни от первого коммита и дорожку ветки', () => {
    const result = layoutCommits([
      { sha: 'a1', branch: 'main', date: '2026-10-01T10:00:00Z', added: 9, removed: 0 },
      { sha: 'b2', branch: 'develop', date: '2026-10-03T10:00:00Z', added: 0, removed: 0 },
    ]);
    expect(result).toEqual([
      { sha: 'a1', x: 0, y: 1, z: 0 },
      { sha: 'b2', x: 2, y: 0, z: 1 },
    ]);
  });
});

describe('project', () => {
  it('без поворота и наклона оставляет X и поднимает Y вверх', () => {
    expect(project({ x: 3, y: 2, z: 5 }, 0, 0)).toEqual({ sx: 3, sy: -2, depth: 5 });
  });

  it('при наклоне 90° смотрит сверху: высота не влияет на экран', () => {
    const p = project({ x: 1, y: 7, z: 4 }, 0, Math.PI / 2);
    expect(p.sx).toBe(1);
    expect(p.sy).toBe(4);
  });
});
