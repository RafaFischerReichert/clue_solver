from typing import List, Dict, Any
from model.cardModel import Card
from model.knowledgeState import KnowledgeState

class Player:
    name: str
    is_user: bool
    cards: List[Card]
    seen_cards: list[Card]
    knowledge_table: Dict[Card, KnowledgeState]

    def __init__(self, name: str, is_user: bool = False) -> None:
        self.name: str = name
        self.is_user: bool = is_user
        self.cards: List[Card] = [] if is_user else None  # Only the user's cards are tracked
        self.seen_cards = []
        self.knowledge_table: Dict[Card, str] = {}

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

    def set_card_knowledge(self, card: Card, value: KnowledgeState) -> None:
        """
        Set the knowledge state for a specific card in the player's knowledge table.
        """
        self.knowledge_table[card] = value

    def has_card_in_hand(self, card: Card) -> bool:
        """
        Returns True if the card is in the user's hand.
        """
        return self.is_user and self.cards is not None and card in self.cards
    
    def has_solution(self) -> bool:
        # Check if there is exactly one card of each type marked as IS_SOLUTION in knowledge_table
        from collections import defaultdict
        type_count = defaultdict(int)
        for card, state in self.knowledge_table.items():
            if state == KnowledgeState.IS_SOLUTION:
                # Assume Card has a 'type' attribute (e.g., 'suspect', 'weapon', 'room')
                type_count[getattr(card, 'type', None)] += 1
        # We expect one of each: 'suspect', 'weapon', 'room'
        return all(type_count[t] == 1 for t in ('suspect', 'weapon', 'room'))

    def __repr__(self) -> str:
        return f"Player(name={self.name}, is_user={self.is_user}, cards={self.cards})"