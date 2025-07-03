from model.cardModel import Card
from model.knowledgeState import KnowledgeState

class Player:
    name: str
    is_user: bool
    cards: list[Card] | None
    seen_cards: list[Card]
    knowledge_table: dict[Card, KnowledgeState]

    def __init__(self, name: str, is_user: bool = False):
        self.name = name
        self.is_user = is_user
        self.cards = [] if is_user else None  # Only the user's cards are tracked
        self.seen_cards = []
        self.knowledge_table = {}

    def add_card(self, card: Card) -> None:
        """
        Used only for the player, to add cards to their own hand
        """
        if self.is_user and self.cards is not None:
            self.cards.append(card)

    def see_card(self, card: Card) -> None:
        """
        Player sees a card, which means they know it is not in the solution.
        """
        if card not in self.seen_cards:
            self.seen_cards.append(card)