import { configureStore } from '@reduxjs/toolkit';
import landingReducer from './landingSlice.js';

export function createStore(preloadedState) {
  return configureStore({
    reducer: { landing: landingReducer },
    preloadedState,
  });
}

export const store = createStore();
