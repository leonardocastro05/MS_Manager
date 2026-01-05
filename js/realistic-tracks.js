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
        
        // Traçat SVG ultra-realista seguint el recorregut real de Mònaco
        // Comença a Sainte Dévote i segueix tot el traçat
        path: 'M 100,400 L 120,400 Q 140,400 145,385 L 155,350 Q 160,330 180,325 L 250,315 Q 280,310 295,290 L 315,255 Q 330,230 360,225 L 420,220 Q 450,220 465,240 L 480,270 Q 490,290 510,295 L 580,305 Q 610,310 625,290 L 645,255 Q 660,230 690,225 L 750,220 Q 780,220 790,245 L 800,280 Q 805,310 785,330 L 760,355 Q 740,370 710,370 L 650,370 Q 620,370 610,390 L 605,410 Q 600,430 580,435 L 520,445 Q 490,450 480,470 L 470,495 Q 465,515 445,520 L 380,530 Q 350,535 340,555 L 330,580 Q 325,600 305,605 L 240,615 Q 210,620 200,600 L 185,570 Q 175,545 155,540 L 110,530 Q 90,525 85,505 L 75,470 Q 70,450 85,435 L 100,420 L 100,400 Z',
        
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
    svg.setAttribute('viewBox', '0 0 900 700');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    
    // Defs per gradients i patrons
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Gradient per l'asfalt
    const trackGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    trackGradient.setAttribute('id', 'track-gradient');
    trackGradient.setAttribute('x1', '0%');
    trackGradient.setAttribute('y1', '0%');
    trackGradient.setAttribute('x2', '100%');
    trackGradient.setAttribute('y2', '100%');
    trackGradient.innerHTML = `
        <stop offset="0%" style="stop-color:#444; stop-opacity:1" />
        <stop offset="50%" style="stop-color:#333; stop-opacity:1" />
        <stop offset="100%" style="stop-color:#222; stop-opacity:1" />
    `;
    defs.appendChild(trackGradient);
    
    // Gradient per al túnel (més fosc)
    const tunnelGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    tunnelGradient.setAttribute('id', 'tunnel-gradient');
    tunnelGradient.innerHTML = `
        <stop offset="0%" style="stop-color:#1a1a1a; stop-opacity:1" />
        <stop offset="100%" style="stop-color:#0a0a0a; stop-opacity:1" />
    `;
    defs.appendChild(tunnelGradient);
    
    svg.appendChild(defs);
    
    // === ZONA DE FORA DE PISTA (verd) ===
    const offTrack = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    offTrack.setAttribute('d', track.path);
    offTrack.setAttribute('fill', 'none');
    offTrack.setAttribute('stroke', '#1a4d1a');
    offTrack.setAttribute('stroke-width', '100');
    offTrack.setAttribute('opacity', '0.3');
    svg.appendChild(offTrack);
    
    // === VORERA EXTERIOR (vermella i blanca) ===
    const outerKerb = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    outerKerb.setAttribute('d', track.path);
    outerKerb.setAttribute('fill', 'none');
    outerKerb.setAttribute('stroke', '#cc0000');
    outerKerb.setAttribute('stroke-width', '72');
    svg.appendChild(outerKerb);
    
    // === ASFALT PRINCIPAL ===
    const mainTrack = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mainTrack.setAttribute('d', track.path);
    mainTrack.setAttribute('fill', 'none');
    mainTrack.setAttribute('stroke', 'url(#track-gradient)');
    mainTrack.setAttribute('stroke-width', '60');
    svg.appendChild(mainTrack);
    
    // === TÚNEL (si existeix) ===
    if (track.specialFeatures) {
        const tunnel = track.specialFeatures.find(f => f.type === 'tunnel');
        if (tunnel) {
            // Crear path només per al túnel
            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            pathEl.setAttribute('id', 'track-path');
            pathEl.setAttribute('d', track.path);
            pathEl.setAttribute('fill', 'none');
            pathEl.setAttribute('stroke', 'transparent');
            pathEl.setAttribute('stroke-width', '60');
            svg.appendChild(pathEl);
            
            // Obtenir el path per calcular posicions
            const pathLength = pathEl.getTotalLength();
            const tunnelStart = pathEl.getPointAtLength(pathLength * tunnel.start);
            const tunnelEnd = pathEl.getPointAtLength(pathLength * tunnel.end);
            
            // Dibuixar zona del túnel més fosca
            const tunnelOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            tunnelOverlay.setAttribute('cx', (tunnelStart.x + tunnelEnd.x) / 2);
            tunnelOverlay.setAttribute('cy', (tunnelStart.y + tunnelEnd.y) / 2);
            tunnelOverlay.setAttribute('rx', '100');
            tunnelOverlay.setAttribute('ry', '80');
            tunnelOverlay.setAttribute('fill', 'rgba(0,0,0,0.5)');
            svg.appendChild(tunnelOverlay);
            
            // Text del túnel
            const tunnelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            tunnelText.setAttribute('x', (tunnelStart.x + tunnelEnd.x) / 2);
            tunnelText.setAttribute('y', (tunnelStart.y + tunnelEnd.y) / 2);
            tunnelText.setAttribute('fill', '#888');
            tunnelText.setAttribute('font-size', '14');
            tunnelText.setAttribute('text-anchor', 'middle');
            tunnelText.setAttribute('font-family', 'Arial, sans-serif');
            tunnelText.textContent = '🚇 TÚNEL';
            svg.appendChild(tunnelText);
        }
    }
    
    // === PATH INVISIBLE PER SEGUIMENT ===
    const trackPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    trackPath.setAttribute('id', 'track-path');
    trackPath.setAttribute('d', track.path);
    trackPath.setAttribute('fill', 'none');
    trackPath.setAttribute('stroke', 'transparent');
    trackPath.setAttribute('stroke-width', '60');
    svg.appendChild(trackPath);
    
    // === LÍNIA DE SORTIDA/META ===
    const pathEl = document.getElementById('track-path') || trackPath;
    const pathLength = pathEl.getTotalLength();
    const startPoint = pathEl.getPointAtLength(0);
    
    const startLine = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    startLine.setAttribute('x', startPoint.x - 20);
    startLine.setAttribute('y', startPoint.y - 30);
    startLine.setAttribute('width', '40');
    startLine.setAttribute('height', '60');
    startLine.setAttribute('fill', '#fff');
    startLine.setAttribute('opacity', '0.8');
    svg.appendChild(startLine);
    
    // Patró d'escacs
    const checkeredRect1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    checkeredRect1.setAttribute('x', startPoint.x - 20);
    checkeredRect1.setAttribute('y', startPoint.y - 30);
    checkeredRect1.setAttribute('width', '20');
    checkeredRect1.setAttribute('height', '60');
    checkeredRect1.setAttribute('fill', '#000');
    svg.appendChild(checkeredRect1);
    
    // === ZONA DE BOXES ===
    if (track.pitLane) {
        const pitEntry = pathEl.getPointAtLength(pathLength * track.pitLane.entry);
        const pitExit = pathEl.getPointAtLength(pathLength * track.pitLane.exit);
        
        // Línia d'entrada a boxes
        const pitEntryLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        pitEntryLine.setAttribute('x1', pitEntry.x - 15);
        pitEntryLine.setAttribute('y1', pitEntry.y - 35);
        pitEntryLine.setAttribute('x2', pitEntry.x - 15);
        pitEntryLine.setAttribute('y2', pitEntry.y + 35);
        pitEntryLine.setAttribute('stroke', '#ffd700');
        pitEntryLine.setAttribute('stroke-width', '3');
        pitEntryLine.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(pitEntryLine);
        
        // Text PIT IN
        const pitInText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        pitInText.setAttribute('x', pitEntry.x - 25);
        pitInText.setAttribute('y', pitEntry.y - 45);
        pitInText.setAttribute('fill', '#ffd700');
        pitInText.setAttribute('font-size', '12');
        pitInText.setAttribute('font-weight', 'bold');
        pitInText.textContent = 'PIT IN';
        svg.appendChild(pitInText);
        
        // Línia de sortida de boxes
        const pitExitLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        pitExitLine.setAttribute('x1', pitExit.x + 15);
        pitExitLine.setAttribute('y1', pitExit.y - 35);
        pitExitLine.setAttribute('x2', pitExit.x + 15);
        pitExitLine.setAttribute('y2', pitExit.y + 35);
        pitExitLine.setAttribute('stroke', '#ffd700');
        pitExitLine.setAttribute('stroke-width', '3');
        pitExitLine.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(pitExitLine);
        
        // Text PIT OUT
        const pitOutText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        pitOutText.setAttribute('x', pitExit.x + 20);
        pitOutText.setAttribute('y', pitExit.y - 45);
        pitOutText.setAttribute('fill', '#ffd700');
        pitOutText.setAttribute('font-size', '12');
        pitOutText.setAttribute('font-weight', 'bold');
        pitOutText.textContent = 'PIT OUT';
        svg.appendChild(pitOutText);
    }
    
    // === SECTORS (marques) ===
    if (track.sectors) {
        track.sectors.forEach((sector, index) => {
            if (index < track.sectors.length - 1) {
                const sectorPoint = pathEl.getPointAtLength(pathLength * sector.end);
                
                // Línia de sector
                const sectorLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                sectorLine.setAttribute('x1', sectorPoint.x - 25);
                sectorLine.setAttribute('y1', sectorPoint.y - 25);
                sectorLine.setAttribute('x2', sectorPoint.x + 25);
                sectorLine.setAttribute('y2', sectorPoint.y + 25);
                sectorLine.setAttribute('stroke', '#0f0');
                sectorLine.setAttribute('stroke-width', '2');
                sectorLine.setAttribute('opacity', '0.6');
                svg.appendChild(sectorLine);
            }
        });
    }
    
    // Netejar contenidor i afegir SVG
    container.innerHTML = '';
    container.appendChild(svg);
}