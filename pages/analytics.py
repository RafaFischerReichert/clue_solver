import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from controller.gameStateController import GameStateController
from model.gameStateModel import GameState
from model.knowledgeState import KnowledgeState
import numpy as np

st.set_page_config(
    page_title="Clue Solver - Analytics",
    page_icon="📊",
    layout="wide"
)

st.title("📊 Clue Solver Analytics")

# Check if game is initialized
try:
    game_state = GameState.get_instance()
except Exception:
    st.warning("Please set up the game first.")
    st.switch_page("pages/home.py")
    st.stop()

controller = GameStateController()
controller.load_knowledge_state()

# Sidebar for filters
st.sidebar.header("📊 Analytics Filters")
show_advanced = st.sidebar.checkbox("Show Advanced Analytics", value=False)

# Main analytics content
col1, col2 = st.columns([2, 1])

with col1:
    st.header("🎯 Game Progress Overview")
    
    # Calculate progress metrics
    total_cards = len(game_state.all_suspects + game_state.all_weapons + game_state.all_rooms)
    known_cards = sum(
        1 for player in game_state.players
        for state in player.knowledge_table.values()
        if state == KnowledgeState.HAS
    )
    unknown_cards = sum(
        1 for player in game_state.players
        for state in player.knowledge_table.values()
        if state == KnowledgeState.UNKNOWN
    )
    
    # Progress bars
    st.metric("Total Cards", total_cards)
    st.metric("Known Cards", known_cards)
    st.metric("Unknown Cards", unknown_cards)
    
    # Progress percentage
    progress_pct = (known_cards / total_cards) * 100
    st.progress(progress_pct / 100)
    st.write(f"**Progress: {progress_pct:.1f}%**")

with col2:
    st.header("🎲 Possible Solutions")
    possible_solutions = game_state.get_possible_solutions()
    st.metric("Remaining Solutions", len(possible_solutions))
    
    if possible_solutions:
        # Show solution breakdown
        suspects = [s.name for s, _, _ in possible_solutions]
        weapons = [w.name for _, w, _ in possible_solutions]
        rooms = [r.name for _, _, r in possible_solutions]
        
        st.write("**Most likely suspects:**")
        suspect_counts = pd.Series(suspects).value_counts()
        for suspect, count in suspect_counts.head(3).items():
            st.write(f"• {suspect}: {count}")

# Knowledge Distribution Chart
st.header("📈 Knowledge Distribution by Player")

# Create knowledge distribution data
knowledge_data = []
for player in game_state.players:
    for card in game_state.all_suspects + game_state.all_weapons + game_state.all_rooms:
        state = player.knowledge_table.get(card, KnowledgeState.UNKNOWN)
        knowledge_data.append({
            "Player": player.name,
            "Card": card.name,
            "Card Type": card.card_type,
            "Status": state.name.replace("_", " ").title()
        })

if knowledge_data:
    df = pd.DataFrame(knowledge_data)
    
    # Create pivot table for visualization
    pivot_df = df.pivot_table(
        index="Player", 
        columns="Status", 
        values="Card", 
        aggfunc="count", 
        fill_value=0
    )
    
    # Create stacked bar chart
    fig = px.bar(
        pivot_df,
        title="Knowledge Status by Player",
        labels={"value": "Number of Cards", "variable": "Knowledge Status"},
        color_discrete_map={
            "Has": "#2E8B57",
            "Not Has": "#DC143C", 
            "Might Have": "#FFD700",
            "Unknown": "#808080"
        }
    )
    fig.update_layout(height=400)
    st.plotly_chart(fig, use_container_width=True)

# Card Type Analysis
st.header("🃏 Card Type Analysis")

col1, col2 = st.columns(2)

with col1:
    # Knowledge by card type
    type_data = []
    for card_type in ["suspect", "weapon", "room"]:
        cards_of_type = [c for c in game_state.all_suspects + game_state.all_weapons + game_state.all_rooms 
                        if c.card_type == card_type]
        known_of_type = sum(
            1 for player in game_state.players
            for card in cards_of_type
            if player.knowledge_table.get(card, KnowledgeState.UNKNOWN) == KnowledgeState.HAS
        )
        type_data.append({
            "Card Type": card_type.title(),
            "Total Cards": len(cards_of_type),
            "Known Cards": known_of_type,
            "Unknown Cards": len(cards_of_type) - known_of_type
        })
    
    type_df = pd.DataFrame(type_data)
    
    fig = px.bar(
        type_df,
        x="Card Type",
        y=["Known Cards", "Unknown Cards"],
        title="Knowledge by Card Type",
        barmode="stack"
    )
    fig.update_layout(height=300)
    st.plotly_chart(fig, use_container_width=True)

with col2:
    # Pie chart of knowledge distribution
    status_counts = df["Status"].value_counts()
    fig = px.pie(
        values=status_counts.values,
        names=status_counts.index,
        title="Overall Knowledge Distribution"
    )
    fig.update_layout(height=300)
    st.plotly_chart(fig, use_container_width=True)

# Advanced Analytics
if show_advanced:
    st.header("🔬 Advanced Analytics")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Information Gain Analysis")
        
        # Calculate information gain for recent guesses
        if hasattr(game_state, 'best_guess') and game_state.best_guess:
            suspect, weapon, room = game_state.best_guess
            st.write(f"**Current best guess:** {suspect.name} + {weapon.name} + {room.name}")
            
            # Simulate information gain
            possible_solutions = game_state.get_possible_solutions()
            if possible_solutions:
                # Calculate entropy reduction
                initial_entropy = np.log2(len(possible_solutions))
                st.metric("Current Solution Entropy", f"{initial_entropy:.2f} bits")
                
                # Show entropy reduction potential
                if len(possible_solutions) > 1:
                    potential_entropy = np.log2(len(possible_solutions) / 2)  # Rough estimate
                    entropy_reduction = initial_entropy - potential_entropy
                    st.metric("Potential Information Gain", f"{entropy_reduction:.2f} bits")
    
    with col2:
        st.subheader("Player Activity Analysis")
        
        # Analyze player activity patterns
        player_activity = {}
        for player in game_state.players:
            known_cards = sum(
                1 for state in player.knowledge_table.values()
                if state == KnowledgeState.HAS
            )
            unknown_cards = sum(
                1 for state in player.knowledge_table.values()
                if state == KnowledgeState.UNKNOWN
            )
            player_activity[player.name] = {
                "Known": known_cards,
                "Unknown": unknown_cards,
                "Knowledge Ratio": known_cards / (known_cards + unknown_cards) if (known_cards + unknown_cards) > 0 else 0
            }
        
        activity_df = pd.DataFrame.from_dict(player_activity, orient="index")
        st.dataframe(activity_df, use_container_width=True)

# Game Timeline
st.header("📅 Game Timeline")

# Load game log if available
try:
    import os
    csv_path = os.path.join("data", "game_log.csv")
    if os.path.exists(csv_path):
        game_log = pd.read_csv(csv_path)
        
        if not game_log.empty:
            # Create timeline visualization
            st.subheader("Recent Guesses")
            
            # Show last 10 guesses
            recent_guesses = game_log.tail(10)
            
            for idx, row in recent_guesses.iterrows():
                with st.expander(f"Guess {idx + 1}: {row['guesser']} → {row['suspect']}, {row['weapon']}, {row['room']}"):
                    col1, col2, col3 = st.columns(3)
                    with col1:
                        st.write(f"**Guesser:** {row['guesser']}")
                        st.write(f"**Guess:** {row['suspect']}, {row['weapon']}, {row['room']}")
                    with col2:
                        st.write(f"**Asked:** {row['asked_order']}")
                        st.write(f"**Showed by:** {row['showed_by']}")
                    with col3:
                        st.write(f"**Card shown:** {row['card_shown']}")
        else:
            st.info("No guesses recorded yet. Start playing to see the timeline!")
    else:
        st.info("No game log found. Start playing to generate analytics data!")
        
except Exception as e:
    st.warning(f"Could not load game log: {e}")

# Export functionality
st.header("💾 Export Data")

col1, col2 = st.columns(2)

with col1:
    if st.button("📊 Export Knowledge State"):
        try:
            import json
            knowledge_data = controller.get_knowledge_summary()
            st.download_button(
                label="Download JSON",
                data=json.dumps(knowledge_data, indent=2),
                file_name="knowledge_state.json",
                mime="application/json"
            )
        except Exception as e:
            st.error(f"Export failed: {e}")

with col2:
    if st.button("📈 Export Analytics Report"):
        try:
            # Create a comprehensive report
            report_data = {
                "game_progress": {
                    "total_cards": total_cards,
                    "known_cards": known_cards,
                    "unknown_cards": unknown_cards,
                    "progress_percentage": progress_pct
                },
                "possible_solutions": len(possible_solutions),
                "player_knowledge": knowledge_data,
                "timestamp": pd.Timestamp.now().isoformat()
            }
            
            st.download_button(
                label="Download Report",
                data=json.dumps(report_data, indent=2),
                file_name="clue_analytics_report.json",
                mime="application/json"
            )
        except Exception as e:
            st.error(f"Report generation failed: {e}") 