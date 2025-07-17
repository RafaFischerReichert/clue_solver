import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GameSetup from "./GameSetup";

describe("GameSetup", () => {
  it("renders the game setup form", () => {
    // Expects: The component should render with the main heading
    render(<GameSetup onGameStart={() => {}} />);
    expect(screen.getByText("Game Setup")).toBeInTheDocument();
  });

  it("has a field for entering player names", () => {
    // Expects: The component should have a textarea for player names with proper label
    render(<GameSetup onGameStart={() => {}} />);
    expect(screen.getByLabelText(/player names/i)).toBeInTheDocument();
  });

  it("allows entering player names", () => {
    // Expects: The player names textarea should accept and display user input
    render(<GameSetup onGameStart={() => {}} />);
    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });
    expect(playerInput).toHaveValue("Alice\nBob\nCharlie");
  });

  it("has a field for entering suspects", () => {
    // Expects: The component should have a textarea for suspects with proper label
    render(<GameSetup onGameStart={() => {}} />);
    expect(screen.getByLabelText(/suspects/i)).toBeInTheDocument();
  });

  it("allows entering suspects", () => {
    // Expects: The suspects textarea should accept and display user input
    render(<GameSetup onGameStart={() => {}} />);
    const suspectInput = screen.getByLabelText(/suspects/i);
    fireEvent.change(suspectInput, { target: { value: "Suspect1\nSuspect2" } });
    expect(suspectInput).toHaveValue("Suspect1\nSuspect2");
  });

  it("has a field for entering weapons", () => {
    // Expects: The component should have a textarea for weapons with proper label
    render(<GameSetup onGameStart={() => {}} />);
    expect(screen.getByLabelText(/weapons/i)).toBeInTheDocument();
  });

  it("allows entering weapons", () => {
    // Expects: The weapons textarea should accept and display user input
    render(<GameSetup onGameStart={() => {}} />);
    const weaponInput = screen.getByLabelText(/weapons/i);
    fireEvent.change(weaponInput, { target: { value: "Weapon1\nWeapon2" } });
    expect(weaponInput).toHaveValue("Weapon1\nWeapon2");
  });

  it("has a field for entering rooms", () => {
    // Expects: The component should have a textarea for rooms with proper label
    render(<GameSetup onGameStart={() => {}} />);
    expect(screen.getByLabelText(/rooms/i)).toBeInTheDocument();
  });

  it("allows entering rooms", () => {
    // Expects: The rooms textarea should accept and display user input
    render(<GameSetup onGameStart={() => {}} />);
    const roomInput = screen.getByLabelText(/rooms/i);
    fireEvent.change(roomInput, { target: { value: "Room1\nRoom2" } });
    expect(roomInput).toHaveValue("Room1\nRoom2");
  });

  it("has default values for suspects, weapons, and rooms", () => {
    // Expects: The component should have default values for suspects, weapons, and rooms
    render(<GameSetup onGameStart={() => {}} />);
    const suspectInput = screen.getByLabelText(/suspects/i);
    const weaponInput = screen.getByLabelText(/weapons/i);
    const roomInput = screen.getByLabelText(/rooms/i);

    expect(suspectInput).toHaveValue(
      "Scarlett\nMustard\nOrchid\nGreen\nPeacock\nPlum"
    );
    expect(weaponInput).toHaveValue(
      "Candlestick\nDagger\nLead Pipe\nRevolver\nRope\nWrench"
    );
    expect(roomInput).toHaveValue(
      "Kitchen\nBallroom\nConservatory\nDining Room\nBilliard Room\nLibrary\nLounge\nHall\nStudy"
    );
  });

  it("has a field for entering your player name", () => {
    // Expects: The component should have an input field for the user's player name with proper label
    render(<GameSetup onGameStart={() => {}} />);
    expect(screen.getByLabelText(/your player name/i)).toBeInTheDocument();
  });

  it("allows entering your player name", () => {
    // Expects: The your player name input should accept and display user input
    render(<GameSetup onGameStart={() => {}} />);
    const playerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(playerNameInput, { target: { value: "Scarlett" } });
    expect(playerNameInput).toHaveValue("Scarlett");
  });

  it("validates your player name against the list of players", () => {
    // Expects: When a valid player name is entered and form is submitted, onGameStart should be called with the player list
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Scarlett\nMustard\nOrchid" },
    });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, {
      target: { value: "Scarlett" },
    });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).toHaveBeenCalledWith([
      "Scarlett",
      "Mustard",
      "Orchid",
    ], "Scarlett", [
      "Scarlett",
      "Mustard",
      "Orchid",
      "Green",
      "Peacock",
      "Plum",
    ], [
      "Candlestick",
      "Dagger",
      "Lead Pipe",
      "Revolver",
      "Rope",
      "Wrench",
    ], [
      "Kitchen",
      "Ballroom",
      "Conservatory",
      "Dining Room",
      "Billiard Room",
      "Library",
      "Lounge",
      "Hall",
      "Study",
    ]);
  });

  it("shows error message when your player name does not match any player", () => {
    // Expects: When an invalid player name is entered, an error message should be displayed
    render(<GameSetup onGameStart={() => {}} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Scarlett\nMustard\nOrchid" },
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
    // Expects: When an invalid player name is changed to a valid one, the error message should disappear
    render(<GameSetup onGameStart={() => {}} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Scarlett\nMustard\nOrchid" },
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
      target: { value: "Scarlett" },
    });
    expect(
      screen.queryByText(
        /your player name must match one of the player names entered above/i
      )
    ).not.toBeInTheDocument();
  });

  it("enables start button when your player name becomes valid", () => {
    // Expects: When an invalid player name is changed to a valid one, the start button should become enabled
    render(<GameSetup onGameStart={() => {}} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Scarlett\nMustard\nOrchid" },
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
      target: { value: "Scarlett" },
    });
    expect(startButton).not.toBeDisabled();
  });

  it("disables the start button if your player name is invalid", () => {
    // Expects: When the player name is invalid, the start button should be disabled
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Scarlett\nMustard\nOrchid" },
    });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, {
      target: { value: "Invalid Name" },
    });

    const startButton = screen.getByText(/next/i);
    expect(startButton).toBeDisabled();
  });

  it("does not call onGameStart if the button is clicked when your player name is invalid", () => {
    // Expects: When the start button is clicked with an invalid player name, onGameStart should not be called
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, {
      target: { value: "Scarlett\nMustard\nOrchid" },
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
    // Expects: When there are fewer than 3 players, onGameStart should not be called
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
    // Expects: When there are fewer than 3 players, an error message should be displayed
    render(<GameSetup onGameStart={() => {}} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob" } });

    expect(
      screen.getByText(/at least 3 players are required to start the game/i)
    ).toBeInTheDocument();
  });

  it("does not allow starting the game if there are duplicate player names", () => {
    // Expects: When there are duplicate player names, the start button should be disabled
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nAlice" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    expect(startButton).toBeDisabled();
  });

  it("shows error message when there are duplicate player names", () => {
    // Expects: When there are duplicate player names, an error message should be displayed
    render(<GameSetup onGameStart={() => {}} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nAlice" } });

    expect(
      screen.getByText(/player names must be unique. please remove duplicates/i)
    ).toBeInTheDocument();
  });

  it("validates player names to ensure they are trimmed", () => {
    // Expects: Player names with leading/trailing whitespace should be trimmed when passed to onGameStart
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

    expect(mockOnGameStart).toHaveBeenCalledWith(["Alice", "Bob", "Charlie"], "Alice", [
      "Scarlett",
      "Mustard",
      "Orchid",
      "Green",
      "Peacock",
      "Plum",
    ], [
      "Candlestick",
      "Dagger",
      "Lead Pipe",
      "Revolver",
      "Rope",
      "Wrench",
    ], [
      "Kitchen",
      "Ballroom",
      "Conservatory",
      "Dining Room",
      "Billiard Room",
      "Library",
      "Lounge",
      "Hall",
      "Study",
    ]);
  });

  it("does not allow starting the game if your player name is empty", () => {
    // Expects: When the player name field is empty, onGameStart should not be called
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

  it("does not allow starting the game if suspects are empty", () => {
    // Expects: When the suspects field is empty, onGameStart should not be called
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const suspectInput = screen.getByLabelText(/suspects/i);
    fireEvent.change(suspectInput, { target: { value: "" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  it("does not allow starting the game if weapons are empty", () => {
    // Expects: When the weapons field is empty, onGameStart should not be called
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const weaponInput = screen.getByLabelText(/weapons/i);
    fireEvent.change(weaponInput, { target: { value: "" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  it("does not allow starting the game if rooms are empty", () => {
    // Expects: When the rooms field is empty, onGameStart should not be called
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const roomInput = screen.getByLabelText(/rooms/i);
    fireEvent.change(roomInput, { target: { value: "" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  it("allows starting the game if all fields are valid", () => {
    // Expects: When all validation passes, onGameStart should be called with the player list
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).toHaveBeenCalledWith(["Alice", "Bob", "Charlie"], "Alice", [
      "Scarlett",
      "Mustard",
      "Orchid",
      "Green",
      "Peacock",
      "Plum",
    ], [
      "Candlestick",
      "Dagger",
      "Lead Pipe",
      "Revolver",
      "Rope",
      "Wrench",
    ], [
      "Kitchen",
      "Ballroom",
      "Conservatory",
      "Dining Room",
      "Billiard Room",
      "Library",
      "Lounge",
      "Hall",
      "Study",
    ]);
  });

  it("does not allow starting the game if there are duplicate suspects", () => {
    // Expects: When there are duplicate suspects, the start button should be disabled
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const suspectInput = screen.getByLabelText(/suspects/i);
    fireEvent.change(suspectInput, { target: { value: "Suspect1\nSuspect2\nSuspect1" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    expect(startButton).toBeDisabled();
  });

  it("does not allow starting the game if there are duplicate weapons", () => {
    // Expects: When there are duplicate weapons, the start button should be disabled
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const weaponInput = screen.getByLabelText(/weapons/i);
    fireEvent.change(weaponInput, { target: { value: "Weapon1\nWeapon2\nWeapon1" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    expect(startButton).toBeDisabled();
  });

  it("does not allow starting the game if there are duplicate rooms", () => {
    // Expects: When there are duplicate rooms, the start button should be disabled
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const roomInput = screen.getByLabelText(/rooms/i);
    fireEvent.change(roomInput, { target: { value: "Room1\nRoom2\nRoom1" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    expect(startButton).toBeDisabled();
  });

  it("does not call onGameStart when there are duplicate suspects", () => {
    // Expects: When there are duplicate suspects, onGameStart should not be called even if button is clicked
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const suspectInput = screen.getByLabelText(/suspects/i);
    fireEvent.change(suspectInput, { target: { value: "Suspect1\nSuspect2\nSuspect1" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  it("does not call onGameStart when there are duplicate weapons", () => {
    // Expects: When there are duplicate weapons, onGameStart should not be called even if button is clicked
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const weaponInput = screen.getByLabelText(/weapons/i);
    fireEvent.change(weaponInput, { target: { value: "Weapon1\nWeapon2\nWeapon1" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  it("does not call onGameStart when there are duplicate rooms", () => {
    // Expects: When there are duplicate rooms, onGameStart should not be called even if button is clicked
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);

    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Alice\nBob\nCharlie" } });

    const roomInput = screen.getByLabelText(/rooms/i);
    fireEvent.change(roomInput, { target: { value: "Room1\nRoom2\nRoom1" } });

    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Alice" } });

    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);

    expect(mockOnGameStart).not.toHaveBeenCalled();
  });

  it("preserves player order as entered and passes it to onGameStart", () => {
    const mockOnGameStart = vi.fn();
    render(<GameSetup onGameStart={mockOnGameStart} />);
    const playerInput = screen.getByLabelText(/player names/i);
    fireEvent.change(playerInput, { target: { value: "Charlie\nAlice\nBob" } });
    const yourPlayerNameInput = screen.getByLabelText(/your player name/i);
    fireEvent.change(yourPlayerNameInput, { target: { value: "Charlie" } });
    const startButton = screen.getByText(/next/i);
    fireEvent.click(startButton);
    expect(mockOnGameStart).toHaveBeenCalledWith([
      "Charlie",
      "Alice",
      "Bob"
    ], "Charlie", [
      "Scarlett",
      "Mustard",
      "Orchid",
      "Green",
      "Peacock",
      "Plum",
    ], [
      "Candlestick",
      "Dagger",
      "Lead Pipe",
      "Revolver",
      "Rope",
      "Wrench",
    ], [
      "Kitchen",
      "Ballroom",
      "Conservatory",
      "Dining Room",
      "Billiard Room",
      "Library",
      "Lounge",
      "Hall",
      "Study",
    ]);
  });
});
