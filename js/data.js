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

    // Circuits
    tracks: {
                portimao: {
                    name: 'Portimão',
                    flag: '🇵🇹',
                    laps: 15,
                    image: 'portimao.jpg',
                    path: 'M180,350 C250,200 500,120 700,200 C800,250 850,350 700,400 C600,450 400,480 250,400 C200,380 180,350 180,350',
                    difficulty: 'Medium'
                },
                interlagos: {
                    name: 'Interlagos',
                    flag: '🇧🇷',
                    laps: 15,
                    image: 'interlagos.png',
                    path: 'M200,300 C300,180 700,180 800,300 C900,420 700,500 400,480 C250,460 200,400 200,300',
                    difficulty: 'Medium'
                },
        monaco: {
            name: 'Monaco',
            flag: '🇲🇨',
            laps: 15,
            image: 'monaco.png',
            // SVG path in a 1000x600 viewBox — approximate layout for markers to follow
            path: 'M200,320 C260,180 440,140 520,200 C600,260 720,260 780,320 C720,380 620,420 520,380 C420,340 300,360 200,320',
            difficulty: 'Hard'
        },
        spa: {
            name: 'Spa-Francorchamps',
            flag: '🇧🇪',
            laps: 15,
            image: 'spa-francorchamps.png',
            path: 'M120,320 C220,120 420,100 560,160 C700,220 820,220 900,320 C820,420 700,480 560,440 C420,400 260,380 120,320',
            difficulty: 'Medium'
        },
        monza: {
            name: 'Monza',
            flag: '🇮🇹',
            laps: 15,
            image: 'monza.png',
            path: 'M140,300 L860,300 C920,300 920,360 860,360 L140,360 C80,360 80,300 140,300',
            difficulty: 'Easy'
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
        engine: 500000,
        aero: 500000,
        chassis: 500000
    }
};

// Equips IA per les curses
const aiTeams = [
    { name: 'Red Bull Racing', color: '#0600EF', driver1: 'AI Verstappen', driver2: 'AI Perez', skill: 92 },
    { name: 'Mercedes', color: '#00D2BE', driver1: 'AI Hamilton', driver2: 'AI Russell', skill: 90 },
    { name: 'Ferrari', color: '#DC0000', driver1: 'AI Leclerc', driver2: 'AI Sainz', skill: 89 },
    { name: 'McLaren', color: '#FF8700', driver1: 'AI Norris', driver2: 'AI Piastri', skill: 87 },
    { name: 'Aston Martin', color: '#006F62', driver1: 'AI Alonso', driver2: 'AI Stroll', skill: 84 },
    { name: 'Alpine', color: '#0090FF', driver1: 'AI Gasly', driver2: 'AI Ocon', skill: 82 },
    { name: 'Williams', color: '#005AFF', driver1: 'AI Albon', driver2: 'AI Sargeant', skill: 78 },
    { name: 'AlphaTauri', color: '#2B4562', driver1: 'AI Tsunoda', driver2: 'AI Ricciardo', skill: 80 }
];
