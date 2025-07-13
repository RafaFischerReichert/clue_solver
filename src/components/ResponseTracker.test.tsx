import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResponseTracker from './ResponseTracker';

describe('ResponseTracker', () => {
  it('renders without crashing', () => {
    render(<ResponseTracker />);
    expect(screen.getByText('Response Tracker')).toBeInTheDocument();
  });

  // TODO: Add more tests
}); 