import json, urllib.request
url = "https://raw.githubusercontent.com/bacinger/f1-circuits/master/circuits/au-1953.geojson"
data = json.loads(urllib.request.urlopen(url).read().decode("utf-8"))
coords = data["features"][0]["geometry"]["coordinates"]

# It"s around 130 points, let's downsample to 45
step = max(1, len(coords) // 45)
sampled = coords[::step][:45]  # roughly 45 pts

min_x = min(p[0] for p in sampled)
max_x = max(p[0] for p in sampled)
min_y = min(p[1] for p in sampled)
max_y = max(p[1] for p in sampled)

w = max_x - min_x
h = max_y - min_y

box_w = 460
box_h = 340
scale = min(box_w/w, box_h/h)

out = []
for p in sampled:
    x = (p[0] - min_x) * scale + 20
    # invert y for screen coordinates maybe? map Y increases upwards, screen Y increases downwards
    # If we want it to look exactly like the real world layout, North should be up
    y = (max_y - p[1]) * scale + 20 
    out.append((round(x, 1), round(y, 1)))

print("melbourne_pts =", out)
