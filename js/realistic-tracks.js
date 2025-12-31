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
        
        // Traçat SVG ultra-realista
        path: 'M150,300 L250,300 C280,300 290,320 290,340 L290,380 C290,400 310,410 330,410 L450,410 C470,410 480,395 480,380 L480,340 Q480,280 540,270 L620,270 Q670,270 680,310 L680,360 C680,380 695,390 710,380 L760,340 Q790,310 790,270 L790,230 Q790,200 765,190 L690,160 Q650,145 640,120 L620,80 Q600,50 560,50 L420,50 Q380,50 360,80 L340,120 Q330,145 290,160 L220,190 Q190,200 180,230 L170,270 Q165,290 150,300',
        
        // Sectors del circuit
        sectors: [
            {
                name: 'Sector 1',
                start: 0,
                end: 0.33,
                corners: ['Sainte Dévote', 'Massenet', 'Casino', 'Mirabeau'],
                difficulty: 'Alta',
                characteristics: 'Corbes lentes i tècniques'
            },
            {
                name: 'Sector 2',
                start: 0.33,
                end: 0.66,
                corners: ['Portier', 'Túnel', 'Nouvelle Chicane'],
                difficulty: 'Mitjana',
                characteristics: 'Recta del túnel amb frenada brutal'
            },
            {
                name: 'Sector 3',
                start: 0.66,
                end: 1.0,
                corners: ['Tabac', 'Piscine', 'La Rascasse', 'Antony Noghès'],
                difficulty: 'Molt Alta',
                characteristics: 'Chicanes ràpides i corbes finals tancades'
            }
        ],
        
        // Punts clau del traçat (percentatge 0-1)
        keyPoints: {
            'sainteDevote': 0.05,
            'casino': 0.15,
            'mirabeau': 0.25,
            'tunnel': 0.45,
            'nouvelleChicane': 0.55,
            'tabac': 0.68,
            'piscine': 0.78,
            'rascasse': 0.88,
            'anthonyNoghes': 0.95
        }
    },

    spa: {
        name: 'Circuit de Spa-Francorchamps',
        flag: '🇧🇪',
        country: 'Bèlgica',
        length: 7.004, // km
        laps: 44,
        lapRecord: '1:46.286',
        difficulty: 'Difícil',
        
        // Traçat realista de Spa amb Eau Rouge i Kemmel
        path: 'M100,300 L200,300 Q250,300 270,270 L300,220 Q320,180 360,170 L500,170 L700,170 Q750,170 770,200 L800,250 Q820,280 850,280 L900,280 Q930,280 940,310 L950,350 Q955,380 930,400 L850,450 Q800,480 760,480 L500,480 Q450,480 420,450 L350,380 Q320,350 300,350 L200,350 Q150,350 130,320 L100,300',
        
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
        
        // Traçat de Monza - El Temple de la Velocitat
        path: 'M100,300 L900,300 Q950,300 970,330 L990,370 Q1000,400 970,420 L920,450 Q890,470 850,470 L200,470 Q150,470 130,440 L110,400 Q100,370 120,350 L100,300',
        
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
        
        // Traçat de Portimão - Pujades i baixades
        path: 'M150,350 Q200,300 250,280 L350,260 Q400,250 430,280 L480,330 Q520,370 570,370 L670,370 Q720,370 750,340 L800,290 Q830,260 860,270 L900,290 Q920,310 920,340 L920,380 Q920,410 890,430 L830,460 Q780,480 730,480 L500,480 Q450,480 420,450 L350,400 Q300,370 250,380 L180,400 Q150,410 140,380 L150,350',
        
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
        
        // Traçat d'Interlagos - Contra-rellotge
        path: 'M200,300 Q250,280 300,300 L400,340 Q450,360 500,350 L650,320 Q700,310 730,340 L770,390 Q790,420 770,450 L730,490 Q700,520 650,520 L400,520 Q350,520 320,490 L270,440 Q240,400 230,360 L200,300',
        
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