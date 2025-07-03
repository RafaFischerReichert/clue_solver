from enum import Enum, auto

class KnowledgeState(Enum):
    """
    Enum representing the knowledge state of a card in the game.
    """
    UNKNOWN = auto()  # Card is unknown
    HAS = auto()      # Card is known to be in the player's hand
    HAS_NOT = auto()  # Card is known to not be in the player's hand
    MIGHT_HAVE = auto()  # Card might have been revealed to someone else

    