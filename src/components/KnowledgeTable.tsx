import React from "react";
import { CardKnowledge } from "./GameLogic";
import { getPossibleHandSizes } from "./GameLogic";

interface KnowledgeTableProps {
  cardKnowledge: CardKnowledge[];
  players: string[];
  onKnowledgeChange: (updatedKnowledge: CardKnowledge[]) => void;
}

// Create table structure (one column per player, one row per card)
const KnowledgeTable: React.FC<KnowledgeTableProps> = (props) => {
  // Validate props and handle invalid inputs gracefully
  let players = props.players;
  let cardKnowledge = props.cardKnowledge;

  if (!Array.isArray(players)) {
    console.warn(
      "KnowledgeTable: Invalid props - players must be an array, received:",
      players
    );
    players = [];
  }

  if (!Array.isArray(cardKnowledge)) {
    console.warn(
      "KnowledgeTable: Invalid props - cardKnowledge must be an array, received:",
      cardKnowledge
    );
    cardKnowledge = [];
  }

  let possibleHandSizes: number[] = [];
  let handSizeError: string | null = null;
  try {
    possibleHandSizes = getPossibleHandSizes(players.length);
  } catch (e) {
    handSizeError = (e instanceof Error) ? e.message : String(e);
    console.warn("KnowledgeTable: ", handSizeError);
  }

  // Compute known card counts for each player
  const knownCardCounts: Record<string, number> = {};
  players.forEach(player => {
    knownCardCounts[player] = cardKnowledge.filter(card => card.inPlayersHand[player] === true).length;
  });

  // Calculate known solution cards
  const knownSolution = [
    "suspect",
    "weapon",
    "room"
  ].map((category) => {
    const solutionCard = cardKnowledge.find(
      (c) => c.category === category && c.inSolution === true
    );
    return solutionCard ? solutionCard.cardName : "Unknown";
  }).join(", ");

  // Implementation of the KnowledgeTable component
  if (handSizeError) {
    return (
      <div>
        <h2>Knowledge Table</h2>
        <div className="error-message" style={{ marginBottom: 8 }}>
          Error: {handSizeError}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Knowledge Table</h2>
      <div className="solution-summary-box">
        <label className="solution-label">Known solution cards: </label>
        {knownSolution}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Possible hand sizes per player:</strong> {possibleHandSizes.join(" or ")}
      </div>
      <table className="knowledge-table-dark">
        <thead>
          <tr>
            <th>Cards</th>
            {players.map((player) => (
              <th key={player}>
                {player}
                <span className="secondary-text" style={{ marginLeft: 4 }}>
                  ({knownCardCounts[player]})
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cardKnowledge.map((card) => (
            <tr key={card.cardName} className={`category-${card.category}`}>
              <td>{card.cardName}</td>
              {players.map((player) => {
                // If card is in your hand, show "Hand"
                if (card.inYourHand) {
                  return <td key={player}>Hand</td>;
                }
                // If card is in this player's hand, show checkmark
                if (card.inPlayersHand[player]) {
                  return <td key={player}>✓</td>;
                }
                // If we know the player doesn't have the card, show X
                if (card.inPlayersHand[player] === false) {
                  return <td key={player}>✗</td>;
                }
                // Otherwise show empty cell for no info
                return <td key={player}></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default KnowledgeTable;
