// ============================================
// LÒGICA PRINCIPAL DEL JOC - VERSIÓ NETA
// ============================================

// --------------------------------------------
// GESTIÓ DE L'HQ (Headquarters)
// --------------------------------------------

/**
 * Millora un component de l'HQ (motor, aero, xassís)
 * Cost base: 500.000€ + 50.000€ per cada nivell actual
 */
function upgradeComponent(component) {
    const user = getCurrentUser();
    if (!user) {
        alert('⚠️ Primer has d\'iniciar sessió!');
        return;
    }

    const currentLevel = user.data.upgrades[component];
    
    // Límit màxim de nivell
    if (currentLevel >= 10) {
        alert('✅ Ja tens el nivell màxim (10)!');
        return;
    }

    // Calcular cost (augmenta amb cada nivell)
    const baseCost = gameData.upgradeCosts[component];
    const cost = baseCost + (currentLevel - 1) * 100000;

    // Comprovar si té diners
    if (user.data.budget < cost) {
        alert(`💰 No tens prou diners!\nNecessites: ${formatMoney(cost)}\nTens: ${formatMoney(user.data.budget)}`);
        return;
    }

    // Aplicar la millora
    user.data.budget -= cost;
    user.data.upgrades[component]++;

    // Guardar i actualitzar
    saveUserData(user.data);
    updateUserInfo();
    updateHQDisplay();

    alert(`✅ ${component.toUpperCase()} millorat!\nNivell: ${user.data.upgrades[component]}\nCost: ${formatMoney(cost)}`);
    
    // Comprovar si s'ha desbloquejat el mode online
    if (typeof checkOnlineUnlockAndNotify === 'function') {
        checkOnlineUnlockAndNotify();
    }
}

/**
 * Actualitza la visualització de l'HQ amb els nivells actuals
 */
function updateHQDisplay() {
    const user = getCurrentUser();
    if (!user) return;

    const { engine, aero, chassis } = user.data.upgrades;

    // Actualitzar textos de nivell
    document.getElementById('engine-level').textContent = `Nivell: ${engine}`;
    document.getElementById('aero-level').textContent = `Nivell: ${aero}`;
    document.getElementById('chassis-level').textContent = `Nivell: ${chassis}`;

    // Actualitzar barres de progrés (0-100, cada nivell = 10%)
    document.getElementById('engine-progress').value = engine * 10;
    document.getElementById('aero-progress').value = aero * 10;
    document.getElementById('chassis-progress').value = chassis * 10;

    // Actualitzar preus dels botons
    updateUpgradePrices(engine, aero, chassis);
}

/**
 * Actualitza els preus mostrats als botons de millora
 */
function updateUpgradePrices(engineLvl, aeroLvl, chassisLvl) {
    const baseCost = 1000000;
    
    const enginePrice = baseCost + (engineLvl - 1) * 150000;
    const aeroPrice = baseCost + (aeroLvl - 1) * 100000;
    const chassisPrice = baseCost + (chassisLvl - 1) * 100000;
    document.getElementById('engine-upgrade-price').textContent = formatMoney(enginePrice);
    document.getElementById('aero-upgrade-price').textContent = formatMoney(aeroPrice);
    document.getElementById('chassis-upgrade-price').textContent = formatMoney(chassisPrice);
}

// --------------------------------------------
// SISTEMA DE TENDA
// --------------------------------------------

let currentShopTab = 'drivers'; // 'drivers' o 'managers'

/**
 * Canvia entre la pestanya de Pilots i Mànagers
 */
function showShopTab(tab) {
    currentShopTab = tab;
    
    // Actualitzar estil dels botons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        
        const isDriversTab = tab === 'drivers' && btn.textContent.includes('Pilots');
        const isManagersTab = tab === 'managers' && btn.textContent.includes('Mànagers');
        
        if (isDriversTab || isManagersTab) {
            btn.classList.add('active');
        }
    });
    
    loadShopItems();
}

/**
 * Carrega els articles disponibles a la tenda
 */
function loadShopItems() {
    const user = getCurrentUser();
    if (!user) return;

    const shopContent = document.getElementById('shop-content');
    shopContent.innerHTML = ''; // Netejar contingut anterior

    const items = currentShopTab === 'drivers' ? gameData.drivers : gameData.managers;

    items.forEach(item => {
        // Comprovar si pot comprar i si ja el té
        const canBuy = user.data.budget >= item.price;
        const alreadyOwned = currentShopTab === 'drivers' 
            ? user.data.drivers.some(d => d.id === item.id)
            : user.data.manager && user.data.manager.id === item.id;

        // Crear targeta
        const card = createShopCard(item, canBuy, alreadyOwned);
        shopContent.appendChild(card);
    });
}

/**
 * Crea una targeta visual per un article de la tenda
 */
function createShopCard(item, canBuy, alreadyOwned) {
    const card = document.createElement('div');
    card.className = 'shop-card';

    const isPilot = currentShopTab === 'drivers';
    const icon = isPilot ? '🏎️' : '👤';
    const wrapClass = `shop-card-img-wrap ${isPilot ? 'pilot' : 'manager'}`;
    
    // Estadística específica
    const stat = isPilot 
        ? `<div class="shop-card-skill">⭐ Habilitat: ${item.skill}/100</div>`
        : `<div class="shop-card-bonus">📊 Bonus: +${item.bonus}%</div>`;

    // Botó amb estat
    let buttonText = '🛒 Contractar';
    let buttonClass = 'shop-card-btn';
    let disabled = '';
    
    if (alreadyOwned) {
        buttonText = '✓ Contractat';
        buttonClass += ' disabled';
        disabled = 'disabled';
    } else if (!canBuy) {
        buttonText = '🔒 Sense diners';
        buttonClass += ' disabled';
        disabled = 'disabled';
    }

    const action = isPilot ? `buyDriver(${item.id})` : `buyManager(${item.id})`;

    card.innerHTML = `
        <div class="${wrapClass}">${icon}</div>
        <div class="shop-card-name">${item.name}</div>
        <div class="shop-card-team">${item.team || ''}</div>
        ${stat}
        <div class="shop-card-price">💰 ${formatMoney(item.price)}</div>
        <button class="${buttonClass}" onclick="${action}" ${disabled}>
            ${buttonText}
        </button>
    `;

    return card;
}

/**
 * Compra un pilot per l'equip
 */
function buyDriver(driverId) {
    const user = getCurrentUser();
    if (!user) return;

    // Límit de 2 pilots
    if (user.data.drivers.length >= 2) {
        alert('⚠️ Ja tens 2 pilots!\nNomés pots tenir 2 pilots a l\'equip.');
        return;
    }

    const driver = gameData.drivers.find(d => d.id === driverId);
    if (!driver) {
        console.error('Pilot no trobat:', driverId);
        return;
    }

    // Comprovar diners
    if (user.data.budget < driver.price) {
        alert(`💰 No tens prou diners!\nNecessites: ${formatMoney(driver.price)}\nTens: ${formatMoney(user.data.budget)}`);
        return;
    }

    // Realitzar compra
    user.data.budget -= driver.price;
    user.data.drivers.push(driver);
    
    saveUserData(user.data);
    updateUserInfo();
    loadShopItems();
    loadTeamScreen(); // Actualitzar pantalla de l'equip
    
    alert(`✅ Has contractat a ${driver.name}!\n💰 -${formatMoney(driver.price)}`);
}

/**
 * Compra un mànager per l'equip
 */
function buyManager(managerId) {
    const user = getCurrentUser();
    if (!user) return;

    const manager = gameData.managers.find(m => m.id === managerId);
    if (!manager) {
        console.error('Mànager no trobat:', managerId);
        return;
    }

    // Comprovar diners
    if (user.data.budget < manager.price) {
        alert(`💰 No tens prou diners!\nNecessites: ${formatMoney(manager.price)}\nTens: ${formatMoney(user.data.budget)}`);
        return;
    }

    // Realitzar compra (substitueix l'anterior si n'hi ha)
    user.data.budget -= manager.price;
    user.data.manager = manager;
    
    saveUserData(user.data);
    updateUserInfo();
    loadShopItems();
    
    alert(`✅ Has contractat a ${manager.name}!\n💰 -${formatMoney(manager.price)}`);
}

// --------------------------------------------
// VISUALITZACIÓ DE L'EQUIP
// --------------------------------------------

/**
 * Carrega i mostra la pantalla de l'equip amb estadístiques
 */
function loadTeamScreen() {
    const user = getCurrentUser();
    if (!user) return;

    // Mostrar mànager
    displayManager(user);
    
    // Mostrar pilots
    displayDrivers(user);
    
    // Mostrar estadístiques
    displayTeamStats(user);
}

/**
 * Mostra la informació del mànager
 */
function displayManager(user) {
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
}

/**
 * Mostra els pilots de l'equip
 */
function displayDrivers(user) {
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
}

/**
 * Calcula i mostra les estadístiques de l'equip
 */
function displayTeamStats(user) {
    const statsDiv = document.getElementById('team-stats');
    
    // Calcular habilitat mitjana dels pilots
    let avgDriverSkill = 0;
    if (user.data.drivers.length > 0) {
        const totalSkill = user.data.drivers.reduce((sum, d) => sum + d.skill, 0);
        avgDriverSkill = totalSkill / user.data.drivers.length;
    }
    
    // Bonus del mànager
    const managerBonus = user.data.manager ? user.data.manager.bonus : 0;
    
    // Nivell mitjà de millores
    const { engine, aero, chassis } = user.data.upgrades;
    const avgUpgrade = (engine + aero + chassis) / 3;
    
    // Càlcul del rendiment global de l'equip
    const teamPerformance = avgDriverSkill * (1 + avgUpgrade / 20) * (1 + managerBonus / 100);
    const teamRating = Math.min(100, Math.round(teamPerformance / 1.2));
    
    // Estadístiques de curses
    const totalRaces = user.data.wins + user.data.podiums + Math.floor(user.data.points / 3);
    const winRate = totalRaces > 0 ? ((user.data.wins / totalRaces) * 100).toFixed(1) : 0;
    const podiumRate = totalRaces > 0 ? (((user.data.wins + user.data.podiums) / totalRaces) * 100).toFixed(1) : 0;
    
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