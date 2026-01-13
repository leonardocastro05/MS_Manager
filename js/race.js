// ============================================
// SISTEMA DE CURSES - VERSIÓ NETA I OPTIMITZADA
// ============================================

// Variables globals del sistema de curses
const raceState = {
    selectedTrack: null,    // Circuit seleccionat
    previewedTrack: null,   // Circuit en preview
    interval: null,         // Interval de la simulació
    isRunning: false,       // Si la cursa està en marxa
    positions: [],          // Array de pilots amb la seva info
    currentLap: 0          // Volta actual (del líder)
};

// --------------------------------------------
// NOVA INTERFÍCIE DE SELECCIÓ DE CIRCUITS
// --------------------------------------------

/**
 * Mostra preview d'una pista al fer clic
 */
function previewTrack(trackId, event) {
    const track = gameData.tracks[trackId];
    if (!track) return;
    
    raceState.previewedTrack = trackId;
    
    // Actualitzar visuals de la llista
    document.querySelectorAll('.track-list-item').forEach(item => {
        item.classList.remove('active');
    });
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    
    // Mostrar fons de la pista amb opacitat
    const previewBg = document.getElementById('track-preview-bg');
    const imagePath = track.image ? `img/${track.image}` : '';
    if (imagePath) {
        previewBg.style.backgroundImage = `url('${imagePath}')`;
        previewBg.classList.add('active');
    }
    
    // Amagar placeholder i mostrar info
    const placeholder = document.querySelector('.track-preview-placeholder');
    const previewInfo = document.getElementById('track-preview-info');
    const previewContent = document.getElementById('track-preview-content');
    
    if (placeholder) placeholder.style.display = 'none';
    previewContent.style.background = 'none';
    previewInfo.style.display = 'flex';
    
    // Omplir dades de la pista
    document.getElementById('preview-track-name').textContent = track.name;
    document.getElementById('preview-track-flag').textContent = track.flag;
    document.getElementById('preview-track-length').textContent = track.length + ' km';
    document.getElementById('preview-track-laps').textContent = track.laps;
    document.getElementById('preview-track-difficulty').textContent = track.difficulty;
    document.getElementById('preview-track-record').textContent = track.lapRecord;
}

/**
 * Confirma la selecció de la pista i mostra l'àrea de cursa
 */
function confirmTrackSelection() {
    if (!raceState.previewedTrack) return;
    
    raceState.selectedTrack = raceState.previewedTrack;
    
    // Amagar selector i mostrar àrea de cursa
    const modernSelection = document.querySelector('.modern-track-selection');
    const strategyPanel = document.getElementById('strategy-panel');
    const trackDisplay = document.getElementById('track-display');
    const raceControls = document.querySelector('.race-controls');
    const racePositions = document.getElementById('race-positions');
    
    if (modernSelection) modernSelection.style.display = 'none';
    if (strategyPanel) strategyPanel.style.display = 'block';
    if (trackDisplay) trackDisplay.style.display = 'block';
    if (raceControls) raceControls.style.display = 'flex';
    if (racePositions) racePositions.style.display = 'block';
    
    // Mostrar la pista
    displayTrack(raceState.selectedTrack);
}

// --------------------------------------------
// SELECCIÓ DE CIRCUIT (LEGACY - mantenir compatibilitat)
// --------------------------------------------

/**
 * Selecciona un circuit i el mostra
 */
function selectTrack(trackId, event) {
    raceState.selectedTrack = trackId;

    // Marcar visualment el botó seleccionat
    document.querySelectorAll('.track-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    if (event && event.target) {
        event.target.classList.add('selected');
    }

    displayTrack(trackId);
}

/**
 * Mostra el circuit seleccionat amb la seva pista
 */
function displayTrack(trackId) {
    const track = gameData.tracks[trackId];
    const trackDisplay = document.getElementById('track-display');
    
    // Preparar imatge de fons si existeix
    const imagePath = track.image ? `img/${track.image}` : '';

    // Crear el HTML de la pista amb contenidor per al SVG realista
    trackDisplay.innerHTML = `
        <div class="race-track" id="race-track">
            
            <!-- Contenidor per al traçat realista -->
            <div id="realistic-track-container" style="width: 100%; height: 100%;"></div>
            
            <!-- Informació del circuit -->
            <div style="position: absolute; top: 20px; left: 20px; 
                        font-size: 2em; color: white; 
                        text-shadow: 2px 2px 8px rgba(0,0,0,0.9); z-index: 20;
                        font-family: 'Orbitron', Arial, sans-serif;">
                ${track.flag} ${track.name}
            </div>
            
            <!-- Comptador de voltes -->
            <div style="position: absolute; top: 70px; left: 20px; 
                        font-size: 1.3em; color: #ffd700; 
                        text-shadow: 2px 2px 8px rgba(0,0,0,0.9); z-index: 20;
                        font-family: 'Orbitron', Arial, sans-serif;
                        font-weight: bold;">
                Volta: <span id="current-lap" style="color: #2ecc40;">0</span> / ${track.laps}
            </div>
        </div>
    `;

    // Renderitzar la pista realista
    const container = document.getElementById('realistic-track-container');
    if (container && typeof renderRealisticTrack === 'function') {
        renderRealisticTrack(trackId, container);
    }

    // Animació de la targeta del circuit
    animateCircuitCard(track, imagePath);
    
    // Afegir millores visuals si la funció existeix
    if (typeof initEnhancedRaceDisplay === 'function') {
        setTimeout(() => initEnhancedRaceDisplay(trackId), 100);
    }
}

/**
 * Anima l'aparició de la targeta del circuit
 */
function animateCircuitCard(track, imagePath) {
    const card = document.getElementById('race-circuit-card');
    const img = document.getElementById('race-circuit-img');
    const name = document.getElementById('race-circuit-name');

    if (!card || !img || !name) return;

    const isSameTrack = img.src.endsWith(imagePath);

    if (card.classList.contains('visible') && isSameTrack) {
        // Si ja està visible i és el mateix, fer pulse
        card.classList.remove('pulse');
        void card.offsetWidth; // Force reflow
        card.classList.add('pulse');
    } else {
        // Transició suau a nou circuit
        if (card.classList.contains('visible')) {
            card.classList.remove('visible');
            setTimeout(() => {
                img.src = imagePath;
                name.textContent = `${track.flag} ${track.name}`;
                card.style.display = 'flex';
                setTimeout(() => card.classList.add('visible'), 10);
            }, 350);
        } else {
            img.src = imagePath;
            name.textContent = `${track.flag} ${track.name}`;
            card.style.display = 'flex';
            setTimeout(() => card.classList.add('visible'), 10);
        }
    }
}

// --------------------------------------------
// INICIAR CURSA
// --------------------------------------------

/**
 * Comença la cursa amb les validacions necessàries
 */
function startRace() {
    const user = getCurrentUser();

    // Validacions
    if (!user) {
        alert('⚠️ ¡Primero debes iniciar sesión!');
        return;
    }

    if (user.data.drivers.length < 2) {
        alert('⚠️ ¡Necesitas 2 pilotos para correr!');
        return;
    }

    if (!raceState.selectedTrack) {
        alert('⚠️ ¡Selecciona un circuito primero!');
        return;
    }

    // Preparar la cursa
    raceState.isRunning = true;
    raceState.currentLap = 0;
    
    document.getElementById('start-race-btn').style.display = 'none';
    document.getElementById('pause-race-btn').style.display = 'inline-block';

    initializeRace();
    runRaceLoop();
}

/**
 * Inicialitza tots els pilots de la cursa amb les seves estadístiques
 */
function initializeRace() {
    const user = getCurrentUser();
    const track = gameData.tracks[raceState.selectedTrack];

    raceState.positions = [];

    // Afegir pilots de l'usuari
    user.data.drivers.forEach((driver, index) => {
        const tyreChoice = document.getElementById(`driver${index + 1}-tyres`).value;
        const tyreStats = gameData.tyreStrategies[tyreChoice];

        // Calcular rendiment del pilot
        const performance = calculateDriverPerformance(
            driver.skill,
            user.data.upgrades,
            user.data.manager,
            tyreStats
        );

        raceState.positions.push({
            name: driver.name,
            team: user.data.teamName,
            performance: performance,
            position: 0,
            lapProgress: Math.random() * 2, // Posició inicial lleugerament aleatòria
            completedLaps: 0,
            color: '#FFD700', // Daurat per pilots del jugador
            isPlayer: true
        });
    });

    // Afegir equips IA
    aiTeams.forEach(team => {
        const upgrades = getTeamUpgrades(team.name);
        
        // Pilot 1 de l'equip
        const aiPerformance1 = calculateDriverPerformance(
            team.skill,
            upgrades,
            null, // Els IA no tenen mànager
            gameData.tyreStrategies.medium
        ) + (Math.random() * 10 - 5); // Variació aleatòria

        raceState.positions.push({
            name: team.driver1,
            team: team.name,
            performance: aiPerformance1,
            position: 0,
            lapProgress: Math.random() * 2,
            completedLaps: 0,
            color: team.color,
            isPlayer: false
        });

        // Pilot 2 de l'equip (lleugerament més lent)
        raceState.positions.push({
            name: team.driver2,
            team: team.name,
            performance: aiPerformance1 - 2,
            position: 0,
            lapProgress: Math.random() * 2,
            completedLaps: 0,
            color: team.color,
            isPlayer: false
        });
    });

    updatePositions();
    updateDriverMarkers();
}

/**
 * Calcula el rendiment d'un pilot basant-se en múltiples factors
 */
function calculateDriverPerformance(baseSkill, upgrades, manager, tyreStats) {
    const engineBonus = 1 + (upgrades.engine || 0) / 20;
    const aeroBonus = 1 + (upgrades.aero || 0) / 25;
    const chassisBonus = 1 + (upgrades.chassis || 0) / 25;
    const managerBonus = manager ? 1 + manager.bonus / 100 : 1;
    const tyreBonus = tyreStats.speed;

    return baseSkill * engineBonus * aeroBonus * chassisBonus * managerBonus * tyreBonus;
}

// --------------------------------------------
// BUCLE PRINCIPAL DE LA CURSA
// --------------------------------------------

/**
 * Executa la simulació de la cursa frame a frame
 */
function runRaceLoop() {
    const track = gameData.tracks[raceState.selectedTrack];

    raceState.interval = setInterval(() => {
        if (!raceState.isRunning) return;

        // Actualitzar cada pilot
        let raceFinished = true;
        
        raceState.positions.forEach(driver => {
            // Si encara no ha acabat
            if (driver.completedLaps < track.laps) {
                raceFinished = false;
                
                // Incrementar progrés (més rendiment = més ràpid)
                const increment = (driver.performance / 100) * (Math.random() * 0.5 + 0.75);
                driver.lapProgress += increment;

                // Comprovar si completa una volta
                if (driver.lapProgress >= 100) {
                    driver.completedLaps++;
                    driver.lapProgress -= 100; // Mantenir l'excés
                }
            } else {
                // Pilot acabat, mantenir al 100%
                driver.lapProgress = 100;
            }
        });

        // Actualitzar comptador de voltes amb el líder
        const maxLaps = Math.max(...raceState.positions.map(d => d.completedLaps));
        raceState.currentLap = maxLaps;
        const lapDisplay = document.getElementById('current-lap');
        if (lapDisplay) lapDisplay.textContent = raceState.currentLap;

        // Si tots han acabat, finalitzar
        if (raceFinished) {
            endRace();
            return;
        }

        // Actualitzar visualitzacions
        updatePositions();
        updateDriverMarkers();
        displayRacePositions();
        
        // Actualitzar indicadors de sectors si la funció existeix
        if (typeof updateEnhancedRaceDisplay === 'function') {
            updateEnhancedRaceDisplay();
        }

    }, 100); // 10 fps per eficiència
}

/**
 * Ordena els pilots per posició basant-se en voltes i progrés
 */
function updatePositions() {
    // Calcular progrés total (voltes * 100 + progrés actual)
    raceState.positions.forEach(driver => {
        driver.progress = (driver.completedLaps * 100) + driver.lapProgress;
    });

    // Ordenar de major a menor progrés
    raceState.positions.sort((a, b) => b.progress - a.progress);

    // Assignar posicions
    raceState.positions.forEach((driver, index) => {
        driver.position = index + 1;
    });
}

/**
 * Actualitza els marcadors visuals dels pilots a la pista
 */
function updateDriverMarkers() {
    const raceTrack = document.getElementById('race-track');
    if (!raceTrack) return;

    // Eliminar marcadors anteriors
    raceTrack.querySelectorAll('.driver-marker').forEach(m => m.remove());

    // Obtenir el path SVG
    const svg = raceTrack.querySelector('svg.track-svg');
    const path = svg ? svg.querySelector('#track-path') : null;
    let pathLength = 0;

    if (path) {
        try {
            pathLength = path.getTotalLength();
        } catch (e) {
            console.warn('No es pot calcular la longitud del path');
        }
    }

    // Crear marcador per cada pilot
    raceState.positions.forEach(driver => {
        const marker = createDriverMarker(driver, path, pathLength, svg, raceTrack);
        raceTrack.appendChild(marker);
    });
}

/**
 * Crea un marcador visual per un pilot
 */
function createDriverMarker(driver, path, pathLength, svg, container) {
    const marker = document.createElement('div');
    marker.className = 'driver-marker';
    marker.style.backgroundColor = driver.color;
    marker.style.border = driver.isPlayer ? '3px solid gold' : '2px solid white';
    marker.textContent = driver.position;

    // Calcular posició
    let x = 0, y = 0;

    if (path && pathLength > 0) {
        // Usar el path SVG per posicionar
        const progressPercent = Math.max(0, Math.min(100, driver.lapProgress));
        const distance = (progressPercent / 100) * pathLength;
        const point = path.getPointAtLength(distance);

        // Convertir coordenades SVG a píxels de pantalla
        const svgPt = svg.createSVGPoint();
        svgPt.x = point.x;
        svgPt.y = point.y;
        const screenPt = svgPt.matrixTransform(svg.getScreenCTM());
        const svgRect = svg.getBoundingClientRect();
        
        x = screenPt.x - svgRect.left;
        y = screenPt.y - svgRect.top;
    } else {
        // Fallback: òrbita el·líptica
        const angle = (driver.lapProgress / 100) * Math.PI * 2;
        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;
        const radiusX = centerX - 80;
        const radiusY = centerY - 80;
        
        x = centerX + radiusX * Math.cos(angle);
        y = centerY + radiusY * Math.sin(angle);
    }

    // Centrar el marcador (30x30px)
    marker.style.left = (x - 15) + 'px';
    marker.style.top = (y - 15) + 'px';

    return marker;
}

/**
 * Mostra la classificació actual a la llista
 */
function displayRacePositions() {
    const positionsList = document.getElementById('positions-list');
    const track = gameData.tracks[raceState.selectedTrack];

    positionsList.innerHTML = raceState.positions.map(driver => {
        const lapsText = `${driver.completedLaps}/${track.laps}`;
        const playerStar = driver.isPlayer ? ' ⭐' : '';

        return `
            <div class="position-item" style="border-left: 4px solid ${driver.color}">
                <div class="position-number">${driver.position}</div>
                <div class="driver-info">
                    <div class="driver-name">${driver.name}${playerStar}</div>
                    <div class="team-name">${driver.team} • ${lapsText} voltes</div>
                </div>
            </div>
        `;
    }).join('');
}

// --------------------------------------------
// CONTROLS DE LA CURSA
// --------------------------------------------

/**
 * Pausa o reprèn la cursa
 */
function pauseRace() {
    raceState.isRunning = !raceState.isRunning;
    const btn = document.getElementById('pause-race-btn');
    btn.textContent = raceState.isRunning ? 'Pausar' : 'Continuar';
}

/**
 * Mostra/oculta el traçat del circuit (per debug)
 */
function toggleTrackPathVisibility() {
    const track = document.getElementById('race-track');
    if (!track) return;
    
    track.classList.toggle('show-path');
    const btn = document.getElementById('toggle-path-btn');
    btn.textContent = track.classList.contains('show-path') 
        ? 'Ocultar traçat' 
        : 'Mostrar traçat';
}

// --------------------------------------------
// FINALITZAR CURSA
// --------------------------------------------

/**
 * Finalitza la cursa i calcula resultats
 */
function endRace() {
    clearInterval(raceState.interval);
    raceState.isRunning = false;

    document.getElementById('start-race-btn').style.display = 'inline-block';
    document.getElementById('pause-race-btn').style.display = 'none';

    const user = getCurrentUser();
    
    // Trobar la millor posició dels pilots del jugador
    const playerPositions = raceState.positions
        .filter(d => d.isPlayer)
        .map(d => d.position);
    const bestPosition = Math.min(...playerPositions);

    // Sistema de punts F1 oficial
    const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    const points = bestPosition <= 10 ? pointsSystem[bestPosition - 1] : 0;

    // Actualitzar estadístiques
    if (bestPosition === 1) {
        user.data.wins++;
    }
    if (bestPosition <= 3) {
        user.data.podiums++;
    }
    user.data.points += points;
    
    // Incrementar el comptador de curses completades (per desbloqueig mode online)
    if (!user.data.racesCompleted) {
        user.data.racesCompleted = 0;
    }
    user.data.racesCompleted++;

    // Premi econòmic (més alt com millor posició)
    const prize = Math.max(100000, 1500000 - (bestPosition * 80000));
    user.data.budget += prize;

    saveUserData(user.data);
    updateUserInfo();

    // Mostrar resultats
    showRaceResults(bestPosition, points, prize);
    
    // Comprovar si s'ha desbloquejat el mode online
    if (typeof checkOnlineUnlockAndNotify === 'function') {
        setTimeout(() => checkOnlineUnlockAndNotify(), 1500); // Esperar a que es tanqui el popup de resultats
    }

    // If this race was started from a league, update league data
    try {
        const lr = sessionStorage.getItem('leagueRaceInfo');
        if (lr) {
            const info = JSON.parse(lr);
            const leagueId = info.leagueId;
            const raceIndex = info.raceIndex;
            const u = getCurrentUser();
            if (u && u.data && Array.isArray(u.data.onlineLeagues)) {
                const league = u.data.onlineLeagues.find(l => l.id === leagueId);
                if (league) {
                    // Ensure calendar exists
                    if (!league.calendar) league.calendar = [];
                    if (!league.standings) league.standings = [];

                    // Ensure standings array contains the user
                    let standing = league.standings.find(s => s.name === u.username);
                    if (!standing) {
                        standing = { name: u.username, points: 0 };
                        league.standings.push(standing);
                    }

                    standing.points = (standing.points || 0) + points;

                    // Mark race completed and store results
                    if (league.calendar[raceIndex]) {
                        league.calendar[raceIndex].completed = true;
                        league.calendar[raceIndex].results = { position: bestPosition, points };
                    }

                    league.currentRace = (league.currentRace || 0) + 1;

                    // Persist
                    saveUserData(u.data);

                    // Clear the session flag so it doesn't apply again
                    sessionStorage.removeItem('leagueRaceInfo');
                }
            }
        }
    } catch (e) {
        console.warn('Error updating league after race', e);
    }
}

/**
 * Mostra els resultats de la cursa
 */
function showRaceResults(position, points, prize) {
    let message = '';
    
    if (position === 1) {
        message = `🏆 VICTÒRIA!\n\nHas guanyat la cursa!`;
    } else if (position === 2) {
        message = `🥈 Segon lloc!\n\nGran cursa!`;
    } else if (position === 3) {
        message = `🥉 Tercer lloc!\n\nPodi!`;
    } else if (position <= 10) {
        message = `Posició: ${position}è\n\nDins dels punts!`;
    } else {
        message = `Posició: ${position}è\n\nFora dels punts`;
    }

    message += `\n\n📊 Punts: +${points}`;
    message += `\n💰 Premi: ${formatMoney(prize)}`;

    alert(message);
}

// --------------------------------------------
// UTILITATS
// --------------------------------------------

/**
 * Obté les millores d'un equip (jugador o IA)
 */
function getTeamUpgrades(teamName) {
    if (typeof careerMode !== 'undefined' && teamName === careerMode.playerTeam) {
        return careerMode.hq;
    }
    
    if (typeof careerMode !== 'undefined') {
        const aiTeam = careerMode.aiTeams.find(t => t.name === teamName);
        if (aiTeam) return aiTeam.upgrades;
    }
    
    const aiTeam = aiTeams.find(t => t.name === teamName);
    return aiTeam ? (aiTeam.upgrades || { engine: 0, aero: 0, chassis: 0 }) : { engine: 0, aero: 0, chassis: 0 };
}