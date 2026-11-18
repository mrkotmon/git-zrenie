import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import App from './App.jsx';
import { createStore } from './store/store.js';
import { theme } from './theme/theme.js';
import { demoUser } from './test/renderWithStore.jsx';

function renderApp(url = '/') {
  render(
    <Provider store={createStore()}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[url]}>
          <App />
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
}

function answerMe(status, body) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status === 200,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('App', () => {
  it('рендерит лендинг на главном маршруте', () => {
    answerMe(401, {});
    renderApp();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Каждый коммит');
  });

  it('при запуске спрашивает сервер о сессии и показывает вошедшего пользователя', async () => {
    const fetchMock = answerMe(200, demoUser);
    renderApp();

    expect(
      await screen.findByRole('button', { name: 'Меню пользователя @ada' }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/me', expect.any(Object));
    expect(screen.getByRole('link', { name: 'Мои разборы' })).toHaveAttribute('href', '/runs');
  });

  it('без входа «Мои разборы» отправляют на страницу входа', async () => {
    answerMe(401, {});
    renderApp('/runs');

    expect(await screen.findByRole('heading', { name: 'Вход в Git Зрение' })).toBeInTheDocument();
  });

  it('после входа открывает «Мои разборы»', async () => {
    answerMe(200, demoUser);
    renderApp('/runs');

    expect(await screen.findByRole('heading', { name: 'Мои разборы' })).toBeInTheDocument();
  });
});
