from typing import List, Tuple, Any
from model.cardModel import Card
from model.playerModel import Player
from model.knowledgeState import KnowledgeState
from model.gameStateModel import GameState

class GameController:
    game_state: GameState

    def __init__(self) -> None:
        self.game_state = GameState.get_instance()

    def get_possible_guesses(self, rooms_in_range: List[Card]) -> List[Tuple[Card, Card, Card]]:
        # This method should generate all possible guesses minus the cards the user has seen, only for rooms in range
        possible_suspects = self.game_state.possible_suspects
        possible_weapons = self.game_state.possible_weapons
        possible_guesses = [
            (suspect, weapon, room)
            for suspect in possible_suspects
            for weapon in possible_weapons
            for room in rooms_in_range
        ]
        return possible_guesses

    def record_guess_event(
        self,
        guess: Tuple[Card, Card, Card],
        asked_order: List[Player],
        showed_by: Player = None,
        card_shown: Card = None,
        user_is_guesser: bool = False,
        guesser: Player = None
    ) -> None:
        """
        Records the outcome of a guess:
        - guess: (suspect, weapon, room)
        - asked_order: list of players asked in order
        - showed_by: player who showed a card (if any)
        - card_shown: the card shown (if known)
        - user_is_guesser: True if the user made the guess, False otherwise
        - guesser: the Player who made the guess
        """
        if user_is_guesser:
            # User is the guesser
            if showed_by is None:
                for card in guess:
                    if not guesser.has_card_in_hand(card):
                        guesser.set_card_knowledge(card, KnowledgeState.IS_SOLUTION)
                    else:
                        guesser.set_card_knowledge(card, KnowledgeState.MIGHT_HAVE)
            for player in asked_order:
                if player is showed_by:
                    if card_shown:
                        # We know exactly which card was shown
                        player.set_card_knowledge(card_shown, KnowledgeState.HAS)
                    else:
                        raise AttributeError("You have seen the card if you are guessing.")
                else:
                    for card in guess:
                        player.set_card_knowledge(card, KnowledgeState.NOT_HAS)
        else:
            # User is not the guesser
            if showed_by is None:
                for card in guess:
                    guesser.set_card_knowledge(card, KnowledgeState.MIGHT_HAVE)
            for player in asked_order:
                if showed_by is not player:
                    for card in guess:
                        player.set_card_knowledge(card, KnowledgeState.NOT_HAS)
                else:
                    for card in guess:
                        player.set_card_knowledge(card, KnowledgeState.MIGHT_HAVE)

    def evaluate_guesses(self) -> None:
        # Logic for STEP 3
        # This method should evaluate the possible guesses and return the one that eliminates the most possibilities
        pass

    def update_knowledge(self, info: Any) -> None:
        # Logic for STEP 4
        # This method should update table of each player's hands, being able to assign at least the values of "HAS THE CARD", "DOES NOT HAVE THE CARD", "MIGHT HAVE REVEALED THIS CARD TO SOMEONE ELSE"
        pass

    def killswitch(self) -> None:
        # Logic for STEP 5
        # This method should be manually activated to give us the best solution based on the current information
        pass

    # Add more methods as needed