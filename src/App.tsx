import { useState } from "react";
import "./App.css";
import GameSetup from "./components/GameSetup";
import HandInput from "./components/HandInput";
import GuessForm from "./components/GuessForm";
import KnowledgeTable from "./components/KnowledgeTable";
import {
  initializeKnowledgeBase,
  CardKnowledge,
  recordGuessResponse,
  PlayerCardTuples,
  markCardInPlayerHand,
  markCardNotInPlayerHand,
} from "./components/GameLogic";
import React from "react";
import GuessEvaluator, { Guess } from "./components/GuessEvaluator";

// RoomChecklist: lets user select accessible rooms
interface RoomChecklistProps {
  rooms: string[];
  selectedRooms: string[];
  onChange: (rooms: string[]) => void;
}

const RoomChecklist: React.FC<RoomChecklistProps> = ({ rooms, selectedRooms, onChange }) => {
  // Toggle room selection
  const handleToggle = (room: string) => {
    if (selectedRooms.includes(room)) {
      onChange(selectedRooms.filter(r => r !== room));
    } else {
      onChange([...selectedRooms, room]);
    }
  };
  return (
    <div>
      <h3>Accessible Rooms</h3>
      {rooms.map(room => (
        <label key={room} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={selectedRooms.includes(room)}
            onChange={() => handleToggle(room)}
          />
          {room}
        </label>
      ))}
    </div>
  );
};

// GameData: all game setup info
interface GameData {
  players: string[];
  suspects: string[];
  weapons: string[];
  rooms: string[];
  playerOrder: string[];
  currentTurn: number;
}

// Utility to compute asked players
function getAskedPlayers(playerOrder: string[], guessedBy: string, showedBy: string | null): string[] {
  const n = playerOrder.length;
  const askerIdx = playerOrder.indexOf(guessedBy);
  if (askerIdx === -1) return [];
  let asked: string[] = [];
  let idx = (askerIdx + 1) % n;
  while (true) {
    const player = playerOrder[idx];
    if (player === guessedBy) break; // full loop, no one showed
    asked.push(player);
    if (showedBy && player === showedBy) break;
    idx = (idx + 1) % n;
    if (!showedBy && idx === askerIdx) break; // stop before looping to asker
  }
  return asked;
}

// Main app component
function App() {
  // Step in the game flow
  const [currentStep, setCurrentStep] = useState<"setup" | "hand-input" | "gameplay">(
    "setup"
  );
  // Game setup data
  const [gameData, setGameData] = useState<GameData | null>(null);
  // User's hand
  const [userHand, setUserHand] = useState<string[]>([]);
  // Guess form state
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
  // Accessible rooms for checklist
  const [accessibleRooms, setAccessibleRooms] = useState<string[]>([]);
  // Player order and turn
  const [playerOrder, setPlayerOrder] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [previousGuesses, setPreviousGuesses] = useState<Guess[]>([]);

  // Handle game setup completion
  const handleGameSetup = (players: string[], yourPlayerName: string) => {
    // Use default Cluedo cards
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
      playerOrder: players,
      currentTurn: 0,
    };
    setGameData(newGameData);
    setPlayerOrder(players);
    setCurrentTurn(0);
    setCurrentStep("hand-input");
    if (yourPlayerName) setCurrentUser(yourPlayerName);
  };

  // Handle hand input completion
  const handleHandSubmit = (selectedCards: string[]) => {
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
  };

  // Guess form changes
  const handleGuessChange = (suspect: string, weapon: string, room: string) => {
    setGuessState(prev => ({
      ...prev,
      selectedSuspect: suspect,
      selectedWeapon: weapon,
      selectedRoom: room,
    }));
  };
  const handleGuessedByChange = (player: string) => {
    setGuessState(prev => ({
      ...prev,
      guessedBy: player,
    }));
  };
  const handleShowedByChange = (player: string | null) => {
    setGuessState(prev => ({
      ...prev,
      showedBy: player,
    }));
  };
  const handleShownCardChange = (card: string) => {
    setGuessState(prev => ({
      ...prev,
      shownCard: card,
    }));
  };

  // Handle guess form submission
  const handleGuessSubmit = (guessData: any) => {
    // If user is guesser and knows the shown card
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
        // Compute asked players (those between guesser and shower, inclusive of shower)
        const askedPlayers = getAskedPlayers(gameData.playerOrder, guessData.guessedBy, guessData.showedBy);
        // Exclude the shower
        const nonShowerAsked = askedPlayers.filter(p => p !== guessData.showedBy);
        // Mark all three cards as not in their hand
        for (const player of nonShowerAsked) {
          updatedKnowledge = markCardNotInPlayerHand(updatedKnowledge, guessData.suspect || guessData.selectedSuspect, player);
          updatedKnowledge = markCardNotInPlayerHand(updatedKnowledge, guessData.weapon || guessData.selectedWeapon, player);
          updatedKnowledge = markCardNotInPlayerHand(updatedKnowledge, guessData.room || guessData.selectedRoom, player);
        }
        // Debug printout
        const before = JSON.stringify(cardKnowledge);
        const after = JSON.stringify(updatedKnowledge);
        if (before !== after) {
          const beforeObj = cardKnowledge;
          const afterObj = updatedKnowledge;
          const diffs: string[] = [];
          for (let i = 0; i < beforeObj.length; i++) {
            const beforeCard = beforeObj[i];
            const afterCard = afterObj[i];
            for (const player of Object.keys(beforeCard.inPlayersHand)) {
              if (beforeCard.inPlayersHand[player] !== afterCard.inPlayersHand[player]) {
                diffs.push(`Player ${player} for card ${beforeCard.cardName}: ${beforeCard.inPlayersHand[player]} -> ${afterCard.inPlayersHand[player]}`);
              }
            }
          }
          console.log('Knowledge changes:', diffs);
        } else {
          console.log('No knowledge changes.');
        }
      }
      setCardKnowledge([...updatedKnowledge]);
      alert("Guess submitted! Processing...");
      return;
    }
    // Default case: update knowledge and tuples
    const askedPlayers = gameData && gameData.playerOrder && guessData.guessedBy
      ? getAskedPlayers(gameData.playerOrder, guessData.guessedBy, guessData.showedBy)
      : [];
    console.log('Asked players for deduction:', askedPlayers);
    // Track knowledge before
    const before = JSON.stringify(cardKnowledge);
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
    // Track knowledge after
    const after = JSON.stringify(result.knowledge);
    if (before !== after) {
      // Find what changed
      const beforeObj = cardKnowledge;
      const afterObj = result.knowledge;
      const diffs: string[] = [];
      for (let i = 0; i < beforeObj.length; i++) {
        const beforeCard = beforeObj[i];
        const afterCard = afterObj[i];
        for (const player of Object.keys(beforeCard.inPlayersHand)) {
          if (beforeCard.inPlayersHand[player] !== afterCard.inPlayersHand[player]) {
            diffs.push(`Player ${player} for card ${beforeCard.cardName}: ${beforeCard.inPlayersHand[player]} -> ${afterCard.inPlayersHand[player]}`);
          }
        }
      }
      console.log('Knowledge changes:', diffs);
    } else {
      console.log('No knowledge changes.');
    }
    setPlayerTuples([...result.tuples]);
    setCardKnowledge([...result.knowledge]);
    alert("Guess submitted! Processing...");
    setPreviousGuesses(prev => [
      ...prev,
      {
        room: guessData.room || guessData.selectedRoom,
        suspect: guessData.suspect || guessData.selectedSuspect,
        weapon: guessData.weapon || guessData.selectedWeapon,
      }
    ]);
  };

  // Go back to setup
  const handleBackToSetup = () => {
    setCurrentStep("setup");
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
          onBack={handleBackToSetup}
          players={gameData.players}
        />
      )}

      {currentStep === "gameplay" && gameData && (
        <>
          <button
            onClick={() => {
              setCurrentStep("setup");
              setGameData(null);
              setUserHand([]);
              setCardKnowledge([]);
              setPlayerTuples([]);
              setAccessibleRooms([]);
              setPlayerOrder([]);
              setCurrentTurn(0);
              setPreviousGuesses([]);
              setCurrentUser("");
              setGuessState({
                selectedSuspect: '',
                selectedWeapon: '',
                selectedRoom: '',
                guessedBy: '',
                showedBy: null,
                shownCard: '',
              });
            }}
            style={{ marginBottom: 16 }}
          >
            End Game
          </button>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <KnowledgeTable
                cardKnowledge={cardKnowledge}
                players={gameData.players}
                onKnowledgeChange={setCardKnowledge}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <GuessForm
                suspects={gameData.suspects}
                weapons={gameData.weapons}
                rooms={gameData.rooms}
                answeringPlayers={getAskedPlayers(gameData.playerOrder, guessState.guessedBy, guessState.showedBy)}
                allPlayers={gameData.players}
                currentUser={currentUser}
                {...guessState}
                onGuessSubmit={handleGuessSubmit}
                onGuessChange={handleGuessChange}
                onGuessedByChange={handleGuessedByChange}
                onShowedByChange={handleShowedByChange}
                onShownCardChange={handleShownCardChange}
                onResetForm={() => setGuessState({
                  selectedSuspect: '',
                  selectedWeapon: '',
                  selectedRoom: '',
                  guessedBy: '',
                  showedBy: null,
                  shownCard: '',
                })}
              />
            </div>
          </div>
          <RoomChecklist
            rooms={gameData.rooms}
            selectedRooms={accessibleRooms}
            onChange={setAccessibleRooms}
          />
          <GuessEvaluator
            accessibleRooms={accessibleRooms}
            suspects={gameData.suspects}
            weapons={gameData.weapons}
            gameState={{
              knowledge: cardKnowledge as any, // FIXME: Type mismatch, CardKnowledge[] may not match expected type
              previousGuesses: previousGuesses,
              playerOrder: gameData.playerOrder, // playerOrder only in gameState now
            }}
            // Optionally pass a real evaluateGuess here
          />
        </>
      )}
    </div>
  );
}

export default App;
