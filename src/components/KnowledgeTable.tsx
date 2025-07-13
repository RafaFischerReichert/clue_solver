import React from 'react';
import { CardKnowledge } from './GameLogic';


interface KnowledgeTableProps {
  cardKnowledge: CardKnowledge[];
  players: string[];
  onKnowledgeChange: (updatedKnowledge: CardKnowledge[]) => void;
}

// Create table structure (one column per player, one row per card)
const KnowledgeTable: React.FC<KnowledgeTableProps> = (props) => {
    // Implementation of the KnowledgeTable component
    return (
        <div>
          <h2>Knowledge Table</h2>
          <table>
            <thead>
              <tr>
                <th>Cards</th>
                {props.players.map(player => (
                  <th key={player}>{player}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.cardKnowledge.map(card => (
                <tr key={card.cardName}>
                  <td>{card.cardName}</td>
                  {props.players.map(player => {
                    // If card is in your hand, show "Your Hand"
                    if (card.inYourHand) {
                      return <td key={player}>Your Hand</td>;
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
    )
}

export default KnowledgeTable;