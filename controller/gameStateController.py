import math
from typing import List, Tuple, Any, Optional
from collections import Counter
from model.cardModel import Card
from model.playerModel import Player
from model.knowledgeState import KnowledgeState
from model.gameStateModel import GameState

class GameStateController:
    game_state: GameState

    def __init__(self) -> None:
        self.game_state = GameState.get_instance()

    def get_possible_guesses(self, rooms_in_range: List[Card]) -> List[Tuple[Card, Card, Card]]:
        # This method should generate all possible guesses. Evaluating of whether they're worthwhile guesses comes later, not now.
        suspects = self.game_state.all_suspects
        weapons = self.game_state.all_weapons
        possible_guesses = [
            (suspect, weapon, room)
            for suspect in suspects
            for weapon in weapons
            for room in rooms_in_range
        ]
        return possible_guesses

    def record_guess_event(
        self,
        guess: Tuple[Card, Card, Card],
        asked_order: List[Player],
        showed_by: Optional[Player] = None,
        card_shown: Optional[Card] = None,
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

    def evaluate_guesses(self, asked_order: List[Player]) -> None:
        """
        Evaluates all possible guesses using expected information gain (entropy),
        considering current knowledge about which cards each player could have.
        Picks the guess that, on average, leaves the smallest entropy in the answer space.
        """
        possible_guesses = self.get_possible_guesses(self.game_state.all_rooms)
        possible_solutions = self.game_state.get_possible_solutions()

        best_guess = None
        best_expected_entropy = float('inf')

        for guess in possible_guesses:
            feedback_groups = {}
            for solution in possible_solutions:
                feedback = self.simulate_feedback(guess, solution, asked_order)
                feedback_groups.setdefault(feedback, 0)
                feedback_groups[feedback] += 1
            total = len(possible_solutions)
            expected_entropy = 0.0
            for count in feedback_groups.values():
                p = count / total
                if p > 0:
                    expected_entropy += p * math.log2(1 / p)
            if expected_entropy < best_expected_entropy:
                best_expected_entropy = expected_entropy
                best_guess = guess

        self.game_state.best_guess = best_guess

    def simulate_feedback(self, guess: Tuple[Card, Card, Card], solution: Tuple[Card, Card, Card], asked_order: List[Player]) -> str:
        """
        Simulates the feedback for a guess given a solution and asked order,
        using current knowledge about which cards each player could have.
        Returns a string representing which player would show which card, or 'no one'.
        """
        guess_cards = set(guess)
        solution_cards = set(solution)
        non_solution_cards = guess_cards - solution_cards

        for player in asked_order:
            possible_cards = [
                card for card in non_solution_cards
                if player.knowledge_table.get(card, KnowledgeState.UNKNOWN) != KnowledgeState.NOT_HAS
            ]
            if possible_cards:
                card_names = tuple(sorted(card.name for card in possible_cards))
                return f"{player.name}:{card_names}"
        return "no one"

    def killswitch(self) -> None:
        """
        Prints the most likely solution (suspect, weapon, room) based on current knowledge.
        This is the combination that appears most frequently in the remaining possible solutions.
        This may only be called by player
        """
        possible_solutions = self.game_state.get_possible_solutions()
        if not possible_solutions:
            print("No possible solutions remain.")
            return

        suspects = [s for s, _, _ in possible_solutions]
        weapons = [w for _, w, _ in possible_solutions]
        rooms = [r for _, _, r in possible_solutions]

        most_likely_suspect = Counter(suspects).most_common(1)[0][0]
        most_likely_weapon = Counter(weapons).most_common(1)[0][0]
        most_likely_room = Counter(rooms).most_common(1)[0][0]

        print("Most likely solution at this time:")
        print(f"Suspect: {most_likely_suspect.name}")
        print(f"Weapon: {most_likely_weapon.name}")
        print(f"Room: {most_likely_room.name}")

        # Optionally, print how many possibilities remain
        print(f"({len(possible_solutions)} possible solutions remain)")

    # Add more methods as needed