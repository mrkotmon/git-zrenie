import { configureStore } from '@reduxjs/toolkit';
import landingReducer from './landingSlice.js';
import authReducer from './authSlice.js';
import repoReducer from './repoSlice.js';

export function createStore(preloadedState) {
  return configureStore({
    reducer: {
      landing: landingReducer,
      auth: authReducer,
      repo: repoReducer,
    },
    preloadedState,
  });
}

export const store = createStore();
