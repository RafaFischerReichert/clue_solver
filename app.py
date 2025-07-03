import streamlit as st
from enum import Enum

# App title
st.title("Cluedo Solver Helper")

# Sidebar for user input
st.sidebar.header("Game Setup")

# Input: Players
players = st.sidebar.text_area(
    "Enter player names (one per line):",
    placeholder="Miss Scarlet\nColonel Mustard\nMrs. White\n..."
)

# Input: Suspects
use_default_suspects = st.sidebar.checkbox("Use default suspects", value=True)
default_suspects = "Miss Scarlet\nColonel Mustard\nMrs. White\nMr. Green\nMrs. Peacock\nProfessor Plum"
suspects = st.sidebar.text_area(
    "Enter suspects (one per line):",
    value=default_suspects if use_default_suspects else "",
    placeholder=default_suspects
)

# Input: Weapons
use_default_weapons = st.sidebar.checkbox("Use default weapons", value=True)
default_weapons = "Candlestick\nDagger\nLead Pipe\nRevolver\nRope\nWrench"
weapons = st.sidebar.text_area(
    "Enter weapons (one per line):",
    value=default_weapons if use_default_weapons else "",
    placeholder=default_weapons
)

# Input: Rooms
use_default_rooms = st.sidebar.checkbox("Use default rooms", value=True)
default_rooms = "Kitchen\nBallroom\nConservatory\nDining Room\nBilliard Room\nLibrary\nLounge\nHall\nStudy"
rooms = st.sidebar.text_area(
    "Enter rooms (one per line):",
    value=default_rooms if use_default_rooms else "",
    placeholder=default_rooms
)

# Main area for suggestions (placeholder)
st.header("Suggestions")
st.info("Suggestions will appear here once you start entering game data and logic is implemented.") 
