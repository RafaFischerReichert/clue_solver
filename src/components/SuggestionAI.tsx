import React from 'react';
import { Guess, GameState } from './GuessEvaluator';

export interface SuggestionAI {
  evaluateGuess(
    guess: Guess,
    gameState: GameState
  ): number; // returns expected entropy gain
}

const SuggestionAI: React.FC<SuggestionAI> = (props) => {
  return (
    <div>
      <h2>Suggestion AI</h2>
      {/* TODO: Implement suggestion AI */}
    </div>
  );
};

export default SuggestionAI; 