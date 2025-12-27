// Sistema de curses

let selectedTrack = null;
let raceInterval = null;
let isRacing = false;
let currentLap = 0;
let racePositions = [];

function selectTrack(trackId, ev) {
    selectedTrack = trackId;

    // Marcar botó seleccionat
    document.querySelectorAll('.track-buttons button').forEach(btn => {
        btn.classList.remove('selected');
    });
    if (ev && ev.target) ev.target.classList.add('selected');

    displayTrack(trackId);
}

function displayTrack(trackId) {
    const track = gameData.tracks[trackId];
    const trackDisplay = document.getElementById('track-display');
    const imagePath = track.image ? `img/${track.image}` : '';
    const viewW = 1000;
    const viewH = 600;
    const imageClass = imagePath ? 'race-track image-track' : 'race-track';
    trackDisplay.innerHTML = `
        <div class="${imageClass}" id="race-track" style="background-image: url('${imagePath}'); background-size: cover; background-position: center;">
            <svg class="track-svg" viewBox="0 0 ${viewW} ${viewH}" preserveAspectRatio="xMidYMid meet">
                <path id="track-path" d="${track.path || ''}" class="track-path-visible"></path>
            </svg>
            <div style="position: absolute; top: 20px; left: 20px; font-size: 2em; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); z-index: 20;">
                ${track.flag} ${track.name}
            </div>
            <div style="position: absolute; top: 60px; left: 20px; font-size: 1.2em; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); z-index: 20;">
                Voltes: <span id="current-lap">0</span> / ${track.laps}
            </div>
        </div>
    `;
    // Animació targeta circuit
    const circuitCard = document.getElementById('race-circuit-card');
    const circuitImg = document.getElementById('race-circuit-img');
    const circuitName = document.getElementById('race-circuit-name');
    if (circuitCard && circuitImg && circuitName) {
        // Si ja és visible i mateix circuit, pulse
        if (circuitCard.classList.contains('visible') && circuitImg.src.endsWith(imagePath)) {
            circuitCard.classList.remove('pulse');
            void circuitCard.offsetWidth; // reflow
            circuitCard.classList.add('pulse');
        } else {
            // Fade out si visible
            if (circuitCard.classList.contains('visible')) {
                circuitCard.classList.remove('visible');
                setTimeout(() => {
                    circuitImg.src = imagePath;
                    circuitName.textContent = `${track.flag} ${track.name}`;
                    circuitCard.style.display = 'flex';
                    setTimeout(() => circuitCard.classList.add('visible'), 10);
                }, 350);
            } else {
                circuitImg.src = imagePath;
                circuitName.textContent = `${track.flag} ${track.name}`;
                circuitCard.style.display = 'flex';
                setTimeout(() => circuitCard.classList.add('visible'), 10);
            }
        }
    }
}

function startRace() {
    const user = getCurrentUser();
    if (!user) {
        alert('Primer has de iniciar sessió!');
        return;
    }

    if (user.data.drivers.length < 2) {
        alert('Necessites 2 pilots per córrer!');
        return;
    }

    if (!selectedTrack) {
        alert('Selecciona un circuit primer!');
        return;
    }

    // Preparar cursa
    isRacing = true;
    currentLap = 0;
    document.getElementById('start-race-btn').style.display = 'none';
    document.getElementById('pause-race-btn').style.display = 'inline-block';
    
    initializeRace();
    runRace();
}

function initializeRace() {
    const user = getCurrentUser();
    const track = gameData.tracks[selectedTrack];
    
    // Crear array de posicions amb els pilots de l'usuari
    racePositions = [];
    
    // Afegir pilots de l'usuari
    user.data.drivers.forEach((driver, index) => {
        const tyreChoice = document.getElementById(`driver${index + 1}-tyres`).value;
        const tyreStats = gameData.tyreStrategies[tyreChoice];

        // Obtenir upgrades i diners del modo carrera si està actiu
        let upgrades = typeof getTeamUpgrades === 'function' ? getTeamUpgrades(user.data.teamName) : user.data.upgrades;
        let base = driver.skill;
        let engine = upgrades.engine || 0;
        let aero = upgrades.aero || 0;
        let chassis = upgrades.chassis || 0;
        let manager = user.data.manager ? user.data.manager.bonus : 0;

        let performance = base
            * (1 + engine / 20)
            * (1 + aero / 25)
            * (1 + chassis / 25)
            * (1 + manager / 100);

        racePositions.push({
            name: driver.name,
            team: user.data.teamName,
            performance: performance * tyreStats.speed,
            position: 0,
            progress: Math.random() * 5, // Inici aleatori
            color: '#' + Math.floor(Math.random()*16777215).toString(16),
            isPlayer: true
        });
    });
    
    // Afegir equips IA
    aiTeams.forEach(team => {
        // Obtenir upgrades del modo carrera si està actiu
        let upgrades = typeof getTeamUpgrades === 'function' ? getTeamUpgrades(team.name) : (team.upgrades || {engine:0,aero:0,chassis:0});
        let engine = upgrades.engine || 0;
        let aero = upgrades.aero || 0;
        let chassis = upgrades.chassis || 0;
        let manager = 0; // Pots afegir managers IA si vols

        // Fórmula igual que el jugador
        let aiPerformance = team.skill
            * (1 + engine / 20)
            * (1 + aero / 25)
            * (1 + chassis / 25)
            * (1 + manager / 100)
            + (Math.random() * 10 - 5); // L'aleatorietat es manté

        racePositions.push({
            name: team.driver1,
            team: team.name,
            performance: aiPerformance,
            position: 0,
            progress: Math.random() * 5,
            color: team.color,
            isPlayer: false
        });

        racePositions.push({
            name: team.driver2,
            team: team.name,
            performance: aiPerformance - 2,
            position: 0,
            progress: Math.random() * 5,
            color: team.color,
            isPlayer: false
        });
    });
    
    // Ordenar per rendiment inicial
    updatePositions();
    updateDriverMarkers();
}

function runRace() {
    const track = gameData.tracks[selectedTrack];
    
    raceInterval = setInterval(() => {
        if (!isRacing) return;
        
        // Actualitzar progrés de cada pilot
        racePositions.forEach(driver => {
            // Increment aleatori basat en el rendiment
            const increment = (driver.performance / 100) * (Math.random() * 0.5 + 0.75);
            driver.progress += increment;
        });
        
        // Comprovar si algú ha completat una volta
        const maxProgress = Math.max(...racePositions.map(d => d.progress));
        if (maxProgress >= 100) {
            currentLap++;
            document.getElementById('current-lap').textContent = currentLap;
            
            // Reset progrés però mantenint l'excés
            racePositions.forEach(driver => {
                if (driver.progress >= 100) {
                    driver.progress -= 100;
                }
            });
            
            // Comprovar si la cursa ha acabat
            if (currentLap >= track.laps) {
                endRace();
                return;
            }
        }
        
        updatePositions();
        updateDriverMarkers();
        displayRacePositions();
        
    }, 100); // Actualitzar cada 100ms
}

function updatePositions() {
    // Calcular posicions basades en volta actual i progrés
    racePositions.sort((a, b) => {
        return b.progress - a.progress;
    });
    
    racePositions.forEach((driver, index) => {
        driver.position = index + 1;
    });
}

function updateDriverMarkers() {
    const raceTrack = document.getElementById('race-track');
    if (!raceTrack) return;
    
    // Esborrar marcadors anteriors
    const oldMarkers = raceTrack.querySelectorAll('.driver-marker');
    oldMarkers.forEach(marker => marker.remove());
    
    // Crear nous marcadors
    // Use SVG path to position markers along the true racing line
    const svg = raceTrack.querySelector('svg.track-svg');
    const path = svg ? svg.querySelector('#track-path') : null;
    let totalLength = 0;
    if (path) {
        try {
            totalLength = path.getTotalLength();
        } catch (e) {
            totalLength = 0;
        }
    }

    racePositions.forEach(driver => {
        const marker = document.createElement('div');
        marker.className = 'driver-marker';
        marker.style.backgroundColor = driver.color;
        marker.style.border = driver.isPlayer ? '3px solid gold' : '2px solid white';

        let x = 0, y = 0;
        if (path && totalLength > 0) {
            const len = Math.max(0, Math.min(1, driver.progress / 100)) * totalLength;
            const pt = path.getPointAtLength(len);
            // Convert SVG user coords to pixels relative to the svg element
            const svgPt = svg.createSVGPoint();
            svgPt.x = pt.x;
            svgPt.y = pt.y;
            const ctm = svg.getScreenCTM();
            const screenPt = svgPt.matrixTransform(ctm);
            const svgRect = svg.getBoundingClientRect();
            x = screenPt.x - svgRect.left;
            y = screenPt.y - svgRect.top;
        } else {
            // fallback to simple oval
            const angle = (driver.progress / 100) * Math.PI * 2;
            const centerX = raceTrack.offsetWidth / 2;
            const centerY = raceTrack.offsetHeight / 2;
            const radiusX = centerX - 80;
            const radiusY = centerY - 80;
            x = centerX + radiusX * Math.cos(angle);
            y = centerY + radiusY * Math.sin(angle);
        }

        // Center marker on the point
        marker.style.left = (x - 15) + 'px';
        marker.style.top = (y - 15) + 'px';
        marker.textContent = driver.position;

        raceTrack.appendChild(marker);
    });
}

function displayRacePositions() {
    const positionsList = document.getElementById('positions-list');
    
    positionsList.innerHTML = racePositions.map(driver => `
        <div class="position-item" style="border-left: 4px solid ${driver.color}">
            <div class="position-number">${driver.position}</div>
            <div class="driver-info">
                <div class="driver-name">${driver.name} ${driver.isPlayer ? '⭐' : ''}</div>
                <div class="team-name">${driver.team}</div>
            </div>
        </div>
    `).join('');
}

function pauseRace() {
    isRacing = !isRacing;
    document.getElementById('pause-race-btn').textContent = isRacing ? 'Pausar' : 'Continuar';
}

function toggleTrackPathVisibility() {
    const rt = document.getElementById('race-track');
    if (!rt) return;
    rt.classList.toggle('show-path');
    const btn = document.getElementById('toggle-path-btn');
    if (btn) btn.textContent = rt.classList.contains('show-path') ? 'Ocultar traçat' : 'Mostrar traçat';
}

function endRace() {
    clearInterval(raceInterval);
    isRacing = false;
    
    document.getElementById('start-race-btn').style.display = 'inline-block';
    document.getElementById('pause-race-btn').style.display = 'none';
    
    // Actualitzar estadístiques de l'usuari
    const user = getCurrentUser();
    const playerPositions = racePositions.filter(d => d.isPlayer).map(d => d.position);
    const bestPosition = Math.min(...playerPositions);
    
    if (bestPosition === 1) {
        user.data.wins++;
        user.data.points += 25;
        alert('🏆 VICTÒRIA! Has guanyat la cursa!');
    } else if (bestPosition <= 3) {
        user.data.podiums++;
        const points = bestPosition === 2 ? 18 : 15;
        user.data.points += points;
        alert(`🥈 Podi! Has quedat ${bestPosition}è i guanyat ${points} punts!`);
    } else {
        const points = Math.max(0, 11 - bestPosition);
        user.data.points += points;
        alert(`Has acabat ${bestPosition}è i guanyat ${points} punts.`);
    }
    
    // Premi en diners
    const prize = Math.max(100000, 1000000 - (bestPosition * 50000));
    user.data.budget += prize;
    
    saveUserData(user.data);
    updateUserInfo();
    
    alert(`Has guanyat ${formatMoney(prize)} de premi!`);
}
