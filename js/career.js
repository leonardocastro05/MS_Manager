// Modo Carrera ARREGLAT amb 10 curses

const careerMode = {
    season: 1,
    totalSeasons: 10,
    currentRace: 0,
    races: [],
    standings: [],
    playerTeam: null,
    aiTeams: [],
    money: 5000000,
    hq: {
        engine: 0,
        aero: 0,
        chassis: 0
    }
};

// Inicialitzar una temporada nova
function startNewSeason(playerTeamName) {
    careerMode.season = 1;
    careerMode.currentRace = 0;
    careerMode.playerTeam = playerTeamName;
    careerMode.money = 5000000;
    careerMode.hq = { engine: 0, aero: 0, chassis: 0 };

    // ARREGLAT: Seleccionar 10 curses (tots els circuits disponibles + repeticions)
    const trackKeys = Object.keys(gameData.tracks);
    const selectedTracks = [];

    // Afegir tots els circuits disponibles
    trackKeys.forEach(key => selectedTracks.push(key));

    // Si hi ha menys de 10, repetir alguns aleatòriament
    while (selectedTracks.length < 10) {
        const randomTrack = trackKeys[Math.floor(Math.random() * trackKeys.length)];
        selectedTracks.push(randomTrack);
    }

    // Barrejar i agafar 10
    careerMode.races = shuffleArray(selectedTracks).slice(0, 10);

    // Inicialitzar IA
    careerMode.aiTeams = aiTeams.map(team => ({
        ...team,
        upgrades: { engine: 0, aero: 0, chassis: 0 },
        money: 5000000
    }));

    // Inicialitzar classificació
    careerMode.standings = [
        { team: playerTeamName, points: 0 },
        ...aiTeams.map(team => ({ team: team.name, points: 0 }))
    ];

    return true;
}

// Utilitat per barrejar array
function shuffleArray(array) {
    let arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Millorar cotxe (jugador o IA)
function upgradeCar(teamName, part) {
    let team = null;
    if (teamName === careerMode.playerTeam) {
        team = careerMode.hq;
        const baseCost = gameData.upgradeCosts[part];
        const cost = baseCost + (team[part] - 1) * 50000;

        if (careerMode.money >= cost) {
            team[part]++;
            careerMode.money -= cost;
            return true;
        }
        return false;
    } else {
        const ai = careerMode.aiTeams.find(t => t.name === teamName);
        const baseCost = gameData.upgradeCosts[part];
        if (ai && ai.money >= baseCost) {
            ai.upgrades[part]++;
            ai.money -= baseCost;
            return true;
        }
        return false;
    }
}

// Sumar diners
function addMoney(teamName, amount) {
    if (teamName === careerMode.playerTeam) {
        careerMode.money += amount;
    } else {
        const ai = careerMode.aiTeams.find(t => t.name === teamName);
        if (ai) ai.money += amount;
    }
}

// Sumar punts
function addPoints(teamName, points) {
    const entry = careerMode.standings.find(e => e.team === teamName);
    if (entry) entry.points += points;
}

// Avançar a la següent cursa
function nextRace() {
    if (careerMode.currentRace < careerMode.races.length - 1) {
        careerMode.currentRace++;

        // Simular millores IA aleatòries
        careerMode.aiTeams.forEach(team => {
            if (Math.random() < 0.3 && team.money >= 500000) {
                const parts = ['engine', 'aero', 'chassis'];
                const randomPart = parts[Math.floor(Math.random() * parts.length)];
                if (team.upgrades[randomPart] < 10) {
                    upgradeCar(team.name, randomPart);
                }
            }
        });

        return true;
    }
    return false;
}

// Obtenir upgrades d'un equip
function getTeamUpgrades(teamName) {
    if (teamName === careerMode.playerTeam) {
        return careerMode.hq;
    } else {
        const ai = careerMode.aiTeams.find(t => t.name === teamName);
        return ai ? ai.upgrades : { engine: 0, aero: 0, chassis: 0 };
    }
}

// Mostrar info del modo carrera
function updateCareerScreen() {
    // Verificar si carrera està inicialitzada
    const user = getCurrentUser();
    if (!user) return;

    if (!careerMode.playerTeam || careerMode.races.length === 0) {
        // Inicialitzar automàticament
        startNewSeason(user.data.teamName);
    }

    // Diners
    document.getElementById('career-money').textContent =
        careerMode.money.toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' });

    // HQ
    document.getElementById('hq-engine-level').textContent = careerMode.hq.engine;
    document.getElementById('hq-aero-level').textContent = careerMode.hq.aero;
    document.getElementById('hq-chassis-level').textContent = careerMode.hq.chassis;

    // Temporada i cursa
    document.getElementById('career-season').textContent = careerMode.season;
    document.getElementById('career-total-seasons').textContent = careerMode.totalSeasons;
    document.getElementById('career-current-race').textContent = careerMode.currentRace + 1;
    document.getElementById('career-total-races').textContent = careerMode.races.length;

    // Barra de progrés
    let progress = (careerMode.currentRace) / (careerMode.races.length - 1) * 100;
    document.getElementById('career-progress-bar').style.width =
        (isNaN(progress) ? 0 : Math.max(0, progress)) + '%';

    // Calendari de curses
    let calendarHtml = careerMode.races.map((trackKey, i) => {
        let track = gameData.tracks[trackKey];
        let status = i < careerMode.currentRace ? 'completed' :
            (i === careerMode.currentRace ? 'current' : '');
        return `<div class="calendar-race ${status}">
            <div style='font-size:2em;'>${track.flag}</div>
            <div style='font-weight:bold;'>${track.name}</div>
            <div style='font-size:0.9em;opacity:0.7;'>${i + 1}a cursa</div>
        </div>`;
    }).join('');
    document.getElementById('career-calendar-list').innerHTML = calendarHtml;

    // Classificació
    let standings = careerMode.standings.slice().sort((a, b) => b.points - a.points);
    let medals = ['gold', 'silver', 'bronze'];
    let standingsHtml = standings.map((entry, i) => {
        let medalClass = i < 3 ? medals[i] : '';
        let medalIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        return `<div class="standings-card ${medalClass}">
            <div class='standings-pos'>${medalIcon || (i + 1)}</div>
            <div class='standings-team'>${entry.team}</div>
            <div class='standings-points'>${entry.points} pts</div>
        </div>`;
    }).join('');
    document.getElementById('career-standings-list').innerHTML = standingsHtml;
}

// Acció per avançar a la següent cursa
function nextCareerRace() {
    if (nextRace()) {
        updateCareerScreen();
        alert('✅ ¡Has avanzado a la siguiente carrera!');
    } else {
        alert('🏁 ¡La temporada ha terminado!\n\nClasificación final:\n' +
            careerMode.standings
                .slice()
                .sort((a, b) => b.points - a.points)
                .map((e, i) => `${i + 1}. ${e.team}: ${e.points} pts`)
                .slice(0, 5)
                .join('\n'));
    }
}