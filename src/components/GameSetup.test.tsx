import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GameSetup from "./GameSetup";

describe("GameSetup", () => {
  it("renders the game setup form", () => {
    render(<GameSetup />);
    expect(screen.getByText("Game Setup")).toBeInTheDocument();
  });

  it("has a field for entering player names", () => {
    render(<GameSetup />);
    expect(screen.getByLabelText(/player names/i)).toBeInTheDocument();
  });

  it("allows entering player names", () => {
    render(<GameSetup />);
    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });
    expect(playerInput).toHaveValue("Alice\nBob\nCharlie");
  });

  it("has a field for entering suspects", () => {
    render(<GameSetup />);
    expect(screen.getByLabelText(/suspects/i)).toBeInTheDocument();
  });

  it("allows entering suspects", () => {
    render(<GameSetup />);
    const suspectInput = screen.getByLabelText(/suspects/i);
    fireEvent.change(suspectInput, { target: { value: "Suspect1\nSuspect2" } });
    expect(suspectInput).toHaveValue("Suspect1\nSuspect2");
  });

  it("has a field for entering weapons", () => {
    render(<GameSetup />);
    expect(screen.getByLabelText(/weapons/i)).toBeInTheDocument();
  });

  it("allows entering weapons", () => {
    render(<GameSetup />);
    const weaponInput = screen.getByLabelText(/weapons/i);
    fireEvent.change(weaponInput, { target: { value: "Weapon1\nWeapon2" } });
    expect(weaponInput).toHaveValue("Weapon1\nWeapon2");
  });

  it("has a field for entering rooms", () => {
    render(<GameSetup />);
    expect(screen.getByLabelText(/rooms/i)).toBeInTheDocument();
  });

  it("allows entering rooms", () => {
    render(<GameSetup />);
    const roomInput = screen.getByLabelText(/rooms/i);
    fireEvent.change(roomInput, { target: { value: "Room1\nRoom2" } });
    expect(roomInput).toHaveValue("Room1\nRoom2");
  });

  it("has default values for suspects, weapons, and rooms", () => {
    render(<GameSetup />);
    const suspectInput = screen.getByLabelText(/suspects/i);
    const weaponInput = screen.getByLabelText(/weapons/i);
    const roomInput = screen.getByLabelText(/rooms/i);

    expect(suspectInput).toHaveValue(
      "Miss Scarlet\nColonel Mustard\nMrs. White\nMr. Green\nMrs. Peacock\nProfessor Plum"
    );
    expect(weaponInput).toHaveValue(
      "Candlestick\nDagger\nLead Pipe\nRevolver\nRope\nWrench"
    );
    expect(roomInput).toHaveValue(
      "Kitchen\nBallroom\nConservatory\nDining Room\nBilliard Room\nLibrary\nLounge\nHall\nStudy"
    );
  });

  it("has a field for entering your player name", () => {
    render(<GameSetup />);
    expect(screen.getByLabelText(/your player name/i)).toBeInTheDocument();
  });

  it("allows entering your player name", () => {
    render(<GameSetup />);
    const playerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(playerNameInput, { target: { value: "Miss Scarlet" } });
    expect(playerNameInput).toHaveValue("Miss Scarlet");
  });

  it("validates your player name against the list of players", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Miss Scarlet\nColonel Mustard\nMrs. White" },
    });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, {
      target: { value: "Miss Scarlet" },
    });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).toHaveBeenCalledWith([
      "Miss Scarlet",
      "Colonel Mustard",
      "Mrs. White",
    ]);
  });

  it("shows error message when your player name does not match any player", () => {
    render(<GameSetup />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Miss Scarlet\nColonel Mustard\nMrs. White" },
    });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, {
      target: { value: "Invalid Name" },
    });

    expect(
      screen.getByText(
        /your player name must match one of the player names entered above/i
      )
    ).toBeInTheDocument();
  });

  it("hides error message when your player name becomes valid", () => {
    render(<GameSetup />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Miss Scarlet\nColonel Mustard\nMrs. White" },
    });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);

    // First, enter an invalid name
    fireEvent.change(yourPlayerNameInput, {
      target: { value: "Invalid Name" },
    });
    expect(
      screen.getByText(
        /your player name must match one of the player names entered above/i
      )
    ).toBeInTheDocument();

    // Then, enter a valid name
    fireEvent.change(yourPlayerNameInput, {
      target: { value: "Miss Scarlet" },
    });
    expect(
      screen.queryByText(
        /your player name must match one of the player names entered above/i
      )
    ).not.toBeInTheDocument();
  });

  it("enables start button when your player name becomes valid", () => {
    render(<GameSetup />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Miss Scarlet\nColonel Mustard\nMrs. White" },
    });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);

    // First, enter an invalid name
    fireEvent.change(yourPlayerNameInput, {
      target: { value: "Invalid Name" },
    });
    const startButton = screen.getByText(/next/i);
    expect(startButton).toBeDisabled();

    // Then, enter a valid name
    fireEvent.change(yourPlayerNameInput, {
      target: { value: "Miss Scarlet" },
    });
    expect(startButton).not.toBeDisabled();
  });

  it("disables the start button if your player name is invalid", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Miss Scarlet\nColonel Mustard\nMrs. White" },
    });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, {
      target: { value: "Invalid Name" },
    });

    const startButton = screen.getByText(/next/i);
    expect(startButton).toBeDisabled();
  });

  it("does not call onGameStart if the button is clicked when your player name is invalid", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Miss Scarlet\nColonel Mustard\nMrs. White" },
    });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, {
      target: { value: "Invalid Name" },
    });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  it("validates there are at least three players before starting the game", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  it("shows an error message if there are less than three players", () => {
    render(<GameSetup />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob" } });

    expect(
      screen.getByText(/at least 3 players are required to start the game/i)
    ).toBeInTheDocument();
  });

  it("does not allow starting the game if there are duplicate player names", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nAlice" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    expect(startButton).toBeDisabled();
  });

  it("validates player names to ensure they are trimmed", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: " Alice \n Bob \n Charlie " },
    });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).toHaveBeenCalledWith(["Alice", "Bob", "Charlie"]);
  });

  it("does not allow starting the game if your player name is empty", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  it("does not allow starting the game if suspects, weapons, or rooms are empty", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const suspectInput = screen.getByLabelText(/suspects/i);
    fireEvent.change(suspectInput, { target: { value: "" } });

    const weaponInput = screen.getByLabelText(/weapons/i);
    fireEvent.change(weaponInput, { target: { value: "Weapon1\nWeapon2" } });

    const roomInput = screen.getByLabelText(/rooms/i);
    fireEvent.change(roomInput, { target: { value: "Room1\nRoom2" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  it("allows starting the game if all fields are valid", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).toHaveBeenCalledWith(["Alice", "Bob", "Charlie"]);
  });

  it("does not allow duplicate suspects, weapons, or rooms", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const suspectInput = screen.getByLabelText(/suspects/i);
    fireEvent.change(suspectInput, { target: { value: "Alice\nBob\nAlice" } });

    const weaponInput = screen.getByLabelText(/weapons/i);
    fireEvent.change(weaponInput, { target: { value: "Weapon1\nWeapon2" } });

    const roomInput = screen.getByLabelText(/rooms/i);
    fireEvent.change(roomInput, { target: { value: "Room1\nRoom2" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    expect(startButton).toBeDisabled();
  });

  it('submits the game setup when all fields are valid', () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);
    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });
    const suspectInput = screen.getByLabelText(/suspects/i);
    fireEvent.change(suspectInput, { target: { value: "Suspect1\nSuspect2" } });
    const weaponInput = screen.getByLabelText(/weapons/i);
    fireEvent.change(weaponInput, { target: { value: "Weapon1\nWeapon2" } });
    const roomInput = screen.getByLabelText(/rooms/i);
    fireEvent.change(roomInput, { target: { value: "Room1\nRoom2" } });
    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });
    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);
    expect(mockOnGameStart).toHaveBeenCalledWith(["Alice", "Bob", "Charlie"]);
  });

  it('handles API errors gracefully', () => {
    // This test would check if the component handles API errors
    // and displays an appropriate message to the user.
  });
});
