---

### Implemented
- Game state tracking (GameStateController, GameState, Player, KnowledgeState)
- Game initialization (gameInitializer.py, CLI prompts)
- Suggestion logic (evaluate guesses, entropy/information gain)
- Streamlit UI for game setup (app.py)

### Missing / Needs Work
- UI for recording game events (guesses, shown cards, etc.)
- Connecting suggestion logic to the UI
- Displaying current knowledge and deductions in the UI
- Polishing game initialization in the UI
- Automated tests and error handling

---

## Most Important Next Steps

1. **Add UI for Recording Game Events**
   - Allow user to input each guess, who was asked, who showed a card, and (if known) what card was shown.
   - Implement as a form in Streamlit or CLI prompt.

2. **Connect Suggestion Logic to UI**
   - After each event, update state and display:
     - Best next guess (using entropy logic)
     - What is currently known about the solution and each player

3. **Display Knowledge and Deductions**
   - Show a table or summary of:
     - Which cards are known to be held by which players
     - Which cards are still possible for the solution

4. **Polish Game Initialization**
   - Ensure game setup is smooth and error-proof in the UI

5. **(Optional) Add Tests**
   - Add basic tests to ensure deduction and suggestion logic works as expected

---

| Feature                        | Status         | Priority Next Step?         |
|------------------------------- |--------------- |----------------------------|
| Game state tracking            | Implemented    | -                          |
| Game initialization            | Implemented    | Polish UI                  |
| Recording game events          | Missing        | **Add to UI**              |
| Suggestion engine (logic)      | Implemented    | **Connect to UI**          |
| Suggestion engine (UI)         | Missing        | **Add to UI**              |
| Displaying knowledge/deductions| Missing        | **Add to UI**              |
| Tests                          | Missing        | Add if time allows         |