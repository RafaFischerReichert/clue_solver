import React from "react";

interface GuessData {
  suspect: string;
  weapon: string;
  room: string;
  guessedBy: string;
  showedBy: string | null;
  shownCard?: string;
  answeringPlayers: string[];
}

interface GuessFormProps {
  // Available options
  suspects: string[];
  weapons: string[];
  rooms: string[];

  // Current selections
  selectedSuspect: string;
  selectedWeapon: string;
  selectedRoom: string;

  // Response data
  guessedBy: string;
  showedBy: string | null;
  shownCard: string;
  answeringPlayers: string[];
  currentUser: string;

  // Callbacks
  onGuessChange: (suspect: string, weapon: string, room: string) => void;
  onGuessedByChange: (player: string) => void;
  onShowedByChange: (player: string | null) => void;
  onShownCardChange: (card: string) => void;
  onGuessSubmit: (guess: GuessData) => void;
  // Reset callbacks
  onResetForm: () => void;
}

const GuessForm: React.FC<GuessFormProps> = (props) => {
  // Validate and provide fallbacks for arrays
  let suspects = props.suspects;
  let weapons = props.weapons;
  let rooms = props.rooms;
  let validAnsweringPlayers = props.answeringPlayers;

  if (!Array.isArray(suspects)) {
    console.warn("Expected array of possible suspects, got:", suspects);
    suspects = [];
  }
  if (!Array.isArray(weapons)) {
    console.warn("Expected array of possible weapons, got:", weapons);
    weapons = [];
  }
  if (!Array.isArray(rooms)) {
    console.warn("Expected array of possible rooms, got:", rooms);
    rooms = [];
  }
  if (!Array.isArray(validAnsweringPlayers)) {
    console.warn(
      "Expected array of players who answered, got:",
      validAnsweringPlayers
    );
    validAnsweringPlayers = [];
  }

  if (typeof props.selectedSuspect !== "string") {
    console.warn(
      "Expected string for selectedSuspect, got:",
      props.selectedSuspect
    );
  }
  if (typeof props.selectedWeapon !== "string") {
    console.warn(
      "Expected string for selectedWeapon, got:",
      props.selectedWeapon
    );
  }
  if (typeof props.selectedRoom !== "string") {
    console.warn("Expected string for selectedRoom, got:", props.selectedRoom);
  }

  if (typeof props.guessedBy !== "string") {
    console.warn("Expected string for guessedBy, got:", props.guessedBy);
  }
  if (props.showedBy !== null && typeof props.showedBy !== "string") {
    console.warn("Expected string or null for showedBy, got:", props.showedBy);
  }
  if (!Array.isArray(props.answeringPlayers)) {
    console.warn(
      "Expected array of players who answered, got:",
      props.answeringPlayers
    );
  }
  if (typeof props.currentUser !== "string") {
    console.warn("Expected string for currentUser, got:", props.currentUser);
  }

  const [answeringPlayers, setAnsweringPlayers] = React.useState<string[]>([]);

  const handleSuspectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    props.onGuessChange(
      event.target.value,
      props.selectedWeapon,
      props.selectedRoom
    );
  };

  const handleWeaponChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    props.onGuessChange(
      props.selectedSuspect,
      event.target.value,
      props.selectedRoom
    );
  };

  const handleRoomChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    props.onGuessChange(
      props.selectedSuspect,
      props.selectedWeapon,
      event.target.value
    );
  };

  const handleGuessedByChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    props.onGuessedByChange(value);
  };

  const handleShowedByChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    props.onShowedByChange(value || null);
  };

  const handleShownCardChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    props.onShownCardChange(event.target.value);
  };

  const handlePlayerCheckboxChange = (player: string, checked: boolean) => {
    if (checked) {
      setAnsweringPlayers([...answeringPlayers, player]);
    } else {
      setAnsweringPlayers(answeringPlayers.filter((p) => p !== player));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const guessData: GuessData = {
        suspect: props.selectedSuspect,
        weapon: props.selectedWeapon,
        room: props.selectedRoom,
        guessedBy: props.guessedBy,
        showedBy: props.showedBy,
        shownCard: props.shownCard || undefined,
        answeringPlayers: answeringPlayers,
      };

      props.onGuessSubmit(guessData);
      console.log("SubmitGuess called!", guessData);

      // Reset form after successful submission
      setAnsweringPlayers([]);
      props.onResetForm();
    } catch (error) {
      console.error("Error submitting guess:", error);
      // Component continues to render gracefully even if submission fails
    }
  };

  // Validation logic
  const isSamePlayerGuesserAndShower =
    props.guessedBy && props.showedBy && props.guessedBy === props.showedBy;
  const requiresShownCard =
    props.guessedBy === props.currentUser && props.showedBy && !props.shownCard;

  const isFormValid =
    props.selectedSuspect &&
    props.selectedWeapon &&
    props.selectedRoom &&
    props.guessedBy &&
    !isSamePlayerGuesserAndShower &&
    !requiresShownCard;

  // Debug printout for validation troubleshooting
  console.log({
    guessedBy: props.guessedBy,
    currentUser: props.currentUser,
    showedBy: props.showedBy,
    shownCard: props.shownCard,
    requiresShownCard,
    isFormValid
  });

  return (
    <div>
      <h2>Guess Form</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="suspect">Suspect:</label>
          <select
            id="suspect"
            value={props.selectedSuspect}
            onChange={handleSuspectChange}
            required
          >
            <option value="">Select a suspect</option>
            {suspects.map((suspect) => (
              <option key={suspect} value={suspect}>
                {suspect}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="weapon">Weapon:</label>
          <select
            id="weapon"
            value={props.selectedWeapon}
            onChange={handleWeaponChange}
            required
          >
            <option value="">Select a weapon</option>
            {weapons.map((weapon) => (
              <option key={weapon} value={weapon}>
                {weapon}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="room">Room:</label>
          <select
            id="room"
            value={props.selectedRoom}
            onChange={handleRoomChange}
            required
          >
            <option value="">Select a room</option>
            {rooms.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="guessedBy">Guessed by:</label>
          <select
            id="guessedBy"
            value={props.guessedBy}
            onChange={handleGuessedByChange}
            required
          >
            <option value="">Select who made the guess</option>
            {validAnsweringPlayers.map((player) => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="showedBy">Showed by:</label>
          <select
            id="showedBy"
            value={props.showedBy || ""}
            onChange={handleShowedByChange}
          >
            <option value="">No one showed a card</option>
            {validAnsweringPlayers.map((player) => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
          </select>
        </div>

        {props.showedBy && (
          <div>
            <label htmlFor="shownCard">Shown card:</label>
            <select
              id="shownCard"
              value={props.shownCard}
              onChange={handleShownCardChange}
              required={props.guessedBy === props.currentUser}
            >
              <option value="">Select the shown card</option>
              <option value={props.selectedSuspect}>
                {props.selectedSuspect}
              </option>
              <option value={props.selectedWeapon}>
                {props.selectedWeapon}
              </option>
              <option value={props.selectedRoom}>{props.selectedRoom}</option>
            </select>
          </div>
        )}

        {isSamePlayerGuesserAndShower && (
          <div style={{ color: "red", marginTop: "10px" }}>
            Error: Guesser and shower cannot be the same player
          </div>
        )}

        {requiresShownCard && (
          <div style={{ color: "red", marginTop: "10px" }}>
            You must select which card was shown
          </div>
        )}

        <div>
          <label>Players who answered:</label>
          {validAnsweringPlayers.map((player) => (
            <div key={player}>
              <input
                type="checkbox"
                id={`player-${player}`}
                checked={answeringPlayers.includes(player)}
                onChange={(e) =>
                  handlePlayerCheckboxChange(player, e.target.checked)
                }
                disabled={player === props.guessedBy} // Disable if player is the guesser
              />
              <label htmlFor={`player-${player}`}>{player}</label>
            </div>
          ))}
        </div>

        <button type="submit" disabled={!isFormValid}>
          Submit Guess
        </button>
      </form>
    </div>
  );
};

export default GuessForm;
