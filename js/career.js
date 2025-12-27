// Modo Carrera: estructura bàsica de temporada i curses

const careerMode = {
    season: 1,
    totalSeasons: 10,
    currentRace: 0,
    races: [], // S'omplirà amb l'ordre de circuits
    standings: [], // Classificació general
    playerTeam: null, // Nom de l'equip del jugador
    aiTeams: [], // Equips IA amb millores i diners
    money: 0, // Diners del jugador
    hq: {
        engine: 0,
        aero: 0,
        chassis: 0
    },
    // Afegirem més camps segons calgui
};

// Inicialitzar una temporada nova function startNewSeason(playerTeamName) {
    careerMode.season++;
    careerMode.currentRace = 0;
    careerMode.playerTeam = playerTeamName;
    careerMode.money = 5000000; // Ex: diners inicials
    careerMode.hq = { engine: 0, aero: 0, chassis: 0 };
    // Barrejar circuits per la temporada
    const trackKeys = Object.keys(gameData.tracks);
    careerMode.races = shuffleArray(trackKeys).slice(0, 10); // 10 curses per temporada
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
    // part: 'engine', 'aero', 'chassis'
    let team = null;
    if (teamName === careerMode.playerTeam) {
        team = careerMode.hq;
        if (careerMode.money >= gameData.upgradeCosts[part]) {
            team[part]++;
            careerMode.money -= gameData.upgradeCosts[part];
            return true;
        }
        return false;
    } else {
        // IA
        const ai = careerMode.aiTeams.find(t => t.name === teamName);
        if (ai && ai.money >= gameData.upgradeCosts[part]) {
            ai.upgrades[part]++;
            ai.money -= gameData.upgradeCosts[part];
            return true;
        }
        return false;
    }
}

// Sumar diners (després de cada cursa)
function addMoney(teamName, amount) {
    if (teamName === careerMode.playerTeam) {
        careerMode.money += amount;
    } else {
        const ai = careerMode.aiTeams.find(t => t.name === teamName);
        if (ai) ai.money += amount;
    }
}

// Sumar punts a la classificació
function addPoints(teamName, points) {
    const entry = careerMode.standings.find(e => e.team === teamName);
    if (entry) entry.points += points;
}

// Avançar a la següent cursa
function nextRace() {
    if (careerMode.currentRace < careerMode.races.length - 1) {
        careerMode.currentRace++;
        return true;
    }
    return false;
}

// Obtenir upgrades d'un equip (jugador o IA)
function getTeamUpgrades(teamName) {
    if (teamName === careerMode.playerTeam) {
        return careerMode.hq;
    } else {
        const ai = careerMode.aiTeams.find(t => t.name === teamName);
        return ai ? ai.upgrades : { engine: 0, aero: 0, chassis: 0 };
    }
}
