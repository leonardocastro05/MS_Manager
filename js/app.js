// Mostra/amaga el menú d'opcions de l'usuari al header
function toggleUserMenu() {
    const dropdown = document.getElementById('user-menu-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        // Tancar si es fa clic fora
        if (dropdown.classList.contains('active')) {
            setTimeout(() => {
                document.addEventListener('mousedown', closeUserMenuOnClickOutside);
            }, 0);
        } else {
            document.removeEventListener('mousedown', closeUserMenuOnClickOutside);
        }
    }
}

function closeUserMenuOnClickOutside(e) {
    const dropdown = document.getElementById('user-menu-dropdown');
    const btn = document.getElementById('user-menu-btn');
    if (dropdown && !dropdown.contains(e.target) && btn && !btn.contains(e.target)) {
        dropdown.classList.remove('active');
        document.removeEventListener('mousedown', closeUserMenuOnClickOutside);
    }
}
// Mostrar info del modo carrera
function updateCareerScreen() {
    if (typeof careerMode === 'undefined') return;
    // Diners
    document.getElementById('career-money').textContent = careerMode.money.toLocaleString('ca-ES', { style: 'currency', currency: 'EUR' });
    // HQ
    document.getElementById('hq-engine-level').textContent = careerMode.hq.engine;
    document.getElementById('hq-aero-level').textContent = careerMode.hq.aero;
    document.getElementById('hq-chassis-level').textContent = careerMode.hq.chassis;
    // Temporada i cursa
    document.getElementById('career-season').textContent = careerMode.season;
    document.getElementById('career-total-seasons').textContent = careerMode.totalSeasons;
    document.getElementById('career-current-race').textContent = careerMode.currentRace + 1;
    document.getElementById('career-total-races').textContent = careerMode.races.length;
    // Barra de progrés visual
    let progress = (careerMode.currentRace) / (careerMode.races.length - 1) * 100;
    document.getElementById('career-progress-bar').style.width = (isNaN(progress) ? 0 : progress) + '%';
    // Calendari de curses amb targetes visuals
    let calendarHtml = careerMode.races.map((trackKey, i) => {
        let track = gameData.tracks[trackKey];
        let status = i < careerMode.currentRace ? 'completed' : (i === careerMode.currentRace ? 'current' : '');
        return `<div class=\"calendar-race ${status}\">`
            + `<div style='font-size:2em;'>${track.flag}</div>`
            + `<div style='font-weight:bold;'>${track.name}</div>`
            + `<div style='font-size:0.9em;opacity:0.7;'>${i+1}a cursa</div>`
            + `</div>`;
    }).join('');
    document.getElementById('career-calendar-list').innerHTML = calendarHtml;
    // Classificació amb targetes visuals i medalles
    let standings = careerMode.standings.slice().sort((a, b) => b.points - a.points);
    let medals = ['gold','silver','bronze'];
    let standingsHtml = standings.map((entry, i) => {
        let medalClass = i < 3 ? medals[i] : '';
        let medalIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '';
        return `<div class=\"standings-card ${medalClass}\">`
            + `<div class='standings-pos'>${medalIcon || (i+1)}</div>`
            + `<div class='standings-team'>${entry.team}</div>`
            + `<div class='standings-points'>${entry.points} pts</div>`
            + `</div>`;
    }).join('');
    document.getElementById('career-standings-list').innerHTML = standingsHtml;
}

// Acció per avançar a la següent cursa
function nextCareerRace() {
    if (typeof nextRace === 'function' && nextRace()) {
        updateCareerScreen();
        alert('Has avançat a la següent cursa!');
    } else {
        alert('La temporada ha acabat!');
    }
}
// Controlador principal de l'aplicació

function showScreen(screenId) {
    // Amagar totes les pantalles
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar la pantalla seleccionada
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
    
    // Actualitzar contingut segons la pantalla
    switch(screenId) {
        case 'main-menu':
            updateUserInfo();
            break;
        case 'career-screen':
            updateCareerScreen();
            break;
        case 'hq-screen':
            updateHQDisplay();
            break;
        case 'shop-screen':
            loadShopItems();
            break;
        case 'team-screen':
            loadTeamScreen();
            break;
        case 'race-screen':
            // Reset cursa si naveguem aquí
            if (raceInterval) {
                clearInterval(raceInterval);
                raceInterval = null;
            }
            isRacing = false;
            currentLap = 0;
            selectedTrack = null;
            document.getElementById('track-display').innerHTML = '<p style="text-align: center; padding: 50px;">Selecciona un circuit per començar</p>';
            document.getElementById('positions-list').innerHTML = '';
            document.getElementById('start-race-btn').style.display = 'inline-block';
            document.getElementById('pause-race-btn').style.display = 'none';
            break;
    }
}

// Comprovar si hi ha una sessió activa en carregar la pàgina
window.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    
    // IMPORTANT: Comentar aquesta línia per veure sempre la intro mentre desenvolupes
    // sessionStorage.removeItem('hasSeenIntro'); 
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    
    if (currentUser) {
        // Si hi ha sessió, anar al menú principal
        showScreen('main-menu');
        updateUserInfo();
        // Amaga i atura la intro 3D
        document.getElementById('intro-canvas').style.display = 'none';
        cleanupIntro3D();
    } else {
        // Mostra la intro només una vegada, però manté el canvas de fons al login
        const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
        if (!hasSeenIntro) {
            showScreen('intro-screen');
            sessionStorage.setItem('hasSeenIntro', 'true');
            if (typeof THREE !== 'undefined') {
                initIntro3D();
                setTimeout(() => {
                    // No aturem la intro, només amaguem el títol i mostrem el login
                    const introTitle = document.getElementById('intro-title');
                    if (introTitle) introTitle.style.display = 'none';
                    showScreen('auth-screen');
                    // El canvas segueix visible i animat
                }, 7000);
            } else {
                setTimeout(() => {
                    showScreen('auth-screen');
                }, 1000);
            }
        } else {
            // Si ja s'ha vist la intro, mostra directament el login amb el canvas actiu
            showScreen('auth-screen');
            document.getElementById('intro-canvas').style.display = 'block';
            if (typeof THREE !== 'undefined' && !window._intro3DActive) {
                initIntro3D();
            }
        }
    }
        // Botons del submenu d'usuari
        document.getElementById('logout-btn').addEventListener('click', () => {
            logout();
        });
        document.getElementById('delete-account-btn').addEventListener('click', () => {
            deleteAccount();
        });
});
