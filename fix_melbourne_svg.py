import re

melbourne_bg = """
  <!-- Grass Base Gradient -->
  <radialGradient id="grassGlow" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#2d5a3f"/>
    <stop offset="70%" stop-color="#1f402c"/>
    <stop offset="100%" stop-color="#152b1d"/>
  </radialGradient>
  <rect x="0" y="0" width="500" height="380" fill="url(#grassGlow)"/>

  <!-- The Golf Course -->
  <g filter="url(#blurGolf)">
    <ellipse cx="225" cy="95" rx="100" ry="57" fill="#3a6642" transform="rotate(-11 225 95)"/>
    <ellipse cx="400" cy="76" rx="75" ry="38" fill="#3a6642" transform="rotate(17 400 76)"/>
  </g>

  <!-- Bunkers -->
  <ellipse cx="225" cy="95" rx="7.5" ry="3" fill="#bfa571" transform="rotate(17 225 95)"/>
  <ellipse cx="260" cy="106" rx="10" ry="3.8" fill="#bfa571" transform="rotate(17 260 106)"/>
  <ellipse cx="275" cy="133" rx="5" ry="3" fill="#bfa571" transform="rotate(17 275 133)"/>
  <ellipse cx="200" cy="125" rx="12.5" ry="4.5" fill="#bfa571" transform="rotate(17 200 125)"/>
  <ellipse cx="390" cy="68" rx="7.5" ry="3.8" fill="#bfa571" transform="rotate(17 390 68)"/>
  <ellipse cx="410" cy="95" rx="10" ry="3.4" fill="#bfa571" transform="rotate(17 410 95)"/>

  <!-- Albert Park Lake -->
  <radialGradient id="lakeGrad" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="#51819c"/>
    <stop offset="50%" stop-color="#355b73"/>
    <stop offset="100%" stop-color="#203947"/>
  </radialGradient>
  <path d="M 325 114 C 400 133, 460 152, 450 209 C 400 247, 200 266, 125 258 C 60 190, 75 133, 125 95 C 200 38, 250 95, 325 114 Z" fill="url(#lakeGrad)"/>

  <!-- The Island -->
  <ellipse cx="140" cy="144" rx="20" ry="7.6" fill="#224a2f" transform="rotate(23 140 144)"/>

  <!-- Lake Ripples -->
  <path d="M 125 133 C 250 125, 350 133, 425 121" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <path d="M 125 142 C 250 135, 350 142, 425 131" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <path d="M 125 152 C 250 144, 350 152, 425 140" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <path d="M 125 161 C 250 154, 350 161, 425 150" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <path d="M 125 171 C 250 163, 350 171, 425 159" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <path d="M 125 180 C 250 173, 350 180, 425 169" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <path d="M 125 190 C 250 182, 350 190, 425 178" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <path d="M 125 199 C 250 192, 350 199, 425 188" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <path d="M 125 209 C 250 201, 350 209, 425 197" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <path d="M 125 218 C 250 211, 350 218, 425 207" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
  <path d="M 125 228 C 250 220, 350 228, 425 216" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>

  <!-- Urban Areas & Paddock -->
  <rect x="200" y="304" width="150" height="11" fill="rgba(200,200,210,0.1)"/>
  <rect x="250" y="319" width="50" height="15" fill="rgba(200,200,210,0.1)"/>
  
  <!-- Outer roads -->
  <path d="M 25 38 L 50 342" fill="none" stroke="rgba(120,125,130,0.15)" stroke-width="5"/>
  <path d="M 475 38 L 425 342" fill="none" stroke="rgba(120,125,130,0.15)" stroke-width="5"/>

  <!-- Lauda Stadium -->
  <g transform="translate(65 171) rotate(-5.7)">
    <rect x="0" y="0" width="30" height="30" fill="rgba(160,160,160,0.15)"/>
    <rect x="5" y="5" width="20" height="20" fill="none" stroke="rgba(250,250,250,0.25)" stroke-width="1"/>
  </g>
"""

with open("frontend/app/img/tracks/melbourne.svg") as f:
    svg = f.read()

# Replace between defs and path
new_svg = re.sub(
    r'(</defs>).*?(<path d="M 250\.0,294\.5)',
    r'\1\n  <filter id="blurGolf">\n    <feGaussianBlur stdDeviation="12.5"/>\n  </filter>\n' + melbourne_bg + r'\n\n  \2',
    svg,
    flags=re.DOTALL
)

# Overwrite S/F line to be at S/F dynamically (bottom)
# S/F is roughly around x=200..300, y=294.5
kerbs = ""
for i in range(6):
    fill = "#fff" if i%2==0 else "#111"
    kerbs += f'<rect x="{200 + i*7.5}" y="304" width="2.5" height="11" fill="{fill}" opacity="0.7"/>\n  '

new_svg = re.sub(
    r'(<rect x="280" y="327" width="18" height="4" fill="#fff" opacity="0.85"/>.*?</svg>)',
    kerbs + r'</svg>',
    new_svg,
    flags=re.DOTALL
)

with open("frontend/app/img/tracks/melbourne.svg", "w") as f:
    f.write(new_svg)

