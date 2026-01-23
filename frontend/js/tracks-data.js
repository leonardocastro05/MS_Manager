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
            pole: 81.046,      // Récord de pole
            fastestLap: 81.370, // Vuelta más rápida en carrera
            average: 83.5      // Tiempo medio
        },
        
        // Pit stop
        pitLane: {
            entry: { x: 105, y: 355 },
            exit: { x: 180, y: 370 },
            timeLoss: 22 // segundos perdidos en pit
        }
    },
    
    // Placeholder para próximos circuitos
    bahrain: {
        id: 'bahrain',
        name: 'Bahrain International Circuit',
        shortName: 'Bahrain',
        country: 'Bahréin',
        flag: '🇧🇭',
        length: 5.412,
        laps: 57,
        type: 'mixed',
        difficulty: 3,
        image: 'img/tracks/bahrain.svg',
        thumbnail: 'img/tracks/bahrain.jpg',
        characteristics: {
            topSpeed: 320,
            avgSpeed: 205,
            downforce: 'medium',
            braking: 'heavy',
            overtaking: 'medium',
            tyreWear: 'high',
            fuelConsumption: 'medium'
        },
        waypoints: [], // Se rellenará
        corners: [],
        sectors: [],
        drsZones: [],
        referenceTimes: { pole: 89.474, fastestLap: 90.432, average: 92.0 }
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
        waypoints: [],
        corners: [],
        sectors: [],
        drsZones: [],
        referenceTimes: { pole: 86.209, fastestLap: 88.725, average: 89.5 }
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
        thumbnail: 'img/tracks/montmelo.jpg',
        characteristics: {
            topSpeed: 320,
            avgSpeed: 195,
            downforce: 'high',
            braking: 'medium',
            overtaking: 'hard',
            tyreWear: 'high',
            fuelConsumption: 'medium'
        },
        waypoints: [],
        corners: [],
        sectors: [],
        drsZones: [],
        referenceTimes: { pole: 78.149, fastestLap: 80.148, average: 81.5 }
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
        waypoints: [],
        corners: [],
        sectors: [],
        drsZones: [],
        referenceTimes: { pole: 86.013, fastestLap: 88.139, average: 89.0 }
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
