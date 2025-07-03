class GameController:
    def __init__(self, game_state):
        self.game_state = game_state

    def get_possible_guesses(self):
        # Logic for STEP 2
        # This method should generate all possible guesses minus the cards the user has seen
        possible_suspects = self.game_state.possible_suspects
        possible_weapons = self.game_state.possible_weapons
        possible_rooms = self.game_state.possible_rooms
        possible_guesses = [
            (suspect, weapon, room)
            for suspect in possible_suspects
            for weapon in possible_weapons
            for room in possible_rooms
        ]

    def evaluate_guesses(self):
        # Logic for STEP 3
        # This method should evaluate the possible guesses and return the one that eliminates the most possibilities
        pass

    def update_knowledge(self, info):
        # Logic for STEP 4
        # This method should update table of each player's hands, being able to assign at least the values of "HAS THE CARD", "DOES NOT HAVE THE CARD", "MIGHT HAVE REVEALED THIS CARD TO SOMEONE ELSE"
        pass

    def killswitch(self):
        # Logic for STEP 5
        # This method should be manually activated to give us the best solution based on the current information
        pass

    # Add more methods as needed