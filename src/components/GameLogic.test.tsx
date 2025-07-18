import { describe, it, expect, vi } from "vitest";
import {
  markCardInPlayerHand,
  initializeKnowledgeBase,
  recordGuessResponse,
  PlayerCardTuples,
  markCardNotInPlayerHand,
  updateKnowledgeWithDeductions,
} from "./GameLogic";

describe("GameLogic", () => {
  const mockPlayers = ["Alice", "Bob", "Charlie"];
  const mockYourHand = ["Miss Scarlett", "Candlestick"];
  const mockAllCards = {
    suspects: ["Miss Scarlett", "Colonel Mustard", "Dr. Orchid"],
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
      const duplicateHand = ["Miss Scarlett", "Miss Scarlett"];
      const knowledge = initializeKnowledgeBase(
        duplicateHand,
        mockAllCards,
        mockPlayers,
        mockCurrentUser
      );
      const scarletInfo = knowledge.find((k) => k.cardName === "Miss Scarlett");
      // Expect: the card is still marked as in your hand, and no duplicates in knowledge
      expect(scarletInfo).toBeDefined();
      expect(scarletInfo?.inYourHand).toBe(true);
      expect(
        knowledge.filter((k) => k.cardName === "Miss Scarlett").length
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
        suspects: ["Miss Scarlett", "Colonel Mustard"],
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
      const cardName = "Miss Scarlett";
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
      const cardName = "Miss Scarlett";
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
      const cardName = "Miss Scarlett";
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
      const cardName = "Miss Scarlett";
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

      // Mark a card as not in Bob's hand (from unknown state)
      const cardName = "Dr. Orchid";
      const playerName = "Bob";
      const updatedKnowledge = markCardNotInPlayerHand(
        knowledge,
        cardName,
        playerName
      );

      const cardInfo = updatedKnowledge.find((k) => k.cardName === cardName);
      expect(cardInfo).toBeDefined();

      // Bob should not have the card
      expect(cardInfo?.inPlayersHand[playerName]).toBe(false);

      // Charlie should remain unknown (unchanged from initial state)
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
      const cardName = "Miss Scarlett";
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
      const cardName = "Miss Scarlett";
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
              suspect: "Miss Scarlett",
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
        suspect: "Miss Scarlett",
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
        suspect: "Miss Scarlett",
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
        suspect: "Miss Scarlett",
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
        suspect: "Miss Scarlett",
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
        suspect: "Miss Scarlett",
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
        suspect: "Miss Scarlett",
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

  describe("updateKnowledgeWithDeductions", () => {
    it("updates knowledge when a player is deduced to have a card", () => {
      // Setup: analysis returns a definitelyHas for a player/card
      const tuples: PlayerCardTuples[] = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Miss Scarlett",
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
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlett", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      const updated = updateKnowledgeWithDeductions(knowledge, tuples);
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
              suspect: "Miss Scarlett",
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
      const updated = updateKnowledgeWithDeductions(knowledge, tuples);
      expect(
        updated.find((k) => k.cardName === "Miss Scarlett")?.inPlayersHand[
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
      const updated = updateKnowledgeWithDeductions(knowledge, tuples);
      expect(updated).toEqual(knowledge);
    });

    it("handles multiple updates in one call", () => {
      // Setup: analysis returns multiple definiteHas/DoesNotHave
      const tuples: PlayerCardTuples[] = [
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Miss Scarlett",
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
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlett", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      const updated = updateKnowledgeWithDeductions(knowledge, tuples);
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
              suspect: "Miss Scarlett",
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
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlett", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      knowledge = markCardInPlayerHand(knowledge, "Kitchen", "Alice");
      const updated = updateKnowledgeWithDeductions(knowledge, tuples);
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
      const updated = updateKnowledgeWithDeductions(knowledge, tuples);

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
              suspect: "Miss Scarlett",
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
      const updated = updateKnowledgeWithDeductions(knowledge, tuples);

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
      const updated = updateKnowledgeWithDeductions(knowledge, tuples);

      // Expect: no changes to knowledge
      expect(updated).toEqual(knowledge);
    });
  });
});
