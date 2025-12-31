// ============================================
// SISTEMA DE CURSES PER LLIGUES ONLINE
// ============================================

// Variables globals del sistema de curses de lliga
const leagueRaceState = {
    selectedTrack: null,
    interval: null,
    isRunning: false,
    positions: [],
    currentLap: 0
};

/**
 * Inicialitza tots els pilots de la cursa de lliga
 * Utilitza el pilot i mànager ONLINE, no els contractats offline
 */
function initializeLeagueRace() {
    const user = getCurrentUser();
    const track = gameData.tracks[leagueRaceState.selectedTrack];

    // Assegurar que té dades online
    if (!user.data.online) {
        initializeOnlineData(user);
    }

    leagueRaceState.positions = [];

    // Pilot 1 Online (sempre disponible)
    const tyreChoice1 = document.getElementById('driver1-tyres').value;
    const tyreStats1 = gameData.tyreStrategies[tyreChoice1];

    // Calcular habilitat del pilot online
    const onlineDriverSkill = 50 + (user.data.online.driverLevel * 2); // 50 base + 2 per nivell

    // Calcular rendiment amb millores ONLINE + HQ
    const performance1 = calculateLeagueDriverPerformance(
        onlineDriverSkill,
        user.data.upgrades, // Millores HQ
        user.data.online.carUpgrades, // Millores online
        user.data.online.managerLevel, // Mànager online
        tyreStats1
    );

    leagueRaceState.positions.push({
        name: `${user.username} #1`,
        team: user.data.teamName,
        performance: performance1,
        position: 0,
        lapProgress: Math.random() * 2,
        completedLaps: 0,
        color: user.data.online.carConfig?.color || '#FFD700',
        isPlayer: true
    });

    // Pilot 2 Online (opcional, lleugerament més lent)
    const tyreChoice2 = document.getElementById('driver2-tyres').value;
    const tyreStats2 = gameData.tyreStrategies[tyreChoice2];

    const performance2 = calculateLeagueDriverPerformance(
        onlineDriverSkill - 3, // Lleugerament més lent
        user.data.upgrades,
        user.data.online.carUpgrades,
        user.data.online.managerLevel,
        tyreStats2
    );

    leagueRaceState.positions.push({
        name: `${user.username} #2`,
        team: user.data.teamName,
        performance: performance2,
        position: 0,
        lapProgress: Math.random() * 2,
        completedLaps: 0,
        color: user.data.online.carConfig?.color || '#FFD700',
        isPlayer: true
    });

    // Afegir equips IA
    aiTeams.forEach(team => {
        const upgrades = { engine: 5, aero: 5, chassis: 5 }; // IA amb millores mitjanes

        // Pilot 1 IA
        const aiPerformance1 = calculateLeagueDriverPerformance(
            team.skill,
            upgrades,
            { engine: 0, aero: 0, chassis: 0 }, // IA sense millores online
            5, // Mànager nivell 5
            gameData.tyreStrategies.medium
        ) + (Math.random() * 10 - 5);

        leagueRaceState.positions.push({
            name: team.driver1,
            team: team.name,
            performance: aiPerformance1,
            position: 0,
            lapProgress: Math.random() * 2,
            completedLaps: 0,
            color: team.color,
            isPlayer: false
        });

        // Pilot 2 IA
        leagueRaceState.positions.push({
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

    updateLeaguePositions();
    updateLeagueDriverMarkers();
}

/**
 * Calcula el rendiment d'un pilot de lliga
 * Combina millores HQ + millores online + mànager online
 */
function calculateLeagueDriverPerformance(baseSkill, hqUpgrades, onlineUpgrades, managerLevel, tyreStats) {
    // Bonus HQ (millores base del joc)
    const engineBonus = 1 + (hqUpgrades.engine || 0) / 20;
    const aeroBonus = 1 + (hqUpgrades.aero || 0) / 25;
    const chassisBonus = 1 + (hqUpgrades.chassis || 0) / 25;

    // Bonus online (millores específiques online)
    const onlineEngineBonus = 1 + (onlineUpgrades.engine || 0) / 30;
    const onlineAeroBonus = 1 + (onlineUpgrades.aero || 0) / 30;
    const onlineChassisBonus = 1 + (onlineUpgrades.chassis || 0) / 30;

    // Bonus mànager online
    const managerBonus = 1 + (managerLevel || 1) / 100;

    // Bonus neumàtics
    const tyreBonus = tyreStats.speed;

    return baseSkill *
        engineBonus * aeroBonus * chassisBonus *
        onlineEngineBonus * onlineAeroBonus * onlineChassisBonus *
        managerBonus * tyreBonus;
}

/**
 * Executa la simulació de la cursa de lliga
 */
function runLeagueRaceLoop() {
    const track = gameData.tracks[leagueRaceState.selectedTrack];

    leagueRaceState.interval = setInterval(() => {
        if (!leagueRaceState.isRunning) return;

        let raceFinished = true;

        leagueRaceState.positions.forEach(driver => {
            if (driver.completedLaps < track.laps) {
                raceFinished = false;

                const increment = (driver.performance / 100) * (Math.random() * 0.5 + 0.75);
                driver.lapProgress += increment;

                if (driver.lapProgress >= 100) {
                    driver.completedLaps++;
                    driver.lapProgress -= 100;
                }
            } else {
                driver.lapProgress = 100;
            }
        });

        // Actualitzar comptador de voltes
        const maxLaps = Math.max(...leagueRaceState.positions.map(d => d.completedLaps));
        leagueRaceState.currentLap = maxLaps;
        const lapDisplay = document.getElementById('current-lap');
        if (lapDisplay) lapDisplay.textContent = leagueRaceState.currentLap;

        if (raceFinished) {
            endLeagueRace();
            return;
        }

        updateLeaguePositions();
        updateLeagueDriverMarkers();
        displayLeagueRacePositions();

    }, 100);
}

/**
 * Ordena els pilots per posició
 */
function updateLeaguePositions() {
    leagueRaceState.positions.forEach(driver => {
        driver.progress = (driver.completedLaps * 100) + driver.lapProgress;
    });

    leagueRaceState.positions.sort((a, b) => b.progress - a.progress);

    leagueRaceState.positions.forEach((driver, index) => {
        driver.position = index + 1;
    });
}

/**
 * Actualitza els marcadors visuals dels pilots
 */
function updateLeagueDriverMarkers() {
    const raceTrack = document.getElementById('race-track');
    if (!raceTrack) return;

    raceTrack.querySelectorAll('.driver-marker').forEach(m => m.remove());

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

    leagueRaceState.positions.forEach(driver => {
        const marker = createLeagueDriverMarker(driver, path, pathLength, svg, raceTrack);
        raceTrack.appendChild(marker);
    });
}

/**
 * Crea un marcador visual per un pilot
 */
function createLeagueDriverMarker(driver, path, pathLength, svg, container) {
    const marker = document.createElement('div');
    marker.className = 'driver-marker';
    marker.style.backgroundColor = driver.color;
    marker.style.border = driver.isPlayer ? '3px solid gold' : '2px solid white';
    marker.textContent = driver.position;

    let x = 0, y = 0;

    if (path && pathLength > 0) {
        const progressPercent = Math.max(0, Math.min(100, driver.lapProgress));
        const distance = (progressPercent / 100) * pathLength;
        const point = path.getPointAtLength(distance);

        const svgPt = svg.createSVGPoint();
        svgPt.x = point.x;
        svgPt.y = point.y;
        const screenPt = svgPt.matrixTransform(svg.getScreenCTM());
        const svgRect = svg.getBoundingClientRect();

        x = screenPt.x - svgRect.left;
        y = screenPt.y - svgRect.top;
    } else {
        const angle = (driver.lapProgress / 100) * Math.PI * 2;
        const centerX = container.offsetWidth / 2;
        const centerY = container.offsetHeight / 2;
        const radiusX = centerX - 80;
        const radiusY = centerY - 80;

        x = centerX + radiusX * Math.cos(angle);
        y = centerY + radiusY * Math.sin(angle);
    }

    marker.style.left = (x - 15) + 'px';
    marker.style.top = (y - 15) + 'px';

    return marker;
}

/**
 * Mostra la classificació actual
 */
function displayLeagueRacePositions() {
    const positionsList = document.getElementById('positions-list');
    const track = gameData.tracks[leagueRaceState.selectedTrack];

    positionsList.innerHTML = leagueRaceState.positions.map(driver => {
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

/**
 * Pausa o reprèn la cursa
 */
function pauseLeagueRace() {
    leagueRaceState.isRunning = !leagueRaceState.isRunning;
    const btn = document.getElementById('pause-race-btn');
    if (btn) {
        btn.textContent = leagueRaceState.isRunning ? '⏸️ Pausar' : '▶️ Continuar';
    }
}

/**
 * Finalitza la cursa de lliga
 */
function endLeagueRace() {
    clearInterval(leagueRaceState.interval);
    leagueRaceState.isRunning = false;

    document.getElementById('start-race-btn').style.display = 'inline-block';
    document.getElementById('pause-race-btn').style.display = 'none';

    const user = getCurrentUser();
    const info = JSON.parse(sessionStorage.getItem('leagueRaceInfo'));

    if (!user || !info) {
        alert('⚠️ Error guardant els resultats!');
        return;
    }

    // Trobar millor posició dels pilots del jugador
    const playerPositions = leagueRaceState.positions
        .filter(d => d.isPlayer)
        .map(d => d.position);
    const bestPosition = Math.min(...playerPositions);

    // Sistema de punts F1
    const pointsSystem = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    const points = bestPosition <= 10 ? pointsSystem[bestPosition - 1] : 0;

    // Actualitzar estadístiques globals
    if (bestPosition === 1) user.data.wins++;
    if (bestPosition <= 3) user.data.podiums++;
    user.data.points += points;

    const prize = Math.max(100000, 1500000 - (bestPosition * 80000));
    user.data.budget += prize;

    // Actualitzar estadístiques online
    user.data.online.totalRaces++;
    if (bestPosition === 1) user.data.online.onlineWins++;
    if (bestPosition <= 3) user.data.online.onlinePodiums++;

    // Actualitzar lliga
    const league = user.data.onlineLeagues.find(l => l.id === info.leagueId);
    if (league) {
        if (!league.standings) league.standings = {};

        if (!league.standings[user.username]) {
            league.standings[user.username] = 0;
        }
        league.standings[user.username] += points;

        // Marcar cursa com completada
        if (league.calendar[info.raceIndex]) {
            league.calendar[info.raceIndex].completed = true;
            league.calendar[info.raceIndex].results = {
                position: bestPosition,
                points
            };
        }

        // Avançar a la següent cursa
        league.currentRace = Math.min(
            (league.currentRace || 0) + 1,
            league.calendar.length - 1
        );
    }

    saveUserData(user.data);
    updateUserInfo();

    // Mostrar resultats
    let message = '';
    if (bestPosition === 1) {
        message = `🏆 VICTÒRIA!\n\nHas guanyat la cursa!`;
    } else if (bestPosition === 2) {
        message = `🥈 Segon lloc!\n\nGran cursa!`;
    } else if (bestPosition === 3) {
        message = `🥉 Tercer lloc!\n\nPodi!`;
    } else if (bestPosition <= 10) {
        message = `Posició: ${bestPosition}è\n\nDins dels punts!`;
    } else {
        message = `Posició: ${bestPosition}è\n\nFora dels punts`;
    }

    message += `\n\n📊 Punts: +${points}`;
    message += `\n💰 Premi: ${formatMoney(prize)}`;
    message += `\n\n🏆 Total punts lliga: ${league.standings[user.username]} pts`;

    alert(message);

    // Preguntar si vol tornar a la lliga
    setTimeout(() => {
        if (confirm('✅ Cursa completada!\n\nVols tornar a la lliga?')) {
            window.location.href = `liga.html?id=${info.leagueId}`;
        }
    }, 500);
}