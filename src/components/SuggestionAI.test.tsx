import { evaluateGuess } from './SuggestionAI';
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

    const score = evaluateGuess(guessWithCardInHand, mockGameState, false);
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

    const score1 = evaluateGuess(guessWithCardInOtherHand, mockGameState, false);
    const score2 = evaluateGuess(guessWithUnknownCards, mockGameState, false);
    
    // The guess with cards in other hands should score lower due to penalty
    expect(score1).toBeLessThan(score2);
  });

  test('should handle guesses with multiple cards in other hands', () => {
    const guessWithMultipleCardsInOtherHands: Guess = {
      suspect: 'Professor Plum', // In Alice's hand
      weapon: 'Dagger', // In Bob's hand
      room: 'Library'
    };

    const score = evaluateGuess(guessWithMultipleCardsInOtherHands, mockGameState, false);
    expect(score).toBeLessThan(0); // Should have negative score due to penalties for cards in other hands
  });

  test('should filter out impossible worlds', () => {
    const guess: Guess = {
      suspect: 'Colonel Mustard', // In your hand
      weapon: 'Revolver',
      room: 'Library'
    };

    // This should return early with a penalty, not generate impossible worlds
    const score = evaluateGuess(guess, mockGameState, false);
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

    const score = evaluateGuess(strategicGuess, strategicGameState, true); // Enable debug
    console.log(`Strategic guess score: ${score}`);
    // This should be a very strategic guess - testing both possible suspects and weapons
    expect(score).toBeGreaterThan(0); // Should have positive strategic value
  });
});
