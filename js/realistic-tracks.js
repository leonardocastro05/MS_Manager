// ============================================
// TRAÇATS REALISTES AMB SECTORS I CARACTERÍSTIQUES
// ============================================

/**
 * Dades detallades de cada circuit amb sectors realistes
 */
const realisticTracks = {
    monaco: {
        name: 'Circuit de Monaco',
        flag: '🇲🇨',
        country: 'Mònaco',
        length: 3.337, // km
        laps: 78,
        lapRecord: '1:12.909',
        difficulty: 'Molt Difícil',
        
        // TRAÇAT ULTRA-REALISTA DE MONACO - Calcat de la realitat
        // Sainte Dévote (T1) → Beau Rivage → Massenet → Casino Square → Mirabeau → Loews Hairpin → 
        // Portier → TÚNEL → Nouvelle Chicane → Tabac → Piscine → La Rascasse → Antony Noghès
        path: 'M 150,550 L 180,548 Q 195,547 200,535 L 205,510 Q 208,485 225,475 L 250,460 Q 275,448 290,430 L 315,395 Q 335,365 365,355 L 410,340 Q 445,332 470,320 L 505,300 Q 530,285 555,275 L 595,260 Q 625,252 650,265 L 675,285 Q 695,305 710,330 L 730,365 Q 745,390 770,400 L 805,412 Q 835,420 855,410 L 880,395 Q 900,380 905,355 L 908,325 Q 910,295 895,275 L 875,255 Q 850,240 820,245 L 785,252 Q 760,258 745,240 L 732,218 Q 723,200 705,195 L 680,190 Q 655,188 640,205 L 625,228 Q 615,248 595,258 L 565,272 Q 535,283 510,295 L 475,315 Q 450,330 430,350 L 405,380 Q 390,405 365,418 L 330,435 Q 300,448 275,460 L 245,478 Q 225,490 210,510 L 195,535 Q 185,555 165,562 L 138,570 Q 115,575 105,555 L 98,530 Q 95,505 110,490 L 130,475 Q 148,465 150,550 Z',
        
        // Decoracions especials de Mònaco
        decorations: {
            tunnel: {
                start: { x: 595, y: 260 },
                end: { x: 475, y: 315 },
                width: 80,
                lights: [
                    { x: 585, y: 265 }, { x: 570, y: 272 }, { x: 555, y: 279 },
                    { x: 540, y: 286 }, { x: 525, y: 293 }, { x: 510, y: 300 },
                    { x: 495, y: 307 }, { x: 480, y: 314 }
                ]
            },
            harbor: [
                { type: 'yacht', x: 850, y: 320, color: '#fff' },
                { type: 'yacht', x: 880, y: 350, color: '#e8e8e8' },
                { type: 'yacht', x: 820, y: 280, color: '#f5f5f5' }
            ],
            casino: { x: 410, y: 340, size: 50 },
            buildings: [
                { x: 120, y: 480, w: 40, h: 70, color: '#d4af37' },
                { x: 170, y: 460, w: 35, h: 90, color: '#c19a6b' },
                { x: 215, y: 420, w: 45, h: 110, color: '#d4af37' },
                { x: 800, y: 190, w: 50, h: 85, color: '#c19a6b' },
                { x: 860, y: 210, w: 40, h: 95, color: '#d4af37' }
            ],
            barriers: true // Barreres de seguretat al voltant
        },
        
        // Sectors del circuit amb informació detallada
        sectors: [
            {
                name: 'Sector 1',
                start: 0,
                end: 0.33,
                corners: ['Sainte Dévote (T1)', 'Beau Rivage (Pujada)', 'Massenet (T3)', 'Casino Square (T4-T5)', 'Mirabeau (T6)', 'Loews/Grand Hotel (T7)'],
                difficulty: 'Molt Alta',
                characteristics: 'Pujada pronuciada després de Sainte Dévote, corbes lentes i tècniques al casino'
            },
            {
                name: 'Sector 2',
                start: 0.33,
                end: 0.66,
                corners: ['Portier (T8)', 'Túnel (recta)', 'Nouvelle Chicane (T10)', 'Tabac (T11)', 'Piscine (T13-T14)'],
                difficulty: 'Alta',
                characteristics: 'Baixada al túnel amb frenada brutal a Nouvelle Chicane, chicanes ràpides a Piscine'
            },
            {
                name: 'Sector 3',
                start: 0.66,
                end: 1.0,
                corners: ['La Rascasse (T16)', 'Antony Noghès (T17-T18)', 'Recta de boxes'],
                difficulty: 'Alta',
                characteristics: 'La Rascasse molt tancada, acceleració final i recta de meta'
            }
        ],
        
        // Punts clau del traçat (percentatge 0-1 segons el path)
        keyPoints: {
            'sainteDevote': 0.02,      // T1 - Corba dreta de baixada
            'beauRivage': 0.08,        // Pujada empinadaç
            'massenet': 0.15,          // T3 - Corba dreta
            'casino': 0.22,            // T4-T5 - Square del Casino
            'mirabeau': 0.28,          // T6 - Corba molt lenta
            'loews': 0.32,             // T7 - Baixada cap al túnel
            'portier': 0.36,           // T8 - Entrada al túnel
            'tunnelStart': 0.40,       // Inici del túnel
            'tunnelEnd': 0.50,         // Final del túnel
            'nouvelleChicane': 0.55,   // T10 - Frenada des del túnel
            'tabac': 0.62,             // T11 - Corba ràpida
            'piscineEntry': 0.70,      // T13 - Entrada a Piscine
            'piscineExit': 0.78,       // T14 - Sortida de Piscine
            'rascasse': 0.88,          // T16 - Corba més lenta del circuit
            'anthonyNoghes': 0.94      // T17-T18 - Corbes finals
        },
        
        // Zona de boxes (percentatge del traçat)
        pitLane: {
            entry: 0.96,    // Entrada a boxes després d'Antony Noghès
            exit: 0.04,     // Sortida abans de Sainte Dévote
            length: 0.08    // Longitud de la pit lane
        },
        
        // Característiques especials
        specialFeatures: [
            {
                name: 'Túnel',
                start: 0.40,
                end: 0.50,
                type: 'tunnel',
                description: 'Túnel il·luminat artificalment - canvi brusc de llum'
            },
            {
                name: 'Piscine',
                start: 0.70,
                end: 0.78,
                type: 'chicane',
                description: 'Chicanes ultraràpides al costat de la piscina'
            },
            {
                name: 'La Rascasse',
                start: 0.86,
                end: 0.90,
                type: 'hairpin',
                description: 'Corba més lenta - famosa per avaries i tocs'
            }
        ]
    },

    spa: {
        name: 'Circuit de Spa-Francorchamps',
        flag: '🇧🇪',
        country: 'Bèlgica',
        length: 7.004, // km
        laps: 44,
        lapRecord: '1:46.286',
        difficulty: 'Difícil',
        
        // TRAÇAT ULTRA-REALISTA DE SPA - Les Ardenes
        // La Source (forcina) → Eau Rouge/Raidillon (icònica pujada en S) → Kemmel Straight (recta llarga) → 
        // Les Combes → Bruxelles → Pouhon (ràpida) → Campus → Blanchimont (a fons) → Bus Stop chicane
        path: 'M 100,380 Q 115,365 140,360 L 175,358 Q 200,358 215,375 L 225,395 Q 230,410 245,420 L 275,435 Q 310,448 340,435 L 380,415 Q 420,390 460,365 L 510,335 Q 555,310 600,290 L 655,268 Q 705,250 750,245 L 805,242 Q 850,245 880,265 L 905,290 Q 920,315 925,345 L 928,385 Q 928,425 910,455 L 885,485 Q 855,510 820,520 L 775,530 Q 730,535 685,525 L 635,510 Q 590,492 550,475 L 505,455 Q 465,438 430,425 L 385,412 Q 345,403 310,410 L 270,420 Q 235,432 210,455 L 185,485 Q 170,510 150,525 L 125,538 Q 105,545 95,530 L 88,510 Q 85,485 92,465 L 100,440 Q 105,415 100,395 L 100,380 Z',
        
        // Decoracions de Spa (bosc i natura)
        decorations: {
            forest: [
                // Arbres a l'esquerra (zona Eau Rouge)
                { x: 50, y: 320, size: 25, color: '#1a4d1a' },
                { x: 65, y: 350, size: 30, color: '#0f3d0f' },
                { x: 45, y: 380, size: 28, color: '#1a5d1a' },
                { x: 70, y: 410, size: 32, color: '#0f3d0f' },
                { x: 55, y: 445, size: 27, color: '#1a4d1a' },
                { x: 75, y: 475, size: 29, color: '#0f3d0f' },
                // Arbres a la dreta (zona Kemmel)
                { x: 910, y: 240, size: 26, color: '#1a4d1a' },
                { x: 925, y: 270, size: 31, color: '#0f3d0f' },
                { x: 935, y: 310, size: 28, color: '#1a5d1a' },
                { x: 945, y: 350, size: 30, color: '#0f3d0f' },
                { x: 950, y: 390, size: 27, color: '#1a4d1a' },
                // Arbres part baixa
                { x: 110, y: 560, size: 29, color: '#0f3d0f' },
                { x: 145, y: 565, size: 32, color: '#1a4d1a' },
                { x: 180, y: 570, size: 28, color: '#0f3d0f' }
            ],
            elevation: {
                eauRouge: { x: 245, y: 420, label: '↗ EAU ROUGE', angle: -35 },
                kemmel: { x: 750, y: 245, label: 'KEMMEL STRAIGHT →' }
            },
            grandstands: [
                { x: 180, y: 330, w: 60, h: 20, color: '#c44' }, // Graderia La Source
                { x: 800, y: 210, w: 80, h: 25, color: '#c44' }  // Graderia Kemmel
            ],
            barriers: true
        },
        
        sectors: [
            {
                name: 'Sector 1',
                start: 0,
                end: 0.32,
                corners: ['La Source', 'Eau Rouge', 'Raidillon', 'Kemmel Straight'],
                difficulty: 'Molt Alta',
                characteristics: 'Eau Rouge/Raidillon - La corba més icònica de la F1'
            },
            {
                name: 'Sector 2',
                start: 0.32,
                end: 0.64,
                corners: ['Les Combes', 'Malmedy', 'Rivage', 'Pouhon'],
                difficulty: 'Alta',
                characteristics: 'Combinació ràpida de corbes'
            },
            {
                name: 'Sector 3',
                start: 0.64,
                end: 1.0,
                corners: ['Fagnes', 'Campus', 'Stavelot', 'Blanchimont', 'Bus Stop'],
                difficulty: 'Mitjana',
                characteristics: 'Blanchimont a fons i chicane final'
            }
        ],
        
        keyPoints: {
            'laSource': 0.02,
            'eauRouge': 0.08,
            'raidillon': 0.12,
            'kemmel': 0.25,
            'lesCombes': 0.35,
            'pouhon': 0.52,
            'campus': 0.68,
            'blanchimont': 0.85,
            'busStop': 0.93
        }
    },

    monza: {
        name: 'Autodromo Nazionale di Monza',
        flag: '🇮🇹',
        country: 'Itàlia',
        length: 5.793, // km
        laps: 53,
        lapRecord: '1:21.046',
        difficulty: 'Mitjana',
        
        // TRAÇAT ULTRA-REALISTA DE MONZA - Temple de la Velocitat
        // Primera Variante (chicane) → Curva Grande → Seconda Variante → Lesmo 1 → Lesmo 2 → 
        // Serraglio → Variante Ascari (triple chicane) → Curva Parabolica (llarga i ràpida)
        path: 'M 100,350 L 160,350 Q 185,350 195,330 L 205,305 Q 210,285 230,280 L 260,277 Q 285,277 295,295 L 305,320 Q 310,340 335,345 L 380,350 Q 430,352 475,345 L 540,335 Q 595,328 640,315 L 695,298 Q 745,283 785,275 L 835,268 Q 875,265 900,280 L 920,300 Q 930,320 928,345 L 925,380 Q 920,415 900,440 L 875,465 Q 845,485 810,495 L 765,505 Q 715,512 665,510 L 605,505 Q 550,498 500,485 L 445,468 Q 395,452 350,445 L 295,440 Q 250,440 215,455 L 180,475 Q 155,492 140,515 L 125,540 Q 115,560 105,540 L 98,515 Q 95,485 108,465 L 125,445 Q 145,428 165,415 L 185,403 Q 205,393 220,375 L 230,355 Q 235,340 220,330 L 200,323 Q 180,320 165,330 L 145,345 Q 130,358 120,375 L 108,395 Q 102,410 100,390 L 100,365 Q 100,350 100,350 Z',
        
        // Decoracions de Monza (parc i graderies)
        decorations: {
            trees: [
                // Parc de Monza - arbres a tot el voltant
                { x: 50, y: 300, size: 22, color: '#2d5016' },
                { x: 65, y: 330, size: 24, color: '#234010' },
                { x: 55, y: 365, size: 20, color: '#2d5016' },
                { x: 70, y: 395, size: 26, color: '#234010' },
                { x: 60, y: 430, size: 23, color: '#2d5016' },
                { x: 75, y: 465, size: 25, color: '#234010' },
                { x: 65, y: 500, size: 21, color: '#2d5016' },
                // Arbres dreta
                { x: 940, y: 270, size: 24, color: '#2d5016' },
                { x: 955, y: 305, size: 22, color: '#234010' },
                { x: 950, y: 345, size: 26, color: '#2d5016' },
                { x: 960, y: 385, size: 23, color: '#234010' },
                { x: 945, y: 425, size: 25, color: '#2d5016' },
                { x: 955, y: 465, size: 21, color: '#234010' },
                // Arbres part alta
                { x: 180, y: 260, size: 20, color: '#2d5016' },
                { x: 240, y: 250, size: 22, color: '#234010' },
                { x: 310, y: 245, size: 24, color: '#2d5016' },
                { x: 390, y: 242, size: 21, color: '#234010' }
            ],
            grandstands: [
                { x: 80, y: 310, w: 25, h: 60, color: '#d00' },     // Tribuna Principal
                { x: 850, y: 450, w: 70, h: 25, color: '#d00' },    // Tribuna Parabolica
                { x: 230, y: 240, w: 50, h: 20, color: '#d00' }     // Tribuna Lesmo
            ],
            startFinish: {
                x: 100,
                y: 350,
                width: 60,
                label: 'START/FINISH'
            },
            barriers: true
        },
        
        sectors: [
            {
                name: 'Sector 1',
                start: 0,
                end: 0.35,
                corners: ['Primera Chicane', 'Curva Grande', 'Segona Chicane'],
                difficulty: 'Mitjana',
                characteristics: 'Dues chicanes per trencar la velocitat'
            },
            {
                name: 'Sector 2',
                start: 0.35,
                end: 0.70,
                corners: ['Lesmo 1', 'Lesmo 2', 'Serraglio'],
                difficulty: 'Alta',
                characteristics: 'Les corbes Lesmo - Clàssiques de Monza'
            },
            {
                name: 'Sector 3',
                start: 0.70,
                end: 1.0,
                corners: ['Ascari', 'Parabolica'],
                difficulty: 'Mitjana',
                characteristics: 'Ascari i la mítica Parabolica'
            }
        ],
        
        keyPoints: {
            'primeraVariante': 0.05,
            'curvaGrande': 0.15,
            'segonaVariante': 0.28,
            'lesmo1': 0.42,
            'lesmo2': 0.52,
            'ascari': 0.78,
            'parabolica': 0.90
        }
    },

    portimao: {
        name: 'Autódromo Internacional do Algarve',
        flag: '🇵🇹',
        country: 'Portugal',
        length: 4.653, // km
        laps: 66,
        lapRecord: '1:18.750',
        difficulty: 'Alta',
        
        // TRAÇAT ULTRA-REALISTA DE PORTIMÃO - Rusa Montanha
        // Curva 1 (pujada cega) → Curva 3 → Curva 5 (baixada) → Curva 9 (ràpida) → 
        // Curva 11 → Curva 13 → Curva 14 (baixada pronunciada) → Curva 15 (última abans de meta)
        path: 'M 120,520 L 150,515 Q 175,512 190,490 L 210,455 Q 230,420 265,405 L 315,385 Q 365,370 415,365 L 475,362 Q 530,362 575,380 L 620,405 Q 655,430 685,460 L 715,495 Q 738,525 770,540 L 810,555 Q 850,565 885,555 L 915,540 Q 935,525 940,500 L 943,465 Q 943,430 925,400 L 900,370 Q 870,345 835,335 L 790,325 Q 745,320 700,328 L 650,340 Q 605,355 565,365 L 515,375 Q 470,382 430,375 L 385,365 Q 350,352 325,370 L 300,395 Q 285,420 275,450 L 268,485 Q 265,515 245,535 L 220,555 Q 195,570 170,575 L 140,578 Q 115,578 105,560 L 98,535 Q 95,510 105,490 L 118,475 Q 125,465 120,520 Z',
        
        // Decoracions de Portimão (paisatge de l'Algarve)
        decorations: {
            hills: [
                // Turons a la distància
                { x: 50, y: 600, w: 180, h: 80, color: '#8b7355' },
                { x: 200, y: 620, w: 250, h: 100, color: '#a0826d' },
                { x: 750, y: 590, w: 200, h: 90, color: '#8b7355' }
            ],
            trees: [
                // Pins mediterranis dispersos
                { x: 60, y: 450, size: 18, color: '#2d5016', type: 'pine' },
                { x: 85, y: 480, size: 20, color: '#234010', type: 'pine' },
                { x: 70, y: 515, size: 17, color: '#2d5016', type: 'pine' },
                { x: 950, y: 470, size: 19, color: '#2d5016', type: 'pine' },
                { x: 965, y: 505, size: 21, color: '#234010', type: 'pine' },
                { x: 955, y: 540, size: 18, color: '#2d5016', type: 'pine' }
            ],
            elevation: {
                uphill: [
                    { x: 190, y: 490, label: '↗ 12%' },
                    { x: 315, y: 385, label: '↗ 10%' }
                ],
                downhill: [
                    { x: 685, y: 460, label: '↘ 9%' },
                    { x: 245, y: 535, label: '↘ 11%' }
                ]
            },
            grandstands: [
                { x: 90, y: 480, w: 40, h: 18, color: '#d00' },
                { x: 800, y: 520, w: 55, h: 22, color: '#d00' }
            ],
            barriers: true
        },
        
        sectors: [
            {
                name: 'Sector 1',
                start: 0,
                end: 0.33,
                corners: ['Curva 1', 'Curva 3', 'Curva 5'],
                difficulty: 'Alta',
                characteristics: 'Pujada inicial amb corbes cegues'
            },
            {
                name: 'Sector 2',
                start: 0.33,
                end: 0.66,
                corners: ['Curva 9', 'Curva 11', 'Curva 13'],
                difficulty: 'Mitjana',
                characteristics: 'Part més ràpida del circuit'
            },
            {
                name: 'Sector 3',
                start: 0.66,
                end: 1.0,
                corners: ['Curva 14', 'Curva 15', 'Última curva'],
                difficulty: 'Alta',
                characteristics: 'Baixada final amb corbes tècniques'
            }
        ],
        
        keyPoints: {
            'curva1': 0.05,
            'curva5': 0.22,
            'curva9': 0.42,
            'curva13': 0.58,
            'curva15': 0.85
        }
    },

    interlagos: {
        name: 'Autódromo José Carlos Pace',
        flag: '🇧🇷',
        country: 'Brasil',
        length: 4.309, // km
        laps: 71,
        lapRecord: '1:10.540',
        difficulty: 'Alta',
        
        // TRAÇAT ULTRA-REALISTA D'INTERLAGOS - Sentit anti-horari
        // Reta Oposta → Senna S (T1-T2 esquerres ràpides) → Curva do Sol → Descida do Lago (baixada) → 
        // Ferradura (forcina) → Laranjinha → Pinheirinho → Bico de Pato → Mergulho → Juncão (avançaments)
        path: 'M 200,400 L 240,395 Q 270,392 290,370 L 315,335 Q 340,300 380,285 L 435,270 Q 490,260 545,265 L 605,275 Q 660,290 705,315 L 750,345 Q 785,375 810,410 L 830,450 Q 845,485 855,520 L 862,560 Q 865,595 850,620 L 825,640 Q 795,655 760,655 L 715,650 Q 670,642 630,625 L 585,605 Q 545,585 510,565 L 470,542 Q 435,522 405,505 L 370,490 Q 340,480 315,495 L 290,515 Q 272,535 260,560 L 250,590 Q 245,615 225,625 L 195,635 Q 170,640 150,625 L 130,605 Q 118,580 118,555 L 120,520 Q 125,485 140,460 L 160,435 Q 180,415 200,400 Z',
        
        // Decoracions d'Interlagos (zona urbana de São Paulo)
        decorations: {
            buildings: [
                // Edificis de São Paulo al fons
                { x: 50, y: 350, w: 40, h: 120, color: '#707070' },
                { x: 95, y: 320, w: 35, h: 150, color: '#606060' },
                { x: 135, y: 380, w: 45, h: 100, color: '#707070' },
                { x: 900, y: 250, w: 50, h: 180, color: '#606060' },
                { x: 955, y: 290, w: 40, h: 140, color: '#707070' }
            ],
            trees: [
                // Vegetació tropical limitada
                { x: 65, y: 590, size: 22, color: '#1a6b1a', type: 'tropical' },
                { x: 90, y: 615, size: 24, color: '#0f5a0f', type: 'tropical' },
                { x: 120, y: 640, size: 21, color: '#1a6b1a', type: 'tropical' },
                { x: 920, y: 600, size: 23, color: '#1a6b1a', type: 'tropical' },
                { x: 945, y: 625, size: 25, color: '#0f5a0f', type: 'tropical' }
            ],
            elevation: {
                uphill: [
                    { x: 250, y: 590, label: '↗ JUNCÃO' }
                ],
                downhill: [
                    { x: 435, y: 270, label: '↘ DESCIDA DO LAGO' }
                ]
            },
            grandstands: [
                { x: 170, y: 360, w: 25, h: 70, color: '#ffd700' }, // Tribuna Principal (groga i verda brasilera)
                { x: 750, y: 310, w: 60, h: 25, color: '#009739' },  // Tribuna Laranjinha
                { x: 180, y: 640, w: 50, h: 22, color: '#ffd700' }   // Tribuna Mergulho
            ],
            specialFeatures: {
                sennaS: { x: 315, y: 335, label: '🏁 SENNA S', color: '#ffd700' }
            },
            barriers: true
        },
        
        sectors: [
            {
                name: 'Sector 1',
                start: 0,
                end: 0.30,
                corners: ['Senna S', 'Curva do Sol', 'Descida do Lago'],
                difficulty: 'Molt Alta',
                characteristics: 'Esses de Senna - Icòniques i tècniques'
            },
            {
                name: 'Sector 2',
                start: 0.30,
                end: 0.65,
                corners: ['Ferradura', 'Laranjinha', 'Pinheirinho'],
                difficulty: 'Mitjana',
                characteristics: 'Zona ràpida amb canvis d\'elevació'
            },
            {
                name: 'Sector 3',
                start: 0.65,
                end: 1.0,
                corners: ['Bico de Pato', 'Mergulho', 'Juncão'],
                difficulty: 'Alta',
                characteristics: 'Pujada final amb Juncão - Punt d\'avançament'
            }
        ],
        
        keyPoints: {
            'sennaS': 0.08,
            'descidaDoLago': 0.22,
            'ferradura': 0.38,
            'laranjinha': 0.52,
            'juncao': 0.88
        }
    }
};

/**
 * Obté el sector actual segons el progrés a la volta
 * @param {string} trackId - ID del circuit
 * @param {number} progress - Progrés 0-100
 * @returns {object} Sector actual
 */
function getCurrentSector(trackId, progress) {
    const track = realisticTracks[trackId];
    if (!track) return null;

    const progressDecimal = progress / 100;
    
    for (let sector of track.sectors) {
        if (progressDecimal >= sector.start && progressDecimal < sector.end) {
            return sector;
        }
    }
    
    return track.sectors[track.sectors.length - 1];
}

/**
 * Calcula el temps estimat de volta segons les característiques del cotxe
 * @param {string} trackId - ID del circuit
 * @param {object} carStats - Estadístiques del cotxe
 * @returns {number} Temps en segons
 */
function calculateLapTime(trackId, carStats) {
    const track = realisticTracks[trackId];
    if (!track) return 90; // Temps per defecte

    // Temps base segons la longitud del circuit
    let baseTime = track.length * 18; // ~18 segons per km
    
    // Ajustar segons les millores del cotxe
    const engineFactor = 1 - (carStats.engine * 0.01); // -1% per nivell
    const aeroFactor = 1 - (carStats.aero * 0.008);
    const chassisFactor = 1 - (carStats.chassis * 0.007);
    
    // Ajustar segons la dificultat del circuit
    const difficultyMultiplier = {
        'Fàcil': 0.95,
        'Mitjana': 1.0,
        'Difícil': 1.05,
        'Alta': 1.08,
        'Molt Difícil': 1.12,
        'Molt Alta': 1.15
    };
    
    const finalTime = baseTime * engineFactor * aeroFactor * chassisFactor * 
                     (difficultyMultiplier[track.difficulty] || 1.0);
    
    return finalTime;
}

/**
 * Simula incidents aleatoris durant la cursa
 * @param {number} lapProgress - Progrés 0-100
 * @param {string} trackId - ID del circuit
 * @returns {object|null} Incident o null
 */
function checkForIncidents(lapProgress, trackId) {
    const track = realisticTracks[trackId];
    const random = Math.random();
    
    // 2% de probabilitat d'incident per volta
    if (random > 0.98) {
        const incidents = [
            { type: 'lockup', message: '🔥 Bloquejo de rodes!', timeLoss: 0.5 },
            { type: 'offtrack', message: '🌪️ Fora de pista!', timeLoss: 1.2 },
            { type: 'mistake', message: '⚠️ Petit error!', timeLoss: 0.3 },
            { type: 'perfect', message: '✨ Sector perfecte!', timeGain: 0.2 }
        ];
        
        return incidents[Math.floor(Math.random() * incidents.length)];
    }
    
    return null;
}

/**
 * Exportar per usar en altres fitxers
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { realisticTracks, getCurrentSector, calculateLapTime, checkForIncidents };
}

/**
 * Renderitza el traçat realista del circuit amb totes les seves característiques
 * @param {string} trackId - ID del circuit
 * @param {HTMLElement} container - Element contenidor del SVG
 */
function renderRealisticTrack(trackId, container) {
    const track = realisticTracks[trackId];
    if (!track || !track.path) {
        console.warn('Traçat no disponible per:', trackId);
        return;
    }
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'track-svg');
    svg.setAttribute('viewBox', '0 0 1000 700');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.background = '#e8f5e9'; // Fons verd clar (gespa)
    
    // Defs per gradients i patrons
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Gradient per l'asfalt
    const trackGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    trackGradient.setAttribute('id', 'track-gradient');
    trackGradient.innerHTML = `
        <stop offset="0%" style="stop-color:#3a3a3a; stop-opacity:1" />
        <stop offset="50%" style="stop-color:#2d2d2d; stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1f1f1f; stop-opacity:1" />
    `;
    defs.appendChild(trackGradient);
    
    // Gradient per al túnel
    const tunnelGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    tunnelGradient.setAttribute('id', 'tunnel-gradient');
    tunnelGradient.innerHTML = `
        <stop offset="0%" style="stop-color:#1a1a1a; stop-opacity:0.9" />
        <stop offset="100%" style="stop-color:#050505; stop-opacity:1" />
    `;
    defs.appendChild(tunnelGradient);
    
    svg.appendChild(defs);
    
    // === DECORACIONS DE FONS (arbres, edificis, turons) ===
    if (track.decorations) {
        const dec = track.decorations;
        
        // Turons (Portimão)
        if (dec.hills) {
            dec.hills.forEach(hill => {
                const hillPath = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                hillPath.setAttribute('cx', hill.x + hill.w / 2);
                hillPath.setAttribute('cy', hill.y + hill.h / 2);
                hillPath.setAttribute('rx', hill.w / 2);
                hillPath.setAttribute('ry', hill.h / 2);
                hillPath.setAttribute('fill', hill.color);
                hillPath.setAttribute('opacity', '0.4');
                svg.appendChild(hillPath);
            });
        }
        
        // Edificis (Mònaco, Interlagos)
        if (dec.buildings) {
            dec.buildings.forEach(building => {
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', building.x);
                rect.setAttribute('y', building.y);
                rect.setAttribute('width', building.w);
                rect.setAttribute('height', building.h);
                rect.setAttribute('fill', building.color);
                rect.setAttribute('stroke', '#666');
                rect.setAttribute('stroke-width', '1');
                rect.setAttribute('opacity', '0.7');
                svg.appendChild(rect);
                
                // Finestres
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < Math.floor(building.h / 15); j++) {
                        const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        window.setAttribute('x', building.x + 5 + i * 12);
                        window.setAttribute('y', building.y + 8 + j * 15);
                        window.setAttribute('width', '6');
                        window.setAttribute('height', '8');
                        window.setAttribute('fill', '#ffeb3b');
                        window.setAttribute('opacity', '0.6');
                        svg.appendChild(window);
                    }
                }
            });
        }
        
        // Arbres (Spa, Monza, Portimão, Interlagos)
        if (dec.trees || dec.forest) {
            const treeList = dec.trees || dec.forest || [];
            treeList.forEach(tree => {
                // Tronc
                const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                trunk.setAttribute('x', tree.x - 2);
                trunk.setAttribute('y', tree.y);
                trunk.setAttribute('width', '4');
                trunk.setAttribute('height', tree.size * 0.4);
                trunk.setAttribute('fill', '#3e2723');
                svg.appendChild(trunk);
                
                // Copa de l'arbre
                const foliage = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                foliage.setAttribute('cx', tree.x);
                foliage.setAttribute('cy', tree.y - tree.size * 0.2);
                foliage.setAttribute('r', tree.size);
                foliage.setAttribute('fill', tree.color);
                foliage.setAttribute('opacity', '0.8');
                svg.appendChild(foliage);
            });
        }
        
        // Iots (Mònaco)
        if (dec.harbor) {
            dec.harbor.forEach(yacht => {
                const yachtGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                
                // Casc
                const hull = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                hull.setAttribute('cx', yacht.x);
                hull.setAttribute('cy', yacht.y);
                hull.setAttribute('rx', '15');
                hull.setAttribute('ry', '8');
                hull.setAttribute('fill', yacht.color);
                hull.setAttribute('stroke', '#888');
                hull.setAttribute('stroke-width', '1');
                yachtGroup.appendChild(hull);
                
                // Pal
                const mast = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                mast.setAttribute('x1', yacht.x);
                mast.setAttribute('y1', yacht.y);
                mast.setAttribute('x2', yacht.x);
                mast.setAttribute('y2', yacht.y - 20);
                mast.setAttribute('stroke', '#666');
                mast.setAttribute('stroke-width', '2');
                yachtGroup.appendChild(mast);
                
                svg.appendChild(yachtGroup);
            });
        }
    }
    
    // === ZONA DE FORA DE PISTA (verd fosc) ===
    const offTrack = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    offTrack.setAttribute('d', track.path);
    offTrack.setAttribute('fill', 'none');
    offTrack.setAttribute('stroke', '#1b5e20');
    offTrack.setAttribute('stroke-width', '110');
    offTrack.setAttribute('opacity', '0.5');
    svg.appendChild(offTrack);
    
    // === VORERA EXTERIOR (vermella i blanca) ===
    const outerKerb = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outerKerb.setAttribute('d', track.path);
    outerKerb.setAttribute('fill', 'none');
    outerKerb.setAttribute('stroke', '#e53935');
    outerKerb.setAttribute('stroke-width', '75');
    svg.appendChild(outerKerb);
    
    // Patró de voreres (ratlles blanques)
    const kerbPattern = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    kerbPattern.setAttribute('d', track.path);
    kerbPattern.setAttribute('fill', 'none');
    kerbPattern.setAttribute('stroke', '#fff');
    kerbPattern.setAttribute('stroke-width', '75');
    kerbPattern.setAttribute('stroke-dasharray', '15,15');
    kerbPattern.setAttribute('opacity', '0.4');
    svg.appendChild(kerbPattern);
    
    // === ASFALT PRINCIPAL ===
    const mainTrack = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mainTrack.setAttribute('d', track.path);
    mainTrack.setAttribute('fill', 'none');
    mainTrack.setAttribute('stroke', 'url(#track-gradient)');
    mainTrack.setAttribute('stroke-width', '62');
    svg.appendChild(mainTrack);
    
    // === TÚNEL (Mònaco) ===
    if (track.decorations && track.decorations.tunnel) {
        const tunnel = track.decorations.tunnel;
        
        // Zona fosca del túnel
        const tunnelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        tunnelBg.setAttribute('x', Math.min(tunnel.start.x, tunnel.end.x) - 50);
        tunnelBg.setAttribute('y', Math.min(tunnel.start.y, tunnel.end.y) - 40);
        tunnelBg.setAttribute('width', Math.abs(tunnel.end.x - tunnel.start.x) + 100);
        tunnelBg.setAttribute('height', tunnel.width);
        tunnelBg.setAttribute('fill', 'url(#tunnel-gradient)');
        tunnelBg.setAttribute('rx', '10');
        svg.appendChild(tunnelBg);
        
        // Llums del túnel
        tunnel.lights.forEach(light => {
            const bulb = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            bulb.setAttribute('cx', light.x);
            bulb.setAttribute('cy', light.y - 30);
            bulb.setAttribute('r', '4');
            bulb.setAttribute('fill', '#ffd700');
            bulb.setAttribute('opacity', '0.9');
            svg.appendChild(bulb);
            
            // Halo de llum
            const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            glow.setAttribute('cx', light.x);
            glow.setAttribute('cy', light.y - 30);
            glow.setAttribute('r', '12');
            glow.setAttribute('fill', '#ffeb3b');
            glow.setAttribute('opacity', '0.3');
            svg.appendChild(glow);
        });
        
        // Text TÚNEL
        const tunnelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tunnelText.setAttribute('x', (tunnel.start.x + tunnel.end.x) / 2);
        tunnelText.setAttribute('y', (tunnel.start.y + tunnel.end.y) / 2 + 50);
        tunnelText.setAttribute('fill', '#888');
        tunnelText.setAttribute('font-size', '16');
        tunnelText.setAttribute('font-weight', 'bold');
        tunnelText.setAttribute('text-anchor', 'middle');
        tunnelText.textContent = '🚇 TUNNEL';
        svg.appendChild(tunnelText);
    }
    
    // === PATH INVISIBLE PER SEGUIMENT ===
    const trackPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    trackPath.setAttribute('id', 'track-path');
    trackPath.setAttribute('d', track.path);
    trackPath.setAttribute('fill', 'none');
    trackPath.setAttribute('stroke', 'transparent');
    trackPath.setAttribute('stroke-width', '62');
    svg.appendChild(trackPath);
    
    // === LÍNIA DE SORTIDA/META ===
    const pathEl = trackPath;
    const pathLength = pathEl.getTotalLength();
    const startPoint = pathEl.getPointAtLength(0);
    
    // Patró escacat de sortida
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
            if ((i + j) % 2 === 0) {
                const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                square.setAttribute('x', startPoint.x - 30 + i * 10);
                square.setAttribute('y', startPoint.y - 30 + j * 20);
                square.setAttribute('width', '10');
                square.setAttribute('height', '20');
                square.setAttribute('fill', i % 2 === 0 ? '#000' : '#fff');
                svg.appendChild(square);
            }
        }
    }
    
    // === GRADERIES ===
    if (track.decorations && track.decorations.grandstands) {
        track.decorations.grandstands.forEach(stand => {
            const grandstand = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            grandstand.setAttribute('x', stand.x);
            grandstand.setAttribute('y', stand.y);
            grandstand.setAttribute('width', stand.w);
            grandstand.setAttribute('height', stand.h);
            grandstand.setAttribute('fill', stand.color);
            grandstand.setAttribute('stroke', '#333');
            grandstand.setAttribute('stroke-width', '2');
            grandstand.setAttribute('opacity', '0.7');
            svg.appendChild(grandstand);
            
            // Seients (ratlles)
            for (let i = 0; i < 5; i++) {
                const seats = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                seats.setAttribute('x1', stand.x);
                seats.setAttribute('y1', stand.y + (i + 1) * (stand.h / 6));
                seats.setAttribute('x2', stand.x + stand.w);
                seats.setAttribute('y2', stand.y + (i + 1) * (stand.h / 6));
                seats.setAttribute('stroke', '#222');
                seats.setAttribute('stroke-width', '1');
                svg.appendChild(seats);
            }
        });
    }
    
    // === ZONA DE BOXES ===
    if (track.pitLane) {
        const pitEntry = pathEl.getPointAtLength(pathLength * track.pitLane.entry);
        const pitExit = pathEl.getPointAtLength(pathLength * track.pitLane.exit);
        
        // Línia d'entrada
        const pitEntryLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        pitEntryLine.setAttribute('x1', pitEntry.x - 20);
        pitEntryLine.setAttribute('y1', pitEntry.y - 40);
        pitEntryLine.setAttribute('x2', pitEntry.x - 20);
        pitEntryLine.setAttribute('y2', pitEntry.y + 40);
        pitEntryLine.setAttribute('stroke', '#ffd700');
        pitEntryLine.setAttribute('stroke-width', '4');
        pitEntryLine.setAttribute('stroke-dasharray', '8,8');
        svg.appendChild(pitEntryLine);
        
        const pitInText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        pitInText.setAttribute('x', pitEntry.x - 30);
        pitInText.setAttribute('y', pitEntry.y - 50);
        pitInText.setAttribute('fill', '#ffd700');
        pitInText.setAttribute('font-size', '14');
        pitInText.setAttribute('font-weight', 'bold');
        pitInText.textContent = 'PIT IN';
        svg.appendChild(pitInText);
        
        // Línia de sortida
        const pitExitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        pitExitLine.setAttribute('x1', pitExit.x + 20);
        pitExitLine.setAttribute('y1', pitExit.y - 40);
        pitExitLine.setAttribute('x2', pitExit.x + 20);
        pitExitLine.setAttribute('y2', pitExit.y + 40);
        pitExitLine.setAttribute('stroke', '#ffd700');
        pitExitLine.setAttribute('stroke-width', '4');
        pitExitLine.setAttribute('stroke-dasharray', '8,8');
        svg.appendChild(pitExitLine);
        
        const pitOutText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        pitOutText.setAttribute('x', pitExit.x + 25);
        pitOutText.setAttribute('y', pitExit.y - 50);
        pitOutText.setAttribute('fill', '#ffd700');
        pitOutText.setAttribute('font-size', '14');
        pitOutText.setAttribute('font-weight', 'bold');
        pitOutText.textContent = 'PIT OUT';
        svg.appendChild(pitOutText);
    }
    
    // === SECTORS (marques verdes) ===
    if (track.sectors) {
        track.sectors.forEach((sector, index) => {
            if (index < track.sectors.length - 1) {
                const sectorPoint = pathEl.getPointAtLength(pathLength * sector.end);
                
                const sectorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                sectorLine.setAttribute('x1', sectorPoint.x - 30);
                sectorLine.setAttribute('y1', sectorPoint.y - 30);
                sectorLine.setAttribute('x2', sectorPoint.x + 30);
                sectorLine.setAttribute('y2', sectorPoint.y + 30);
                sectorLine.setAttribute('stroke', '#0f0');
                sectorLine.setAttribute('stroke-width', '3');
                sectorLine.setAttribute('opacity', '0.7');
                svg.appendChild(sectorLine);
            }
        });
    }
    
    // Netejar contenidor i afegir SVG
    container.innerHTML = '';
    container.appendChild(svg);
}