// ============================================
// SISTEMA DE CURSES PER LLIGUES ONLINE
// ============================================

// Variables globals del sistema de curses de lliga
const leagueRaceState = {
    selectedTrack: null,
    interval: null,
    isRunning: false,
    positions: [],
    currentLap: 0,
    qualifyingActive: false,
    qualifyingLap: 0,
    qualifyingTimes: []
};

/**
 * Sistema de qualificació de 3 voltes
 */
function startQualifying() {
    const user = getCurrentUser();
    if (!user) return;

    // Inicialitzar qualificació
    leagueRaceState.qualifyingActive = true;
    leagueRaceState.qualifyingLap = 0;
    leagueRaceState.qualifyingTimes = [];

    // Ocultar botó de qualificació
    document.getElementById('start-qualifying-btn').style.display = 'none';

    showInfo('🏁 Qualificació', 'Faràs <b>3 voltes</b> per determinar la teva posició de sortida.<br><br>El teu millor temps determinarà la graella de sortida!', () => {
        // Modificar nombre de voltes per qualificació
        leagueRaceState.selectedTrack = sessionStorage.getItem('selectedTrack') || 'monaco';
        const track = gameData.tracks[leagueRaceState.selectedTrack];
        
        // Guardar voltes originals
        if (!track.originalLaps) {
            track.originalLaps = track.laps;
        }
        track.laps = 3; // Només 3 voltes per qualificació
        
        // Inicialitzar cursa de qualificació
        leagueRaceState.isRunning = true;
        leagueRaceState.currentLap = 0;
        
        initializeLeagueRace();
        runLeagueRaceLoop();
    });
}

/**
 * Finalitza la qualificació i estableix ordre de sortida
 */
function endQualifying() {
    leagueRaceState.qualifyingActive = false;
    
    // Calcular millor temps del jugador
    const playerDriver = leagueRaceState.positions.find(d => d.isPlayer);
    const playerTime = playerDriver ? calculateQualifyingTime(playerDriver.performance) : 99999;
    
    // Simular temps de qualificació per altres jugadors (si n'hi ha)
    leagueRaceState.positions.forEach(driver => {
        driver.qualifyingTime = calculateQualifyingTime(driver.performance);
    });
    
    // Ordenar per temps de qualificació
    leagueRaceState.positions.sort((a, b) => a.qualifyingTime - b.qualifyingTime);
    
    // Assignar posicions de sortida
    leagueRaceState.positions.forEach((driver, index) => {
        driver.gridPosition = index + 1;
        driver.position = index + 1;
    });
    
    const playerPosition = playerDriver.gridPosition;
    
    // Restaurar nombre de voltes original
    const track = leagueRaceState.selectedTrack;
    gameData.tracks[track].laps = gameData.tracks[track].originalLaps || 50;
    
    // Mostrar resultats amb pop-up
    showSuccess(
        '🏁 Qualificació Completada!',
        `📊 La teva posició: <b>${playerPosition}è</b><br>⏱️ Temps: <b>${formatQualifyingTime(playerTime)}</b><br><br>✅ Ara pots començar la cursa!`,
        () => {
            // Mostrar botó de començar cursa
            document.getElementById('start-race-btn').style.display = 'inline-block';
        }
    );
    
    // Mostrar botó de començar cursa
    document.getElementById('start-race-btn').style.display = 'inline-block';
    
    // Reiniciar per a la cursa real
    leagueRaceState.positions.forEach(driver => {
        driver.completedLaps = 0;
        driver.lapProgress = 0;
    });
}

/**
 * Calcula un temps de qualificació basat en el rendiment
 */
function calculateQualifyingTime(performance) {
    // Temps base (en segons) + variabilitat segons rendiment
    const baseTime = 90; // 1:30 base
    const variance = (100 - performance) / 10; // Més rendiment = menys temps
    const randomFactor = Math.random() * 2 - 1; // ±1 segon aleatori
    
    return baseTime + variance + randomFactor;
}

/**
 * Formata el temps de qualificació
 */
function formatQualifyingTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${minutes}:${secs.padStart(6, '0')}`;
}

/**
 * Inicialitza tots els pilots de la cursa de lliga
 * Utilitza el pilot i mànager ONLINE, no els contractats offline
 * ARREGLAT: Permet córrer amb UN SOL PILOT al modo online
 */
function initializeLeagueRace() {
    const user = getCurrentUser();
    const track = gameData.tracks[leagueRaceState.selectedTrack];

    // Assegurar que té dades online
    if (!user.data.online) {
        initializeOnlineData(user);
    }

    leagueRaceState.positions = [];

    // Pilot Online (sempre disponible)
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
        name: `${user.username}`,
        team: user.data.teamName,
        performance: performance1,
        position: 0,
        lapProgress: Math.random() * 2,
        completedLaps: 0,
        color: user.data.online.carConfig?.color || '#FFD700',
        isPlayer: true
    });

    // ============================================
    // MODO ONLINE: NOMÉS JUGADORS REALS
    // No afegir IA - només es mostren jugadors de la lliga
    // ============================================
    
    // TODO: Aquí s'haurien d'afegir els altres jugadors reals de la lliga
    // Per ara, si només hi ha un jugador, la cursa continua però sense oponents IA
    
    console.log('🏁 Cursa online iniciada amb', leagueRaceState.positions.length, 'jugadors reals');

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
        
        // Actualitzar indicadors de sectors si la funció existeix
        if (typeof updateEnhancedRaceDisplay === 'function') {
            updateEnhancedRaceDisplay();
        }

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

    // Si és qualificació, finalitzar-la
    if (leagueRaceState.qualifyingActive) {
        endQualifying();
        return;
    }

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

    // ============================================
    // SISTEMA DE RECOMPENSES POST-CURSA
    // ============================================
    
    // Diners base segons posició
    const basePrize = Math.max(100000, 1500000 - (bestPosition * 80000));
    
    // Bonus de mànager (entre 1% i 20%)
    const managerBonus = user.data.online.managerLevel * 2; // 2% per nivell
    const managerMultiplier = 1 + (managerBonus / 100);
    
    // Premi final amb bonus de mànager
    const prize = Math.floor(basePrize * managerMultiplier);
    user.data.budget += prize;
    
    // XP segons posició (més XP per millors posicions)
    const xpRewards = [150, 120, 100, 85, 70, 60, 50, 40, 30, 25];
    const baseXP = bestPosition <= 10 ? xpRewards[bestPosition - 1] : 15;
    
    // XP amb bonus de mànager
    const totalXP = Math.floor(baseXP * managerMultiplier);
    
    // Inicialitzar valors si no existeixen
    if (!user.data.online.driverXP) user.data.online.driverXP = 0;
    if (!user.data.online.driverLevel) user.data.online.driverLevel = 1;
    
    // NIVELL MÀXIM DEL PILOT: 20
    const MAX_DRIVER_LEVEL = 20;
    const xpPerLevel = 200;
    
    let leveledUp = false;
    let levelsGained = 0;
    
    // Afegir XP al pilot online
    user.data.online.driverXP += totalXP;
    
    // Sistema de nivells del pilot amb màxim
    if (user.data.online.driverLevel < MAX_DRIVER_LEVEL) {
        while (user.data.online.driverXP >= xpPerLevel && user.data.online.driverLevel < MAX_DRIVER_LEVEL) {
            user.data.online.driverLevel++;
            user.data.online.driverXP -= xpPerLevel;
            leveledUp = true;
            levelsGained++;
        }
    } else {
        // Si ja està al màxim, acumular XP però no pujar més
        // L'XP segueix sent útil per desbloquejar millores especials (futur)
        if (user.data.online.driverXP >= xpPerLevel) {
            user.data.online.driverXP = xpPerLevel - 1; // Cap al màxim
        }
    }
    
    // Missions de patrocinadors (si existeixen)
    let sponsorBonus = 0;
    if (user.data.online.sponsors && user.data.online.sponsors.length > 0) {
        user.data.online.sponsors.forEach(sponsor => {
            // Comprovar si compleix objectius del patrocinador
            if (sponsor.mission === 'top3' && bestPosition <= 3) {
                sponsorBonus += sponsor.reward;
                sponsor.completed = true;
            } else if (sponsor.mission === 'top10' && bestPosition <= 10) {
                sponsorBonus += sponsor.reward;
                sponsor.completed = true;
            } else if (sponsor.mission === 'win' && bestPosition === 1) {
                sponsorBonus += sponsor.reward;
                sponsor.completed = true;
            }
        });
        
        if (sponsorBonus > 0) {
            user.data.budget += sponsorBonus;
        }
    }

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

    // Mostrar resultats amb totes les recompenses
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

    message += `\n\n📊 Punts Campionat: +${points}`;
    message += `\n💰 Premi base: ${formatMoney(basePrize)}`;
    
    if (managerBonus > 0) {
        message += `\n🎯 Bonus mànager (+${managerBonus}%): ${formatMoney(prize - basePrize)}`;
    }
    
    message += `\n💵 Total guanyat: ${formatMoney(prize)}`;
    
    // XP del pilot amb indicador de nivell màxim
    message += `\n\n⭐ XP guanyat: +${totalXP} XP`;
    
    if (user.data.online.driverLevel >= MAX_DRIVER_LEVEL) {
        message += `\n🏎️ Nivell pilot: ${user.data.online.driverLevel} (NIVELL MÀXIM!)`;
        message += `\n✨ El teu pilot ha arribat al nivell màxim!`;
    } else {
        message += `\n🏎️ Nivell pilot: ${user.data.online.driverLevel} (${user.data.online.driverXP}/${xpPerLevel} XP)`;
        
        // Mostrar si ha pujat de nivell
        if (leveledUp) {
            if (levelsGained === 1) {
                message += `\n🎉 Has pujat 1 nivell!`;
            } else {
                message += `\n🎉 Has pujat ${levelsGained} nivells!`;
            }
        }
    }
    
    // Bonus patrocinadors
    if (sponsorBonus > 0) {
        message += `\n\n🏢 Missions patrocinadors completades!`;
        message += `\n💰 Bonus extra: ${formatMoney(sponsorBonus)}`;
    }
    
    message += `\n\n🏆 Total punts lliga: ${league.standings[user.username]} pts`;

    alert(message);

    // Preguntar si vol tornar a la lliga
    setTimeout(() => {
        if (confirm('✅ Cursa completada!\n\nVols tornar a la lliga?')) {
            window.location.href = `liga.html?id=${info.leagueId}`;
        }
    }, 500);
}

// ============================================
// SISTEMA DE PARADA A BOXES EN DIRECTE
// ============================================

/**
 * Mostra el botó de boxes durant la cursa
 */
function showPitStopButton() {
    const pitBtn = document.getElementById('pitstop-btn');
    if (pitBtn && leagueRaceState.isRunning) {
        pitBtn.style.display = 'inline-block';
    }
}

/**
 * Obre el panel de parada a boxes
 */
function enterPitStop() {
    // Pausar cursa temporalment
    leagueRaceState.isRunning = false;
    
    // Mostrar panel
    document.getElementById('pitstop-panel').style.display = 'block';
}

/**
 * Tanca el panel sense canviar res
 */
function closePitStopPanel() {
    document.getElementById('pitstop-panel').style.display = 'none';
    leagueRaceState.isRunning = true;
}

/**
 * Canvia els neumàtics i perd temps
 */
function changeTyres(tyreType) {
    const user = getCurrentUser();
    const playerDriver = leagueRaceState.positions.find(d => d.isPlayer);
    
    if (!playerDriver) return;
    
    // Temps de boxes (perd posicions)
    const pitStopTime = 3; // segons ~ 3% de progrés de volta perdut
    playerDriver.lapProgress -= pitStopTime;
    
    if (playerDriver.lapProgress < 0) {
        playerDriver.completedLaps--;
        playerDriver.lapProgress += 100;
    }
    
    // Actualitzar rendiment segons nous neumàtics
    const tyreStats = gameData.tyreStrategies[tyreType];
    const onlineDriverSkill = 50 + (user.data.online.driverLevel * 2);
    
    const newPerformance = calculateLeagueDriverPerformance(
        onlineDriverSkill,
        user.data.upgrades,
        user.data.online.carUpgrades,
        user.data.online.managerLevel,
        tyreStats
    );
    
    playerDriver.performance = newPerformance;
    playerDriver.currentTyres = tyreType;
    
    // Mostrar missatge
    let tyreName = '';
    if (tyreType === 'soft') tyreName = '🔴 Tous';
    else if (tyreType === 'medium') tyreName = '🟡 Mitjans';
    else if (tyreType === 'hard') tyreName = '⚪ Durs';
    
    // Tancar panel i continuar
    document.getElementById('pitstop-panel').style.display = 'none';
    leagueRaceState.isRunning = true;
    
    // Notificació
    setTimeout(() => {
        alert(`✅ Parada a boxes completada!\n\nNous neumàtics: ${tyreName}\n⏱️ Temps perdut: ${pitStopTime} segons`);
    }, 100);
}