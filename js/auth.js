// Elimina completament el compte de l'usuari actual
function deleteAccount() {
    const username = localStorage.getItem('currentUser');
    if (!username) {
        alert('No hay ninguna sesión iniciada.');
        return;
    }
    if (!confirm('¿Seguro que quieres eliminar tu cuenta? ¡Esta acción es irreversible!')) return;
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    delete users[username];
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.removeItem('currentUser');
    alert('Cuenta eliminada correctamente.');
    showScreen('auth-screen');
}
// Sistema d'autenticació

function register() {
    const username = document.getElementById('register-username').value;
    const teamName = document.getElementById('register-team').value;
    const password = document.getElementById('register-password').value;

    if (!username || !teamName || !password) {
        alert('¡Por favor, rellena todos los campos!');
        return;
    }

    // Comprovar si l'usuari ja existeix
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[username]) {
        alert('¡Este usuario ya existe!');
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
    alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
    
    // Netejar els camps
    document.getElementById('register-username').value = '';
    document.getElementById('register-team').value = '';
    document.getElementById('register-password').value = '';
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('¡Por favor, rellena todos los campos!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const user = users[username];

    if (!user) {
        alert('¡Usuario no encontrado!');
        return;
    }

    if (user.password !== password) {
        alert('¡Contraseña incorrecta!');
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

    const teamNameEl = document.getElementById('team-name');
    const budgetEl = document.getElementById('budget');
    
    if (teamNameEl) teamNameEl.textContent = user.data.teamName;
    if (budgetEl) budgetEl.textContent = formatMoney(user.data.budget);
}

function formatMoney(amount) {
    return '€' + (amount / 1000000).toFixed(1) + 'M';
}
