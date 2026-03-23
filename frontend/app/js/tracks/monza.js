// ============================================================
// MONZA CIRCUIT - Track Data & Spline Mathematics
// Autodromo Nazionale Monza, Italia
// ============================================================

export const MonzaTrack = {
    name: "Autodromo Nazionale Monza",
    country: "Italia",
    city: "Monza",
    flag: "🇮🇹",
    lengthKm: 5.793,
    defaultLaps: 20,
    recordLap: "1:21.046",
    recordHolder: "R. Barrichello",

    // Reference canvas size for coordinates
    refWidth: 1400,
    refHeight: 800,

    // Track width in canvas pixels
    trackWidth: 42,

    // ── Control Points (Catmull-Rom spline) ──
    points: [
        // PIT STRAIGHT (Start/Finish → approaching T1)
        { x: 1180, y: 700 },   // 0  - Start/Finish line
        { x: 1080, y: 695 },   // 1
        { x: 960, y: 688 },    // 2
        { x: 840, y: 680 },    // 3
        { x: 720, y: 670 },    // 4
        { x: 610, y: 660 },    // 5
        { x: 540, y: 646 },    // 6  - Braking zone for T1

        // VARIANTE DEL RETTIFILO (First chicane - T1/T2)
        { x: 492, y: 632 },    // 7  - Turn-in right (later and wider)
        { x: 452, y: 607 },    // 8  - Apex right
        { x: 430, y: 575 },    // 9  - Transition
        { x: 414, y: 540 },    // 10 - Apex left
        { x: 392, y: 504 },    // 11 - Exit chicane

        // CURVA GRANDE
        { x: 368, y: 456 },    // 12 - Entry Curva Grande (cleaner chicane exit)
        { x: 338, y: 400 },    // 13
        { x: 296, y: 322 },    // 14 - Apex area
        { x: 268, y: 268 },    // 15
        { x: 252, y: 220 },    // 16 - Exit Curva Grande

        // VARIANTE DELLA ROGGIA (Second chicane - T4/T5)
        { x: 248, y: 178 },    // 17 - Approach
        { x: 256, y: 148 },    // 18 - Turn-in right
        { x: 280, y: 122 },    // 19 - Apex right
        { x: 316, y: 110 },    // 20 - Crossover
        { x: 356, y: 114 },    // 21 - Apex left
        { x: 390, y: 132 },    // 22 - Exit heading down-right

        // LESMO 1 (T6)
        { x: 414, y: 164 },    // 23 - Entry
        { x: 424, y: 210 },    // 24 - Apex Lesmo 1
        { x: 418, y: 260 },    // 25 - Exit

        // LESMO 2 (T7)
        { x: 410, y: 310 },    // 26 - Entry
        { x: 404, y: 362 },    // 27 - Apex Lesmo 2
        { x: 410, y: 410 },    // 28 - Exit

        // SERRAGLIO / SHORT STRAIGHT
        { x: 428, y: 450 },    // 29
        { x: 458, y: 488 },    // 30
        { x: 500, y: 520 },    // 31

        // VARIANTE ASCARI (T8/T9/T10)
        { x: 548, y: 542 },    // 32 - Entry
        { x: 596, y: 550 },    // 33 - Apex left
        { x: 636, y: 538 },    // 34 - Right kink
        { x: 676, y: 550 },    // 35 - Apex right
        { x: 720, y: 540 },    // 36 - Exit

        // STRAIGHT TOWARD PARABOLICA
        { x: 790, y: 555 },    // 37
        { x: 860, y: 575 },    // 38
        { x: 940, y: 598 },    // 39

        // CURVA PARABOLICA (T11)
        { x: 1000, y: 620 },   // 40 - Entry
        { x: 1060, y: 638 },   // 41
        { x: 1120, y: 658 },   // 42 - Mid
        { x: 1160, y: 678 },   // 43
        { x: 1180, y: 700 },   // 44 - Exit → loops to 0
    ],

    // ── Pit Lane Path ──
    pitLane: {
        entryFraction: 0.87,
        exitFraction: 0.04,
        points: [
            { x: 948, y: 650 },
            { x: 990, y: 680 },
            { x: 1030, y: 710 },
            { x: 1050, y: 740 },
            { x: 1020, y: 762 },
            { x: 960, y: 770 },
            { x: 880, y: 772 },
            { x: 800, y: 770 },
            { x: 720, y: 766 },
            { x: 640, y: 760 },
            { x: 580, y: 740 },
            { x: 540, y: 710 },
        ],
        stopFraction: 0.55,
        pitBoxY: 770,
    },

    // ── Sector Boundaries ──
    sectors: [
        { name: "Sector 1", start: 0.0, end: 0.35 },
        { name: "Sector 2", start: 0.35, end: 0.72 },
        { name: "Sector 3", start: 0.72, end: 1.0 },
    ],

    // ── DRS Zones ──
    drsZones: [
        {
            detection: 0.72,
            start: 0.78,
            end: 0.88,
            name: "DRS Zone 1"
        },
        {
            detection: 0.96,
            start: 0.0,
            end: 0.10,
            name: "DRS Zone 2"
        },
    ],

    // ── Speed Profile ──
    speedZones: [
        { start: 0.000, end: 0.115, speed: 1.00, name: "Pit Straight" },
        { start: 0.115, end: 0.215, speed: 0.27, name: "Variante Rettifilo" },
        { start: 0.215, end: 0.355, speed: 0.74, name: "Curva Grande" },
        { start: 0.340, end: 0.420, speed: 0.30, name: "Variante Roggia" },
        { start: 0.420, end: 0.500, speed: 0.52, name: "Lesmo 1" },
        { start: 0.500, end: 0.570, speed: 0.52, name: "Lesmo 2" },
        { start: 0.570, end: 0.660, speed: 0.80, name: "Serraglio Straight" },
        { start: 0.660, end: 0.750, speed: 0.38, name: "Variante Ascari" },
        { start: 0.750, end: 0.860, speed: 0.92, name: "Recta Parabolica" },
        { start: 0.860, end: 0.960, speed: 0.48, name: "Parabolica" },
        { start: 0.960, end: 1.000, speed: 0.88, name: "Exit Parabolica" },
    ],

    // ── Overtaking Zones ──
    overtakingZones: [
        { start: 0.07, end: 0.16, chance: 0.72, name: "Braking T1" },
        { start: 0.33, end: 0.40, chance: 0.5, name: "Braking Roggia" },
        { start: 0.65, end: 0.72, chance: 0.5, name: "Braking Ascari" },
        { start: 0.85, end: 0.92, chance: 0.4, name: "Braking Parabolica" },
    ],

    // ── Corner Names ──
    corners: [
        { fraction: 0.155, name: "Variante del Rettifilo", type: "chicane" },
        { fraction: 0.26, name: "Curva Grande", type: "fast" },
        { fraction: 0.38, name: "Variante della Roggia", type: "chicane" },
        { fraction: 0.46, name: "Lesmo 1", type: "medium" },
        { fraction: 0.54, name: "Lesmo 2", type: "medium" },
        { fraction: 0.70, name: "Variante Ascari", type: "chicane" },
        { fraction: 0.91, name: "Parabolica", type: "fast" },
    ],

    // ── Environment Features (for rendering) ──
    environment: {
        forests: [
            { x: 340, y: 360, radiusX: 120, radiusY: 140 },
            { x: 480, y: 400, radiusX: 60, radiusY: 80 },
            { x: 600, y: 650, radiusX: 70, radiusY: 40 },
            { x: 200, y: 500, radiusX: 80, radiusY: 100 },
            { x: 1200, y: 200, radiusX: 120, radiusY: 100 },
            { x: 1100, y: 350, radiusX: 90, radiusY: 80 },
            { x: 600, y: 160, radiusX: 80, radiusY: 50 },
        ],

        grandstands: [
            { x: 430, y: 710, w: 180, h: 18, angle: -0.08 },
            { x: 220, y: 360, w: 15, h: 160, angle: 0 },
            { x: 300, y: 100, w: 120, h: 15, angle: -0.2 },
            { x: 780, y: 575, w: 14, h: 80, angle: 0.15 },
            { x: 1100, y: 670, w: 100, h: 16, angle: 0.3 },
            { x: 860, y: 750, w: 200, h: 20, angle: -0.03 },
        ],

        pitBuildings: [
            { x: 750, y: 758, w: 260, h: 22, color: "#555" },
            { x: 680, y: 782, w: 180, h: 14, color: "#666" },
        ],

        pitGarages: {
            x: 610, y: 780,
            width: 20,
            height: 12,
            count: 10,
            gap: 3,
        },

        parking: [
            { x: 900, y: 200, w: 220, h: 140 },
        ],

        ovalBanking: {
            cx: 560, cy: 190,
            rx: 80, ry: 50,
        },

        grassColor: "#2d7a1e",
        grassColorDark: "#256815",
        sandColor: "#d4b86a",
        asphaltColor: "#555",
        asphaltEdge: "#444",
        kerbRed: "#cc0000",
        kerbWhite: "#ffffff",
    },
};


// ============================================================
// SPLINE MATHEMATICS
// ============================================================

function catmullRom(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
}

export function getSplinePoint(points, fraction) {
    const N = points.length;
    fraction = ((fraction % 1) + 1) % 1;
    const u = fraction * N;
    const i = Math.floor(u);
    const t = u - i;

    const p0 = points[((i - 1) + N) % N];
    const p1 = points[i % N];
    const p2 = points[(i + 1) % N];
    const p3 = points[(i + 2) % N];

    return {
        x: catmullRom(p0.x, p1.x, p2.x, p3.x, t),
        y: catmullRom(p0.y, p1.y, p2.y, p3.y, t),
    };
}

export function getSplineTangent(points, fraction) {
    const delta = 0.0005;
    const a = getSplinePoint(points, fraction - delta);
    const b = getSplinePoint(points, fraction + delta);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    return { x: dx / len, y: dy / len };
}

export function getSplineAngle(points, fraction) {
    const t = getSplineTangent(points, fraction);
    return Math.atan2(t.y, t.x);
}

export function getSplineNormal(points, fraction) {
    const t = getSplineTangent(points, fraction);
    return { x: -t.y, y: t.x };
}


// ============================================================
// ARC-LENGTH PARAMETERIZATION
// ============================================================

export function buildArcLengthTable(points, numSamples = 2000) {
    const table = [{ fraction: 0, arcLength: 0 }];
    let totalLength = 0;
    let prev = getSplinePoint(points, 0);

    for (let i = 1; i <= numSamples; i++) {
        const fraction = i / numSamples;
        const curr = getSplinePoint(points, fraction);
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
        table.push({ fraction, arcLength: totalLength });
        prev = curr;
    }

    for (const entry of table) {
        entry.arcLength /= totalLength;
    }

    return { table, totalLength };
}

export function arcLengthToFraction(table, s) {
    s = ((s % 1) + 1) % 1;
    let lo = 0;
    let hi = table.length - 1;

    while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (table[mid].arcLength < s) lo = mid;
        else hi = mid;
    }

    const range = table[hi].arcLength - table[lo].arcLength;
    if (range < 1e-10) return table[lo].fraction;

    const t = (s - table[lo].arcLength) / range;
    return table[lo].fraction + t * (table[hi].fraction - table[lo].fraction);
}

export function getSpeedFactor(fraction, speedZones) {
    fraction = ((fraction % 1) + 1) % 1;
    for (const zone of speedZones) {
        if (zone.start <= zone.end) {
            if (fraction >= zone.start && fraction < zone.end) return zone.speed;
        } else {
            if (fraction >= zone.start || fraction < zone.end) return zone.speed;
        }
    }
    return 0.7;
}

export function getSectionName(fraction, speedZones) {
    fraction = ((fraction % 1) + 1) % 1;
    for (const zone of speedZones) {
        if (fraction >= zone.start && fraction < zone.end) return zone.name;
    }
    return "";
}

export function isInDRSZone(fraction, drsZones) {
    fraction = ((fraction % 1) + 1) % 1;
    for (const zone of drsZones) {
        if (zone.start <= zone.end) {
            if (fraction >= zone.start && fraction < zone.end) return zone;
        } else {
            if (fraction >= zone.start || fraction < zone.end) return zone;
        }
    }
    return null;
}

export function isInOvertakingZone(fraction, zones) {
    fraction = ((fraction % 1) + 1) % 1;
    for (const zone of zones) {
        if (fraction >= zone.start && fraction < zone.end) return zone;
    }
    return null;
}

export function getCurrentSector(fraction, sectors) {
    fraction = ((fraction % 1) + 1) % 1;
    for (let i = 0; i < sectors.length; i++) {
        if (fraction >= sectors[i].start && fraction < sectors[i].end) return i + 1;
    }
    return 1;
}


// ============================================================
// PRE-COMPUTED TRACK GEOMETRY
// ============================================================

export function precomputeTrackGeometry(track, numSamples = 1000) {
    const { table } = buildArcLengthTable(track.points, numSamples);
    const centerLine = [];
    const leftEdge = [];
    const rightEdge = [];
    const angles = [];
    const normals = [];
    const halfWidth = track.trackWidth / 2;

    for (let i = 0; i <= numSamples; i++) {
        const s = i / numSamples;
        const fraction = arcLengthToFraction(table, s);
        const point = getSplinePoint(track.points, fraction);
        const normal = getSplineNormal(track.points, fraction);
        const angle = getSplineAngle(track.points, fraction);

        centerLine.push(point);
        normals.push(normal);
        leftEdge.push({
            x: point.x + normal.x * halfWidth,
            y: point.y + normal.y * halfWidth,
        });
        rightEdge.push({
            x: point.x - normal.x * halfWidth,
            y: point.y - normal.y * halfWidth,
        });
        angles.push(angle);
    }

    return { centerLine, points: centerLine, leftEdge, rightEdge, angles, normals, table };
}
