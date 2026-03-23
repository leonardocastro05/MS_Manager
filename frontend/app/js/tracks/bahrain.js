// ============================================================
// BAHRAIN CIRCUIT - Track Data
// Bahrain International Circuit, Sakhir
// ============================================================

export const BahrainTrack = {
    name: "Bahrain International Circuit",
    country: "Bahréin",
    city: "Sakhir",
    flag: "🇧🇭",
    lengthKm: 5.412,
    defaultLaps: 20,
    recordLap: "1:31.447",
    recordHolder: "P. de la Rosa",

    // Reference canvas size for coordinates
    refWidth: 1400,
    refHeight: 800,

    // Track width in canvas pixels
    trackWidth: 42,

    // ── Control Points (Catmull-Rom spline) ──
    points: [
        // START/FINISH STRAIGHT (heading left -> right)
        { x: 760, y: 230 },    // 0  - Start/Finish line
        { x: 860, y: 225 },    // 1
        { x: 960, y: 220 },    // 2
        { x: 1060, y: 215 },   // 3  - Approaching T1

        // TURN 1 (cleaner right-hander, better separated)
        { x: 1120, y: 220 },   // 4  - Braking zone
        { x: 1148, y: 244 },   // 5  - Turn-in
        { x: 1162, y: 280 },   // 6  - Apex T1
        { x: 1160, y: 324 },   // 7  - Exit T1

        // TURN 2-3 (chicane heading down-left)
        { x: 1140, y: 360 },   // 8
        { x: 1114, y: 404 },   // 9  - Apex T2
        { x: 1082, y: 444 },   // 10 - Apex T3

        // TURN 4 (medium left heading down)
        { x: 1040, y: 440 },   // 11 - Entry T4
        { x: 1000, y: 460 },   // 12 - Apex T4
        { x: 975, y: 490 },    // 13 - Exit T4

        // SHORT STRAIGHT + TURNS 5-6-7 (flowing section)
        { x: 940, y: 530 },    // 14
        { x: 890, y: 560 },    // 15 - Entry T5
        { x: 840, y: 580 },    // 16 - Apex T5
        { x: 785, y: 590 },    // 17 - T6 entry
        { x: 730, y: 580 },    // 18 - Apex T6-T7
        { x: 685, y: 555 },    // 19

        // STRAIGHT BETWEEN T7-T8
        { x: 650, y: 530 },    // 20
        { x: 620, y: 500 },    // 21

        // TURNS 8-9 (hairpin area)
        { x: 580, y: 488 },    // 22 - Entry T8
        { x: 540, y: 500 },    // 23 - Apex T8
        { x: 515, y: 530 },    // 24

        // TURNS 10-11 (double hairpin, the tightest section)
        { x: 505, y: 570 },    // 25
        { x: 480, y: 602 },    // 26 - Apex T10
        { x: 440, y: 610 },    // 27 - Transition
        { x: 400, y: 594 },    // 28 - Apex T11
        { x: 380, y: 564 },    // 29 - Exit T11

        // STRAIGHT HEADING UP (toward turn 12-13)
        { x: 370, y: 520 },    // 30
        { x: 360, y: 470 },    // 31
        { x: 355, y: 420 },    // 32
        { x: 356, y: 370 },    // 33

        // TURN 12 (fast left)
        { x: 362, y: 330 },    // 34 - Entry T12
        { x: 374, y: 296 },    // 35 - Apex T12

        // TURNS 13-14 (chicane)
        { x: 380, y: 260 },    // 36 - Entry T13
        { x: 370, y: 230 },    // 37 - Apex T13
        { x: 380, y: 200 },    // 38 - T14
        { x: 405, y: 185 },    // 39 - Exit T14

        // TURN 15 (fast right)
        { x: 445, y: 180 },    // 40 - Entry T15
        { x: 490, y: 186 },    // 41 - Apex T15
        { x: 530, y: 200 },    // 42 - Exit T15

        // LONG STRAIGHT BACK TO S/F (DRS zone)
        { x: 580, y: 210 },    // 43
        { x: 640, y: 215 },    // 44
        { x: 720, y: 218 },    // 45
        { x: 820, y: 220 },    // 46 - loops back to 0
    ],

    // ── Pit Lane Path ──
    pitLane: {
        entryFraction: 0.90,
        exitFraction: 0.04,
        points: [
            { x: 700, y: 240 },
            { x: 760, y: 260 },
            { x: 830, y: 270 },
            { x: 900, y: 272 },
            { x: 970, y: 270 },
            { x: 1030, y: 264 },
            { x: 1080, y: 254 },
            { x: 1100, y: 244 },
        ],
        stopFraction: 0.55,
        pitBoxY: 275,
    },

    // ── Sector Boundaries ──
    sectors: [
        { name: "Sector 1", start: 0.0, end: 0.30 },
        { name: "Sector 2", start: 0.30, end: 0.62 },
        { name: "Sector 3", start: 0.62, end: 1.0 },
    ],

    // ── DRS Zones ──
    drsZones: [
        {
            detection: 0.85,
            start: 0.90,
            end: 0.99,
            name: "DRS Zone 1 - Main Straight"
        },
        {
            detection: 0.06,
            start: 0.08,
            end: 0.14,
            name: "DRS Zone 2 - After T3"
        },
    ],

    // ── Speed Profile ──
    speedZones: [
        { start: 0.000, end: 0.080, speed: 0.96, name: "Start/Finish Straight" },
        { start: 0.080, end: 0.170, speed: 0.28, name: "Turn 1" },
        { start: 0.170, end: 0.240, speed: 0.35, name: "Turns 2-3" },
        { start: 0.240, end: 0.310, speed: 0.45, name: "Turn 4" },
        { start: 0.310, end: 0.400, speed: 0.62, name: "Turns 5-6-7" },
        { start: 0.400, end: 0.470, speed: 0.48, name: "Turns 8-9" },
        { start: 0.470, end: 0.560, speed: 0.22, name: "Turns 10-11 Hairpin" },
        { start: 0.560, end: 0.640, speed: 0.78, name: "Back Straight" },
        { start: 0.640, end: 0.700, speed: 0.65, name: "Turn 12" },
        { start: 0.700, end: 0.770, speed: 0.38, name: "Turns 13-14" },
        { start: 0.770, end: 0.840, speed: 0.58, name: "Turn 15" },
        { start: 0.840, end: 1.000, speed: 0.95, name: "DRS Straight" },
    ],

    // ── Overtaking Zones ──
    overtakingZones: [
        { start: 0.06, end: 0.12, chance: 0.7, name: "Braking T1" },
        { start: 0.22, end: 0.28, chance: 0.5, name: "Braking T4" },
        { start: 0.45, end: 0.52, chance: 0.6, name: "Hairpin T10-11" },
        { start: 0.62, end: 0.68, chance: 0.4, name: "Braking T12" },
        { start: 0.88, end: 0.96, chance: 0.6, name: "DRS Main Straight" },
    ],

    // ── Corner Data (for renderer kerbs/runoff) ──
    corners: [
        { entry: 0.08, apex: 0.12, exit: 0.16, direction: "right", runoff: 35, name: "Turn 1" },
        { entry: 0.17, apex: 0.20, exit: 0.23, direction: "left", runoff: 20, name: "Turns 2-3" },
        { entry: 0.24, apex: 0.27, exit: 0.30, direction: "left", runoff: 18, name: "Turn 4" },
        { entry: 0.32, apex: 0.36, exit: 0.40, direction: "right", runoff: 15, name: "Turns 5-6-7" },
        { entry: 0.42, apex: 0.46, exit: 0.49, direction: "left", runoff: 20, name: "Turns 8-9" },
        { entry: 0.49, apex: 0.53, exit: 0.56, direction: "right", runoff: 25, name: "Turns 10-11" },
        { entry: 0.64, apex: 0.67, exit: 0.70, direction: "left", runoff: 15, name: "Turn 12" },
        { entry: 0.71, apex: 0.74, exit: 0.77, direction: "right", runoff: 15, name: "Turns 13-14" },
        { entry: 0.78, apex: 0.82, exit: 0.85, direction: "right", runoff: 18, name: "Turn 15" },
    ],

    // ── Start/Finish line position ──
    startFinish: {
        fraction: 0.0,
    },

    // ── Environment Features (for rendering) ──
    environment: {
        forests: [],
        grandstands: [],
        parking: [],
    },
};
