import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import Cta from './Cta.jsx';
import { createStore } from '../../../store/store.js';
import { theme } from '../../../theme/theme.js';

describe('Cta', () => {
  it('передаёт нормализованную ссылку в редирект на вход', () => {
    const redirect = vi.fn();
    render(
      <Provider store={createStore()}>
        <ThemeProvider theme={theme}>
          <Cta redirect={redirect} />
        </ThemeProvider>
      </Provider>,
    );

    fireEvent.change(screen.getByLabelText('Ссылка на репозиторий GitHub'), {
      target: { value: 'github.com/acme/payments-service/' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Разобрать' }));

    expect(redirect).toHaveBeenCalledWith(
      '/api/auth/github?repo=https%3A%2F%2Fgithub.com%2Facme%2Fpayments-service',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
