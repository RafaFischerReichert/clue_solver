import { evaluateGuess } from './SuggestionAI';
import { Guess, GameState } from './GuessEvaluator';

// Demonstration of the improved AI's strategic thinking
export function demonstrateStrategicGuesses() {
  console.log("=== Strategic Guess Demonstration ===\n");

  // Scenario: You have 2 possible suspects, 2 possible weapons, and 5 possible rooms
  // You have one room in your hand
  const gameState: GameState = {
    knowledge: [
      // Suspects
      {
        cardName: 'Colonel Mustard',
        category: 'suspect',
        inYourHand: false,
        inPlayersHand: {},
        likelyHas: {},
        inSolution: null,
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
        inPlayersHand: { 'Alice': true },
        likelyHas: {},
        inSolution: false,
        eliminatedFromSolution: false
      },
      {
        cardName: 'Mrs. White',
        category: 'suspect',
        inYourHand: false,
        inPlayersHand: { 'Bob': true },
        likelyHas: {},
        inSolution: false,
        eliminatedFromSolution: false
      },
      // Weapons
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
        cardName: 'Lead Pipe',
        category: 'weapon',
        inYourHand: false,
        inPlayersHand: { 'Charlie': true },
        likelyHas: {},
        inSolution: false,
        eliminatedFromSolution: false
      },
      // Rooms
      {
        cardName: 'Library',
        category: 'room',
        inYourHand: true, // You have this room
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

  console.log("Game State:");
  console.log("- Possible suspects: Colonel Mustard, Professor Plum");
  console.log("- Possible weapons: Revolver, Dagger");
  console.log("- Possible rooms: Study, Kitchen, Ballroom, Conservatory");
  console.log("- You have: Library\n");

  // Test 1: Strategic guess - room in hand with two possible solution cards
  const strategicGuess: Guess = {
    suspect: 'Colonel Mustard', // Possible solution
    weapon: 'Revolver', // Possible solution
    room: 'Library' // In your hand
  };

  console.log("Test 1: Strategic Elimination Guess");
  console.log(`Guess: ${strategicGuess.suspect}, ${strategicGuess.weapon}, ${strategicGuess.room} (in hand)`);
  console.log("Strategy: Testing both possible suspects and weapons at once");
  console.log("Expected outcome: Either someone shows us a card (eliminating that suspect/weapon) or no one can show anything (meaning both are in the solution)");
  
  const strategicScore = evaluateGuess(strategicGuess, JSON.parse(JSON.stringify(gameState)), undefined, true);
  console.log(`AI Score: ${strategicScore.toFixed(3)}\n`);

  // Test 2: Non-strategic guess - all cards not in hand
  const nonStrategicGuess: Guess = {
    suspect: 'Colonel Mustard',
    weapon: 'Revolver',
    room: 'Study'
  };

  console.log("Test 2: Standard Guess");
  console.log(`Guess: ${nonStrategicGuess.suspect}, ${nonStrategicGuess.weapon}, ${nonStrategicGuess.room}`);
  console.log("Strategy: Standard guess with all cards not in hand");
  
  const nonStrategicScore = evaluateGuess(nonStrategicGuess, JSON.parse(JSON.stringify(gameState)), undefined, true);
  console.log(`AI Score: ${nonStrategicScore.toFixed(3)}\n`);

  // Test 3: Poor guess - guessing a card known to be in someone's hand
  const poorGuess: Guess = {
    suspect: 'Miss Scarlet', // Known to be in Alice's hand
    weapon: 'Revolver',
    room: 'Study'
  };

  console.log("Test 3: Poor Guess");
  console.log(`Guess: ${poorGuess.suspect} (in Alice's hand), ${poorGuess.weapon}, ${poorGuess.room}`);
  console.log("Strategy: Guessing a card we know someone has");
  
  const poorScore = evaluateGuess(poorGuess, JSON.parse(JSON.stringify(gameState)), undefined, true);
  console.log(`AI Score: ${poorScore.toFixed(3)}\n`);

  console.log("=== Analysis ===");
  console.log(`Strategic guess score: ${strategicScore.toFixed(3)}`);
  console.log(`Standard guess score: ${nonStrategicScore.toFixed(3)}`);
  console.log(`Poor guess score: ${poorScore.toFixed(3)}`);
  
  if (strategicScore > nonStrategicScore) {
    console.log("✅ AI correctly recognizes strategic value of guessing room in hand!");
  } else {
    console.log("❌ AI doesn't recognize strategic value");
  }
  
  if (poorScore < nonStrategicScore) {
    console.log("✅ AI correctly penalizes poor guesses!");
  } else {
    console.log("❌ AI doesn't penalize poor guesses");
  }
}

// Run the demonstration
if (typeof window !== 'undefined') {
  // In browser environment, attach to window for console access
  (window as any).demonstrateStrategicGuesses = demonstrateStrategicGuesses;
}

// For Node.js/command line execution
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
  demonstrateStrategicGuesses();
} 