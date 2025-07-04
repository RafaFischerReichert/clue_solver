# model/boardModel.py

# Board cell types
tile = {
    'W': 'wall',
    'H': 'hallway',
    'E': 'entrance',
    'R': 'room',
}

# 10x12 grid (row, col)
# Legend: W=wall, H=hallway, E=entrance, R=room interior (not used for movement)
# We'll only use hallway and entrance tiles for movement
# This is a simplified layout for logic, not for display

board_grid = [
    # 0  1  2  3  4  5  6  7  8  9 10 11
    ['R','R','W','H','H','E','H','H','W','R','R','R'], # 0
    ['R','R','W','H','W','W','W','H','W','R','R','R'], # 1
    ['W','W','W','H','W','R','W','H','W','W','W','W'], # 2
    ['H','H','H','H','E','H','E','H','H','H','H','H'], # 3
    ['H','W','W','W','W','H','W','W','W','W','W','H'], # 4
    ['E','H','H','H','H','H','H','H','H','H','H','E'], # 5
    ['H','W','W','W','W','H','W','W','W','W','W','H'], # 6
    ['H','H','H','H','E','H','E','H','H','H','H','H'], # 7
    ['W','W','W','H','W','R','W','H','W','W','W','W'], # 8
    ['R','R','W','H','W','W','W','H','W','R','R','R'], # 9
]

# Room entrances (row, col)
room_entrances = {
    'Kitchen': [(0,5)],
    'Ballroom': [(3,4),(3,6)],
    'Conservatory': [(0,6)],
    'Dining Room': [(5,0)],
    'Billiard Room': [(7,6)],
    'Library': [(7,4)],
    'Lounge': [(9,5)],
    'Hall': [(5,11)],
    'Study': [(0,11)],
}

# Room hatches (secret passages):
# Each tuple is (from_room, to_room)
hatches = [
    ('Lounge', 'Kitchen'),
    ('Kitchen', 'Study'),
    ('Study', 'Lounge'),
]

# Map each room to its hatch destination (if any)
room_hatch_map = {
    'Lounge': 'Kitchen',
    'Kitchen': 'Study',
    'Study': 'Lounge',
}

def is_hallway_or_entrance(cell):
    return cell in ['H', 'E']

def get_neighbors(pos):
    """Return orthogonal neighbors (no diagonals) within grid bounds."""
    row, col = pos
    neighbors = []
    for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
        nr, nc = row+dr, col+dc
        if 0 <= nr < len(board_grid) and 0 <= nc < len(board_grid[0]):
            neighbors.append((nr, nc))
    return neighbors 