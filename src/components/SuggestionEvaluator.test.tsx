import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuggestionEvaluator from './SuggestionEvaluator';

describe('SuggestionEvaluator', () => {
  it('renders without crashing', () => {
    render(<SuggestionEvaluator />);
    expect(screen.getByText('Suggestion Evaluator')).toBeInTheDocument();
  });

  // TODO: Add more tests
}); 