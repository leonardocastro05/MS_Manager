// Base de dades del joc

const gameData = {
    // Pilots disponibles a la tenda
    drivers: [
        { id: 1, name: 'Max Verstappen', skill: 95, price: 5000000, team: 'Red Bull' },
        { id: 2, name: 'Lewis Hamilton', skill: 94, price: 4800000, team: 'Mercedes' },
        { id: 3, name: 'Charles Leclerc', skill: 92, price: 4500000, team: 'Ferrari' },
        { id: 4, name: 'Lando Norris', skill: 90, price: 4200000, team: 'McLaren' },
        { id: 5, name: 'Carlos Sainz', skill: 89, price: 4000000, team: 'Ferrari' },
        { id: 6, name: 'George Russell', skill: 88, price: 3800000, team: 'Mercedes' },
        { id: 7, name: 'Fernando Alonso', skill: 91, price: 3500000, team: 'Aston Martin' },
        { id: 8, name: 'Oscar Piastri', skill: 85, price: 3200000, team: 'McLaren' },
        { id: 9, name: 'Pierre Gasly', skill: 84, price: 2800000, team: 'Alpine' },
        { id: 10, name: 'Yuki Tsunoda', skill: 82, price: 2500000, team: 'AlphaTauri' },
        { id: 11, name: 'Alex Albon', skill: 81, price: 2200000, team: 'Williams' },
        { id: 12, name: 'Lance Stroll', skill: 79, price: 2000000, team: 'Aston Martin' }
    ],

    // Mànagers disponibles a la tenda
    managers: [
        { id: 1, name: 'Christian Horner', bonus: 15, price: 2000000, team: 'Red Bull' },
        { id: 2, name: 'Toto Wolff', bonus: 14, price: 1900000, team: 'Mercedes' },
        { id: 3, name: 'Fred Vasseur', bonus: 13, price: 1700000, team: 'Ferrari' },
        { id: 4, name: 'Andrea Stella', bonus: 12, price: 1500000, team: 'McLaren' },
        { id: 5, name: 'Mike Krack', bonus: 11, price: 1300000, team: 'Aston Martin' },
        { id: 6, name: 'James Vowles', bonus: 10, price: 1100000, team: 'Williams' }
    ],

    // Circuits amb dades realistes actualitzades
    tracks: {
        portimao: {
            name: 'Portimão',
            flag: '🇵🇹',
            laps: 15,
            image: 'portimao.jpg',
            path: 'M150,350 Q200,300 250,280 L350,260 Q400,250 430,280 L480,330 Q520,370 570,370 L670,370 Q720,370 750,340 L800,290 Q830,260 860,270 L900,290 Q920,310 920,340 L920,380 Q920,410 890,430 L830,460 Q780,480 730,480 L500,480 Q450,480 420,450 L350,400 Q300,370 250,380 L180,400 Q150,410 140,380 L150,350',
            difficulty: 'Alta',
            length: 4.653,
            lapRecord: '1:18.750'
        },
        interlagos: {
            name: 'Interlagos',
            flag: '🇧🇷',
            laps: 15,
            image: 'interlagos.png',
            path: 'M200,300 Q250,280 300,300 L400,340 Q450,360 500,350 L650,320 Q700,310 730,340 L770,390 Q790,420 770,450 L730,490 Q700,520 650,520 L400,520 Q350,520 320,490 L270,440 Q240,400 230,360 L200,300',
            difficulty: 'Alta',
            length: 4.309,
            lapRecord: '1:10.540'
        },
        monaco: {
            name: 'Monaco',
            flag: '🇲🇨',
            laps: 15,
            image: 'monaco.png',
            path: 'M 120,450 L 140,448 L 155,446 Q 165,444 170,435 L 175,420 Q 177,408 185,400 L 200,388 Q 215,378 230,372 L 255,365 Q 280,360 305,358 L 340,356 Q 375,356 405,360 L 445,366 Q 480,373 510,385 L 540,398 Q 565,412 590,428 L 615,445 Q 638,462 662,475 L 690,490 Q 720,503 750,510 L 785,516 Q 820,520 850,515 L 880,508 Q 905,499 918,480 L 928,455 Q 933,428 928,402 L 918,375 Q 905,352 885,338 L 860,325 Q 832,316 805,318 L 775,322 Q 748,328 725,340 L 700,355 Q 678,372 658,392 L 640,413 Q 625,435 615,460 L 608,488 Q 605,518 610,545 L 618,570 Q 628,590 615,605 L 595,618 Q 570,628 545,630 L 515,630 Q 485,628 458,620 L 428,610 Q 400,598 375,585 L 345,570 Q 318,555 295,540 L 270,523 Q 248,507 230,490 L 210,470 Q 195,452 185,435 L 175,418 Q 168,403 165,390 L 162,378 Q 160,368 155,362 L 148,356 Q 140,352 132,354 L 123,358 Q 115,365 112,375 L 110,388 Q 110,402 113,415 L 118,430 Q 123,442 120,450 Z',
            difficulty: 'Molt Difícil',
            length: 3.337,
            lapRecord: '1:12.909'
        },
        spa: {
            name: 'Spa-Francorchamps',
            flag: '🇧🇪',
            laps: 15,
            image: 'spa-francorchamps.png',
            path: 'M100,300 L200,300 Q250,300 270,270 L300,220 Q320,180 360,170 L500,170 L700,170 Q750,170 770,200 L800,250 Q820,280 850,280 L900,280 Q930,280 940,310 L950,350 Q955,380 930,400 L850,450 Q800,480 760,480 L500,480 Q450,480 420,450 L350,380 Q320,350 300,350 L200,350 Q150,350 130,320 L100,300',
            difficulty: 'Difícil',
            length: 7.004,
            lapRecord: '1:46.286'
        },
        monza: {
            name: 'Monza',
            flag: '🇮🇹',
            laps: 15,
            image: 'monza.png',
            path: 'M100,300 L900,300 Q950,300 970,330 L990,370 Q1000,400 970,420 L920,450 Q890,470 850,470 L200,470 Q150,470 130,440 L110,400 Q100,370 120,350 L100,300',
            difficulty: 'Mitjana',
            length: 5.793,
            lapRecord: '1:21.046'
        }
    },

    // Estratègies de neumàtics
    tyreStrategies: {
        soft: { speed: 1.2, degradation: 2.0, name: 'Tous 🔴' },
        medium: { speed: 1.0, degradation: 1.0, name: 'Mitjans 🟡' },
        hard: { speed: 0.85, degradation: 0.5, name: 'Durs ⚪' }
    },

    // Costos de millores
    upgradeCosts: {
        engine: 1500000,
        aero: 1000000,
        chassis: 500000
    }
};

// Equips IA per les curses - Nivells reduits per millorar l'experiència del jugador
const aiTeams = [
    { name: 'Red Bull Racing', color: '#0600EF', driver1: 'AI Verstappen', driver2: 'AI Perez', skill: 75 },
    { name: 'Mercedes', color: '#00D2BE', driver1: 'AI Hamilton', driver2: 'AI Russell', skill: 73 },
    { name: 'Ferrari', color: '#DC0000', driver1: 'AI Leclerc', driver2: 'AI Sainz', skill: 72 },
    { name: 'McLaren', color: '#FF8700', driver1: 'AI Norris', driver2: 'AI Piastri', skill: 70 },
    { name: 'Aston Martin', color: '#006F62', driver1: 'AI Alonso', driver2: 'AI Stroll', skill: 68 },
    { name: 'Alpine', color: '#0090FF', driver1: 'AI Gasly', driver2: 'AI Ocon', skill: 66 },
    { name: 'Williams', color: '#005AFF', driver1: 'AI Albon', driver2: 'AI Sargeant', skill: 64 },
    { name: 'AlphaTauri', color: '#2B4562', driver1: 'AI Tsunoda', driver2: 'AI Ricciardo', skill: 65 }
];
