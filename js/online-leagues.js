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

    // Generar 9 pilots IA per defecte
    const aiDrivers = generateAIDrivers(9);
    
    const league = {
        id: 'lg_' + Date.now(),
        name: leagueData.name,
        country: leagueData.country,
        color: leagueData.color,
        created: new Date().toISOString(),
        members: [user.username],
        owner: user.username,
        calendar: generateDefaultCalendar(),
        standings: {},
        currentRace: 0,
        aiDrivers: aiDrivers // Pilots controlats per IA
    };
    
    // Inicialitzar standings amb pilots IA
    league.standings[user.username] = 0;
    aiDrivers.forEach(ai => {
        league.standings[ai.name] = 0;
    });

    user.data.onlineLeagues.push(league);
    saveUserData(user.data);
    updateUserInfo();
    loadLeaguesList();
    alert('✅ Lliga creada amb èxit!\n\n9 pilots IA s\'han afegit per omplir la graella.');
}

/**
 * Genera pilots IA amb noms i habilitats aleatòries
 */
function generateAIDrivers(count) {
    const names = [
        'Max Verstappen', 'Lewis Hamilton', 'Charles Leclerc', 'Sergio Pérez',
        'Carlos Sainz', 'Lando Norris', 'George Russell', 'Fernando Alonso',
        'Oscar Piastri', 'Pierre Gasly', 'Esteban Ocon', 'Lance Stroll',
        'Valtteri Bottas', 'Zhou Guanyu', 'Kevin Magnussen', 'Nico Hülkenberg',
        'Yuki Tsunoda', 'Daniel Ricciardo', 'Alex Albon', 'Logan Sargeant'
    ];
    
    // Barrejar noms
    const shuffledNames = names.sort(() => Math.random() - 0.5);
    
    const drivers = [];
    for (let i = 0; i < count; i++) {
        drivers.push({
            name: shuffledNames[i],
            isAI: true,
            skill: 50 + Math.floor(Math.random() * 40), // Habilitat entre 50-90
            team: getRandomTeam(),
            carPerformance: 50 + Math.floor(Math.random() * 40) // Rendiment del cotxe 50-90
        });
    }
    
    return drivers;
}

/**
 * Retorna un equip aleatori
 */
function getRandomTeam() {
    const teams = [
        'Red Bull Racing', 'Mercedes', 'Ferrari', 'McLaren',
        'Aston Martin', 'Alpine', 'Williams', 'AlphaTauri',
        'Alfa Romeo', 'Haas'
    ];
    return teams[Math.floor(Math.random() * teams.length)];
}

/**
 * Generar calendari per defecte
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
 * Carrega la llista de lligues de l'usuari i les mostra
 */
function loadLeaguesList() {
    const user = getCurrentUser();
    const leaguesDiv = document.getElementById('leagues-list');
    if (!user || !leaguesDiv) return;

    const leagues = user.data.onlineLeagues || [];

    if (leagues.length === 0) {
        leaguesDiv.innerHTML = `
            <div class="league-card" style="text-align:center; padding:40px;">
                <div style="font-size:3em; margin-bottom:16px;">🏁</div>
                <p style="font-size:1.2em; opacity:0.8;">Encara no tens cap lliga.</p>
                <p style="opacity:0.6; margin-top:8px;">Crea la teva primera lliga!</p>
            </div>
        `;
    } else {
        leaguesDiv.innerHTML = leagues.map(lg => `
            <div class="league-card" style="border-left:8px solid ${lg.color};">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
                    <div>
                        <b style="font-size:1.3em; color:#ffd700;">${lg.name}</b>
                        <span style="font-size:1.5em; margin-left:8px;">${getFlagEmoji(lg.country)}</span>
                    </div>
                    ${lg.owner === user.username ? '<span style="background:#ffd700; color:#232526; padding:4px 10px; border-radius:6px; font-size:0.85em; font-weight:bold;">PROPIETARI</span>' : ''}
                </div>
                <p style="font-size:0.95em; opacity:0.8; margin-bottom:8px;">
                    👥 Membres: ${lg.members.length}
                </p>
                <p style="font-size:0.95em; opacity:0.8; margin-bottom:16px;">
                    🏁 Cursa ${(lg.currentRace || 0) + 1} de ${(lg.calendar || []).length}
                </p>
                <button class="btn-primary" onclick="enterLeague('${lg.id}')" style="width:100%; margin-top:8px;">
                    🎮 Entrar a la Lliga
                </button>
            </div>
        `).join('');
    }

    // Assegura el listener del botó cada cop que es mostra la secció
    setTimeout(function () {
        const btn = document.getElementById('create-league-btn');
        if (btn) btn.onclick = showCreateLeagueForm;
    }, 0);
}

/**
 * Entrar a una lliga específica
 */
function enterLeague(leagueId) {
    window.location.href = `liga.html?id=${leagueId}`;
}

/**
 * Mostra el formulari per crear una lliga
 */
function showCreateLeagueForm() {
    const leaguesDiv = document.getElementById('leagues-list');
    if (!leaguesDiv) return;

    leaguesDiv.innerHTML = `
        <form id="league-form" class="league-card" style="background:rgba(35, 37, 38, 0.95); color:#FFD700; max-width:500px; margin:0 auto;">
            <h3 style="margin-bottom:20px; text-align:center;">➕ Crear Nova Lliga</h3>
            
            <label style="display:block; margin-bottom:8px; font-weight:bold;">Nom de la lliga:</label>
            <input type="text" id="league-name" required maxlength="32" placeholder="Nom de la lliga" style="width:100%; padding:12px; border-radius:8px; margin-bottom:16px; background:rgba(255,255,255,0.1); border:2px solid #ffd700; color:#fff; font-size:1em;">
            
            <label style="display:block; margin-bottom:8px; font-weight:bold;">País:</label>
            <select id="league-country" style="width:100%; padding:12px; border-radius:8px; margin-bottom:16px; background:rgba(255,255,255,0.1); border:2px solid #ffd700; color:#fff; font-size:1em;">
                ${countryOptions()}
            </select>
            
            <label style="display:block; margin-bottom:8px; font-weight:bold;">Color:</label>
            <input type="color" id="league-color" value="#FFD700" style="width:100%; padding:8px; border-radius:8px; margin-bottom:24px; background:rgba(255,255,255,0.1); border:2px solid #ffd700; cursor:pointer;">
            
            <div style="display:flex; gap:12px;">
                <button type="submit" class="btn-primary" style="flex:1;">✅ Crear</button>
                <button type="button" onclick="loadLeaguesList()" class="btn-primary" style="flex:1; background:#666;">❌ Cancel·lar</button>
            </div>
        </form>
    `;

    document.getElementById('league-form').onsubmit = function (e) {
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
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.getElementById('create-league-btn');
        if (btn) btn.onclick = showCreateLeagueForm;
        loadLeaguesList();
    });
}