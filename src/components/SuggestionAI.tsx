// SuggestionAI: Minimax/entropy-based guess evaluator for Cluedo
import { Guess, GameState } from './GuessEvaluator';
import { getPossibleCardLocations, updateKnowledgeWithDeductions, checkForSolution } from './GameLogic';

/**
 * Evaluate a guess using minimax/expectimax or entropy-based logic.
 * @param guess The guess to evaluate (room, suspect, weapon)
 * @param gameState The current game state (knowledge, previous guesses, player order, etc.)
 * @returns Expected information gain (entropy reduction) or other metric
 */
export function evaluateGuess(
  guess: Guess,
  gameState: GameState,
  debug: boolean = false
): number {
  if (debug) {
    console.log("=== Evaluating guess:", guess);
    console.log("Game state:", gameState);
  }

  // Step 1: Generate possible worlds
  const possibleWorlds = generatePossibleWorlds(guess, gameState, debug);
  if (debug) {
    console.log("Possible worlds:", possibleWorlds);
    console.log("Number of possible worlds:", possibleWorlds.length);
  }

  // Step 4: Compute entropy before the guess (solution uncertainty)
  const entropyBefore = computeSolutionEntropy(gameState, debug);
  if (debug) {
    console.log("Entropy before guess:", entropyBefore);
  }

  // Step 2 & 3: For each world, simulate responses and update knowledge
  // We'll aggregate probabilities across all possible worlds (assume each world is equally likely)
  const entropyAfterList: { entropy: number, probability: number }[] = [];
  for (const world of possibleWorlds) {
    if (debug) {
      console.log("--- Simulating world:", world);
    }
    // Simulate possible responses in this world
    const responsesWithProb = simulateResponses(guess, world, gameState, debug);
    if (debug) {
      console.log("Responses for this world:", responsesWithProb);
    }
    const worldProb = 1 / possibleWorlds.length;
    for (const { response, probability } of responsesWithProb) {
      if (debug) {
        console.log("Processing response:", response, "with probability:", probability);
      }
      // Create a copy of gameState with the guess appended to previousGuesses
      const simulatedGameState = {
        ...gameState,
        previousGuesses: [...(gameState.previousGuesses || []), guess],
      };
      // Update knowledge for this outcome
      const updatedGameState = updateKnowledgeForOutcome(simulatedGameState, response, debug);
      // Compute entropy after this outcome
      const entropyAfter = computeSolutionEntropy(updatedGameState, debug);
      if (debug) {
        console.log("Entropy after this response:", entropyAfter);
      }
      // The probability of this outcome is worldProb * probability
      entropyAfterList.push({ entropy: entropyAfter, probability: worldProb * probability });
    }
  }

  // Step 5: Aggregate expected information gain
  const infoGain = aggregateExpectedInformationGain(entropyBefore, entropyAfterList, debug);
  if (debug) {
    console.log("Final information gain:", infoGain);
    console.log("=== End evaluation ===");
  }
  return infoGain;
}

// Step 1: Generate all possible worlds consistent with current knowledge (focus on solution uncertainty)
function generatePossibleWorlds(guess:Guess, gameState: GameState, debug: boolean): any[] {
  const { suspect, weapon, room } = guess;
  const cards = [suspect, weapon, room];
  const players = gameState.playerOrder || [];
  const knowledge = gameState.knowledge || [];

  if (debug) {
    console.log("Generating possible worlds for cards:", cards);
    console.log("Players:", players);
  }

  // Use shared utility to get possible locations for each card
  const possibleLocationsList = cards.map(card => getPossibleCardLocations(card, knowledge, players));
  
  if (debug) {
    console.log("Possible locations for each card:", {
      [suspect]: possibleLocationsList[0],
      [weapon]: possibleLocationsList[1], 
      [room]: possibleLocationsList[2]
    });
  }

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
  if (debug) {
    console.log("All possible assignments:", allAssignments);
  }

  // Return as array of objects for clarity
  const worlds = allAssignments.map(assignment => ({
    [suspect]: assignment[0],
    [weapon]: assignment[1],
    [room]: assignment[2],
  }));
  
  if (debug) {
    console.log("Generated worlds:", worlds);
  }
  return worlds;
}

// Step 2: Simulate responses for a guess in a given world
export function simulateResponses(guess: Guess, world: any, gameState: GameState, debug: boolean): { response: any, probability: number }[] {
  const { suspect, weapon, room } = guess;
  const cards = [suspect, weapon, room];
  const players = gameState.playerOrder || [];

  if (debug) {
    console.log("Simulating responses for guess:", guess);
    console.log("World state:", world);
    console.log("Cards being guessed:", cards);
  }

  // Find the index of the guesser (assume first in playerOrder for now, or add guessedBy to GameState if needed)
  // For now, assume guesser is players[0]
  const guesserIndex = 0;
  const n = players.length;

  // Players to ask, in order after the guesser, wrapping around
  const askedPlayers = [];
  for (let i = 1; i < n; i++) {
    askedPlayers.push(players[(guesserIndex + i) % n]);
  }
  
  if (debug) {
    console.log("Guesser:", players[guesserIndex]);
    console.log("Asked players:", askedPlayers);
  }

  // For each player, check if they can show any of the guessed cards
  for (const player of askedPlayers) {
    const cardsInHand = cards.filter(card => world[card] === player);
    if (debug) {
      console.log(`Player ${player} has cards in hand:`, cardsInHand);
    }
    
    if (cardsInHand.length > 0) {
      // This player can show one of these cards; each is equally likely
      const prob = 1 / cardsInHand.length;
      const responses = cardsInHand.map(card => ({ response: { shownBy: player, card }, probability: prob }));
      if (debug) {
        console.log(`Player ${player} can show cards. Responses:`, responses);
      }
      return responses;
    }
  }

  // If no player can show a card, return a response indicating that
  if (debug) {
    console.log("No player can show any cards");
  }
  return [{ response: { shownBy: null, card: null }, probability: 1 }];
}

// Step 3: Update knowledge for a given outcome (response)
function updateKnowledgeForOutcome(gameState: GameState, response: any, debug: boolean): GameState {
  if (debug) {
    console.log("Updating knowledge for response:", response);
  }
  
  // Clone the knowledge array
  let newKnowledge = [...gameState.knowledge];
  const players = gameState.playerOrder || [];

  // The guess is always the last guess in previousGuesses
  const lastGuess = gameState.previousGuesses && gameState.previousGuesses.length > 0
    ? gameState.previousGuesses[gameState.previousGuesses.length - 1]
    : null;

  if (!lastGuess) {
    if (debug) {
      console.log("No last guess found, returning original game state");
    }
    // No guess to update knowledge for
    return gameState;
  }

  if (debug) {
    console.log("Last guess:", lastGuess);
  }
  const { suspect, weapon, room } = lastGuess;
  
  // Prepare askedPlayers as in simulateResponses
  const guesserIndex = 0; // Assumed as in simulateResponses
  const n = players.length;
  const askedPlayers = [];
  for (let i = 1; i < n; i++) {
    askedPlayers.push(players[(guesserIndex + i) % n]);
  }
  
  if (debug) {
    console.log("Asked players:", askedPlayers);
  }

  // Build a tuple for this guess/response
  const tuples = [];
  const guessTuple = {
    suspect,
    weapon,
    room,
    guessedBy: players[guesserIndex],
    shownBy: response.shownBy,
    askedPlayers,
    timestamp: 0, // deterministic for AI
  };
  
  if (debug) {
    console.log("Guess tuple:", guessTuple);
  }
  
  if (response.shownBy) {
    tuples.push({ player: response.shownBy, tuples: [guessTuple] });
  } else {
    tuples.push({ player: "NO_RESPONSE", tuples: [guessTuple] });
  }
  
  if (debug) {
    console.log("Tuples for deduction:", tuples);
  }

  // Use deduction suite
  let deducedKnowledge = updateKnowledgeWithDeductions(newKnowledge, tuples);
  if (debug) {
    console.log("Knowledge after deductions:", deducedKnowledge);
  }
  
  deducedKnowledge = checkForSolution(deducedKnowledge);
  if (debug) {
    console.log("Knowledge after solution check:", deducedKnowledge);
  }

  // Return a new GameState with updated knowledge
  return {
    ...gameState,
    knowledge: deducedKnowledge,
  };
}

// Step 4: Compute entropy of the solution (envelope) given current knowledge
function computeSolutionEntropy(gameState: GameState, debug: boolean): number {
  const knowledge = gameState.knowledge || [];
  const players = gameState.playerOrder || [];

  if (debug) {
    console.log("Computing solution entropy");
    console.log("Knowledge:", knowledge);
    console.log("Players:", players);
  }

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

  if (debug) {
    console.log("Possible solution cards:", { suspects, weapons, rooms });
  }

  // Generate all possible solution combinations
  const possibleSolutions: string[][] = [];
  for (const suspect of suspects) {
    for (const weapon of weapons) {
      for (const room of rooms) {
        possibleSolutions.push([suspect, weapon, room]);
      }
    }
  }

  if (debug) {
    console.log("Possible solutions:", possibleSolutions);
  }

  const n = possibleSolutions.length;
  if (n === 0) {
    if (debug) {
      console.log("No possible solutions found, returning 0 entropy");
    }
    return 0; // No possible solutions (shouldn't happen in a valid game)
  }

  // Uniform probability for each possible solution
  const p = 1 / n;
  // Shannon entropy
  const entropy = -n * p * Math.log2(p);
  if (debug) {
    console.log(`Entropy calculation: n=${n}, p=${p}, entropy=${entropy}`);
  }
  return entropy;
}

// Step 5: Aggregate expected information gain for a guess
function aggregateExpectedInformationGain(entropyBefore: number, entropyAfterList: { entropy: number, probability: number }[], debug: boolean): number {
  if (debug) {
    console.log("Aggregating expected information gain");
    console.log("Entropy before:", entropyBefore);
    console.log("Entropy after list:", entropyAfterList);
  }
  
  if (entropyAfterList.length === 0) {
    if (debug) {
      console.log("No entropy after list, returning 0");
    }
    return 0;
  }
  
  // Weighted sum of entropy after, using probabilities
  const weightedEntropyAfter = entropyAfterList.reduce((sum, item) => sum + item.entropy * item.probability, 0);
  const infoGain = entropyBefore - weightedEntropyAfter;
  
  if (debug) {
    console.log("Weighted entropy after:", weightedEntropyAfter);
    console.log("Information gain:", infoGain);
  }
  
  return infoGain;
} 
