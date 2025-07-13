import unittest
from model.cardModel import Card
from model.playerModel import Player
from model.knowledgeState import KnowledgeState

class TestCard(unittest.TestCase):
    def test_card_equality_and_hash(self):
        c1 = Card("Kitchen", "room")
        c2 = Card("Kitchen", "room")
        c3 = Card("Ballroom", "room")
        self.assertEqual(c1, c2)
        self.assertNotEqual(c1, c3)
        self.assertEqual(hash(c1), hash(c2))
        self.assertNotEqual(hash(c1), hash(c3))

    def test_card_repr(self):
        c = Card("Kitchen", "room")
        self.assertIn("Kitchen", repr(c))
        self.assertIn("room", repr(c))

class TestPlayer(unittest.TestCase):
    def setUp(self):
        self.player = Player("Miss Scarlet", is_user=True)
        self.other = Player("Colonel Mustard")
        self.card1 = Card("Kitchen", "room")
        self.card2 = Card("Ballroom", "room")
        self.card3 = Card("Candlestick", "weapon")

    def test_add_and_see_card(self):
        self.player.add_card(self.card1)
        self.assertIn(self.card1, self.player.cards)
        self.player.see_card(self.card2)
        self.assertIn(self.card2, self.player.seen_cards)

    def test_set_card_knowledge_hierarchy(self):
        # HAS should not be overwritten by MIGHT_HAVE
        self.player.set_card_knowledge(self.card1, KnowledgeState.HAS)
        self.player.set_card_knowledge(self.card1, KnowledgeState.MIGHT_HAVE)
        self.assertEqual(self.player.knowledge_table[self.card1], KnowledgeState.HAS)
        # UNKNOWN can be upgraded
        self.player.set_card_knowledge(self.card2, KnowledgeState.MIGHT_HAVE)
        self.assertEqual(self.player.knowledge_table[self.card2], KnowledgeState.MIGHT_HAVE)
        # NOT_HAS should not be overwritten by MIGHT_HAVE
        self.player.set_card_knowledge(self.card3, KnowledgeState.NOT_HAS)
        self.player.set_card_knowledge(self.card3, KnowledgeState.MIGHT_HAVE)
        self.assertEqual(self.player.knowledge_table[self.card3], KnowledgeState.NOT_HAS)

    def test_has_card_in_hand(self):
        self.assertFalse(self.player.has_card_in_hand(self.card1))
        self.player.add_card(self.card1)
        self.assertTrue(self.player.has_card_in_hand(self.card1))
        self.assertFalse(self.other.has_card_in_hand(self.card1))

    def test_has_solution(self):
        # No solution if not all types marked as IS_SOLUTION
        self.player.knowledge_table[self.card1] = KnowledgeState.IS_SOLUTION
        self.player.knowledge_table[self.card3] = KnowledgeState.IS_SOLUTION
        self.assertFalse(self.player.has_solution())
        # Add a third type
        suspect_card = Card("Miss Scarlet", "suspect")
        self.player.knowledge_table[suspect_card] = KnowledgeState.IS_SOLUTION
        self.assertTrue(self.player.has_solution())

    def test_repr(self):
        r = repr(self.player)
        self.assertIn("Miss Scarlet", r)
        self.assertIn("is_user", r)

if __name__ == "__main__":
    unittest.main() 