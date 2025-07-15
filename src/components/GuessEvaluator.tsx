import React from 'react';
import { CardKnowledge } from './GameLogic';

// Represents a single guess (room, suspect, weapon)
export interface Guess {
  room: string;
  suspect: string;
  weapon: string;
}

// Updated GameState
export interface GameState {
  knowledge: CardKnowledge;
  previousGuesses: Guess[];
  // ...add more as needed
}

// Result of the optimal guess evaluation
export interface OptimalGuessResult {
  guess: Guess;
  entropyGain: number;
  tieBroken: boolean;
  tieBreakerReason?: string;
}

// Logic interface (not for React props)
export interface GuessEvaluator {
  findOptimalGuess(
    accessibleRooms: string[],
    gameState: GameState
  ): OptimalGuessResult;
}

// React component props interface
interface GuessEvaluatorProps {
  // Add any props you want the component to accept, or leave empty for now
}

const GuessEvaluator: React.FC<GuessEvaluatorProps> = (props) => {
  return (
    <div>
      <h2>Guess Evaluator</h2>
      {/* TODO: Implement guess evaluator */}
    </div>
  );
};

export default GuessEvaluator; 