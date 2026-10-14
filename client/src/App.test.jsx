import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

describe('App', () => {
  it('показывает название и число коммитов', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Git Зрение' })).toBeInTheDocument();
    expect(screen.getByTestId('commit-count')).toHaveTextContent('Коммитов в демо: 3');
  });
});
