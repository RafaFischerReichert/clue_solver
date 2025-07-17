import React, { useState, useEffect } from "react";
import { getPossibleHandSizes, getValidHandSizeCombinations, isValidHandSizeCombination } from "./GameLogic";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";


interface PlayerOrderSetupProps {
  players: string[];
  onComplete: (playerOrder: string[], handSizes: Record<string, number>) => void;
  onBack: () => void;
}

const PlayerOrderSetup: React.FC<PlayerOrderSetupProps> = ({
  players,
  onComplete,
  onBack,
}) => {
  const [playerOrder, setPlayerOrder] = useState<string[]>(players);
  const [handSizes, setHandSizes] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize hand sizes with default values
  useEffect(() => {
    const defaultHandSizes: Record<string, number> = {};
    const possibleSizes = getPossibleHandSizes(players.length);
    const defaultSize = possibleSizes[0]; // Use the first possible size as default
    
    players.forEach(player => {
      defaultHandSizes[player] = defaultSize;
    });
    setHandSizes(defaultHandSizes);
  }, [players]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newOrder = Array.from(playerOrder);
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);
    setPlayerOrder(newOrder);
  };

  const handleHandSizeChange = (player: string, size: number) => {
    setHandSizes(prev => ({
      ...prev,
      [player]: size
    }));
  };

  const validateSetup = (): boolean => {
    const newErrors: string[] = [];
    
    // Check if all players have hand sizes
    players.forEach(player => {
      if (!handSizes[player] || handSizes[player] <= 0) {
        newErrors.push(`${player} must have a valid hand size`);
      }
    });

    // Check if hand sizes are valid for the number of players
    const possibleSizes = getPossibleHandSizes(players.length);
    players.forEach(player => {
      if (!possibleSizes.includes(handSizes[player])) {
        newErrors.push(`${player}'s hand size (${handSizes[player]}) is not valid for ${players.length} players. Valid sizes: ${possibleSizes.join(", ")}`);
      }
    });

    // Check if total cards distributed equals exactly 18
    if (!isValidHandSizeCombination(handSizes)) {
      const totalCardsDistributed = Object.values(handSizes).reduce((sum, size) => sum + size, 0);
      newErrors.push(`Total cards distributed (${totalCardsDistributed}) must equal exactly 18. 3 cards are in the solution.`);
      
      // Provide helpful suggestions for valid combinations
      const validCombinations = getValidHandSizeCombinations(players.length);
      if (validCombinations.length > 0) {
        const suggestions = validCombinations.slice(0, 3).map(combo => combo.join(", "));
        newErrors.push(`Valid combinations: ${suggestions.join("; ")}`);
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateSetup()) {
      onComplete(playerOrder, handSizes);
    }
  };

  const possibleHandSizes = getPossibleHandSizes(players.length);
  const validCombinations = getValidHandSizeCombinations(players.length);
  const totalCardsDistributed = Object.values(handSizes).reduce((sum, size) => sum + size, 0);

  // Debug: Log playerOrder to ensure uniqueness and stability for draggableId
  console.log('playerOrder for Draggable:', playerOrder);

  return (
    <div className="form-section">
      <h2>Player Order & Hand Sizes</h2>
      <p>Configure the turn order and how many cards each player has.</p>

      {/* Player Order Section */}
      <div className="player-order-section">
        <h3>Turn Order</h3>
        <p>Drag players to reorder them (first player goes first):</p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="playerOrderList">
            {(provided: import("react-beautiful-dnd").DroppableProvided) => (
              <div
                className="player-order-list"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {playerOrder.map((player, index) => (
                  // Player names are unique and used as draggableId and key
                  <Draggable key={player} draggableId={player} index={index}>
                    {(provided: import("react-beautiful-dnd").DraggableProvided, snapshot: import("react-beautiful-dnd").DraggableStateSnapshot) => (
                      <div
                        className={`dnd-item${snapshot.isDragging ? " dragging" : ""}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={provided.draggableProps.style}
                      >
                        <span className="player-order-index">{index + 1}.</span>
                        <span>{player}</span>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Hand Sizes Section */}
      <div>
        <h3>Hand Sizes</h3>
        <p>Set how many cards each player has:</p>
        <div>
          {players.map(player => (
            <div key={player}>
              <label>
                {player}:
              </label>
              <select
                value={handSizes[player] || ""}
                onChange={(e) => handleHandSizeChange(player, parseInt(e.target.value))}
              >
                <option value="">Select size</option>
                {possibleHandSizes.map(size => (
                  <option key={size} value={size}>
                    {size} cards
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <div className="hand-sizes-info">
          <p>Valid hand sizes for {players.length} players: {possibleHandSizes.join(", ")}</p>
          <p>Total cards to distribute: 18 (3 cards are in the solution)</p>
          <p>Current total: {totalCardsDistributed} {totalCardsDistributed === 18 ? "✅" : "❌"}</p>
          {validCombinations.length > 0 && (
            <p>Valid combinations: {validCombinations.slice(0, 3).map(combo => combo.join(", ")).join("; ")}</p>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="error-box">
          <h4 className="error-title">Please fix the following errors:</h4>
          <ul className="error-list">
            {errors.map((error, index) => (
              <li key={index} className="error-item">{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={onBack}
          className="btn-secondary"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="btn-primary"
          disabled={errors.length > 0}
        >
          Continue to Hand Input
        </button>
      </div>
    </div>
  );
};

export default PlayerOrderSetup; 