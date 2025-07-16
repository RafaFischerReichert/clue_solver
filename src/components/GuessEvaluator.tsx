import React, { useEffect, useState } from 'react';
import { CardKnowledge } from './GameLogic';

// Represents a single guess (room, suspect, weapon)
export interface Guess {
  room: string;
  suspect: string;
  weapon: string;
}

// Updated GameState
export interface GameState {
  knowledge: CardKnowledge[]; // Fixed: should be an array
  previousGuesses: Guess[];
  playerOrder: string[];
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
  accessibleRooms: string[];
  suspects: string[];
  weapons: string[];
  gameState: GameState;
  evaluateGuess?: (guess: Guess, gameState: GameState) => number | Promise<number>;
  // playerOrder: string[]; // Removed, now only in gameState
  // currentTurn removed
}

const defaultEvaluateGuess = (guess: Guess, gameState: GameState): number => {
  // TODO: Replace with real entropy calculation
  return Math.random();
};

const GuessEvaluator: React.FC<GuessEvaluatorProps> = ({ accessibleRooms, suspects, weapons, gameState, evaluateGuess }) => {
  // Generate all possible guesses
  const allGuesses: Guess[] = [];
  accessibleRooms.forEach(room => {
    suspects.forEach(suspect => {
      weapons.forEach(weapon => {
        allGuesses.push({ room, suspect, weapon });
      });
    });
  });

  const evalFn = evaluateGuess || defaultEvaluateGuess;

  // State for async evaluation
  const [loading, setLoading] = useState(false);
  const [bestGuess, setBestGuess] = useState<Guess | null>(null);
  const [bestEntropy, setBestEntropy] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (allGuesses.length === 0) {
      setBestGuess(null);
      setBestEntropy(null);
      return;
    }
    setLoading(true);
    // Support both sync and async evaluateGuess
    const isAsync = evalFn.constructor.name === 'AsyncFunction';
    const evaluateAll = async () => {
      const entropies = await Promise.all(
        allGuesses.map(guess => Promise.resolve(evalFn(guess, gameState)))
      );
      if (cancelled) return;
      let maxIdx = 0;
      for (let i = 1; i < entropies.length; i++) {
        if (entropies[i] > entropies[maxIdx]) {
          maxIdx = i;
        }
      }
      setBestGuess(allGuesses[maxIdx]);
      setBestEntropy(entropies[maxIdx]);
      setLoading(false);
    };
    evaluateAll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessibleRooms, suspects, weapons, gameState, evalFn]);

  // Always render player order for testability
  const playerOrderDiv = <div data-testid="player-order">Player Order: {gameState.playerOrder.join(", ")}</div>;

  if (allGuesses.length === 0) {
    return (
      <div>
        <h2>Guess Evaluator</h2>
        {playerOrderDiv}
        <p>No guesses available.</p>
      </div>
    );
  }

  if (loading || bestGuess === null || bestEntropy === null) {
    return (
      <div>
        <h2>Guess Evaluator</h2>
        {playerOrderDiv}
        <p>Evaluating guesses...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Guess Evaluator</h2>
      {playerOrderDiv}
      <div>
        <p>Optimal Guess:</p>
        <ul>
          <li>Room: {bestGuess.room}</li>
          <li>Suspect: {bestGuess.suspect}</li>
          <li>Weapon: {bestGuess.weapon}</li>
          <li>Estimated Entropy Gain: {bestEntropy.toFixed(3)}</li>
        </ul>
      </div>
    </div>
  );
};

export default GuessEvaluator; 