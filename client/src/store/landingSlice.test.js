import { describe, it, expect } from 'vitest';
import reducer, {
  REPO_ERROR,
  authUrlFor,
  normalizeRepoUrl,
  repoSubmitted,
  repoUrlChanged,
} from './landingSlice.js';

const empty = { repoUrl: '', error: null, submittedUrl: null };

describe('normalizeRepoUrl', () => {
  it('добавляет протокол и убирает лишний слэш', () => {
    expect(normalizeRepoUrl('github.com/acme/payments-service/')).toBe(
      'https://github.com/acme/payments-service',
    );
    expect(normalizeRepoUrl(' https://www.github.com/acme/payments.service ')).toBe(
      'https://github.com/acme/payments.service',
    );
  });

  it('отклоняет чужие ссылки и пустой ввод', () => {
    expect(normalizeRepoUrl('gitlab.com/acme/repo')).toBeNull();
    expect(normalizeRepoUrl('github.com/acme')).toBeNull();
    expect(normalizeRepoUrl('')).toBeNull();
    expect(normalizeRepoUrl(undefined)).toBeNull();
  });
});

describe('authUrlFor', () => {
  it('кодирует ссылку на репозиторий', () => {
    expect(authUrlFor('https://github.com/acme/repo')).toBe(
      '/api/auth/github?repo=https%3A%2F%2Fgithub.com%2Facme%2Frepo',
    );
  });
});

describe('landing reducer', () => {
  it('сохраняет ввод и сбрасывает ошибку', () => {
    expect(reducer({ ...empty, error: REPO_ERROR }, repoUrlChanged('github.com/a/b'))).toEqual({
      repoUrl: 'github.com/a/b',
      error: null,
      submittedUrl: null,
    });
  });

  it('нормализует корректную ссылку при отправке', () => {
    expect(reducer({ ...empty, repoUrl: 'github.com/a/b' }, repoSubmitted())).toEqual({
      repoUrl: 'github.com/a/b',
      error: null,
      submittedUrl: 'https://github.com/a/b',
    });
  });

  it('ставит ошибку для некорректной ссылки', () => {
    expect(reducer({ ...empty, repoUrl: 'wrong' }, repoSubmitted())).toEqual({
      repoUrl: 'wrong',
      error: REPO_ERROR,
      submittedUrl: null,
    });
  });
});
