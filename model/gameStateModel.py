from typing import List

class GameState:
    def __init__(self, rooms: List, players: List, user_name: str):
        self.accessible_rooms = rooms
        self.possible_suspects = set()
        self.possible_weapons = set()
        self.possible_rooms = set(rooms)
        self.players = players
        self.user_index = players.index(user_name)

    def set_possible_suspects(self, suspects):
        self.possible_suspects = set(suspects)

    def set_possible_weapons(self, weapons):
        self.possible_weapons = set(weapons)

    def set_possible_rooms(self, rooms):
        self.possible_rooms = set(rooms)

    def get_possible_solutions(self):
        # Returns all possible (suspect, weapon, room) combinations
        return [
            (suspect, weapon, room)
            for suspect in self.possible_suspects
            for weapon in self.possible_weapons
            for room in self.possible_rooms
        ]
    

    # set player pos, 1-># of players, ask for info 1->player pos times