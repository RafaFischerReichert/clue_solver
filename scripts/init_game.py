from model.cardModel import Card
from model.playerModel import Player
from model.gameStateModel import GameState

# Example card names (replace with your actual game data)
suspect_names = ["Green", "Mustard", "Peacock", "Plum", "Scarlet", "White"]
weapon_names = ["Candlestick", "Dagger", "Lead Pipe", "Revolver", "Rope", "Wrench"]
room_names = ["Kitchen", "Ballroom", "Conservatory", "Dining Room", "Billiard Room", "Library", "Lounge", "Hall", "Study"]

# Prompt for player names and user name
print("Enter player names in turn order, one per line. Enter a blank line to finish:")
player_names = []
while True:
    name = input(f"Player {len(player_names)+1} name: ").strip()
    if not name:
        break
    player_names.append(name)

user_name = input("Enter your player name exactly as above: ").strip()

# Create all cards
suspects = [Card(name, 'suspect') for name in suspect_names]
weapons = [Card(name, 'weapon') for name in weapon_names]
rooms = [Card(name, 'room') for name in room_names]
all_cards = suspects + weapons + rooms

# Create Player objects
players = [Player(name, is_user=(name == user_name)) for name in player_names]
user_player = next(p for p in players if p.is_user)

# Prompt user for their hand
print("\nEnter the cards in your hand, one per line (format: <name> (<type>)). Enter a blank line to finish:")
for card in all_cards:
    print(f"- {card.name} ({card.card_type})")
user_cards_input = []
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
possible_suspects = [c for c in suspect_names if Card(c, 'suspect') not in user_cards_input]
possible_weapons = [c for c in weapon_names if Card(c, 'weapon') not in user_cards_input]
possible_rooms = [c for c in room_names if Card(c, 'room') not in user_cards_input]

game_state = GameState(room_names, players, user_name)
game_state.set_possible_suspects(possible_suspects)
game_state.set_possible_weapons(possible_weapons)
game_state.set_possible_rooms(possible_rooms)
for card in user_cards_input:
    user_player.add_card(card)
    user_player.see_card(card)

# Print summary
print("\nGame initialized!")
print(f"Players: {', '.join(player_names)}")
print(f"You are: {user_name}")
print(f"Your cards: {[f'{c.name} ({c.card_type})' for c in user_player.cards]}")
print(f"Possible suspects: {game_state.possible_suspects}")
print(f"Possible weapons: {game_state.possible_weapons}")
print(f"Possible rooms: {game_state.possible_rooms}") 