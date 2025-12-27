// Elimina completament el compte de l'usuari actual
function deleteAccount() {
    const username = localStorage.getItem('currentUser');
    if (!username) {
        alert('No hi ha cap sessió iniciada.');
        return;
    }
    if (!confirm('Segur que vols esborrar el teu compte? Aquesta acció és irreversible!')) return;
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    delete users[username];
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem('currentUser');
    alert('Compte esborrat correctament.');
    showScreen('auth-screen');
}
// Sistema d'autenticació

function register() {
    const username = document.getElementById('register-username').value;
    const teamName = document.getElementById('register-team').value;
    const password = document.getElementById('register-password').value;

    if (!username || !teamName || !password) {
        alert('Si us plau, omple tots els camps!');
        return;
    }

    // Comprovar si l'usuari ja existeix
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        alert('Aquest usuari ja existeix!');
        return;
    }

    // Crear nou usuari
    users[username] = {
        password: password,
        teamName: teamName,
        budget: 20000000, // 20 milions per començar
        drivers: [],
        manager: null,
        upgrades: {
            engine: 1,
            aero: 1,
            chassis: 1
        },
        wins: 0,
        podiums: 0,
        points: 0
    };

    localStorage.setItem('users', JSON.stringify(users));
    alert('Compte creat amb èxit! Ara pots iniciar sessió.');
    
    // Netejar els camps
    document.getElementById('register-username').value = '';
    document.getElementById('register-team').value = '';
    document.getElementById('register-password').value = '';
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('Si us plau, omple tots els camps!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];

    if (!user) {
        alert('Usuari no trobat!');
        return;
    }

    if (user.password !== password) {
        alert('Contrasenya incorrecta!');
        return;
    }

    // Guardar sessió
    localStorage.setItem('currentUser', username);
    
    // Mostrar menú principal
    showScreen('main-menu');
    updateUserInfo();
}

function logout() {
    localStorage.removeItem('currentUser');
    showScreen('auth-screen');
}

function getCurrentUser() {
    const username = localStorage.getItem('currentUser');
    if (!username) return null;
    
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    return { username, data: users[username] };
}

function saveUserData(userData) {
    const username = localStorage.getItem('currentUser');
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    users[username] = userData;
    localStorage.setItem('users', JSON.stringify(users));
}

function updateUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('team-name').textContent = user.data.teamName;
    document.getElementById('budget').textContent = formatMoney(user.data.budget);
}

function formatMoney(amount) {
    return '€' + (amount / 1000000).toFixed(1) + 'M';
}
