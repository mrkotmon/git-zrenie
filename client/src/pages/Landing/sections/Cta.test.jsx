import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Cta from './Cta.jsx';
import { createStore } from '../../../store/store.js';
import { theme } from '../../../theme/theme.js';

function CurrentPath() {
  return <p data-testid="path">{useLocation().pathname}</p>;
}

function renderCta() {
  render(
    <Provider store={createStore()}>
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<Cta />} />
            <Route path="*" element={<CurrentPath />} />
          </Routes>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
  );
}

describe('Cta', () => {
  it.each([
    ['github.com/acme/payments-service/', '/repo/acme/payments-service'],
    ['https://github.com/acme/app.git', '/repo/acme/app'],
  ])('открывает страницу репозитория по ссылке %s', (link, path) => {
    renderCta();

    fireEvent.change(screen.getByLabelText('Ссылка на репозиторий GitHub'), {
      target: { value: link },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Разобрать' }));

    expect(screen.getByTestId('path')).toHaveTextContent(path);
  });

  it('остаётся на месте и показывает ошибку для неверной ссылки', () => {
    renderCta();

    fireEvent.change(screen.getByLabelText('Ссылка на репозиторий GitHub'), {
      target: { value: 'gitlab.com/acme/app' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Разобрать' }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('path')).not.toBeInTheDocument();
  });
});
