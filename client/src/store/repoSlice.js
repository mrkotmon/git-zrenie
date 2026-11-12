import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getRepoCommits } from '../api/github.js';

export const loadCommits = createAsyncThunk(
  'repo/loadCommits',
  async ({ owner, name }, { signal, rejectWithValue }) => {
    try {
      return await getRepoCommits(owner, name, { signal });
    } catch (error) {
      if (error?.name === 'AbortError') throw error;
      return rejectWithValue({ code: error.code ?? 'unknown', message: error.message });
    }
  },
);

const initialState = {
  key: null,
  status: 'idle',
  commits: [],
  error: null,
  selectedSha: null,
};

const repoSlice = createSlice({
  name: 'repo',
  initialState,
  reducers: {
    commitSelected(state, action) {
      state.selectedSha = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCommits.pending, (state, action) => {
        const { owner, name } = action.meta.arg;
        state.key = `${owner}/${name}`;
        state.status = 'loading';
        state.commits = [];
        state.error = null;
        state.selectedSha = null;
      })
      .addCase(loadCommits.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.commits = action.payload;
      })
      .addCase(loadCommits.rejected, (state, action) => {
        // Запрос отменён при уходе со страницы — это не ошибка для пользователя.
        if (action.meta.aborted) return;
        state.status = 'failed';
        state.error = action.payload ?? { code: 'unknown', message: action.error.message };
      });
  },
});

export const { commitSelected } = repoSlice.actions;
export default repoSlice.reducer;

export const selectSelectedCommit = (state) =>
  state.repo.commits.find((commit) => commit.sha === state.repo.selectedSha) ?? null;
