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
        
        // TRAÇAT ULTRA-REALISTA DE MONZA - Temple de la Velocitat (extret del SVG real)
        // Primera Variante (chicane) → Curva Grande → Seconda Variante → Lesmo 1 → Lesmo 2 → 
        // Serraglio → Variante Ascari (triple chicane) → Curva Parabolica (llarga i ràpida)
        path: 'm 608.22327,577.86535 c -1.04417,-1.04415 -20.62582,-3.37166 -28.86077,-3.43042 -3.80858,-0.0272 -7.20812,-0.50801 -7.55452,-1.06851 -0.34641,-0.5605 -1.65462,-0.97944 -2.90714,-0.93098 -6.89615,0.26681 -34.539,-1.57764 -35.55074,-2.37209 -1.39304,-1.09387 -30.12758,-3.19721 -31.56254,-2.31036 -0.53516,0.33075 -2.0882,-0.12933 -3.45119,-1.02239 -1.82737,-1.19734 -6.36776,-1.77927 -17.28954,-2.21595 -8.14627,-0.3257 -17.83855,-1.08572 -21.53842,-1.68893 -3.69987,-0.6032 -13.24709,-1.48358 -21.21604,-1.9564 -7.96895,-0.47282 -20.07762,-1.55662 -26.90815,-2.40846 -6.83053,-0.85184 -16.64942,-1.57587 -21.81975,-1.60897 -5.17034,-0.0331 -9.75089,-0.40946 -10.17902,-0.83637 -0.42812,-0.4269 -2.48504,-0.85815 -4.57093,-0.95832 -2.08589,-0.10016 -11.01116,-0.50627 -19.83392,-0.90245 -8.82277,-0.39618 -16.50712,-1.07708 -17.07633,-1.51311 -1.19931,-0.91871 -9.09814,-1.98295 -16.55886,-2.23102 -6.61079,-0.21982 -7.76197,-0.65937 -7.76197,-2.96373 0,-1.03338 -2.42009,-3.99591 -5.37797,-6.58339 -3.97069,-3.47346 -6.57087,-4.8834 -9.93673,-5.38814 -5.73969,-0.86072 -19.35315,0.33032 -23.47529,2.05385 -12.77739,5.34243 -12.03566,5.24419 -41.33356,5.47456 -19.37493,0.15235 -28.51543,-0.14208 -30.01294,-0.96676 -1.18431,-0.6522 -4.01616,-1.26692 -6.293,-1.36603 -8.03288,-0.34968 -15.19627,-1.79837 -15.72664,-3.1805 -0.29492,-0.76853 -1.61742,-1.39734 -2.93889,-1.39734 -1.32147,0 -3.02269,-0.62002 -3.7805,-1.37783 -0.75781,-0.7578 -2.65395,-1.69812 -4.21364,-2.08957 -1.55969,-0.39146 -2.83581,-1.12434 -2.83581,-1.62862 0,-0.50428 -2.14315,-2.17284 -4.76256,-3.70792 -5.77598,-3.38494 -7.50909,-5.0596 -10.74236,-10.37998 -1.37105,-2.25609 -3.1005,-4.4744 -3.84323,-4.9296 -0.74274,-0.45519 -1.35042,-1.54111 -1.35042,-2.41314 0,-0.87204 -1.63002,-3.57475 -3.62225,-6.00601 -1.99224,-2.43126 -3.62226,-5.16004 -3.62226,-6.06393 0,-0.90391 -0.46443,-1.9305 -1.03207,-2.28132 -1.87838,-1.1609 -6.06766,-11.30451 -6.72267,-16.27777 -0.35435,-2.69048 -1.08309,-5.16299 -1.61941,-5.49446 -0.53632,-0.33147 -0.99963,-4.41735 -1.02958,-9.07975 -0.0299,-4.6624 -0.77188,-11.96997 -1.64876,-16.23905 -0.87687,-4.26908 -2.03985,-16.61061 -2.5844,-27.42561 -0.54455,-10.81501 -1.39776,-20.59509 -1.89603,-21.73351 -0.49827,-1.13842 -1.20977,-10.9185 -1.58112,-21.7335 -1.16874,-34.0383 -2.71288,-50.19405 -4.79747,-50.19405 -0.51869,0 -1.37648,-1.13995 -1.9062,-2.5332 -0.52972,-1.39326 -2.25694,-3.37256 -3.83829,-4.39845 -6.11464,-3.96684 -10.67129,-10.66914 -10.67129,-15.6962 0,-2.31895 -7.445392,-26.5129 -9.289832,-30.18749 -0.437946,-0.8725 -1.132236,-3.11604 -1.542868,-4.98563 -0.410632,-1.86959 -1.398417,-4.64862 -2.195078,-6.1756 -0.796661,-1.52699 -1.451345,-3.53433 -1.454851,-4.46075 -0.0035,-0.92642 -0.704954,-2.26417 -1.55877,-2.97277 -0.853816,-0.70861 -1.552393,-2.80434 -1.552393,-4.65718 0,-1.85285 -0.638182,-3.89846 -1.418182,-4.5458 -0.78,-0.64734 -1.671969,-3.0691 -1.982152,-5.38169 -0.310183,-2.31259 -1.313243,-5.03265 -2.229021,-6.04457 -2.049008,-2.26413 -1.120831,-5.10765 1.862525,-5.70595 1.961922,-0.39345 15.406203,-1.44201 25.500332,-1.98884 1.99224,-0.10793 4.1302,-0.51371 4.75103,-0.90174 0.62082,-0.38803 6.90802,-0.95202 13.97154,-1.2533 7.06352,-0.30129 15.3236,-0.95435 18.35574,-1.45125 5.24305,-0.85922 5.55898,-0.78243 6.45277,1.56841 0.51689,1.35953 1.64537,2.74262 2.50773,3.07354 0.86235,0.33092 1.56792,1.65911 1.56792,2.95154 0,1.29243 0.69858,2.92964 1.55239,3.63825 0.85382,0.7086 1.5524,2.09152 1.5524,3.07315 0,0.98163 0.93143,2.85874 2.06985,4.17135 1.13843,1.31261 2.06986,2.97507 2.06986,3.69436 0,0.71929 0.38668,1.46304 0.85928,1.65277 0.47261,0.18974 2.35821,3.37215 4.19022,7.07202 4.22005,8.52263 5.92137,11.50033 7.02779,12.30022 0.48415,0.35001 2.18558,3.19784 3.78096,6.3285 1.59538,3.13066 3.26837,6.39068 3.71775,7.2445 0.44939,0.85381 1.93367,3.87842 3.29841,6.72134 2.50288,5.21379 6.01946,10.93453 7.33252,11.92844 0.39129,0.29619 1.20962,1.69334 1.8185,3.10479 2.23779,5.18735 7.56978,13.97416 8.96762,14.7781 0.79147,0.45519 1.43904,1.30557 1.43904,1.88973 0,0.58416 2.21216,3.93269 4.91591,7.44117 2.70375,3.50848 6.00159,8.01386 7.32853,10.01195 1.32694,1.99808 3.75134,5.03004 5.38757,6.73767 1.63622,1.70764 5.557,5.77255 8.71287,9.03313 3.15585,3.26059 5.73791,6.20045 5.73791,6.53301 0,0.67647 12.46254,15.02637 19.30249,22.22572 2.44243,2.57076 5.61653,6.26773 7.05353,8.21549 1.437,1.94775 2.97051,3.80299 3.40779,4.12276 0.43728,0.31978 2.78467,2.99461 5.21644,5.94408 2.43177,2.94947 7.54827,8.63427 11.36999,12.63291 3.82172,3.99862 9.04433,9.88932 11.60578,13.09045 2.56144,3.20113 8.03363,9.36454 12.16041,13.69648 4.12678,4.33192 7.50323,8.25311 7.50323,8.71375 0,0.46062 0.39038,0.8375 0.86751,0.8375 0.47712,0 3.84068,3.84217 7.47457,8.53816 3.63389,4.69599 9.76356,11.55489 13.6215,15.242 3.85794,3.6871 7.01443,7.24223 7.01443,7.90027 0,1.03991 1.61919,2.60098 10.47036,10.09447 3.39563,2.87479 13.75023,3.68411 28.33947,2.21505 6.15898,-0.62017 6.2433,-0.59208 10.34929,3.44688 2.27684,2.23968 6.05201,6.1747 8.38925,8.74448 5.23074,5.75115 9.27304,7.91572 16.24595,8.69933 2.95775,0.33239 5.91058,1.02217 6.56182,1.53283 1.14212,0.89556 4.82136,1.41439 16.92717,2.38698 3.13066,0.25152 9.185,1.15596 13.45408,2.00986 4.26908,0.85391 10.67903,1.57104 14.24431,1.59363 3.56529,0.0226 7.29104,0.49698 8.27943,1.05418 0.9884,0.55722 9.01571,1.44508 17.83848,1.97305 8.82277,0.52796 18.13713,1.44335 20.69858,2.03418 2.56145,0.59083 10.71151,1.39528 18.11125,1.78767 7.39975,0.39239 14.02408,1.16379 14.72074,1.71422 0.69667,0.55042 8.61388,1.24272 17.59379,1.53844 8.97992,0.29571 16.8681,0.9702 17.52929,1.49885 0.66119,0.52867 8.57839,1.35855 17.59379,1.84419 9.01539,0.48564 18.72022,1.42026 21.56628,2.07695 2.84605,0.65669 10.5304,1.64401 17.07632,2.19406 6.54593,0.55005 13.5317,1.20658 15.52393,1.45898 1.99224,0.25239 9.44373,0.92417 16.55887,1.49284 7.11513,0.56867 15.96377,1.49425 19.66364,2.05686 3.69987,0.5626 12.0828,1.35146 18.62872,1.753 9.37615,0.57515 12.48072,1.15737 14.6304,2.74372 2.53728,1.87238 2.62849,2.20573 1.30004,4.75182 -0.78577,1.506 -1.43155,3.47911 -1.43506,4.38469 -0.007,1.8109 -8.50915,11.29011 -10.12639,11.29011 -0.55592,0 -1.59052,0.69857 -2.29913,1.55239 -0.7086,0.85382 -2.24254,1.55239 -3.40874,1.55239 -1.16621,0 -2.90776,0.71257 -3.87011,1.58348 -0.96235,0.87091 -3.32761,1.82743 -5.25613,2.12561 -11.35345,1.75535 -86.8267,4.21687 -88.16801,2.87554 z',
        
        // ViewBox del SVG original
        viewBox: { width: 800, height: 800 },
        
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
         path: 'M 478,198.64 C 429.93,203.47 379,196.06 332.5,208.73 306.06,215.78 282.43,231.27 259,243.36 216.29,264.43 173.51,285.29 130,306.22 94.6,319.66 59.11,333.18 23.5,344.52 10.49,349.98 -2.13,359.02 -6.29,373.22 -15.46,406.5 28.58,401.55 33.84,420.5 36.32,429.44 30.14,442.32 29.38,449.5 27.47,474.13 31.7,504.71 54.57,518.74 82.9,535.23 122.2,533.5 156,533.5 c 70.9,0 142.21,2.07 213,-1.39 28.22,-1.38 70.51,8.68 96,-5.24 17.62,-9.63 16.9,-28.63 15.25,-45.88 -2.38,-24.94 -3.42,-51.5 -23.01,-69.84 -17.27,-16.19 -41.01,-23.15 -62.75,-31.31 C 353.6,371.96 308.88,359.83 267,341.64 c -22.77,-10.5 -34.14,-46.29 -18.73,-67.99 11.8,-16.62 39.28,-26.52 57.73,-33.48 6.92,-2.61 17.39,-8.69 23.07,-0.8 4.84,6.71 -1.97,17.02 -3.99,23.78 -5.53,18.44 0.21,37.78 21.42,41.5 4.76,0.84 10.33,0.89 15,-0.46 15.91,-4.6 22.5,-20.42 29.79,-33.68 8.7,-15.7 17.72,-28.7 33.2,-38.37 6.09,-3.8 24.28,-17.73 31.08,-10.35 5.97,6.48 -2.09,16.08 -5.66,21.71 -11.49,18.14 -26.27,34.76 -28.16,57 -4.74,55.88 52.73,66.8 94.24,78.63 13.41,3.82 34.1,14.78 47.99,10.39 9.38,-2.96 13.3,-12.86 15.85,-21.52 5.91,-20.06 7.95,-52.96 -1.23,-72 C 559.3,247.75 515.69,189.39 478,198.64 m 13.5,10.29 c 60.86,-6.89 106.15,57.65 125.07,107.57 6.05,15.97 3.01,40.61 -0.59,57 -1.31,5.93 -3.64,15.71 -10.64,17.21 -11.93,2.55 -33.39,-8.13 -44.86,-11.71 -39.86,-12.44 -87.38,-19.79 -80.74,-72.99 2.35,-18.82 20.98,-38.2 30.74,-54 7.07,-11.44 6.73,-24.23 -7.02,-30.79 -9.64,-4.61 -21.8,3.21 -29.99,7.87 -27.68,15.74 -37.31,35.99 -53.43,61.92 -5.77,9.28 -14.43,16.97 -26.07,14.2 -32.74,-7.79 2.59,-41.72 -7.85,-59.14 -15.86,-26.47 -64.29,6.55 -82.15,16.87 -6.79,3.92 -13.65,8.12 -18.3,14.59 -17.92,24.99 -8.85,67.19 16.8,82.58 56.35,33.81 132.09,34.47 186,73.08 23.39,16.75 27,47.02 27,73.82 0.001,11.45 1.48,24.61 -10.52,30.82 -9.47,4.89 -22.68,3.68 -32.98,3.68 h -63 c -67.99,0 -135.93,1.5 -204,1.5 -33.99,0 -71.62,2.99 -98.74,-21.92 -16.34,-14.9 -22.33,-40.88 -19.28,-62.42 1.43,-9.98 7.83,-21.46 5.39,-31.5 -4.82,-19.89 -44.59,-21.81 -38.04,-43.5 4.14,-13.67 18.97,-20.57 30.48,-26.67 24.37,-12.11 48.11,-26.35 72.06,-40.23 l 108,-62.13 c 22.57,-12.94 45.12,-28.37 70.5,-35.14 50.46,-13.45 104.67,-4.49 156,-10.3 z',
        
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
