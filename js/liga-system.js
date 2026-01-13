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
    
    // ============================================
    // MIGRACIÓ: Afegir pilots IA si no existeixen
    // ============================================
    if (!currentLeague.aiDrivers || currentLeague.aiDrivers.length === 0) {
        currentLeague.aiDrivers = generateAIDrivers(9);
        
        // Inicialitzar standings per pilots IA
        currentLeague.aiDrivers.forEach(ai => {
            if (!currentLeague.standings[ai.name]) {
                currentLeague.standings[ai.name] = 0;
            }
        });
        
        // Guardar canvis
        const leagueIndex = user.data.onlineLeagues.findIndex(l => l.id === currentLeague.id);
        user.data.onlineLeagues[leagueIndex] = currentLeague;
        saveUserData(user.data);
        
        console.log('✅ Lliga migrada amb 9 pilots IA');
    }

    updateLeagueHeader();
    updateUserInfo();
    loadCalendar();
    loadStandings();
    loadLeagueConfig();
    
    // Iniciar comprovador de programació si està activat
    if (currentLeague.schedule && currentLeague.schedule.enabled) {
        startScheduleChecker();
    }
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
 * Generar calendari per defecte amb 20 circuits
 */
function generateDefaultCalendar() {
    const tracks = ['monaco', 'belgica', 'italia', 'portugal', 'brasil', 'reinounido', 'espana', 'austria', 'francia', 'alemania', 'japon', 'singapur', 'australia', 'canada', 'mexico', 'emiratosarabes', 'arabia', 'holanda', 'miami', 'lasvegas'];
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

    // Inicialitzar schedule si no existeix
    if (!currentLeague.schedule) {
        currentLeague.schedule = {
            enabled: false,
            selectedDays: [1], // Array de dies: 0=Diumenge, 1=Dilluns, etc.
            hour: 20,
            minute: 0,
            autoStart: true // SEMPRE auto-start
        };
    }
    
    // Migració: convertir dayOfWeek antic a selectedDays
    if (currentLeague.schedule.dayOfWeek !== undefined && !currentLeague.schedule.selectedDays) {
        currentLeague.schedule.selectedDays = [currentLeague.schedule.dayOfWeek];
        delete currentLeague.schedule.dayOfWeek;
    }

    const scheduleInfo = getNextScheduledRace();

    if (!isOwner) {
        content.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <p style="font-size:1.2em; margin-bottom:16px;">Només el propietari pot modificar la configuració de la lliga.</p>
                <p style="opacity:0.6;">Propietari: ${currentLeague.owner}</p>
                
                ${currentLeague.schedule && currentLeague.schedule.enabled ? `
                    <div style="margin-top:24px; padding:20px; background:rgba(0,180,0,0.2); border-radius:12px; border:2px solid #2ecc40;">
                        <h4 style="color:#2ecc40; margin-bottom:12px;">📅 Propera Cursa Programada</h4>
                        <p style="font-size:1.3em; color:#fff;">${scheduleInfo}</p>
                    </div>
                ` : ''}
            </div>
        `;
        return;
    }

    const daysOfWeek = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    const selectedDays = currentLeague.schedule.selectedDays || [1];

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

            <!-- Sistema de Programació de Curses -->
            <div style="margin-top:32px; padding:20px; background:rgba(255,215,0,0.1); border-radius:12px; border:2px solid #ffd700;">
                <h3 style="color:#ffd700; margin-bottom:16px;">📅 Programació Automàtica de Curses</h3>
                
                <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px;">
                    <input type="checkbox" id="schedule-enabled" ${currentLeague.schedule.enabled ? 'checked' : ''} 
                        style="width:20px; height:20px; cursor:pointer;">
                    <label for="schedule-enabled" style="cursor:pointer; font-size:1.1em;">Activar curses automàtiques</label>
                </div>

                <div id="schedule-options" style="${currentLeague.schedule.enabled ? '' : 'opacity:0.5; pointer-events:none;'}">
                    <label style="display:block; margin-bottom:12px; font-weight:bold;">Dies de la setmana:</label>
                    <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin-bottom:16px;">
                        ${daysOfWeek.map((day, i) => `
                            <div style="display:flex; align-items:center; gap:8px; padding:8px; background:rgba(255,255,255,0.05); border-radius:8px;">
                                <input type="checkbox" id="day-${i}" class="schedule-day" value="${i}" 
                                    ${selectedDays.includes(i) ? 'checked' : ''}
                                    style="width:18px; height:18px; cursor:pointer;">
                                <label for="day-${i}" style="cursor:pointer; flex:1;">${day}</label>
                            </div>
                        `).join('')}
                    </div>

                    <label>Hora d'inici automàtic:</label>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <input type="number" id="schedule-hour" value="${currentLeague.schedule.hour}" min="0" max="23" 
                            style="width:80px; padding:10px; border-radius:8px; border:2px solid #333; background:#1a1a2e; color:#fff; font-size:1.1em;">
                        <span style="font-size:1.5em;">:</span>
                        <input type="number" id="schedule-minute" value="${currentLeague.schedule.minute}" min="0" max="59" step="5"
                            style="width:80px; padding:10px; border-radius:8px; border:2px solid #333; background:#1a1a2e; color:#fff; font-size:1.1em;">
                    </div>

                    <div style="margin-top:16px; padding:16px; background:rgba(225,6,0,0.2); border-radius:8px; border:1px solid #e10600;">
                        <p style="color:#ff6b6b; font-size:0.95em; margin:0;">
                            ⚠️ <strong>MODE AUTOMÀTIC:</strong> Les curses començaran AUTOMÀTICAMENT a l'hora programada. Els participants seran redirigits directament a la cursa!
                        </p>
                    </div>

                    ${currentLeague.schedule.enabled && selectedDays.length > 0 ? `
                        <div style="margin-top:16px; padding:12px; background:rgba(0,180,0,0.2); border-radius:8px;">
                            <p style="color:#2ecc40; margin:0;">📆 ${scheduleInfo}</p>
                        </div>
                    ` : ''}
                </div>

                <button onclick="saveScheduleConfig()" style="
                    width:100%; padding:14px 24px; margin-top:16px;
                    background:linear-gradient(135deg, #00b894, #009432);
                    color:#fff; border:2px solid #00d26a; border-radius:12px;
                    font-size:1.1em; font-weight:bold; cursor:pointer;
                    transition:all 0.3s ease; box-shadow:0 4px 15px rgba(0,180,0,0.3);">
                    💾 Desar Programació
                </button>
            </div>

            <button onclick="openDeleteModal()" style="
                width: 100%;
                padding: 14px 24px;
                margin-top: 16px;
                background: linear-gradient(135deg, #e10600, #a10400);
                color: #fff;
                border: 2px solid #ff4444;
                border-radius: 12px;
                font-size: 1.1em;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(225, 6, 0, 0.3);
            " onmouseover="this.style.background='linear-gradient(135deg, #c10500, #8a0300)'; this.style.transform='scale(1.02)'; this.style.boxShadow='0 6px 20px rgba(225, 6, 0, 0.5)';" onmouseout="this.style.background='linear-gradient(135deg, #e10600, #a10400)'; this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(225, 6, 0, 0.3)';">
                🗑️ Eliminar Lliga
            </button>
        </div>
    `;

    // Event listener per activar/desactivar opcions
    document.getElementById('schedule-enabled').addEventListener('change', function() {
        const options = document.getElementById('schedule-options');
        if (this.checked) {
            options.style.opacity = '1';
            options.style.pointerEvents = 'auto';
        } else {
            options.style.opacity = '0.5';
            options.style.pointerEvents = 'none';
        }
    });
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
 * Desar configuració de programació
 */
function saveScheduleConfig() {
    const enabled = document.getElementById('schedule-enabled').checked;
    const hour = parseInt(document.getElementById('schedule-hour').value);
    const minute = parseInt(document.getElementById('schedule-minute').value);
    
    // Obtenir els dies seleccionats
    const selectedDays = [];
    document.querySelectorAll('.schedule-day:checked').forEach(checkbox => {
        selectedDays.push(parseInt(checkbox.value));
    });
    
    if (enabled && selectedDays.length === 0) {
        alert('⚠️ Has de seleccionar almenys un dia de la setmana!');
        return;
    }

    currentLeague.schedule = {
        enabled,
        selectedDays: selectedDays.sort((a, b) => a - b), // Ordenar dies
        hour: Math.max(0, Math.min(23, hour)),
        minute: Math.max(0, Math.min(59, minute)),
        autoStart: true // SEMPRE automàtic
    };

    const user = getCurrentUser();
    const leagueIndex = user.data.onlineLeagues.findIndex(l => l.id === currentLeague.id);
    user.data.onlineLeagues[leagueIndex] = currentLeague;

    saveUserData(user.data);
    
    if (enabled) {
        startScheduleChecker();
    }
    
    loadLeagueConfig(); // Refrescar UI per mostrar propera cursa
    alert('✅ Programació desada!\n\nLes curses començaran AUTOMÀTICAMENT a l\'hora programada.');
}

/**
 * Obtenir informació de la propera cursa programada
 */
function getNextScheduledRace() {
    if (!currentLeague.schedule || !currentLeague.schedule.enabled || !currentLeague.schedule.selectedDays || currentLeague.schedule.selectedDays.length === 0) {
        return 'No programada';
    }

    const schedule = currentLeague.schedule;
    const now = new Date();
    const daysOfWeek = ['Diumenge', 'Dilluns', 'Dimarts', 'Dimecres', 'Dijous', 'Divendres', 'Dissabte'];
    
    // Trobar el proper dia programat
    let nextRaceDate = null;
    let minDaysUntil = 8; // Més d'una setmana
    
    for (const targetDay of schedule.selectedDays) {
        let daysUntil = targetDay - now.getDay();
        
        // Si és avui però l'hora ja ha passat, compte com a següent setmana
        if (daysUntil === 0 && (now.getHours() > schedule.hour || (now.getHours() === schedule.hour && now.getMinutes() >= schedule.minute))) {
            daysUntil = 7;
        }
        
        // Si el dia ja ha passat aquesta setmana, afegir 7 dies
        if (daysUntil < 0) {
            daysUntil += 7;
        }
        
        // Mantenir el més proper
        if (daysUntil < minDaysUntil) {
            minDaysUntil = daysUntil;
            const tempDate = new Date(now);
            tempDate.setDate(now.getDate() + daysUntil);
            tempDate.setHours(schedule.hour, schedule.minute, 0, 0);
            nextRaceDate = tempDate;
        }
    }
    
    if (!nextRaceDate) return 'Error en càlcul';
    
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = nextRaceDate.toLocaleDateString('ca-ES', options);
    const timeStr = `${String(schedule.hour).padStart(2, '0')}:${String(schedule.minute).padStart(2, '0')}`;
    
    // Mostrar tots els dies programats
    const daysList = schedule.selectedDays.map(d => daysOfWeek[d]).join(', ');
    
    return `Propera: ${dateStr} a les ${timeStr}\nDies programats: ${daysList}`;
}

/**
 * Comprovar si és hora de la cursa
 */
function checkScheduledRace() {
    if (!currentLeague || !currentLeague.schedule || !currentLeague.schedule.enabled || !currentLeague.schedule.selectedDays) {
        return;
    }

    const schedule = currentLeague.schedule;
    const now = new Date();
    
    // Comprovar si avui és un dels dies programats
    if (!schedule.selectedDays.includes(now.getDay())) {
        return;
    }

    // Comprovar si és l'hora exacta
    if (now.getHours() === schedule.hour && now.getMinutes() === schedule.minute) {
        // Evitar múltiples starts
        const lastStart = sessionStorage.getItem('lastAutoStart');
        const startKey = `${currentLeague.id}-${now.toDateString()}-${schedule.hour}-${schedule.minute}`;
        
        if (lastStart !== startKey) {
            sessionStorage.setItem('lastAutoStart', startKey);
            autoStartRace();
        }
    }
}

/**
 * Auto-start: Iniciar cursa automàticament
 */
function autoStartRace() {
    const race = currentLeague.calendar[currentLeague.currentRace];
    if (!race || race.completed) {
        console.log('⚠️ No hi ha cursa pendent per començar automàticament');
        return;
    }

    const track = gameData.tracks[race.trackId];
    
    // Guardar info de la cursa
    sessionStorage.setItem('leagueRaceInfo', JSON.stringify({
        leagueId: currentLeague.id,
        raceIndex: currentLeague.currentRace,
        trackId: race.trackId
    }));

    // Mostrar notificació que la cursa està començant
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    notification.innerHTML = `
        <div style="background:linear-gradient(135deg, #1a1a2e, #16213e); padding:40px; border-radius:20px; border:3px solid #ffd700; text-align:center; max-width:500px; animation:pulse 1s infinite;">
            <div style="font-size:4em; margin-bottom:16px;">🏁</div>
            <h2 style="color:#ffd700; font-size:2.5em; margin-bottom:16px;">CURSA AUTOMÀTICA!</h2>
            <div style="font-size:3em; margin-bottom:12px;">${track.flag}</div>
            <h3 style="color:#fff; font-size:1.8em; margin-bottom:24px;">${track.name}</h3>
            <p style="color:#2ecc40; font-size:1.2em;">Redirigint a la cursa en 3 segons...</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Redirigir després de 3 segons
    setTimeout(() => {
        window.location.href = 'league-race.html';
    }, 3000);
}

/**
 * Mostrar notificació de cursa programada
 */
function showRaceNotification() {
    if (!currentLeague.schedule.autoStart) return;
    
    const race = currentLeague.calendar[currentLeague.currentRace];
    if (!race || race.completed) return;

    const track = gameData.tracks[race.trackId];
    
    // Crear notificació visual
    const notification = document.createElement('div');
    notification.id = 'race-notification';
    notification.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="background:linear-gradient(135deg, #1a1a2e, #16213e); padding:40px; border-radius:20px; border:3px solid #ffd700; text-align:center; max-width:500px; animation:pulse 1s infinite;">
            <div style="font-size:4em; margin-bottom:16px;">🏁</div>
            <h2 style="color:#ffd700; font-size:2em; margin-bottom:16px;">És hora de la cursa!</h2>
            <div style="font-size:3em; margin-bottom:12px;">${track.flag}</div>
            <h3 style="color:#fff; font-size:1.5em; margin-bottom:24px;">${track.name}</h3>
            <button onclick="acceptScheduledRace()" style="
                padding:16px 40px; margin:8px;
                background:linear-gradient(135deg, #00b894, #009432);
                color:#fff; border:none; border-radius:12px;
                font-size:1.2em; font-weight:bold; cursor:pointer;">
                🏎️ Començar Cursa
            </button>
            <button onclick="dismissRaceNotification()" style="
                padding:16px 40px; margin:8px;
                background:linear-gradient(135deg, #636e72, #2d3436);
                color:#fff; border:none; border-radius:12px;
                font-size:1.2em; cursor:pointer;">
                ⏭️ Ara No
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);

    // Reproduir so si és possible
    try {
        const audio = new Audio('sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
    } catch (e) {}
}

/**
 * Acceptar cursa programada
 */
function acceptScheduledRace() {
    dismissRaceNotification();
    openRaceModal(currentLeague.currentRace);
}

/**
 * Descartar notificació de cursa
 */
function dismissRaceNotification() {
    const notification = document.getElementById('race-notification');
    if (notification) {
        notification.remove();
    }
}

/**
 * Iniciar comprovador de programació
 */
let scheduleInterval = null;
function startScheduleChecker() {
    if (scheduleInterval) {
        clearInterval(scheduleInterval);
    }
    // Comprovar cada minut
    scheduleInterval = setInterval(checkScheduledRace, 60000);
    // Comprovar immediatament
    checkScheduledRace();
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