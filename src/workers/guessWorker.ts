// src/workers/guessWorker.ts
import { evaluateGuess } from '../components/SuggestionAI';
import type { Guess, GameState } from '../components/GuessEvaluator';

self.onmessage = function (e) {
  const { allGuesses, gameState } = e.data as {
    allGuesses: Guess[];
    gameState: GameState;
  };

  // Evaluate all guesses (no debug mode in worker for speed)
  const results = [];
  for (let i = 0; i < allGuesses.length; i++) {
    const guess = allGuesses[i];
    const entropy = evaluateGuess(guess, gameState, false);
    results.push({ guess, entropy });
  }

  // Find the best guess
  const best = results.reduce((a, b) => (a.entropy > b.entropy ? a : b));
  self.postMessage(best);
};

export {}; 