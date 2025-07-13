import { describe, it, expect } from "vitest";
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
} from "./GameLogic";

describe("GameLogic", () => {
  const mockPlayers = ["Alice", "Bob", "Charlie"];
  const mockYourHand = ["Miss Scarlet", "Candlestick"];
  const mockAllCards = {
    suspects: ["Miss Scarlet", "Colonel Mustard", "Mrs. White"],
    weapons: ["Candlestick", "Dagger", "Lead Pipe"],
    rooms: ["Kitchen", "Ballroom", "Conservatory"],
  };

  describe("initializeKnowledgeBase", () => {
    it("includes all cards in the knowledge base", () => {
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers
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
        mockPlayers
      );
      mockYourHand.forEach((card) => {
        const cardInfo = knowledge.find((k) => k.cardName === card);
        expect(cardInfo).toBeDefined();
        expect(cardInfo?.inYourHand).toBe(true);
      });
    });

    it("initalizes all other players as unknown", () => {
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers
      );
      mockPlayers.forEach((player) => {
        knowledge.forEach((card) => {
          expect(card.inPlayersHand[player]).toBe(null);
        });
      });
    });

    it("correctly categorizes the cards", () => {
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers
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
        mockPlayers
      );
      knowledge.forEach((card) => {
        expect(card.inSolution).toBeNull();
        if (card.inYourHand) {
          expect(card.eliminatedFromSolution).toBe(true);
        } else {
          expect(card.eliminatedFromSolution).toBe(false);
        }
      });
    });
  });

  describe("markCardInPlayerHand", () => {
    it("marks the card in the hand of the correct player", () => {
      // Setup: knowledge base with all players initially unknown
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers
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
        mockPlayers
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
        mockPlayers
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
  });

    describe("markCardNotInPlayerHand", () => {
    it("marks the card as not in the hand of the correct player", () => {
      // Setup: knowledge base with all players initially unknown
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers
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
        mockPlayers
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

    it("does nothing if the card is not found", () => {
      // Setup: knowledge base with valid cards
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers
      );
      const cardName = "Nonexistent Card";
      const playerName = "Alice";
      
      // Call: try to mark a non-existent card as not in a player's hand
      const updatedKnowledge = markCardNotInPlayerHand(
        knowledge,
        cardName,
        playerName
      );
      
      // Expect: knowledge base remains unchanged (no card found to update)
      expect(updatedKnowledge).toEqual(knowledge); // Should return the same reference
      // No changes should be made to the knowledge base      
    });

    it("returns the updated knowledge array", () => {
      // Setup: knowledge base with all players initially unknown
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers
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
        mockPlayers
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
        mockPlayers
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
        mockPlayers
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
        mockPlayers
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
        mockPlayers
      );
      const result = analyzePlayerTuples(tuples, knowledge);
      // Expect: likelyHas contains all three cards (since we have no definite info about any of them)
      expect(result.likelyHas.length).toBe(3);
      expect(result.likelyHas).toContain("Miss Scarlet");
      expect(result.likelyHas).toContain("Candlestick");
      expect(result.likelyHas).toContain("Kitchen");
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
      const knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
      
      // Call: analyze the tuples
      const result = analyzePlayerTuples(tuples, knowledge);
      
      // Expect: Alice and Charlie definitely don't have any of the three cards
      expect(result.definitelyDoesNotHave.length).toBe(6); // 2 players × 3 cards
      expect(result.definitelyDoesNotHave).toContainEqual({ playerName: "Alice", cardName: "Miss Scarlet" });
      expect(result.definitelyDoesNotHave).toContainEqual({ playerName: "Alice", cardName: "Candlestick" });
      expect(result.definitelyDoesNotHave).toContainEqual({ playerName: "Alice", cardName: "Kitchen" });
      expect(result.definitelyDoesNotHave).toContainEqual({ playerName: "Charlie", cardName: "Miss Scarlet" });
      expect(result.definitelyDoesNotHave).toContainEqual({ playerName: "Charlie", cardName: "Candlestick" });
      expect(result.definitelyDoesNotHave).toContainEqual({ playerName: "Charlie", cardName: "Kitchen" });
    });

    it("identifies definitelyHas when two cards are ruled out", () => {
      // Setup: player shows a card, and knowledge says they don't have two of the three
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
      
      // Setup knowledge: Alice definitely doesn't have Miss Scarlet and Candlestick
      let knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlet", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      
      // Call: analyze the tuples
      const result = analyzePlayerTuples(tuples, knowledge);
      
      // Expect: Alice definitely has Kitchen (the third card)
      expect(result.definitelyHas.length).toBe(1);
      expect(result.definitelyHas[0]).toEqual({ playerName: "Alice", cardName: "Kitchen" });
      expect(result.likelyHas.length).toBe(0); // No likely cards since we have definite info
    });

    it("handles multiple tuples for same player", () => {
      // Setup: player has multiple tuples with different scenarios
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
            {
              suspect: "Colonel Mustard",
              weapon: "Dagger",
              room: "Ballroom",
              guessedBy: "Charlie",
              shownBy: "Alice",
              askedPlayers: ["Alice", "Bob"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
      
      // Call: analyze the tuples
      const result = analyzePlayerTuples(tuples, knowledge);
      
      // Expect: Alice likely has cards from both guesses (6 total cards)
      expect(result.likelyHas.length).toBe(6);
      expect(result.likelyHas).toContain("Miss Scarlet");
      expect(result.likelyHas).toContain("Candlestick");
      expect(result.likelyHas).toContain("Kitchen");
      expect(result.likelyHas).toContain("Colonel Mustard");
      expect(result.likelyHas).toContain("Dagger");
      expect(result.likelyHas).toContain("Ballroom");
    });

    it("respects existing definite knowledge when adding to likelyHas", () => {
      // Setup: player shows a card, but we already know they definitely have/don't have some cards
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
      
      // Setup knowledge: Alice definitely has Miss Scarlet, definitely doesn't have Candlestick
      let knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
      knowledge = markCardInPlayerHand(knowledge, "Miss Scarlet", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      
      // Call: analyze the tuples
      const result = analyzePlayerTuples(tuples, knowledge);
      
      // Expect: Kitchen is in likelyHas (unknown), but Miss Scarlet and Candlestick are not
      expect(result.likelyHas.length).toBe(1);
      expect(result.likelyHas).toContain("Kitchen");
      expect(result.likelyHas).not.toContain("Miss Scarlet");
      expect(result.likelyHas).not.toContain("Candlestick");
    });

    it("handles mixed scenarios with both definite and likely conclusions", () => {
      // Setup: multiple players with different scenarios
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
              guessedBy: "Alice",
              shownBy: null,
              askedPlayers: ["Bob", "Charlie"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
      
      // Call: analyze the tuples
      const result = analyzePlayerTuples(tuples, knowledge);
      
      // Expect: Alice likely has 3 cards, Bob and Charlie definitely don't have 3 cards each
      expect(result.likelyHas.length).toBe(3);
      expect(result.definitelyDoesNotHave.length).toBe(6); // Bob and Charlie × 3 cards
      expect(result.definitelyHas.length).toBe(0);
    });

    it("handles a player being both asked and showing a card in different tuples", () => {
      // Setup: Alice is asked but doesn't show a card in one tuple, and shows a card in another
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
        {
          player: "Alice",
          tuples: [
            {
              suspect: "Colonel Mustard",
              weapon: "Dagger",
              room: "Ballroom",
              guessedBy: "Charlie",
              shownBy: "Alice",
              askedPlayers: ["Alice", "Bob"],
              timestamp: Date.now(),
            },
          ],
        },
      ];
      const knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
      const result = analyzePlayerTuples(tuples, knowledge);
      // Expect: Alice definitely does not have Miss Scarlet, Candlestick, Kitchen (from NO_RESPONSE)
      expect(result.definitelyDoesNotHave).toContainEqual({ playerName: "Alice", cardName: "Miss Scarlet" });
      expect(result.definitelyDoesNotHave).toContainEqual({ playerName: "Alice", cardName: "Candlestick" });
      expect(result.definitelyDoesNotHave).toContainEqual({ playerName: "Alice", cardName: "Kitchen" });
      // And Alice likely has Colonel Mustard, Dagger, Ballroom (from shown tuple)
      expect(result.likelyHas).toContain("Colonel Mustard");
      expect(result.likelyHas).toContain("Dagger");
      expect(result.likelyHas).toContain("Ballroom");
    });

    it("handles a stress test with many players and many tuples", () => {
      // Setup: 10 players, 10 tuples, each player is asked and shows a card
      const players = Array.from({ length: 10 }, (_, i) => `Player${i+1}`);
      const allCards = {
        suspects: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
        weapons: ["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
        rooms:   ["U", "V", "W", "X", "Y", "Z", "AA", "BB", "CC", "DD"],
      };
      const yourHand: string[] = [];
      const knowledge = initializeKnowledgeBase(yourHand, allCards, players);
      const tuples: PlayerCardTuples[] = [];
      for (let i = 0; i < 10; i++) {
        tuples.push({
          player: players[i],
          tuples: [
            {
              suspect: allCards.suspects[i],
              weapon: allCards.weapons[i],
              room: allCards.rooms[i],
              guessedBy: players[(i+1)%10],
              shownBy: players[i],
              askedPlayers: [players[i], players[(i+1)%10]],
              timestamp: Date.now(),
            },
          ],
        });
      }
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
      let knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlet", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);
      const kitchen = updated.find(k => k.cardName === "Kitchen");
      expect(kitchen?.inPlayersHand["Alice"]).toBe(true);
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
      let knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);
      expect(updated.find(k => k.cardName === "Miss Scarlet")?.inPlayersHand["Alice"]).toBe(false);
      expect(updated.find(k => k.cardName === "Candlestick")?.inPlayersHand["Alice"]).toBe(false);
      expect(updated.find(k => k.cardName === "Kitchen")?.inPlayersHand["Alice"]).toBe(false);
    });

    it("does not change knowledge when no new info is found", () => {
      // Setup: analysis returns empty arrays
      const tuples: PlayerCardTuples[] = [];
      const knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
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
      let knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlet", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);
      // Alice should have Kitchen
      expect(updated.find(k => k.cardName === "Kitchen")?.inPlayersHand["Alice"]).toBe(true);
      // Bob should not have Colonel Mustard, Dagger, Ballroom
      expect(updated.find(k => k.cardName === "Colonel Mustard")?.inPlayersHand["Bob"]).toBe(false);
      expect(updated.find(k => k.cardName === "Dagger")?.inPlayersHand["Bob"]).toBe(false);
      expect(updated.find(k => k.cardName === "Ballroom")?.inPlayersHand["Bob"]).toBe(false);
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
      let knowledge = initializeKnowledgeBase(mockYourHand, mockAllCards, mockPlayers);
      knowledge = markCardNotInPlayerHand(knowledge, "Miss Scarlet", "Alice");
      knowledge = markCardNotInPlayerHand(knowledge, "Candlestick", "Alice");
      knowledge = markCardInPlayerHand(knowledge, "Kitchen", "Alice");
      const updated = updatedKnowledgeBaseFromTuples(knowledge, tuples);
      // Should still be true
      expect(updated.find(k => k.cardName === "Kitchen")?.inPlayersHand["Alice"]).toBe(true);
    });
  });

  describe("checkForSolution", () => {
    it("adds a card to solution if no players have it", () => {
      const knowledge = initializeKnowledgeBase(
        mockYourHand,
        mockAllCards,
        mockPlayers
      );
      const cardName = "Colonel Mustard";
      const updatedKnowledge = checkForSolution(knowledge, mockPlayers);
      const cardInfo = updatedKnowledge.find((k) => k.cardName === cardName);

      expect(cardInfo).toBeDefined();
      expect(cardInfo?.inSolution).toBe(true);
    });
  });
});
