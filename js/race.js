// Sistema de curses MILLORAT

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

    // Animació targeta circuit amb slider
    const circuitCard = document.getElementById('race-circuit-card');
    const circuitImg = document.getElementById('race-circuit-img');
    const circuitName = document.getElementById('race-circuit-name');

    if (circuitCard && circuitImg && circuitName) {
        if (circuitCard.classList.contains('visible') && circuitImg.src.endsWith(imagePath)) {
            circuitCard.classList.remove('pulse');
            void circuitCard.offsetWidth;
            circuitCard.classList.add('pulse');
        } else {
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

    racePositions = [];

    // Afegir pilots de l'usuari
    user.data.drivers.forEach((driver, index) => {
        const tyreChoice = document.getElementById(`driver${index + 1}-tyres`).value;
        const tyreStats = gameData.tyreStrategies[tyreChoice];

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
            progress: Math.random() * 2,
            lapProgress: 0, // CLAU: Progrés dins de la volta actual
            completedLaps: 0, // CLAU: Voltes completades
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            isPlayer: true
        });
    });

    // Afegir equips IA
    aiTeams.forEach(team => {
        let upgrades = typeof getTeamUpgrades === 'function' ? getTeamUpgrades(team.name) : (team.upgrades || { engine: 0, aero: 0, chassis: 0 });
        let engine = upgrades.engine || 0;
        let aero = upgrades.aero || 0;
        let chassis = upgrades.chassis || 0;

        let aiPerformance = team.skill
            * (1 + engine / 20)
            * (1 + aero / 25)
            * (1 + chassis / 25)
            + (Math.random() * 10 - 5);

        racePositions.push({
            name: team.driver1,
            team: team.name,
            performance: aiPerformance,
            position: 0,
            progress: Math.random() * 2,
            lapProgress: 0,
            completedLaps: 0,
            color: team.color,
            isPlayer: false
        });

        racePositions.push({
            name: team.driver2,
            team: team.name,
            performance: aiPerformance - 2,
            position: 0,
            progress: Math.random() * 2,
            lapProgress: 0,
            completedLaps: 0,
            color: team.color,
            isPlayer: false
        });
    });

    updatePositions();
    updateDriverMarkers();
}

function runRace() {
    const track = gameData.tracks[selectedTrack];

    raceInterval = setInterval(() => {
        if (!isRacing) return;

        // Actualitzar progrés de cada pilot
        racePositions.forEach(driver => {
            const increment = (driver.performance / 100) * (Math.random() * 0.5 + 0.75);
            driver.lapProgress += increment;

            // Si completa una volta
            if (driver.lapProgress >= 100) {
                driver.completedLaps++;
                driver.lapProgress -= 100; // Mantenir l'excés

                // Actualitzar el comptador de voltes amb el líder
                const maxLaps = Math.max(...racePositions.map(d => d.completedLaps));
                currentLap = maxLaps;
                const lapDisplay = document.getElementById('current-lap');
                if (lapDisplay) lapDisplay.textContent = currentLap;

                // Comprovar si la cursa ha acabat
                if (driver.completedLaps >= track.laps) {
                    driver.lapProgress = 100; // Mantenir a 100%
                }
            }
        });

        // Comprovar si tots han acabat
        const allFinished = racePositions.every(d => d.completedLaps >= track.laps);
        if (allFinished) {
            endRace();
            return;
        }

        // Calcular progrés total per ordenar correctament
        racePositions.forEach(driver => {
            driver.progress = (driver.completedLaps * 100) + driver.lapProgress;
        });

        updatePositions();
        updateDriverMarkers();
        displayRacePositions();

    }, 100);
}

function updatePositions() {
    // Ordenar per progrés total (voltes completades + progrés volta actual)
    racePositions.sort((a, b) => b.progress - a.progress);

    racePositions.forEach((driver, index) => {
        driver.position = index + 1;
    });
}

function updateDriverMarkers() {
    const raceTrack = document.getElementById('race-track');
    if (!raceTrack) return;

    const oldMarkers = raceTrack.querySelectorAll('.driver-marker');
    oldMarkers.forEach(marker => marker.remove());

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
            // Usar lapProgress (0-100) per la posició dins de la volta
            const progressInLap = Math.max(0, Math.min(100, driver.lapProgress));
            const len = (progressInLap / 100) * totalLength;
            const pt = path.getPointAtLength(len);

            const svgPt = svg.createSVGPoint();
            svgPt.x = pt.x;
            svgPt.y = pt.y;
            const ctm = svg.getScreenCTM();
            const screenPt = svgPt.matrixTransform(ctm);
            const svgRect = svg.getBoundingClientRect();
            x = screenPt.x - svgRect.left;
            y = screenPt.y - svgRect.top;
        } else {
            // Fallback a oval
            const angle = (driver.lapProgress / 100) * Math.PI * 2;
            const centerX = raceTrack.offsetWidth / 2;
            const centerY = raceTrack.offsetHeight / 2;
            const radiusX = centerX - 80;
            const radiusY = centerY - 80;
            x = centerX + radiusX * Math.cos(angle);
            y = centerY + radiusY * Math.sin(angle);
        }

        marker.style.left = (x - 15) + 'px';
        marker.style.top = (y - 15) + 'px';
        marker.textContent = driver.position;

        raceTrack.appendChild(marker);
    });
}

function displayRacePositions() {
    const positionsList = document.getElementById('positions-list');

    positionsList.innerHTML = racePositions.map(driver => {
        const track = gameData.tracks[selectedTrack];
        const lapsText = `${driver.completedLaps}/${track.laps}`;

        return `
            <div class="position-item" style="border-left: 4px solid ${driver.color}">
                <div class="position-number">${driver.position}</div>
                <div class="driver-info">
                    <div class="driver-name">${driver.name} ${driver.isPlayer ? '⭐' : ''}</div>
                    <div class="team-name">${driver.team} • ${lapsText} voltes</div>
                </div>
            </div>
        `;
    }).join('');
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

    const user = getCurrentUser();
    const playerPositions = racePositions.filter(d => d.isPlayer).map(d => d.position);
    const bestPosition = Math.min(...playerPositions);

    // Sistema de punts F1 real
    const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    const points = bestPosition <= 10 ? pointsSystem[bestPosition - 1] : 0;

    if (bestPosition === 1) {
        user.data.wins++;
        user.data.points += points;
        alert(`🏆 VICTÒRIA! Has guanyat la cursa!\n+${points} punts al campionat`);
    } else if (bestPosition <= 3) {
        user.data.podiums++;
        user.data.points += points;
        const medal = bestPosition === 2 ? '🥈' : '🥉';
        alert(`${medal} Podi! Has quedat ${bestPosition}è!\n+${points} punts al campionat`);
    } else if (bestPosition <= 10) {
        user.data.points += points;
        alert(`Has acabat ${bestPosition}è\n+${points} punts al campionat`);
    } else {
        alert(`Has acabat ${bestPosition}è\nFora dels punts`);
    }

    // Premi en diners
    const prize = Math.max(100000, 1500000 - (bestPosition * 80000));
    user.data.budget += prize;

    saveUserData(user.data);
    updateUserInfo();

    alert(`Has guanyat ${formatMoney(prize)} de premi!`);
}