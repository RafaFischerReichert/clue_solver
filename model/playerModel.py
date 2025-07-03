from typing import String
from cardModel import Card

class Player:
    def __init__(self, name: str):
        self.name: String = name
        self.hand_size: int  # Cards in hand
        self.seen_cards: list[Card] = []

    def add_card_to_hand(self, card: str):
        self.hand.append(card)

    def see_card(self, card: Card):
        """
        Player sees a card, which means they know it is not in the solution.
        """
        if card not in self.seen_cards:
            self.seen_cards.append(card)