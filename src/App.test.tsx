import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the Worker
const mockWorker = {
  postMessage: vi.fn(),
  onmessage: null,
  terminate: vi.fn(),
};

// Mock the Worker constructor
global.Worker = vi.fn(() => mockWorker as any);

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title', () => {
    render(<App />);
    expect(screen.getByText('Cluedo Solver')).toBeInTheDocument();
  });

  it('starts with the game setup', () => {
    render(<App />);
    expect(screen.getByText('Game Setup')).toBeInTheDocument();
  });
}); 