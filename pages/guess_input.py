import streamlit as st
from controller.gameStateController import GameStateController
from model.gameStateModel import GameState
import csv
import os

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

guess_cards = [suspect, weapon, room]
asked_order = st.multiselect("Order of players asked (excluding guesser)", [p for p in players if p != guesser])
showed_by = st.selectbox("Who showed a card? (if any)", ["None"] + asked_order)
card_shown = st.selectbox("Card shown (if any)", ["Unknown"] + guess_cards)

# CSV file path
csv_path = os.path.join("data", "game_log.csv")

# Initialize CSV for this session if not already done
if "csv_initialized" not in st.session_state:
    with open(csv_path, mode="w", newline='', encoding="utf-8") as f:
        writer = csv.writer(f)
        # Write header: guess info + knowledge table header
        header = [
            "guesser", "suspect", "weapon", "room", "asked_order", "showed_by", "card_shown"
        ]
        # Add knowledge table columns: player_card_knowledge for each player/card
        for player in game_state.players:
            for card in game_state.all_suspects + game_state.all_weapons + game_state.all_rooms:
                header.append(f"{player.name}:{card.name}")
        writer.writerow(header)
    st.session_state["csv_initialized"] = True

if st.button("Record Guess"):
    # Map names to objects
    guesser_obj = next(p for p in game_state.players if p.name == guesser)
    suspect_obj = next(c for c in game_state.all_suspects if c.name == suspect)
    weapon_obj = next(c for c in game_state.all_weapons if c.name == weapon)
    room_obj = next(c for c in game_state.all_rooms if c.name == room)
    asked_order_objs = [p for p in game_state.players if p.name in asked_order]
    showed_by_obj = next((p for p in game_state.players if p.name == showed_by), None) if showed_by != "None" else None
    card_shown_obj = None
    if card_shown != "Unknown":
        for c in game_state.all_suspects + game_state.all_weapons + game_state.all_rooms:
            if c.name == card_shown:
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
    # Save to CSV
    with open(csv_path, mode="a", newline='', encoding="utf-8") as f:
        writer = csv.writer(f)
        row = [
            guesser, suspect, weapon, room,
            ",".join(asked_order),
            showed_by,
            card_shown if card_shown != "Unknown" else ""
        ]
        # Add knowledge table: for each player, for each card, the knowledge state
        for player in game_state.players:
            for card in game_state.all_suspects + game_state.all_weapons + game_state.all_rooms:
                state = player.knowledge_table.get(card, None)
                row.append(str(state.name) if state else "UNKNOWN")
        writer.writerow(row)
    st.success(f"Guess recorded: {guesser} guessed {suspect}, {weapon}, {room}. Showed by: {showed_by}. Card: {card_shown if card_shown != 'Unknown' else 'Unknown'}.")

st.header("Suggestions & Current Knowledge")

# Placeholder for suggestions (could use controller.evaluate_guesses, etc.)
st.info("Suggestions and knowledge will appear here once logic is connected.")

if st.button("Back to Setup"):
    st.switch_page("pages/home.py") 