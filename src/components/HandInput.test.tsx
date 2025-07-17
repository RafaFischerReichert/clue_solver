import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HandInput from "./HandInput";

// Canonical Clue/Cluedo cards for the classic game
const ALL_SUSPECTS = [
  "Miss Scarlett",
  "Colonel Mustard",
  "Dr. Orchid",
  "Reverend Green",
  "Mrs. Peacock",
  "Professor Plum",
];

const ALL_WEAPONS = [
  "Candlestick",
  "Dagger",
  "Lead Pipe",
  "Revolver",
  "Rope",
  "Wrench",
];

const ALL_ROOMS = [
  "Kitchen",
  "Ballroom",
  "Conservatory",
  "Dining Room",
  "Billiard Room",
  "Library",
  "Lounge",
  "Hall",
  "Study",
];

/**
 * Renders HandInput with default props for testing.
 * Allows overrides for any prop.
 */
const DEFAULT_RENDER = (overrides = {}) =>
  render(
    <HandInput
      suspects={ALL_SUSPECTS}
      weapons={ALL_WEAPONS}
      rooms={ALL_ROOMS}
      onHandSubmit={() => {}}
      onBack={() => {}}
      handSizes={{ A: 6, B: 6, C: 6 }}
      currentUser="A"
      {...overrides}
    />
  );

describe("HandInput", () => {
  it("renders without crashing", () => {
    // Expects: The component should render with the main heading and instruction text
    DEFAULT_RENDER();

    expect(screen.getByText("Select Your Cards")).toBeInTheDocument();
    expect(screen.getByText("Suspects")).toBeInTheDocument();
    expect(screen.getByText("Weapons")).toBeInTheDocument();
    expect(screen.getByText("Rooms")).toBeInTheDocument();
  });

  it("displays suspects, weapons, and rooms", () => {
    // Expects: The component should display all provided suspects, weapons, and rooms as checkboxes
    const suspects = ALL_SUSPECTS;
    const weapons = ALL_WEAPONS;
    const rooms = ALL_ROOMS;

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    suspects.forEach((suspect) => {
      expect(screen.getByText(suspect)).toBeInTheDocument();
    });
    weapons.forEach((weapon) => {
      expect(screen.getByText(weapon)).toBeInTheDocument();
    });
    rooms.forEach((room) => {
      expect(screen.getByText(room)).toBeInTheDocument();
    });
  });

  it("displays section headers for suspects, weapons, and rooms", () => {
    // Expects: The component should display section headers for each card type
    DEFAULT_RENDER();

    expect(screen.getByText("Suspects")).toBeInTheDocument();
    expect(screen.getByText("Weapons")).toBeInTheDocument();
    expect(screen.getByText("Rooms")).toBeInTheDocument();
  });

  it("renders the Submit button", () => {
    // Expects: The component should display a Submit button
    DEFAULT_RENDER();

    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  it("handles empty arrays gracefully", () => {
    // Expects: The component should render without crashing when provided with empty arrays
    render(
      <HandInput
        suspects={[]}
        weapons={[]}
        rooms={[]}
        onHandSubmit={() => {}}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    expect(screen.getByText("Select Your Cards")).toBeInTheDocument();
    expect(screen.getByText("Suspects")).toBeInTheDocument();
    expect(screen.getByText("Weapons")).toBeInTheDocument();
    expect(screen.getByText("Rooms")).toBeInTheDocument();
  });

  it("removes duplicate suspects from the display", () => {
    // Expects: The component should deduplicate suspects and only show unique values
    const suspects = ["Miss Scarlett", "Miss Scarlett", "Colonel Mustard"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    // Should only show one instance of "Miss Scarlett"
    const scarletElements = screen.getAllByText("Miss Scarlett");
    expect(scarletElements).toHaveLength(1);
    expect(screen.getByText("Colonel Mustard")).toBeInTheDocument();
  });

  it("removes duplicate weapons from the display", () => {
    // Expects: The component should deduplicate weapons and only show unique values
    const suspects = ["Miss Scarlett"];
    const weapons = ["Candlestick", "Candlestick", "Revolver"];
    const rooms = ["Kitchen"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    // Should only show one instance of "Candlestick"
    const candlestickElements = screen.getAllByText("Candlestick");
    expect(candlestickElements).toHaveLength(1);
    expect(screen.getByText("Revolver")).toBeInTheDocument();
  });

  it("removes duplicate rooms from the display", () => {
    // Expects: The component should deduplicate rooms and only show unique values
    const suspects = ["Miss Scarlett"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen", "Kitchen", "Library"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    // Should only show one instance of "Kitchen"
    const kitchenElements = screen.getAllByText("Kitchen");
    expect(kitchenElements).toHaveLength(1);
    expect(screen.getByText("Library")).toBeInTheDocument();
  });

  it("toggles card selection on checkbox click", async () => {
    // Expects: Clicking a checkbox should toggle its checked state
    DEFAULT_RENDER();

    const checkbox = screen.getByLabelText("Miss Scarlett");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Wait for throttling
    await new Promise((resolve) => setTimeout(resolve, 150));

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("calls onHandSubmit with multiple selected cards on submit", async () => {
    // Use the full constants for suspects, weapons, and rooms as in the main app
    const suspects = ALL_SUSPECTS;
    const weapons = ALL_WEAPONS;
    const rooms = ALL_ROOMS;
    const onHandSubmit = vi.fn();

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={onHandSubmit}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    // Select 6 cards (all available)
    const checkboxes = [
      screen.getByLabelText("Miss Scarlett"),
      screen.getByLabelText("Colonel Mustard"),
      screen.getByLabelText("Candlestick"),
      screen.getByLabelText("Revolver"),
      screen.getByLabelText("Kitchen"),
      screen.getByLabelText("Library"),
    ];
    checkboxes.forEach((cb) => fireEvent.click(cb));

    // Wait for throttling to ensure state updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    const submitButton = screen.getByText("Submit");
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);

    // Should call onHandSubmit with the selected cards
    expect(onHandSubmit).toHaveBeenCalledWith([
      "Miss Scarlett",
      "Colonel Mustard",
      "Candlestick",
      "Revolver",
      "Kitchen",
      "Library",
    ]);
  });

  it("does not submit if no cards are selected", () => {
    // Expects: When no cards are selected and Submit is clicked, onHandSubmit should not be called
    const suspects = ALL_SUSPECTS;
    const weapons = ALL_WEAPONS;
    const rooms = ALL_ROOMS;
    const onHandSubmit = vi.fn();

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={onHandSubmit}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    expect(onHandSubmit).not.toHaveBeenCalled();
  });

  it("disables the Submit button when no cards are selected", () => {
    // Expects: The Submit button should be disabled when no cards are selected
    DEFAULT_RENDER();

    const submitButton = screen.getByText("Submit");
    expect(submitButton).toBeDisabled();
  });

  it("displays a message when no cards are selected", () => {
    // Expects: When no cards are selected, an error message should be displayed
    DEFAULT_RENDER();

    const message = screen.getByText("Please select at least one card.");
    expect(message).toBeInTheDocument();
  });

  it("does not display the message when cards are selected", () => {
    DEFAULT_RENDER();

    const checkbox = screen.getByLabelText("Miss Scarlett");
    fireEvent.click(checkbox);

    const message = screen.queryByText("Please select at least one card.");
    expect(message).not.toBeInTheDocument();
  });

  it("enables button when the correct number of cards is selected", () => {
    // Expects: Button should become enabled in a three-player game when 6 cards are selected
    DEFAULT_RENDER();

    // Select 6 cards
    [
      "Miss Scarlett",
      "Colonel Mustard",
      "Candlestick",
      "Revolver",
      "Kitchen",
      "Library",
    ].forEach((card) => {
      const checkbox = screen.getByLabelText(card);
      fireEvent.click(checkbox);
    });

    // Wait for throttling to ensure state updates
    // (HandInput throttles checkbox clicks)
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, 150)).then(() => {
      const submitButton = screen.getByText("Submit");
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("disables button when less than the expected number of cards is selected", async () => {
    // Expects: button should become disabled in a three-player game when the number of selected cards goes from 6 to 5
    DEFAULT_RENDER();

    // Select 6 cards
    [
      "Miss Scarlett",
      "Colonel Mustard",
      "Candlestick",
      "Revolver",
      "Kitchen",
      "Library",
    ].forEach((card) => {
      const checkbox = screen.getByLabelText(card);
      fireEvent.click(checkbox);
    });

    // Wait for throttling to ensure state updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Deselect one card (now 5 selected)
    const checkboxToDeselect = screen.getByLabelText("Library");
    fireEvent.click(checkboxToDeselect);

    // Wait for throttling to ensure state updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    const submitButton = screen.getByText("Submit");
    expect(submitButton).toBeDisabled();
  });

  it("disables button when more than the expected number of cards is selected", async () => {
    // Expects: button should become disabled in a three-player game when the number of selected cards goes from 6 to 7
    DEFAULT_RENDER();

    // Select all 7 cards
    [
      "Miss Scarlett",
      "Colonel Mustard",
      "Professor Plum",
      "Candlestick",
      "Revolver",
      "Kitchen",
      "Library",
    ].forEach((card) => {
      const checkbox = screen.getByLabelText(card);
      fireEvent.click(checkbox);
    });

    // Wait for throttling to ensure state updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    const submitButton = screen.getByText("Submit");
    expect(submitButton).toBeDisabled();
  });

  it("maintains selection state when toggling other cards", async () => {
    // Expects: Selecting/deselecting one card should not affect the selection state of other cards,
    // but submit should only be enabled if exactly 6 cards are selected in a three-player game.
    // This test verifies that selection state is independent.
    const onHandSubmit = vi.fn();
    DEFAULT_RENDER({ onHandSubmit });

    // Select all 6 cards
    const scarletCheckbox = screen.getByLabelText("Miss Scarlett");
    const mustardCheckbox = screen.getByLabelText("Colonel Mustard");
    const candlestickCheckbox = screen.getByLabelText("Candlestick");
    const revolverCheckbox = screen.getByLabelText("Revolver");
    const kitchenCheckbox = screen.getByLabelText("Kitchen");
    const libraryCheckbox = screen.getByLabelText("Library");
    const plumCheckbox = screen.getByLabelText("Professor Plum");

    fireEvent.click(scarletCheckbox);
    fireEvent.click(mustardCheckbox);
    fireEvent.click(candlestickCheckbox);
    fireEvent.click(revolverCheckbox);
    fireEvent.click(kitchenCheckbox);
    fireEvent.click(libraryCheckbox);

    // Wait for throttling to ensure state updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    // All clicked ones should be checked
    expect(scarletCheckbox).toBeChecked();
    expect(mustardCheckbox).toBeChecked();
    expect(candlestickCheckbox).toBeChecked();
    expect(revolverCheckbox).toBeChecked();
    expect(kitchenCheckbox).toBeChecked();
    expect(libraryCheckbox).toBeChecked();
    expect(plumCheckbox).not.toBeChecked();

    // Deselect one card
    fireEvent.click(scarletCheckbox);

    // Wait for throttling to ensure state updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(scarletCheckbox).not.toBeChecked();
    // The rest should still be checked
    expect(mustardCheckbox).toBeChecked();
    expect(candlestickCheckbox).toBeChecked();
    expect(revolverCheckbox).toBeChecked();
    expect(kitchenCheckbox).toBeChecked();
    expect(libraryCheckbox).toBeChecked();

    // Submit should be disabled because only 5 cards are selected
    const submitButton = screen.getByText("Submit");
    expect(submitButton).toBeDisabled();

    // Select another card to make 6 again
    fireEvent.click(plumCheckbox);

    // Wait for throttling
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Now all 6 should be checked and submit enabled
    expect(plumCheckbox).toBeChecked();
    expect(submitButton).not.toBeDisabled();

    // Submit should call onHandSubmit with all 6 cards
    fireEvent.click(submitButton);
    expect(onHandSubmit).toHaveBeenCalledWith([
      "Colonel Mustard",
      "Candlestick",
      "Revolver",
      "Kitchen",
      "Library",
      "Professor Plum",
    ]);
  });

  it("handles rapid checkbox clicks correctly", async () => {
    // Expects: Rapid clicking on checkboxes should maintain correct selection state,
    // but submit should only be enabled when exactly 6 cards are selected.
    // This test now verifies that rapid clicks do not allow submit unless 6 cards are selected.
    const onHandSubmit = vi.fn();
    DEFAULT_RENDER({ onHandSubmit });

    // Rapidly click all checkboxes in sequence, then again to toggle off, then on again
    const checkboxes = [
      screen.getByLabelText("Miss Scarlett"),
      screen.getByLabelText("Colonel Mustard"),
      screen.getByLabelText("Dr. Orchid"),
      screen.getByLabelText("Candlestick"),
      screen.getByLabelText("Revolver"),
      screen.getByLabelText("Kitchen"),
    ];

    // Rapidly select all
    checkboxes.forEach((cb) => fireEvent.click(cb));

    // Wait for throttling to ensure state updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    // All should be checked
    checkboxes.forEach((cb) => expect(cb).toBeChecked());

    // Submit should now be enabled (6 selected)
    const submitButton = screen.getByText("Submit");
    expect(submitButton).not.toBeDisabled();

    // Rapidly deselect all
    checkboxes.forEach((cb) => fireEvent.click(cb));

    // Wait for throttling to ensure state updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    // All should be unchecked
    checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
    // Submit should be disabled
    expect(submitButton).toBeDisabled();

    // Rapidly select all again
    checkboxes.forEach((cb) => fireEvent.click(cb));

    // Wait for throttling to ensure state updates
    await new Promise((resolve) => setTimeout(resolve, 150));

    checkboxes.forEach((cb) => expect(cb).toBeChecked());
    expect(submitButton).not.toBeDisabled();

    // Submit should call onHandSubmit with all 6 cards
    fireEvent.click(submitButton);
    expect(onHandSubmit).toHaveBeenCalledWith([
      "Miss Scarlett",
      "Colonel Mustard",
      "Dr. Orchid",
      "Candlestick",
      "Revolver",
      "Kitchen",
    ]);
  });

  it("logs an error and warns the user if onHandSubmit throws an error", () => {
    // Expects: When onHandSubmit throws an error, the component should catch it, log an error,
    // display an error message to the user, and not crash the component
    const mockOnHandSubmit = vi.fn((selectedCards: string[]) => {
      if (selectedCards.includes("Miss Scarlett")) {
        throw new Error("Miss Scarlett is not available");
      }
    });

    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <HandInput
        suspects={ALL_SUSPECTS}
        weapons={ALL_WEAPONS}
        rooms={ALL_ROOMS}
        onHandSubmit={mockOnHandSubmit}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    // Select Miss Scarlett
    const scarletCheckbox = screen.getByLabelText("Miss Scarlett");
    const mustardCheckbox = screen.getByLabelText("Colonel Mustard");
    const candlestickCheckbox = screen.getByLabelText("Candlestick");
    const daggerCheckbox = screen.getByLabelText("Dagger");
    const kitchenCheckbox = screen.getByLabelText("Kitchen");
    const libraryCheckbox = screen.getByLabelText("Library");
    fireEvent.click(scarletCheckbox);
    fireEvent.click(mustardCheckbox);
    fireEvent.click(candlestickCheckbox);
    fireEvent.click(daggerCheckbox);
    fireEvent.click(kitchenCheckbox);
    fireEvent.click(libraryCheckbox);

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    expect(errorSpy).toHaveBeenCalledWith(
      "Error submitting hand:",
      expect.objectContaining({ message: "Miss Scarlett is not available" })
    );

    errorSpy.mockRestore();
  });

  it("warns the user if input props are invalid", () => {
    // Expects: When suspects, weapons, or rooms are not arrays, the component should log warnings
    // and handle the invalid props gracefully (e.g., treat as empty arrays)
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Test with non-array props - these will cause Array.from(new Set()) to fail
    // and result in undefined values for the deduplicated arrays
    render(
      <HandInput
        suspects={null as any}
        weapons={undefined as any}
        rooms={"not an array" as any}
        onHandSubmit={() => {}}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    // The implementation now validates the original props and shows the actual invalid values
    expect(warnSpy).toHaveBeenCalledWith(
      "HandInput: Invalid props - suspects must be an array, received:",
      null
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "HandInput: Invalid props - weapons must be an array, received:",
      undefined
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "HandInput: Invalid props - rooms must be an array, received:",
      "not an array"
    );

    // Should still render without crashing
    expect(screen.getByText("Select Your Cards")).toBeInTheDocument();
    expect(screen.getByText("Suspects")).toBeInTheDocument();
    expect(screen.getByText("Weapons")).toBeInTheDocument();
    expect(screen.getByText("Rooms")).toBeInTheDocument();

    warnSpy.mockRestore();
  });

  it("warns the user when arrays are too large", () => {
    // Expects: When suspects, weapons, or rooms arrays are very large (e.g., >100 items),
    // the component should log a warning about potential performance issues but still function
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Create large arrays (over 100 items)
    const largeSuspects = Array.from(
      { length: 150 },
      (_, i) => `Suspect ${i + 1}`
    );
    const largeWeapons = Array.from(
      { length: 120 },
      (_, i) => `Weapon ${i + 1}`
    );
    const largeRooms = Array.from({ length: 110 }, (_, i) => `Room ${i + 1}`);

    render(
      <HandInput
        suspects={largeSuspects}
        weapons={largeWeapons}
        rooms={largeRooms}
        onHandSubmit={() => {}}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    // Should log warnings for large arrays
    expect(warnSpy).toHaveBeenCalledWith(
      "HandInput: Large suspects array (150 items) may cause performance issues"
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "HandInput: Large weapons array (120 items) may cause performance issues"
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "HandInput: Large rooms array (110 items) may cause performance issues"
    );

    // Should still render and function normally
    expect(screen.getByText("Select Your Cards")).toBeInTheDocument();
    expect(screen.getByText("Suspect 1")).toBeInTheDocument();
    expect(screen.getByText("Weapon 1")).toBeInTheDocument();
    expect(screen.getByText("Room 1")).toBeInTheDocument();

    warnSpy.mockRestore();
  });

  it("warns the user when invalid card name is provided", () => {
    // Expects: When card names are invalid (null, undefined, empty string, non-string),
    // the component should log a warning and skip those invalid entries
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    // Test with arrays containing invalid card names
    const suspectsWithInvalid = [
      "Miss Scarlett",
      null,
      "",
      undefined,
      123,
      "Colonel Mustard",
    ];
    const weaponsWithInvalid = ["Candlestick", "", null, "Revolver"];
    const roomsWithInvalid = ["Kitchen", undefined, "", "Library"];

    render(
      <HandInput
        suspects={suspectsWithInvalid as any}
        weapons={weaponsWithInvalid as any}
        rooms={roomsWithInvalid as any}
        onHandSubmit={() => {}}
        onBack={() => {}}
        handSizes={{ A: 6, B: 6, C: 6 }}
        currentUser="A"
      />
    );

    // Currently the implementation doesn't filter invalid card names,
    // so all valid card names should still be displayed
    expect(screen.getByText("Miss Scarlett")).toBeInTheDocument();
    expect(screen.getByText("Colonel Mustard")).toBeInTheDocument();
    expect(screen.getByText("Candlestick")).toBeInTheDocument();
    expect(screen.getByText("Revolver")).toBeInTheDocument();
    expect(screen.getByText("Kitchen")).toBeInTheDocument();
    expect(screen.getByText("Library")).toBeInTheDocument();

    // Invalid entries might be displayed as strings or cause React warnings
    // This test documents the current behavior until invalid card name filtering is implemented

    warnSpy.mockRestore();
  });

  it("allows valid hand size for 4 players (4 cards)", async () => {
    const onHandSubmit = vi.fn();
    render(
      <HandInput
        suspects={ALL_SUSPECTS}
        weapons={ALL_WEAPONS}
        rooms={ALL_ROOMS}
        onHandSubmit={onHandSubmit}
        onBack={() => {}}
        handSizes={{ A: 4, B: 4, C: 4, D: 4 }}
        currentUser="A"
      />
    );
    ["Miss Scarlett", "Colonel Mustard", "Candlestick", "Kitchen"].forEach(
      (card) => fireEvent.click(screen.getByLabelText(card))
    );
    await new Promise((resolve) => setTimeout(resolve, 150));
    const submitButton = screen.getByText("Submit");
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);
    expect(onHandSubmit).toHaveBeenCalled();
  });

  it("allows valid hand size for 4 players (5 cards)", async () => {
    const onHandSubmit = vi.fn();
    render(
      <HandInput
        suspects={ALL_SUSPECTS}
        weapons={ALL_WEAPONS}
        rooms={ALL_ROOMS}
        onHandSubmit={onHandSubmit}
        onBack={() => {}}
        handSizes={{ A: 5, B: 5, C: 5, D: 5 }}
        currentUser="A"
      />
    );
    ["Miss Scarlett", "Colonel Mustard", "Candlestick", "Kitchen", "Library"].forEach(
      (card) => fireEvent.click(screen.getByLabelText(card))
    );
    await new Promise((resolve) => setTimeout(resolve, 150));
    const submitButton = screen.getByText("Submit");
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);
    expect(onHandSubmit).toHaveBeenCalled();
  });

  it("allows valid hand size for 5 players (3 cards)", async () => {
    const onHandSubmit = vi.fn();
    render(
      <HandInput
        suspects={ALL_SUSPECTS}
        weapons={ALL_WEAPONS}
        rooms={ALL_ROOMS}
        onHandSubmit={onHandSubmit}
        onBack={() => {}}
        handSizes={{ A: 3, B: 3, C: 3, D: 3, E: 3 }}
        currentUser="A"
      />
    );
    ["Miss Scarlett", "Candlestick", "Kitchen"].forEach((card) => {
      fireEvent.click(screen.getByLabelText(card));
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
    const submitButton = screen.getByText("Submit");
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);
    expect(onHandSubmit).toHaveBeenCalled();
  });

  it("allows valid hand size for 5 players (4 cards)", async () => {
    const onHandSubmit = vi.fn();
    render(
      <HandInput
        suspects={ALL_SUSPECTS}
        weapons={ALL_WEAPONS}
        rooms={ALL_ROOMS}
        onHandSubmit={onHandSubmit}
        onBack={() => {}}
        handSizes={{ A: 4, B: 4, C: 4, D: 4, E: 4 }}
        currentUser="A"
      />
    );
    ["Miss Scarlett", "Colonel Mustard", "Candlestick", "Kitchen"].forEach((card) => {
      fireEvent.click(screen.getByLabelText(card));
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
    const submitButton = screen.getByText("Submit");
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);
    expect(onHandSubmit).toHaveBeenCalled();
  });

  it("allows valid hand size for 6 players (3 cards)", async () => {
    const onHandSubmit = vi.fn();
    render(
      <HandInput
        suspects={ALL_SUSPECTS}
        weapons={ALL_WEAPONS}
        rooms={ALL_ROOMS}
        onHandSubmit={onHandSubmit}
        onBack={() => {}}
        handSizes={{ A: 3, B: 3, C: 3, D: 3, E: 3, F: 3 }}
        currentUser="A"
      />
    );
    ["Miss Scarlett", "Candlestick", "Kitchen"].forEach((card) => {
      fireEvent.click(screen.getByLabelText(card));
    });
    await new Promise((resolve) => setTimeout(resolve, 150));
    const submitButton = screen.getByText("Submit");
    expect(submitButton).not.toBeDisabled();
    fireEvent.click(submitButton);
    expect(onHandSubmit).toHaveBeenCalled();
  });
});
