// SuggestionAI: Minimax/entropy-based guess evaluator for Cluedo
import { Guess, GameState } from './GuessEvaluator';
import { getPossibleCardLocations } from './GameLogic';

/**
 * Evaluate a guess using minimax/expectimax or entropy-based logic.
 * @param guess The guess to evaluate (room, suspect, weapon)
 * @param gameState The current game state (knowledge, previous guesses, player order, etc.)
 * @returns Expected information gain (entropy reduction) or other metric
 */
export function evaluateGuess(
  guess: Guess,
  gameState: GameState
): number {
  // Step 1: Generate possible worlds
  const possibleWorlds = generatePossibleWorlds(guess, gameState);

  // Step 4: Compute entropy before the guess (solution uncertainty)
  const entropyBefore = computeSolutionEntropy(gameState);

  // Step 2 & 3: For each world, simulate responses and update knowledge
  const entropyAfterList: number[] = [];
  for (const world of possibleWorlds) {
    // Simulate possible responses in this world
    const responses = simulateResponses(guess, world, gameState);
    for (const response of responses) {
      // Update knowledge for this outcome
      const updatedGameState = updateKnowledgeForOutcome(gameState, response);
      // Compute entropy after this outcome
      const entropyAfter = computeSolutionEntropy(updatedGameState);
      entropyAfterList.push(entropyAfter);
    }
  }

  // Step 5: Aggregate expected information gain
  return aggregateExpectedInformationGain(entropyBefore, entropyAfterList);
}

// Step 1: Generate all possible worlds consistent with current knowledge (focus on solution uncertainty)
function generatePossibleWorlds(guess:Guess, gameState: GameState): any[] {
  const { suspect, weapon, room } = guess;
  const cards = [suspect, weapon, room];
  const players = gameState.playerOrder || [];
  const knowledge = gameState.knowledge || [];

  // Use shared utility to get possible locations for each card
  const possibleLocationsList = cards.map(card => getPossibleCardLocations(card, knowledge, players));

  // Generate all combinations (cartesian product)
  function cartesianProduct(arrays: string[][]): string[][] {
    return arrays.reduce(
      (acc, curr) =>
        acc
          .map(a => curr.map(b => a.concat([b])))
          .reduce((a, b) => a.concat(b), []),
      [[]] as string[][]
    );
  }

  const allAssignments = cartesianProduct(possibleLocationsList);

  // Return as array of objects for clarity
  return allAssignments.map(assignment => ({
    [suspect]: assignment[0],
    [weapon]: assignment[1],
    [room]: assignment[2],
  }));
}

// Step 2: Simulate responses for a guess in a given world
function simulateResponses(guess: Guess, world: any, gameState: GameState): any[] {
  const { suspect, weapon, room } = guess;
  const cards = [suspect, weapon, room];
  const players = gameState.playerOrder || [];

  // Find the index of the guesser (assume first in playerOrder for now, or add guessedBy to GameState if needed)
  // For now, assume guesser is players[0]
  const guesserIndex = 0;
  const n = players.length;

  // Players to ask, in order after the guesser, wrapping around
  const askedPlayers = [];
  for (let i = 1; i < n; i++) {
    askedPlayers.push(players[(guesserIndex + i) % n]);
  }

  // For each player, check if they can show any of the guessed cards
  for (const player of askedPlayers) {
    const cardsInHand = cards.filter(card => world[card] === player);
    if (cardsInHand.length > 0) {
      // This player can show one of these cards; each is equally likely
      return cardsInHand.map(card => ({ shownBy: player, card }));
    }
  }

  // If no player can show a card, return a response indicating that
  return [{ shownBy: null, card: null }];
}

// Step 3: Update knowledge for a given outcome (response)
function updateKnowledgeForOutcome(gameState: GameState, response: any): GameState {
  // Placeholder: Should return a new gameState with updated knowledge
  return gameState;
}

// Step 4: Compute entropy of the solution (envelope) given current knowledge
function computeSolutionEntropy(gameState: GameState): number {
  const knowledge = gameState.knowledge || [];
  const players = gameState.playerOrder || [];

  // Get all suspects, weapons, and rooms that could possibly be in the solution
  const suspects = knowledge
    .filter(card => card.category === "suspect" && getPossibleCardLocations(card.cardName, knowledge, players).includes("solution"))
    .map(card => card.cardName);
  const weapons = knowledge
    .filter(card => card.category === "weapon" && getPossibleCardLocations(card.cardName, knowledge, players).includes("solution"))
    .map(card => card.cardName);
  const rooms = knowledge
    .filter(card => card.category === "room" && getPossibleCardLocations(card.cardName, knowledge, players).includes("solution"))
    .map(card => card.cardName);

  // Generate all possible solution combinations
  const possibleSolutions: string[][] = [];
  for (const suspect of suspects) {
    for (const weapon of weapons) {
      for (const room of rooms) {
        possibleSolutions.push([suspect, weapon, room]);
      }
    }
  }

  const n = possibleSolutions.length;
  if (n === 0) return 0; // No possible solutions (shouldn't happen in a valid game)

  // Uniform probability for each possible solution
  const p = 1 / n;
  // Shannon entropy
  const entropy = -n * p * Math.log2(p);
  return entropy;
}

// Step 5: Aggregate expected information gain for a guess
function aggregateExpectedInformationGain(entropyBefore: number, entropyAfterList: number[]): number {
  // Placeholder: Should average entropy reduction over all outcomes
  if (entropyAfterList.length === 0) return 0;
  const avgEntropyAfter = entropyAfterList.reduce((a, b) => a + b, 0) / entropyAfterList.length;
  return entropyBefore - avgEntropyAfter;
} 