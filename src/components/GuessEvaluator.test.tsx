import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GuessEvaluator from './GuessEvaluator';
import { Guess, GameState, OptimalGuessResult } from './GuessEvaluator';
import { CardKnowledge } from './GameLogic';

describe('GuessEvaluator', () => {
  it('renders without crashing', () => {
    // Minimal valid props
    const accessibleRooms = ['Kitchen'];
    const suspects = ['Plum'];
    const weapons = ['Rope'];
    const minimalCardKnowledge: CardKnowledge = {} as CardKnowledge;
    const playerOrder = ['Alice', 'Bob', 'Charlie'];
    const gameState: GameState = { knowledge: minimalCardKnowledge, previousGuesses: [], playerOrder };
    render(
      <GuessEvaluator
        accessibleRooms={accessibleRooms}
        suspects={suspects}
        weapons={weapons}
        gameState={gameState}
        playerOrder={playerOrder}
      />
    );
    expect(screen.getByText('Guess Evaluator')).toBeInTheDocument();
    // Check player order is rendered
    expect(screen.getByTestId('player-order')).toHaveTextContent('Player Order: Alice, Bob, Charlie');
  });

  // Logic test (to be determined)
}); 