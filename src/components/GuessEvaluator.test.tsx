import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GuessEvaluator from './GuessEvaluator';
import { Guess, GameState, OptimalGuessResult } from './GuessEvaluator';
import { CardKnowledge } from './GameLogic';

describe('GuessEvaluator', () => {
  it('renders without crashing', () => {
    render(<GuessEvaluator />); // No props required for now
    expect(screen.getByText('Guess Evaluator')).toBeInTheDocument();
  });

  // LOGIC TEST SKELETON
  it('findOptimalGuess returns a guess in the correct format (skeleton)', () => {
    // Mock implementation of findOptimalGuess
    const mockFindOptimalGuess: (accessibleRooms: string[], gameState: GameState) => OptimalGuessResult = (accessibleRooms, gameState) => ({
      guess: { room: accessibleRooms[0], suspect: 'Plum', weapon: 'Rope' },
      entropyGain: 1.0,
      tieBroken: false,
    });
    // Example input
    const accessibleRooms = ['Kitchen'];
    const minimalCardKnowledge: CardKnowledge = {} as CardKnowledge; // Replace with a valid minimal object if needed
    const gameState: GameState = { knowledge: minimalCardKnowledge, previousGuesses: [] };
    const result = mockFindOptimalGuess(accessibleRooms, gameState);
    expect(result).toHaveProperty('guess');
    expect(result).toHaveProperty('entropyGain');
    expect(result).toHaveProperty('tieBroken');
  });
}); 