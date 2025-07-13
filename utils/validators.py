"""
Validation utilities for the Clue solver application.
"""
from typing import List, Dict, Any, Optional, Tuple, Sequence
from model.cardModel import Card
from model.playerModel import Player


class ValidationError(Exception):
    """Custom exception for validation errors."""
    pass


def validate_player_names(player_names: List[str]) -> None:
    """Validate player names are not empty and unique."""
    if not player_names:
        raise ValidationError("At least one player is required.")
    
    if len(player_names) != len(set(player_names)):
        raise ValidationError("Player names must be unique.")
    
    for name in player_names:
        if not name.strip():
            raise ValidationError("Player names cannot be empty.")
        if len(name.strip()) > 50:
            raise ValidationError("Player names must be 50 characters or less.")


def validate_card_names(card_names: List[str], card_type: str) -> None:
    """Validate card names are not empty and unique."""
    if not card_names:
        raise ValidationError(f"At least one {card_type} is required.")
    
    if len(card_names) != len(set(card_names)):
        raise ValidationError(f"{card_type.capitalize()} names must be unique.")
    
    for name in card_names:
        if not name.strip():
            raise ValidationError(f"{card_type.capitalize()} names cannot be empty.")
        if len(name.strip()) > 50:
            raise ValidationError(f"{card_type.capitalize()} names must be 50 characters or less.")


def validate_user_hand(user_hand: List[str], all_cards: Sequence[Any]) -> None:
    """Validate user's hand contains valid cards."""
    all_card_names = [card.name.lower() for card in all_cards]
    
    for card_name in user_hand:
        if not card_name.strip():
            raise ValidationError("Card names in hand cannot be empty.")
        if card_name.lower() not in all_card_names:
            raise ValidationError(f"Card '{card_name}' is not a valid card in this game.")


def validate_guess_data(
    guesser: str,
    suspect: str,
    weapon: str,
    room: str,
    asked_order: List[str],
    showed_by: Optional[str],
    card_shown: Optional[str],
    players: List[Player],
    all_cards: List[Card]
) -> None:
    """Validate guess data before recording."""
    # Validate guesser exists
    if not any(p.name == guesser for p in players):
        raise ValidationError(f"Guesser '{guesser}' is not a valid player.")
    
    # Validate cards exist
    all_card_names = [card.name for card in all_cards]
    for card_name, card_type in [(suspect, "suspect"), (weapon, "weapon"), (room, "room")]:
        if card_name not in all_card_names:
            raise ValidationError(f"{card_type.capitalize()} '{card_name}' is not a valid card.")
    
    # Validate asked order
    player_names = [p.name for p in players]
    for player_name in asked_order:
        if player_name not in player_names:
            raise ValidationError(f"Player '{player_name}' in asked order is not a valid player.")
        if player_name == guesser:
            raise ValidationError("Guesser cannot be in the asked order.")
    
    # Validate showed_by
    if showed_by and showed_by != "None":
        if showed_by not in player_names:
            raise ValidationError(f"Player '{showed_by}' who showed a card is not a valid player.")
        if showed_by not in asked_order:
            raise ValidationError("Player who showed a card must be in the asked order.")
    
    # Validate card_shown
    if card_shown and card_shown != "Unknown":
        if card_shown not in [suspect, weapon, room]:
            raise ValidationError("Card shown must be one of the cards in the guess.")


def validate_movement_data(
    movement_count: int,
    current_room: Optional[str],
    current_position: Optional[Tuple[int, int]],
    room_entrances: Dict[str, List[Tuple[int, int]]]
) -> None:
    """Validate movement and position data."""
    if movement_count < 0 or movement_count > 24:
        raise ValidationError("Movement count must be between 0 and 24.")
    
    if current_room and current_position:
        raise ValidationError("Cannot be in both a room and a specific position.")
    
    if current_room and current_room not in room_entrances:
        raise ValidationError(f"Room '{current_room}' is not a valid room.")
    
    if current_position:
        row, col = current_position
        if row < 0 or row > 9 or col < 0 or col > 11:
            raise ValidationError("Position must be within the board boundaries (0-9, 0-11).")


def validate_game_state(game_state) -> None:
    """Validate the overall game state for consistency."""
    if not game_state.players:
        raise ValidationError("No players in game state.")
    
    if game_state.user_index < 0 or game_state.user_index >= len(game_state.players):
        raise ValidationError("Invalid user index in game state.")
    
    # Check that user has cards if they should
    user_player = game_state.players[game_state.user_index]
    if user_player.is_user and user_player.cards is None:
        raise ValidationError("User player should have cards list initialized.")
    
    # Validate that all cards are properly categorized
    all_cards = game_state.all_suspects + game_state.all_weapons + game_state.all_rooms
    card_names = [card.name for card in all_cards]
    if len(card_names) != len(set(card_names)):
        raise ValidationError("Duplicate card names found in game state.")


def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent injection attacks."""
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&', ';', '|', '`', '$', '(', ')', '{', '}']
    sanitized = text
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '')
    
    return sanitized.strip()


def format_error_message(error: Exception) -> str:
    """Format error messages for user-friendly display."""
    if isinstance(error, ValidationError):
        return f"❌ {str(error)}"
    elif isinstance(error, ValueError):
        return f"❌ Invalid value: {str(error)}"
    elif isinstance(error, KeyError):
        return f"❌ Missing required data: {str(error)}"
    else:
        return f"❌ An unexpected error occurred: {str(error)}" 