# WHAT WE NEED TO DO

## STEP 1. INITIALIZE GAME STATE
- [x] Prompt user for player names (in turn order) and identify the user.
- [x] Create all Card objects for suspects, weapons, and rooms.
- [x] Prompt user to enter the cards in their hand.
- [x] Remove user's cards from the possible solution sets in GameState.
- [x] Add user's cards to their Player object and mark them as seen.
- [x] Print a summary of the initialized game state.

## STEP 2. GET POSSIBLE GUESSES
- [x] Generate all valid guesses: any unseen suspect and weapon, in any available room.
- [x] Exclude guesses involving cards known to be in the user's hand.

## STEP 3. EVALUATE GUESSES
- [ ] For each possible guess, simulate outcomes (correct/incorrect) and calculate how much each guess would reduce the possible answer space.
- [ ] Rank guesses by their expected information gain.

## STEP 4. UPDATE KNOWLEDGE
- [ ] After each turn, prompt user for new information (e.g., cards shown by other players).
- [ ] Update the user's knowledge base and the possible solution sets accordingly.

## STEP 5. KILLSWITCH (OPTIONAL)
- [ ] If a win is imminent (e.g., only one possible solution remains), suggest the most probable answer immediately.

## STEP 6. INTEGRATE WITH STREAMLIT
- [ ] Build a Streamlit UI for user input (player names, cards, etc.).
- [ ] Display the current game state and suggestions interactively.
- [ ] Allow the user to update knowledge and progress the game through the UI.