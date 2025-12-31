// ============================================
// SISTEMA DE LLIGUES ONLINE - COMPLET
// ============================================

// Variables globals
let currentLeague = null;
let currentRaceIndex = null;

/**
 * Obtenir ID de la lliga de la URL
 */
function getLeagueIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Carregar la lliga actual
 */
function loadLeague() {
    const leagueId = getLeagueIdFromURL();
    if (!leagueId) {
        alert('⚠️ No s\'ha especificat cap lliga!');
        window.location.href = 'online.html';
        return;
    }

    const user = getCurrentUser();
    if (!user || !user.data.onlineLeagues) {
        window.location.href = 'online.html';
        return;
    }

    currentLeague = user.data.onlineLeagues.find(l => l.id === leagueId);
    if (!currentLeague) {
        alert('⚠️ Lliga no trobada!');
        window.location.href = 'online.html';
        return;
    }

    // Inicialitzar dades de la lliga si no existeixen
    if (!currentLeague.calendar) {
        currentLeague.calendar = generateDefaultCalendar();
    }
    if (!currentLeague.standings) {
        currentLeague.standings = {};
    }
    if (typeof currentLeague.currentRace === 'undefined') {
        currentLeague.currentRace = 0;
    }

    updateLeagueHeader();
    updateUserInfo();
    loadCalendar();
    loadStandings();
    loadLeagueConfig();
}

/**
 * Actualitzar header amb info de la lliga
 */
function updateLeagueHeader() {
    const header = document.getElementById('league-header');
    if (!header) return;

    header.innerHTML = `
        <div style="font-size:3em; margin-bottom:12px;">${getFlagEmoji(currentLeague.country)}</div>
        <h1>${currentLeague.name}</h1>
        <p style="font-size:1.2em; opacity:0.8; margin-top:12px;">
            Propietari: ${currentLeague.owner} • Membres: ${currentLeague.members.length}
        </p>
        <p style="font-size:1em; opacity:0.6; margin-top:8px;">
            Cursa ${currentLeague.currentRace + 1} de ${currentLeague.calendar.length}
        </p>
    `;
}

/**
 * Actualitzar info d'usuari al header
 */
function updateUserInfo() {
    const user = getCurrentUser();
    if (!user || !user.data.online) return;

    const coinsEl = document.getElementById('league-user-coins');
    const xpEl = document.getElementById('league-user-xp');

    if (coinsEl) coinsEl.textContent = `🪙 ${user.data.online.coins}`;
    if (xpEl) xpEl.textContent = `⭐ Nv.${user.data.online.level}`;
}

/**
 * Generar calendari per defecte amb 5 circuits
 */
function generateDefaultCalendar() {
    const tracks = ['monaco', 'spa', 'monza', 'portimao', 'interlagos'];
    return tracks.map((track, i) => ({
        trackId: track,
        raceNumber: i + 1,
        completed: false,
        results: null
    }));
}

/**
 * Carregar calendari de curses
 */
function loadCalendar() {
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;

    grid.innerHTML = currentLeague.calendar.map((race, i) => {
        const track = gameData.tracks[race.trackId];
        const isCurrent = i === currentLeague.currentRace;
        const cardClass = race.completed ? 'completed' : (isCurrent ? 'current' : '');

        return `
            <div class="race-card ${cardClass}">
                <div style="font-size:3em; margin-bottom:12px;">${track.flag}</div>
                <h3 style="color:#ffd700; font-size:1.5em; margin-bottom:8px;">${track.name}</h3>
                <p style="font-size:1.1em; margin-bottom:16px;">Cursa ${race.raceNumber}</p>
                ${race.completed
                ? '<p style="color:#2ecc40; font-weight:bold;">✅ Completada</p>'
                : isCurrent
                    ? `<button class="btn-primary" onclick="openRaceModal(${i})">🏁 Córrer Ara</button>`
                    : '<p style="opacity:0.6;">⏳ Pendent</p>'
            }
            </div>
        `;
    }).join('');
}

/**
 * Carregar classificació
 */
function loadStandings() {
    const table = document.getElementById('standings-table');
    if (!table) return;

    const standings = Object.entries(currentLeague.standings || {})
        .map(([user, points]) => ({ user, points }))
        .sort((a, b) => b.points - a.points);

    if (standings.length === 0) {
        table.innerHTML = '<p style="text-align:center; opacity:0.6; padding:40px;">Encara no hi ha resultats</p>';
        return;
    }

    table.innerHTML = standings.map((entry, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        const rowClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';

        return `
            <div class="standings-row ${rowClass}">
                <div style="font-size:2em; min-width:60px; text-align:center;">${medal || (i + 1)}</div>
                <div style="flex:1; font-size:1.2em; font-weight:bold;">${entry.user}</div>
                <div style="font-size:1.5em; color:#ffd700; font-weight:bold;">${entry.points} pts</div>
            </div>
        `;
    }).join('');
}

/**
 * Carregar configuració de la lliga
 */
function loadLeagueConfig() {
    const content = document.getElementById('league-config-content');
    if (!content) return;

    const user = getCurrentUser();
    const isOwner = currentLeague.owner === user.username;

    if (!isOwner) {
        content.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <p style="font-size:1.2em; margin-bottom:16px;">Només el propietari pot modificar la configuració de la lliga.</p>
                <p style="opacity:0.6;">Propietari: ${currentLeague.owner}</p>
            </div>
        `;
        return;
    }

    content.innerHTML = `
        <div class="config-form">
            <h3 style="color:#ffd700; margin-bottom:16px;">Editar Lliga</h3>
            
            <label>Nom de la lliga:</label>
            <input type="text" id="edit-league-name" value="${currentLeague.name}" maxlength="32">

            <label>País:</label>
            <select id="edit-league-country">
                ${getCountryOptions(currentLeague.country)}
            </select>

            <label>Color:</label>
            <input type="color" id="edit-league-color" value="${currentLeague.color}">

            <button class="btn-primary" onclick="saveLeagueConfig()">💾 Desar Canvis</button>
            <button class="btn-danger" onclick="openDeleteModal()">🗑️ Eliminar Lliga</button>
        </div>
    `;
}

/**
 * Desar configuració del cotxe
 */
function saveCarConfig() {
    const user = getCurrentUser();
    if (!user) return;

    const config = {
        defaultTyre: document.getElementById('car-default-tyre').value,
        drivingStyle: document.getElementById('car-driving-style').value,
        frontWing: document.getElementById('car-front-wing').value,
        rearWing: document.getElementById('car-rear-wing').value
    };

    if (!user.data.leagueCarConfig) user.data.leagueCarConfig = {};
    user.data.leagueCarConfig[currentLeague.id] = config;

    saveUserData(user.data);
    alert('✅ Configuració del cotxe desada!');
}

/**
 * Desar configuració de la lliga
 */
function saveLeagueConfig() {
    currentLeague.name = document.getElementById('edit-league-name').value;
    currentLeague.country = document.getElementById('edit-league-country').value;
    currentLeague.color = document.getElementById('edit-league-color').value;

    const user = getCurrentUser();
    const leagueIndex = user.data.onlineLeagues.findIndex(l => l.id === currentLeague.id);
    user.data.onlineLeagues[leagueIndex] = currentLeague;

    saveUserData(user.data);
    updateLeagueHeader();
    alert('✅ Lliga actualitzada!');
}

/**
 * Obrir modal per començar cursa
 */
function openRaceModal(raceIndex) {
    currentRaceIndex = raceIndex;
    const race = currentLeague.calendar[raceIndex];
    const track = gameData.tracks[race.trackId];

    document.getElementById('race-info').innerHTML = `
        <div style="font-size:3em; margin-bottom:12px;">${track.flag}</div>
        <h3 style="color:#ffd700; font-size:1.8em;">${track.name}</h3>
        <p style="font-size:1.2em; margin:16px 0;">Cursa ${race.raceNumber}</p>
        <p style="opacity:0.8;">${track.laps} voltes • Dificultat: ${track.difficulty}</p>
    `;

    document.getElementById('race-modal').classList.add('active');
}

/**
 * Tancar modal de cursa
 */
function closeRaceModal() {
    document.getElementById('race-modal').classList.remove('active');
}

/**
 * Començar cursa de lliga
 */
function startLeagueRace() {
    const race = currentLeague.calendar[currentRaceIndex];

    // Guardar info de la lliga per usar-la després de la cursa
    sessionStorage.setItem('leagueRaceInfo', JSON.stringify({
        leagueId: currentLeague.id,
        raceIndex: currentRaceIndex,
        trackId: race.trackId
    }));

    // Redirigir a la pàgina dedicada de curses de lliga
    window.location.href = `league-race.html`;
}

/**
 * Obrir modal d'eliminació
 */
function openDeleteModal() {
    document.getElementById('delete-modal').classList.add('active');
}

/**
 * Tancar modal d'eliminació
 */
function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
    document.getElementById('delete-confirmation').value = '';
}

/**
 * Confirmar eliminació de la lliga
 */
function confirmDeleteLeague() {
    const input = document.getElementById('delete-confirmation').value;
    if (input !== currentLeague.name) {
        alert('⚠️ El nom no coincideix!');
        return;
    }

    const user = getCurrentUser();
    user.data.onlineLeagues = user.data.onlineLeagues.filter(l => l.id !== currentLeague.id);
    saveUserData(user.data);

    alert('✅ Lliga eliminada!');
    window.location.href = 'online.html';
}

/**
 * Canviar de tab
 */
function showLeagueTab(tabName) {
    // Actualitzar botons
    document.querySelectorAll('.league-tab').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Mostrar secció
    document.querySelectorAll('.league-section').forEach(section => section.classList.remove('active'));
    const targetSection = document.getElementById('tab-' + tabName);
    if (targetSection) targetSection.classList.add('active');
}

/**
 * Opcions de països per al select
 */
function getCountryOptions(selected) {
    const countries = [
        { code: 'ES', name: 'Espanya' }, { code: 'FR', name: 'França' }, { code: 'IT', name: 'Itàlia' },
        { code: 'GB', name: 'Regne Unit' }, { code: 'DE', name: 'Alemanya' }, { code: 'PT', name: 'Portugal' },
        { code: 'US', name: 'Estats Units' }, { code: 'BR', name: 'Brasil' }, { code: 'AR', name: 'Argentina' },
        { code: 'JP', name: 'Japó' }, { code: 'AU', name: 'Austràlia' }, { code: 'CA', name: 'Canadà' }
    ];
    return countries.map(c =>
        `<option value="${c.code}" ${c.code === selected ? 'selected' : ''}>${c.name}</option>`
    ).join('');
}

/**
 * Emoji de bandera a partir del codi de país
 */
function getFlagEmoji(code) {
    if (!code) return '';
    return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt()));
}

/**
 * Inicialització quan es carrega la pàgina
 */
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        loadLeague();

        // Listeners per als sliders
        const frontWing = document.getElementById('car-front-wing');
        const rearWing = document.getElementById('car-rear-wing');

        if (frontWing) {
            frontWing.addEventListener('input', (e) => {
                document.getElementById('front-wing-value').textContent = e.target.value;
            });
        }

        if (rearWing) {
            rearWing.addEventListener('input', (e) => {
                document.getElementById('rear-wing-value').textContent = e.target.value;
            });
        }
    });
}