// ============================================
// MILLORES PER AL SISTEMA DE CURSES
// Informació de sectors en temps real i visualització millorada
// ============================================

/**
 * Crea el panell d'informació de sectors
 */
function createRaceInfoPanel(trackId) {
    const track = gameData.tracks[trackId];
    if (!track) return;

    const raceTrack = document.getElementById('race-track');
    if (!raceTrack) return;

    // Eliminar panell anterior si existeix
    const oldPanel = document.getElementById('race-info-panel');
    if (oldPanel) oldPanel.remove();

    const panel = document.createElement('div');
    panel.id = 'race-info-panel';
    panel.className = 'race-info-panel';
    
    panel.innerHTML = `
        <h4>📊 Info Circuit</h4>
        <div class="sector-indicator" data-sector="1">
            <span class="sector-name">Sector 1</span>
            <span class="sector-status">⏱️</span>
        </div>
        <div class="sector-indicator" data-sector="2">
            <span class="sector-name">Sector 2</span>
            <span class="sector-status">⏱️</span>
        </div>
        <div class="sector-indicator" data-sector="3">
            <span class="sector-name">Sector 3</span>
            <span class="sector-status">⏱️</span>
        </div>
    `;
    
    raceTrack.appendChild(panel);
}

/**
 * Crea la targeta amb informació del circuit
 */
function createCircuitInfoCard(trackId) {
    const track = gameData.tracks[trackId];
    if (!track) return;

    const raceTrack = document.getElementById('race-track');
    if (!raceTrack) return;

    // Eliminar targeta anterior si existeix
    const oldCard = document.getElementById('circuit-info-card');
    if (oldCard) oldCard.remove();

    const card = document.createElement('div');
    card.id = 'circuit-info-card';
    card.className = 'circuit-info-card';
    
    card.innerHTML = `
        <div class="circuit-stat">
            <span class="circuit-stat-label">📏 Longitud:</span>
            <span class="circuit-stat-value">${track.length ? track.length.toFixed(3) + ' km' : 'N/A'}</span>
        </div>
        <div class="circuit-stat">
            <span class="circuit-stat-label">🏁 Voltes:</span>
            <span class="circuit-stat-value">${track.laps}</span>
        </div>
        <div class="circuit-stat">
            <span class="circuit-stat-label">⚡ Dificultat:</span>
            <span class="circuit-stat-value">${track.difficulty || 'Mitjana'}</span>
        </div>
        ${track.lapRecord ? `
        <div class="circuit-stat">
            <span class="circuit-stat-label">🏆 Rècord:</span>
            <span class="circuit-stat-value">${track.lapRecord}</span>
        </div>
        ` : ''}
    `;
    
    raceTrack.appendChild(card);
}

/**
 * Actualitza els indicadors de sector segons la posició del líder
 */
function updateSectorIndicators() {
    // Comprova si estem en cursa normal o de lliga
    const positions = typeof raceState !== 'undefined' && raceState.positions ? 
                     raceState.positions : 
                     (typeof leagueRaceState !== 'undefined' && leagueRaceState.positions ? 
                      leagueRaceState.positions : null);
    
    if (!positions || positions.length === 0) return;

    // Trobar el líder
    const leader = positions[0];
    if (!leader) return;

    // Calcular en quin sector està el líder (dividim en 3 sectors: 0-33%, 33-66%, 66-100%)
    let currentSector = 1;
    if (leader.lapProgress >= 33 && leader.lapProgress < 66) {
        currentSector = 2;
    } else if (leader.lapProgress >= 66) {
        currentSector = 3;
    }

    // Actualitzar indicadors visuals
    const indicators = document.querySelectorAll('.sector-indicator');
    indicators.forEach((indicator, index) => {
        const sectorNum = index + 1;
        const statusSpan = indicator.querySelector('.sector-status');
        
        if (sectorNum === currentSector) {
            indicator.classList.add('active');
            statusSpan.textContent = '🟢';
        } else if (sectorNum < currentSector) {
            indicator.classList.remove('active');
            statusSpan.textContent = '✅';
        } else {
            indicator.classList.remove('active');
            statusSpan.textContent = '⏱️';
        }
    });
}

/**
 * Millora la visualització de la pista afegint efectes
 */
function enhanceTrackVisualization(trackId) {
    createRaceInfoPanel(trackId);
    createCircuitInfoCard(trackId);
    
    // Afegir classe per millorar visualització
    const raceTrack = document.getElementById('race-track');
    if (raceTrack) {
        raceTrack.classList.add('enhanced-track');
    }
}

/**
 * Neteja les millores visuals quan acaba la cursa
 */
function cleanupEnhancements() {
    const panel = document.getElementById('race-info-panel');
    const card = document.getElementById('circuit-info-card');
    
    if (panel) panel.remove();
    if (card) card.remove();
    
    const raceTrack = document.getElementById('race-track');
    if (raceTrack) {
        raceTrack.classList.remove('enhanced-track');
    }
}

/**
 * Integració amb el sistema de curses existent
 * Aquesta funció s'hauria de cridar des de displayTrack()
 */
function initEnhancedRaceDisplay(trackId) {
    enhanceTrackVisualization(trackId);
}

/**
 * Integració amb el bucle de cursa
 * Aquesta funció s'hauria de cridar des de runRaceLoop()
 */
function updateEnhancedRaceDisplay() {
    updateSectorIndicators();
}
