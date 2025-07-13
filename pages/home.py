import streamlit as st
from controller.gameInitializer import initialize_game_state
from utils.validators import (
    validate_player_names, validate_card_names, validate_user_hand, ValidationError, format_error_message
)
from collections import namedtuple

st.title("Cluedo Solver Helper - Game Setup")

st.header("Game Setup")

# Input: Players
players = st.text_area(
    "Enter player names (one per line):",
    placeholder="Miss Scarlet\nColonel Mustard\nMrs. White\n..."
)

# Input: Suspects
use_default_suspects = st.checkbox("Use default suspects", value=True)
default_suspects = "Miss Scarlet\nColonel Mustard\nMrs. White\nMr. Green\nMrs. Peacock\nProfessor Plum"
suspects = st.text_area(
    "Enter suspects (one per line):",
    value=default_suspects if use_default_suspects else "",
    placeholder=default_suspects
)

# Input: Weapons
use_default_weapons = st.checkbox("Use default weapons", value=True)
default_weapons = "Candlestick\nDagger\nLead Pipe\nRevolver\nRope\nWrench"
weapons = st.text_area(
    "Enter weapons (one per line):",
    value=default_weapons if use_default_weapons else "",
    placeholder=default_weapons
)

# Input: Rooms
use_default_rooms = st.checkbox("Use default rooms", value=True)
default_rooms = "Kitchen\nBallroom\nConservatory\nDining Room\nBilliard Room\nLibrary\nLounge\nHall\nStudy"
rooms = st.text_area(
    "Enter rooms (one per line):",
    value=default_rooms if use_default_rooms else "",
    placeholder=default_rooms
)

# Input: User's name
user_name = st.text_input("Enter your player name (must match one above):")

# Input: User's hand
st.subheader("Enter the cards in your hand:")
user_hand = st.text_area(
    "List your cards (one per line, e.g. 'Kitchen', 'Candlestick', etc.):",
    placeholder="Kitchen\nCandlestick\nMiss Scarlet"
)

# Validation and initialization
validation_error = None
game_ready = all([
    players.strip(),
    suspects.strip(),
    weapons.strip(),
    rooms.strip(),
    user_name.strip(),
    user_hand.strip()
])

if game_ready and st.button("Initialize Game State", key="init_gamestate"):
    player_names = [p.strip() for p in players.splitlines() if p.strip()]
    suspect_names = [s.strip() for s in suspects.splitlines() if s.strip()]
    weapon_names = [w.strip() for w in weapons.splitlines() if w.strip()]
    room_names = [r.strip() for r in rooms.splitlines() if r.strip()]
    user = user_name.strip()
    user_hand_names = [c.strip() for c in user_hand.splitlines() if c.strip()]
    all_card_names = suspect_names + weapon_names + room_names
    CardStub = namedtuple('CardStub', ['name'])
    all_card_objs = [CardStub(n) for n in all_card_names]
    try:
        validate_player_names(player_names)
        validate_card_names(suspect_names, "suspect")
        validate_card_names(weapon_names, "weapon")
        validate_card_names(room_names, "room")
        if user not in player_names:
            raise ValidationError("Your player name must match one of the listed players.")
        validate_user_hand(user_hand_names, all_card_objs)
        initialize_game_state(
            player_names=player_names,
            suspect_names=suspect_names,
            weapon_names=weapon_names,
            room_names=room_names,
            user_name=user,
            user_hand_names=user_hand_names,
            session_state=st.session_state
        )
    except ValidationError as e:
        validation_error = format_error_message(e)
    except Exception as e:
        validation_error = format_error_message(e)

if validation_error:
    st.error(validation_error)

start_game_disabled = not (game_ready and hasattr(st.session_state, "_game_state_initialized"))

if st.button("Start Game", disabled=start_game_disabled):
    if not hasattr(st.session_state, "_game_state_initialized"):
        st.warning("Please initialize the game state first.")
    else:
        st.session_state["setup_complete"] = True
        st.switch_page("pages/guess_input.py")