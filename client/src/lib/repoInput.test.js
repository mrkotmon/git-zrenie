import { describe, expect, it } from 'vitest';
import { parseRepoInput, repoPath } from './repoInput.js';

describe('parseRepoInput', () => {
  it.each([
    ['facebook/react', { owner: 'facebook', name: 'react' }],
    ['github.com/vitejs/vite/', { owner: 'vitejs', name: 'vite' }],
    ['https://www.github.com/mrkotmon/git-zrenie.git', { owner: 'mrkotmon', name: 'git-zrenie' }],
    ['  acme/payments.service  ', { owner: 'acme', name: 'payments.service' }],
  ])('понимает %s', (input, expected) => {
    expect(parseRepoInput(input)).toEqual(expected);
  });

  it.each(['', 'react', 'gitlab.com/a/b', 'a/b/c', 'acme/..', 'acme/имя', undefined])(
    'отклоняет %s',
    (input) => {
      expect(parseRepoInput(input)).toBeNull();
    },
  );
});

describe('repoPath', () => {
  it('строит адрес страницы репозитория', () => {
    expect(repoPath({ owner: 'acme', name: 'app' })).toBe('/repo/acme/app');
  });
});
