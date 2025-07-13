import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders the title', () => {
    render(<App />);
    expect(screen.getByText('Cluedo Solver')).toBeInTheDocument();
  });

  it('starts with the game setup', () => {
    render(<App />);
    expect(screen.getByText('Game Setup')).toBeInTheDocument();
  });
}); 