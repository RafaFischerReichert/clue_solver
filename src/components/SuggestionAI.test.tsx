import { evaluateGuess, AI_PRESETS } from './SuggestionAI';
import { Guess, GameState } from './GuessEvaluator';
import { describe, expect, test } from 'vitest';

describe('SuggestionAI', () => {
  const mockGameState: GameState = {
    knowledge: [
      {
        cardName: 'Colonel Mustard',
        category: 'suspect',
        inYourHand: true,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: false,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Professor Plum',
        category: 'suspect',
        inYourHand: false,
        inPlayersHand: { 'Alice': true },
        likelyHas: {},
        inSolution: false,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Miss Scarlet',
        category: 'suspect',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Revolver',
        category: 'weapon',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Dagger',
        category: 'weapon',
        inYourHand: false,
        inPlayersHand: { 'Bob': true },
        likelyHas: {},
        inSolution: false,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Library',
        category: 'room',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Study',
        category: 'room',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
        eliminatedFromSolution: false
      }
    ],
    previousGuesses: [],
    playerOrder: ['You', 'Alice', 'Bob', 'Charlie']
  };

  test('should evaluate strategic value of guessing cards in your hand', () => {
    const guessWithCardInHand: Guess = {
      suspect: 'Colonel Mustard', // In your hand
      weapon: 'Revolver', // Possible solution
      room: 'Library' // Possible solution
    };

    const score = evaluateGuess(guessWithCardInHand, mockGameState, undefined, false);
    // Should have some strategic value since we're testing two possible solution cards
    expect(score).toBeGreaterThan(-1); // Should not be heavily penalized
  });

  test('should penalize guesses with cards in other hands', () => {
    const guessWithCardInOtherHand: Guess = {
      suspect: 'Professor Plum', // Known to be in Alice's hand
      weapon: 'Revolver',
      room: 'Library'
    };

    const guessWithUnknownCards: Guess = {
      suspect: 'Miss Scarlet', // Unknown location
      weapon: 'Revolver',
      room: 'Library'
    };

    const score1 = evaluateGuess(guessWithCardInOtherHand, mockGameState, undefined, false);
    const score2 = evaluateGuess(guessWithUnknownCards, mockGameState, undefined, false);
    
    // The guess with cards in other hands should score lower due to penalty
    expect(score1).toBeLessThan(score2);
  });

  test('should handle guesses with multiple cards in other hands', () => {
    const guessWithMultipleCardsInOtherHands: Guess = {
      suspect: 'Professor Plum', // In Alice's hand
      weapon: 'Dagger', // In Bob's hand
      room: 'Library'
    };

    const score = evaluateGuess(guessWithMultipleCardsInOtherHands, mockGameState, undefined, false);
    expect(score).toBeLessThan(0); // Should have negative score due to penalties for cards in other hands
  });

  test('should filter out impossible worlds', () => {
    const guess: Guess = {
      suspect: 'Colonel Mustard', // In your hand
      weapon: 'Revolver',
      room: 'Library'
    };

    // This should return early with a penalty, not generate impossible worlds
    const score = evaluateGuess(guess, mockGameState, undefined, false);
    expect(score).toBeGreaterThan(-1); // Should not be heavily penalized due to strategic value
  });

  test('should recognize strategic elimination guesses', () => {
    // Create a scenario with many possible solutions
    const strategicGameState: GameState = {
      knowledge: [
        {
          cardName: 'Colonel Mustard',
          category: 'suspect',
          inYourHand: true,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: false,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Professor Plum',
          category: 'suspect',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Miss Scarlet',
          category: 'suspect',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Revolver',
          category: 'weapon',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Dagger',
          category: 'weapon',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Library',
          category: 'room',
          inYourHand: true, // Room in hand
          inPlayersHand: {},
          likelyHas: {},
          inSolution: false,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Study',
          category: 'room',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Kitchen',
          category: 'room',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Ballroom',
          category: 'room',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Conservatory',
          category: 'room',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        }
      ],
      previousGuesses: [],
      playerOrder: ['You', 'Alice', 'Bob', 'Charlie']
    };

    // Guessing a room in hand with two possible solution cards
    const strategicGuess: Guess = {
      suspect: 'Professor Plum', // Possible solution
      weapon: 'Revolver', // Possible solution
      room: 'Library' // In your hand
    };

    const score = evaluateGuess(strategicGuess, strategicGameState, undefined, true); // Enable debug
    console.log(`Strategic guess score: ${score}`);
    // This should be a very strategic guess - testing both possible suspects and weapons
    expect(score).toBeGreaterThan(0); // Should have positive strategic value
  });

  test('should return 0 for guesses with zero information gain potential', () => {
    // Create a scenario where all cards in the guess are either in your hand, known to be in other players' hands, or known to be in the solution
    const zeroInfoGameState: GameState = {
      knowledge: [
        {
          cardName: 'Colonel Mustard',
          category: 'suspect',
          inYourHand: true, // In your hand
          inPlayersHand: {},
          likelyHas: {},
          inSolution: false,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Professor Plum',
          category: 'suspect',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: true, // Known to be in solution
          eliminatedFromSolution: false
        },
        {
          cardName: 'Miss Scarlet',
          category: 'suspect',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Revolver',
          category: 'weapon',
          inYourHand: false,
          inPlayersHand: { Alice: true, Bob: false, Charlie: false }, // Known to be in Alice's hand
          likelyHas: {},
          inSolution: false,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Dagger',
          category: 'weapon',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Lead Pipe',
          category: 'weapon',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Library',
          category: 'room',
          inYourHand: false,
          inPlayersHand: { Alice: false, Bob: true, Charlie: false }, // Known to be in Bob's hand
          likelyHas: {},
          inSolution: false,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Study',
          category: 'room',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Kitchen',
          category: 'room',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        }
      ],
      previousGuesses: [],
      playerOrder: ['You', 'Alice', 'Bob', 'Charlie']
    };

    // This guess has zero information gain - all cards are either in your hand, known to be in other players' hands, or known to be in the solution
    const zeroInfoGuess: Guess = {
      suspect: 'Colonel Mustard', // In your hand
      weapon: 'Revolver', // Known to be in Alice's hand
      room: 'Library' // Known to be in Bob's hand
    };

    const score = evaluateGuess(zeroInfoGuess, zeroInfoGameState, undefined, true); // Enable debug
    console.log(`Zero info guess score: ${score}`);
    expect(score).toBe(0); // Should return 0 for zero information gain potential
  });

  test('should return 0 for guesses with cards known to be in solution', () => {
    // Create a scenario where one card is known to be in the solution
    const solutionGameState: GameState = {
      knowledge: [
        {
          cardName: 'Colonel Mustard',
          category: 'suspect',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: true, // Known to be in solution
          eliminatedFromSolution: false
        },
        {
          cardName: 'Professor Plum',
          category: 'suspect',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Miss Scarlet',
          category: 'suspect',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Revolver',
          category: 'weapon',
          inYourHand: true, // In your hand
          inPlayersHand: {},
          likelyHas: {},
          inSolution: false,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Dagger',
          category: 'weapon',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Lead Pipe',
          category: 'weapon',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Library',
          category: 'room',
          inYourHand: false,
          inPlayersHand: { Alice: true, Bob: false, Charlie: false }, // Known to be in Alice's hand
          likelyHas: {},
          inSolution: false,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Study',
          category: 'room',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        },
        {
          cardName: 'Kitchen',
          category: 'room',
          inYourHand: false,
          inPlayersHand: {},
          likelyHas: {},
          inSolution: null,
          eliminatedFromSolution: false
        }
      ],
      previousGuesses: [],
      playerOrder: ['You', 'Alice', 'Bob', 'Charlie']
    };

    // This guess has zero information gain - all cards are either in your hand, known to be in other players' hands, or known to be in the solution
    const solutionGuess: Guess = {
      suspect: 'Colonel Mustard', // Known to be in solution
      weapon: 'Revolver', // In your hand
      room: 'Library' // Known to be in Alice's hand
    };

    const score = evaluateGuess(solutionGuess, solutionGameState, undefined, true); // Enable debug
    console.log(`Solution guess score: ${score}`);
    expect(score).toBe(0); // Should return 0 for zero information gain potential
  });

  test('should respect configurable weights', () => {
    const guess: Guess = {
      suspect: 'Colonel Mustard',
      weapon: 'Revolver', 
      room: 'Library'
    };

    // Test with default weights
    const defaultScore = evaluateGuess(guess, mockGameState, undefined, false);
    
    // Test with aggressive weights (should score higher for strategic moves)
    const aggressiveWeights = {
      penaltyDefinitelyInOtherHands: -0.1,
      penaltyLikelyInOtherHands: -0.05,
      strategicValueMultiplier: 3.0,
      strategicEliminationBonus: 1.0,
      probabilityDefinitelyKnown: 4.0,
      probabilityLikely: 2.0,
      probabilityUnlikely: 0.5,
      entropyWeight: 1.0,
      informationBonusWeight: 1.0,
    };
    const aggressiveScore = evaluateGuess(guess, mockGameState, aggressiveWeights, false);
    
    // Test with conservative weights (should penalize more)
    const conservativeWeights = {
      penaltyDefinitelyInOtherHands: -1.0,
      penaltyLikelyInOtherHands: -0.5,
      strategicValueMultiplier: 1.0,
      strategicEliminationBonus: 0.2,
      probabilityDefinitelyKnown: 4.0,
      probabilityLikely: 2.0,
      probabilityUnlikely: 0.3,
      entropyWeight: 1.0,
      informationBonusWeight: 1.0,
    };
    const conservativeScore = evaluateGuess(guess, mockGameState, conservativeWeights, false);
    
    // Aggressive weights should score higher than conservative weights for strategic moves
    expect(aggressiveScore).toBeGreaterThan(conservativeScore);
    
    // All scores should be reasonable (not extreme values)
    expect(defaultScore).toBeGreaterThan(-10);
    expect(defaultScore).toBeLessThan(10);
    expect(aggressiveScore).toBeGreaterThan(-10);
    expect(aggressiveScore).toBeLessThan(10);
    expect(conservativeScore).toBeGreaterThan(-10);
    expect(conservativeScore).toBeLessThan(10);
  });

  test('should produce different results with different AI presets', () => {
    const guess: Guess = {
      suspect: 'Colonel Mustard',
      weapon: 'Revolver', 
      room: 'Library'
    };

    // Test all presets
    const results = Object.entries(AI_PRESETS).map(([name, weights]) => {
      const score = evaluateGuess(guess, mockGameState, weights, false);
      return { name, score };
    });

    // All presets should produce different scores for this strategic guess
    const scores = results.map(r => r.score);
    const uniqueScores = new Set(scores);
    
    // At least some presets should produce different scores
    expect(uniqueScores.size).toBeGreaterThan(1);
    
    // All scores should be reasonable
    scores.forEach(score => {
      expect(score).toBeGreaterThan(-10);
      expect(score).toBeLessThan(10);
    });

    // Log the results for debugging
    console.log('AI Preset Results:', results);
  });
});
