class Card:
    """
    Represents a card in the Cluedo game.
    
    Attributes:
        name (str): The name of the card.
        card_type (str): The type of the card (e.g., 'suspect', 'weapon', 'room').
    """
    
    def __init__(self, name: str, card_type: str):
        self.name = name
        self.card_type = card_type

    def __repr__(self):
        return f"Card(name={self.name}, card_type={self.card_type})"