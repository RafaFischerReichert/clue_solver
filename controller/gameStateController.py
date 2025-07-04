import math
import json
import os
from typing import List, Tuple, Any, Optional
from collections import Counter
from model.cardModel import Card
from model.playerModel import Player
from model.knowledgeState import KnowledgeState
from model.gameStateModel import GameState

class GameStateController:
    game_state: GameState
    knowledge_file: str

    def __init__(self) -> None:
        self.game_state = GameState.get_instance()
        self.knowledge_file = os.path.join("data", "knowledge_state.json")
        self._ensure_data_directory()

    def _ensure_data_directory(self):
        """Ensure the data directory exists"""
        os.makedirs("data", exist_ok=True)

    def save_knowledge_state(self):
        """Save current knowledge state to JSON file"""
        knowledge_data = {
            "players": {},
            "possible_solutions": {
                "suspects": [card.name for card in self.game_state.possible_suspects],
                "weapons": [card.name for card in self.game_state.possible_weapons],
                "rooms": [card.name for card in self.game_state.possible_rooms]
            },
            "best_guess": None
        }
        
        # Save player knowledge
        for player in self.game_state.players:
            player_knowledge = {}
            for card in self.game_state.all_suspects + self.game_state.all_weapons + self.game_state.all_rooms:
                state = player.knowledge_table.get(card, KnowledgeState.UNKNOWN)
                player_knowledge[f"{card.name} ({card.card_type})"] = state.name
            knowledge_data["players"][player.name] = player_knowledge
        
        # Save best guess if available
        if hasattr(self.game_state, 'best_guess') and self.game_state.best_guess:
            suspect, weapon, room = self.game_state.best_guess
            knowledge_data["best_guess"] = {
                "suspect": suspect.name,
                "weapon": weapon.name,
                "room": room.name
            }
        
        with open(self.knowledge_file, 'w', encoding='utf-8') as f:
            json.dump(knowledge_data, f, indent=2, ensure_ascii=False)

    def load_knowledge_state(self):
        """Load knowledge state from JSON file if it exists"""
        if os.path.exists(self.knowledge_file):
            try:
                with open(self.knowledge_file, 'r', encoding='utf-8') as f:
                    knowledge_data = json.load(f)
                
                # Update player knowledge tables
                for player_name, player_knowledge in knowledge_data.get("players", {}).items():
                    player = next((p for p in self.game_state.players if p.name == player_name), None)
                    if player:
                        for card_key, state_name in player_knowledge.items():
                            # Parse card name and type from key like "Kitchen (room)"
                            card_name = card_key.split(" (")[0]
                            card_type = card_key.split("(")[1].rstrip(")")
                            
                            # Find the card object
                            for card in self.game_state.all_suspects + self.game_state.all_weapons + self.game_state.all_rooms:
                                if card.name == card_name and card.card_type == card_type:
                                    state = KnowledgeState[state_name]
                                    player.set_card_knowledge(card, state)
                                    break
                
                # Update possible solutions
                possible_suspects = []
                possible_weapons = []
                possible_rooms = []
                
                for card_name in knowledge_data.get("possible_solutions", {}).get("suspects", []):
                    for card in self.game_state.all_suspects:
                        if card.name == card_name:
                            possible_suspects.append(card)
                            break
                
                for card_name in knowledge_data.get("possible_solutions", {}).get("weapons", []):
                    for card in self.game_state.all_weapons:
                        if card.name == card_name:
                            possible_weapons.append(card)
                            break
                
                for card_name in knowledge_data.get("possible_solutions", {}).get("rooms", []):
                    for card in self.game_state.all_rooms:
                        if card.name == card_name:
                            possible_rooms.append(card)
                            break
                
                self.game_state.set_possible_suspects(possible_suspects)
                self.game_state.set_possible_weapons(possible_weapons)
                self.game_state.set_possible_rooms(possible_rooms)
                
                # Load best guess
                best_guess_data = knowledge_data.get("best_guess")
                if best_guess_data:
                    suspect = next((c for c in self.game_state.all_suspects if c.name == best_guess_data["suspect"]), None)
                    weapon = next((c for c in self.game_state.all_weapons if c.name == best_guess_data["weapon"]), None)
                    room = next((c for c in self.game_state.all_rooms if c.name == best_guess_data["room"]), None)
                    if suspect and weapon and room:
                        self.game_state.best_guess = (suspect, weapon, room)
                
                # Update possible solutions based on loaded knowledge
                self.update_possible_solutions()
                
                # Validate and clear invalid best guess
                self.validate_best_guess()
                        
            except Exception as e:
                print(f"Error loading knowledge state: {e}")

    def get_possible_guesses(self, rooms_in_range: List[Card]) -> List[Tuple[Card, Card, Card]]:
        # This method should generate all possible guesses. Evaluating of whether they're worthwhile guesses comes later, not now.
        suspects = self.game_state.possible_suspects
        weapons = self.game_state.possible_weapons
        
        # Get cards known to be in hands
        cards_in_hands = set()
        for player in self.game_state.players:
            for card, state in player.knowledge_table.items():
                if state == KnowledgeState.HAS:
                    cards_in_hands.add(card)
        
        # Filter out cards that are known to be in hands
        available_suspects = [s for s in suspects if s not in cards_in_hands]
        available_weapons = [w for w in weapons if w not in cards_in_hands]
        available_rooms = [r for r in rooms_in_range if r not in cards_in_hands]
        
        print(f"Available for guesses: {len(available_suspects)} suspects, {len(available_weapons)} weapons, {len(available_rooms)} rooms")
        print(f"Cards in hands: {[c.name for c in cards_in_hands]}")
        
        possible_guesses = [
            (suspect, weapon, room)
            for suspect in available_suspects
            for weapon in available_weapons
            for room in available_rooms
        ]
        return possible_guesses

    def record_guess_event(
        self,
        guess: Tuple[Card, Card, Card],
        asked_order: List[Player],
        showed_by: Optional[Player] = None,
        card_shown: Optional[Card] = None,
        user_is_guesser: bool = False,
        guesser: Optional[Player] = None
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
        print(f"Recording guess: {[c.name for c in guess]} by {guesser.name if guesser else 'Unknown'}")
        print(f"Asked order: {[p.name for p in asked_order]}")
        print(f"Showed by: {showed_by.name if showed_by else 'None'}")
        print(f"Card shown: {card_shown.name if card_shown else 'None'}")
        
        if user_is_guesser:
            # User is the guesser
            if showed_by is None and guesser is not None:
                for card in guess:
                    if not guesser.has_card_in_hand(card):
                        guesser.set_card_knowledge(card, KnowledgeState.IS_SOLUTION)
                        print(f"Set {card.name} as SOLUTION for {guesser.name}")
                    else:
                        guesser.set_card_knowledge(card, KnowledgeState.MIGHT_HAVE)
                        print(f"Set {card.name} as MIGHT_HAVE for {guesser.name}")
            for player in asked_order:
                if player is showed_by:
                    if card_shown:
                        # We know exactly which card was shown
                        player.set_card_knowledge(card_shown, KnowledgeState.HAS)
                        print(f"Set {card_shown.name} as HAS for {player.name}")
                    else:
                        raise AttributeError("You have seen the card if you are guessing.")
                else:
                    for card in guess:
                        player.set_card_knowledge(card, KnowledgeState.NOT_HAS)
                        print(f"Set {card.name} as NOT_HAS for {player.name}")
        else:
            # User is not the guesser
            if showed_by is None and guesser is not None:
                for card in guess:
                    guesser.set_card_knowledge(card, KnowledgeState.MIGHT_HAVE)
                    print(f"Set {card.name} as MIGHT_HAVE for {guesser.name}")
            for player in asked_order:
                if showed_by is not player:
                    for card in guess:
                        player.set_card_knowledge(card, KnowledgeState.NOT_HAS)
                        print(f"Set {card.name} as NOT_HAS for {player.name}")
                else:
                    if player.is_user:
                        continue  # Skip updating our own table if we are the one showing
                    for card in guess:
                        player.set_card_knowledge(card, KnowledgeState.MIGHT_HAVE)
                        print(f"Set {card.name} as MIGHT_HAVE for {player.name}")
        
        # Update possible solutions based on new knowledge
        self.update_possible_solutions()
        
        # Validate and clear invalid best guess
        self.validate_best_guess()
        
        # Save knowledge state after updating
        self.save_knowledge_state()
        print("Knowledge state saved to JSON")

    def evaluate_guesses(self, asked_order: List[Player]) -> None:
        """
        Evaluates all possible guesses using expected information gain (entropy),
        considering current knowledge about which cards each player could have.
        Picks the guess that, on average, leaves the smallest entropy in the answer space.
        """
        possible_guesses = self.get_possible_guesses(list(self.game_state.possible_rooms))
        possible_solutions = self.game_state.get_possible_solutions()

        best_guess = None
        best_expected_entropy = float('inf')

        print(f"Evaluating {len(possible_guesses)} possible guesses against {len(possible_solutions)} possible solutions")
        
        if not possible_guesses:
            print("No valid guesses available!")
            self.game_state.best_guess = None
            return
        
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
            
            print(f"Guess {[c.name for c in guess]}: entropy = {expected_entropy:.3f}, feedback groups = {len(feedback_groups)}")
            
            if expected_entropy < best_expected_entropy:
                best_expected_entropy = expected_entropy
                best_guess = guess
                print(f"  -> New best guess!")

        self.game_state.best_guess = best_guess
        
        # Clear best guess if it contains cards that are no longer possible
        if best_guess:
            suspect, weapon, room = best_guess
            if (suspect not in self.game_state.possible_suspects or 
                weapon not in self.game_state.possible_weapons or 
                room not in self.game_state.possible_rooms):
                print(f"Clearing best guess {[c.name for c in best_guess]} as it contains impossible cards")
                self.game_state.best_guess = None
        
        # Save knowledge state after evaluating guesses
        self.save_knowledge_state()

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

    def get_knowledge_summary(self) -> dict:
        """
        Returns a summary of current knowledge for display in the UI.
        """
        summary = {
            "possible_solutions_count": len(self.game_state.get_possible_solutions()),
            "known_cards": {},
            "solution_candidates": {
                "suspects": list(self.game_state.possible_suspects),
                "weapons": list(self.game_state.possible_weapons),
                "rooms": list(self.game_state.possible_rooms)
            }
        }
        
        # Get known cards for each player
        for player in self.game_state.players:
            known_cards = [card.name for card, state in player.knowledge_table.items() 
                          if state == KnowledgeState.HAS]
            summary["known_cards"][player.name] = known_cards
            
        return summary

    def clear_knowledge_state(self):
        """
        Clear the knowledge state file for testing purposes.
        """
        if os.path.exists(self.knowledge_file):
            os.remove(self.knowledge_file)
            print("Knowledge state file cleared")

    def update_possible_solutions(self):
        """
        Updates the possible solutions based on current knowledge.
        If a card is known to be in someone's hand, it can't be in the solution.
        """
        # Get all cards that are known to be in someone's hand
        cards_in_hands = set()
        for player in self.game_state.players:
            for card, state in player.knowledge_table.items():
                if state == KnowledgeState.HAS:
                    cards_in_hands.add(card)
        
        # Update possible suspects, weapons, and rooms
        possible_suspects = [card for card in self.game_state.all_suspects if card not in cards_in_hands]
        possible_weapons = [card for card in self.game_state.all_weapons if card not in cards_in_hands]
        possible_rooms = [card for card in self.game_state.all_rooms if card not in cards_in_hands]
        
        # Update the game state
        self.game_state.set_possible_suspects(possible_suspects)
        self.game_state.set_possible_weapons(possible_weapons)
        self.game_state.set_possible_rooms(possible_rooms)
        
        print(f"Updated possible solutions:")
        print(f"  Suspects: {[c.name for c in possible_suspects]}")
        print(f"  Weapons: {[c.name for c in possible_weapons]}")
        print(f"  Rooms: {[c.name for c in possible_rooms]}")
        print(f"  Cards known to be in hands: {[c.name for c in cards_in_hands]}")

    def validate_best_guess(self):
        """
        Validates the current best guess and clears it if it contains impossible cards.
        """
        if hasattr(self.game_state, 'best_guess') and self.game_state.best_guess:
            suspect, weapon, room = self.game_state.best_guess
            if (suspect not in self.game_state.possible_suspects or 
                weapon not in self.game_state.possible_weapons or 
                room not in self.game_state.possible_rooms):
                print(f"Invalidating best guess {[c.name for c in self.game_state.best_guess]} as it contains impossible cards")
                self.game_state.best_guess = None
                return True
        return False

    # Add more methods as needed