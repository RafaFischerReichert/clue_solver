import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GuessForm from './GuessForm';

describe('GuessForm', () => {
  const mockProps = {
    suspects: ['Miss Scarlett', 'Colonel Mustard', 'Dr. Orchid'],
    weapons: ['Candlestick', 'Dagger', 'Lead Pipe'],
    rooms: ['Kitchen', 'Ballroom', 'Conservatory'],
    selectedSuspect: '',
    selectedWeapon: '',
    selectedRoom: '',
    guessedBy: '',
    showedBy: null,
    shownCard: '',
    answeringPlayers: ['Alice', 'Bob', 'Charlie'],
    allPlayers: ['Alice', 'Bob', 'Charlie'], // <-- add this
    currentUser: 'Alice',
    onGuessChange: () => {},
    onGuessedByChange: () => {},
    onShowedByChange: () => {},
    onShownCardChange: () => {},
    onGuessSubmit: () => {},
    onResetForm: () => {},
    onAbort: () => {},
  };

  it('renders without crashing', () => {
    render(<GuessForm {...mockProps} />);
    expect(screen.getByText('Guess Form')).toBeInTheDocument();
  });

  it('allows suspect input', () => {
    // Expects: Users should be able to select a suspect from the dropdown
    const mockOnGuessChange = vi.fn();
    const propsWithCallback = {
      ...mockProps,
      onGuessChange: mockOnGuessChange,
    };
    
    render(<GuessForm {...propsWithCallback} />);
    
    const suspectSelect = screen.getByLabelText('Suspect:');
    expect(suspectSelect).toBeInTheDocument();
    
    // Should have all suspect options
    mockProps.suspects.forEach(suspect => {
      expect(screen.getByText(suspect)).toBeInTheDocument();
    });
    
    // Should call onGuessChange when selection changes
    fireEvent.change(suspectSelect, { target: { value: 'Miss Scarlett' } });
    expect(mockOnGuessChange).toHaveBeenCalledWith('Miss Scarlett', '', '');
  });

  it('allows weapon input', () => {
    // Expects: Users should be able to select a weapon from the dropdown
    const mockOnGuessChange = vi.fn();
    const propsWithCallback = {
      ...mockProps,
      onGuessChange: mockOnGuessChange,
    };
    
    render(<GuessForm {...propsWithCallback} />);
    
    const weaponSelect = screen.getByLabelText('Weapon:');
    expect(weaponSelect).toBeInTheDocument();
    
    // Should have all weapon options
    mockProps.weapons.forEach(weapon => {
      expect(screen.getByText(weapon)).toBeInTheDocument();
    });
    
    // Should call onGuessChange when selection changes
    fireEvent.change(weaponSelect, { target: { value: 'Candlestick' } });
    expect(mockOnGuessChange).toHaveBeenCalledWith('', 'Candlestick', '');
  });

  it('allows room input', () => {
    // Expects: Users should be able to select a room from the dropdown
    const mockOnGuessChange = vi.fn();
    const propsWithCallback = {
      ...mockProps,
      onGuessChange: mockOnGuessChange,
    };
    
    render(<GuessForm {...propsWithCallback} />);
    
    const roomSelect = screen.getByLabelText('Room:');
    expect(roomSelect).toBeInTheDocument();
    
    // Should have all room options
    mockProps.rooms.forEach(room => {
      expect(screen.getByText(room)).toBeInTheDocument();
    });
    
    // Should call onGuessChange when selection changes
    fireEvent.change(roomSelect, { target: { value: 'Kitchen' } });
    expect(mockOnGuessChange).toHaveBeenCalledWith('', '', 'Kitchen');
  });

  it('submits the guess', () => {
    // Expects: Form submission should call onGuessSubmit with correct data
    const mockOnGuessSubmit = vi.fn();
    const propsWithSubmit = {
      ...mockProps,
      selectedSuspect: 'Miss Scarlett',
      selectedWeapon: 'Candlestick',
      selectedRoom: 'Kitchen',
      guessedBy: 'Alice',
      onGuessSubmit: mockOnGuessSubmit,
    };
    
    render(<GuessForm {...propsWithSubmit} />);
    
    const submitButton = screen.getByText('Submit Guess');
    expect(submitButton).not.toBeDisabled();
    
    fireEvent.click(submitButton);
    
    expect(mockOnGuessSubmit).toHaveBeenCalledWith({
      suspect: 'Miss Scarlett',
      weapon: 'Candlestick',
      room: 'Kitchen',
      guessedBy: 'Alice',
      showedBy: null,
      shownCard: undefined,
      answeringPlayers: ['Alice', 'Bob', 'Charlie'], // All players including guesser
    });
  });

  it('displays error on invalid input', () => {
    // Expects: Component should handle invalid input gracefully
    const invalidProps = {
      ...mockProps,
      suspects: [], // Empty array should not crash
      weapons: null as any, // Invalid type should not crash
      rooms: undefined as any, // Undefined should not crash
    };
    
    render(<GuessForm {...invalidProps} />);
    
    // Should still render without crashing
    expect(screen.getByText('Guess Form')).toBeInTheDocument();
    
    // Should show appropriate error or empty state
    expect(screen.getByText('Select a suspect')).toBeInTheDocument();
  });

  it('submits form successfully when all required fields are filled', () => {
    // Expects: Form should submit successfully when all required fields are valid
    const mockOnGuessSubmit = vi.fn();
    const mockOnShownCardChange = vi.fn();
    const propsWithSubmit = {
      ...mockProps,
      selectedSuspect: 'Miss Scarlett',
      selectedWeapon: 'Candlestick',
      selectedRoom: 'Kitchen',
      guessedBy: 'Alice',
      showedBy: 'Bob',
      shownCard: 'Miss Scarlett', // Provide the shown card to make form valid
      onGuessSubmit: mockOnGuessSubmit,
      onShownCardChange: mockOnShownCardChange,
    };
    
    render(<GuessForm {...propsWithSubmit} />);
    
    // Submit form
    const submitButton = screen.getByText('Submit Guess');
    fireEvent.click(submitButton);
    
    // Verify submission was called with correct data
    expect(mockOnGuessSubmit).toHaveBeenCalledWith({
      suspect: 'Miss Scarlett',
      weapon: 'Candlestick',
      room: 'Kitchen',
      guessedBy: 'Alice',
      showedBy: 'Bob',
      shownCard: 'Miss Scarlett',
      answeringPlayers: ['Alice', 'Bob', 'Charlie'], // All players including guesser
    });
  });

  it('resets form after successful submission', () => {
    // Expects: Form should reset internal state and call parent reset callback after submission
    const mockOnGuessSubmit = vi.fn();
    const mockOnResetForm = vi.fn();
    const propsWithSubmit = {
      ...mockProps,
      selectedSuspect: 'Miss Scarlett',
      selectedWeapon: 'Candlestick',
      selectedRoom: 'Kitchen',
      guessedBy: 'Alice',
      onGuessSubmit: mockOnGuessSubmit,
      onResetForm: mockOnResetForm,
    };
    
    render(<GuessForm {...propsWithSubmit} />);
    
    // Submit form
    const submitButton = screen.getByText('Submit Guess');
    fireEvent.click(submitButton);
    
    // Verify submission was called
    expect(mockOnGuessSubmit).toHaveBeenCalled();
    
    // Verify reset callback was called
    expect(mockOnResetForm).toHaveBeenCalled();
  });

  it('disables submit button when inputs are invalid', () => {
    // Expects: Submit button should be disabled when required fields are empty
    render(<GuessForm {...mockProps} />);
    
    const submitButton = screen.getByText('Submit Guess');
    expect(submitButton).toBeDisabled();
    
    // Fill in some but not all required fields
    const suspectSelect = screen.getByLabelText('Suspect:');
    fireEvent.change(suspectSelect, { target: { value: 'Miss Scarlett' } });
    
    // Button should still be disabled
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state during submission', () => {
    // Expects: Component should show loading state during form submission
    // Note: This would require adding loading state to the component
    // For now, we'll test that the component handles submission correctly
    
    const mockOnGuessSubmit = vi.fn();
    const propsWithSubmit = {
      ...mockProps,
      selectedSuspect: 'Miss Scarlett',
      selectedWeapon: 'Candlestick',
      selectedRoom: 'Kitchen',
      guessedBy: 'Alice',
      onGuessSubmit: mockOnGuessSubmit,
    };
    
    render(<GuessForm {...propsWithSubmit} />);
    
    const submitButton = screen.getByText('Submit Guess');
    fireEvent.click(submitButton);
    
    // Should call submit callback
    expect(mockOnGuessSubmit).toHaveBeenCalled();
    
    // TODO: Add loading state to component and test for loading indicator
    // expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('handles API errors gracefully', () => {
    // Expects: Component should handle errors gracefully without crashing
    const mockOnGuessSubmit = vi.fn().mockImplementation(() => {
      throw new Error('API Error');
    });
    
    const propsWithError = {
      ...mockProps,
      selectedSuspect: 'Miss Scarlett',
      selectedWeapon: 'Candlestick',
      selectedRoom: 'Kitchen',
      guessedBy: 'Alice',
      onGuessSubmit: mockOnGuessSubmit,
    };
    
    render(<GuessForm {...propsWithError} />);
    
    const submitButton = screen.getByText('Submit Guess');
    
    // Should not crash when submit throws error
    expect(() => {
      fireEvent.click(submitButton);
    }).not.toThrow();
    
    // Component should still be rendered
    expect(screen.getByText('Guess Form')).toBeInTheDocument();
  });

  it('does not submit if button is disabled', () => {
    // Expects: Form should not submit when submit button is disabled
    const mockOnGuessSubmit = vi.fn();
    const propsWithSubmit = {
      ...mockProps,
      onGuessSubmit: mockOnGuessSubmit,
    };
    
    render(<GuessForm {...propsWithSubmit} />);
    
    const submitButton = screen.getByText('Submit Guess');
    expect(submitButton).toBeDisabled();
    
    // Try to submit
    fireEvent.click(submitButton);
    
    // Should not call submit callback
    expect(mockOnGuessSubmit).not.toHaveBeenCalled();
  });

  it('does not allow guesser and shower to be the same player', () => {
    // Expects: When the same player is selected for both guesser and shower, 
    // the form should show an error or prevent submission
    const propsWithSamePlayer = {
      ...mockProps,
      guessedBy: 'Alice',
      showedBy: 'Alice',
    };
    
    render(<GuessForm {...propsWithSamePlayer} />);
    
    // The form should show an error message
    expect(screen.getByText('Error: Guesser and shower cannot be the same player')).toBeInTheDocument();
    
    // The submit button should be disabled
    const submitButton = screen.getByText('Submit Guess');
    expect(submitButton).toBeDisabled();
  });

  it('allows shown card dropdown if the shower or guesser are the user', () => {
    // Expects: When the current user is either the guesser or the shower,
    // the shown card dropdown should be visible
    const propsWithUserAsGuesser = {
      ...mockProps,
      guessedBy: 'Alice', // currentUser
      showedBy: 'Bob',
    };
    
    const { rerender } = render(<GuessForm {...propsWithUserAsGuesser} />);
    
    // When user is the guesser and someone showed a card, shown card dropdown should be visible
    expect(screen.getByLabelText('Shown card:')).toBeInTheDocument();
    
    // When user is the shower
    const propsWithUserAsShower = {
      ...mockProps,
      guessedBy: 'Bob',
      showedBy: 'Alice', // currentUser
    };
    
    rerender(<GuessForm {...propsWithUserAsShower} />);
    
    // When user is the shower, shown card dropdown should be visible
    expect(screen.getByLabelText('Shown card:')).toBeInTheDocument();
  });

  it('requires shown card to be selected when the user is the guesser', () => {
    // Expects: When the current user is the guesser, they must select which card was shown
    const propsWithUserAsGuesser = {
      ...mockProps,
      guessedBy: 'Alice', // currentUser
      showedBy: 'Bob',
    };
    
    render(<GuessForm {...propsWithUserAsGuesser} />);
    
    // The form should show an error message requiring shown card selection
    expect(screen.getByText('You must select which card was shown')).toBeInTheDocument();
    
    // The submit button should be disabled
    const submitButton = screen.getByText('Submit Guess');
    expect(submitButton).toBeDisabled();
  });

  it('allows selecting any player for guessed by dropdown', () => {
    // Expects: Users should be able to select any player from the guessed by dropdown
    const mockOnGuessedByChange = vi.fn();
    const propsWithCallback = {
      ...mockProps,
      onGuessedByChange: mockOnGuessedByChange,
    };
    
    render(<GuessForm {...propsWithCallback} />);
    
    const guessedBySelect = screen.getByLabelText('Guessed by:');
    expect(guessedBySelect).toBeInTheDocument();
    
    // Should have all player options in the guessed by dropdown
    const guessedByOptions = guessedBySelect.querySelectorAll('option');
    expect(guessedByOptions.length).toBe(4); // Empty option + 3 players
    
    // Should call onGuessedByChange when selection changes
    fireEvent.change(guessedBySelect, { target: { value: 'Bob' } });
    expect(mockOnGuessedByChange).toHaveBeenCalledWith('Bob');
    
    // Should call onGuessedByChange with different player
    fireEvent.change(guessedBySelect, { target: { value: 'Charlie' } });
    expect(mockOnGuessedByChange).toHaveBeenCalledWith('Charlie');
  });

  it('allows selecting any player for showed by dropdown', () => {
    // Expects: Users should be able to select any player from the showed by dropdown
    const mockOnShowedByChange = vi.fn();
    const propsWithCallback = {
      ...mockProps,
      onShowedByChange: mockOnShowedByChange,
    };
    
    render(<GuessForm {...propsWithCallback} />);
    
    const showedBySelect = screen.getByLabelText('Showed by:');
    expect(showedBySelect).toBeInTheDocument();
    
    // Should have all player options in the showed by dropdown
    const showedByOptions = showedBySelect.querySelectorAll('option');
    expect(showedByOptions.length).toBe(4); // Empty option + 3 players
    
    // Should call onShowedByChange when selection changes
    fireEvent.change(showedBySelect, { target: { value: 'Alice' } });
    expect(mockOnShowedByChange).toHaveBeenCalledWith('Alice');
    
    // Should call onShowedByChange with different player
    fireEvent.change(showedBySelect, { target: { value: 'Bob' } });
    expect(mockOnShowedByChange).toHaveBeenCalledWith('Bob');
    
    // Should call onShowedByChange with null when "No one showed a card" is selected
    fireEvent.change(showedBySelect, { target: { value: '' } });
    expect(mockOnShowedByChange).toHaveBeenCalledWith(null);
  });

  it('displays selected values in dropdowns', () => {
    // Expects: Dropdowns should display the currently selected values
    const propsWithSelections = {
      ...mockProps,
      guessedBy: 'Bob',
      showedBy: 'Charlie',
    };
    
    render(<GuessForm {...propsWithSelections} />);
    
    const guessedBySelect = screen.getByLabelText('Guessed by:') as HTMLSelectElement;
    const showedBySelect = screen.getByLabelText('Showed by:') as HTMLSelectElement;
    
    // Should display the selected values
    expect(guessedBySelect.value).toBe('Bob');
    expect(showedBySelect.value).toBe('Charlie');
  });

  it('handles empty showed by selection correctly', () => {
    // Expects: When no one showed a card, the dropdown should handle it correctly
    const mockOnShowedByChange = vi.fn();
    const propsWithCallback = {
      ...mockProps,
      onShowedByChange: mockOnShowedByChange,
    };
    
    render(<GuessForm {...propsWithCallback} />);
    
    const showedBySelect = screen.getByLabelText('Showed by:');
    
    // Should have "No one showed a card" option
    expect(screen.getByText('No one showed a card')).toBeInTheDocument();
    
    // Should call onShowedByChange with null when empty option is selected
    fireEvent.change(showedBySelect, { target: { value: '' } });
    expect(mockOnShowedByChange).toHaveBeenCalledWith(null);
  });

  it('allows selecting shown card when user is involved', () => {
    // Expects: Users should be able to select which card was shown when they are involved
    const mockOnShownCardChange = vi.fn();
    const propsWithUserInvolved = {
      ...mockProps,
      selectedSuspect: 'Miss Scarlett',
      selectedWeapon: 'Candlestick', 
      selectedRoom: 'Kitchen',
      guessedBy: 'Alice', // currentUser
      showedBy: 'Bob',
      onShownCardChange: mockOnShownCardChange,
    };
    
    render(<GuessForm {...propsWithUserInvolved} />);
    
    // Should show the shown card dropdown when user is involved
    const shownCardSelect = screen.getByLabelText('Shown card:');
    expect(shownCardSelect).toBeInTheDocument();
    
    // Should have ONLY the three guessed cards as options in the shown card dropdown
    const shownCardOptions = screen.getAllByText('Miss Scarlett');
    expect(shownCardOptions.length).toBe(2); // One in suspect dropdown, one in shown card dropdown
    
    const candlestickOptions = screen.getAllByText('Candlestick');
    expect(candlestickOptions.length).toBe(2); // One in weapon dropdown, one in shown card dropdown
    
    const kitchenOptions = screen.getAllByText('Kitchen');
    expect(kitchenOptions.length).toBe(2); // One in room dropdown, one in shown card dropdown
    
    // Should NOT have other cards that weren't guessed in the shown card dropdown
    expect(screen.queryByText('Colonel Mustard')).toBeInTheDocument(); // This exists in suspect dropdown
    expect(screen.queryByText('Dagger')).toBeInTheDocument(); // This exists in weapon dropdown
    expect(screen.queryByText('Ballroom')).toBeInTheDocument(); // This exists in room dropdown
    
    // But the shown card dropdown should only have the three guessed cards
    const shownCardOptionElements = shownCardSelect.querySelectorAll('option');
    expect(shownCardOptionElements.length).toBe(4); // Empty option + 3 guessed cards
    
    // Should call onShownCardChange when selection changes
    fireEvent.change(shownCardSelect, { target: { value: 'Miss Scarlett' } });
    expect(mockOnShownCardChange).toHaveBeenCalledWith('Miss Scarlett');
    
    // Should call onShownCardChange with different card
    fireEvent.change(shownCardSelect, { target: { value: 'Candlestick' } });
    expect(mockOnShownCardChange).toHaveBeenCalledWith('Candlestick');
  });

  it('displays selected shown card value', () => {
    // Expects: The shown card dropdown should display the currently selected value
    const propsWithShownCard = {
      ...mockProps,
      selectedSuspect: 'Miss Scarlett',
      selectedWeapon: 'Candlestick',
      selectedRoom: 'Kitchen',
      guessedBy: 'Alice',
      showedBy: 'Bob',
      shownCard: 'Miss Scarlett',
    };
    
    render(<GuessForm {...propsWithShownCard} />);
    
    const shownCardSelect = screen.getByLabelText('Shown card:') as HTMLSelectElement;
    
    // Should display the selected value
    expect(shownCardSelect.value).toBe('Miss Scarlett');
  });
}); 