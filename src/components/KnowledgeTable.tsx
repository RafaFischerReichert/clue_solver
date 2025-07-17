import React from "react";
import { CardKnowledge } from "./GameLogic";

interface KnowledgeTableProps {
  cardKnowledge: CardKnowledge[];
  players: string[];
  onKnowledgeChange: (updatedKnowledge: CardKnowledge[]) => void;
  handSizes: Record<string, number>; // Actual hand sizes for each player
}

// Create table structure (one column per player, one row per card)
const KnowledgeTable: React.FC<KnowledgeTableProps> = (props) => {
  // Validate props and handle invalid inputs gracefully
  let players = props.players;
  let cardKnowledge = props.cardKnowledge;
  let handSizes = props.handSizes;

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

  // Compute known card counts for each player
  const knownCardCounts: Record<string, number> = {};
  const knowFullHand: Record<string, boolean> = {};
  players.forEach(player => {
    knownCardCounts[player] = cardKnowledge.filter(card => card.inPlayersHand[player] === true).length;
    knowFullHand[player] = handSizes && handSizes[player] !== undefined && knownCardCounts[player] === handSizes[player];
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
  return (
    <div>
      <h2>Knowledge Table</h2>
      <div className="solution-summary-box">
        <label className="solution-label">Known solution cards: </label>
        {knownSolution}
      </div>
      <div style={{ marginBottom: 8 }}>
        <strong>Hand size per player:</strong> {players.map(p => `${p}: ${handSizes && handSizes[p] !== undefined ? handSizes[p] : '?'}`).join(', ')}
      </div>
      <table className="knowledge-table-dark">
        <thead>
          <tr>
            <th>Cards</th>
            {players.map((player) => (
              <th key={player}>
                {player}
                <span
                  className="secondary-text"
                  style={{
                    marginLeft: 4,
                    fontWeight: knowFullHand[player] ? 'bold' : undefined,
                    color: knowFullHand[player] ? 'green' : undefined,
                  }}
                >
                  ({knownCardCounts[player]} / {handSizes && handSizes[player] !== undefined ? handSizes[player] : '?'})
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
