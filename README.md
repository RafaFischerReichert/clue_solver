# Clue Solver Helper

A Streamlit-based assistant that helps you solve the mystery in Clue (Cluedo) by tracking game information, analyzing player knowledge, and suggesting optimal guesses.

## Features

- **Game Setup**: Configure players, suspects, weapons, and rooms
- **Movement Tracking**: Track player position and movement points on a 10x12 grid board
- **Guess Recording**: Log all guesses made during the game with who showed what cards
- **Knowledge Analysis**: Automatically track what cards each player has or doesn't have
- **Smart Suggestions**: Get recommendations for your next best guess based on current knowledge
- **Solution Tracking**: See possible solutions and eliminate impossible combinations
- **Data Persistence**: Save game state and knowledge to JSON files for continuity

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd clue_solver
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   streamlit run app.py
   ```

The app will open in your default web browser at `http://localhost:8501`.

## How to Use

### 1. Game Setup

1. **Enter Player Names**: List all players in the game (one per line)
2. **Configure Game Elements**: 
   - Check "Use default suspects/weapons/rooms" for standard Clue elements
   - Or enter custom lists if playing with house rules
3. **Set Your Identity**: Enter your player name (must match one from the player list)
4. **Enter Your Hand**: List all the cards you have (one per line)
5. **Initialize Game**: Click "Initialize Game State" to set up the game
6. **Start Game**: Click "Start Game" to begin

### 2. Movement & Position

Before making guesses, set your current position:

1. **Enter Movement Points**: Input your dice roll (0-24 points)
2. **Set Position**:
   - **In a Room**: Check "Are you in a room?" and select the room
   - **In Hallway**: Uncheck the box and enter your grid coordinates (Row 0-9, Col 0-11)
3. **View Accessible Rooms**: The app shows which rooms you can reach this turn

### 3. Recording Guesses

For every guess made during the game:

1. **Select Guesser**: Choose who made the guess
2. **Enter Guess Details**: Select suspect, weapon, and room (room choices are restricted to accessible rooms)
3. **Record Responses**: 
   - Select the order players were asked
   - Choose who showed a card (if any)
   - Select which card was shown (if known)
4. **Record Guess**: Click "Record Guess" to save the information

### 4. Analyzing Information

The app automatically analyzes all recorded information and provides:

#### Player Knowledge Tab
- Shows what cards each player definitely has, doesn't have, or might have
- Updates automatically as new information is recorded

#### Possible Solutions Tab
- Lists all remaining possible suspect-weapon-room combinations
- Eliminates impossible solutions based on known information

#### Best Next Guess Tab
- Suggests optimal guesses for information gathering
- Prioritizes guesses in accessible rooms
- Warns if no good guesses exist in reachable rooms

### 5. Game Flow

1. **Your Turn**: 
   - Enter your movement points
   - Set your position
   - Check accessible rooms
   - Make your guess using the suggestions

2. **Other Players' Turns**:
   - Record their guesses and responses
   - Watch the knowledge analysis update automatically

3. **Continue**: Repeat until the mystery is solved!

## Board Layout

The app uses a simplified 10x12 grid representing the Clue board:

- **Rooms**: Have specific entrance coordinates
- **Secret Passages**: Lounge ↔ Kitchen ↔ Study
- **Movement**: Uses BFS algorithm to calculate reachable rooms

## Data Files

The app creates and manages these files:
- `data/game_log.csv`: Complete record of all guesses and responses
- `data/knowledge_state.json`: Current knowledge state for all players

## Tips for Best Results

1. **Record Everything**: Even if no card is shown, record the guess
2. **Be Accurate**: Double-check player names and card names match exactly
3. **Update Position**: Always update your position before making guesses
4. **Use Suggestions**: The app's suggestions are based on maximizing information gain
5. **Check Knowledge**: Regularly review the Player Knowledge tab to see what you've learned

## Troubleshooting

- **"Please set up the game first"**: Return to the home page and complete game setup
- **Room not accessible**: Check your movement points and current position
- **Knowledge not updating**: Click "🔄 Refresh Analysis" to recalculate
- **Data not saving**: Ensure the `data/` directory exists and is writable

## Requirements

- Python 3.7+
- Streamlit 1.28.0+
- Pandas 2.0.0+
(found in requirements.txt)

## License

MIT lisence, see LICENSE file for details.
