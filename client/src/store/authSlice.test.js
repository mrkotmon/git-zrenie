import { describe, it, expect } from 'vitest';
import reducer, {
  setUser,
  clearError,
  setInitialized,
  fetchCurrentUser,
  logoutUser,
} from './authSlice.js';

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false,
};

const demoUser = {
  id: 1,
  github_id: 12345678,
  login: 'demo-user',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345678?v=4',
  created_at: '2026-09-11T10:00:00Z',
};

describe('authSlice reducers', () => {
  it('setUser сохраняет пользователя и ставит флаг авторизации', () => {
    const state = reducer(initialState, setUser(demoUser));
    expect(state.user).toEqual(demoUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBe(null);
    expect(state.initialized).toBe(true);
  });

  it('clearError очищает ошибку', () => {
    const stateWithError = { ...initialState, error: 'ошибка сети' };
    const state = reducer(stateWithError, clearError());
    expect(state.error).toBe(null);
  });

  it('setInitialized ставит флаг initialized', () => {
    const state = reducer(initialState, setInitialized());
    expect(state.initialized).toBe(true);
  });
});

describe('authSlice extraReducers: fetchCurrentUser', () => {
  it('pending ставит loading: true', () => {
    const state = reducer(initialState, fetchCurrentUser.pending('requestId'));
    expect(state.loading).toBe(true);
  });

  it('fulfilled сохраняет пользователя и сбрасывает loading', () => {
    const state = reducer(
      { ...initialState, loading: true },
      fetchCurrentUser.fulfilled(demoUser, 'requestId'),
    );
    expect(state.loading).toBe(false);
    expect(state.user).toEqual(demoUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.initialized).toBe(true);
    expect(state.error).toBe(null);
  });

  it('rejected сбрасывает loading и isAuthenticated', () => {
    const state = reducer(
      { ...initialState, loading: true },
      fetchCurrentUser.rejected(new Error('no session'), 'requestId'),
    );
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.initialized).toBe(true);
    expect(state.user).toBe(null);
  });

  it('rejected не разлогинивает, если пользователь уже вошёл, пока шёл запрос', () => {
    const state = reducer(
      { ...initialState, loading: true, user: demoUser, isAuthenticated: true, initialized: true },
      fetchCurrentUser.rejected(new Error('no session'), 'requestId'),
    );
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(demoUser);
    expect(state.loading).toBe(false);
  });
});

describe('authSlice extraReducers: logoutUser', () => {
  it('fulfilled очищает пользователя и сбрасывает флаги', () => {
    const state = reducer(
      { ...initialState, user: demoUser, isAuthenticated: true },
      logoutUser.fulfilled(null, 'requestId'),
    );
    expect(state.user).toBe(null);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe(null);
    expect(state.initialized).toBe(true);
  });
});
