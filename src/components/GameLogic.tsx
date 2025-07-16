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
    players.forEach((player) => {
      if (player === currentUser) {
        inPlayersHand[player] = isInYourHand ? true : false;
      } else {
        // If the card is in your hand, no other player can have it
        inPlayersHand[player] = isInYourHand ? false : null;
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
      inSolution: null, // Unknown initially
      eliminatedFromSolution: isInYourHand, // Not eliminated initially
    });
  });

  return knowledgeBase;
};

export const markCardInPlayerHand = (
  knowledge: CardKnowledge[],
  cardName: string,
  playerName: string
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

  return knowledge.map((card) => {
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

      return {
        ...card,
        inPlayersHand: updatedInPlayersHand,
        inSolution: false, // It can't be in the solution if it's in a player's hand
        eliminatedFromSolution: true, // It is eliminated from the solution
      };
    }
    return card;
  });
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
      return {
        ...card,
        inPlayersHand: {
          ...card.inPlayersHand,
          [playerName]: false,
        },
      };
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
  knowledge: CardKnowledge[]
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
  knowledge = updateKnowledgeWithDeductions(knowledge, tuples);
  return { tuples, knowledge };
};

export const analyzePlayerTuples = (
  tuples: PlayerCardTuples[],
  knowledge: CardKnowledge[]
): {
  likelyHas: string[];
  definitelyHas: { playerName: string; cardName: string }[];
  definitelyDoesNotHave: { playerName: string; cardName: string }[];
} => {
  const likelyHas: string[] = [];
  const definitelyHas: { playerName: string; cardName: string }[] = [];
  const definitelyDoesNotHave: { playerName: string; cardName: string }[] = [];

  tuples.forEach((player) => {
    if (player.player === "NO_RESPONSE") {
      // All asked players in no-response tuples don't have any of the three cards
      player.tuples.forEach((tuple) => {
        tuple.askedPlayers.forEach((askedPlayer) => {
          definitelyDoesNotHave.push(
            { playerName: askedPlayer, cardName: tuple.suspect },
            { playerName: askedPlayer, cardName: tuple.weapon },
            { playerName: askedPlayer, cardName: tuple.room }
          );
        });
      });
    } else {
      player.tuples.forEach((tuple) => {
        if (tuple.shownBy === player.player) {
          const threeCards = [tuple.suspect, tuple.weapon, tuple.room];
          // Gather knowledge for this player and these cards
          const cardStates = threeCards.map((cardName) => {
            const card = knowledge.find((k) => k.cardName === cardName);
            return card ? card.inPlayersHand[player.player] : null;
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
            // All three are unknown: all are likelyHas
            threeCards.forEach((cardName) => {
              if (
                !definitelyHas.some((d) => d.playerName === player.player && d.cardName === cardName) &&
                !definitelyDoesNotHave.some((d) => d.playerName === player.player && d.cardName === cardName) &&
                !likelyHas.includes(cardName)
              ) {
                likelyHas.push(cardName);
              }
            });
          } else if (dontHaveIndices.length === 1 && unknownIndices.length === 2) {
            // One is ruled out, other two are likelyHas
            unknownIndices.forEach((idx) => {
              const cardName = threeCards[idx];
              if (
                !definitelyHas.some((d) => d.playerName === player.player && d.cardName === cardName) &&
                !definitelyDoesNotHave.some((d) => d.playerName === player.player && d.cardName === cardName) &&
                !likelyHas.includes(cardName)
              ) {
                likelyHas.push(cardName);
              }
            });
          } else if (dontHaveIndices.length === 2 && unknownIndices.length === 1) {
            // Two are ruled out, last is definitelyHas
            const idx = unknownIndices[0];
            const cardName = threeCards[idx];
            if (!definitelyHas.some((d) => d.playerName === player.player && d.cardName === cardName)) {
              definitelyHas.push({ playerName: player.player, cardName });
            }
          } else if (dontHaveIndices.length === 3) {
            // Contradiction: all three are ruled out
            // eslint-disable-next-line no-console
            console.warn(
              `Contradiction detected: Player "${player.player}" is marked as not having any of the cards (${threeCards.join(", ")}) in this tuple. This should not happen.`
            );
            if (typeof window !== 'undefined' && typeof window.alert === 'function') {
              window.alert(`Contradiction detected: Player "${player.player}" is marked as not having any of the cards (${threeCards.join(", ")}) in this tuple. This should not happen.`);
            }
          }
        }
      });
    }
  });

  return { likelyHas, definitelyHas, definitelyDoesNotHave };
};

export const updatedKnowledgeBaseFromTuples = (
  knowledge: CardKnowledge[],
  playerTuples: PlayerCardTuples[]
): CardKnowledge[] => {
  const analysis = analyzePlayerTuples(playerTuples, knowledge);
  let updatedKnowledge = knowledge;

  // Apply definite has
  analysis.definitelyHas.forEach(({ playerName, cardName }) => {
    updatedKnowledge = markCardInPlayerHand(
      updatedKnowledge,
      cardName,
      playerName
    );
  });

  // Apply definite does not have
  analysis.definitelyDoesNotHave.forEach(({ playerName, cardName }) => {
    updatedKnowledge = markCardNotInPlayerHand(
      updatedKnowledge,
      cardName,
      playerName
    );
  });

  return updatedKnowledge;
};

export const updateKnowledgeWithDeductions = (
  knowledge: CardKnowledge[],
  playerTuples: PlayerCardTuples[]
): CardKnowledge[] => {
  const analysis = analyzePlayerTuples(playerTuples, knowledge);
  let updatedKnowledge = knowledge;
  // Apply definite has
  analysis.definitelyHas.forEach(({ playerName, cardName }) => {
    updatedKnowledge = markCardInPlayerHand(updatedKnowledge, cardName, playerName);
  });
  // Apply definite does not have
  analysis.definitelyDoesNotHave.forEach(({ playerName, cardName }) => {
    updatedKnowledge = markCardNotInPlayerHand(updatedKnowledge, cardName, playerName);
  });
  return updatedKnowledge;
};

export const checkForSolution = (
  knowledge: CardKnowledge[]
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
    if (cardsInPlayersHands.length === cards.length - 1) {
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
      
      if (
        !card.inYourHand &&
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
  solutionCards.forEach(({ cardName, category }) => {
    knowledge.forEach(card => {
      if (card.category === category && card.cardName !== cardName) {
        card.inSolution = false;
        card.eliminatedFromSolution = true;
      }
    });
  });
  
  console.log("Final knowledge:", knowledge);
  console.log("=== checkForSolution finished ===");
  
  return knowledge;
};

// Utility: Given number of players, return possible hand sizes (sorted, smallest first)
export function getPossibleHandSizes(numPlayers: number): number[] {
  if (numPlayers === 3) return [6];
  if (numPlayers === 4) return [4, 5];
  if (numPlayers === 5) return [3, 4];
  if (numPlayers === 6) return [3];
  throw new Error("Unsupported number of players");
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
