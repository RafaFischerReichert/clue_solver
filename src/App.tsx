import React, { useState } from "react";
import "./App.css";
import GameSetup from "./components/GameSetup";
import HandInput from "./components/HandInput";

/**
 * Represents the complete game data including players and all card types
 */
interface GameData {
  /** Array of player names */
  players: string[];
  /** Array of suspect names */
  suspects: string[];
  /** Array of weapon names */
  weapons: string[];
  /** Array of room names */
  rooms: string[];
}

/**
 * Main application component that manages the flow between different game steps
 */
function App() {
  /** Current step in the game setup process */
  const [currentStep, setCurrentStep] = useState<"setup" | "hand-input">(
    "setup"
  );
  /** Complete game data including players and cards */
  const [gameData, setGameData] = useState<GameData | null>(null);

  /**
   * Handles completion of the game setup step
   * @param players - Array of player names from GameSetup
   */
  const handleGameSetup = (players: string[]) => {
    console.log("handleGameSetup called with players:", players);

    // For now, we'll use default Cluedo cards
    // Later, you can modify GameSetup to return all the data
    const defaultSuspects = [
      "Miss Scarlet",
      "Colonel Mustard",
      "Mrs. White",
      "Mr. Green",
      "Mrs. Peacock",
      "Professor Plum",
    ];
    const defaultWeapons = [
      "Candlestick",
      "Dagger",
      "Lead Pipe",
      "Revolver",
      "Rope",
      "Wrench",
    ];
    const defaultRooms = [
      "Kitchen",
      "Ballroom",
      "Conservatory",
      "Dining Room",
      "Billiard Room",
      "Library",
      "Lounge",
      "Hall",
      "Study",
    ];

    const newGameData = {
      players,
      suspects: defaultSuspects,
      weapons: defaultWeapons,
      rooms: defaultRooms,
    };

    console.log("Setting game data:", newGameData);
    setGameData(newGameData);
    setCurrentStep("hand-input");
    console.log("Moving to hand-input step");
  };

  /**
   * Handles completion of the hand input step
   * @param selectedCards - Array of card names selected by the user
   */
  const handleHandSubmit = (selectedCards: string[]) => {
    console.log("handleHandSubmit called with selectedCards:", selectedCards);
    console.log("Current game data:", gameData);

    // TODO: Move to gameplay step
    console.log("Ready to move to gameplay step");
    alert("Hand submitted! Ready for gameplay.");
  };

  return (
    <div className="App">
      <h1>Cluedo Solver</h1>

      {currentStep === "setup" && <GameSetup onGameStart={handleGameSetup} />}

      {currentStep === "hand-input" && gameData && (
        <HandInput
          suspects={gameData.suspects}
          weapons={gameData.weapons}
          rooms={gameData.rooms}
          onHandSubmit={handleHandSubmit}
        />
      )}
    </div>
  );
}

export default App;
