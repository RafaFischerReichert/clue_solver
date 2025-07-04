import streamlit as st
from controller.gameStateController import GameStateController
from model.gameStateModel import GameState

st.title("Cluedo Solver Helper - Guess Input & Suggestions")

game_state = None
try:
    game_state = GameState.get_instance()
except Exception:
    st.warning("Please set up the game first.")
    st.switch_page("pages/home.py")
    st.stop()

controller = GameStateController()
players = [p.name for p in game_state.players]
suspects = [c.name for c in game_state.all_suspects]
weapons = [c.name for c in game_state.all_weapons]
rooms = [c.name for c in game_state.all_rooms]
user_name = game_state.players[game_state.user_index].name
user_hand = [c.name for c in game_state.players[game_state.user_index].cards] if game_state.players[game_state.user_index].cards else []

st.header("Record a Guess")

# Guess input
col1, col2, col3, col4 = st.columns(4)
with col1:
    guesser = st.selectbox("Guesser", players)
with col2:
    suspect = st.selectbox("Suspect", suspects)
with col3:
    weapon = st.selectbox("Weapon", weapons)
with col4:
    room = st.selectbox("Room", rooms)

asked_order = st.multiselect("Order of players asked (excluding guesser)", [p for p in players if p != guesser])
showed_by = st.selectbox("Who showed a card? (if any)", ["None"] + asked_order)
card_shown = st.text_input("Card shown (if known, else leave blank)")

if st.button("Record Guess"):
    # Map names to objects
    guesser_obj = next(p for p in game_state.players if p.name == guesser)
    suspect_obj = next(c for c in game_state.all_suspects if c.name == suspect)
    weapon_obj = next(c for c in game_state.all_weapons if c.name == weapon)
    room_obj = next(c for c in game_state.all_rooms if c.name == room)
    asked_order_objs = [p for p in game_state.players if p.name in asked_order]
    showed_by_obj = next((p for p in game_state.players if p.name == showed_by), None) if showed_by != "None" else None
    card_shown_obj = None
    for c in game_state.all_suspects + game_state.all_weapons + game_state.all_rooms:
        if c.name.lower() == card_shown.lower():
            card_shown_obj = c
            break
    user_is_guesser = (guesser == user_name)
    controller.record_guess_event(  
        guess=(suspect_obj, weapon_obj, room_obj),
        asked_order=asked_order_objs,
        showed_by=showed_by_obj,
        card_shown=card_shown_obj,
        user_is_guesser=user_is_guesser,
        guesser=guesser_obj
    )
    st.success(f"Guess recorded: {guesser} guessed {suspect}, {weapon}, {room}. Showed by: {showed_by}. Card: {card_shown or 'Unknown'}.")

st.header("Suggestions & Current Knowledge")

# Placeholder for suggestions (could use controller.evaluate_guesses, etc.)
st.info("Suggestions and knowledge will appear here once logic is connected.")

if st.button("Back to Setup"):
    st.switch_page("pages/home.py") 