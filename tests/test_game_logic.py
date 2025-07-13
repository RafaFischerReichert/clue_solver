import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Add the parent directory to the path so we can import our modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from model.cardModel import Card
from model.playerModel import Player
from model.knowledgeState import KnowledgeState
from model.gameStateModel import GameState
from controller.gameStateController import GameStateController


class TestCardModel(unittest.TestCase):
    def setUp(self):
        self.suspect = Card("Miss Scarlet", "suspect")
        self.weapon = Card("Candlestick", "weapon")
        self.room = Card("Kitchen", "room")

    def test_card_creation(self):
        self.assertEqual(self.suspect.name, "Miss Scarlet")
        self.assertEqual(self.suspect.card_type, "suspect")
        self.assertEqual(self.weapon.name, "Candlestick")
        self.assertEqual(self.weapon.card_type, "weapon")

    def test_card_equality(self):
        card1 = Card("Miss Scarlet", "suspect")
        card2 = Card("Miss Scarlet", "suspect")
        self.assertEqual(card1, card2)

    def test_card_hash(self):
        card1 = Card("Miss Scarlet", "suspect")
        card2 = Card("Miss Scarlet", "suspect")
        self.assertEqual(hash(card1), hash(card2))


class TestPlayerModel(unittest.TestCase):
    def setUp(self):
        self.player = Player("Miss Scarlet", is_user=True)
        self.card = Card("Kitchen", "room")

    def test_player_creation(self):
        self.assertEqual(self.player.name, "Miss Scarlet")
        self.assertTrue(self.player.is_user)
        self.assertEqual(len(self.player.cards) if self.player.cards else 0, 0)

    def test_add_card(self):
        self.player.add_card(self.card)
        self.assertIn(self.card, self.player.cards if self.player.cards else [])

    def test_has_card_in_hand(self):
        self.assertFalse(self.player.has_card_in_hand(self.card))
        self.player.add_card(self.card)
        self.assertTrue(self.player.has_card_in_hand(self.card))

    def test_set_card_knowledge(self):
        self.player.set_card_knowledge(self.card, KnowledgeState.HAS)
        self.assertEqual(self.player.knowledge_table[self.card], KnowledgeState.HAS)


class TestGameStateModel(unittest.TestCase):
    def setUp(self):
        # Reset singleton for each test
        GameState._instance = None
        
        self.suspects = [Card("Miss Scarlet", "suspect"), Card("Colonel Mustard", "suspect")]
        self.weapons = [Card("Candlestick", "weapon"), Card("Dagger", "weapon")]
        self.rooms = [Card("Kitchen", "room"), Card("Ballroom", "room")]
        self.players = [Player("Miss Scarlet", is_user=True), Player("Colonel Mustard", is_user=False)]
        
        self.game_state = GameState(
            possible_rooms=self.rooms,
            players=self.players,
            user_name="Miss Scarlet",
            all_suspects=self.suspects,
            all_weapons=self.weapons,
            all_rooms=self.rooms
        )

    def tearDown(self):
        # Clean up singleton
        GameState._instance = None

    def test_singleton_pattern(self):
        with self.assertRaises(Exception):
            GameState(self.rooms, self.players, "Miss Scarlet", self.suspects, self.weapons, self.rooms)

    def test_get_possible_solutions(self):
        self.game_state.set_possible_suspects(self.suspects)
        self.game_state.set_possible_weapons(self.weapons)
        self.game_state.set_possible_rooms(self.rooms)
        
        solutions = self.game_state.get_possible_solutions()
        self.assertEqual(len(solutions), 8)  # 2*2*2 = 8 combinations


class TestGameStateController(unittest.TestCase):
    def setUp(self):
        # Reset singleton for each test
        GameState._instance = None
        
        self.suspects = [Card("Miss Scarlet", "suspect"), Card("Colonel Mustard", "suspect")]
        self.weapons = [Card("Candlestick", "weapon"), Card("Dagger", "weapon")]
        self.rooms = [Card("Kitchen", "room"), Card("Ballroom", "room")]
        self.players = [Player("Miss Scarlet", is_user=True), Player("Colonel Mustard", is_user=False)]
        
        self.game_state = GameState(
            possible_rooms=self.rooms,
            players=self.players,
            user_name="Miss Scarlet",
            all_suspects=self.suspects,
            all_weapons=self.weapons,
            all_rooms=self.rooms
        )
        self.game_state.set_possible_suspects(self.suspects)
        self.game_state.set_possible_weapons(self.weapons)
        self.game_state.set_possible_rooms(self.rooms)
        
        self.controller = GameStateController()

    def tearDown(self):
        # Clean up singleton and any created files
        GameState._instance = None
        if os.path.exists("data/knowledge_state.json"):
            os.remove("data/knowledge_state.json")

    def test_record_guess_event_user_guesser(self):
        suspect, weapon, room = self.suspects[0], self.weapons[0], self.rooms[0]
        guesser = self.players[0]  # User
        asked_order = [self.players[1]]  # Other player
        showed_by = self.players[1]
        card_shown = suspect
        
        # Initialize knowledge table for all cards
        all_cards = self.suspects + self.weapons + self.rooms
        for player in self.players:
            for card in all_cards:
                player.knowledge_table[card] = KnowledgeState.UNKNOWN
        
        self.controller.record_guess_event(
            guess=(suspect, weapon, room),
            asked_order=asked_order,
            showed_by=showed_by,
            card_shown=card_shown,
            user_is_guesser=True,
            guesser=guesser
        )
        
        # Check that the card shown is marked as HAS for the player who showed it
        self.assertEqual(asked_order[0].knowledge_table[card_shown], KnowledgeState.HAS)
        
        # Check that other cards in the guess are marked as NOT_HAS for the player who didn't show them
        self.assertEqual(asked_order[0].knowledge_table[weapon], KnowledgeState.NOT_HAS)
        self.assertEqual(asked_order[0].knowledge_table[room], KnowledgeState.NOT_HAS)

    def test_record_guess_event_no_card_shown(self):
        suspect, weapon, room = self.suspects[0], self.weapons[0], self.rooms[0]
        guesser = self.players[0]  # User
        asked_order = [self.players[1]]  # Other player
        
        # Initialize knowledge table for all cards
        all_cards = self.suspects + self.weapons + self.rooms
        for player in self.players:
            for card in all_cards:
                player.knowledge_table[card] = KnowledgeState.UNKNOWN
        
        self.controller.record_guess_event(
            guess=(suspect, weapon, room),
            asked_order=asked_order,
            showed_by=None,
            card_shown=None,
            user_is_guesser=True,
            guesser=guesser
        )
        
        # Check that all cards in the guess are marked as NOT_HAS for the asked player
        for card in [suspect, weapon, room]:
            self.assertEqual(asked_order[0].knowledge_table[card], KnowledgeState.NOT_HAS)

    def test_get_possible_guesses(self):
        # Add a card to a player's hand to test filtering
        self.players[1].add_card(self.suspects[0])
        self.players[1].set_card_knowledge(self.suspects[0], KnowledgeState.HAS)
        
        possible_guesses = self.controller.get_possible_guesses(self.rooms)
        
        # Should not include the card that's known to be in someone's hand
        for suspect, weapon, room in possible_guesses:
            self.assertNotEqual(suspect, self.suspects[0])

    def test_update_possible_solutions(self):
        # Mark a card as being in someone's hand
        self.players[1].add_card(self.suspects[0])
        self.players[1].set_card_knowledge(self.suspects[0], KnowledgeState.HAS)
        
        self.controller.update_possible_solutions()
        
        # The card should be removed from possible solutions
        self.assertNotIn(self.suspects[0], self.game_state.possible_suspects)


if __name__ == '__main__':
    unittest.main() 