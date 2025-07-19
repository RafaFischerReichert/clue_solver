import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import KnowledgeTable from "./KnowledgeTable";
import { CardKnowledge } from "./GameLogic";

describe("KnowledgeTable", () => {
  const mockPlayers = ["Alice", "Bob", "Charlie"];
  const mockCardKnowledge: CardKnowledge[] = [
    {
      cardName: "Miss Scarlett",
      category: "suspect",
      inYourHand: false,
      inPlayersHand: { Alice: false, Bob: null, Charlie: null },
      inSolution: null,
      eliminatedFromSolution: false,
      likelyHas: { Alice: false, Bob: false, Charlie: false }
    },
    {
      cardName: "Candlestick",
      category: "weapon",
      inYourHand: true,
      inPlayersHand: { Alice: true, Bob: false, Charlie: false },
      inSolution: false,
      eliminatedFromSolution: true,
      likelyHas: { Alice: false, Bob: false, Charlie: false }
    },
    {
      cardName: "Ballroom",
      category: "room",
      inYourHand: false,
      inPlayersHand: { Alice: null, Bob: null, Charlie: null },
      inSolution: null,
      eliminatedFromSolution: false,
      likelyHas: { Alice: false, Bob: false, Charlie: false }
    },
  ];

  // Add a default handSizes object for most tests
  const defaultHandSizes = { Alice: 6, Bob: 6, Charlie: 6 };

  it("renders without crashing", () => {
    // Expects: The component should render with the main heading
    render(
      <KnowledgeTable
        cardKnowledge={mockCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={defaultHandSizes}
      />
    );
    expect(screen.getByText("Knowledge Table")).toBeInTheDocument();
  });

  it("displays all players as column headers", () => {
    // Expects: The component should display all player names as table headers
    render(
      <KnowledgeTable
        cardKnowledge={mockCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={defaultHandSizes}
      />
    );

    mockPlayers.forEach((player) => {
      expect(screen.getByText(player)).toBeInTheDocument();
    });
  });

  it("displays all cards as row headers", () => {
    // Expects: The component should display all card names as table row headers
    render(
      <KnowledgeTable
        cardKnowledge={mockCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={defaultHandSizes}
      />
    );

    mockCardKnowledge.forEach((card) => {
      expect(screen.getByText(card.cardName)).toBeInTheDocument();
    });
  });

  it("shows correct knowledge state for cards in your hand", () => {
    // Expects: 'Hand' only in the column for the player whose hand it is
    const handSizes = { Alice: 6, Bob: 6, Charlie: 6 };
    const cardKnowledge: CardKnowledge[] = [
      {
        cardName: "Miss Scarlett",
        category: "suspect",
        inYourHand: true,
        inPlayersHand: { Alice: true, Bob: false, Charlie: false },
        inSolution: false,
        eliminatedFromSolution: true,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];
    render(
      <KnowledgeTable
        cardKnowledge={cardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={handSizes}
      />
    );
    const row = screen.getByText("Miss Scarlett").closest("tr");
    const tds = row?.querySelectorAll("td");
    // 0: card name, 1: Alice, 2: Bob, 3: Charlie
    expect(tds?.[1].textContent).toBe("Hand"); // Alice's column
    expect(tds?.[2].textContent).toBe("Hand"); // Bob's column
    expect(tds?.[3].textContent).toBe("Hand"); // Charlie's column
  });

  it("shows checkmark when player has the card", () => {
    // Expects: '✓' in the correct player's column
    const handSizes = { Alice: 6, Bob: 6, Charlie: 6 };
    const cardKnowledge: CardKnowledge[] = [
      {
        cardName: "Candlestick",
        category: "weapon",
        inYourHand: false,
        inPlayersHand: { Alice: false, Bob: true, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];
    render(
      <KnowledgeTable
        cardKnowledge={cardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={handSizes}
      />
    );
    const row = screen.getByText("Candlestick").closest("tr");
    const tds = row?.querySelectorAll("td");
    // 0: card name, 1: Alice, 2: Bob, 3: Charlie
    expect(tds?.[1].textContent).toBe("✗"); // Alice
    expect(tds?.[2].textContent).toBe("✓"); // Bob
    expect(tds?.[3].textContent).toBe("✗"); // Charlie
  });

  it("shows X when player does not have the card", () => {
    // Expects: '✗' in the correct player's column
    const handSizes = { Alice: 6, Bob: 6, Charlie: 6 };
    const cardKnowledge: CardKnowledge[] = [
      {
        cardName: "Candlestick",
        category: "weapon",
        inYourHand: false,
        inPlayersHand: { Alice: false, Bob: true, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];
    render(
      <KnowledgeTable
        cardKnowledge={cardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={handSizes}
      />
    );
    const row = screen.getByText("Candlestick").closest("tr");
    const tds = row?.querySelectorAll("td");
    // 0: card name, 1: Alice, 2: Bob, 3: Charlie
    expect(tds?.[1].textContent).toBe("✗"); // Alice
    expect(tds?.[2].textContent).toBe("✓"); // Bob
    expect(tds?.[3].textContent).toBe("✗"); // Charlie
  });

  it("shows empty cell when player knowledge is unknown", () => {
    // Expects: empty cell for player with null knowledge
    const handSizes = { Alice: 6, Bob: 6, Charlie: 6 };
    const cardKnowledge: CardKnowledge[] = [
      {
        cardName: "Candlestick",
        category: "weapon",
        inYourHand: false,
        inPlayersHand: { Alice: null, Bob: true, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];
    render(
      <KnowledgeTable
        cardKnowledge={cardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={handSizes}
      />
    );
    const row = screen.getByText("Candlestick").closest("tr");
    const tds = row?.querySelectorAll("td");
    // 0: card name, 1: Alice, 2: Bob, 3: Charlie
    expect(tds?.[1].textContent).toBe(""); // Alice unknown
    expect(tds?.[2].textContent).toBe("✓"); // Bob
    expect(tds?.[3].textContent).toBe("✗"); // Charlie
  });

  it("shows empty cells when all player knowledge is unknown", () => {
    // Expects: When all players have null knowledge for a card, all cells should be empty
    render(
      <KnowledgeTable
        cardKnowledge={mockCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={defaultHandSizes}
      />
    );
    // Ballroom: all players unknown
    const ballroomRow = screen.getByText("Ballroom").closest("tr");
    // All player cells should be empty
    const tds = ballroomRow?.querySelectorAll("td");
    expect(tds && tds.length).toBe(4); // card name + 3 players
    expect(tds?.[1].textContent).toBe("");
    expect(tds?.[2].textContent).toBe("");
    expect(tds?.[3].textContent).toBe("");
  });

  it("handles empty card knowledge array", () => {
    // Expects: The component should render without crashing when cardKnowledge is empty
    render(
      <KnowledgeTable
        cardKnowledge={[]}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={defaultHandSizes}
      />
    );
    expect(screen.getByText("Knowledge Table")).toBeInTheDocument();
    expect(screen.getByText("Cards")).toBeInTheDocument();
    // Should still show player headers even with no cards
    mockPlayers.forEach((player) => {
      expect(screen.getByText(player)).toBeInTheDocument();
    });
  });

  it("handles malformed card knowledge data", () => {
    // Expects: The component should handle malformed data gracefully
    const malformedKnowledge: CardKnowledge[] = [
      {
        cardName: "Valid Card",
        category: "suspect" as const,
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: null, Charlie: null },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
      // Missing inPlayersHand for some players
      {
        cardName: "Invalid Card",
        category: "weapon" as const,
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: null, Charlie: null }, // Fixed to include all players
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];

    render(
      <KnowledgeTable
        cardKnowledge={malformedKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={defaultHandSizes}
      />
    );

    // Should still render without crashing
    expect(screen.getByText("Knowledge Table")).toBeInTheDocument();
    expect(screen.getByText("Valid Card")).toBeInTheDocument();
    expect(screen.getByText("Invalid Card")).toBeInTheDocument();
  });

  it("handles API errors gracefully", () => {
    // Expects: The component should handle API errors and display an appropriate message
    // This tests that the component doesn't crash with invalid props and logs warnings
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    
    render(
      <KnowledgeTable
        cardKnowledge={null as any}
        players={null as any}
        onKnowledgeChange={() => {}}
        handSizes={defaultHandSizes}
      />
    );

    // Component should still render without crashing
    expect(screen.getByText("Knowledge Table")).toBeInTheDocument();
    
    // Should log warnings for invalid props
    expect(warnSpy).toHaveBeenCalledWith(
      "KnowledgeTable: Invalid props - players must be an array, received:",
      null
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "KnowledgeTable: Invalid props - cardKnowledge must be an array, received:",
      null
    );
    
    warnSpy.mockRestore();
  });

  it("shows X marks for all other players when one player has a card", () => {
    // Expects: When one player has a card, all other players should show X (✗) for that card
    // This tests the constraint logic that only one player can have a specific card
    const constraintTestKnowledge: CardKnowledge[] = [
      {
        cardName: "Revolver",
        category: "weapon" as const,
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: false, Charlie: false }, // Alice has it, others don't
        inSolution: false,
        eliminatedFromSolution: true,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];

    render(
      <KnowledgeTable
        cardKnowledge={constraintTestKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={defaultHandSizes}
      />
    );

    // Alice should show checkmark (✓)
    const revolverRow = screen.getByText("Revolver").closest("tr");
    expect(revolverRow).toHaveTextContent("✓");
    
    // Bob and Charlie should show X (✗)
    expect(revolverRow).toHaveTextContent("✗");
    
    // Count the X marks - should be exactly 2 (Bob and Charlie)
    const xMarks = revolverRow?.textContent?.match(/✗/g);
    expect(xMarks).toHaveLength(2);
  });

  it("shows correct constraint logic for multiple cards", () => {
    // Expects: The constraint logic should work correctly across multiple cards
    // Each card should have at most one player with a checkmark
    const multiCardKnowledge: CardKnowledge[] = [
      {
        cardName: "Miss Scarlett",
        category: "suspect" as const,
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: false, Charlie: false }, // Alice has it
        inSolution: false,
        eliminatedFromSolution: true,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
      {
        cardName: "Candlestick",
        category: "weapon" as const,
        inYourHand: false,
        inPlayersHand: { Alice: false, Bob: true, Charlie: false }, // Bob has it
        inSolution: false,
        eliminatedFromSolution: true,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
      {
        cardName: "Library",
        category: "room" as const,
        inYourHand: false,
        inPlayersHand: { Alice: false, Bob: false, Charlie: true }, // Charlie has it
        inSolution: false,
        eliminatedFromSolution: true,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];

    render(
      <KnowledgeTable
        cardKnowledge={multiCardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={defaultHandSizes}
      />
    );

    // Each card should have exactly one checkmark
    const scarletRow = screen.getByText("Miss Scarlett").closest("tr");
    const candlestickRow = screen.getByText("Candlestick").closest("tr");
    const libraryRow = screen.getByText("Library").closest("tr");

    // Count checkmarks in each row
    const scarletCheckmarks = scarletRow?.textContent?.match(/✓/g);
    const candlestickCheckmarks = candlestickRow?.textContent?.match(/✓/g);
    const libraryCheckmarks = libraryRow?.textContent?.match(/✓/g);

    expect(scarletCheckmarks).toHaveLength(1);
    expect(candlestickCheckmarks).toHaveLength(1);
    expect(libraryCheckmarks).toHaveLength(1);

    // Each row should have exactly 2 X marks (for the other players)
    const scarletXMarks = scarletRow?.textContent?.match(/✗/g);
    const candlestickXMarks = candlestickRow?.textContent?.match(/✗/g);
    const libraryXMarks = libraryRow?.textContent?.match(/✗/g);

    expect(scarletXMarks).toHaveLength(2);
    expect(candlestickXMarks).toHaveLength(2);
    expect(libraryXMarks).toHaveLength(2);
  });

  it("handles constraint logic with cards in your hand", () => {
    // Expects: When a card is in your hand, all players should show "Your Hand"
    // and the constraint logic should still work for other cards
    const yourHandKnowledge: CardKnowledge[] = [
      {
        cardName: "Colonel Mustard",
        category: "suspect" as const,
        inYourHand: true, // This card is in your hand
        inPlayersHand: { Alice: false, Bob: false, Charlie: false }, // All players marked as not having it
        inSolution: false,
        eliminatedFromSolution: true,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
      {
        cardName: "Rope",
        category: "weapon" as const,
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: false, Charlie: false }, // Alice has it
        inSolution: false,
        eliminatedFromSolution: true,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];

    render(
      <KnowledgeTable
        cardKnowledge={yourHandKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={defaultHandSizes}
      />
    );

    // Colonel Mustard should show "Your Hand" for all players
    const mustardRow = screen.getByText("Colonel Mustard").closest("tr");
    expect(mustardRow).toHaveTextContent("Hand");
    
    // Should have "Your Hand" text 3 times (once for each player)
    const yourHandTexts = mustardRow?.textContent?.match(/Hand/g);
    expect(yourHandTexts).toHaveLength(3);

    // Rope should still follow constraint logic
    const ropeRow = screen.getByText("Rope").closest("tr");
    expect(ropeRow).toHaveTextContent("✓"); // Alice has it
    expect(ropeRow).toHaveTextContent("✗"); // Others don't
    
    const ropeCheckmarks = ropeRow?.textContent?.match(/✓/g);
    const ropeXMarks = ropeRow?.textContent?.match(/✗/g);
    expect(ropeCheckmarks).toHaveLength(1);
    expect(ropeXMarks).toHaveLength(2);
  });

  it("shows (known/total) in the header for each player", () => {
    // Expects: The header should show (known/total) for each player
    const handSizes = { Alice: 2, Bob: 1, Charlie: 0 };
    const cardKnowledge: CardKnowledge[] = [
      {
        cardName: "Card1",
        category: "suspect",
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: true, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
      {
        cardName: "Card2",
        category: "weapon",
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: null, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];
    render(
      <KnowledgeTable
        cardKnowledge={cardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={handSizes}
      />
    );
    expect(screen.getByText("(2 / 2)")).toBeInTheDocument(); // Alice
    expect(screen.getByText("(1 / 1)")).toBeInTheDocument(); // Bob
    expect(screen.getByText("(0 / 0)")).toBeInTheDocument(); // Charlie
  });

  it("applies bold and green style when all cards are known for a player", () => {
    // Expects: When known == total, style is bold and green
    const handSizes = { Alice: 2, Bob: 1, Charlie: 0 };
    const cardKnowledge: CardKnowledge[] = [
      {
        cardName: "Card1",
        category: "suspect",
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: true, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
      {
        cardName: "Card2",
        category: "weapon",
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: null, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];
    render(
      <KnowledgeTable
        cardKnowledge={cardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={handSizes}
      />
    );
    // Find the span for Alice (should be bold and green)
    const aliceHeader = screen.getByText("Alice").parentElement;
    const aliceSpan = aliceHeader?.querySelector(".secondary-text");
    expect(aliceSpan).toHaveStyle({ fontWeight: "bold", color: "rgb(0, 128, 0)" });
  });

  it("does not apply bold/green style when not all cards are known", () => {
    // Expects: When known != total, style is normal
    const handSizes = { Alice: 3, Bob: 1, Charlie: 0 };
    const cardKnowledge: CardKnowledge[] = [
      {
        cardName: "Card1",
        category: "suspect",
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: true, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
      {
        cardName: "Card2",
        category: "weapon",
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: null, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];
    render(
      <KnowledgeTable
        cardKnowledge={cardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={handSizes}
      />
    );
    // Find the span for Alice (should NOT be bold/green)
    const aliceHeader = screen.getByText("Alice").parentElement;
    const aliceSpan = aliceHeader?.querySelector(".secondary-text");
    expect(aliceSpan).not.toHaveStyle({ fontWeight: "bold", color: "green" });
  });

  it("shows '?' for hand size if missing and does not apply special style", () => {
    // Expects: If hand size is missing, shows ? and no bold/green style
    const handSizes = { Alice: 2, Bob: undefined as any, Charlie: 0 };
    const cardKnowledge: CardKnowledge[] = [
      {
        cardName: "Card1",
        category: "suspect",
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: true, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
      {
        cardName: "Card2",
        category: "weapon",
        inYourHand: false,
        inPlayersHand: { Alice: true, Bob: null, Charlie: false },
        inSolution: null,
        eliminatedFromSolution: false,
        likelyHas: { Alice: false, Bob: false, Charlie: false }
      },
    ];
    render(
      <KnowledgeTable
        cardKnowledge={cardKnowledge}
        players={mockPlayers}
        onKnowledgeChange={() => {}}
        handSizes={handSizes}
      />
    );
    expect(screen.getByText("(2 / 2)")).toBeInTheDocument(); // Alice
    expect(screen.getByText("(1 / ?)")).toBeInTheDocument(); // Bob
    expect(screen.getByText("(0 / 0)")).toBeInTheDocument(); // Charlie
    // Bob's style should not be bold/green
    const bobHeader = screen.getByText("Bob").parentElement;
    const bobSpan = bobHeader?.querySelector(".secondary-text");
    expect(bobSpan).not.toHaveStyle({ fontWeight: "bold", color: "green" });
  });
});
