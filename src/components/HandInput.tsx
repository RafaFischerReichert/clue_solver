import React, { useState } from "react";

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
}) => {
  /** Deduplicated arrays to prevent duplicate checkboxes */
  const uniqueSuspects = Array.from(new Set(suspects));
  const uniqueWeapons = Array.from(new Set(weapons));
  const uniqueRooms = Array.from(new Set(rooms));

  /** Currently selected card names */
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  /**
   * Toggles a card in/out of the selected cards array
   * @param cardName - Name of the card to toggle
   */
  const handleCardToggle = (cardName: string) => {
    setSelectedCards((prev) =>
      prev.includes(cardName)
        ? prev.filter((card) => card !== cardName)
        : [...prev, cardName]
    );
  };

  /**
   * Handles form submission when Next button is clicked
   */
  const handleSubmit = () => {
    console.log(
      "HandInput handleSubmit called, hasSelectedCards:",
      hasSelectedCards
    );
    if (hasSelectedCards) {
      console.log("Calling onHandSubmit with selectedCards:", selectedCards);
      onHandSubmit(selectedCards);
    } else {
      console.log("No cards selected, not calling onHandSubmit");
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
    </div>
  );
};

export default HandInput;
