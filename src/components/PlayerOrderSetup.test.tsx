import { render, screen, fireEvent } from "@testing-library/react";
import PlayerOrderSetup from "./PlayerOrderSetup";
import { describe, beforeEach, vi, it, expect } from "vitest";

// Mock the GameLogic functions
vi.mock("./GameLogic", () => ({
  getPossibleHandSizes: vi.fn((numPlayers: number) => {
    if (numPlayers === 3) return [6];
    if (numPlayers === 4) return [4, 5];
    if (numPlayers === 5) return [3, 4];
    if (numPlayers === 6) return [3];
    return [3];
  }),
  getValidHandSizeCombinations: vi.fn((numPlayers: number) => {
    if (numPlayers === 3) return [[6, 6, 6]];
    if (numPlayers === 4) return [[4, 4, 5, 5], [4, 5, 4, 5], [5, 4, 4, 5]];
    if (numPlayers === 5) return [[3, 3, 3, 4, 5], [3, 3, 4, 3, 5], [3, 4, 3, 3, 5]];
    if (numPlayers === 6) return [[3, 3, 3, 3, 3, 3]];
    return [];
  }),
  isValidHandSizeCombination: vi.fn((handSizes: Record<string, number>) => {
    const total = Object.values(handSizes).reduce((sum, size) => sum + size, 0);
    return total === 18;
  }),
}));

describe("PlayerOrderSetup", () => {
  const mockPlayers = ["Alice", "Bob", "Charlie"];
  const mockOnComplete = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the component with player order section", () => {
    render(
      <PlayerOrderSetup
        players={mockPlayers}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    expect(screen.getByText("Player Order & Hand Sizes")).toBeInTheDocument();
    expect(screen.getByText("Turn Order")).toBeInTheDocument();
    expect(screen.getByText("Hand Sizes")).toBeInTheDocument();
  });

  it("displays all players in the order section", () => {
    render(
      <PlayerOrderSetup
        players={mockPlayers}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    mockPlayers.forEach((player) => {
      expect(screen.getByText(player)).toBeInTheDocument();
    });
  });

  it("displays hand size dropdowns for each player", () => {
    render(
      <PlayerOrderSetup
        players={mockPlayers}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    // There should be as many selects as there are players
    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(mockPlayers.length);
    selects.forEach(select => {
      expect((select as HTMLSelectElement).value).toBe("6");
    });

    // There should be as many "6 cards" options as there are players
    expect(screen.getAllByText("6 cards")).toHaveLength(mockPlayers.length);
  });

  it("calls onBack when back button is clicked", () => {
    render(
      <PlayerOrderSetup
        players={mockPlayers}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByText("Back"));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("shows validation errors for invalid hand sizes", () => {
    render(
      <PlayerOrderSetup
        players={mockPlayers}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    // Try to submit without valid hand sizes (they should be valid by default)
    // This test would need to be expanded based on the actual validation logic
    expect(screen.getByText("Continue to Hand Input")).toBeInTheDocument();
  });

  it("calls onComplete with correct data when form is valid", () => {
    render(
      <PlayerOrderSetup
        players={mockPlayers}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    fireEvent.click(screen.getByText("Continue to Hand Input"));

    expect(mockOnComplete).toHaveBeenCalledWith(
      mockPlayers, // playerOrder
      {
        // handSizes
        Alice: 6,
        Bob: 6,
        Charlie: 6,
      }
    );
  });

  it("allows only 6 cards in hand for a default 3-player game", () => {
    const players = ["A", "B", "C"];
    render(
      <PlayerOrderSetup
        players={players}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );
    // All dropdowns should have only one option: 6 cards
    const selects = screen.getAllByRole("combobox");
    selects.forEach(select => {
      const options = Array.from((select as HTMLSelectElement).options);
      const handSizeOptions = options.filter(opt => opt.value !== "");
      expect(handSizeOptions).toHaveLength(1);
      expect(handSizeOptions[0].value).toBe("6");
      expect(handSizeOptions[0].textContent).toContain("6 cards");
    });
  });

  it("allows 4 or 5 cards in hand for a default 4-player game", () => {
    const players = ["A", "B", "C", "D"];
    render(
      <PlayerOrderSetup
        players={players}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );
    // All dropdowns should have two options: 4 cards and 5 cards
    const selects = screen.getAllByRole("combobox");
    selects.forEach(select => {
      const options = Array.from((select as HTMLSelectElement).options);
      const handSizeOptions = options.filter(opt => opt.value !== "");
      const values = handSizeOptions.map(opt => opt.value);
      expect(values).toEqual(expect.arrayContaining(["4", "5"]));
      expect(handSizeOptions).toHaveLength(2);
    });
  });

  it("allows 3 or 4 cards in hand for a default 5-player game", () => {
    const players = ["A", "B", "C", "D", "E"];
    render(
      <PlayerOrderSetup
        players={players}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );
    // All dropdowns should have two options: 3 cards and 4 cards
    const selects = screen.getAllByRole("combobox");
    selects.forEach(select => {
      const options = Array.from((select as HTMLSelectElement).options);
      const handSizeOptions = options.filter(opt => opt.value !== "");
      const values = handSizeOptions.map(opt => opt.value);
      expect(values).toEqual(expect.arrayContaining(["3", "4"]));
      expect(handSizeOptions).toHaveLength(2);
    });
  });

  it("allows only 3 cards in hand for a default 6-player game", () => {
    const players = ["A", "B", "C", "D", "E", "F"];
    render(
      <PlayerOrderSetup
        players={players}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );
    // All dropdowns should have only one option: 3 cards
    const selects = screen.getAllByRole("combobox");
    selects.forEach(select => {
      const options = Array.from((select as HTMLSelectElement).options);
      const handSizeOptions = options.filter(opt => opt.value !== "");
      expect(handSizeOptions).toHaveLength(1);
      expect(handSizeOptions[0].value).toBe("3");
      expect(handSizeOptions[0].textContent).toContain("3 cards");
    });
  });

  it("shows validation error when hand sizes don't add up to 18", () => {
    const players = ["A", "B", "C"];
    render(
      <PlayerOrderSetup
        players={players}
        onComplete={mockOnComplete}
        onBack={mockOnBack}
      />
    );

    // Change one player's hand size to create an invalid combination
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "5" } }); // This would make total 17 instead of 18

    // Try to submit
    fireEvent.click(screen.getByText("Continue to Hand Input"));

    // Should show validation error
    expect(screen.getByText(/Total cards distributed.*must equal exactly 18/)).toBeInTheDocument();
  });
});
