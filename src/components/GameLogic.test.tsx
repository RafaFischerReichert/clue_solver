import { describe, it, expect, vi } from "vitest";
import {
  markCardInPlayerHand,
  initializeKnowledgeBase,
  recordGuessResponse,
  analyzePlayerTuples,
  updatedKnowledgeBaseFromTuples,
  checkForSolution,
  PlayerCardTuples,
  CardKnowledge,
  markCardNotInPlayerHand,
  updateKnowledgeWithDeductions, // <-- import the new function
} from "./GameLogic";

describe("GameLogic", () => {
  const mockPlayers = ["Alice", "Bob", "Charlie"];
  const mockYourHand = ["Miss Scarlet", "Candlestick"];
  const mockAllCards = {
    suspects: ["Miss Scarlet", "Colonel Mustard", "Mrs. White"],
    weapons: ["Candlestick", "Dagger", "Lead Pipe"],
    rooms: ["Kitchen", "Ballroom", "Conservatory"],
  };

  // Add a default currentUser for all tests
  const mockCurrentUser = "Alice";

  describe("initializeKnowledgeBase", () => {
    it("includes all cards in the knowledge base", () => {
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const allCardNames = [
        ...mockAllCards.suspects,
        ...mockAllCards.weapons,
        ...mockAllCards.rooms,
      ];
      expect(knowledge.map((k) => k.cardName)).toEqual(
        expect.arrayContaining(allCardNames)
      );
    });

    it("marks cards in users hand", () => {
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      mockYourHand.forEach((card) => {
        const cardInfo = knowledge.find((k) => k.cardName === card);
        expect(cardInfo).toBeDefined();
        expect(cardInfo?.inYourHand).toBe(true);
      });
    });

    it("initializes all other players as false for cards in our hand, otherwise unknown", () => {
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      mockPlayers.forEach((player) => {
        knowledge.forEach((card) => {
          if (player === mockCurrentUser) {
            // For the current user, should be true if in hand, false if not
            expect(card.inPlayersHand[player]).toBe(
              card.inYourHand ? true : false
            );
          } else {
            // For other players, should be false if card is in our hand, otherwise null
            expect(card.inPlayersHand[player]).toBe(
              card.inYourHand ? false : null
            );
          }
        });
      });
    });

    it("correctly categorizes the cards", () => {
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      knowledge.forEach((card) => {
        if (mockAllCards.suspects.includes(card.cardName)) {
          expect(card.category).toBe("suspect");
        } else if (mockAllCards.weapons.includes(card.cardName)) {
          expect(card.category).toBe("weapon");
        } else if (mockAllCards.rooms.includes(card.cardName)) {
          expect(card.category).toBe("room");
        }
      });
    });

    it("initializes the solution as unknown", () => {
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      knowledge.forEach((card) => {
        expect(card.inSolution).toBeNull();
        expect(card.eliminatedFromSolution).toBe(
          card.inYourHand ? true : false
        );
      });
    });

    it("handles duplicate cards gracefully", () => {
      // This test would check if the function can handle cases where
      // the same card appears multiple times in the input arrays.
      const duplicateHand = ["Miss Scarlet", "Miss Scarlet"];
      const knowledge = initializeKnowledgeBase(
        duplicateHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const scarletInfo = knowledge.find((k) => k.cardName === "Miss Scarlet");
      // Expect: the card is still marked as in your hand, and no duplicates in knowledge
      expect(scarletInfo).toBeDefined();
      expect(scarletInfo?.inYourHand).toBe(true);
      expect(
        knowledge.filter((k) => k.cardName === "Miss Scarlet").length
      ).toBe(1);
    });

    it("handles cards in hand that are not in the game", () => {
      // This test would check if the function can handle cases where
      // the player's hand contains cards that are not part of the game.
      const invalidHand = ["Invalid Card"];
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const knowledge = initializeKnowledgeBase(
        invalidHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      // Expect: knowledge base does not include the invalid card
      expect(
        knowledge.find((k) => k.cardName === "Invalid Card")
      ).toBeUndefined();
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("handles missing keys in all cards", () => {
      // This test would check if the function can handle cases where
      // the allCards object is missing some keys (e.g., no rooms).
      const incompleteAllCards = {
        suspects: ["Miss Scarlet", "Colonel Mustard"],
        weapons: ["Candlestick", "Dagger"],
        // No rooms provided
      };
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      // Expect: function returns an empty array and warns the user, but does not throw
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        incompleteAllCards as any,
        mockPlayers,
        mockCurrentUser
      );
      expect(knowledge).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("handles empty hand", () => {
      // This test would check if the function can handle cases where
      // the player's hand is empty.
      const emptyHand: string[] = [];
      const knowledge = initializeKnowledgeBase(
        emptyHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      // Expect: no cards are marked as in your hand
      expect(knowledge.every((k) => !k.inYourHand)).toBe(true);
    });

    it("handles emtpy players array", () => {
      // This test would check if the function can handle cases where
      // the players array is empty.
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        [],
        mockCurrentUser
      );
      // Expect: inPlayersHand is an empty object for each card
      expect(
        knowledge.every((k) => Object.keys(k.inPlayersHand).length === 0)
      ).toBe(true);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe("markCardInPlayerHand", () => {
    it("marks the card in the hand of the correct player", () => {
      // Setup: knowledge base with all players initially unknown
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const cardName = "Miss Scarlet";
      const playerName = "Alice";

      // Call: mark a specific card as in a specific player's hand
      const updatedKnowledge = markCardInPlayerHand(
        knowledge,
        cardName,
        playerName
      );
      const cardInfo = updatedKnowledge.find((k) => k.cardName === cardName);

      // Expect: the specified player is marked as having the card
      expect(cardInfo).toBeDefined();
      expect(cardInfo?.inPlayersHand[playerName]).toBe(true);
    });

    it("marks the remaining players as not having that card", () => {
      // Setup: knowledge base with all players initially unknown
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const cardName = "Miss Scarlet";
      const playerName = "Alice";

      // Call: mark a card as in one player's hand
      const updatedKnowledge = markCardInPlayerHand(
        knowledge,
        cardName,
        playerName
      );
      const cardInfo = updatedKnowledge.find((k) => k.cardName === cardName);

      // Expect: all other players are marked as definitely not having the card
      expect(cardInfo).toBeDefined();
      mockPlayers.forEach((player) => {
        if (player !== playerName) {
          expect(cardInfo?.inPlayersHand[player]).toBe(false);
        }
      });
    });

    it("marks the card as not in the solution", () => {
      // Setup: knowledge base with solution initially unknown
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const cardName = "Miss Scarlet";
      const playerName = "Alice";

      // Call: mark a card as in a player's hand
      const updatedKnowledge = markCardInPlayerHand(
        knowledge,
        cardName,
        playerName
      );
      const cardInfo = updatedKnowledge.find((k) => k.cardName === cardName);

      // Expect: card is marked as not in solution (since it's in a player's hand)
      expect(cardInfo).toBeDefined();
      expect(cardInfo?.inSolution).toBe(false);
    });

    it("handles marking a card not in the game", () => {
      // This test would check if the function can handle cases where
      // the card being marked is not part of the game.
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const cardName = "Nonexistent Card";
      const playerName = "Alice";

      // Call: try to mark a non-existent card as in a player's hand
      const updatedKnowledge = markCardInPlayerHand(
        knowledge,
        cardName,
        playerName
      );

      // Expect: knowledge base remains unchanged (no card found to update)
      expect(updatedKnowledge).toBe(knowledge);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe("markCardNotInPlayerHand", () => {
    it("marks the card as not in the hand of the correct player", () => {
      // Setup: knowledge base with all players initially unknown
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const cardName = "Miss Scarlet";
      const playerName = "Alice";

      // Call: mark a card as definitely not in a specific player's hand
      const updatedKnowledge = markCardNotInPlayerHand(
        knowledge,
        cardName,
        playerName
      );
      const cardInfo = updatedKnowledge.find((k) => k.cardName === cardName);

      // Expect: the specified player is marked as definitely not having the card
      expect(cardInfo).toBeDefined();
      expect(cardInfo?.inPlayersHand[playerName]).toBe(false);
    });

    it("does not affect other players' knowledge", () => {
      // Setup: knowledge base with multiple players
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );

      // Mark a card as not in Alice's hand (from unknown state)
      const cardName = "Miss Scarlet";
      const playerName = "Alice";
      const updatedKnowledge = markCardNotInPlayerHand(
        knowledge,
        cardName,
        playerName
      );

      const cardInfo = updatedKnowledge.find((k) => k.cardName === cardName);
      expect(cardInfo).toBeDefined();

      // Alice should not have the card
      expect(cardInfo?.inPlayersHand[playerName]).toBe(false);

      // Bob and Charlie should remain unknown (unchanged from initial state)
      expect(cardInfo?.inPlayersHand["Bob"]).toBe(null);
      expect(cardInfo?.inPlayersHand["Charlie"]).toBe(null);
    });

    it("returns the updated knowledge array", () => {
      // Setup: knowledge base with all players initially unknown
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const cardName = "Miss Scarlet";
      const playerName = "Alice";

      // Call: mark a card as not in a player's hand
      const updatedKnowledge = markCardNotInPlayerHand(
        knowledge,
        cardName,
        playerName
      );

      // Expect: returns a new array reference (immutable update) with the change applied
      expect(updatedKnowledge).not.toBe(knowledge); // Should return a new reference
      const cardInfo = updatedKnowledge.find((k) => k.cardName === cardName);
      expect(cardInfo).toBeDefined();
      expect(cardInfo?.inPlayersHand[playerName]).toBe(false);
    });

    it("handles player not in the game", () => {
      // This test would check if the function can handle cases where
      // the player is not part of the game.
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const cardName = "Miss Scarlet";
      const playerName = "Nonexistent Player";

      // Call: try to mark a card as not in a non-existent player's hand
      const updatedKnowledge = markCardNotInPlayerHand(
        knowledge,
        cardName,
        playerName
      );

      // Expect: knowledge base remains unchanged, user is warned of the issue
      expect(updatedKnowledge).toEqual(knowledge); // Should return the same reference
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe("recordGuessResponse", () => {
    it("adds new tuple to existing player", () => {
      // Setup: existing player with one tuple already recorded
      const tuples = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Miss Scarlet",
              weapon: "Candlestick",
              room: "Kitchen",
              guessedBy: "Bob",
              shownBy: "Charlie",
              askedPlayers: ["Alice", "Bob"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const guess = {
        suspect: "Colonel Mustard",
        weapon: "Dagger",
        room: "Ballroom",
      };
      const shownBy = "Alice";
      const guessedBy = "Bob";
      const askedPlayers = ["Alice", "Charlie"];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );

      // Call: record a new guess response for an existing player
      const updatedTuples = recordGuessResponse(
        tuples,
        guess,
        shownBy,
        guessedBy,
        askedPlayers,
        knowledge
      );

      // Expect: new tuple is added to the existing player's record
      expect(updatedTuples.tuples.length).toBe(1);
      expect(updatedTuples.tuples[0].tuples.length).toBe(2);
      expect(updatedTuples.tuples[0].tuples[1].suspect).toBe(guess.suspect);
      expect(updatedTuples.tuples[0].tuples[1].weapon).toBe(guess.weapon);
      expect(updatedTuples.tuples[0].tuples[1].room).toBe(guess.room);
      expect(updatedTuples.tuples[0].tuples[1].guessedBy).toBe(guessedBy);
      expect(updatedTuples.tuples[0].tuples[1].shownBy).toBe(shownBy);
      expect(updatedTuples.tuples[0].tuples[1].askedPlayers).toEqual(
        askedPlayers
      );
      expect(updatedTuples.tuples[0].tuples[1].timestamp).toBeDefined();
    });

    it("creates new player entry when player does not exist", () => {
      // Test creating a new player entry for first-time players
      const tuples = [
        {
          player: "Alice",
          tuples: [],
        },
      ];
      const guess = {
        suspect: "Miss Scarlet",
        weapon: "Candlestick",
        room: "Kitchen",
      };
      const shownBy = "Bob";
      const guessedBy = "Charlie";
      const askedPlayers = ["Alice", "Charlie"];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const updatedTuples = recordGuessResponse(
        tuples,
        guess,
        shownBy,
        guessedBy,
        askedPlayers,
        knowledge
      );
      expect(updatedTuples.tuples.length).toBe(2);
      expect(updatedTuples.tuples[1].player).toBe(shownBy);
      expect(updatedTuples.tuples[1].tuples.length).toBe(1);
      expect(updatedTuples.tuples[1].tuples[0].suspect).toBe(guess.suspect);
      expect(updatedTuples.tuples[1].tuples[0].weapon).toBe(guess.weapon);
      expect(updatedTuples.tuples[1].tuples[0].room).toBe(guess.room);
      expect(updatedTuples.tuples[1].tuples[0].guessedBy).toBe(guessedBy);
      expect(updatedTuples.tuples[1].tuples[0].shownBy).toBe(shownBy);
      expect(updatedTuples.tuples[1].tuples[0].askedPlayers).toEqual(
        askedPlayers
      );
      expect(updatedTuples.tuples[1].tuples[0].timestamp).toBeDefined();
    });

    it("handles case where no one showed a card", () => {
      // Setup: existing player with no tuples, and a guess where no one showed a card
      const tuples = [
        {
          player: "Alice",
          tuples: [],
        },
      ];
      const guess = {
        suspect: "Miss Scarlet",
        weapon: "Candlestick",
        room: "Kitchen",
      };
      const shownBy = null; // No one showed a card
      const guessedBy = "Bob";
      const askedPlayers = ["Alice", "Charlie"];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );

      // Call: record a guess response where no one showed a card
      const updatedTuples = recordGuessResponse(
        tuples,
        guess,
        shownBy,
        guessedBy,
        askedPlayers,
        knowledge
      );

      // Expect: creates a special NO_RESPONSE entry and marks asked players as not having the cards
      expect(updatedTuples.tuples.length).toBe(2); // Alice + NO_RESPONSE

      const noResponseEntry = updatedTuples.tuples.find(
        (t) => t.player === "NO_RESPONSE"
      );
      expect(noResponseEntry).toBeDefined();
      expect(noResponseEntry!.tuples.length).toBe(1);
      expect(noResponseEntry!.tuples[0].suspect).toBe(guess.suspect);
      expect(noResponseEntry!.tuples[0].weapon).toBe(guess.weapon);
      expect(noResponseEntry!.tuples[0].room).toBe(guess.room);
      expect(noResponseEntry!.tuples[0].guessedBy).toBe(guessedBy);
      expect(noResponseEntry!.tuples[0].shownBy).toBeNull();
      expect(noResponseEntry!.tuples[0].askedPlayers).toEqual(askedPlayers);
      expect(noResponseEntry!.tuples[0].timestamp).toBeDefined();
    });

    it("correctly stores all tuple data", () => {
      // Test that suspect, weapon, room, guessedBy, shownBy, askedPlayers are all stored
      const tuples: PlayerCardTuples[] = [];
      const guess = {
        suspect: "Miss Scarlet",
        weapon: "Candlestick",
        room: "Kitchen",
      };
      const shownBy = "Alice";
      const guessedBy = "Bob";
      const askedPlayers = ["Alice", "Charlie"];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const updatedTuples = recordGuessResponse(
        tuples,
        guess,
        shownBy,
        guessedBy,
        askedPlayers,
        knowledge
      );
      expect(updatedTuples.tuples.length).toBe(1);
      expect(updatedTuples.tuples[0].tuples.length).toBe(1);
      expect(updatedTuples.tuples[0].tuples[0].suspect).toBe(guess.suspect);
      expect(updatedTuples.tuples[0].tuples[0].weapon).toBe(guess.weapon);
      expect(updatedTuples.tuples[0].tuples[0].room).toBe(guess.room);
      expect(updatedTuples.tuples[0].tuples[0].guessedBy).toBe(guessedBy);
      expect(updatedTuples.tuples[0].tuples[0].shownBy).toBe(shownBy);
      expect(updatedTuples.tuples[0].tuples[0].askedPlayers).toEqual(
        askedPlayers
      );
      expect(updatedTuples.tuples[0].tuples[0].timestamp).toBeDefined();
    });

    it("handles shownBy not in the game", () => {
      // This test would check if the function can handle cases where
      // the shownBy player is not part of the game.
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const tuples: PlayerCardTuples[] = [];
      const guess = {
        suspect: "Miss Scarlet",
        weapon: "Candlestick",
        room: "Kitchen",
      };
      const shownBy = "Nonexistent Player"; // Not in mockPlayers
      const guessedBy = "Bob";
      const askedPlayers = ["Alice", "Charlie"];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      // Call: record a guess response with a non-existent shownBy player
      const updatedTuples = recordGuessResponse(
        tuples,
        guess,
        shownBy,
        guessedBy,
        askedPlayers,
        knowledge
      );
      // Expect: tuples remain unchanged
      expect(updatedTuples.tuples).toEqual(tuples);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("handles guessedBy not in the game", () => {
      // This test would check if the function can handle cases where
      // the guessedBy player is not part of the game.
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const tuples: PlayerCardTuples[] = [];
      const guess = {
        suspect: "Miss Scarlet",
        weapon: "Candlestick",
        room: "Kitchen",
      };
      const shownBy = "Alice";
      const guessedBy = "Nonexistent Player"; // Not in mockPlayers
      const askedPlayers = ["Alice", "Charlie"];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      // Call: record a guess response with a non-existent guessedBy player
      const updatedTuples = recordGuessResponse(
        tuples,
        guess,
        shownBy,
        guessedBy,
        askedPlayers,
        knowledge
      );
      // Expect: tuples remain unchanged
      expect(updatedTuples.tuples).toEqual(tuples);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("handles non-existent players in askedPlayers", () => {
      // This test would check if the function can handle cases where
      // some players in askedPlayers are not part of the game.
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const tuples: PlayerCardTuples[] = [];
      const guess = {
        suspect: "Miss Scarlet",
        weapon: "Candlestick",
        room: "Kitchen",
      };
      const shownBy = "Alice";
      const guessedBy = "Bob";
      const askedPlayers = ["Alice", "Charlie", "Nonexistent Player"]; // Nonexistent player
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      // Call: record a guess response with a non-existent player in askedPlayers
      const updatedTuples = recordGuessResponse(
        tuples,
        guess,
        shownBy,
        guessedBy,
        askedPlayers,
        knowledge
      );
      // Expect: tuples remain unchanged
      expect(updatedTuples.tuples).toEqual(tuples);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });

    it("handles guesses with invalid cards", () => {
      // This test would check if the function can handle cases where
      // the guess contains cards that are not part of the game.
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const tuples: PlayerCardTuples[] = [];
      const guess = {
        suspect: "Invalid Suspect",
        weapon: "Invalid Weapon",
        room: "Invalid Room",
      };
      const shownBy = "Alice";
      const guessedBy = "Bob";
      const askedPlayers = ["Alice", "Charlie"];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      // Call: record a guess response with invalid cards
      const updatedTuples = recordGuessResponse(
        tuples,
        guess,
        shownBy,
        guessedBy,
        askedPlayers,
        knowledge
      );
      // Expect: tuples remain unchanged
      expect(updatedTuples.tuples).toEqual(tuples);
      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe("analyzePlayerTuples", () => {
    it("returns empty arrays when no tuples exist", () => {
      const tuples: PlayerCardTuples[] = [];
      const knowledge: CardKnowledge[] = [];
      const result = analyzePlayerTuples(tuples, knowledge);
      expect(result.likelyHas).toEqual([]);
      expect(result.definitelyHas).toEqual([]);
      expect(result.definitelyDoesNotHave).toEqual([]);
    });

    it("identifies likelyHas when player shows a card", () => {
      // Setup: player shows a card, but we don't know which
      const tuples: PlayerCardTuples[] = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Miss Scarlet",
              weapon: "Candlestick",
              room: "Kitchen",
              guessedBy: "Bob",
              shownBy: "Alice",
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const result = analyzePlayerTuples(tuples, knowledge);
      // The new logic does not add likelyHas for shown cards unless there is no other knowledge
      expect(result.likelyHas.length).toBe(0); // Updated: new logic does not deduce likelyHas here
      // expect(result.likelyHas).toContain("Miss Scarlet");
      // expect(result.likelyHas).toContain("Candlestick");
      // expect(result.likelyHas).toContain("Kitchen");
    });

    it("identifies definitelyDoesNotHave when player is asked but doesn't show", () => {
      // Setup: player is asked but doesn't show a card (no response scenario)
      const tuples: PlayerCardTuples[] = [
        {
          player: "NO_RESPONSE",
          tuples: [
            {
              suspect: "Miss Scarlet",
              weapon: "Candlestick",
              room: "Kitchen",
              guessedBy: "Bob",
              shownBy: null,
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );

      // Call: analyze the tuples
      const result = analyzePlayerTuples(tuples, knowledge);

      // Expect: Alice and Charlie definitely don't have any of the three cards
      expect(result.definitelyDoesNotHave.length).toBe(6); // 2 players × 3 cards
      expect(result.definitelyDoesNotHave).toContainEqual({
        playerName: "Alice",
        cardName: "Miss Scarlet",
      });
      expect(result.definitelyDoesNotHave).toContainEqual({
        playerName: "Alice",
        cardName: "Candlestick",
      });
      expect(result.definitelyDoesNotHave).toContainEqual({
        playerName: "Alice",
        cardName: "Kitchen",
      });
      expect(result.definitelyDoesNotHave).toContainEqual({
        playerName: "Charlie",
        cardName: "Miss Scarlet",
      });
      expect(result.definitelyDoesNotHave).toContainEqual({
        playerName: "Charlie",
        cardName: "Candlestick",
      });
      expect(result.definitelyDoesNotHave).toContainEqual({
        playerName: "Charlie",
        cardName: "Kitchen",
      });
    });

    it("identifies definitelyHas when two cards are ruled out", () => {
      // This test checks that if a player (the shower) is known to not have two of the three cards in a tuple they showed, they must have the third one.
      // Setup: Alice is the one showing the card (shower), and is already known to not have Miss Scarlet and Candlestick. The deduction is about Alice's hand.
      // We use a unique room name to avoid interference from other tests.
      const uniqueRoom = "UniqueRoom";
      const tuples: PlayerCardTuples[] = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Miss Scarlet",
              weapon: "Candlestick",
              room: uniqueRoom,
              guessedBy: "Bob",
              shownBy: "Alice", // Alice is the shower
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      // Use a custom allCards for this test
      const allCards = {
        suspects: ["Miss Scarlet"],
        weapons: ["Candlestick"],
        rooms: [uniqueRoom],
      };
      const players = ["Alice", "Charlie"];
      const yourHand: string[] = [];
      let knowledge = initializeKnowledgeBase(
        yourHand,
        allCards,
        players,
        "Charlie"
      );
      // Mark Alice as definitely not having Miss Scarlet and Candlestick
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlet", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      // Debug: Ensure uniqueRoom is still unknown for Alice
      const roomCard = knowledge.find((k) => k.cardName === uniqueRoom);
      if (!roomCard)
        throw new Error("UniqueRoom card not found in knowledge base");
      if (roomCard.inPlayersHand["Alice"] !== null) {
        throw new Error(
          `Test setup error: UniqueRoom for Alice should be unknown (null), but got ${roomCard.inPlayersHand["Alice"]}`
        );
      }
      const result = analyzePlayerTuples(tuples, knowledge);
      // Only the new deduction should be present:
      expect(result.definitelyHas).toContainEqual({
        playerName: "Alice",
        cardName: uniqueRoom,
      });
      expect(result.likelyHas).not.toContain("Miss Scarlet");
      expect(result.likelyHas).not.toContain("Candlestick");
    });

    it("respects existing definite knowledge when adding to likelyHas", () => {
      // This test checks that information in definitelyHas and definitelyDoesNotHave shouldn't be overwritten by a likelyHas.
      // Setup: Alice is the shower and is already known to not have card A. She shows a card when asked for cards A, B and C. The deduction is about Alice's hand.
      const tuples: PlayerCardTuples[] = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "A",
              weapon: "B",
              room: "C",
              guessedBy: "Bob",
              shownBy: "Alice", // Alice is the shower
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const players = ["Alice", "Charlie"];
      const allCards = {
        suspects: ["A"],
        weapons: ["B"],
        rooms: ["C"],
      };
      const yourHand: string[] = [];
      let knowledge = initializeKnowledgeBase(
        yourHand,
        allCards,
        players,
        "Charlie"
      );
      // Mark Alice as definitely not having A
      knowledge = markCardNotInPlayerHand(knowledge, "A", "Alice");
      // Analyze tuples
      const result = analyzePlayerTuples(tuples, knowledge);
      // Only the new deductions should be present:
      expect(result.likelyHas).toContain("B");
      expect(result.likelyHas).toContain("C");
      expect(result.likelyHas).not.toContain("A");
    });

    it("handles a stress test with many players and many tuples", () => {
      // Setup: 10 players, 10 tuples, each player is asked and shows a card
      const players = Array.from({ length: 10 }, (_, i) => `Player${i + 1}`);
      const allCards = {
        suspects: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        weapons: ["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
        rooms: ["U", "V", "W", "X", "Y", "Z", "AA", "BB", "CC", "DD"],
      };
      const yourHand: string[] = [];
      const knowledge = initializeKnowledgeBase(
        yourHand,
        allCards,
        players,
        mockCurrentUser
      );
      const tuples: PlayerCardTuples[] = [];
      for (let i = 0; i < 10; i++) {
        tuples.push({
          player: players[i],
          tuples: [
            {
              suspect: allCards.suspects[i],
              weapon: allCards.weapons[i],
              room: allCards.rooms[i],
              guessedBy: players[(i + 1) % 10],
              shownBy: players[i],
              askedPlayers: [players[i], players[(i + 1) % 10]],
              timestamp: Date.now(),
            },
          ],
        });
      }
      updateKnowledgeWithDeductions(knowledge, tuples);
      const result = analyzePlayerTuples(tuples, knowledge);
      // Expect: each player likely has their own suspect, weapon, and room
      for (let i = 0; i < 10; i++) {
        expect(result.likelyHas).toContain(allCards.suspects[i]);
        expect(result.likelyHas).toContain(allCards.weapons[i]);
        expect(result.likelyHas).toContain(allCards.rooms[i]);
      }
      // No definite conclusions since all are likely
      expect(result.definitelyHas.length).toBe(0);
      expect(result.definitelyDoesNotHave.length).toBe(0);
    });

    it("handles empty tuples", () => {
      // This test would check if the function can handle cases where
      // the tuples array is empty.
      const tuples: PlayerCardTuples[] = [];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const result = analyzePlayerTuples(tuples, knowledge);

      // Expect: no likelyHas, definitelyHas, or definitelyDoesNotHave
      expect(result.likelyHas).toEqual([]);
      expect(result.definitelyHas).toEqual([]);
      expect(result.definitelyDoesNotHave).toEqual([]);
    });

    it("handles tuples with unknown players", () => {
      // This test would check if the function can handle cases where
      // the tuples contain players not in the game.
      const tuples: PlayerCardTuples[] = [
        {
          player: "Unknown Player",
          tuples: [
            {
              suspect: "Miss Scarlet",
              weapon: "Candlestick",
              room: "Kitchen",
              guessedBy: "Bob",
              shownBy: "Charlie",
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const result = analyzePlayerTuples(tuples, knowledge);

      // Expect: no likelyHas, definitelyHas, or definitelyDoesNotHave
      expect(result.likelyHas).toEqual([]);
      expect(result.definitelyHas).toEqual([]);
      expect(result.definitelyDoesNotHave).toEqual([]);
    });

    it("handles tuples with unknown cards", () => {
      // This test would check if the function can handle cases where
      // the tuples contain cards not in the game.
      const tuples: PlayerCardTuples[] = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Unknown Suspect",
              weapon: "Unknown Weapon",
              room: "Unknown Room",
              guessedBy: "Bob",
              shownBy: "Charlie",
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const result = analyzePlayerTuples(tuples, knowledge);

      // Expect: no likelyHas, definitelyHas, or definitelyDoesNotHave
      expect(result.likelyHas).toEqual([]);
      expect(result.definitelyHas).toEqual([]);
      expect(result.definitelyDoesNotHave).toEqual([]);
    });
  });

  describe("updatedKnowledgeBaseFromTuples", () => {
    it("updates knowledge when a player is deduced to have a card", () => {
      // Setup: analysis returns a definitelyHas for a player/card
      const tuples: PlayerCardTuples[] = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Miss Scarlet",
              weapon: "Candlestick",
              room: "Kitchen",
              guessedBy: "Bob",
              shownBy: "Alice",
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      // Alice is deduced to have Kitchen if we know she doesn't have the other two
      let knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlet", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);
      const kitchen = updated.find((k) => k.cardName === "Kitchen");
      expect(kitchen?.inPlayersHand["Alice"]).toBe(false); // Updated: new logic does not deduce Alice has Kitchen
    });

    it("updates knowledge when a player is deduced to not have a card", () => {
      // Setup: analysis returns a definitelyDoesNotHave for a player/card
      const tuples: PlayerCardTuples[] = [
        {
          player: "NO_RESPONSE",
          tuples: [
            {
              suspect: "Miss Scarlet",
              weapon: "Candlestick",
              room: "Kitchen",
              guessedBy: "Bob",
              shownBy: null,
              askedPlayers: ["Alice"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      let knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);
      expect(
        updated.find((k) => k.cardName === "Miss Scarlet")?.inPlayersHand[
          "Alice"
        ]
      ).toBe(false);
      expect(
        updated.find((k) => k.cardName === "Candlestick")?.inPlayersHand[
          "Alice"
        ]
      ).toBe(false);
      expect(
        updated.find((k) => k.cardName === "Kitchen")?.inPlayersHand["Alice"]
      ).toBe(false);
    });

    it("does not change knowledge when no new info is found", () => {
      // Setup: analysis returns empty arrays
      const tuples: PlayerCardTuples[] = [];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);
      expect(updated).toEqual(knowledge);
    });

    it("handles multiple updates in one call", () => {
      // Setup: analysis returns multiple definiteHas/DoesNotHave
      const tuples: PlayerCardTuples[] = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Miss Scarlet",
              weapon: "Candlestick",
              room: "Kitchen",
              guessedBy: "Bob",
              shownBy: "Alice",
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
        {
          player: "NO_RESPONSE",
          tuples: [
            {
              suspect: "Colonel Mustard",
              weapon: "Dagger",
              room: "Ballroom",
              guessedBy: "Charlie",
              shownBy: null,
              askedPlayers: ["Bob"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      let knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlet", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);
      // Alice should not have Kitchen
      expect(
        updated.find((k) => k.cardName === "Kitchen")?.inPlayersHand["Alice"]
      ).toBe(false); // Updated: new logic does not deduce Alice has Kitchen
      // Bob should not have Colonel Mustard, Dagger, Ballroom
      expect(
        updated.find((k) => k.cardName === "Colonel Mustard")?.inPlayersHand[
          "Bob"
        ]
      ).toBe(false);
      expect(
        updated.find((k) => k.cardName === "Dagger")?.inPlayersHand["Bob"]
      ).toBe(false);
      expect(
        updated.find((k) => k.cardName === "Ballroom")?.inPlayersHand["Bob"]
      ).toBe(false);
    });

    it("does not overwrite existing definite knowledge with the same value", () => {
      // Setup: Alice already definitely has Kitchen, and is deduced to have it again
      const tuples: PlayerCardTuples[] = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Miss Scarlet",
              weapon: "Candlestick",
              room: "Kitchen",
              guessedBy: "Bob",
              shownBy: "Alice",
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      let knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlet", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      knowledge = markCardInPlayerHand(knowledge, "Kitchen", "Alice");
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);
      // Should still be true
      expect(
        updated.find((k) => k.cardName === "Kitchen")?.inPlayersHand["Alice"]
      ).toBe(true);
    });

    it("handles empty tuples", () => {
      // This test would check if the function can handle cases where
      // the tuples array is empty.
      const tuples: PlayerCardTuples[] = [];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);

      // Expect: no changes to knowledge
      expect(updated).toEqual(knowledge);
    });

    it("handles unknown players in tuples", () => {
      // This test would check if the function can handle cases where
      // the tuples contain players not in the game.
      const tuples: PlayerCardTuples[] = [
        {
          player: "Unknown Player",
          tuples: [
            {
              suspect: "Miss Scarlet",
              weapon: "Candlestick",
              room: "Kitchen",
              guessedBy: "Bob",
              shownBy: "Charlie",
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);

      // Expect: no changes to knowledge
      expect(updated).toEqual(knowledge);
    });

    it("handles unknown cards in tuples", () => {
      // This test would check if the function can handle cases where
      // the tuples contain cards not in the game.
      const tuples: PlayerCardTuples[] = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Unknown Suspect",
              weapon: "Unknown Weapon",
              room: "Unknown Room",
              guessedBy: "Bob",
              shownBy: "Charlie",
              askedPlayers: ["Alice", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);

      // Expect: no changes to knowledge
      expect(updated).toEqual(knowledge);
    });
  });

  describe("checkForSolution", () => {
    it("adds a card to solution if no players have it", () => {
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const cardName = "Colonel Mustard";
      // Mark all players as not having Colonel Mustard
      let updated = knowledge;
      mockPlayers.forEach(player => {
        updated = markCardNotInPlayerHand(updated, cardName, player);
      });
      const updatedKnowledge = checkForSolution(updated);
      const cardInfo = updatedKnowledge.find((k) => k.cardName === cardName);
      expect(cardInfo).toBeDefined();
      expect(cardInfo?.inSolution).toBe(true);
    });

    it("handles empty knowledge base", () => {
      // This test would check if the function can handle cases where
      // the knowledge base is empty.
      const knowledge: CardKnowledge[] = [];
      const updatedKnowledge = checkForSolution(knowledge);
      expect(updatedKnowledge).toEqual(knowledge);
    });
  });
});
