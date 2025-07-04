from enum import Enum, auto

class KnowledgeState(Enum):
    """
    Enum representing the knowledge state of a card in the game.
    """
    UNKNOWN = auto()  # Card is unknown
    HAS = auto()      # Card is known to be in the player's hand
    NOT_HAS = auto()  # Card is known to not be in the player's hand
    MIGHT_HAVE = auto()  # Card might have been revealed to someone else
    IS_SOLUTION = auto()  # Card is confirmed to be the solution (in the envelope)

    