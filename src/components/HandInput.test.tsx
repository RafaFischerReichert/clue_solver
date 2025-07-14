import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import HandInput from "./HandInput";

describe("HandInput", () => {
  it("renders without crashing", () => {
    render(
      <HandInput
        suspects={[]}
        weapons={[]}
        rooms={[]}
        onHandSubmit={() => {}}
      />
    );
    expect(screen.getByText("Select Your Cards")).toBeInTheDocument();
  });

  it("displays suspects, weapons, and rooms", () => {
    const suspects = ["Miss Scarlet", "Colonel Mustard"];
    const weapons = ["Candlestick", "Revolver"];
    const rooms = ["Kitchen", "Library"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
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

  it("toggles card selection on checkbox click", () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
      />
    );

    const checkbox = screen.getByLabelText("Miss Scarlet");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("calls onHandSubmit with selected cards on submit", () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];
    const onHandSubmit = vi.fn();

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={onHandSubmit}
      />
    );

    const checkbox = screen.getByLabelText("Miss Scarlet");
    fireEvent.click(checkbox);

    const submitButton = screen.getByText("Next");
    fireEvent.click(submitButton);

    expect(onHandSubmit).toHaveBeenCalledWith(["Miss Scarlet"]);
  });

  it("does not submit if no cards are selected", () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];
    const onHandSubmit = vi.fn();

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={onHandSubmit}
      />
    );

    const submitButton = screen.getByText("Next");
    fireEvent.click(submitButton);

    expect(onHandSubmit).not.toHaveBeenCalled();
  });

  it("handles multiple selections correctly", () => {
    const suspects = ["Miss Scarlet", "Colonel Mustard"];
    const weapons = ["Candlestick", "Revolver"];
    const rooms = ["Kitchen", "Library"];
    const onHandSubmit = vi.fn();

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={onHandSubmit}
      />
    );

    const scarletCheckbox = screen.getByLabelText("Miss Scarlet");
    const mustardCheckbox = screen.getByLabelText("Colonel Mustard");
    const candlestickCheckbox = screen.getByLabelText("Candlestick");
    const revolverCheckbox = screen.getByLabelText("Revolver");

    fireEvent.click(scarletCheckbox);
    fireEvent.click(mustardCheckbox);
    fireEvent.click(candlestickCheckbox);
    fireEvent.click(revolverCheckbox);

    const submitButton = screen.getByText("Next");
    fireEvent.click(submitButton);

    expect(onHandSubmit).toHaveBeenCalledWith([
      "Miss Scarlet",
      "Colonel Mustard",
      "Candlestick",
      "Revolver",
    ]);
  });

  it("renders the Next button", () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
      />
    );

    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("disables the Next button when no cards are selected", () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
      />
    );

    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();
  });

  it("does not allow submission with no selected cards", () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];
    const onHandSubmit = vi.fn();

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={onHandSubmit}
      />
    );

    const submitButton = screen.getByText("Next");
    fireEvent.click(submitButton);

    expect(onHandSubmit).not.toHaveBeenCalled();
  });

  it("displays a message when no cards are selected", () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
      />
    );

    const message = screen.getByText("Please select at least one card.");
    expect(message).toBeInTheDocument();
  });

  it("does not display the message when cards are selected", () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
      />
    );

    const checkbox = screen.getByLabelText("Miss Scarlet");
    fireEvent.click(checkbox);

    const message = screen.queryByText("Please select at least one card.");
    expect(message).not.toBeInTheDocument();
  });

  it("enables button when at least one card is selected", () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
      />
    );

    const checkbox = screen.getByLabelText("Miss Scarlet");
    fireEvent.click(checkbox);

    const nextButton = screen.getByText("Next");
    expect(nextButton).not.toBeDisabled();
  });

  it("disables button when all cards are deselected", () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];

    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={() => {}}
      />
    );

    const checkbox = screen.getByLabelText("Miss Scarlet");
    fireEvent.click(checkbox); // Select the card
    fireEvent.click(checkbox); // Deselect the card

    const nextButton = screen.getByText("Next");
    expect(nextButton).toBeDisabled();
  });

  it('submits selected cards when Next is clicked', () => {
    const suspects = ["Miss Scarlet"];
    const weapons = ["Candlestick"];
    const rooms = ["Kitchen"];
    const onHandSubmit = vi.fn();
    render(
      <HandInput
        suspects={suspects}
        weapons={weapons}
        rooms={rooms}
        onHandSubmit={onHandSubmit}
      />
    );
    const checkbox = screen.getByLabelText("Miss Scarlet");
    fireEvent.click(checkbox);
    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);
    expect(onHandSubmit).toHaveBeenCalledWith(["Miss Scarlet"]);
  });

  it("handles API errors gracefully", () => {
    // This test would check if the component handles API errors
    // and displays an appropriate message to the user.
  });
});
