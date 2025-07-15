import { useState } from "react";
import "./App.css";
import GameSetup from "./components/GameSetup";
import HandInput from "./components/HandInput";
import GuessForm from "./components/GuessForm";
import KnowledgeTable from "./components/KnowledgeTable";
import { initializeKnowledgeBase, CardKnowledge, recordGuessResponse, PlayerCardTuples, markCardInPlayerHand, markCardNotInPlayerHand } from "./components/GameLogic";

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
  const [currentStep, setCurrentStep] = useState<"setup" | "hand-input" | "gameplay">(
    "setup"
  );
  /** Complete game data including players and cards */
  const [gameData, setGameData] = useState<GameData | null>(null);
  /** User's hand cards */
  const [userHand, setUserHand] = useState<string[]>([]);
  /** Current guess form state */
  const [guessState, setGuessState] = useState({
    selectedSuspect: '',
    selectedWeapon: '',
    selectedRoom: '',
    guessedBy: '',
    showedBy: null as string | null,
    shownCard: '',
  });
  const [currentUser, setCurrentUser] = useState<string>("");
  const [cardKnowledge, setCardKnowledge] = useState<CardKnowledge[]>([]);
  const [playerTuples, setPlayerTuples] = useState<PlayerCardTuples[]>([]);

  /**
   * Handles completion of the game setup step
   * @param players - Array of player names from GameSetup
   * @param yourPlayerName - The current user's player name
   */
  const handleGameSetup = (players: string[], yourPlayerName: string) => {
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
    if (yourPlayerName) setCurrentUser(yourPlayerName);
  };

  /**
   * Handles completion of the hand input step
   * @param selectedCards - Array of card names selected by the user
   */
  const handleHandSubmit = (selectedCards: string[]) => {
    console.log("handleHandSubmit called with selectedCards:", selectedCards);
    console.log("Current game data:", gameData);

    setUserHand(selectedCards);
    if (gameData) {
      const allCards = {
        suspects: gameData.suspects,
        weapons: gameData.weapons,
        rooms: gameData.rooms,
      };
      setCardKnowledge(initializeKnowledgeBase(selectedCards, allCards, gameData.players, currentUser));
    }
    setCurrentStep("gameplay");
    console.log("Moving to gameplay step");
  };

  /**
   * Handles guess form changes
   */
  const handleGuessChange = (suspect: string, weapon: string, room: string) => {
    setGuessState(prev => ({
      ...prev,
      selectedSuspect: suspect,
      selectedWeapon: weapon,
      selectedRoom: room,
    }));
  };

  /**
   * Handles guessed by changes
   */
  const handleGuessedByChange = (player: string) => {
    setGuessState(prev => ({
      ...prev,
      guessedBy: player,
    }));
  };

  /**
   * Handles showed by changes
   */
  const handleShowedByChange = (player: string | null) => {
    setGuessState(prev => ({
      ...prev,
      showedBy: player,
    }));
  };

  /**
   * Handles shown card changes
   */
  const handleShownCardChange = (card: string) => {
    setGuessState(prev => ({
      ...prev,
      shownCard: card,
    }));
  };

  /**
   * Handles guess form submission
   */
  const handleGuessSubmit = (guessData: any) => {
    console.log("Guess submitted:", guessData);
    // Special case: current user is the guesser and knows the shown card
    if (
      guessData.guessedBy === currentUser &&
      guessData.showedBy &&
      guessData.shownCard
    ) {
      let updatedKnowledge = markCardInPlayerHand(
        cardKnowledge,
        guessData.shownCard,
        guessData.showedBy
      );
      if (gameData) {
        gameData.players.forEach((player) => {
          if (player !== guessData.showedBy) {
            updatedKnowledge = markCardNotInPlayerHand(
              updatedKnowledge,
              guessData.shownCard,
              player
            );
          }
        });
      }
      setCardKnowledge([...updatedKnowledge]);
      alert("Guess submitted! Processing...");
      return;
    }
    // Update knowledge and tuples (default case)
    const askedPlayers = gameData ? gameData.players.filter(p => p !== guessData.guessedBy) : [];
    const result = recordGuessResponse(
      playerTuples,
      {
        suspect: guessData.suspect || guessData.selectedSuspect,
        weapon: guessData.weapon || guessData.selectedWeapon,
        room: guessData.room || guessData.selectedRoom,
      },
      guessData.showedBy || guessData.showedBy || null,
      guessData.guessedBy,
      askedPlayers,
      cardKnowledge
    );
    // Ensure new arrays are set for state
    setPlayerTuples([...result.tuples]);
    setCardKnowledge([...result.knowledge]);
    alert("Guess submitted! Processing...");
  };

  // Handler to go back to setup
  const handleBackToSetup = () => {
    setCurrentStep("setup");
  };

  // Debug printout for cardKnowledge
  console.log("cardKnowledge", cardKnowledge);

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
          onBack={handleBackToSetup}
        />
      )}

      {currentStep === "gameplay" && gameData && (
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ flex: '0 0 350px', marginRight: '24px' }}>
            <KnowledgeTable
              cardKnowledge={cardKnowledge}
              players={gameData.players}
              onKnowledgeChange={setCardKnowledge}
            />
          </div>
          <div style={{ flex: 1 }}>
            <h2>Gameplay</h2>
            <p>Your hand: {userHand.join(', ')}</p>
            <GuessForm
              suspects={gameData.suspects}
              weapons={gameData.weapons}
              rooms={gameData.rooms}
              selectedSuspect={guessState.selectedSuspect}
              selectedWeapon={guessState.selectedWeapon}
              selectedRoom={guessState.selectedRoom}
              guessedBy={guessState.guessedBy}
              showedBy={guessState.showedBy}
              shownCard={guessState.shownCard}
              answeringPlayers={gameData.players}
              currentUser={currentUser}
              onGuessChange={handleGuessChange}
              onGuessedByChange={handleGuessedByChange}
              onShowedByChange={handleShowedByChange}
              onShownCardChange={handleShownCardChange}
              onGuessSubmit={handleGuessSubmit}
              onResetForm={() => {}}
              onAbort={handleBackToSetup}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
