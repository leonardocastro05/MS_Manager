// Configuració de l'API
const API_URL = 'http://localhost:5000/api';

// Elimina completament el compte de l'usuari actual
async function deleteAccount() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No hay ninguna sesión iniciada.');
        return;
    }
    
    if (!confirm('¿Seguro que quieres eliminar tu cuenta? ¡Esta acción es irreversible!')) return;
    
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            alert('Cuenta eliminada correctamente.');
            showScreen('auth-screen');
        } else {
            alert(data.message || 'Error al eliminar la cuenta');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
}

// Sistema d'autenticació
async function register() {
    const username = document.getElementById('register-username').value;
    const teamName = document.getElementById('register-team').value;
    const password = document.getElementById('register-password').value;

    if (!username || !teamName || !password) {
        alert('¡Por favor, rellena todos los campos!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                teamName
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
            
            // Netejar els camps
            document.getElementById('register-username').value = '';
            document.getElementById('register-team').value = '';
            document.getElementById('register-password').value = '';
        } else {
            alert(data.message || 'Error al crear la cuenta');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    if (!username || !password) {
        alert('¡Por favor, rellena todos los campos!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Guardar token i dades d'usuari
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            // Mostrar menú principal
            showScreen('main-menu');
            updateUserInfo();
        } else {
            alert(data.message || 'Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión con el servidor');
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    showScreen('auth-screen');
}

function getCurrentUser() {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) return null;
    
    const user = JSON.parse(userData);
    
    // Adaptar l'estructura de MongoDB a l'esperada pel frontend
    // MongoDB: user.gameData.upgrades -> Frontend: user.data.upgrades
    return { 
        username: user.username, 
        data: {
            teamName: user.teamName,
            budget: user.gameData?.budget || 20000000,
            drivers: user.gameData?.drivers || [],
            manager: user.gameData?.managers?.[0] || null,
            upgrades: user.gameData?.upgrades || { engine: 1, aero: 1, chassis: 1 },
            wins: user.gameData?.wins || 0,
            podiums: user.gameData?.podiums || 0,
            points: user.gameData?.points || 0,
            racesCompleted: user.gameData?.racesCompleted || 0,
            careerMode: user.gameData?.careerMode || {
                active: false,
                currentRace: 0,
                races: [],
                standings: []
            },
            raceHistory: user.gameData?.raceHistory || []
        }
    };
}

async function saveUserData(userData) {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Adaptar l'estructura del frontend a MongoDB
    // Frontend: userData.upgrades -> MongoDB: gameData.upgrades
    const mongoData = {
        gameData: {
            budget: userData.budget,
            drivers: userData.drivers,
            managers: userData.manager ? [userData.manager] : [],
            upgrades: userData.upgrades,
            wins: userData.wins || 0,
            podiums: userData.podiums || 0,
            points: userData.points || 0,
            racesCompleted: userData.racesCompleted || 0,
            careerMode: userData.careerMode,
            raceHistory: userData.raceHistory || []
        }
    };
    
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(mongoData)
        });

        const data = await response.json();

        if (response.ok) {
            // Actualitzar dades locals
            localStorage.setItem('userData', JSON.stringify(data.user));
            return true;
        } else {
            console.error('Error guardando datos:', data.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
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
