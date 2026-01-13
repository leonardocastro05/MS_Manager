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
        portugal: {
            name: 'Portugal',
            flag: '🇵🇹',
            laps: 15,
            image: 'portimao.jpg',
            path: 'M150,350 Q200,300 250,280 L350,260 Q400,250 430,280 L480,330 Q520,370 570,370 L670,370 Q720,370 750,340 L800,290 Q830,260 860,270 L900,290 Q920,310 920,340 L920,380 Q920,410 890,430 L830,460 Q780,480 730,480 L500,480 Q450,480 420,450 L350,400 Q300,370 250,380 L180,400 Q150,410 140,380 L150,350',
            difficulty: 'Alta',
            length: 4.653,
            lapRecord: '1:18.750'
        },
        brasil: {
            name: 'Brasil',
            flag: '🇧🇷',
            laps: 15,
            image: 'interlagos.png',
            path: 'M200,300 Q250,280 300,300 L400,340 Q450,360 500,350 L650,320 Q700,310 730,340 L770,390 Q790,420 770,450 L730,490 Q700,520 650,520 L400,520 Q350,520 320,490 L270,440 Q240,400 230,360 L200,300',
            difficulty: 'Alta',
            length: 4.309,
            lapRecord: '1:10.540'
        },
        monaco: {
            name: 'Mónaco',
            flag: '🇲🇨',
            laps: 15,
            image: 'monaco.png',
            path: 'M 120,450 L 140,448 L 155,446 Q 165,444 170,435 L 175,420 Q 177,408 185,400 L 200,388 Q 215,378 230,372 L 255,365 Q 280,360 305,358 L 340,356 Q 375,356 405,360 L 445,366 Q 480,373 510,385 L 540,398 Q 565,412 590,428 L 615,445 Q 638,462 662,475 L 690,490 Q 720,503 750,510 L 785,516 Q 820,520 850,515 L 880,508 Q 905,499 918,480 L 928,455 Q 933,428 928,402 L 918,375 Q 905,352 885,338 L 860,325 Q 832,316 805,318 L 775,322 Q 748,328 725,340 L 700,355 Q 678,372 658,392 L 640,413 Q 625,435 615,460 L 608,488 Q 605,518 610,545 L 618,570 Q 628,590 615,605 L 595,618 Q 570,628 545,630 L 515,630 Q 485,628 458,620 L 428,610 Q 400,598 375,585 L 345,570 Q 318,555 295,540 L 270,523 Q 248,507 230,490 L 210,470 Q 195,452 185,435 L 175,418 Q 168,403 165,390 L 162,378 Q 160,368 155,362 L 148,356 Q 140,352 132,354 L 123,358 Q 115,365 112,375 L 110,388 Q 110,402 113,415 L 118,430 Q 123,442 120,450 Z',
            difficulty: 'Molt Difícil',
            length: 3.337,
            lapRecord: '1:12.909'
        },
        belgica: {
            name: 'Bélgica',
            flag: '🇧🇪',
            laps: 15,
            image: 'spa-francorchamps.png',
            path: 'M100,300 L200,300 Q250,300 270,270 L300,220 Q320,180 360,170 L500,170 L700,170 Q750,170 770,200 L800,250 Q820,280 850,280 L900,280 Q930,280 940,310 L950,350 Q955,380 930,400 L850,450 Q800,480 760,480 L500,480 Q450,480 420,450 L350,380 Q320,350 300,350 L200,350 Q150,350 130,320 L100,300',
            difficulty: 'Difícil',
            length: 7.004,
            lapRecord: '1:46.286'
        },
        italia: {
            name: 'Italia',
            flag: '🇮🇹',
            laps: 15,
            image: 'monza.png',
            path: 'M100,300 L900,300 Q950,300 970,330 L990,370 Q1000,400 970,420 L920,450 Q890,470 850,470 L200,470 Q150,470 130,440 L110,400 Q100,370 120,350 L100,300',
            difficulty: 'Mitjana',
            length: 5.793,
            lapRecord: '1:21.046'
        },
        reinounido: {
            name: 'Reino Unido',
            flag: '🇬🇧',
            laps: 15,
            image: 'silverstone.png',
            path: 'M150,400 Q200,350 280,340 L400,330 Q480,325 550,350 L650,390 Q720,420 780,415 L850,410 Q900,405 930,380 L960,350 Q980,320 970,280 L950,240 Q930,210 890,200 L820,190 Q750,185 680,195 L580,210 Q500,230 440,260 L360,300 Q290,340 240,360 L180,380 Q150,390 150,400',
            difficulty: 'Alta',
            length: 5.891,
            lapRecord: '1:27.097'
        },
        espana: {
            name: 'España',
            flag: '🇪🇸',
            laps: 15,
            image: 'spain.png',
            path: 'M200,350 L300,340 Q350,335 390,350 L450,380 Q500,410 560,420 L650,430 Q720,435 780,420 L840,400 Q890,380 920,350 L950,310 Q970,270 950,230 L920,190 Q880,160 830,155 L750,150 Q670,150 600,165 L500,185 Q420,205 360,240 L300,280 Q260,310 240,340 L200,350',
            difficulty: 'Mitjana',
            length: 4.675,
            lapRecord: '1:18.149'
        },
        austria: {
            name: 'Austria',
            flag: '🇦🇹',
            laps: 15,
            image: 'austria.png',
            path: 'M150,400 L250,380 Q320,370 380,385 L460,410 Q530,435 600,440 L680,445 Q750,448 810,435 L870,420 Q920,405 950,375 L980,340 Q1000,300 980,260 L950,220 Q910,190 860,180 L780,170 Q700,165 620,175 L520,190 Q440,210 380,240 L310,280 Q250,320 210,350 L150,400',
            difficulty: 'Mitjana',
            length: 4.318,
            lapRecord: '1:05.619'
        },
        francia: {
            name: 'Francia',
            flag: '🇫🇷',
            laps: 15,
            image: 'france.png',
            path: 'M180,370 L280,355 Q350,345 420,355 L510,375 Q590,395 670,405 L760,415 Q840,420 900,405 L960,385 Q1010,365 1030,330 L1045,290 Q1055,245 1035,205 L1010,170 Q975,145 930,135 L850,125 Q770,120 690,130 L590,145 Q500,165 430,195 L350,235 Q280,275 240,310 L200,345 Q180,360 180,370',
            difficulty: 'Alta',
            length: 5.842,
            lapRecord: '1:32.740'
        },
        alemania: {
            name: 'Alemania',
            flag: '🇩🇪',
            laps: 15,
            image: 'germany.png',
            path: 'M170,380 L270,365 Q340,355 410,365 L500,385 Q580,405 660,415 L750,425 Q830,430 890,415 L950,395 Q1000,375 1020,340 L1035,300 Q1045,255 1025,215 L1000,180 Q965,155 920,145 L840,135 Q760,130 680,140 L580,155 Q490,175 420,205 L340,245 Q270,285 230,320 L190,355 Q170,370 170,380',
            difficulty: 'Molt Difícil',
            length: 4.574,
            lapRecord: '1:13.780'
        },
        japon: {
            name: 'Japón',
            flag: '🇯🇵',
            laps: 15,
            image: 'japan.png',
            path: 'M200,360 L300,345 Q370,335 440,345 L530,365 Q610,385 690,395 L780,405 Q860,410 920,395 L980,375 Q1030,355 1050,320 L1065,280 Q1075,235 1055,195 L1030,160 Q995,135 950,125 L870,115 Q790,110 710,120 L610,135 Q520,155 450,185 L370,225 Q300,265 260,300 L220,335 Q200,350 200,360',
            difficulty: 'Alta',
            length: 5.807,
            lapRecord: '1:30.983'
        },
        singapur: {
            name: 'Singapur',
            flag: '🇸🇬',
            laps: 15,
            image: 'singapore.png',
            path: 'M190,370 L290,355 Q360,345 430,355 L520,375 Q600,395 680,405 L770,415 Q850,420 910,405 L970,385 Q1020,365 1040,330 L1055,290 Q1065,245 1045,205 L1020,170 Q985,145 940,135 L860,125 Q780,120 700,130 L600,145 Q510,165 440,195 L360,235 Q290,275 250,310 L210,345 Q190,360 190,370',
            difficulty: 'Molt Difícil',
            length: 4.94,
            lapRecord: '1:35.867'
        },
        australia: {
            name: 'Australia',
            flag: '🇦🇺',
            laps: 15,
            image: 'australia.png',
            path: 'M180,375 L280,360 Q350,350 420,360 L510,380 Q590,400 670,410 L760,420 Q840,425 900,410 L960,390 Q1010,370 1030,335 L1045,295 Q1055,250 1035,210 L1010,175 Q975,150 930,140 L850,130 Q770,125 690,135 L590,150 Q500,170 430,200 L350,240 Q280,280 240,315 L200,350 Q180,365 180,375',
            difficulty: 'Mitjana',
            length: 5.278,
            lapRecord: '1:20.260'
        },
        canada: {
            name: 'Canadá',
            flag: '🇨🇦',
            laps: 15,
            image: 'canada.png',
            path: 'M175,380 L275,365 Q345,355 415,365 L505,385 Q585,405 665,415 L755,425 Q835,430 895,415 L955,395 Q1005,375 1025,340 L1040,300 Q1050,255 1030,215 L1005,180 Q970,155 925,145 L845,135 Q765,130 685,140 L585,155 Q495,175 425,205 L345,245 Q275,285 235,320 L195,355 Q175,370 175,380',
            difficulty: 'Mitjana-Alta',
            length: 4.361,
            lapRecord: '1:13.078'
        },
        mexico: {
            name: 'México',
            flag: '🇲🇽',
            laps: 15,
            image: 'mexico.png',
            path: 'M185,375 L285,360 Q355,350 425,360 L515,380 Q595,400 675,410 L765,420 Q845,425 905,410 L965,390 Q1015,370 1035,335 L1050,295 Q1060,250 1040,210 L1015,175 Q980,150 935,140 L855,130 Q775,125 695,135 L595,150 Q505,170 435,200 L355,240 Q285,280 245,315 L205,350 Q185,365 185,375',
            difficulty: 'Alta',
            length: 4.304,
            lapRecord: '1:17.774'
        },
        emiratosarabes: {
            name: 'Emiratos Árabes',
            flag: '🇦🇪',
            laps: 15,
            image: 'abudhabi.png',
            path: 'M195,370 L295,355 Q365,345 435,355 L525,375 Q605,395 685,405 L775,415 Q855,420 915,405 L975,385 Q1025,365 1045,330 L1060,290 Q1070,245 1050,205 L1025,170 Q990,145 945,135 L865,125 Q785,120 705,130 L605,145 Q515,165 445,195 L365,235 Q295,275 255,310 L215,345 Q195,360 195,370',
            difficulty: 'Mitjana',
            length: 5.281,
            lapRecord: '1:26.103'
        },
        arabia: {
            name: 'Arabia Saudita',
            flag: '🇸🇦',
            laps: 15,
            image: 'saudi.png',
            path: 'M188,372 L288,357 Q358,347 428,357 L518,377 Q598,397 678,407 L768,417 Q848,422 908,407 L968,387 Q1018,367 1038,332 L1053,292 Q1063,247 1043,207 L1018,172 Q983,147 938,137 L858,127 Q778,122 698,132 L598,147 Q508,167 438,197 L358,237 Q288,277 248,312 L208,347 Q188,362 188,372',
            difficulty: 'Molt Difícil',
            length: 6.174,
            lapRecord: '1:30.734'
        },
        holanda: {
            name: 'Holanda',
            flag: '🇳🇱',
            laps: 15,
            image: 'netherlands.png',
            path: 'M182,377 L282,362 Q352,352 422,362 L512,382 Q592,402 672,412 L762,422 Q842,427 902,412 L962,392 Q1012,372 1032,337 L1047,297 Q1057,252 1037,212 L1012,177 Q977,152 932,142 L852,132 Q772,127 692,137 L592,152 Q502,172 432,202 L352,242 Q282,282 242,317 L202,352 Q182,367 182,377',
            difficulty: 'Alta',
            length: 4.259,
            lapRecord: '1:11.097'
        },
        miami: {
            name: 'Estados Unidos (Miami)',
            flag: '🇺🇸',
            laps: 15,
            image: 'miami.png',
            path: 'M177,379 L277,364 Q347,354 417,364 L507,384 Q587,404 667,414 L757,424 Q837,429 897,414 L957,394 Q1007,374 1027,339 L1042,299 Q1052,254 1032,214 L1007,179 Q972,154 927,144 L847,134 Q767,129 687,139 L587,154 Q497,174 427,204 L347,244 Q277,284 237,319 L197,354 Q177,369 177,379',
            difficulty: 'Mitjana-Alta',
            length: 5.412,
            lapRecord: '1:29.708'
        },
        lasvegas: {
            name: 'Estados Unidos (Las Vegas)',
            flag: '🇺🇸',
            laps: 15,
            image: 'lasvegas.png',
            path: 'M191,371 L291,356 Q361,346 431,356 L521,376 Q601,396 681,406 L771,416 Q851,421 911,406 L971,386 Q1021,366 1041,331 L1056,291 Q1066,246 1046,206 L1021,171 Q986,146 941,136 L861,126 Q781,121 701,131 L601,146 Q511,166 441,196 L361,236 Q291,276 251,311 L211,346 Q191,361 191,371',
            difficulty: 'Mitjana',
            length: 6.12,
            lapRecord: '1:35.490'
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
