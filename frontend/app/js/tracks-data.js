/**
 * MS Manager - Track Data Configuration
 * Datos de circuitos para el sistema de carreras con IA
 */

const TRACKS_DATA = {
    monza: {
        id: 'monza',
        name: 'Autodromo Nazionale Monza',
        shortName: 'Monza',
        country: 'Italia',
        flag: '🇮🇹',
        length: 5.793, // km
        laps: 53,
        type: 'high-speed', // high-speed, technical, street, mixed
        difficulty: 3, // 1-5
        image: 'img/tracks/monza.svg',
        thumbnail: 'img/tracks/monza.png',
        
        // Características del circuito
        characteristics: {
            topSpeed: 350, // km/h máxima alcanzable
            avgSpeed: 260, // km/h velocidad media
            downforce: 'low', // low, medium, high
            braking: 'heavy', // light, medium, heavy
            overtaking: 'easy', // easy, medium, hard
            tyreWear: 'low',
            fuelConsumption: 'high'
        },
        
        // Zonas DRS
        drsZones: [
            { start: 9, end: 11, name: 'Recta principal' },
            { start: 23, end: 25, name: 'Parabolica' }
        ],
        
        // Sectores del circuito
        sectors: [
            { id: 1, name: 'Sector 1', startWaypoint: 0, endWaypoint: 8, type: 'chicane' },
            { id: 2, name: 'Sector 2', startWaypoint: 9, endWaypoint: 17, type: 'speed' },
            { id: 3, name: 'Sector 3', startWaypoint: 18, endWaypoint: 26, type: 'curve' }
        ],
        
        // Curvas nombradas
        corners: [
            { id: 1, name: 'Rettifilo Tribune', waypoint: 4, type: 'chicane', angle: 90, speed: 120 },
            { id: 2, name: 'Variante della Roggia', waypoint: 7, type: 'chicane', angle: 80, speed: 130 },
            { id: 3, name: 'Curva Grande', waypoint: 12, type: 'fast', angle: 60, speed: 220 },
            { id: 4, name: 'Variante Ascari', waypoint: 15, type: 'chicane', angle: 70, speed: 180 },
            { id: 5, name: 'Parabolica', waypoint: 19, type: 'fast', angle: 90, speed: 250 }
        ],
        
        // Waypoints para la IA - Coordenadas (x, y) y datos de conducción
        waypoints: [
            { id: 0, x: 100, y: 350, type: 'start', speed: 0, throttle: 1.0, brake: 0 },
            { id: 1, x: 100, y: 300, type: 'straight', speed: 280, throttle: 1.0, brake: 0 },
            { id: 2, x: 100, y: 250, type: 'straight', speed: 320, throttle: 1.0, brake: 0 },
            { id: 3, x: 100, y: 200, type: 'straight', speed: 340, throttle: 1.0, brake: 0 },
            { id: 4, x: 110, y: 160, type: 'brake', speed: 280, throttle: 0, brake: 0.8, corner: 'Rettifilo Tribune' },
            { id: 5, x: 130, y: 130, type: 'apex', speed: 120, throttle: 0.4, brake: 0.2 },
            { id: 6, x: 160, y: 90, type: 'exit', speed: 180, throttle: 0.8, brake: 0 },
            { id: 7, x: 200, y: 50, type: 'brake', speed: 160, throttle: 0, brake: 0.7, corner: 'Variante della Roggia' },
            { id: 8, x: 240, y: 30, type: 'apex', speed: 130, throttle: 0.5, brake: 0.1 },
            { id: 9, x: 270, y: 25, type: 'drs-start', speed: 200, throttle: 1.0, brake: 0, drs: true },
            { id: 10, x: 340, y: 25, type: 'straight', speed: 340, throttle: 1.0, brake: 0, drs: true },
            { id: 11, x: 400, y: 25, type: 'drs-end', speed: 350, throttle: 1.0, brake: 0 },
            { id: 12, x: 440, y: 35, type: 'brake', speed: 300, throttle: 0, brake: 0.6, corner: 'Curva Grande' },
            { id: 13, x: 470, y: 70, type: 'apex', speed: 220, throttle: 0.7, brake: 0 },
            { id: 14, x: 475, y: 110, type: 'exit', speed: 260, throttle: 0.9, brake: 0 },
            { id: 15, x: 455, y: 150, type: 'brake', speed: 220, throttle: 0, brake: 0.5, corner: 'Variante Ascari' },
            { id: 16, x: 425, y: 180, type: 'apex', speed: 180, throttle: 0.6, brake: 0.1 },
            { id: 17, x: 410, y: 210, type: 'exit', speed: 200, throttle: 0.8, brake: 0 },
            { id: 18, x: 410, y: 250, type: 'straight', speed: 280, throttle: 1.0, brake: 0 },
            { id: 19, x: 410, y: 290, type: 'brake', speed: 260, throttle: 0.2, brake: 0.4, corner: 'Parabolica' },
            { id: 20, x: 390, y: 320, type: 'apex', speed: 250, throttle: 0.8, brake: 0 },
            { id: 21, x: 340, y: 330, type: 'exit', speed: 280, throttle: 1.0, brake: 0 },
            { id: 22, x: 270, y: 330, type: 'straight', speed: 310, throttle: 1.0, brake: 0 },
            { id: 23, x: 200, y: 330, type: 'drs-start', speed: 330, throttle: 1.0, brake: 0, drs: true },
            { id: 24, x: 150, y: 340, type: 'straight', speed: 340, throttle: 1.0, brake: 0, drs: true },
            { id: 25, x: 120, y: 350, type: 'drs-end', speed: 345, throttle: 1.0, brake: 0 },
            { id: 26, x: 100, y: 350, type: 'finish', speed: 350, throttle: 1.0, brake: 0 }
        ],
        
        // Path SVG para el racing line
        racingLinePath: `M 100,350 
           L 100,200 
           Q 100,160 120,130 
           L 200,50 
           Q 230,25 270,25 
           L 420,25 
           Q 460,25 475,60 
           Q 490,95 475,130 
           L 430,175 
           Q 410,195 410,220 
           L 410,280 
           Q 410,310 385,330 
           L 200,330 
           Q 150,330 120,350 
           Q 100,365 100,350`,
        
        // Tiempos de referencia (en segundos)
        referenceTimes: {
            pole: 78.792,
            fastestLap: 78.792,
            average: 80.2
        },
        
        // Pit stop
        pitLane: {
            entry: { x: 105, y: 355 },
            exit: { x: 180, y: 370 },
            timeLoss: 22 // segundos perdidos en pit
        }
    },
    
    // Circuito fantasy derivado de Bahrain (más circular)
    leoverse: {
        id: 'leoverse',
        name: 'Leoverse Circuit',
        shortName: 'Leoverse',
        country: 'Leoverse',
        flag: '🪐',
        length: 5.198,
        laps: 57,
        type: 'technical',
        difficulty: 4,
        image: 'img/tracks/bahrain.svg',
        thumbnail: 'img/tracks/bahrain.png',
        characteristics: {
            topSpeed: 320,
            avgSpeed: 205,
            downforce: 'medium',
            braking: 'heavy',
            overtaking: 'medium',
            tyreWear: 'high',
            fuelConsumption: 'medium'
        },

        drsZones: [
            { start: 27, end: 29, name: 'Recta principal' },
            { start: 1,  end: 2,  name: 'Recta DRS S/F' }
        ],

        sectors: [
            { id: 1, name: 'Sector 1', startWaypoint: 0,  endWaypoint: 7,  type: 'technical' },
            { id: 2, name: 'Sector 2', startWaypoint: 8,  endWaypoint: 18, type: 'mixed' },
            { id: 3, name: 'Sector 3', startWaypoint: 19, endWaypoint: 29, type: 'speed' }
        ],

        corners: [
            { id: 1,  name: 'Turn 1',          waypoint: 3,  type: 'hairpin', angle: 130, speed: 100 },
            { id: 2,  name: 'Turn 2-3',        waypoint: 6,  type: 'chicane', angle: 70,  speed: 130 },
            { id: 3,  name: 'Turn 4',          waypoint: 8,  type: 'medium',  angle: 90,  speed: 155 },
            { id: 4,  name: 'Turn 6-7',        waypoint: 11, type: 'fast',    angle: 60,  speed: 200 },
            { id: 5,  name: 'T10-T11 Hairpin', waypoint: 17, type: 'hairpin', angle: 190, speed: 65  },
            { id: 6,  name: 'Turn 12',         waypoint: 21, type: 'fast',    angle: 50,  speed: 255 },
            { id: 7,  name: 'Turn 13-14',      waypoint: 23, type: 'chicane', angle: 80,  speed: 170 },
            { id: 8,  name: 'Turn 15',         waypoint: 25, type: 'fast',    angle: 55,  speed: 220 }
        ],

        // Waypoints para la IA — coordenadas en espacio 500×380
        waypoints: [
            { id: 0,  x: 350, y: 90,  type: 'start',     speed: 0,   throttle: 1.0, brake: 0   },
            { id: 1,  x: 385, y: 88,  type: 'drs-start', speed: 280, throttle: 1.0, brake: 0,   drs: true },
            { id: 2,  x: 425, y: 86,  type: 'straight',  speed: 315, throttle: 1.0, brake: 0,   drs: true },
            { id: 3,  x: 452, y: 94,  type: 'brake',     speed: 260, throttle: 0,   brake: 0.9, corner: 'Turn 1' },
            { id: 4,  x: 460, y: 120, type: 'apex',      speed: 100, throttle: 0.3, brake: 0.4  },
            { id: 5,  x: 452, y: 150, type: 'exit',      speed: 160, throttle: 0.8, brake: 0   },
            { id: 6,  x: 436, y: 172, type: 'apex',      speed: 130, throttle: 0.5, brake: 0.2, corner: 'Turn 2-3' },
            { id: 7,  x: 420, y: 190, type: 'exit',      speed: 178, throttle: 0.85, brake: 0  },
            { id: 8,  x: 396, y: 177, type: 'brake',     speed: 190, throttle: 0.1, brake: 0.6, corner: 'Turn 4' },
            { id: 9,  x: 376, y: 190, type: 'apex',      speed: 155, throttle: 0.6, brake: 0   },
            { id: 10, x: 358, y: 207, type: 'exit',      speed: 188, throttle: 0.9, brake: 0   },
            { id: 11, x: 338, y: 230, type: 'apex',      speed: 200, throttle: 0.8, brake: 0.1, corner: 'Turn 6-7' },
            { id: 12, x: 318, y: 250, type: 'exit',      speed: 222, throttle: 1.0, brake: 0   },
            { id: 13, x: 296, y: 264, type: 'apex',      speed: 242, throttle: 1.0, brake: 0   },
            { id: 14, x: 270, y: 276, type: 'straight',  speed: 280, throttle: 1.0, brake: 0   },
            { id: 15, x: 246, y: 285, type: 'brake',     speed: 240, throttle: 0,   brake: 0.8, corner: 'T10-T11 Hairpin' },
            { id: 16, x: 222, y: 292, type: 'apex',      speed: 80,  throttle: 0.2, brake: 0.5 },
            { id: 17, x: 198, y: 293, type: 'apex',      speed: 65,  throttle: 0.3, brake: 0.3 },
            { id: 18, x: 183, y: 282, type: 'exit',      speed: 92,  throttle: 0.75, brake: 0  },
            { id: 19, x: 172, y: 262, type: 'straight',  speed: 152, throttle: 1.0, brake: 0   },
            { id: 20, x: 160, y: 240, type: 'straight',  speed: 213, throttle: 1.0, brake: 0   },
            { id: 21, x: 155, y: 218, type: 'apex',      speed: 257, throttle: 0.9, brake: 0.1, corner: 'Turn 12' },
            { id: 22, x: 150, y: 196, type: 'brake',     speed: 202, throttle: 0,   brake: 0.5, corner: 'Turn 13-14' },
            { id: 23, x: 146, y: 178, type: 'apex',      speed: 170, throttle: 0.5, brake: 0.1 },
            { id: 24, x: 156, y: 163, type: 'exit',      speed: 196, throttle: 0.9, brake: 0   },
            { id: 25, x: 184, y: 150, type: 'apex',      speed: 222, throttle: 0.9, brake: 0.05, corner: 'Turn 15' },
            { id: 26, x: 230, y: 137, type: 'straight',  speed: 267, throttle: 1.0, brake: 0   },
            { id: 27, x: 282, y: 115, type: 'drs-start', speed: 300, throttle: 1.0, brake: 0,   drs: true },
            { id: 28, x: 322, y: 100, type: 'straight',  speed: 312, throttle: 1.0, brake: 0,   drs: true },
            { id: 29, x: 350, y: 90,  type: 'finish',    speed: 318, throttle: 1.0, brake: 0   }
        ],

        // Racing line SVG path (viewBox 500×380)
        racingLinePath: `M 350,90
           L 385,88 L 425,86
           Q 458,90 460,120
           Q 455,150 436,172
           Q 420,190 396,177
           Q 376,190 358,207
           Q 338,230 318,250
           Q 296,264 270,276
           L 246,285
           Q 222,293 198,293
           Q 183,282 172,262
           L 160,240
           Q 155,218 150,196
           Q 146,178 156,163
           Q 184,150 230,137
           L 282,115 L 322,100 L 350,90`,

        referenceTimes: {
            pole: 89.474,
            fastestLap: 90.432,
            average: 92.0
        },

        pitLane: {
            entry: { x: 355, y: 83 },
            exit:  { x: 290, y: 88 },
            timeLoss: 21
        }
    },

    bahrain: {
        id: 'bahrain',
        name: 'Bahrain International Circuit (Real Layout)',
        shortName: 'Bahrain',
        country: 'Bahréin',
        flag: '🇧🇭',
        length: 5.412,
        laps: 57,
        type: 'mixed',
        difficulty: 4,
        image: 'img/tracks/bahrain.svg',
        thumbnail: 'img/tracks/bahrain.png',
        characteristics: {
            topSpeed: 325,
            avgSpeed: 205,
            downforce: 'medium',
            braking: 'heavy',
            overtaking: 'medium',
            tyreWear: 'high',
            fuelConsumption: 'medium'
        },

        drsZones: [
            { start: 1, end: 6, name: 'Recta principal' },
            { start: 24, end: 26, name: 'Recta trasera' }
        ],

        sectors: [
            { id: 1, name: 'Sector 1', startWaypoint: 0,  endWaypoint: 14, type: 'braking' },
            { id: 2, name: 'Sector 2', startWaypoint: 15, endWaypoint: 27, type: 'mixed' },
            { id: 3, name: 'Sector 3', startWaypoint: 29, endWaypoint: 43, type: 'traction' }
        ],

        corners: [
            { id: 1, name: 'Turn 1', waypoint: 8, type: 'hairpin', angle: 116, speed: 106 },
            { id: 2, name: 'Turn 4', waypoint: 12, type: 'medium', angle: 96, speed: 156 },
            { id: 3, name: 'Turn 8', waypoint: 16, type: 'medium', angle: 90, speed: 144 },
            { id: 4, name: 'Turn 10', waypoint: 22, type: 'hairpin', angle: 168, speed: 84 },
            { id: 5, name: 'Turn 11-12', waypoint: 27, type: 'fast', angle: 62, speed: 210 },
            { id: 6, name: 'Turn 13', waypoint: 32, type: 'medium', angle: 88, speed: 160 },
            { id: 7, name: 'Turn 14', waypoint: 36, type: 'medium', angle: 86, speed: 148 }
        ],

        waypoints: [
            { id: 0,  x: 120, y: 438, type: 'start',     speed: 0,   throttle: 1.0, brake: 0 },
            { id: 1,  x: 180, y: 437, type: 'drs-start', speed: 276, throttle: 1.0, brake: 0, drs: true },
            { id: 2,  x: 250, y: 436, type: 'straight',  speed: 304, throttle: 1.0, brake: 0, drs: true },
            { id: 3,  x: 330, y: 435, type: 'straight',  speed: 318, throttle: 1.0, brake: 0, drs: true },
            { id: 4,  x: 400, y: 434, type: 'straight',  speed: 322, throttle: 1.0, brake: 0 },
            { id: 5,  x: 470, y: 432, type: 'straight',  speed: 312, throttle: 1.0, brake: 0 },
            { id: 6,  x: 530, y: 428, type: 'drs-end',   speed: 318, throttle: 1.0, brake: 0 },
            { id: 7,  x: 552, y: 420, type: 'brake',     speed: 252, throttle: 0,   brake: 0.70, corner: 'Turn 1' },
            { id: 8,  x: 548, y: 398, type: 'apex',      speed: 106, throttle: 0.32, brake: 0.30 },
            { id: 9,  x: 530, y: 366, type: 'exit',      speed: 166, throttle: 0.90, brake: 0 },
            { id: 10, x: 506, y: 326, type: 'straight',  speed: 202, throttle: 1.0, brake: 0 },
            { id: 11, x: 474, y: 284, type: 'straight',  speed: 224, throttle: 1.0, brake: 0 },
            { id: 12, x: 446, y: 242, type: 'brake',     speed: 196, throttle: 0.08, brake: 0.54, corner: 'Turn 4' },
            { id: 13, x: 420, y: 208, type: 'apex',      speed: 156, throttle: 0.58, brake: 0.12 },
            { id: 14, x: 392, y: 176, type: 'exit',      speed: 184, throttle: 0.90, brake: 0 },
            { id: 15, x: 370, y: 206, type: 'apex',      speed: 144, throttle: 0.56, brake: 0.10 },
            { id: 16, x: 388, y: 248, type: 'exit',      speed: 178, throttle: 0.86, brake: 0, corner: 'Turn 8' },
            { id: 17, x: 424, y: 284, type: 'apex',      speed: 138, throttle: 0.52, brake: 0.18 },
            { id: 18, x: 452, y: 320, type: 'exit',      speed: 172, throttle: 0.85, brake: 0 },
            { id: 19, x: 464, y: 352, type: 'straight',  speed: 194, throttle: 1.0, brake: 0 },
            { id: 20, x: 468, y: 382, type: 'straight',  speed: 212, throttle: 1.0, brake: 0 },
            { id: 21, x: 452, y: 404, type: 'exit',      speed: 188, throttle: 0.84, brake: 0 },
            { id: 22, x: 396, y: 406, type: 'brake',     speed: 178, throttle: 0,   brake: 0.55, corner: 'Turn 10' },
            { id: 23, x: 338, y: 406, type: 'apex',      speed: 84,  throttle: 0.24, brake: 0.46 },
            { id: 24, x: 280, y: 406, type: 'drs-start', speed: 160, throttle: 1.0, brake: 0, drs: true },
            { id: 25, x: 224, y: 406, type: 'straight',  speed: 208, throttle: 1.0, brake: 0, drs: true },
            { id: 26, x: 176, y: 404, type: 'drs-end',   speed: 232, throttle: 1.0, brake: 0 },
            { id: 27, x: 150, y: 394, type: 'apex',      speed: 210, throttle: 0.90, brake: 0.06, corner: 'Turn 11-12' },
            { id: 28, x: 164, y: 368, type: 'exit',      speed: 182, throttle: 0.80, brake: 0 },
            { id: 29, x: 212, y: 360, type: 'straight',  speed: 188, throttle: 0.95, brake: 0 },
            { id: 30, x: 258, y: 362, type: 'straight',  speed: 202, throttle: 1.0, brake: 0 },
            { id: 31, x: 300, y: 364, type: 'straight',  speed: 196, throttle: 0.98, brake: 0 },
            { id: 32, x: 316, y: 350, type: 'brake',     speed: 182, throttle: 0,   brake: 0.48, corner: 'Turn 13' },
            { id: 33, x: 288, y: 320, type: 'apex',      speed: 160, throttle: 0.56, brake: 0.12 },
            { id: 34, x: 252, y: 286, type: 'exit',      speed: 184, throttle: 0.86, brake: 0 },
            { id: 35, x: 236, y: 242, type: 'straight',  speed: 196, throttle: 0.96, brake: 0 },
            { id: 36, x: 228, y: 196, type: 'brake',     speed: 186, throttle: 0,   brake: 0.52, corner: 'Turn 14' },
            { id: 37, x: 220, y: 146, type: 'apex',      speed: 148, throttle: 0.52, brake: 0.14 },
            { id: 38, x: 206, y: 96,  type: 'exit',      speed: 168, throttle: 0.82, brake: 0 },
            { id: 39, x: 190, y: 130, type: 'apex',      speed: 140, throttle: 0.50, brake: 0.18 },
            { id: 40, x: 180, y: 206, type: 'exit',      speed: 162, throttle: 0.84, brake: 0 },
            { id: 41, x: 168, y: 300, type: 'straight',  speed: 206, throttle: 1.0,  brake: 0 },
            { id: 42, x: 156, y: 396, type: 'straight',  speed: 236, throttle: 1.0,  brake: 0 },
            { id: 43, x: 120, y: 438, type: 'finish',    speed: 296, throttle: 1.0,  brake: 0 }
        ],

        racingLinePath: `M 120,438
           L 180,437 L 250,436 L 330,435 L 400,434 L 470,432 L 530,428
           Q 548,424 552,420
           Q 552,406 548,398
           Q 542,382 530,366
           Q 514,340 506,326
           Q 486,300 474,284
           Q 458,260 446,242
           Q 430,220 420,208
           Q 406,190 392,176
           Q 378,190 370,206
           Q 374,230 388,248
           Q 410,270 424,284
           Q 444,302 452,320
           Q 464,342 464,352
           Q 468,374 468,382
           Q 464,398 452,404
           Q 424,406 396,406
           Q 366,406 338,406
           Q 310,406 280,406
           Q 248,406 224,406
           Q 192,406 176,404
           Q 156,400 150,394
           Q 154,378 164,368
           Q 190,362 212,360
           Q 240,362 258,362
           Q 282,364 300,364
           Q 312,360 316,350
           Q 304,334 288,320
           Q 272,302 252,286
           Q 246,258 236,242
           Q 230,218 228,196
           Q 224,170 220,146
           Q 214,116 206,96
           Q 192,108 190,130
           Q 182,170 180,206
           Q 172,258 168,300
           Q 162,350 156,396
           Q 100,400 120,438`,

        referenceTimes: {
            pole: 89.474,
            fastestLap: 90.432,
            average: 91.8
        },

        pitLane: {
            entry: { x: 430, y: 438 },
            exit: { x: 268, y: 436 },
            timeLoss: 22
        }
    },

    melbourne: {
        id: 'melbourne',
        name: 'Albert Park Circuit',
        shortName: 'Melbourne',
        country: 'Australia',
        flag: '🇦🇺',
        length: 4.90,
        laps: 58,
        type: 'street',
        difficulty: 4,
        image: 'img/tracks/melbourne.svg',
        thumbnail: 'img/tracks/melbourne.png',
        characteristics: {
            topSpeed: 318,
            avgSpeed: 198,
            downforce: 'medium',
            braking: 'heavy',
            overtaking: 'medium',
            tyreWear: 'medium',
            fuelConsumption: 'medium'
        },
        drsZones: [
            { start: 0, end: 3, name: 'Recta de meta' },
            { start: 10, end: 12, name: 'Recta opuesta' }
        ],
        sectors: [
            { id: 1, name: 'Sector 1', startWaypoint: 0, endWaypoint: 5, type: 'speed' },
            { id: 2, name: 'Sector 2', startWaypoint: 6, endWaypoint: 11, type: 'mixed' },
            { id: 3, name: 'Sector 3', startWaypoint: 12, endWaypoint: 16, type: 'technical' }
        ],
        corners: [
            { id: 1, name: 'Jones', waypoint: 3, type: 'hairpin', angle: 130, speed: 92 },
            { id: 2, name: 'Brabham', waypoint: 7, type: 'fast', angle: 55, speed: 220 },
            { id: 3, name: 'Lauda', waypoint: 10, type: 'medium', angle: 85, speed: 165 },
            { id: 4, name: 'Ascari', waypoint: 13, type: 'chicane', angle: 95, speed: 138 }
        ],
        waypoints: [
            { id: 0, x: 310, y: 340, type: 'start', speed: 0, throttle: 1.0, brake: 0 },
            { id: 1, x: 420, y: 336, type: 'drs-start', speed: 295, throttle: 1.0, brake: 0, drs: true },
            { id: 2, x: 476, y: 330, type: 'straight', speed: 315, throttle: 1.0, brake: 0, drs: true },
            { id: 3, x: 478, y: 286, type: 'brake', speed: 232, throttle: 0.0, brake: 0.80, corner: 'Jones' },
            { id: 4, x: 445, y: 245, type: 'apex', speed: 125, throttle: 0.45, brake: 0.25 },
            { id: 5, x: 360, y: 214, type: 'exit', speed: 172, throttle: 0.86, brake: 0 },
            { id: 6, x: 268, y: 192, type: 'straight', speed: 218, throttle: 1.0, brake: 0 },
            { id: 7, x: 154, y: 162, type: 'apex', speed: 220, throttle: 0.90, brake: 0.05, corner: 'Brabham' },
            { id: 8, x: 92, y: 174, type: 'exit', speed: 170, throttle: 0.75, brake: 0.1 },
            { id: 9, x: 84, y: 90, type: 'straight', speed: 205, throttle: 1.0, brake: 0 },
            { id: 10, x: 156, y: 68, type: 'apex', speed: 165, throttle: 0.58, brake: 0.2, corner: 'Lauda' },
            { id: 11, x: 250, y: 82, type: 'straight', speed: 210, throttle: 1.0, brake: 0, drs: true },
            { id: 12, x: 376, y: 90, type: 'drs-end', speed: 300, throttle: 1.0, brake: 0 },
            { id: 13, x: 468, y: 130, type: 'brake', speed: 205, throttle: 0.1, brake: 0.55, corner: 'Ascari' },
            { id: 14, x: 462, y: 214, type: 'apex', speed: 138, throttle: 0.55, brake: 0.2 },
            { id: 15, x: 350, y: 206, type: 'exit', speed: 190, throttle: 0.92, brake: 0 },
            { id: 16, x: 310, y: 340, type: 'finish', speed: 290, throttle: 1.0, brake: 0 }
        ],
        racingLinePath: `M 310,340 L 420,336 L 476,330 Q 480,300 445,245 Q 360,214 268,192
          Q 154,162 92,174 Q 84,90 156,68 Q 250,82 376,90 Q 468,130 462,214 Q 350,206 310,340`,
        referenceTimes: { pole: 83.821, fastestLap: 84.993, average: 86.2 },
        pitLane: {
            entry: { x: 334, y: 344 },
            exit: { x: 410, y: 338 },
            timeLoss: 21
        }
    },

    shanghai: {
        id: 'shanghai',
        name: 'Shanghai International Circuit',
        shortName: 'Shanghai',
        country: 'China',
        flag: '🇨🇳',
        length: 5.36,
        laps: 53,
        type: 'technical',
        difficulty: 5,
        image: 'img/tracks/shanghai.svg',
        thumbnail: 'img/tracks/shanghai.png',
        characteristics: {
            topSpeed: 305,
            avgSpeed: 182,
            downforce: 'high',
            braking: 'heavy',
            overtaking: 'hard',
            tyreWear: 'high',
            fuelConsumption: 'medium'
        },
        drsZones: [
            { start: 0, end: 2, name: 'Recta principal' }
        ],
        sectors: [
            { id: 1, name: 'Sector 1', startWaypoint: 0, endWaypoint: 5, type: 'mixed' },
            { id: 2, name: 'Sector 2', startWaypoint: 6, endWaypoint: 10, type: 'technical' },
            { id: 3, name: 'Sector 3', startWaypoint: 11, endWaypoint: 15, type: 'traction' }
        ],
        corners: [
            { id: 1, name: 'S1 Hairpin', waypoint: 4, type: 'hairpin', angle: 170, speed: 78 },
            { id: 2, name: 'Snake Esses', waypoint: 8, type: 'chicane', angle: 100, speed: 140 },
            { id: 3, name: 'Last Hook', waypoint: 13, type: 'hairpin', angle: 165, speed: 82 }
        ],
        waypoints: [
            { id: 0, x: 252, y: 342, type: 'start', speed: 0, throttle: 1.0, brake: 0 },
            { id: 1, x: 378, y: 338, type: 'drs-start', speed: 290, throttle: 1.0, brake: 0, drs: true },
            { id: 2, x: 468, y: 328, type: 'drs-end', speed: 305, throttle: 1.0, brake: 0 },
            { id: 3, x: 468, y: 274, type: 'brake', speed: 212, throttle: 0, brake: 0.82 },
            { id: 4, x: 426, y: 238, type: 'apex', speed: 78, throttle: 0.24, brake: 0.35, corner: 'S1 Hairpin' },
            { id: 5, x: 360, y: 220, type: 'exit', speed: 142, throttle: 0.75, brake: 0 },
            { id: 6, x: 384, y: 166, type: 'apex', speed: 132, throttle: 0.50, brake: 0.20, corner: 'Snake Esses' },
            { id: 7, x: 456, y: 154, type: 'exit', speed: 172, throttle: 0.82, brake: 0 },
            { id: 8, x: 470, y: 98, type: 'apex', speed: 102, throttle: 0.40, brake: 0.28 },
            { id: 9, x: 364, y: 66, type: 'straight', speed: 188, throttle: 0.95, brake: 0 },
            { id: 10, x: 288, y: 102, type: 'straight', speed: 205, throttle: 1.0, brake: 0 },
            { id: 11, x: 268, y: 176, type: 'apex', speed: 118, throttle: 0.42, brake: 0.3 },
            { id: 12, x: 248, y: 242, type: 'exit', speed: 155, throttle: 0.86, brake: 0 },
            { id: 13, x: 170, y: 304, type: 'apex', speed: 82, throttle: 0.30, brake: 0.34, corner: 'Last Hook' },
            { id: 14, x: 190, y: 338, type: 'exit', speed: 145, throttle: 0.84, brake: 0 },
            { id: 15, x: 252, y: 342, type: 'finish', speed: 260, throttle: 1.0, brake: 0 }
        ],
        racingLinePath: `M 252,342 L 378,338 L 468,328 Q 468,274 426,238 Q 360,220 384,166 Q 456,154 470,98
          Q 364,66 288,102 Q 268,176 248,242 Q 170,304 190,338 L 252,342`,
        referenceTimes: { pole: 91.234, fastestLap: 92.480, average: 94.1 },
        pitLane: {
            entry: { x: 268, y: 350 },
            exit: { x: 338, y: 340 },
            timeLoss: 24
        }
    },

    portimao: {
        id: 'portimao',
        name: 'Autódromo Internacional do Algarve',
        shortName: 'Portimão',
        country: 'Portugal',
        flag: '🇵🇹',
        length: 4.653,
        laps: 66,
        type: 'technical',
        difficulty: 4,
        image: 'img/tracks/portimao.svg',
        thumbnail: 'img/tracks/portimao.png',
        characteristics: {
            topSpeed: 310,
            avgSpeed: 190,
            downforce: 'high',
            braking: 'medium',
            overtaking: 'hard',
            tyreWear: 'medium',
            fuelConsumption: 'medium'
        },

        drsZones: [
            { start: 0, end: 2, name: 'Recta principal' }
        ],

        sectors: [
            { id: 1, name: 'Sector 1', startWaypoint: 0,  endWaypoint: 8,  type: 'technical' },
            { id: 2, name: 'Sector 2', startWaypoint: 9,  endWaypoint: 18, type: 'mixed'     },
            { id: 3, name: 'Sector 3', startWaypoint: 19, endWaypoint: 26, type: 'speed'     }
        ],

        corners: [
            { id: 1,  name: 'Turn 1',          waypoint: 3,  type: 'hairpin', angle: 165, speed: 90  },
            { id: 2,  name: 'Turn 2',          waypoint: 5,  type: 'medium',  angle: 80,  speed: 155 },
            { id: 3,  name: 'Turn 3',          waypoint: 7,  type: 'fast',    angle: 50,  speed: 195 },
            { id: 4,  name: 'Turn 4',          waypoint: 9,  type: 'medium',  angle: 70,  speed: 160 },
            { id: 5,  name: 'Turn 5 Hairpin',  waypoint: 12, type: 'hairpin', angle: 180, speed: 75  },
            { id: 6,  name: 'Turn 6',          waypoint: 15, type: 'fast',    angle: 55,  speed: 200 },
            { id: 7,  name: 'Turn 7',          waypoint: 16, type: 'fast',    angle: 60,  speed: 185 },
            { id: 8,  name: 'Turn 8-9',        waypoint: 19, type: 'chicane', angle: 90,  speed: 130 },
            { id: 9,  name: 'Turn 10-11',      waypoint: 21, type: 'medium',  angle: 100, speed: 110 },
            { id: 10, name: 'Turn 12',         waypoint: 24, type: 'fast',    angle: 60,  speed: 190 }
        ],

        // Waypoints para la IA — coordenadas en espacio 500×380
        waypoints: [
            { id: 0,  x: 290, y: 342, type: 'start',     speed: 0,   throttle: 1.0, brake: 0   },
            { id: 1,  x: 340, y: 337, type: 'drs-start', speed: 270, throttle: 1.0, brake: 0,   drs: true },
            { id: 2,  x: 390, y: 328, type: 'straight',  speed: 305, throttle: 1.0, brake: 0,   drs: true },
            { id: 3,  x: 418, y: 308, type: 'brake',     speed: 220, throttle: 0,   brake: 0.9, corner: 'Turn 1' },
            { id: 4,  x: 425, y: 285, type: 'apex',      speed: 90,  throttle: 0.2, brake: 0.5 },
            { id: 5,  x: 408, y: 260, type: 'apex',      speed: 155, throttle: 0.6, brake: 0.1, corner: 'Turn 2' },
            { id: 6,  x: 395, y: 238, type: 'exit',      speed: 182, throttle: 0.9, brake: 0   },
            { id: 7,  x: 420, y: 215, type: 'apex',      speed: 195, throttle: 0.8, brake: 0.05, corner: 'Turn 3' },
            { id: 8,  x: 405, y: 192, type: 'exit',      speed: 210, throttle: 1.0, brake: 0   },
            { id: 9,  x: 375, y: 173, type: 'apex',      speed: 160, throttle: 0.5, brake: 0.3, corner: 'Turn 4' },
            { id: 10, x: 345, y: 158, type: 'exit',      speed: 188, throttle: 0.9, brake: 0   },
            { id: 11, x: 308, y: 140, type: 'brake',     speed: 155, throttle: 0,   brake: 0.8, corner: 'Turn 5 Hairpin' },
            { id: 12, x: 270, y: 128, type: 'apex',      speed: 75,  throttle: 0.2, brake: 0.4 },
            { id: 13, x: 235, y: 134, type: 'apex',      speed: 80,  throttle: 0.3, brake: 0.2 },
            { id: 14, x: 206, y: 150, type: 'exit',      speed: 145, throttle: 0.8, brake: 0   },
            { id: 15, x: 178, y: 170, type: 'apex',      speed: 200, throttle: 0.85, brake: 0,  corner: 'Turn 6' },
            { id: 16, x: 155, y: 198, type: 'apex',      speed: 185, throttle: 0.8, brake: 0.05, corner: 'Turn 7' },
            { id: 17, x: 148, y: 228, type: 'straight',  speed: 218, throttle: 1.0, brake: 0   },
            { id: 18, x: 158, y: 257, type: 'brake',     speed: 175, throttle: 0,   brake: 0.6, corner: 'Turn 8-9' },
            { id: 19, x: 184, y: 275, type: 'apex',      speed: 130, throttle: 0.4, brake: 0.3 },
            { id: 20, x: 210, y: 287, type: 'apex',      speed: 110, throttle: 0.4, brake: 0.2, corner: 'Turn 10-11' },
            { id: 21, x: 235, y: 298, type: 'exit',      speed: 148, throttle: 0.75, brake: 0  },
            { id: 22, x: 210, y: 313, type: 'apex',      speed: 112, throttle: 0.4, brake: 0.3 },
            { id: 23, x: 185, y: 325, type: 'exit',      speed: 138, throttle: 0.8, brake: 0   },
            { id: 24, x: 160, y: 330, type: 'apex',      speed: 190, throttle: 0.9, brake: 0,   corner: 'Turn 12' },
            { id: 25, x: 220, y: 340, type: 'straight',  speed: 255, throttle: 1.0, brake: 0   },
            { id: 26, x: 290, y: 342, type: 'finish',    speed: 275, throttle: 1.0, brake: 0   }
        ],

        // Racing line SVG path (viewBox 500×380)
        racingLinePath: `M 290,342
           L 340,337 L 390,328
           Q 418,308 425,285
           Q 408,260 395,238
           Q 420,215 405,192
           Q 375,173 345,158
           Q 308,140 270,128
           Q 235,134 206,150
           Q 178,170 155,198
           L 148,228
           Q 158,257 184,275
           Q 210,287 235,298
           Q 210,313 185,325
           Q 160,330 220,340 L 290,342`,

        referenceTimes: { pole: 86.209, fastestLap: 88.725, average: 89.5 },

        pitLane: {
            entry: { x: 295, y: 335 },
            exit:  { x: 260, y: 340 },
            timeLoss: 23
        }
    },
    
    montmelo: {
        id: 'montmelo',
        name: 'Circuit de Barcelona-Catalunya',
        shortName: 'Montmeló',
        country: 'España',
        flag: '🇪🇸',
        length: 4.657,
        laps: 66,
        type: 'technical',
        difficulty: 4,
        image: 'img/tracks/montmelo.svg',
        thumbnail: 'img/tracks/montmelo.png',
        characteristics: {
            topSpeed: 320,
            avgSpeed: 195,
            downforce: 'high',
            braking: 'medium',
            overtaking: 'hard',
            tyreWear: 'high',
            fuelConsumption: 'medium'
        },

        drsZones: [
            { start: 0, end: 3, name: 'Recta principal' }
        ],

        sectors: [
            { id: 1, name: 'Sector 1', startWaypoint: 0,  endWaypoint: 8,  type: 'speed'     },
            { id: 2, name: 'Sector 2', startWaypoint: 9,  endWaypoint: 18, type: 'technical'  },
            { id: 3, name: 'Sector 3', startWaypoint: 19, endWaypoint: 26, type: 'mixed'      }
        ],

        corners: [
            { id: 1,  name: 'Turn 1',          waypoint: 4,  type: 'fast',    angle: 50,  speed: 235 },
            { id: 2,  name: 'Turn 2-3',        waypoint: 6,  type: 'chicane', angle: 90,  speed: 145 },
            { id: 3,  name: 'Turn 4 (Repsol)', waypoint: 8,  type: 'medium',  angle: 80,  speed: 165 },
            { id: 4,  name: 'Esses T5-T6',     waypoint: 10, type: 'fast',    angle: 55,  speed: 225 },
            { id: 5,  name: 'Esses T7-T8',     waypoint: 12, type: 'fast',    angle: 60,  speed: 200 },
            { id: 6,  name: 'Turn 9 Hairpin',  waypoint: 14, type: 'hairpin', angle: 175, speed: 80  },
            { id: 7,  name: 'Turn 10',         waypoint: 17, type: 'slow',    angle: 120, speed: 95  },
            { id: 8,  name: 'Turn 12',         waypoint: 20, type: 'medium',  angle: 80,  speed: 150 },
            { id: 9,  name: 'Chicane T13-T14', waypoint: 22, type: 'chicane', angle: 90,  speed: 130 },
            { id: 10, name: 'Turn 16 (Last)',  waypoint: 25, type: 'fast',    angle: 60,  speed: 205 }
        ],

        // Waypoints para la IA — coordenadas en espacio 500×380
        waypoints: [
            { id: 0,  x: 358, y: 332, type: 'start',     speed: 0,   throttle: 1.0, brake: 0   },
            { id: 1,  x: 390, y: 322, type: 'straight',  speed: 265, throttle: 1.0, brake: 0   },
            { id: 2,  x: 420, y: 312, type: 'drs-start', speed: 295, throttle: 1.0, brake: 0,   drs: true },
            { id: 3,  x: 448, y: 300, type: 'straight',  speed: 315, throttle: 1.0, brake: 0,   drs: true },
            { id: 4,  x: 460, y: 275, type: 'apex',      speed: 235, throttle: 0.9, brake: 0.2, corner: 'Turn 1' },
            { id: 5,  x: 456, y: 248, type: 'exit',      speed: 200, throttle: 0.7, brake: 0   },
            { id: 6,  x: 440, y: 228, type: 'apex',      speed: 145, throttle: 0.4, brake: 0.5, corner: 'Turn 2-3' },
            { id: 7,  x: 420, y: 215, type: 'exit',      speed: 178, throttle: 0.8, brake: 0   },
            { id: 8,  x: 390, y: 203, type: 'apex',      speed: 165, throttle: 0.6, brake: 0.2, corner: 'Turn 4 (Repsol)' },
            { id: 9,  x: 355, y: 192, type: 'exit',      speed: 210, throttle: 0.9, brake: 0   },
            { id: 10, x: 316, y: 182, type: 'apex',      speed: 225, throttle: 0.85, brake: 0,  corner: 'Esses T5-T6' },
            { id: 11, x: 278, y: 176, type: 'straight',  speed: 242, throttle: 1.0, brake: 0   },
            { id: 12, x: 245, y: 175, type: 'apex',      speed: 200, throttle: 0.8, brake: 0.1, corner: 'Esses T7-T8' },
            { id: 13, x: 218, y: 180, type: 'brake',     speed: 158, throttle: 0,   brake: 0.7, corner: 'Turn 9 Hairpin' },
            { id: 14, x: 202, y: 198, type: 'apex',      speed: 80,  throttle: 0.2, brake: 0.4 },
            { id: 15, x: 193, y: 222, type: 'exit',      speed: 110, throttle: 0.5, brake: 0   },
            { id: 16, x: 176, y: 245, type: 'brake',     speed: 132, throttle: 0,   brake: 0.5, corner: 'Turn 10' },
            { id: 17, x: 166, y: 268, type: 'apex',      speed: 95,  throttle: 0.3, brake: 0.3 },
            { id: 18, x: 180, y: 290, type: 'exit',      speed: 145, throttle: 0.8, brake: 0   },
            { id: 19, x: 210, y: 305, type: 'straight',  speed: 194, throttle: 1.0, brake: 0   },
            { id: 20, x: 245, y: 315, type: 'apex',      speed: 150, throttle: 0.6, brake: 0.3, corner: 'Turn 12' },
            { id: 21, x: 268, y: 325, type: 'brake',     speed: 118, throttle: 0,   brake: 0.6 },
            { id: 22, x: 286, y: 337, type: 'apex',      speed: 130, throttle: 0.4, brake: 0.2, corner: 'Chicane T13-T14' },
            { id: 23, x: 305, y: 328, type: 'apex',      speed: 125, throttle: 0.5, brake: 0.1 },
            { id: 24, x: 325, y: 338, type: 'exit',      speed: 175, throttle: 0.85, brake: 0  },
            { id: 25, x: 348, y: 340, type: 'apex',      speed: 205, throttle: 0.9, brake: 0,   corner: 'Turn 16 (Last)' },
            { id: 26, x: 358, y: 332, type: 'finish',    speed: 248, throttle: 1.0, brake: 0   }
        ],

        // Racing line SVG path (viewBox 500×380)
        racingLinePath: `M 358,332
           L 390,322 L 420,312 L 448,300
           Q 460,275 456,248
           Q 440,228 420,215
           Q 390,203 355,192
           Q 316,182 278,176
           Q 245,175 218,180
           Q 202,198 193,222
           Q 176,245 166,268
           Q 180,290 210,305
           Q 245,315 268,325
           Q 286,337 305,328
           Q 325,338 348,340 L 358,332`,

        referenceTimes: { pole: 78.149, fastestLap: 80.148, average: 81.5 },

        pitLane: {
            entry: { x: 362, y: 324 },
            exit:  { x: 340, y: 328 },
            timeLoss: 22
        }
    },
    
    nurburgring: {
        id: 'nurburgring',
        name: 'Nürburgring (GP-Strecke)',
        shortName: 'Nürburgring',
        country: 'Alemania',
        flag: '🇩🇪',
        length: 5.148,
        laps: 60,
        type: 'mixed',
        difficulty: 3,
        image: 'img/tracks/nurburgring.svg',
        thumbnail: 'img/tracks/nurburgring.png',
        characteristics: {
            topSpeed: 315,
            avgSpeed: 200,
            downforce: 'medium',
            braking: 'medium',
            overtaking: 'medium',
            tyreWear: 'medium',
            fuelConsumption: 'medium'
        },

        drsZones: [
            { start: 24, end: 26, name: 'Recta principal' }
        ],

        sectors: [
            { id: 1, name: 'Sector 1', startWaypoint: 0,  endWaypoint: 9,  type: 'technical' },
            { id: 2, name: 'Sector 2', startWaypoint: 10, endWaypoint: 18, type: 'mixed'     },
            { id: 3, name: 'Sector 3', startWaypoint: 19, endWaypoint: 26, type: 'speed'     }
        ],

        corners: [
            { id: 1,  name: 'T1 Mercedes Arena',   waypoint: 4,  type: 'fast',    angle: 60,  speed: 215 },
            { id: 2,  name: 'T2-T3 Mercedes Exit', waypoint: 6,  type: 'chicane', angle: 85,  speed: 155 },
            { id: 3,  name: 'T4 Dunlop Kurve',     waypoint: 8,  type: 'fast',    angle: 55,  speed: 235 },
            { id: 4,  name: 'T5-T6 Chicane',       waypoint: 10, type: 'chicane', angle: 80,  speed: 140 },
            { id: 5,  name: 'T7-T8 Ford Kurve',    waypoint: 13, type: 'fast',    angle: 120, speed: 185 },
            { id: 6,  name: 'T9 Coca-Cola',        waypoint: 16, type: 'hairpin', angle: 150, speed: 85  },
            { id: 7,  name: 'T11 Michelin',        waypoint: 19, type: 'medium',  angle: 75,  speed: 148 },
            { id: 8,  name: 'T13 NGK Schikane',    waypoint: 22, type: 'chicane', angle: 95,  speed: 120 }
        ],

        // Waypoints para la IA — coordenadas en espacio 500×380
        waypoints: [
            { id: 0,  x: 440, y: 318, type: 'start',     speed: 0,   throttle: 1.0, brake: 0   },
            { id: 1,  x: 460, y: 288, type: 'drs-start', speed: 265, throttle: 1.0, brake: 0,   drs: true },
            { id: 2,  x: 462, y: 256, type: 'straight',  speed: 298, throttle: 1.0, brake: 0,   drs: true },
            { id: 3,  x: 455, y: 222, type: 'brake',     speed: 248, throttle: 0,   brake: 0.7, corner: 'T1 Mercedes Arena' },
            { id: 4,  x: 440, y: 194, type: 'apex',      speed: 215, throttle: 0.8, brake: 0.1 },
            { id: 5,  x: 414, y: 178, type: 'exit',      speed: 188, throttle: 0.7, brake: 0.1 },
            { id: 6,  x: 382, y: 178, type: 'apex',      speed: 155, throttle: 0.5, brake: 0.3, corner: 'T2-T3 Mercedes Exit' },
            { id: 7,  x: 352, y: 170, type: 'exit',      speed: 195, throttle: 0.9, brake: 0   },
            { id: 8,  x: 315, y: 158, type: 'apex',      speed: 235, throttle: 0.85, brake: 0,  corner: 'T4 Dunlop Kurve' },
            { id: 9,  x: 280, y: 148, type: 'brake',     speed: 185, throttle: 0,   brake: 0.5, corner: 'T5-T6 Chicane' },
            { id: 10, x: 252, y: 158, type: 'apex',      speed: 140, throttle: 0.4, brake: 0.2 },
            { id: 11, x: 222, y: 178, type: 'exit',      speed: 175, throttle: 0.8, brake: 0   },
            { id: 12, x: 198, y: 208, type: 'brake',     speed: 195, throttle: 0.2, brake: 0.4, corner: 'T7-T8 Ford Kurve' },
            { id: 13, x: 182, y: 244, type: 'apex',      speed: 185, throttle: 0.7, brake: 0.05 },
            { id: 14, x: 178, y: 282, type: 'exit',      speed: 205, throttle: 0.9, brake: 0   },
            { id: 15, x: 188, y: 316, type: 'brake',     speed: 162, throttle: 0,   brake: 0.7, corner: 'T9 Coca-Cola' },
            { id: 16, x: 214, y: 338, type: 'apex',      speed: 85,  throttle: 0.2, brake: 0.4 },
            { id: 17, x: 252, y: 352, type: 'exit',      speed: 128, throttle: 0.75, brake: 0  },
            { id: 18, x: 295, y: 358, type: 'straight',  speed: 195, throttle: 1.0, brake: 0   },
            { id: 19, x: 332, y: 352, type: 'apex',      speed: 148, throttle: 0.6, brake: 0.2, corner: 'T11 Michelin' },
            { id: 20, x: 358, y: 360, type: 'exit',      speed: 168, throttle: 0.8, brake: 0   },
            { id: 21, x: 372, y: 345, type: 'brake',     speed: 138, throttle: 0,   brake: 0.6, corner: 'T13 NGK Schikane' },
            { id: 22, x: 370, y: 320, type: 'apex',      speed: 120, throttle: 0.35, brake: 0.25},
            { id: 23, x: 355, y: 298, type: 'exit',      speed: 165, throttle: 0.9, brake: 0   },
            { id: 24, x: 392, y: 304, type: 'drs-start', speed: 225, throttle: 1.0, brake: 0,   drs: true },
            { id: 25, x: 420, y: 310, type: 'straight',  speed: 278, throttle: 1.0, brake: 0,   drs: true },
            { id: 26, x: 440, y: 318, type: 'finish',    speed: 295, throttle: 1.0, brake: 0   }
        ],

        // Racing line SVG path (viewBox 500×380)
        racingLinePath: `M 440,318
           L 460,288 L 462,256 L 455,222
           Q 440,194 414,178
           Q 382,178 352,170
           Q 315,158 280,148
           Q 252,158 222,178
           Q 198,208 182,244
           L 178,282
           Q 188,316 214,338
           Q 252,352 295,358
           Q 332,352 358,360
           Q 372,345 370,320
           Q 355,298 392,304
           L 420,310 L 440,318`,

        referenceTimes: { pole: 86.013, fastestLap: 88.139, average: 89.0 },

        pitLane: {
            entry: { x: 448, y: 310 },
            exit:  { x: 428, y: 322 },
            timeLoss: 20
        }
    }
};

/**
 * Puntuación de carrera (Sistema F1)
 */
const RACE_POINTS = {
    1: 25,
    2: 18,
    3: 15,
    4: 12,
    5: 10,
    6: 8,
    7: 6,
    8: 4,
    9: 2,
    10: 1,
    fastestLap: 1 // Punto extra por vuelta rápida (solo si terminas top 10)
};

/**
 * Compuestos de neumáticos
 */
const TYRE_COMPOUNDS = {
    soft: {
        name: 'Blando',
        color: '#ff0000',
        grip: 1.0,
        degradation: 0.03, // % por vuelta
        optimalLaps: 15,
        icon: '🔴'
    },
    medium: {
        name: 'Medio',
        color: '#ffff00',
        grip: 0.95,
        degradation: 0.018,
        optimalLaps: 25,
        icon: '🟡'
    },
    hard: {
        name: 'Duro',
        color: '#ffffff',
        grip: 0.90,
        degradation: 0.01,
        optimalLaps: 40,
        icon: '⚪'
    },
    intermediate: {
        name: 'Intermedio',
        color: '#00ff00',
        grip: 0.85, // En seco
        wetGrip: 1.0, // En mojado
        degradation: 0.02,
        optimalLaps: 30,
        icon: '🟢'
    },
    wet: {
        name: 'Lluvia',
        color: '#0066ff',
        grip: 0.70, // En seco
        wetGrip: 1.0, // En mojado extremo
        degradation: 0.015,
        optimalLaps: 35,
        icon: '🔵'
    }
};

/**
 * Condiciones meteorológicas
 */
const WEATHER_CONDITIONS = {
    sunny: {
        name: 'Soleado',
        icon: '☀️',
        gripModifier: 1.0,
        tyreWearModifier: 1.0,
        rainChance: 0
    },
    cloudy: {
        name: 'Nublado',
        icon: '☁️',
        gripModifier: 0.98,
        tyreWearModifier: 0.95,
        rainChance: 0.15
    },
    lightRain: {
        name: 'Lluvia ligera',
        icon: '🌧️',
        gripModifier: 0.80,
        tyreWearModifier: 0.7,
        rainChance: 0.3
    },
    heavyRain: {
        name: 'Lluvia intensa',
        icon: '⛈️',
        gripModifier: 0.60,
        tyreWearModifier: 0.5,
        rainChance: 0.5
    },
    night: {
        name: 'Nocturno',
        icon: '🌙',
        gripModifier: 0.95,
        tyreWearModifier: 0.85,
        rainChance: 0.1
    }
};

// Exportar si es módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TRACKS_DATA, RACE_POINTS, TYRE_COMPOUNDS, WEATHER_CONDITIONS };
}
