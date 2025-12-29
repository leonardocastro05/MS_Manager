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

    // Actualitza el preu dels botons de millora
    if (typeof updateHQUpgradePrices === 'function') {
        updateHQUpgradePrices({
            engine: user.data.upgrades.engine,
            aero: user.data.upgrades.aero,
            chassis: user.data.upgrades.chassis
        });
    }
}

// Sistema de Tenda MILLORAT amb botons funcionals

let currentShopTab = 'drivers';

function showShopTab(tab) {
    currentShopTab = tab;
    
    // Actualitzar botons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Trobar el botó que s'ha clicat
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if ((tab === 'drivers' && btn.textContent.includes('Pilots')) ||
            (tab === 'managers' && btn.textContent.includes('Mànagers'))) {
            btn.classList.add('active');
        }
    });
    
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

        const cardDiv = document.createElement('div');
        cardDiv.className = 'shop-card';

        let imgWrapClass = 'shop-card-img-wrap ' + (currentShopTab === 'drivers' ? 'pilot' : 'manager');
        let icon = currentShopTab === 'drivers' ? '🏎️' : '👤';

        cardDiv.innerHTML = `
            <div class="${imgWrapClass}">${icon}</div>
            <div class="shop-card-name">${item.name}</div>
            <div class="shop-card-team">${item.team || ''}</div>
            ${currentShopTab === 'drivers' 
                ? `<div class="shop-card-skill">⭐ Habilitat: ${item.skill}/100</div>` 
                : `<div class="shop-card-bonus">📊 Bonus: +${item.bonus}%</div>`
            }
            <div class="shop-card-price">💰 ${formatMoney(item.price)}</div>
            <button 
                class="shop-card-btn ${!canBuy || alreadyOwned ? 'disabled' : ''}" 
                onclick="${currentShopTab === 'drivers' ? `buyDriver(${item.id})` : `buyManager(${item.id})`}"
                ${!canBuy || alreadyOwned ? 'disabled' : ''}
            >
                ${alreadyOwned ? '✓ Contractat' : canBuy ? '🛒 Contractar' : '🔒 Sense diners'}
            </button>
        `;
        shopContent.appendChild(cardDiv);
    });
}

function buyDriver(driverId) {
    const user = getCurrentUser();
    if (!user) return;

    if (user.data.drivers.length >= 2) {
        alert('⚠️ Ja tens 2 pilots! Només pots tenir 2 pilots a l\'equip.');
        return;
    }

    const driver = gameData.drivers.find(d => d.id === driverId);
    if (!driver) return;

    if (user.data.budget < driver.price) {
        alert('⚠️ No tens prou diners!');
        return;
    }

    user.data.budget -= driver.price;
    user.data.drivers.push(driver);
    
    saveUserData(user.data);
    updateUserInfo();
    loadShopItems();
    
    alert(`✅ Has contractat a ${driver.name}!\n-${formatMoney(driver.price)}`);
}

function buyManager(managerId) {
    const user = getCurrentUser();
    if (!user) return;

    const manager = gameData.managers.find(m => m.id === managerId);
    if (!manager) return;

    if (user.data.budget < manager.price) {
        alert('⚠️ No tens prou diners!');
        return;
    }

    user.data.budget -= manager.price;
    user.data.manager = manager;
    
    saveUserData(user.data);
    updateUserInfo();
    loadShopItems();
    
    alert(`✅ Has contractat a ${manager.name}!\n-${formatMoney(manager.price)}`);

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
// Sistema d'Equip MILLORAT amb estadístiques funcionals

function loadTeamScreen() {
    const user = getCurrentUser();
    if (!user) return;

    // Mànager
    const managerDiv = document.getElementById('current-manager');
    if (user.data.manager) {
        managerDiv.innerHTML = `
            <div class="team-member-card">
                <div class="team-member-icon">👤</div>
                <h4>${user.data.manager.name}</h4>
                <p class="team-member-team">${user.data.manager.team}</p>
                <p class="team-member-stat">📊 Bonus: +${user.data.manager.bonus}%</p>
            </div>
        `;
    } else {
        managerDiv.innerHTML = '<p class="no-data">Cap mànager contractat</p>';
    }

    // Pilots
    const driversDiv = document.getElementById('current-drivers');
    if (user.data.drivers.length > 0) {
        driversDiv.innerHTML = user.data.drivers.map((driver, index) => `
            <div class="team-member-card driver-${index + 1}">
                <div class="team-member-icon">🏎️</div>
                <h4>${driver.name}</h4>
                <p class="team-member-team">${driver.team}</p>
                <p class="team-member-stat">⭐ Habilitat: ${driver.skill}/100</p>
                <div class="skill-bar">
                    <div class="skill-bar-fill" style="width: ${driver.skill}%"></div>
                </div>
            </div>
        `).join('');
    } else {
        driversDiv.innerHTML = '<p class="no-data">Cap pilot contractat</p>';
    }

    // Estadístiques MILLORADES amb càlculs reals
    const statsDiv = document.getElementById('team-stats');
    
    // Calcular rendiment de l'equip
    let avgDriverSkill = 0;
    if (user.data.drivers.length > 0) {
        avgDriverSkill = user.data.drivers.reduce((sum, d) => sum + d.skill, 0) / user.data.drivers.length;
    }
    
    let managerBonus = user.data.manager ? user.data.manager.bonus : 0;
    let avgUpgrade = (user.data.upgrades.engine + user.data.upgrades.aero + user.data.upgrades.chassis) / 3;
    
    let teamPerformance = avgDriverSkill * (1 + avgUpgrade / 20) * (1 + managerBonus / 100);
    let teamRating = Math.min(100, Math.round(teamPerformance / 1.2));
    
    // Calcular estadístiques de curses
    let totalRaces = user.data.wins + user.data.podiums + Math.floor(user.data.points / 3);
    let winRate = totalRaces > 0 ? ((user.data.wins / totalRaces) * 100).toFixed(1) : 0;
    let podiumRate = totalRaces > 0 ? (((user.data.wins + user.data.podiums) / totalRaces) * 100).toFixed(1) : 0;
    
    statsDiv.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-value">${user.data.wins}</div>
                <div class="stat-label">Victòries</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🥇</div>
                <div class="stat-value">${user.data.podiums}</div>
                <div class="stat-label">Podis</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⭐</div>
                <div class="stat-value">${user.data.points}</div>
                <div class="stat-label">Punts totals</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-value">${formatMoney(user.data.budget)}</div>
                <div class="stat-label">Pressupost</div>
            </div>
        </div>
        
        <div class="performance-section">
            <h4>📊 Rendiment de l'Equip</h4>
            <div class="performance-bar">
                <div class="performance-fill" style="width: ${teamRating}%">
                    <span>${teamRating}/100</span>
                </div>
            </div>
            <div class="performance-details">
                <div class="perf-detail">
                    <span class="perf-label">Habilitat mitjana pilots:</span>
                    <span class="perf-value">${avgDriverSkill.toFixed(1)}/100</span>
                </div>
                <div class="perf-detail">
                    <span class="perf-label">Millores HQ (mitjana):</span>
                    <span class="perf-value">Nivell ${avgUpgrade.toFixed(1)}</span>
                </div>
                <div class="perf-detail">
                    <span class="perf-label">Bonus mànager:</span>
                    <span class="perf-value">+${managerBonus}%</span>
                </div>
            </div>
        </div>
        
        <div class="race-stats-section">
            <h4>🏁 Estadístiques de Curses</h4>
            <div class="race-stats-grid">
                <div class="race-stat">
                    <span class="race-stat-label">Curses totals:</span>
                    <span class="race-stat-value">${totalRaces}</span>
                </div>
                <div class="race-stat">
                    <span class="race-stat-label">% de victòries:</span>
                    <span class="race-stat-value">${winRate}%</span>
                </div>
                <div class="race-stat">
                    <span class="race-stat-label">% de podis:</span>
                    <span class="race-stat-value">${podiumRate}%</span>
                </div>
            </div>
        </div>
    `;
}

}
