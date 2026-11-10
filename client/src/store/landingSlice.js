import { createSlice } from '@reduxjs/toolkit';

const GITHUB_REPO =
  /^(?:https?:\/\/)?(?:www\.)?github\.com\/([a-z\d](?:[a-z\d-]{0,38}))\/([\w.-]+?)\/?$/i;

export const REPO_ERROR = 'Введите ссылку на репозиторий GitHub';

/**
 * Приводит ссылку к виду https://github.com/owner/repo.
 * Возвращает null, если это не ссылка на репозиторий GitHub.
 * @param {string} value
 * @returns {string | null}
 */
export function normalizeRepoUrl(value) {
  const match = String(value ?? '')
    .trim()
    .match(GITHUB_REPO);
  return match ? `https://github.com/${match[1]}/${match[2]}` : null;
}

/**
 * Адрес входа через GitHub, куда уйдёт пользователь после выбора репозитория.
 * @param {string} repoUrl нормализованная ссылка на репозиторий
 */
export function authUrlFor(repoUrl) {
  return `/api/auth/github?repo=${encodeURIComponent(repoUrl)}`;
}

const initialState = {
  repoUrl: '',
  error: null,
  submittedUrl: null,
};

const landingSlice = createSlice({
  name: 'landing',
  initialState,
  reducers: {
    repoUrlChanged(state, action) {
      state.repoUrl = action.payload;
      state.error = null;
      state.submittedUrl = null;
    },
    repoSubmitted(state) {
      const normalized = normalizeRepoUrl(state.repoUrl);
      state.submittedUrl = normalized;
      state.error = normalized ? null : REPO_ERROR;
    },
  },
});

export const { repoUrlChanged, repoSubmitted } = landingSlice.actions;
export default landingSlice.reducer;
