import React, { useState, useRef } from "react";
import { getPossibleHandSizes } from "./GameLogic";

// Props for HandInput
interface HandInputProps {
  suspects: string[]; // Suspect card names
  weapons: string[];  // Weapon card names
  rooms: string[];    // Room card names
  onHandSubmit: (selectedCards: string[]) => void; // Called when hand is submitted
  onBack: () => void; // Called when back button is pressed
  players: string[];  // Player names
}

// HandInput: lets user select their cards
const HandInput: React.FC<HandInputProps> = ({
  suspects,
  weapons,
  rooms,
  onHandSubmit,
  onBack,
  players,
}) => {
  // Validate original props first
  if (!Array.isArray(suspects)) {
    console.warn(
      "HandInput: Invalid props - suspects must be an array, received:",
      suspects
    );
    suspects = [];
  }
  if (!Array.isArray(weapons)) {
    console.warn(
      "HandInput: Invalid props - weapons must be an array, received:",
      weapons
    );
    weapons = [];
  }
  if (!Array.isArray(rooms)) {
    console.warn(
      "HandInput: Invalid props - rooms must be an array, received:",
      rooms
    );
    rooms = [];
  }

  /** Deduplicated arrays to prevent duplicate checkboxes */
  const uniqueSuspects = Array.from(new Set(suspects));
  const uniqueWeapons = Array.from(new Set(weapons));
  const uniqueRooms = Array.from(new Set(rooms));

  if (uniqueSuspects.length > 100) {
    console.warn(
      `HandInput: Large suspects array (${uniqueSuspects.length} items) may cause performance issues`
    );
  }
  if (uniqueWeapons.length > 100) {
    console.warn(
      `HandInput: Large weapons array (${uniqueWeapons.length} items) may cause performance issues`
    );
  }
  if (uniqueRooms.length > 100) {
    console.warn(
      `HandInput: Large rooms array (${uniqueRooms.length} items) may cause performance issues`
    );
  }

  /** Currently selected card names */
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const lastClickTimes = useRef<Record<string, number>>({});

  /**
   * Toggles a card in/out of the selected cards array
   * @param cardName - Name of the card to toggle
   */
  const handleCardToggle = (cardName: string) => {
    const now = Date.now();
    const lastClickTime = lastClickTimes.current[cardName] || 0;
    const timeSinceLastClick = now - lastClickTime;

    // Throttle per checkbox
    if (timeSinceLastClick < 100) {
      return;
    }

    lastClickTimes.current[cardName] = now;
    try {
      setSelectedCards((prev) =>
        prev.includes(cardName)
          ? prev.filter((card) => card !== cardName)
          : [...prev, cardName]
      );
    } catch (error) {
      console.error("Error in card selection:", error);
    }
  };

  /**
   * Handles form submission when Next button is clicked
   */
  const handleSubmit = () => {
    console.log(
      "HandInput handleSubmit called, hasSelectedCards:",
      hasSelectedCards
    );
    try {
      if (hasSelectedCards) {
        console.log("Calling onHandSubmit with selectedCards:", selectedCards);
        onHandSubmit(selectedCards);
      } else {
        console.log("No cards selected, not calling onHandSubmit");
      }
    } catch (error) {
      // Log the error to the console and warn the user
      console.error("Error submitting hand:", error);
      alert("An error occurred while submitting your hand. Please try again.");
    }
  };

  const hasSelectedCards = selectedCards.length > 0;
  // Find the correct source for players
  const playerList = Array.isArray(players) ? players : [];
  const possibleHandSizes = getPossibleHandSizes(playerList.length);
  const isValidHandSize = possibleHandSizes.includes(selectedCards.length);

  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
      <h2>Select Your Cards</h2>
      <p>Check the cards that are in your hand:</p>

      <div>
        <h3>Suspects</h3>
        {uniqueSuspects.map((suspect) => (
          <label key={suspect}>
            <input
              type="checkbox"
              checked={selectedCards.includes(suspect)}
              onChange={() => handleCardToggle(suspect)}
            />
            {suspect}
          </label>
        ))}
      </div>

      <div>
        <h3>Weapons</h3>
        {uniqueWeapons.map((weapon) => (
          <label key={weapon}>
            <input
              type="checkbox"
              checked={selectedCards.includes(weapon)}
              onChange={() => handleCardToggle(weapon)}
            />
            {weapon}
          </label>
        ))}
      </div>

      <div>
        <h3>Rooms</h3>
        {uniqueRooms.map((room) => (
          <label key={room}>
            <input
              type="checkbox"
              checked={selectedCards.includes(room)}
              onChange={() => handleCardToggle(room)}
            />
            {room}
          </label>
        ))}
      </div>
      {!hasSelectedCards && (
        <div style={{ color: "red" }}>Please select at least one card.</div>
      )}
      <div style={{ marginBottom: 12 }}>
        <strong>Possible hand sizes per player:</strong> {possibleHandSizes.join(" or ")}
        <br />
        <span>
          You have selected {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''}.
          {isValidHandSize ? ' ✅' : ' ❌'}
        </span>
        {!isValidHandSize && (
          <div style={{ color: 'red' }}>
            Please select a valid number of cards ({possibleHandSizes.join(' or ')}).
          </div>
        )}
      </div>
      <button type="submit" disabled={!isValidHandSize}>Submit</button>
      <button type="button" onClick={onBack} className="backtrack-button" style={{ marginLeft: 8 }}>
        Back
      </button>
    </form>
  );
};

export default HandInput;
