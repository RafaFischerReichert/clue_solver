import { useState, useRef, useEffect } from "react";
import "./App.css";
import GameSetup from "./components/GameSetup";
import PlayerOrderSetup from "./components/PlayerOrderSetup";
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
  checkForSolution, // <-- add this import
} from "./components/GameLogic";
import React from "react";
import { Guess } from "./components/GuessEvaluator";

// RoomChecklist: lets user select accessible rooms
interface RoomChecklistProps {
  rooms: string[];
  selectedRooms: string[];
  onChange: (rooms: string[]) => void;
}

const RoomChecklist: React.FC<RoomChecklistProps> = ({
  rooms,
  selectedRooms,
  onChange,
}) => {
  // Toggle room selection
  const handleToggle = (room: string) => {
    if (selectedRooms.includes(room)) {
      onChange(selectedRooms.filter((r) => r !== room));
    } else {
      onChange([...selectedRooms, room]);
    }
  };
  return (
    <div>
      <h3>Accessible Rooms</h3>
      {rooms.map((room) => (
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
  handSizes: Record<string, number>;
  currentTurn: number;
}

// Utility to compute asked players
function getAskedPlayers(
  playerOrder: string[],
  guessedBy: string,
  showedBy: string | null
): string[] {
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
  const [currentStep, setCurrentStep] = useState<
    "setup" | "player-order-setup" | "hand-input" | "gameplay"
  >("setup");
  // Game setup data
  const [gameData, setGameData] = useState<GameData | null>(null);
  // Guess form state
  const [guessState, setGuessState] = useState({
    selectedSuspect: "",
    selectedWeapon: "",
    selectedRoom: "",
    guessedBy: "",
    showedBy: null as string | null,
    shownCard: "",
  });
  const [currentUser, setCurrentUser] = useState<string>("");
  const [cardKnowledge, setCardKnowledge] = useState<CardKnowledge[]>([]);
  const [playerTuples, setPlayerTuples] = useState<PlayerCardTuples[]>([]);
  // Accessible rooms for checklist
  const [accessibleRooms, setAccessibleRooms] = useState<string[]>([]);
  const [previousGuesses, setPreviousGuesses] = useState<Guess[]>([]);
  const [workerResult, setWorkerResult] = useState<{
    guess: Guess;
    entropy: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);
  // Store the user's hand
  const [userHand, setUserHand] = useState<string[]>([]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("./workers/guessWorker.ts", import.meta.url),
      { type: "module" }
    );
    workerRef.current.onmessage = (e) => {
      setWorkerResult(e.data);
      setLoading(false);
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Handle game setup completion
  const handleGameSetup = (
    players: string[],
    yourPlayerName: string,
    suspects: string[],
    weapons: string[],
    rooms: string[]
  ) => {
    const newGameData = {
      players,
      suspects,
      weapons,
      rooms,
      playerOrder: players,
      handSizes: {}, // Will be set in PlayerOrderSetup
      currentTurn: 0,
    };
    setGameData(newGameData);
    setCurrentStep("player-order-setup");
    if (yourPlayerName) setCurrentUser(yourPlayerName);
  };

  // Handle hand input completion
  const handleHandSubmit = (selectedCards: string[]) => {
    if (gameData) {
      const allCards = {
        suspects: gameData.suspects,
        weapons: gameData.weapons,
        rooms: gameData.rooms,
      };
      setCardKnowledge(
        initializeKnowledgeBase(
          selectedCards,
          allCards,
          gameData.players,
          currentUser
        )
      );
      setUserHand(selectedCards);
    }
    setCurrentStep("gameplay");
  };

  // Guess form changes
  const handleGuessChange = (suspect: string, weapon: string, room: string) => {
    setGuessState((prev) => ({
      ...prev,
      selectedSuspect: suspect,
      selectedWeapon: weapon,
      selectedRoom: room,
    }));
  };
  const handleGuessedByChange = (player: string) => {
    setGuessState((prev) => ({
      ...prev,
      guessedBy: player,
    }));
  };
  const handleShowedByChange = (player: string | null) => {
    setGuessState((prev) => ({
      ...prev,
      showedBy: player,
    }));
  };
  const handleShownCardChange = (card: string) => {
    setGuessState((prev) => ({
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
        const askedPlayers = getAskedPlayers(
          gameData.playerOrder,
          guessData.guessedBy,
          guessData.showedBy
        );
        // Exclude the shower
        const nonShowerAsked = askedPlayers.filter(
          (p) => p !== guessData.showedBy
        );
        // Mark all three cards as not in their hand
        for (const player of nonShowerAsked) {
          updatedKnowledge = markCardNotInPlayerHand(
            updatedKnowledge,
            guessData.suspect || guessData.selectedSuspect,
            player
          );
          updatedKnowledge = markCardNotInPlayerHand(
            updatedKnowledge,
            guessData.weapon || guessData.selectedWeapon,
            player
          );
          updatedKnowledge = markCardNotInPlayerHand(
            updatedKnowledge,
            guessData.room || guessData.selectedRoom,
            player
          );
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
              if (
                beforeCard.inPlayersHand[player] !==
                afterCard.inPlayersHand[player]
              ) {
                diffs.push(
                  `Player ${player} for card ${beforeCard.cardName}: ${beforeCard.inPlayersHand[player]} -> ${afterCard.inPlayersHand[player]}`
                );
              }
            }
          }
          console.log("Knowledge changes:", diffs);
        } else {
          console.log("No knowledge changes.");
        }
      }
      setCardKnowledge(checkForSolution([...updatedKnowledge]));
      return;
    }
    // Default case: update knowledge and tuples
    const askedPlayers =
      gameData && gameData.playerOrder && guessData.guessedBy
        ? getAskedPlayers(
            gameData.playerOrder,
            guessData.guessedBy,
            guessData.showedBy
          )
        : [];
    console.log("Asked players for deduction:", askedPlayers);
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
          if (
            beforeCard.inPlayersHand[player] !== afterCard.inPlayersHand[player]
          ) {
            diffs.push(
              `Player ${player} for card ${beforeCard.cardName}: ${beforeCard.inPlayersHand[player]} -> ${afterCard.inPlayersHand[player]}`
            );
          }
        }
      }
      console.log("Knowledge changes:", diffs);
    } else {
      console.log("No knowledge changes.");
    }
    setPlayerTuples([...result.tuples]);
    setCardKnowledge(checkForSolution([...result.knowledge]));
    setPreviousGuesses((prev) => [
      ...prev,
      {
        room: guessData.room || guessData.selectedRoom,
        suspect: guessData.suspect || guessData.selectedSuspect,
        weapon: guessData.weapon || guessData.selectedWeapon,
      },
    ]);
  };

  // Go back to setup
  const handleBackToSetup = () => {
    setCurrentStep("setup");
  };

  return (
    <div className="App">
      <h1>Cluedo Solver</h1>
      <div className="version-label">Version 1.2.1</div>

      {currentStep === "setup" && <GameSetup onGameStart={handleGameSetup} />}

      {currentStep === "player-order-setup" && gameData && (
        <PlayerOrderSetup
          players={gameData.players}
          onComplete={(playerOrder, handSizes) => {
            setGameData((prev) =>
              prev
                ? {
                    ...prev,
                    playerOrder,
                    handSizes,
                  }
                : null
            );
            setCurrentStep("hand-input");
          }}
          onBack={handleBackToSetup}
        />
      )}

      {currentStep === "hand-input" && gameData && (
        <HandInput
          suspects={gameData.suspects}
          weapons={gameData.weapons}
          rooms={gameData.rooms}
          onHandSubmit={handleHandSubmit}
          onBack={() => setCurrentStep("player-order-setup")}
          handSizes={gameData.handSizes}
          currentUser={currentUser}
        />
      )}

      {currentStep === "gameplay" && gameData && (
        <>
          <div>
            <button
              className="btn-secondary"
              onClick={() => {
                setCurrentStep("setup");
                setGameData(null);
                setCardKnowledge([]);
                setPlayerTuples([]);
                setAccessibleRooms([]);
                setPreviousGuesses([]);
                setCurrentUser("");
                setGuessState({
                  selectedSuspect: "",
                  selectedWeapon: "",
                  selectedRoom: "",
                  guessedBy: "",
                  showedBy: null,
                  shownCard: "",
                });
              }}
            >
              End Game
            </button>
          </div>
          <div className="main-three-column">
            <div className="knowledge-table-section">
              <KnowledgeTable
                cardKnowledge={cardKnowledge}
                players={gameData.players}
                onKnowledgeChange={setCardKnowledge}
                handSizes={gameData.handSizes}
              />
            </div>
            <div className="guess-form-container">
              <GuessForm
                suspects={gameData.suspects}
                weapons={gameData.weapons}
                rooms={gameData.rooms}
                answeringPlayers={getAskedPlayers(
                  gameData.playerOrder,
                  guessState.guessedBy,
                  guessState.showedBy
                )}
                allPlayers={gameData.players}
                currentUser={currentUser}
                {...guessState}
                onGuessSubmit={handleGuessSubmit}
                onGuessChange={handleGuessChange}
                onGuessedByChange={handleGuessedByChange}
                onShowedByChange={handleShowedByChange}
                onShownCardChange={handleShownCardChange}
                onResetForm={() =>
                  setGuessState({
                    selectedSuspect: "",
                    selectedWeapon: "",
                    selectedRoom: "",
                    guessedBy: "",
                    showedBy: null,
                    shownCard: "",
                  })
                }
                userHand={userHand}
              />
            </div>
            {/* Guess evaluation block: button, loading, and result */}
            <div className="room-checklist-container">
              <RoomChecklist
                rooms={gameData.rooms}
                selectedRooms={accessibleRooms}
                onChange={setAccessibleRooms}
              />
              <button
                onClick={() => {
                  setLoading(true);
                  setWorkerResult(null);
                  // Get current accessible rooms before clearing them
                  const currentAccessibleRooms =
                    accessibleRooms.length > 0
                      ? accessibleRooms
                      : gameData.rooms;
                  // Clear accessible rooms to facilitate next evaluation
                  setAccessibleRooms([]);
                  // Improved guess generation logic
                  const getGuessOptions = (
                    category: "suspect" | "weapon" | "room",
                    allOptions: string[]
                  ) => {
                    // Find solution card for this category
                    const solutionCard = cardKnowledge.find(
                      (c) => c.category === category && c.inSolution === true
                    )?.cardName;
                    // Find cards in hand for this category
                    const inHand = cardKnowledge
                      .filter((c) => c.category === category && c.inYourHand)
                      .map((c) => c.cardName);
                    let options: string[] = [];
                    if (solutionCard) {
                      options = [
                        solutionCard,
                        ...inHand.filter((card) => card !== solutionCard),
                      ];
                    } else {
                      options = allOptions;
                    }
                    return options;
                  };
                  const suspects = getGuessOptions(
                    "suspect",
                    gameData.suspects
                  );
                  const weapons = getGuessOptions("weapon", gameData.weapons);
                  const rooms = getGuessOptions("room", currentAccessibleRooms);
                  let allGuesses: Guess[] = [];
                  rooms.forEach((room) => {
                    suspects.forEach((suspect) => {
                      weapons.forEach((weapon) => {
                        allGuesses.push({ room, suspect, weapon });
                      });
                    });
                  });
                  // Filter: keep only guesses with at least one card where inSolution == null
                  allGuesses = allGuesses.filter((guess) => {
                    const suspectCard = cardKnowledge.find((c) => c.cardName === guess.suspect);
                    const weaponCard = cardKnowledge.find((c) => c.cardName === guess.weapon);
                    const roomCard = cardKnowledge.find((c) => c.cardName === guess.room);
                    // Exclude guesses where any card is known to be in another player's hand
                    const isInOtherPlayersHand = (card: CardKnowledge | undefined, user: string) => {
                      if (!card || !card.inPlayersHand) return false;
                      return Object.entries(card.inPlayersHand).some(
                        ([player, hasIt]) => player !== user && hasIt === true
                      );
                    };
                    if (
                      isInOtherPlayersHand(suspectCard, currentUser) ||
                      isInOtherPlayersHand(weaponCard, currentUser) ||
                      isInOtherPlayersHand(roomCard, currentUser)
                    ) {
                      return false;
                    }
                    // Keep only guesses with at least one card where inSolution == null
                    const suspectStatus = suspectCard?.inSolution;
                    const weaponStatus = weaponCard?.inSolution;
                    const roomStatus = roomCard?.inSolution;
                    return [suspectStatus, weaponStatus, roomStatus].some(
                      (status) => status === null
                    );
                  });
                  workerRef.current?.postMessage({
                    allGuesses,
                    gameState: {
                      knowledge: cardKnowledge as any,
                      previousGuesses: previousGuesses,
                      playerOrder: gameData.playerOrder,
                    },
                  });
                }}
                style={{ marginLeft: 8 }}
              >
                Evaluate Best Guess
              </button>
              {loading && <div>Evaluating guesses...</div>}
              {workerResult && (
                <div>
                  <h2>Optimal Guess (via Worker):</h2>
                  <ul>
                    <li>Room: {workerResult.guess.room}</li>
                    <li>Suspect: {workerResult.guess.suspect}</li>
                    <li>Weapon: {workerResult.guess.weapon}</li>
                    <li>
                      Estimated Entropy Gain: {workerResult.entropy.toFixed(3)}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
