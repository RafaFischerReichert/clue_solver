# Suggestion AI TODO: Step-by-Step Guide

This document outlines the steps and reasoning for implementing a minimax/entropy-based Suggestion AI for Cluedo in `src/components/SuggestionAI.tsx`.

---

## 1. **Generate All Possible Worlds**
**Goal:** Enumerate all possible assignments of unknown cards to players and the solution, consistent with current knowledge. The focus is on the solution (envelope); hand assignments matter only as they affect solution uncertainty.

- **Why:** Each possible world represents a way the unseen cards could be distributed, given what is known so far. The ultimate goal is to reduce uncertainty about the solution.
- **How:**
  - For each card not known to be in a specific hand or the solution, consider all legal assignments (respecting hand sizes, no duplicates, etc.).
  - Use recursive backtracking or constraint satisfaction to generate all valid worlds.
  - **Tip:** This is the most computationally expensive step. For large games, consider sampling or pruning.

---

## 2. **Simulate Responses for Each World**
**Goal:** For a given guess, determine how each possible world would respond (who can show a card, which card is shown).

- **Why:** The response to a guess depends on the actual card distribution (the world). The value of the response is in how it changes our knowledge of the solution.
- **How:**
  - For each world, simulate the order in which players are asked (using `playerOrder`).
  - The first player (after the guesser) who can show a matching card does so.
  - If multiple cards could be shown, consider all possibilities (or randomize, or average over them).
  - Track how each outcome changes our knowledge of the solution, not just hands.

---

## 3. **Update Knowledge for Each Outcome**
**Goal:** For each possible response, update the knowledge base as if that response was observed, focusing on how it affects the solution's uncertainty.

- **Why:** This lets you measure how much information would be gained about the solution from each possible outcome.
- **How:**
  - Mark the shown card as being in the showing player's hand.
  - Mark that other players do not have that card.
  - If no one can show a card, mark all suggested cards as not in any player's hand (except the guesser).
  - Only propagate knowledge that helps reduce solution entropy.

---

## 4. **Compute Entropy Before and After**
**Goal:** Quantify the uncertainty (entropy) in the SOLUTION (envelope) before and after the guess.

- **Why:** The reduction in entropy of the solution measures the information gained by making the guess. Learning about hands is only valuable as it helps deduce the solution.
- **How:**
  - For each world, compute the probability distribution over possible solutions.
  - Use Shannon entropy: `H = -sum(p * log2(p))` over all possible solutions.
  - Average the entropy reduction over all possible responses/worlds.

---

## 5. **Aggregate Expected Information Gain**
**Goal:** Combine the results from all worlds and responses to get the expected value of the guess, focusing on solution entropy.

- **Why:** This lets you compare guesses and pick the one with the highest expected gain in terms of narrowing down the solution.
- **How:**
  - For each guess, average the entropy reduction across all worlds (weighted by their probability, if not uniform).
  - Return this value as the score for the guess.

---

## 6. **(Optional) Multi-Step Lookahead (Minimax/Expectimax)**
**Goal:** Consider not just the immediate information gain, but also future moves (recursively), always with the aim of reducing solution entropy.

- **Why:** True minimax/expectimax can plan several moves ahead, but is much more computationally expensive.
- **How:**
  - For each possible response, recursively evaluate the next best guess.
  - Use minimax (worst-case) or expectimax (average-case) as appropriate.
  - Limit recursion depth for performance.

---

## 7. **Performance Tips**
- Use memoization or caching for repeated subproblems.
- Consider Monte Carlo sampling instead of full enumeration for large state spaces.
- Prune impossible or low-probability worlds early.

---

## 8. **Testing and Validation**
- Start with small test cases (few players/cards) to validate logic.
- Add unit tests for each step (world generation, response simulation, entropy calculation).
- Compare AI suggestions to human intuition and known solutions.

---

**Reference:** See the structure and TODOs in `src/components/SuggestionAI.tsx` for where to implement each step. 