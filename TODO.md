# Components
- Guess Evaluator
- Suggestion AI


# Flow of the app
- Start at Game Setup
- When setup, move to Hand Input
- When finished, generate starting knowledge table and take user to guess form
- When a new guess is input, update knowledge table
- Guess form should have a button "Abort" that ends the game and takes user back to setup screen
- Guess form should have a button "Find Optimal Guess" that, when clicked, calls the evaluating and optimal guess components

## Find Optimal Guess flow
- Button calls Guess Evaluator, inputting the rooms the user can currently access
- Guess Evaluator uses Suggestion AI -- loops through every possible guess from each accessible room and evaluates the average entropy gain from each guess, then returns the one with the best entropy gain
- Tie breakers should be resolved by trying to use cards that have been guessed before, so as to give away minimal information