from enum import Enum, auto
from typing import Dict, Any

class KnowledgeState(Enum):
    """
    Enum representing the knowledge state of a card in the game.
    """
    UNKNOWN = auto()  # Card is unknown
    HAS = auto()      # Card is known to be in the player's hand
    HAS_NOT = auto()  # Card is known to not be in the player's hand
    MIGHT_HAVE = auto()  # Card might have been revealed to someone else
    IS_SOLUTION = auto()  # Card is confirmed to be the solution (in the envelope)

class KnowledgeState:
    knowledge: Dict[Any, str]

    def __init__(self) -> None:
        self.knowledge: Dict[Any, str] = {}

    def update_knowledge(self, card: Any, state: str) -> None:
        self.knowledge[card] = state

    def get_knowledge(self, card: Any) -> str:
        return self.knowledge.get(card, "UNKNOWN")

    