import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * Получает текущего авторизованного пользователя из БД через бэкенд.
 * Бэкенд сверяет сессионную куку с таблицей `users` (github_id, login, avatar_url).
 */
export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const res = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    });
    if (!res.ok) {
      return rejectWithValue(await res.text());
    }
    return res.json();
  }
);

/**
 * Выход пользователя — бэкенд уничтожает сессию и чистит запись о сессии.
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    const res = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      return rejectWithValue(await res.text());
    }
    return null;
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  initialized: false,
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
        state.isAuthenticated = false;
        state.initialized = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.initialized = true;
      });
  },
});

export const { setUser, clearError, setInitialized } = authSlice.actions;
export default authSlice.reducer;
