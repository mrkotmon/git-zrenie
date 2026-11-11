import { configureStore } from '@reduxjs/toolkit';
import landingReducer from './landingSlice.js';
import authReducer from './authSlice.js';

export function createStore(preloadedState) {
  return configureStore({
    reducer: {
      landing: landingReducer,
      auth: authReducer,
    },
    preloadedState,
  });
}

export const store = createStore();
