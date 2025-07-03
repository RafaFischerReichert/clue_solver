from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class Card:
    """
    Represents a card in the Cluedo game.
    
    Attributes:
        name (str): The name of the card.
        card_type (str): The type of the card (e.g., 'suspect', 'weapon', 'room').
    """
    name: str
    card_type: str  # e.g., 'suspect', 'weapon', 'room'

    def __repr__(self) -> str:
        return f"Card(name={self.name}, card_type={self.card_type})"