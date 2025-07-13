import React, { useState } from "react";

/**
 * Props for the GameSetup component
 */
interface GameSetupProps {
  /** Callback function called when game setup is complete */
  onGameStart?: (players: string[]) => void;
}

/**
 * Component for setting up the initial game configuration
 * Collects player names, suspects, weapons, and rooms
 */
const GameSetup: React.FC<GameSetupProps> = ({ onGameStart }) => {
  /** Player names entered by user (newline-separated) */
  const [playerNames, setPlayerNames] = useState("");
  /** Suspect names (newline-separated) */
  const [suspects, setSuspects] = useState(
    "Miss Scarlet\nColonel Mustard\nMrs. White\nMr. Green\nMrs. Peacock\nProfessor Plum"
  );
  /** Weapon names (newline-separated) */
  const [weapons, setWeapons] = useState(
    "Candlestick\nDagger\nLead Pipe\nRevolver\nRope\nWrench"
  );
  /** Room names (newline-separated) */
  const [rooms, setRooms] = useState(
    "Kitchen\nBallroom\nConservatory\nDining Room\nBilliard Room\nLibrary\nLounge\nHall\nStudy"
  );
  /** The current user's player name */
  const [yourPlayerName, setYourPlayerName] = useState("");

  const isYourPlayerNameValid = () => {
    return playerNames
      .split("\n")
      .map((name) => name.trim())
      .includes(yourPlayerName.trim());
  };

  const areThereThreeOrMorePlayers = () => {
    return (
      playerNames.split("\n").filter((name) => name.trim() !== "").length >= 3
    );
  };

  const hasDuplicatePlayerNames = () => {
    const names = playerNames
      .split("\n")
      .map((name) => name.trim())
      .filter(Boolean);
    const uniqueNames = new Set(names);
    return names.length !== uniqueNames.size;
  };

  const areGameElementsValid = () => {
    const suspectsList = suspects
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const weaponsList = weapons
      .split("\n")
      .map((w) => w.trim())
      .filter(Boolean);
    const roomsList = rooms
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    return (
      suspectsList.length > 0 && weaponsList.length > 0 && roomsList.length > 0
    );
  };

  const hasDuplicateElements = () => {
    const lists = [
      suspects
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      weapons
        .split("\n")
        .map((w) => w.trim())
        .filter(Boolean),
      rooms
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean),
    ];

    return lists.some((list) => {
      const set = new Set(list);
      return set.size !== list.length;
    });
  };

  const handlePlayerNamesChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setPlayerNames(event.target.value);
  };

  const handleSuspectsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setSuspects(event.target.value);
  };

  const handleWeaponsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setWeapons(event.target.value);
  };

  const handleRoomsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRooms(event.target.value);
  };

  const handleYourPlayerNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setYourPlayerName(event.target.value);
  };

  /**
   * Handles form submission when Next button is clicked
   */
  const handleSubmit = () => {
    console.log("GameSetup handleSubmit called");

    const players = playerNames
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name !== "");

    console.log("Processed players:", players);
    console.log("Validation - isYourPlayerNameValid:", isYourPlayerNameValid());
    console.log(
      "Validation - areThereThreeOrMorePlayers:",
      areThereThreeOrMorePlayers()
    );
    console.log(
      "Validation - hasDuplicatePlayerNames:",
      hasDuplicatePlayerNames()
    );
    console.log("Validation - areGameElementsValid:", areGameElementsValid());
    console.log("Validation - hasDuplicateElements:", hasDuplicateElements());

    if (
      onGameStart &&
      isYourPlayerNameValid() &&
      areThereThreeOrMorePlayers() &&
      !hasDuplicatePlayerNames() &&
      areGameElementsValid() &&
      !hasDuplicateElements()
    ) {
      console.log(
        "All validation passed, calling onGameStart with players:",
        players
      );
      onGameStart(players);
    } else {
      console.log("Validation failed, not calling onGameStart");
    }
  };

  return (
    <div>
      <h1>Game Setup</h1>
      <div>
        <label htmlFor="player-names">Player Names (one per line):</label>
        <textarea
          id="player-names"
          value={playerNames}
          onChange={handlePlayerNamesChange}
          placeholder="Enter player names..."
        />
        {areThereThreeOrMorePlayers() ? null : (
          <div style={{ color: "red" }}>
            At least 3 players are required to start the game.
          </div>
        )}
        {hasDuplicatePlayerNames() && (
          <div style={{ color: "red" }}>
            Player names must be unique. Please remove duplicates.
          </div>
        )}
      </div>
      <div>
        <label htmlFor="suspects">Suspects (one per line):</label>
        <textarea
          id="suspects"
          value={suspects}
          onChange={handleSuspectsChange}
          placeholder="Default Cluedo suspects are pre-filled. Edit as needed..."
        />
      </div>
      <div>
        <label htmlFor="weapons">Weapons (one per line):</label>
        <textarea
          id="weapons"
          value={weapons}
          onChange={handleWeaponsChange}
          placeholder="Default Cluedo weapons are pre-filled. Edit as needed..."
        />
      </div>
      <div>
        <label htmlFor="rooms">Rooms (one per line):</label>
        <textarea
          id="rooms"
          value={rooms}
          onChange={handleRoomsChange}
          placeholder="Default Cluedo rooms are pre-filled. Edit as needed..."
        />
      </div>
      <div>
        <label htmlFor="your-player-name">Your Player Name:</label>
        <input
          id="your-player-name"
          type="text"
          value={yourPlayerName}
          onChange={handleYourPlayerNameChange}
          placeholder="Enter your player name (must match one from the list above)"
        />
        {!isYourPlayerNameValid() && yourPlayerName && (
          <div style={{ color: "red" }}>
            Your player name must match one of the player names entered above.
          </div>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={
          !isYourPlayerNameValid() ||
          !areThereThreeOrMorePlayers() ||
          hasDuplicatePlayerNames() ||
          !areGameElementsValid() ||
          hasDuplicateElements()
        }
      >
        Next
      </button>
    </div>
  );
};

export default GameSetup;
