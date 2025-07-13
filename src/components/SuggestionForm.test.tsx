import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SuggestionForm from './SuggestionForm';

describe('SuggestionForm', () => {
  it('renders without crashing', () => {
    render(<SuggestionForm />);
    expect(screen.getByText('Suggestion Form')).toBeInTheDocument();
  });

  // TODO: Add more tests
}); 