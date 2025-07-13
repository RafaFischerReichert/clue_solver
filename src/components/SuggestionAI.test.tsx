import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuggestionAI from './SuggestionAI';

describe('SuggestionAI', () => {
  it('renders without crashing', () => {
    render(<SuggestionAI />);
    expect(screen.getByText('Suggestion AI')).toBeInTheDocument();
  });

  // TODO: Add more tests
}); 