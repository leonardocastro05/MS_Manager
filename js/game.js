// Lògica principal del joc

// Millores de l'HQ
// Les dades de cada usuari es guarden a localStorage sota la clau 'users'.
// Format: {
//   "nomUsuari": {
//      password, teamName, budget, upgrades, drivers, manager, wins, podiums, points
//   }, ...
// }

function upgradeComponent(component) {
    const user = getCurrentUser();
    if (!user) return;

    const baseCost = gameData.upgradeCosts[component];
    const currentLevel = user.data.upgrades[component];
    // El cost incrementa 50.000 per nivell
    const cost = baseCost + (currentLevel - 1) * 50000;

    if (currentLevel >= 10) {
        alert('Ja tens el nivell màxim!');
        return;
    }

    if (user.data.budget < cost) {
        alert(`No tens prou diners! Millorar costa ${formatMoney(cost)}`);
        return;
    }

    // Aplicar millora
    user.data.budget -= cost;
    user.data.upgrades[component]++;

    saveUserData(user.data);
    updateUserInfo();
    updateHQDisplay();

    alert(`${component} millorat al nivell ${user.data.upgrades[component]}! Preu pagat: ${formatMoney(cost)}`);
}

function updateHQDisplay() {
    const user = getCurrentUser();
    if (!user) return;

    document.getElementById('engine-level').textContent = `Nivell: ${user.data.upgrades.engine}`;
    document.getElementById('engine-progress').value = user.data.upgrades.engine * 10;
    
    document.getElementById('aero-level').textContent = `Nivell: ${user.data.upgrades.aero}`;
    document.getElementById('aero-progress').value = user.data.upgrades.aero * 10;
    
    document.getElementById('chassis-level').textContent = `Nivell: ${user.data.upgrades.chassis}`;
    document.getElementById('chassis-progress').value = user.data.upgrades.chassis * 10;
}

// Tenda
let currentShopTab = 'drivers';

function showShopTab(tab) {
    currentShopTab = tab;
    
    // Actualitzar botons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    loadShopItems();
}

function loadShopItems() {
    const user = getCurrentUser();
    if (!user) return;

    const shopContent = document.getElementById('shop-content');
    shopContent.innerHTML = '';

    const items = currentShopTab === 'drivers' ? gameData.drivers : gameData.managers;

    items.forEach(item => {
        const canBuy = user.data.budget >= item.price;
        const alreadyOwned = currentShopTab === 'drivers' 
            ? user.data.drivers.some(d => d.id === item.id)
            : user.data.manager && user.data.manager.id === item.id;

        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        
        if (currentShopTab === 'drivers') {
            itemDiv.innerHTML = `
                <h4>🏎️ ${item.name}</h4>
                <div class="stats">
                    <div>Habilitat: ${item.skill}/100</div>
                    <div>Equip actual: ${item.team}</div>
                    <div>Preu: ${formatMoney(item.price)}</div>
                </div>
                <button onclick="buyDriver(${item.id})" ${!canBuy || alreadyOwned ? 'disabled' : ''}>
                    ${alreadyOwned ? 'Ja contractat' : 'Contractar'}
                </button>
            `;
        } else {
            itemDiv.innerHTML = `
                <h4>👤 ${item.name}</h4>
                <div class="stats">
                    <div>Bonus: +${item.bonus}%</div>
                    <div>Experiència: ${item.team}</div>
                    <div>Preu: ${formatMoney(item.price)}</div>
                </div>
                <button onclick="buyManager(${item.id})" ${!canBuy || alreadyOwned ? 'disabled' : ''}>
                    ${alreadyOwned ? 'Ja contractat' : 'Contractar'}
                </button>
            `;
        }
        
        shopContent.appendChild(itemDiv);
    });
}

function buyDriver(driverId) {
    const user = getCurrentUser();
    if (!user) return;

    if (user.data.drivers.length >= 2) {
        alert('Ja tens 2 pilots! Només pots tenir 2 pilots a l\'equip.');
        return;
    }

    const driver = gameData.drivers.find(d => d.id === driverId);
    if (!driver) return;

    if (user.data.budget < driver.price) {
        alert('No tens prou diners!');
        return;
    }

    user.data.budget -= driver.price;
    user.data.drivers.push(driver);
    
    saveUserData(user.data);
    updateUserInfo();
    loadShopItems();
    
    alert(`Has contractat a ${driver.name}!`);
}

function buyManager(managerId) {
    const user = getCurrentUser();
    if (!user) return;

    const manager = gameData.managers.find(m => m.id === managerId);
    if (!manager) return;

    if (user.data.budget < manager.price) {
        alert('No tens prou diners!');
        return;
    }

    user.data.budget -= manager.price;
    user.data.manager = manager;
    
    saveUserData(user.data);
    updateUserInfo();
    loadShopItems();
    
    alert(`Has contractat a ${manager.name}!`);
}

// Visualització de l'equip
function loadTeamScreen() {
    const user = getCurrentUser();
    if (!user) return;

    // Mànager
    const managerDiv = document.getElementById('current-manager');
    if (user.data.manager) {
        managerDiv.innerHTML = `
            <div class="team-member">
                <h4>👤 ${user.data.manager.name}</h4>
                <p>Bonus: +${user.data.manager.bonus}%</p>
            </div>
        `;
    } else {
        managerDiv.innerHTML = '<p>Cap mànager contractat</p>';
    }

    // Pilots
    const driversDiv = document.getElementById('current-drivers');
    if (user.data.drivers.length > 0) {
        driversDiv.innerHTML = user.data.drivers.map(driver => `
            <div class="team-member">
                <h4>🏎️ ${driver.name}</h4>
                <p>Habilitat: ${driver.skill}/100</p>
            </div>
        `).join('');
    } else {
        driversDiv.innerHTML = '<p>Cap pilot contractat</p>';
    }

    // Estadístiques
    const statsDiv = document.getElementById('team-stats');
    statsDiv.innerHTML = `
        <div><strong>Victòries:</strong> ${user.data.wins}</p>
        <div><strong>Podis:</strong> ${user.data.podiums}</div>
        <div><strong>Punts:</strong> ${user.data.points}</div>
        <div><strong>Pressupost:</strong> ${formatMoney(user.data.budget)}</div>
    `;
}
