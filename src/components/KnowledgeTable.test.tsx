import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KnowledgeTable from './KnowledgeTable';
import { CardKnowledge } from './GameLogic';

describe('KnowledgeTable', () => {
  const mockPlayers = ['Alice', 'Bob', 'Charlie'];
  const mockCardKnowledge: CardKnowledge[] = [
    {
      cardName: 'Miss Scarlet',
      category: 'suspect',
      inYourHand: true,
      inPlayersHand: { 'Alice': false, 'Bob': null, 'Charlie': null },
      inSolution: false,
      eliminatedFromSolution: true
    },
    {
      cardName: 'Candlestick',
      category: 'weapon',
      inYourHand: false,
      inPlayersHand: { 'Alice': null, 'Bob': true, 'Charlie': false },
      inSolution: null,
      eliminatedFromSolution: false
    },
    {
      cardName: 'Ballroom',
      category: 'room',
      inYourHand: false,
      inPlayersHand: { 'Alice': null, 'Bob': null, 'Charlie': null },
      inSolution: null,
      eliminatedFromSolution: false
    }
  ];

  it('renders without crashing', () => {
    render(
      <KnowledgeTable 
        cardKnowledge={mockCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
      />
    );
    expect(screen.getByText('Knowledge Table')).toBeInTheDocument();
  });

  it('displays all players as column headers', () => {
    render(
      <KnowledgeTable 
        cardKnowledge={mockCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
      />
    );
    
    mockPlayers.forEach(player => {
      expect(screen.getByText(player)).toBeInTheDocument();
    });
  });

  it('displays all cards as row headers', () => {
    render(
      <KnowledgeTable 
        cardKnowledge={mockCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
      />
    );
    
    mockCardKnowledge.forEach(card => {
      expect(screen.getByText(card.cardName)).toBeInTheDocument();
    });
  });

  it('shows correct knowledge state for cards in your hand', () => {
    render(
      <KnowledgeTable 
        cardKnowledge={mockCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
      />
    );
    // Miss Scarlet should be marked as in your hand
    const scarletRow = screen.getByText('Miss Scarlet').closest('tr');
    expect(scarletRow).toHaveTextContent('Your Hand');
  });

  it('shows checkmark for true, X for false, and empty for null', () => {
    render(
      <KnowledgeTable 
        cardKnowledge={mockCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
      />
    );
    // Candlestick: Bob has it (✓), Charlie does not (✗), Alice unknown (empty)
    const candlestickRow = screen.getByText('Candlestick').closest('tr');
    expect(candlestickRow).toHaveTextContent('✓');
    expect(candlestickRow).toHaveTextContent('✗');
    // Alice's cell should be empty (no ✓ or ✗)
    const aliceCell = candlestickRow?.querySelectorAll('td')[1]; // 0: card name, 1: Alice, 2: Bob, 3: Charlie
    expect(aliceCell?.textContent).toBe('');
  });

  it('shows empty cell for all null/unknown', () => {
    render(
      <KnowledgeTable 
        cardKnowledge={mockCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
      />
    );
    // Ballroom: all players unknown
    const ballroomRow = screen.getByText('Ballroom').closest('tr');
    // All player cells should be empty
    const tds = ballroomRow?.querySelectorAll('td');
    expect(tds && tds.length).toBe(4); // card name + 3 players
    expect(tds?.[1].textContent).toBe('');
    expect(tds?.[2].textContent).toBe('');
    expect(tds?.[3].textContent).toBe('');
  });
});
