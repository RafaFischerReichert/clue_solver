/*
Clue/Cluedo Deduction Flow (Guess-Response-Knowledge Update)
------------------------------------------------------------
1. When a guess is made and a response is recorded (recordGuessResponse):
   - A tuple is added to the history for the player who showed a card (or a NO_RESPONSE entry if no one showed).
   - All other asked players are marked as not having any of the guessed cards.
   - The knowledge base is updated using updateKnowledgeWithDeductions.

2. updateKnowledgeWithDeductions applies deduction steps in this order:
   a) Tuple-based and direct deductions:
      - Analyze all tuples to deduce who definitely/likely/definitely-does-not have which cards.
      - Apply these deductions to the knowledge base.
   b) Full hand deduction (deduceFullHands):
      - If a player's hand is fully known, all other cards are marked as not in their hand.
   c) Solution deduction (checkForSolution):
      - If only one possible solution card remains in a category, or a card cannot be in any hand, it is marked as the solution.
      - All other cards in that category are marked as not in the solution.
   d) Advanced deduction:
      - If the solution for a category is known, and for another card in that category all but one player are known not to have it, the last possible player must have that card.

4. Special handling:
   - When the user is the shower, deduction for that tuple is skipped (no contradiction, no definite/likely has).

This order ensures that each deduction step feeds into the next, maximizing the information gained and keeping the knowledge base as up-to-date as possible.
*/
interface GamePlayProps {
  players: string[];
  yourHand: string[];
  allCards: {
    suspects: string[];
    weapons: string[];
    rooms: string[];
  };
  onGameEnd?: (solution: {
    suspect: string;
    weapon: string;
    room: string;
  }) => void;
}

// Generate knowledge base from players' hands:
// Table with one column per player, and one row per card.
export interface CardKnowledge {
  cardName: string;
  category: "suspect" | "weapon" | "room";
  inYourHand: boolean;
  inPlayersHand: Record<string, boolean | null>; // playerName -> boolean | null (null = unknown)
  likelyHas: Record<string, boolean>; // playerName -> boolean (true = likely has, false = default probability)
  inSolution: boolean | null; // null = unknown, true/false =
  eliminatedFromSolution: boolean;
}

export const initializeKnowledgeBase = (
  yourHand: string[],
  allCards: GamePlayProps["allCards"],
  players: string[],
  currentUser: string
): CardKnowledge[] => {
  // Cards in my hand should not be in the solution, and not in any other player's hand, and cards not in my hand should be marked as so.
  const knowledgeBase: CardKnowledge[] = [];

  // Check that allCards has all three keys: suspects, weapons, and rooms
  const requiredKeys = ["suspects", "weapons", "rooms"];
  const missingKeys = requiredKeys.filter(
    (key) => !(key in allCards) || !Array.isArray((allCards as any)[key])
  );
  if (missingKeys.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: allCards is missing the following keys: ${missingKeys.join(", ")}. Knowledge base will not be created.`
    );
    return [];
  }

  const allCardNames = [
    ...allCards.suspects,
    ...allCards.weapons,
    ...allCards.rooms,
  ];

  yourHand.forEach((card) => {
    if (
      !allCards.suspects.includes(card) &&
      !allCards.weapons.includes(card) &&
      !allCards.rooms.includes(card)
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        `Warning: Card "${card}" in yourHand is not present in allCards. Knowledge base will not be created.`
      );
      return [];
    }
  });

  if (!players || players.length === 0) {
    // eslint-disable-next-line no-console
    console.warn(
      "Warning: No players provided. Knowledge base will not be created."
    );
    return [];
  }

  allCardNames.forEach((cardName) => {
    const isInYourHand = yourHand.includes(cardName);
    const inPlayersHand: Record<string, boolean | null> = {};
    const likelyHas: Record<string, boolean> = {};
    players.forEach((player) => {
      if (player === currentUser) {
        inPlayersHand[player] = isInYourHand ? true : false;
        likelyHas[player] = false; // No likelihood for current user
      } else {
        // If the card is in your hand, no other player can have it
        inPlayersHand[player] = isInYourHand ? false : null;
        likelyHas[player] = false; // Start with default probability
      }
    });
    knowledgeBase.push({
      cardName,
      category: allCards.suspects.includes(cardName)
        ? "suspect"
        : allCards.weapons.includes(cardName)
        ? "weapon"
        : "room",
      inYourHand: isInYourHand,
      inPlayersHand,
      likelyHas,
      inSolution: null, // Unknown initially
      eliminatedFromSolution: isInYourHand, // Not eliminated initially
    });
  });

  return knowledgeBase;
};

// Deduces: If a player's full hand is known, all other cards must not be in that player's hand
export function deduceFullHands(
  knowledge: CardKnowledge[],
  handSizes: Record<string, number>
): CardKnowledge[] {
  // For each player, count how many cards are known to be in their hand
  const playerKnownCards: Record<string, string[]> = {};
  Object.keys(handSizes).forEach((player) => {
    playerKnownCards[player] = knowledge
      .filter((card) => card.inPlayersHand[player] === true)
      .map((card) => card.cardName);
  });
  // For each player whose hand is fully known, mark all other cards as not in their hand
  let updatedKnowledge = knowledge.map((card) => ({ ...card, inPlayersHand: { ...card.inPlayersHand } }));
  Object.entries(handSizes).forEach(([player, handSize]) => {
    if (playerKnownCards[player].length === handSize) {
      updatedKnowledge.forEach((card) => {
        if (
          !playerKnownCards[player].includes(card.cardName) &&
          card.inPlayersHand[player] !== false
        ) {
          card.inPlayersHand[player] = false;
        }
      });
    }
  });
  return updatedKnowledge;
}

export const markCardInPlayerHand = (
  knowledge: CardKnowledge[],
  cardName: string,
  playerName: string,
  handSizes?: Record<string, number>,
  currentUser?: string
): CardKnowledge[] => {
  // Check if the cardName exists in the knowledge base
  const cardExists = knowledge.some((card) => card.cardName === cardName);
  if (!cardExists) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: Tried to mark card "${cardName}" in player "${playerName}"'s hand, but that card does not exist in the game.`
    );
    return knowledge;
  }

  // Check if the playerName exists in the knowledge base (i.e., inPlayersHand keys)
  const playerExists = knowledge.some((card) =>
    Object.prototype.hasOwnProperty.call(card.inPlayersHand, playerName)
  );
  if (!playerExists) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: Tried to mark card "${cardName}" in player "${playerName}"'s hand, but that player does not exist in the game.`
    );
    return knowledge;
  }

  let updated = knowledge.map((card) => {
    if (card.cardName === cardName) {
      const updatedInPlayersHand = { ...card.inPlayersHand };
      // Mark the card as in this player's hand
      updatedInPlayersHand[playerName] = true;
      // Other players definitely don't have it
      Object.keys(updatedInPlayersHand).forEach((otherPlayer) => {
        if (otherPlayer !== playerName) {
          updatedInPlayersHand[otherPlayer] = false;
        }
      });
      // Preserve inYourHand: true for the current user if it was already true
      let newInYourHand = card.inYourHand;
      if (currentUser && playerName === currentUser && card.inYourHand) {
        newInYourHand = true;
      } else if (playerName === currentUser) {
        // If the current user is being marked as having the card, set inYourHand to true
        newInYourHand = true;
      } else if (card.inYourHand) {
        // If the card was already in your hand, don't unset it
        newInYourHand = true;
      } else {
        newInYourHand = false;
      }
      // Clear likelyHas for all players since we now have definitive knowledge
      const updatedLikelyHas = { ...card.likelyHas };
      Object.keys(updatedLikelyHas).forEach((player) => {
        updatedLikelyHas[player] = false;
      });
      
      return {
        ...card,
        inPlayersHand: updatedInPlayersHand,
        inSolution: false, // It can't be in the solution if it's in a player's hand
        eliminatedFromSolution: true, // It is eliminated from the solution
        inYourHand: newInYourHand,
        likelyHas: updatedLikelyHas,
      };
    }
    return card;
  });
  if (handSizes) {
    updated = deduceFullHands(updated, handSizes);
  }
  return updated;
};

export const markCardNotInPlayerHand = (
  knowledge: CardKnowledge[],
  cardName: string,
  playerName: string
): CardKnowledge[] => {
  // Check if the card exists in the knowledge base
  const cardExists = knowledge.some((card) => card.cardName === cardName);
  if (!cardExists) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: Tried to mark card "${cardName}" as not in player "${playerName}"'s hand, but that card does not exist in the game.`
    );
    return knowledge;
  }

  // Check if the playerName exists in the knowledge base (i.e., inPlayersHand keys)
  const playerExists = knowledge.some((card) =>
    Object.prototype.hasOwnProperty.call(card.inPlayersHand, playerName)
  );
  if (!playerExists) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: Tried to mark card "${cardName}" as not in player "${playerName}"'s hand, but that player does not exist in the game.`
    );
    return knowledge;
  }

  return knowledge.map((card) => {
    if (card.cardName === cardName) {
      // Clear likelyHas for this player since we now have definitive knowledge
      const updatedLikelyHas = { ...card.likelyHas };
      updatedLikelyHas[playerName] = false;
      
      return {
        ...card,
        inPlayersHand: {
          ...card.inPlayersHand,
          [playerName]: false,
        },
        likelyHas: updatedLikelyHas,
      };
    }
    return card;
  });
};

export const markCardLikelyInPlayerHand = (
  knowledge: CardKnowledge[],
  cardName: string,
  playerName: string
): CardKnowledge[] => {
  // Check if the card exists in the knowledge base
  const cardExists = knowledge.some((card) => card.cardName === cardName);
  if (!cardExists) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: Tried to mark card "${cardName}" as likely in player "${playerName}"'s hand, but that card does not exist in the game.`
    );
    return knowledge;
  }

  // Check if the player exists in the knowledge base
  const playerExists = knowledge.some((card) =>
    Object.prototype.hasOwnProperty.call(card.inPlayersHand, playerName)
  );
  if (!playerExists) {
    // eslint-disable-next-line no-console
    console.warn(
      `Warning: Tried to mark card "${cardName}" as likely in player "${playerName}"'s hand, but that player does not exist in the game.`
    );
    return knowledge;
  }

  return knowledge.map((card) => {
    if (card.cardName === cardName) {
      // Only mark as likely if we don't have definitive knowledge
      const definitiveKnowledge = card.inPlayersHand[playerName];
      if (definitiveKnowledge === null) {
        const updatedLikelyHas = { ...card.likelyHas };
        updatedLikelyHas[playerName] = true;
        return {
          ...card,
          likelyHas: updatedLikelyHas,
        };
      }
      // If we have definitive knowledge, don't override it with likelyHas
    }
    return card;
  });
};

export interface GuessTuple {
  suspect: string;
  weapon: string;
  room: string;
  guessedBy: string;
  shownBy: string | null; // null if no one showed
  askedPlayers: string[]; // players who were actually asked
  timestamp: number;
}

export interface PlayerCardTuples {
  player: string;
  tuples: GuessTuple[];
}

export const recordGuessResponse = (
  tuples: PlayerCardTuples[],
  guess: { suspect: string; weapon: string; room: string },
  shownBy: string | null,
  guessedBy: string,
  askedPlayers: string[],
  knowledge: CardKnowledge[],
  handSizes?: Record<string, number>,
  currentUser?: string
): { tuples: PlayerCardTuples[]; knowledge: CardKnowledge[] } => {
  const newTuple: GuessTuple = {
    ...guess,
    guessedBy,
    shownBy,
    askedPlayers,
    timestamp: Date.now(),
  };

  // Always get allPlayers for validation
  const allPlayers =
    knowledge.length > 0 ? Object.keys(knowledge[0].inPlayersHand) : [];

  // Validate guessedBy
  let invalid = false;
  if (!allPlayers.includes(guessedBy)) {
    console.warn(
      `Warning: Tried to record a guess response for player "${guessedBy}" (guessedBy), but that player does not exist in the game.`
    );
    invalid = true;
  }

  // Validate askedPlayers
  askedPlayers.forEach((player) => {
    if (!allPlayers.includes(player)) {
      console.warn(
        `Warning: Tried to record a guess response for asked player "${player}", but that player does not exist in the game.`
      );
      invalid = true;
    }
  });

  // Validate shownBy (if present)
  if (shownBy && !allPlayers.includes(shownBy)) {
    console.warn(
      `Warning: Tried to record a guess response for player "${shownBy}", but that player does not exist in the game.`
    );
    invalid = true;
  }

  // Validate that the guessed cards are valid (exist in the knowledge base)
  const allCardNames = knowledge.map((k) => k.cardName);
  ["suspect", "weapon", "room"].forEach((field) => {
    const card = guess[field as keyof typeof guess];
    if (!allCardNames.includes(card)) {
      console.warn(
        `Warning: Tried to record a guess response with invalid card "${card}" for field "${field}".`
      );
      invalid = true;
    }
  });

  if (invalid) {
    // If any player is invalid, do not record or update knowledge
    return { tuples, knowledge };
  }

  if (shownBy) {
    const playerIndex = tuples.findIndex((t) => t.player === shownBy);
    if (playerIndex !== -1) {
      tuples[playerIndex].tuples.push(newTuple);
    } else {
      tuples.push({ player: shownBy, tuples: [newTuple] });
    }
    // Mark all other askedPlayers as definitely not having any of the cards
    askedPlayers.forEach((player) => {
      if (player !== shownBy) {
        knowledge = markCardNotInPlayerHand(knowledge, guess.suspect, player);
        knowledge = markCardNotInPlayerHand(knowledge, guess.weapon, player);
        knowledge = markCardNotInPlayerHand(knowledge, guess.room, player);
      }
    });
  } else {
    // No one showed a card - create a special "no response" entry
    const noResponseIndex = tuples.findIndex((t) => t.player === "NO_RESPONSE");
    if (noResponseIndex !== -1) {
      tuples[noResponseIndex].tuples.push(newTuple);
    } else {
      tuples.push({ player: "NO_RESPONSE", tuples: [newTuple] });
    }
    askedPlayers.forEach((player) => {
      knowledge = markCardNotInPlayerHand(knowledge, guess.suspect, player);
      knowledge = markCardNotInPlayerHand(knowledge, guess.weapon, player);
      knowledge = markCardNotInPlayerHand(knowledge, guess.room, player);
    });
  }
  // After recording the tuple, analyze and update knowledge
  knowledge = updateKnowledgeWithDeductions(knowledge, tuples, currentUser, handSizes);
  return { tuples, knowledge };
};

export const updateKnowledgeWithDeductions = (
  knowledge: CardKnowledge[],
  playerTuples: PlayerCardTuples[],
  currentUser?: string,
  handSizes?: Record<string, number>
): CardKnowledge[] => {
  let updatedKnowledge = knowledge;

  // Tuple-based and direct deductions (formerly in analyzePlayerTuples)
  playerTuples.forEach((player) => {
    if (player.player === "NO_RESPONSE") {
      // All asked players in no-response tuples don't have any of the three cards
      player.tuples.forEach((tuple) => {
        tuple.askedPlayers.forEach((askedPlayer) => {
          updatedKnowledge = markCardNotInPlayerHand(updatedKnowledge, tuple.suspect, askedPlayer);
          updatedKnowledge = markCardNotInPlayerHand(updatedKnowledge, tuple.weapon, askedPlayer);
          updatedKnowledge = markCardNotInPlayerHand(updatedKnowledge, tuple.room, askedPlayer);
        });
      });
    } else {
      player.tuples.forEach((tuple) => {
        if (tuple.shownBy === player.player) {
          // If the shower is the current user, skip deduction for this tuple
          if (currentUser && player.player === currentUser) {
            return;
          }
          const threeCards = [tuple.suspect, tuple.weapon, tuple.room];
          // Gather knowledge for this player and these cards
          const cardStates = threeCards.map((cardName) => {
            const card = updatedKnowledge.find((k) => k.cardName === cardName);
            // Defensive: treat cards in your hand as definitely not in the showing player's hand
            if (card) {
              if (card.inYourHand) return false;
              return card.inPlayersHand[player.player];
            }
            return null;
          });
          // If the player is known to have any of the cards, skip deduction for this tuple
          if (cardStates.some((state) => state === true)) {
            return;
          }
          // Count how many are definitely not in hand
          const dontHaveIndices = cardStates
            .map((state, idx) => (state === false ? idx : -1))
            .filter((idx) => idx !== -1);
          const unknownIndices = cardStates
            .map((state, idx) => (state === null ? idx : -1))
            .filter((idx) => idx !== -1);
          if (dontHaveIndices.length === 0 && unknownIndices.length === 3) {
            // All three are unknown: mark all as likelyHas for this player
            threeCards.forEach((cardName) => {
              updatedKnowledge = markCardLikelyInPlayerHand(updatedKnowledge, cardName, player.player);
            });
          } else if (dontHaveIndices.length === 1 && unknownIndices.length === 2) {
            // One is ruled out, mark the other two as likelyHas for this player
            unknownIndices.forEach((idx) => {
              const cardName = threeCards[idx];
              updatedKnowledge = markCardLikelyInPlayerHand(updatedKnowledge, cardName, player.player);
            });
          } else if (dontHaveIndices.length === 2 && unknownIndices.length === 1) {
            // Two are ruled out, last is definitelyHas
            const idx = unknownIndices[0];
            const cardName = threeCards[idx];
            updatedKnowledge = markCardInPlayerHand(updatedKnowledge, cardName, player.player);
          } else if (dontHaveIndices.length === 3) {
            // Contradiction: all three are ruled out
            if (!currentUser || player.player !== currentUser) {
              // eslint-disable-next-line no-console
              console.warn(
                `Contradiction detected: Player "${player.player}" is marked as not having any of the cards (${threeCards.join(", ")}) in this tuple. This should not happen.`
              );
              if (typeof window !== 'undefined' && typeof window.alert === 'function') {
                window.alert(`Contradiction detected: Player "${player.player}" is marked as not having any of the cards (${threeCards.join(", ")}) in this tuple. This should not happen.`);
              }
            }
          }
        }
      });
    }
  });

  // Always deduce full hands after basic deductions
  if (handSizes) {
    updatedKnowledge = deduceFullHands(updatedKnowledge, handSizes);
  }

  // Always check for solution after hand size deduction - this way, we might get more locations crossed out
  updatedKnowledge = checkForSolution(updatedKnowledge, handSizes);

  // Advanced deduction: If the solution for a category is known (card A),
  // and all users but one are known not to have card B in that category,
  // the last user must have card B.
  // For each category, check if a solution card is known
  const categories = ["suspect", "weapon", "room"];
  categories.forEach((category) => {
    const solutionCard = updatedKnowledge.find(
      (c) => c.category === category && c.inSolution === true
    );
    if (solutionCard) {
      // For all other cards in this category (not the solution)
      updatedKnowledge
        .filter((c) => c.category === category && c.cardName !== solutionCard.cardName)
        .forEach((card) => {
          // Find all players who are not known NOT to have this card
          const possiblePlayers = Object.entries(card.inPlayersHand)
            .filter(([, hasIt]) => hasIt !== false)
            .map(([player]) => player);
          if (possiblePlayers.length === 1) {
            // Only one player could have this card, so they must have it
            updatedKnowledge = markCardInPlayerHand(
              updatedKnowledge,
              card.cardName,
              possiblePlayers[0]
            );
          }
        });
    }
  });

  return updatedKnowledge;
};

export const checkForSolution = (
  knowledge: CardKnowledge[],
  handSizes?: Record<string, number>
): CardKnowledge[] => {
  console.log("=== checkForSolution called ===");
  console.log("Knowledge:", knowledge);
  
  // First, find all cards that should be marked as inSolution: true
  const solutionCards: { cardName: string; category: string }[] = [];
  
  // Group cards by category
  const cardsByCategory = knowledge.reduce((acc, card) => {
    if (!acc[card.category]) {
      acc[card.category] = [];
    }
    acc[card.category].push(card);
    return acc;
  }, {} as Record<string, CardKnowledge[]>);
  
  console.log("Cards by category:", cardsByCategory);
  
  // Check each category
  Object.entries(cardsByCategory).forEach(([category, cards]) => {
    console.log(`\nChecking category: ${category}`);
    console.log(`Cards in category:`, cards.map(c => c.cardName));
    
    // Count how many cards in this category are known to be in players' hands
    const cardsInPlayersHands = cards.filter(card => {
      // Get all players except the current user
      const otherPlayers = Object.keys(card.inPlayersHand).filter(player => 
        card.inPlayersHand[player] !== true
      );
      // Check if any other player has this card
      return otherPlayers.some(player => card.inPlayersHand[player] === true);
    });
    
    console.log(`Cards known to be in players' hands:`, cardsInPlayersHands.map(c => c.cardName));
    
    // If all cards except one are known to be in players' hands, the remaining one must be in the solution
    // Only apply this logic if there are multiple cards in the category
    if (cards.length > 1 && cardsInPlayersHands.length === cards.length - 1) {
      const remainingCard = cards.find(card => {
        const otherPlayers = Object.keys(card.inPlayersHand).filter(player => 
          card.inPlayersHand[player] !== true
        );
        return !otherPlayers.some(player => card.inPlayersHand[player] === true);
      });
      
      if (remainingCard && !remainingCard.inYourHand) {
        console.log(`  => Marking ${remainingCard.cardName} as solution card (all others in category are in players' hands)`);
        remainingCard.inSolution = true;
        remainingCard.eliminatedFromSolution = false;
        solutionCards.push({ cardName: remainingCard.cardName, category: remainingCard.category });
      }
    }
    
    // Also check the original logic: if a card is not in your hand and no other player has it
    cards.forEach(card => {
      console.log(`\nChecking card: ${card.cardName}`);
      console.log(`  inYourHand: ${card.inYourHand}`);
      console.log(`  inPlayersHand:`, card.inPlayersHand);
      // Get all players except the current user (who we know can't have solution cards)
      const otherPlayers = Object.keys(card.inPlayersHand).filter(player => 
        card.inPlayersHand[player] !== true // Exclude current user (who has inYourHand cards marked as true)
      );
      console.log(`  Other players (excluding current user):`, otherPlayers);
      console.log(`  Other players' card status:`, otherPlayers.map(player => ({ player, hasCard: card.inPlayersHand[player] })));
      console.log(`  All other players don't have it:`, otherPlayers.every(player => card.inPlayersHand[player] === false));
      const isInAnyPlayersHand = Object.values(card.inPlayersHand).some(v => v === true);
      if (
        !card.inYourHand &&
        !isInAnyPlayersHand &&
        otherPlayers.every(player => card.inPlayersHand[player] === false)
      ) {
        console.log(`  => Marking ${card.cardName} as solution card (no one has it)`);
        card.inSolution = true;
        card.eliminatedFromSolution = false;
        solutionCards.push({ cardName: card.cardName, category: card.category });
      } else {
        console.log(`  => NOT marking ${card.cardName} as solution card`);
      }
    });
  });
  
  console.log("Solution cards found:", solutionCards);
  
  // For each found solution card, mark all other cards in the same category as not in the solution
  // AND mark the solution card as not in any player's hand
  solutionCards.forEach(({ cardName, category }) => {
    knowledge.forEach(card => {
      if (card.category === category && card.cardName !== cardName) {
        card.inSolution = false;
        card.eliminatedFromSolution = true;
      } else if (card.cardName === cardName) {
        // Mark the solution card as not in any player's hand
        Object.keys(card.inPlayersHand).forEach(player => {
          card.inPlayersHand[player] = false;
        });
        // Clear any likelyHas entries for this card
        Object.keys(card.likelyHas).forEach(player => {
          card.likelyHas[player] = false;
        });
      }
    });
  });
  
  console.log("Final knowledge:", knowledge);
  console.log("=== checkForSolution finished ===");
  
  if (handSizes) {
    knowledge = deduceFullHands(knowledge, handSizes);
  }
  return knowledge;
};

// Utility: Given number of players, return possible hand sizes (sorted, smallest first)
// All combinations must add up to exactly 18 cards (21 total - 3 in solution)
export function getPossibleHandSizes(numPlayers: number): number[] {
  if (numPlayers === 3) return [6]; // 3 * 6 = 18
  if (numPlayers === 4) return [4, 5]; // 4 * 4 = 16, 4 * 5 = 20 - but we need combinations that sum to 18
  if (numPlayers === 5) return [3, 4]; // 5 * 3 = 15, 5 * 4 = 20 - but we need combinations that sum to 18
  if (numPlayers === 6) return [3]; // 6 * 3 = 18
  throw new Error("Unsupported number of players");
}

// New function: Get all valid hand size combinations that sum to exactly 18 cards
export function getValidHandSizeCombinations(numPlayers: number): number[][] {
  const possibleSizes = getPossibleHandSizes(numPlayers);
  const validCombinations: number[][] = [];
  
  // Generate all combinations of hand sizes and check if they sum to 18
  function generateCombinations(current: number[], remainingPlayers: number): void {
    if (remainingPlayers === 0) {
      const total = current.reduce((sum, size) => sum + size, 0);
      if (total === 18) {
        validCombinations.push([...current]);
      }
      return;
    }
    
    for (const size of possibleSizes) {
      generateCombinations([...current, size], remainingPlayers - 1);
    }
  }
  
  generateCombinations([], numPlayers);
  return validCombinations;
}

// New function: Check if a specific hand size combination is valid
export function isValidHandSizeCombination(handSizes: Record<string, number>): boolean {
  const totalCards = Object.values(handSizes).reduce((sum, size) => sum + size, 0);
  return totalCards === 18;
}

// Utility: Given a card name, knowledge base, and players, return all possible locations (players or 'solution') where the card could be, consistent with current knowledge.
export function getPossibleCardLocations(
  cardName: string,
  knowledge: CardKnowledge[],
  players: string[]
): string[] {
  const cardInfo = knowledge.find((k) => k.cardName === cardName);
  // If the card is known to be in the solution, return only ['solution']
  if (cardInfo && cardInfo.inSolution === true) {
    return ["solution"];
  }
  const locations: string[] = [];
  // Players
  for (const player of players) {
    if (cardInfo && cardInfo.inPlayersHand) {
      if (cardInfo.inPlayersHand[player] === false) continue;
    }
    locations.push(player);
  }
  // Solution
  if (cardInfo) {
    if (cardInfo.inSolution !== false) {
      locations.push("solution");
    }
  } else {
    locations.push("solution");
  }
  return locations;
}
