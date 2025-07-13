import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import OptimalSuggestion from './OptimalSuggestion';

describe('OptimalSuggestion', () => {
  it('renders without crashing', () => {
    render(<OptimalSuggestion />);
    expect(screen.getByText('Optimal Suggestion')).toBeInTheDocument();
  });

  // TODO: Add more tests
}); 