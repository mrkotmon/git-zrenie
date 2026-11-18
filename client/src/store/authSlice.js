import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Получает текущего авторизованного пользователя с сервера.
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      return rejectWithValue(await response.text());
    }

    return response.json();
  },
);

/**
 * Завершает сессию на сервере.
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return rejectWithValue(await response.text());
    }

    return null;
  },
);

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false,
  logoutRequested: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.initialized = true;
      state.logoutRequested = false;
    },

    requestLogout(state) {
      state.logoutRequested = true;
    },

    clearError(state) {
      state.error = null;
    },

    setInitialized(state) {
      state.initialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.initialized = true;

        // Не сбрасываем пользователя, если ответ об отсутствии сессии устарел.
        if (!state.user) {
          state.isAuthenticated = false;
        }
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.initialized = true;
        state.logoutRequested = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload || 'Не удалось завершить сессию';
        state.logoutRequested = false;
      });
  },
});

export const {
  setUser,
  requestLogout,
  clearError,
  setInitialized,
} = authSlice.actions;

export default authSlice.reducer;