from typing import List, Set
from model.cardModel import Card
from model.playerModel import Player

class GameState:
    _instance = None
    possible_suspects: Set[Card]
    possible_weapons: Set[Card]
    possible_rooms: Set[Card]
    players: List[Player]
    user_index: int
    all_suspects: List[Card]
    all_weapons: List[Card]
    all_rooms: List[Card]

    def __init__(self, rooms: List[str], players: List[Player], user_name: str, all_suspects: List[Card], all_weapons: List[Card], all_rooms: List[Card]) -> None:
        if GameState._instance is not None:
            raise Exception("GameState is a singleton! Use GameState.get_instance().")
        self.possible_suspects: Set[Card] = set()
        self.possible_weapons: Set[Card] = set()
        self.possible_rooms: Set[Card] = set(rooms)
        self.players: List[Player] = players
        self.user_index: int = players.index(user_name)
        self.all_suspects: List[Card] = all_suspects
        self.all_weapons: List[Card] = all_weapons
        self.all_rooms: List[Card] = all_rooms
        GameState._instance = self

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            raise Exception("GameState has not been initialized yet.")
        return cls._instance

    def set_possible_suspects(self, suspects: List[Card]) -> None:
        self.possible_suspects = set(suspects)

    def set_possible_weapons(self, weapons: List[Card]) -> None:
        self.possible_weapons = set(weapons)

    def set_possible_rooms(self, rooms: List[Card]) -> None:
        self.possible_rooms = set(rooms)

    def get_possible_solutions(self) -> List[tuple]:
        # Returns all possible (suspect, weapon, room) combinations
        return [
            (suspect, weapon, room)
            for suspect in self.possible_suspects
            for weapon in self.possible_weapons
            for room in self.possible_rooms
        ]
    

    # set player pos, 1-># of players, ask for info 1->player pos times