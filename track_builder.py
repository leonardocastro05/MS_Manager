import json

# Let's trace Image 3 (Albert Park) manually on a 1000x1000 grid
# Start/finish straight in Image 3: Bottom edge, slightly downhill
# Let's orient it so S/F is roughly horizontal at y=800

pts = [
    # Start / Finish Straight
    (400, 850),
    (550, 875),
    # T1 (Jones) - Right turn
    (670, 900),
    (700, 900),
    (730, 870),
    # T2 (Brabham) - Left turn
    (750, 840),
    (770, 780),
    (810, 730),
    # Short straight to T3
    (850, 680),
    # T3 (Sports Centre) - Right turn
    (870, 630),
    (850, 580),
    # T4 - Left turn
    (800, 550),
    (750, 530),
    # T5 - Right sweeper
    (700, 520),
    (630, 540),
    (580, 550),
    # T6 - Right turn
    (520, 550),
    (480, 520),
    (450, 480),
    # Sweeping back straight (Lakeside Drive)
    (400, 380),
    (360, 310),
    (320, 240),
    (280, 180),
    # T11/12 (Waite) fast chicane Right-Left
    (240, 140),
    (210, 110),
    (180, 130),
    (160, 170),
    # T13 (Ascari) Right turn
    (130, 220),
    (150, 280),
    # T14 (Stewart) Right turn
    (200, 350),
    (250, 450),
    (300, 550),
    # T15 (Prost) Slow Left
    (340, 650),
    (320, 720),
    (280, 750),
    # T16 (Marina??) Right onto straight
    (250, 800),
    (300, 830),
    (350, 840),
]

# Write to a JSON file to visualize with a quick node or bash script
with open("track_pts.json", "w") as f:
    json.dump(pts, f)

print("Generated track_pts.json")
