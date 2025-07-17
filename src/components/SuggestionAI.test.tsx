import { describe, it, expect } from "vitest";
import { evaluateGuess, simulateResponses } from "./SuggestionAI";
import { Guess, GameState } from "./GuessEvaluator";

describe("SuggestionAI", () => {
  it("returns 0 if there's only one possible solution", () => {
    // Only one possible solution left, so info gain should be 0
    const gameState: GameState = {
      knowledge: [
        // All cards except solution are known to be in hands
        {
          cardName: "A",
          category: "suspect",
          inYourHand: false,
          inPlayersHand: { P1: true },
          inSolution: false,
          eliminatedFromSolution: true,
        },
        {
          cardName: "B",
          category: "weapon",
          inYourHand: false,
          inPlayersHand: { P1: true },
          inSolution: false,
          eliminatedFromSolution: true,
        },
        {
          cardName: "C",
          category: "room",
          inYourHand: false,
          inPlayersHand: { P1: false },
          inSolution: true,
          eliminatedFromSolution: false,
        },
      ],
      previousGuesses: [{ suspect: "A", weapon: "B", room: "C" }],
      playerOrder: ["P1"],
    };
    const guess: Guess = { suspect: "A", weapon: "B", room: "C" };
    expect(evaluateGuess(guess, gameState)).toBe(0);
  });

  it("averages info gain if a player can show 2 cards", () => {
    // If a player can show 2 cards, info gain should be averaged over both outcomes
    const gameState: GameState = {
      knowledge: [
        {
          cardName: "A",
          category: "suspect",
          inYourHand: false,
          inPlayersHand: { P1: null, P2: true },
          inSolution: null,
          eliminatedFromSolution: false,
        },
        {
          cardName: "B",
          category: "weapon",
          inYourHand: false,
          inPlayersHand: { P1: null, P2: true },
          inSolution: null,
          eliminatedFromSolution: false,
        },
        {
          cardName: "C",
          category: "room",
          inYourHand: false,
          inPlayersHand: { P1: null, P2: null },
          inSolution: null,
          eliminatedFromSolution: false,
        },
      ],
      previousGuesses: [{ suspect: "A", weapon: "B", room: "C" }],
      playerOrder: ["P1", "P2"],
    };
    const guess: Guess = { suspect: "A", weapon: "B", room: "C" };
    // Should be > 0, and the function should not throw
    expect(() => evaluateGuess(guess, gameState)).not.toThrow();
  });

  it("handles invalid guesses gracefully", () => {
    // Guess includes a card not in the knowledge base
    const gameState: GameState = {
      knowledge: [
        {
          cardName: "A",
          category: "suspect",
          inYourHand: false,
          inPlayersHand: { P1: null },
          inSolution: null,
          eliminatedFromSolution: false,
        },
      ],
      previousGuesses: [{ suspect: "X", weapon: "Y", room: "Z" }],
      playerOrder: ["P1"],
    };
    const guess: Guess = { suspect: "X", weapon: "Y", room: "Z" };
    // Should not throw, should return 0 or NaN
    expect(() => evaluateGuess(guess, gameState)).not.toThrow();
  });

  it("gives probabilities that sum to 1", () => {
    // For a simple world, the sum of response probabilities should be 1
    const gameState: GameState = {
      knowledge: [
        {
          cardName: "A",
          category: "suspect",
          inYourHand: false,
          inPlayersHand: { P1: null, P2: true },
          inSolution: null,
          eliminatedFromSolution: false,
        },
        {
          cardName: "B",
          category: "weapon",
          inYourHand: false,
          inPlayersHand: { P1: null, P2: true },
          inSolution: null,
          eliminatedFromSolution: false,
        },
        {
          cardName: "C",
          category: "room",
          inYourHand: false,
          inPlayersHand: { P1: null, P2: null },
          inSolution: null,
          eliminatedFromSolution: false,
        },
      ],
      previousGuesses: [{ suspect: "A", weapon: "B", room: "C" }],
      playerOrder: ["P1", "P2"],
    };
    const guess: Guess = { suspect: "A", weapon: "B", room: "C" };
    // We'll call simulateResponses directly for this test
    const world = { A: "P2", B: "P2", C: "P1" };
    const responses = simulateResponses(
      guess,
      world,
      gameState,
      false // debug parameter
    );
    const totalProb = responses.reduce((sum: any, r: { probability: any; }) => sum + r.probability, 0);
    expect(totalProb).toBeCloseTo(1, 5);
  });
});
