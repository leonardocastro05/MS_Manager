// ============================================
// Lligues Online - Gestió bàsica local
// ============================================

/**
 * Crea una nova lliga i la desa a localStorage (o a l'usuari)
 * @param {Object} leagueData - { name, country, color }
 */
function createLeague(leagueData) {
    const user = getCurrentUser();
    if (!user) return;
    if (!user.data.onlineLeagues) user.data.onlineLeagues = [];
    const league = {
        id: 'lg_' + Date.now(),
        name: leagueData.name,
        country: leagueData.country,
        color: leagueData.color,
        created: new Date().toISOString(),
        members: [user.username],
        owner: user.username
    };
    user.data.onlineLeagues.push(league);
    saveUserData(user.data);
    loadLeaguesList();
}

/**
 * Carrega la llista de lligues de l'usuari i les mostra
 */
function loadLeaguesList() {
    const user = getCurrentUser();
    const leaguesDiv = document.getElementById('leagues-list');
    if (!user || !leaguesDiv) return;
    const leagues = user.data.onlineLeagues || [];
    if (leagues.length === 0) {
        leaguesDiv.innerHTML = '<div class="league-card">Encara no tens cap lliga. Crea la teva!</div>';
    } else {
        leaguesDiv.innerHTML = leagues.map(lg => `
            <div class="league-card" style="border-left:8px solid ${lg.color};">
                <b>${lg.name}</b> <span style="font-size:1.1em;">${getFlagEmoji(lg.country)}</span><br>
                <span style="font-size:0.95em;">Propietari: ${lg.owner}</span><br>
                <span style="font-size:0.95em;">Membres: ${lg.members.length}</span>
            </div>
        `).join('');
    }
    // Assegura el listener del botó cada cop que es mostra la secció
    setTimeout(function() {
        const btn = document.getElementById('create-league-btn');
        if (btn) btn.onclick = showCreateLeagueForm;
    }, 0);
}

/**
 * Mostra el formulari per crear una lliga
 */
function showCreateLeagueForm() {
    const leaguesDiv = document.getElementById('leagues-list');
    if (!leaguesDiv) return;
    leaguesDiv.innerHTML = `
        <form id="league-form" class="league-card" style="background:#232526; color:#FFD700;">
            <label>Nom de la lliga:<br><input type="text" id="league-name" required maxlength="32" style="width:90%"></label><br>
            <label>País:<br><select id="league-country">${countryOptions()}</select></label><br>
            <label>Color:<br><input type="color" id="league-color" value="#FFD700"></label><br>
            <button type="submit">Crear</button>
            <button type="button" onclick="loadLeaguesList()">Cancel·lar</button>
        </form>
    `;
    document.getElementById('league-form').onsubmit = function(e) {
        e.preventDefault();
        createLeague({
            name: document.getElementById('league-name').value,
            country: document.getElementById('league-country').value,
            color: document.getElementById('league-color').value
        });
    };
}

/**
 * Retorna el codi emoji de la bandera d'un país
 */
function getFlagEmoji(countryCode) {
    if (!countryCode) return '';
    return countryCode
        .toUpperCase()
        .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt()));
}

/**
 * Opcions de països per al select
 */
function countryOptions() {
    const countries = [
        { code: 'ES', name: 'Espanya' },
        { code: 'FR', name: 'França' },
        { code: 'IT', name: 'Itàlia' },
        { code: 'GB', name: 'Regne Unit' },
        { code: 'DE', name: 'Alemanya' },
        { code: 'PT', name: 'Portugal' },
        { code: 'US', name: 'Estats Units' },
        { code: 'BR', name: 'Brasil' },
        { code: 'AR', name: 'Argentina' },
        { code: 'JP', name: 'Japó' },
        { code: 'AU', name: 'Austràlia' },
        { code: 'CA', name: 'Canadà' },
        { code: 'NL', name: 'Països Baixos' },
        { code: 'BE', name: 'Bèlgica' },
        { code: 'CH', name: 'Suïssa' },
        { code: 'FI', name: 'Finlàndia' },
        { code: 'SE', name: 'Suècia' },
        { code: 'NO', name: 'Noruega' },
        { code: 'DK', name: 'Dinamarca' },
        { code: 'IE', name: 'Irlanda' }
    ];
    return countries.map(c => `<option value="${c.code}">${c.name}</option>`).join('');
}

// Inicialitza listeners
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.getElementById('create-league-btn');
        if (btn) btn.onclick = showCreateLeagueForm;
        loadLeaguesList();
    });
}
