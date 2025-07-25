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
  allPlayers: string[]; // <-- add this
  currentUser: string;
  userHand: string[]; // <-- add this

  // Callbacks
  onGuessChange: (suspect: string, weapon: string, room: string) => void;
  onGuessedByChange: (player: string) => void;
  onShowedByChange: (player: string | null) => void;
  onShownCardChange: (card: string) => void;
  onGuessSubmit: (guess: GuessData) => void;
  // Reset callback
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

  // Remove answeringPlayers state and checkbox logic
  // const [answeringPlayers, setAnsweringPlayers] = React.useState<string[]>([]);

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

  // Remove handlePlayerCheckboxChange

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
        answeringPlayers: props.answeringPlayers, // Now always inferred
      };

      props.onGuessSubmit(guessData);
      console.log("SubmitGuess called!", guessData);

      // Reset form after successful submission
      // setAnsweringPlayers([]); // Remove
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

  // New: Check if a non-user is showing a card in the user's hand
  const isInvalidShownCard =
    props.showedBy &&
    props.showedBy !== props.currentUser &&
    props.shownCard &&
    props.userHand.includes(props.shownCard);

  const isFormValid =
    props.selectedSuspect &&
    props.selectedWeapon &&
    props.selectedRoom &&
    props.guessedBy &&
    !isSamePlayerGuesserAndShower &&
    !requiresShownCard &&
    !isInvalidShownCard;

  return (
    <div>
      <h2>Guess Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
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

        <div className="form-group">
          <label htmlFor="guessedBy">Guessed by:</label>
          <select
            id="guessedBy"
            value={props.guessedBy}
            onChange={handleGuessedByChange}
            required
          >
            <option value="">Select who made the guess</option>
            {props.allPlayers.map((player) => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="showedBy">Showed by:</label>
          <select
            id="showedBy"
            value={props.showedBy || ""}
            onChange={handleShowedByChange}
          >
            <option value="">No one showed a card</option>
            {props.allPlayers.map((player) => (
              <option key={player} value={player}>
                {player}
              </option>
            ))}
          </select>
        </div>

        {props.showedBy && (
          <div className="form-group">
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

        {/* Show error if a non-user is showing a card in the user's hand and a card is selected */}
        {isInvalidShownCard && (
          <div className="error-message" style={{ marginTop: "10px" }}>
            Selected shown card is in user's hand
          </div>
        )}

        {isSamePlayerGuesserAndShower && (
          <div className="error-message" style={{ marginTop: "10px" }}>
            Error: Guesser and shower cannot be the same player
          </div>
        )}

        {requiresShownCard && (
          <div className="error-message" style={{ marginTop: "10px" }}>
            You must select which card was shown
          </div>
        )}

        <div className="form-group">
          <label>Players who were asked (inferred):</label>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {validAnsweringPlayers.map((player) => (
              <li key={player}>{player}</li>
            ))}
          </ul>
        </div>

        <button className="btn-primary" type="submit" disabled={!isFormValid}>
          Submit Guess
        </button>
      </form>
    </div>
  );
};

export default GuessForm;
