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

  // Initialize information bonus
  let informationBonus = 0;

  // Check if any cards in the guess are in your hand
  const knowledge = gameState.knowledge || [];
  const cardsInYourHand = [];
  for (const cardName of [guess.suspect, guess.weapon, guess.room]) {
    const cardInfo = knowledge.find(k => k.cardName === cardName);
    if (cardInfo?.inYourHand) {
      cardsInYourHand.push(cardName);
    }
  }
  
  // Analyze the strategic value of guessing cards in your hand
  if (cardsInYourHand.length > 0) {
    if (debug) {
      console.log(`Cards in your hand: ${cardsInYourHand.join(', ')}`);
    }
    
    // Calculate the strategic value of this guess
    const strategicValue = calculateStrategicValueOfHandGuess(guess, cardsInYourHand, gameState, debug);
    
    if (debug) {
      console.log(`Strategic value of hand guess: ${strategicValue}`);
    }
    
    // Store the strategic value to add to the final score
    informationBonus += strategicValue;
    
    if (debug) {
      console.log(`Strategic value added to bonus: ${strategicValue}`);
      console.log(`Total information bonus so far: ${informationBonus}`);
    }
  }
  
  // Check for cards likely to be in other players' hands - these should be penalized
  const cardsInOtherHands = [];
  const cardsLikelyInOtherHands = [];
  for (const cardName of [guess.suspect, guess.weapon, guess.room]) {
    const cardInfo = knowledge.find(k => k.cardName === cardName);
    if (cardInfo?.inPlayersHand) {
      const definitelyInOtherHand = Object.values(cardInfo.inPlayersHand).some(hasIt => hasIt === true);
      if (definitelyInOtherHand) {
        cardsInOtherHands.push(cardName);
      }
    }
    if (cardInfo?.likelyHas) {
      // Only consider likelyHas if we don't have definitive knowledge
      const hasDefinitiveKnowledge = Object.values(cardInfo.inPlayersHand).some(hasIt => hasIt !== null);
      if (!hasDefinitiveKnowledge) {
                  const likelyInOtherHand = Object.values(cardInfo.likelyHas).some(likely => likely === true);
        if (likelyInOtherHand) {
          cardsLikelyInOtherHands.push(cardName);
        }
      }
    }
  }
  
  if (cardsInOtherHands.length > 0) {
    informationBonus -= cardsInOtherHands.length * 0.5; // Penalty for cards definitely in other hands
    if (debug) {
      console.log(`Cards definitely in other hands: ${cardsInOtherHands.join(', ')} - penalty: ${-cardsInOtherHands.length * 0.5}`);
    }
  }
  
  if (cardsLikelyInOtherHands.length > 0) {
    informationBonus -= cardsLikelyInOtherHands.length * 0.2; // Smaller penalty for cards likely in other hands
    if (debug) {
      console.log(`Cards likely in other hands: ${cardsLikelyInOtherHands.join(', ')} - penalty: ${-cardsLikelyInOtherHands.length * 0.2}`);
    }
  }

  // Step 1: Generate possible worlds with proper probabilities
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
  // Use proper world probabilities instead of assuming equal likelihood
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
    const worldProb = world.probability; // Use the world's calculated probability
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
  const finalScore = infoGain + informationBonus;
  if (debug) {
    console.log("Base information gain:", infoGain);
    console.log("Information bonus:", informationBonus);
    console.log("Final score:", finalScore);
    console.log("=== End evaluation ===");
  }
  return finalScore;
}

// Calculate the strategic value of guessing cards in your hand
function calculateStrategicValueOfHandGuess(
  guess: Guess,
  cardsInYourHand: string[],
  gameState: GameState,
  debug: boolean
): number {
  if (debug) {
    console.log("Calculating strategic value of hand guess");
  }

  const knowledge = gameState.knowledge || [];

  // Get the other cards in the guess (not in your hand)
  const otherCards = [guess.suspect, guess.weapon, guess.room].filter(
    card => !cardsInYourHand.includes(card)
  );

  if (debug) {
    console.log("Other cards in guess:", otherCards);
  }

  // Count possible solutions for each category
  // Note: We include all cards not in your hand for strategic value calculation
  // This allows the AI to consider guessing cards in other players' hands
  // The penalty system will handle the evaluation appropriately
  const possibleSuspects = knowledge
    .filter(card => card.category === "suspect" && !card.inYourHand)
    .map(card => card.cardName);
  
  const possibleWeapons = knowledge
    .filter(card => card.category === "weapon" && !card.inYourHand)
    .map(card => card.cardName);
  
  const possibleRooms = knowledge
    .filter(card => card.category === "room" && !card.inYourHand)
    .map(card => card.cardName);

  if (debug) {
    console.log("Possible solutions:", { suspects: possibleSuspects, weapons: possibleWeapons, rooms: possibleRooms });
  }

  // Calculate the reduction in solution space this guess could provide
  let strategicValue = 0;

  // If we're guessing a room in our hand, we're essentially asking about the other two cards
  if (cardsInYourHand.includes(guess.room)) {
    const suspectInGuess = guess.suspect;
    const weaponInGuess = guess.weapon;
    
    // Check if the suspect and weapon in our guess are among the possible solutions
    const suspectIsPossible = possibleSuspects.includes(suspectInGuess);
    const weaponIsPossible = possibleWeapons.includes(weaponInGuess);
    
    if (suspectIsPossible && weaponIsPossible) {
      // This is a strategic guess - we're testing both possible solution cards
      const totalPossibleSolutions = possibleSuspects.length * possibleWeapons.length * possibleRooms.length;
      const solutionsEliminatedIfNoResponse = (possibleSuspects.length - 1) * (possibleWeapons.length - 1) * possibleRooms.length;
      const informationGain = totalPossibleSolutions - solutionsEliminatedIfNoResponse;
      
      strategicValue = informationGain / totalPossibleSolutions * 2; // Bonus for strategic value
      
      if (debug) {
        console.log(`Strategic room guess: testing ${suspectInGuess} and ${weaponInGuess}`);
        console.log(`Information gain potential: ${informationGain} out of ${totalPossibleSolutions} solutions`);
        console.log(`Strategic value: ${strategicValue}`);
      }
    }
  }

  // Similar logic for suspect and weapon guesses
  if (cardsInYourHand.includes(guess.suspect)) {
    const weaponInGuess = guess.weapon;
    const roomInGuess = guess.room;
    
    const weaponIsPossible = possibleWeapons.includes(weaponInGuess);
    const roomIsPossible = possibleRooms.includes(roomInGuess);
    
    if (weaponIsPossible && roomIsPossible) {
      const totalPossibleSolutions = possibleSuspects.length * possibleWeapons.length * possibleRooms.length;
      const solutionsEliminatedIfNoResponse = possibleSuspects.length * (possibleWeapons.length - 1) * (possibleRooms.length - 1);
      const informationGain = totalPossibleSolutions - solutionsEliminatedIfNoResponse;
      
      strategicValue = Math.max(strategicValue, informationGain / totalPossibleSolutions * 2);
      
      if (debug) {
        console.log(`Strategic suspect guess: testing ${weaponInGuess} and ${roomInGuess}`);
        console.log(`Information gain potential: ${informationGain} out of ${totalPossibleSolutions} solutions`);
        console.log(`Strategic value: ${strategicValue}`);
      }
    }
  }

  if (cardsInYourHand.includes(guess.weapon)) {
    const suspectInGuess = guess.suspect;
    const roomInGuess = guess.room;
    
    const suspectIsPossible = possibleSuspects.includes(suspectInGuess);
    const roomIsPossible = possibleRooms.includes(roomInGuess);
    
    if (suspectIsPossible && roomIsPossible) {
      const totalPossibleSolutions = possibleSuspects.length * possibleWeapons.length * possibleRooms.length;
      const solutionsEliminatedIfNoResponse = (possibleSuspects.length - 1) * possibleWeapons.length * (possibleRooms.length - 1);
      const informationGain = totalPossibleSolutions - solutionsEliminatedIfNoResponse;
      
      strategicValue = Math.max(strategicValue, informationGain / totalPossibleSolutions * 2);
      
      if (debug) {
        console.log(`Strategic weapon guess: testing ${suspectInGuess} and ${roomInGuess}`);
        console.log(`Information gain potential: ${informationGain} out of ${totalPossibleSolutions} solutions`);
        console.log(`Strategic value: ${strategicValue}`);
      }
    }
  }

  // Additional bonus for guesses that could eliminate many solutions at once
  if (cardsInYourHand.length === 1 && otherCards.length === 2) {
    // We're guessing one card in hand and two possible solution cards
    // This is often a very strategic move
    strategicValue += 0.5;
    
    if (debug) {
      console.log("Bonus for strategic elimination guess");
    }
  }

  return strategicValue;
}

// Step 1: Generate all possible worlds consistent with current knowledge with proper probabilities
function generatePossibleWorlds(guess: Guess, gameState: GameState, debug: boolean): Array<{ [key: string]: string | number, probability: number }> {
  const { suspect, weapon, room } = guess;
  const cards = [suspect, weapon, room];
  const players = gameState.playerOrder || [];
  const knowledge = gameState.knowledge || [];

  if (debug) {
    console.log("Generating possible worlds for cards:", cards);
    console.log("Players:", players);
  }

  // Get possible locations for each card, but filter out impossible ones
  const possibleLocationsList = cards.map(card => {
    const locations = getPossibleCardLocations(card, knowledge, players);
    // Filter out locations that are impossible based on current knowledge
    return locations.filter(location => {
      if (location === "solution") {
        // Check if card is known to be in someone's hand
        const cardInfo = knowledge.find(k => k.cardName === card);
        if (cardInfo?.inYourHand) return false; // Can't be in solution if in your hand
        if (cardInfo?.inPlayersHand) {
          // Can't be in solution if known to be in any player's hand
          return !Object.values(cardInfo.inPlayersHand).some(hasIt => hasIt === true);
        }
        return true;
      }
      return true; // Player locations are always possible if not explicitly ruled out
    });
  });
  
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

  // Calculate probabilities for each world based on card distribution constraints
  const worldsWithProbabilities = allAssignments.map(assignment => {
    const world = {
      [suspect]: assignment[0],
      [weapon]: assignment[1],
      [room]: assignment[2],
    };
    
    // Calculate probability based on card distribution constraints
    const probability = calculateWorldProbability(world, cards, players, knowledge, debug);
    
    return {
      ...world,
      probability
    };
  }).filter(world => world.probability > 0); // Filter out impossible worlds

  // Normalize probabilities to sum to 1
  const totalProbability = worldsWithProbabilities.reduce((sum, world) => sum + world.probability, 0);
  if (totalProbability > 0) {
    worldsWithProbabilities.forEach(world => {
      world.probability = world.probability / totalProbability;
    });
  }
  
  if (debug) {
    console.log("Generated worlds with probabilities:", worldsWithProbabilities);
  }
  return worldsWithProbabilities;
}

// Calculate the probability of a world based on card distribution constraints
function calculateWorldProbability(
  world: { [key: string]: string },
  cards: string[],
  _players: string[],
  knowledge: any[],
  debug: boolean
): number {
  if (debug) {
    console.log("Calculating probability for world:", world);
  }

  // Check if this world is consistent with known constraints
  for (const card of cards) {
    const location = world[card];
    const cardInfo = knowledge.find(k => k.cardName === card);
    
    // If card is known to be in your hand, it can't be in solution or other players' hands
    if (cardInfo?.inYourHand && location !== "You") {
      if (debug) {
        console.log(`Card ${card} is in your hand but world places it in ${location}`);
      }
      return 0;
    }
    
    // If card is known to be in a specific player's hand, it can't be elsewhere
    if (cardInfo?.inPlayersHand) {
      for (const [player, hasIt] of Object.entries(cardInfo.inPlayersHand)) {
        if (hasIt === true && location !== player) {
          if (debug) {
            console.log(`Card ${card} is known to be in ${player}'s hand but world places it in ${location}`);
          }
          return 0;
        }
        if (hasIt === false && location === player) {
          if (debug) {
            console.log(`Card ${card} is known NOT to be in ${player}'s hand but world places it there`);
          }
          return 0;
        }
      }
    }
  }

  // Calculate probability based on likelyHas information
  let probability = 1;
  
  for (const card of cards) {
    const location = world[card];
    const cardInfo = knowledge.find(k => k.cardName === card);
    
    if (cardInfo && location !== "solution" && location !== "your_hand") {
      // Check if we have definitive knowledge about this card's location
      const definitiveLocation = cardInfo.inPlayersHand[location];
      
      if (definitiveLocation === true) {
        // Card is definitely with this player - boost probability significantly
        probability *= 4;
      } else if (definitiveLocation === false) {
        // Card is definitely NOT with this player - this world should be impossible
        return 0;
      } else {
        // No definitive knowledge, use likelyHas information
        if (cardInfo.likelyHas[location]) {
          probability *= 2; // Boost probability for likely cards
        } else {
          probability *= 0.5; // Reduce probability for unlikely cards
        }
      }
    }
  }
  
  if (debug) {
    console.log("World probability based on likelyHas:", probability);
  }
  return probability; // Will be normalized later
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
  // Filter out cards that are known to be in players' hands or your hand
  const suspects = knowledge
    .filter(card => {
      if (card.category !== "suspect") return false;
      if (card.inYourHand) return false; // Can't be in solution if in your hand
      if (card.inPlayersHand && Object.values(card.inPlayersHand).some(hasIt => hasIt === true)) {
        return false; // Can't be in solution if known to be in any player's hand
      }
      return getPossibleCardLocations(card.cardName, knowledge, players).includes("solution");
    })
    .map(card => card.cardName);
    
  const weapons = knowledge
    .filter(card => {
      if (card.category !== "weapon") return false;
      if (card.inYourHand) return false;
      if (card.inPlayersHand && Object.values(card.inPlayersHand).some(hasIt => hasIt === true)) {
        return false;
      }
      return getPossibleCardLocations(card.cardName, knowledge, players).includes("solution");
    })
    .map(card => card.cardName);
    
  const rooms = knowledge
    .filter(card => {
      if (card.category !== "room") return false;
      if (card.inYourHand) return false;
      if (card.inPlayersHand && Object.values(card.inPlayersHand).some(hasIt => hasIt === true)) {
        return false;
      }
      return getPossibleCardLocations(card.cardName, knowledge, players).includes("solution");
    })
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
