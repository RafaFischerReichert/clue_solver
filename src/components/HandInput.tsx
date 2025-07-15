import React, { useState, useRef } from "react";

/**
 * Props for the HandInput component
 */
interface HandInputProps {
  /** Array of suspect names to display as options */
  suspects: string[];
  /** Array of weapon names to display as options */
  weapons: string[];
  /** Array of room names to display as options */
  rooms: string[];
  /** Callback function called when hand selection is complete */
  onHandSubmit: (selectedCards: string[]) => void;
  onBack: () => void;
}

/**
 * Component for selecting cards that are in the user's hand
 * Displays suspects, weapons, and rooms as checkboxes for selection
 */
const HandInput: React.FC<HandInputProps> = ({
  suspects,
  weapons,
  rooms,
  onHandSubmit,
  onBack,
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

  return (
    <div>
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
      <button onClick={handleSubmit} disabled={!hasSelectedCards}>
        Next
      </button>
      <button type="button" onClick={onBack} className="backtrack-button" style={{ marginLeft: 8 }}>
        Back
      </button>
    </div>
  );
};

export default HandInput;
