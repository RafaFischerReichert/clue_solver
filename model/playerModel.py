from model.cardModel import Card

class Player:
    def __init__(self, name: str, is_user: bool = False):
        self.name: str = name
        self.is_user: bool = is_user
        self.cards: list[Card] = [] if is_user else None  # Only the user's cards are tracked
        self.seen_cards: list[Card] = []  # Cards this player (user) has seen

    def add_card(self, card: Card):
        if self.is_user and self.cards is not None:
            self.cards.append(card)

    def see_card(self, card: Card):
        """
        Player sees a card, which means they know it is not in the solution.
        """
        if card not in self.seen_cards:
            self.seen_cards.append(card)