from model.cardModel import Card
from model.playerModel import Player
from model.gameStateModel import GameState
from typing import List

def GameInitializer() -> bool:
    # Example card names (replace with your actual game data)
    suspect_names: List[str] = ["Green", "Mustard", "Peacock", "Plum", "Scarlet", "White"]
    weapon_names: List[str] = ["Candlestick", "Dagger", "Lead Pipe", "Revolver", "Rope", "Wrench"]
    room_names: List[str] = ["Kitchen", "Ballroom", "Conservatory", "Dining Room", "Billiard Room", "Library", "Lounge", "Hall", "Study"]

    # Prompt for player names and user name
    print("Enter player names in turn order, one per line. Enter a blank line to finish:")
    player_names: List[str] = []
    while True:
        name = input(f"Player {len(player_names)+1} name: ").strip()
        if not name:
            break
        player_names.append(name)

    user_name = input("Enter your player name exactly as above: ").strip()

    # Create all cards
    suspects: List[Card] = [Card(name, 'suspect') for name in suspect_names]
    weapons: List[Card] = [Card(name, 'weapon') for name in weapon_names]
    rooms: List[Card] = [Card(name, 'room') for name in room_names]
    all_cards: List[Card] = suspects + weapons + rooms

    # Create Player objects
    players: List[Player] = [Player(name, is_user=(name == user_name)) for name in player_names]
    user_player: Player = next(p for p in players if p.is_user)

    # Prompt user for their hand
    print("\nEnter the cards in your hand, one per line (format: <name> (<type>)). Enter a blank line to finish:")
    for card in all_cards:
        print(f"- {card.name} ({card.card_type})")
    user_cards_input: List[Card] = []
    while True:
        card_input = input("Card (or blank to finish): ").strip()
        if not card_input:
            break
        for card in all_cards:
            if f"{card.name} ({card.card_type})".lower() == card_input.lower():
                user_cards_input.append(card)
                break
        else:
            print("Card not recognized, try again.")

    # Remove user's cards from possible solutions and add to user hand
    possible_suspects: List[Card] = [c for c in suspects if c not in user_cards_input]
    possible_weapons: List[Card] = [c for c in weapons if c not in user_cards_input]
    possible_rooms: List[Card] = [c for c in rooms if c not in user_cards_input]

    for player in players:
        for card in all_cards:
            if player.is_user and card in user_cards_input:
                player.add_card(card)
                player.see_card(card)
                player.knowledge_table[card] = "HAS"
            else:
                player.knowledge_table[card] = "UNKNOWN"

    GameState(room_names, players, user_name, suspects, weapons, rooms)
    GameState.get_instance().set_possible_suspects(possible_suspects)
    GameState.get_instance().set_possible_weapons(possible_weapons)
    GameState.get_instance().set_possible_rooms(possible_rooms)
    for card in user_cards_input:
        user_player.add_card(card)
        user_player.see_card(card)

    # Print summary
    print("\nGame initialized!")
    print(f"Players: {', '.join(player_names)}")
    print(f"You are: {user_name}")
    print(f"Your cards: {[f'{c.name} ({c.card_type})' for c in user_player.cards]}")
    print(f"Possible suspects: {GameState.get_instance().possible_suspects}")
    print(f"Possible weapons: {GameState.get_instance().possible_weapons}")
    print(f"Possible rooms: {GameState.get_instance().possible_rooms}") 