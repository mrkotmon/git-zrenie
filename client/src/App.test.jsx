import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import App from './App.jsx';
import { createStore } from './store/store.js';
import { theme } from './theme/theme.js';

describe('App', () => {
  it('рендерит лендинг на главном маршруте', () => {
    render(
      <Provider store={createStore()}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/']}>
            <App />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Каждый коммит');
  });
});
