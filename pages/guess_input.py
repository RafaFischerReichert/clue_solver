import streamlit as st
from controller.gameStateController import GameStateController
from model.gameStateModel import GameState
from model.knowledgeState import KnowledgeState
from model.boardModel import board_grid, room_entrances
import csv
import os
import random

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
user_cards = game_state.players[game_state.user_index].cards
user_hand = [c.name for c in user_cards] if user_cards is not None else []

# Load knowledge state from JSON if it exists
controller.load_knowledge_state()

# --- Movement UI ---
st.header("Movement & Position")

# User inputs movement points (no dice roll in solver)
if "movement_count" not in st.session_state:
    st.session_state["movement_count"] = 0
st.session_state["movement_count"] = st.number_input(
    "Movement points this turn (enter your dice roll)", min_value=0, max_value=24, value=st.session_state["movement_count"], step=1
)
st.write(f"Movement points this turn: **{st.session_state['movement_count']}**")

# Position selection
room_options = list(room_entrances.keys())
col1, col2 = st.columns(2)
with col1:
    in_room = st.checkbox("Are you in a room?", value=game_state.current_room is not None)
if in_room:
    with col2:
        selected_room = st.selectbox("Current Room", room_options, index=room_options.index(game_state.current_room) if game_state.current_room else 0)
    game_state.current_room = selected_room
    game_state.current_position = None
else:
    with col2:
        row = st.number_input("Current Row (0-9)", min_value=0, max_value=9, value=game_state.current_position[0] if game_state.current_position else 5)
        col = st.number_input("Current Col (0-11)", min_value=0, max_value=11, value=game_state.current_position[1] if game_state.current_position else 5)
    game_state.current_room = None
    game_state.current_position = (row, col)

# Compute accessible rooms
accessible_rooms = controller.get_accessible_rooms(
    st.session_state["movement_count"],
    game_state.current_room,
    game_state.current_position
)

st.write(f"**Rooms you can reach this turn:** {', '.join(accessible_rooms) if accessible_rooms else 'None'}")

# After movement input, evaluate best guess for accessible rooms
current_players = [p for p in game_state.players if p.name != user_name]
controller.evaluate_guesses(current_players, accessible_rooms=accessible_rooms)

# --- Guess Input ---
st.header("Record a Guess")

# Restrict room choices to accessible rooms
col1, col2, col3, col4 = st.columns(4)
with col1:
    guesser = st.selectbox("Guesser", players)
with col2:
    suspect = st.selectbox("Suspect", suspects)
with col3:
    weapon = st.selectbox("Weapon", weapons)
with col4:
    room = st.selectbox("Room", sorted(accessible_rooms) if accessible_rooms else rooms)

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
    
    # Trigger suggestion evaluation after recording guess
    st.session_state["should_evaluate"] = True

st.header("Suggestions & Current Knowledge")

# Add refresh button
col1, col2 = st.columns([1, 4])
with col1:
    if st.button("🔄 Refresh Analysis"):
        current_players = [p for p in game_state.players if p.name != user_name]
        controller.evaluate_guesses(current_players)
        st.success("Analysis refreshed!")
with col2:
    st.write("Click to recalculate suggestions and update knowledge display")

# Evaluate suggestions if needed
if st.session_state.get("should_evaluate", False):
    # Get the current player order (excluding the user for suggestions)
    current_players = [p for p in game_state.players if p.name != user_name]
    
    # Evaluate best guess
    controller.evaluate_guesses(current_players)
    
    # Clear the flag
    st.session_state["should_evaluate"] = False

# Also evaluate suggestions on page load if we have some knowledge
if not hasattr(game_state, 'best_guess') or game_state.best_guess is None:
    # Check if we have any knowledge to work with
    has_knowledge = any(
        any(state != KnowledgeState.UNKNOWN for state in player.knowledge_table.values())
        for player in game_state.players
    )
    if has_knowledge:
        current_players = [p for p in game_state.players if p.name != user_name]
        controller.evaluate_guesses(current_players)

# Display current knowledge
st.subheader("Current Knowledge")

# Create tabs for different views
tab1, tab2, tab3 = st.tabs(["Player Knowledge", "Possible Solutions", "Best Next Guess"])

with tab1:
    st.write("**What we know about each player's cards:**")
    
    # Create a knowledge table
    all_cards = game_state.all_suspects + game_state.all_weapons + game_state.all_rooms
    knowledge_data = []
    
    for player in game_state.players:
        for card in all_cards:
            state = player.knowledge_table.get(card, KnowledgeState.UNKNOWN)
            knowledge_data.append({
                "Player": player.name,
                "Card": f"{card.name} ({card.card_type})",
                "Status": state.name.replace("_", " ").title()
            })
    
    if knowledge_data:
        import pandas as pd
        df = pd.DataFrame(knowledge_data)
        st.dataframe(df, use_container_width=True)
    
    # Show summary of known cards
    st.write("**Summary of known cards:**")
    for player in game_state.players:
        known_cards = [card.name for card, state in player.knowledge_table.items() 
                      if state == KnowledgeState.HAS]
        if known_cards:
            st.write(f"**{player.name}** has: {', '.join(known_cards)}")

with tab2:
    st.write("**Possible solutions remaining:**")
    possible_solutions = game_state.get_possible_solutions()
    
    if possible_solutions:
        st.write(f"**{len(possible_solutions)} possible solutions remain**")
        
        # Show first 10 solutions (to avoid overwhelming the UI)
        if len(possible_solutions) <= 10:
            for i, (suspect, weapon, room) in enumerate(possible_solutions, 1):
                st.write(f"{i}. {suspect.name} with {weapon.name} in {room.name}")
        else:
            for i, (suspect, weapon, room) in enumerate(possible_solutions[:10], 1):
                st.write(f"{i}. {suspect.name} with {weapon.name} in {room.name}")
            st.write(f"... and {len(possible_solutions) - 10} more")
    else:
        st.warning("No possible solutions remain! Check your input data.")

with tab3:
    st.write("**Best next guess (information gain):**")
    
    if hasattr(game_state, 'best_guess') and game_state.best_guess:
        suspect, weapon, room = game_state.best_guess
        if getattr(game_state, 'best_guess_info', 'solution') == 'info':
            st.warning(f"(No possible solution in accessible rooms. This guess is for information only.)")
        st.success(f"**{suspect.name}** with **{weapon.name}** in **{room.name}**")
        st.write("This guess is expected to provide the most information about the solution.")
    else:
        st.info("No best guess calculated yet. Enter movement and position to see suggestions.")
        
        # Auto-evaluate if we have knowledge but no best guess
        has_knowledge = any(
            any(state != KnowledgeState.UNKNOWN for state in player.knowledge_table.values())
            for player in game_state.players
        )
        if has_knowledge:
            if st.button("Calculate Best Guess"):
                controller.evaluate_guesses(current_players)
                st.rerun()

# Add a "Show Most Likely Solution" button
st.subheader("Solution Analysis")
if st.button("Show Most Likely Solution"):
    possible_solutions = game_state.get_possible_solutions()
    if possible_solutions:
        # Calculate most likely solution
        from collections import Counter
        suspects = [s for s, _, _ in possible_solutions]
        weapons = [w for _, w, _ in possible_solutions]
        rooms = [r for _, _, r in possible_solutions]

        most_likely_suspect = Counter(suspects).most_common(1)[0][0]
        most_likely_weapon = Counter(weapons).most_common(1)[0][0]
        most_likely_room = Counter(rooms).most_common(1)[0][0]

        st.success("**Most likely solution:**")
        st.write(f"**Suspect:** {most_likely_suspect.name}")
        st.write(f"**Weapon:** {most_likely_weapon.name}")
        st.write(f"**Room:** {most_likely_room.name}")
        st.write(f"*({len(possible_solutions)} possible solutions remain)*")
    else:
        st.warning("No possible solutions remain!")

# Debug section
with st.expander("🔧 Debug: Current Knowledge State"):
    st.write("**Current knowledge state in JSON format:**")
    import json
    knowledge_data = {
        "players": {},
        "possible_solutions": {
            "suspects": [card.name for card in game_state.possible_suspects],
            "weapons": [card.name for card in game_state.possible_weapons],
            "rooms": [card.name for card in game_state.possible_rooms]
        }
    }
    
    for player in game_state.players:
        player_knowledge = {}
        for card in game_state.all_suspects + game_state.all_weapons + game_state.all_rooms:
            state = player.knowledge_table.get(card, KnowledgeState.UNKNOWN)
            player_knowledge[f"{card.name} ({card.card_type})"] = state.name
        knowledge_data["players"][player.name] = player_knowledge
    
    st.json(knowledge_data)
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Save Current State"):
            controller.save_knowledge_state()
            st.success("Knowledge state saved!")
    with col2:
        if st.button("Clear Knowledge State"):
            controller.clear_knowledge_state()
            st.success("Knowledge state cleared!")
            st.rerun()

if st.button("Back to Setup"):
    st.switch_page("pages/home.py") 