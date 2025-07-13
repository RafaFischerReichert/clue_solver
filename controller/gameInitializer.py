from model.cardModel import Card
from model.playerModel import Player
from model.gameStateModel import GameState
from model.knowledgeState import KnowledgeState
from typing import List, Optional, Union, Any

def initialize_game_state(
    player_names: List[str],
    suspect_names: List[str],
    weapon_names: List[str],
    room_names: List[str],
    user_name: str,
    user_hand_names: List[str],
    session_state: Optional[Union[dict, Any]] = None
):
    # Create Card objects
    suspect_cards = [Card(name, 'suspect') for name in suspect_names]
    weapon_cards = [Card(name, 'weapon') for name in weapon_names]
    room_cards = [Card(name, 'room') for name in room_names]
    all_cards = suspect_cards + weapon_cards + room_cards

    # Create Player objects
    player_objs = [Player(name, is_user=(name == user_name)) for name in player_names]
    user_player = next(p for p in player_objs if p.is_user)

    # Convert user hand names to Card objects
    user_hand_cards = []
    for name in user_hand_names:
        for card in all_cards:
            if card.name.lower() == name.lower():
                user_hand_cards.append(card)
                break

    # Remove user's cards from possible solutions
    possible_suspects = [c for c in suspect_cards if c not in user_hand_cards]
    possible_weapons = [c for c in weapon_cards if c not in user_hand_cards]
    possible_rooms = [c for c in room_cards if c not in user_hand_cards]

    # Set up knowledge tables
    for player in player_objs:
        for card in all_cards:
            if player.is_user and card in user_hand_cards:
                player.add_card(card)
                player.see_card(card)
                player.knowledge_table[card] = KnowledgeState.HAS
            else:
                player.knowledge_table[card] = KnowledgeState.UNKNOWN

    # Initialize GameState singleton
    if session_state is None or not hasattr(session_state, "_game_state_initialized"):
        GameState(room_cards, player_objs, user_name, suspect_cards, weapon_cards, room_cards)
        GameState.get_instance().set_possible_suspects(possible_suspects)
        GameState.get_instance().set_possible_weapons(possible_weapons)
        GameState.get_instance().set_possible_rooms(possible_rooms)
        for card in user_hand_cards:
            user_player.add_card(card)
            user_player.see_card(card)
        if session_state is not None:
            session_state["_game_state_initialized"] = True

    # Print summary
    print("\nGame initialized!")
    print(f"Players: {', '.join(player_names)}")
    print(f"You are: {user_name}")
    print(f"Your cards: {[f'{c.name} ({c.card_type})' for c in user_player.cards] if user_player.cards else []}")
    print(f"Possible suspects: {GameState.get_instance().possible_suspects}")
    print(f"Possible weapons: {GameState.get_instance().possible_weapons}")
    print(f"Possible rooms: {GameState.get_instance().possible_rooms}") 