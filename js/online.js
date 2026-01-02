// ============================================
// MODO ONLINE - SISTEMA COMPLET I FUNCIONAL
// ============================================

/**
 * REQUISIT D'ACCÉS: HQ NIVELL 5 MÍNIM
 * Aquesta és la porta d'entrada al modo online
 */
function canAccessOnline() {
    const user = getCurrentUser();
    if (!user) return false;

    const { engine, aero, chassis } = user.data.upgrades;
    return engine >= 5 && aero >= 5 && chassis >= 5;
}

/**
 * MOSTRAR ADVERTÈNCIA SI NO COMPLEIX REQUISITS
 */
function showOnlineAccessWarning() {
    const user = getCurrentUser();
    if (!user) return;

    const { engine, aero, chassis } = user.data.upgrades;
    const warning = document.getElementById('online-hq-warning');

    if (!warning) return;

    if (engine < 5 || aero < 5 || chassis < 5) {
        warning.style.display = 'block';
        warning.innerHTML = `
            <div style="padding:24px; text-align:center;">
                <h3 style="color:#e10600; margin-bottom:16px;">🚫 ACCÉS DENEGAT</h3>
                <p style="font-size:1.2em; margin-bottom:20px;">
                    Per accedir al Modo Online necessites tenir els 3 apartats del HQ al nivell 5 o superior.
                </p>
                <div style="display:flex; gap:24px; justify-content:center; margin-top:20px;">
                    <div style="background:rgba(255,255,255,0.1); padding:16px; border-radius:12px;">
                        <div style="font-size:2em;">⚙️</div>
                        <div>Motor: <strong style="color:${engine >= 5 ? '#2ecc40' : '#e10600'}">${engine}/5</strong></div>
                    </div>
                    <div style="background:rgba(255,255,255,0.1); padding:16px; border-radius:12px;">
                        <div style="font-size:2em;">✈️</div>
                        <div>Aero: <strong style="color:${aero >= 5 ? '#2ecc40' : '#e10600'}">${aero}/5</strong></div>
                    </div>
                    <div style="background:rgba(255,255,255,0.1); padding:16px; border-radius:12px;">
                        <div style="font-size:2em;">🔧</div>
                        <div>Xassís: <strong style="color:${chassis >= 5 ? '#2ecc40' : '#e10600'}">${chassis}/5</strong></div>
                    </div>
                </div>
                <button onclick="window.location.href='index.html#hq'" 
                        style="margin-top:24px; padding:12px 32px; font-size:1.1em; 
                               background:linear-gradient(90deg, #e10600, #ffd700); 
                               border:none; border-radius:10px; color:#fff; cursor:pointer; font-weight:bold;">
                    Anar a HQ per millorar
                </button>
            </div>
        `;

        // Ocultar contingut online
        const content = document.querySelector('.online-content');
        if (content) content.style.display = 'none';

        return false;
    } else {
        warning.style.display = 'none';
        const content = document.querySelector('.online-content');
        if (content) content.style.display = 'block';
        return true;
    }
}

/**
 * INICIALITZAR DADES ONLINE PER PRIMERA VEGADA
 */
function initializeOnlineData(user) {
    if (!user.data.online) {
        user.data.online = {
            coins: 10,              // 10 coins inicials per començar
            level: 1,               // Nivell d'usuari
            xp: 0,                  // Experiència actual
            driverLevel: 1,         // Nivell del pilot online
            managerLevel: 1,        // Nivell del manager online
            sponsor: null,          // Patrocinador actual
            carConfig: {            // Configuració del monoplaza
                color: '#FFD700',
                finish: 'brillant'
            },
            carUpgrades: {          // Millores específiques online
                engine: 0,
                aero: 0,
                chassis: 0
            },
            totalRaces: 0,
            onlineWins: 0,
            onlinePodiums: 0
        };
        saveUserData(user.data);
    }
}

/**
 * CARREGAR PANTALLA ONLINE COMPLETA
 */
function loadOnlineScreen() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Comprovar accés
    if (!showOnlineAccessWarning()) {
        return;
    }

    initializeOnlineData(user);
    updateOnlineHeaderBalances();

    // Carregar cada secció
    loadOnlineShop();
    loadOnlineSponsors();
    loadOnlineCarUpgrades();
    loadOnlineXPSystem();
    loadOnlineUserInfo();
}

/**
 * ACTUALITZAR BALANCES AL HEADER
 */
function updateOnlineHeaderBalances() {
    const user = getCurrentUser();
    if (!user) return;

    initializeOnlineData(user);

    const moneyEl = document.getElementById('online-header-money');
    const coinsEl = document.getElementById('online-header-coins');

    if (moneyEl) moneyEl.textContent = `💰 ${formatMoney(user.data.budget)}`;
    if (coinsEl) coinsEl.textContent = `🪙 ${user.data.online.coins}`;
}

/**
 * CARREGAR INFORMACIÓ D'USUARI
 */
function loadOnlineUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    const infoDiv = document.getElementById('online-user-info');
    if (!infoDiv) return;

    const xpCurrent = user.data.online.xp;
    const xpNeeded = getXPForLevel(user.data.online.level + 1);
    const xpPercent = (xpCurrent / xpNeeded) * 100;

    infoDiv.innerHTML = `
        <div class="shop-card" style="min-width:200px;">
            <div style="font-size:2em;">⭐</div>
            <b>Nivell ${user.data.online.level}</b><br>
            <div style="width:100%; background:#222; border-radius:8px; height:12px; margin:8px 0;">
                <div style="width:${xpPercent}%; background:linear-gradient(90deg, #ffd700, #2ecc40); 
                            height:100%; border-radius:8px; transition:width 0.5s;"></div>
            </div>
            <span style="font-size:0.9em;">${xpCurrent} / ${xpNeeded} XP</span>
        </div>
        
        <div class="shop-card" style="min-width:180px;">
            <div style="font-size:2em;">🏎️</div>
            <b>Pilot Nv.${user.data.online.driverLevel}</b><br>
            <span style="font-size:0.9em;">Habilitat base: ${50 + user.data.online.driverLevel * 2}</span><br>
            <button onclick="upgradeOnlineDriver()">
                Millorar (5 coins)
            </button>
        </div>
        
        <div class="shop-card" style="min-width:180px;">
            <div style="font-size:2em;">👤</div>
            <b>Manager Nv.${user.data.online.managerLevel}</b><br>
            <span style="font-size:0.9em;">Bonus: +${user.data.online.managerLevel}%</span><br>
            <button onclick="upgradeOnlineManager()">
                Millorar (5 coins)
            </button>
        </div>
        
        <div class="shop-card" style="min-width:180px;">
            <div style="font-size:2em;">💼</div>
            <b>Patrocinador</b><br>
            <span style="font-size:0.9em;">
                ${user.data.online.sponsor ? user.data.online.sponsor.icon + ' ' + user.data.online.sponsor.name : 'Cap patrocinador'}
            </span>
        </div>
    `;
}

/**
 * CARREGAR TENDA ONLINE
 */
function loadOnlineShop() {
    // Tenda de Coins (diners reals)
    const coinsDiv = document.getElementById('online-shop-coins');
    if (coinsDiv) {
        coinsDiv.innerHTML = coinShop.map(pack => `
            <div class="shop-card" style="min-width:160px;">
                <div style="font-size:2.5em;">🪙</div>
                <b>${pack.coins} Coins</b><br>
                <span>${pack.label}</span><br>
                ${pack.badge ? `<div class="badge">${pack.badge}</div>` : ''}
                <span style="font-size:1.3em; color:#2ecc40; font-weight:bold; margin:8px 0;">
                    ${pack.price.toFixed(2)}€
                </span>
                <button onclick="buyCoinsReal('${pack.id}')">
                    Comprar
                </button>
            </div>
        `).join('');
    }

    // Comprar diners amb coins
    const moneyDiv = document.getElementById('online-shop-money');
    if (moneyDiv) {
        moneyDiv.innerHTML = moneyShop.map(pack => `
            <div class="shop-card" style="min-width:160px;">
                <div style="font-size:2.5em;">💵</div>
                <b>${pack.label}</b><br>
                <span style="font-size:1.2em; color:#2ecc40; font-weight:bold;">
                    ${formatMoney(pack.amount)}
                </span><br>
                <span style="font-size:1.1em;">Cost: ${pack.coinsCost} coins</span>
                <button onclick="buyMoneyWithCoins('${pack.id}')">
                    Comprar amb coins
                </button>
            </div>
        `).join('');
    }

    // Starter Pack
    const starterDiv = document.getElementById('online-starter-pack');
    if (starterDiv) {
        starterDiv.innerHTML = `
            <div class="shop-card" style="min-width:240px; border:3px solid #ffd700;">
                <div style="font-size:2.5em;">🎁</div>
                <b style="font-size:1.3em;">${starterPack.label}</b><br>
                <span style="margin:8px 0; display:block;">${starterPack.description}</span>
                <div style="background:rgba(255,215,0,0.2); padding:8px; border-radius:8px; margin:8px 0;">
                    <div>🏎️ Pilot Nivell 5</div>
                    <div>👤 Manager Nivell 5</div>
                </div>
                <span style="font-size:1.4em; color:#ffd700; font-weight:bold;">
                    ${starterPack.price.toFixed(2)}€
                </span>
                <button onclick="buyStarterPack()">
                    Comprar Pack
                </button>
            </div>
        `;
    }
}

/**
 * CARREGAR PATROCINADORS
 */
function loadOnlineSponsors() {
    const user = getCurrentUser();
    if (!user) return;

    const sponsorsDiv = document.getElementById('online-sponsors-list');
    if (!sponsorsDiv) return;

    initializeOnlineData(user);
    const currentSponsor = user.data.online.sponsor;

    sponsorsDiv.innerHTML = sponsors.map(sponsor => {
        const isOwned = currentSponsor && currentSponsor.id === sponsor.id;
        const canBuy = user.data.budget >= sponsor.cost;

        return `
            <div class="shop-card" style="min-width:220px; ${isOwned ? 'border:3px solid #ffd700;' : ''}">
                <div style="font-size:2.5em;">${sponsor.icon}</div>
                <b>${sponsor.name}</b><br>
                <span style="font-size:0.95em; margin:8px 0; display:block;">
                    ${sponsor.description}
                </span>
                <div style="background:rgba(255,255,255,0.1); padding:8px; border-radius:8px; margin:8px 0; font-size:0.9em;">
                    <div>💰 ${formatMoney(sponsor.cost)}</div>
                    <div>🪙 ${sponsor.coinsPerRace} coins/cursa</div>
                    <div>💵 ${formatMoney(sponsor.bonusMoney)} bonus</div>
                </div>
                <button onclick="buySponsor(${sponsor.id})" 
                        ${isOwned || !canBuy ? 'disabled class="disabled"' : ''}>
                    ${isOwned ? '✓ Contractat' : canBuy ? 'Contractar' : '🔒 Sense diners'}
                </button>
            </div>
        `;
    }).join('');
}

/**
 * CARREGAR MILLORES DEL MONOPLAZA ONLINE
 */
function loadOnlineCarUpgrades() {
    const user = getCurrentUser();
    if (!user) return;

    const upgradesDiv = document.getElementById('online-car-upgrades-list');
    if (!upgradesDiv) return;

    initializeOnlineData(user);
    const { engine, aero, chassis } = user.data.online.carUpgrades;

    const upgrades = [
        { name: 'Motor', icon: '⚙️', level: engine, component: 'engine' },
        { name: 'Aerodinàmica', icon: '✈️', level: aero, component: 'aero' },
        { name: 'Xassís', icon: '🔧', level: chassis, component: 'chassis' }
    ];

    upgradesDiv.innerHTML = upgrades.map(upgrade => `
        <div class="shop-card" style="min-width:180px;">
            <div style="font-size:2.5em;">${upgrade.icon}</div>
            <b>${upgrade.name}</b><br>
            <span style="font-size:1.3em; color:#ffd700;">Nivell ${upgrade.level}</span><br>
            <div style="width:100%; background:#222; border-radius:8px; height:10px; margin:12px 0;">
                <div style="width:${(upgrade.level / 20) * 100}%; background:linear-gradient(90deg, #ffd700, #2ecc40); 
                            height:100%; border-radius:8px;"></div>
            </div>
            <span style="font-size:0.9em;">Màxim: Nivell 20</span><br>
            <button onclick="upgradeOnlineCar('${upgrade.component}')" 
                    ${upgrade.level >= 20 ? 'disabled class="disabled"' : ''}>
                ${upgrade.level >= 20 ? '✓ Màxim' : 'Millorar (3 coins)'}
            </button>
        </div>
    `).join('');
}

/**
 * CARREGAR SISTEMA D'XP
 */
function loadOnlineXPSystem() {
    const xpDiv = document.getElementById('online-xp-rewards');
    if (!xpDiv) return;

    xpDiv.innerHTML = `
        <div class="shop-card" style="max-width:600px; margin:0 auto;">
            <h4 style="color:#ffd700; margin-bottom:16px;">🎁 Recompenses per Nivell</h4>
            <div style="text-align:left; padding:0 12px;">
                <div style="margin:12px 0; padding:12px; background:rgba(255,255,255,0.05); border-radius:8px;">
                    <b style="color:#ffd700;">Nivells 1-5:</b> 3M€ per nivell
                </div>
                <div style="margin:12px 0; padding:12px; background:rgba(255,255,255,0.05); border-radius:8px;">
                    <b style="color:#ffd700;">Nivells 6-9:</b> 5M€ per nivell
                </div>
                <div style="margin:12px 0; padding:12px; background:rgba(255,255,255,0.05); border-radius:8px;">
                    <b style="color:#ffd700;">Nivells 10-14:</b> 8M€ per nivell
                </div>
                <div style="margin:12px 0; padding:12px; background:rgba(255,255,255,0.1); border-radius:8px; border:2px solid #ffd700;">
                    <b style="color:#ffd700;">Nivells 15-20:</b> 10M€ + 5 coins per nivell 🎉
                </div>
            </div>
            
            <h4 style="color:#ffd700; margin:24px 0 16px 0;">⭐ Guanya XP a cada cursa</h4>
            <div style="text-align:left; padding:0 12px; font-size:0.95em;">
                <div style="margin:8px 0;">🥇 1r lloc: <b style="color:#ffd700;">100 XP</b></div>
                <div style="margin:8px 0;">🥈 2n lloc: <b>80 XP</b></div>
                <div style="margin:8px 0;">🥉 3r lloc: <b>65 XP</b></div>
                <div style="margin:8px 0;">4t-10è lloc: <b>55-20 XP</b></div>
                <div style="margin:8px 0;">11è+ lloc: <b>10 XP</b></div>
            </div>
        </div>
    `;
}

/**
 * MILLORAR PILOT ONLINE
 */
function upgradeOnlineDriver() {
    const user = getCurrentUser();
    if (!user) return;

    initializeOnlineData(user);

    if (user.data.online.driverLevel >= 20) {
        showGameMessage('✅ El teu pilot ja està al nivell màxim (20)!', 'success');
        return;
    }

    const cost = 5;
    if (user.data.online.coins < cost) {
        showGameMessage(`🪙 No tens prou coins!<br>Necessites: ${cost} coins<br>Tens: ${user.data.online.coins} coins`, 'error');
        return;
    }

    user.data.online.coins -= cost;
    user.data.online.driverLevel++;

    saveUserData(user.data);
    updateOnlineHeaderBalances();
    loadOnlineUserInfo();

    showGameMessage(`✅ Pilot millorat!<br>🏎️ Nivell: ${user.data.online.driverLevel}<br>💰 Cost: ${cost} coins<br><br>Habilitat actual: ${50 + user.data.online.driverLevel * 2}/100`, 'success');
}

/**
 * MILLORAR MANAGER ONLINE
 */
function upgradeOnlineManager() {
    const user = getCurrentUser();
    if (!user) return;

    initializeOnlineData(user);

    if (user.data.online.managerLevel >= 20) {
        showGameMessage('✅ El teu manager ja està al nivell màxim (20)!', 'success');
        return;
    }

    const cost = 5;
    if (user.data.online.coins < cost) {
        showGameMessage(`🪙 No tens prou coins!<br>Necessites: ${cost} coins<br>Tens: ${user.data.online.coins} coins`, 'error');
        return;
    }

    user.data.online.coins -= cost;
    user.data.online.managerLevel++;

    saveUserData(user.data);
    updateOnlineHeaderBalances();
    loadOnlineUserInfo();

    showGameMessage(`✅ Manager millorat!<br>👤 Nivell: ${user.data.online.managerLevel}<br>💰 Cost: ${cost} coins<br><br>Bonus actual: +${user.data.online.managerLevel}%`, 'success');
}

/**
 * MILLORAR COMPONENT DEL COTXE ONLINE
 */
function upgradeOnlineCar(component) {
    const user = getCurrentUser();
    if (!user) return;

    initializeOnlineData(user);

    const currentLevel = user.data.online.carUpgrades[component];

    if (currentLevel >= 20) {
        showGameMessage('✅ Aquest component ja està al nivell màxim (20)!', 'success');
        return;
    }

    const cost = 3;
    if (user.data.online.coins < cost) {
        showGameMessage(`🪙 No tens prou coins!<br>Necessites: ${cost} coins<br>Tens: ${user.data.online.coins} coins`, 'error');
        return;
    }

    user.data.online.coins -= cost;
    user.data.online.carUpgrades[component]++;

    saveUserData(user.data);
    updateOnlineHeaderBalances();
    loadOnlineCarUpgrades();

    const names = { engine: 'Motor', aero: 'Aerodinàmica', chassis: 'Xassís' };
    const icons = { engine: '⚙️', aero: '✈️', chassis: '🔧' };

    showGameMessage(`✅ ${names[component]} millorat!<br>${icons[component]} Nivell: ${user.data.online.carUpgrades[component]}<br>💰 Cost: ${cost} coins`, 'success');
}

/**
 * COMPRAR PATROCINADOR
 */
function buySponsor(sponsorId) {
    const user = getCurrentUser();
    if (!user) return;

    initializeOnlineData(user);

    const sponsor = sponsors.find(s => s.id === sponsorId);
    if (!sponsor) return;

    if (user.data.budget < sponsor.cost) {
        showGameMessage(`💰 No tens prou diners!<br>Necessites: ${formatMoney(sponsor.cost)}<br>Tens: ${formatMoney(user.data.budget)}`, 'error');
        return;
    }

    user.data.budget -= sponsor.cost;
    user.data.online.sponsor = sponsor;

    saveUserData(user.data);
    updateUserInfo();
    updateOnlineHeaderBalances();
    loadOnlineSponsors();
    loadOnlineUserInfo();

    showGameMessage(`✅ Patrocinador contractat!<br>${sponsor.icon} ${sponsor.name}<br><br>${sponsor.description}<br><br>💰 Cost: ${formatMoney(sponsor.cost)}`, 'success');
}

/**
 * COMPRAR DINERS AMB COINS
 */
function buyMoneyWithCoins(moneyPackId) {
    const user = getCurrentUser();
    if (!user) return;

    initializeOnlineData(user);

    const pack = moneyShop.find(p => p.id === moneyPackId);
    if (!pack) return;

    if (user.data.online.coins < pack.coinsCost) {
        showGameMessage(`🪙 No tens prou coins!<br>Necessites: ${pack.coinsCost} coins<br>Tens: ${user.data.online.coins} coins`, 'error');
        return;
    }

    user.data.online.coins -= pack.coinsCost;
    user.data.budget += pack.amount;

    saveUserData(user.data);
    updateUserInfo();
    updateOnlineHeaderBalances();

    showGameMessage(`✅ Compra realitzada!<br>💵 Has rebut: ${formatMoney(pack.amount)}<br>🪙 Cost: ${pack.coinsCost} coins`, 'success');
}

/**
 * COMPRAR COINS AMB DINERS REALS (SIMULAT)
 */
function buyCoinsReal(coinPackId) {
    const pack = coinShop.find(p => p.id === coinPackId);
    if (!pack) return;

    const user = getCurrentUser();
    if (!user) return;

    // Simulació de compra (en un joc real seria amb Stripe/PayPal)
    showConfirm(
        '💳 Comprar Coins',
        `<b>${pack.label}</b><br><br>🪙 <b>${pack.coins} coins</b><br>💵 ${pack.price.toFixed(2)}€<br><br><span style="color: #ff9800;">⚠️ NOTA: Aquesta és una simulació.<br>En producció seria un pagament real.</span>`,
        () => {
        
        // Afegir coins a l'usuari
        if (!user.data.online.coins) user.data.online.coins = 0;
        user.data.online.coins += pack.coins;
        
        saveUserData(user.data);
        updateUserInfo();
        
        // Recarregar tenda per mostrar nous coins
        loadOnlineShop();
        
        showSuccess('✅ Compra Completada!', `Has rebut <b>${pack.coins} coins</b>!<br><br>💰 Total coins: <b>${user.data.online.coins}</b>`);
        },
        null,
        'Comprar',
        'Cancel·lar'
    );
}

/**
 * COMPRAR STARTER PACK (SIMULAT)
 */
function buyStarterPack() {
    const user = getCurrentUser();
    if (!user) return;

    showConfirm(
        '🎁 Comprar Starter Pack',
        `<b>${starterPack.description}</b><br><br>Inclou:<br>🏎️ Pilot Nivell 5<br>👤 Mànager Nivell 5<br><br>💵 ${starterPack.price.toFixed(2)}€<br><br><span style="color: #ff9800;">⚠️ NOTA: Aquesta és una simulació.<br>En producció seria un pagament real.</span>`,
        () => {
        
        // Afegir nivells
        if (!user.data.online.driverLevel) user.data.online.driverLevel = 1;
        if (!user.data.online.managerLevel) user.data.online.managerLevel = 1;
        
        user.data.online.driverLevel = Math.max(user.data.online.driverLevel, 5);
        user.data.online.managerLevel = Math.max(user.data.online.managerLevel, 5);
        
        saveUserData(user.data);
        updateUserInfo();
        
        // Recarregar tenda
        loadOnlineShop();
        
        showSuccess('✅ Starter Pack Comprat!', `🏎️ Pilot: Nivell <b>${user.data.online.driverLevel}</b><br>👤 Mànager: Nivell <b>${user.data.online.managerLevel}</b>`);
        },
        null,
        'Comprar',
        'Cancel·lar'
    );
}

/**
 * AFEGIR XP DESPRÉS D'UNA CURSA
 */
function addXP(xpAmount) {
    const user = getCurrentUser();
    if (!user) return;

    initializeOnlineData(user);

    user.data.online.xp += xpAmount;

    const currentLevel = user.data.online.level;
    const xpNeeded = getXPForLevel(currentLevel + 1);

    // Comprovar si puja de nivell
    if (user.data.online.xp >= xpNeeded && currentLevel < 20) {
        user.data.online.level++;
        user.data.online.xp -= xpNeeded; // Mantenir l'excés

        const rewards = getRewardForLevel(user.data.online.level);
        user.data.budget += rewards.money;
        user.data.online.coins += rewards.coins;

        saveUserData(user.data);
        updateUserInfo();
        updateOnlineHeaderBalances();

        showGameMessage(`🎉 <b>FELICITATS!</b><br><br>Has pujat al <b style="font-size:1.5em;">NIVELL ${user.data.online.level}</b>!<br><br>🎁 <b>Recompenses:</b><br>💰 +${formatMoney(rewards.money)}<br>${rewards.coins > 0 ? `🪙 +${rewards.coins} coins` : ''}`, 'success');
    } else {
        saveUserData(user.data);
    }
}

/**
 * FINALITZAR CURSA ONLINE AMB RECOMPENSES
 */
function finishOnlineRace(position) {
    const user = getCurrentUser();
    if (!user) return;

    initializeOnlineData(user);

    user.data.online.totalRaces++;
    if (position === 1) user.data.online.onlineWins++;
    if (position <= 3) user.data.online.onlinePodiums++;

    let sponsorRewards = { coins: 0, money: 0 };

    if (user.data.online.sponsor) {
        const sponsor = user.data.online.sponsor;
        sponsorRewards.coins = sponsor.coinsPerRace;
        user.data.online.coins += sponsorRewards.coins;

        let bonusEarned = false;
        if (sponsor.bonusCondition === 'winner' && position === 1) bonusEarned = true;
        else if (sponsor.bonusCondition === 'top3' && position <= 3) bonusEarned = true;
        else if (sponsor.bonusCondition === 'top5' && position <= 5) bonusEarned = true;

        if (bonusEarned) {
            sponsorRewards.money = sponsor.bonusMoney;
            user.data.budget += sponsorRewards.money;
        }
    }

    const xpEarned = getXPForPosition(position);

    saveUserData(user.data);
    updateUserInfo();
    updateOnlineHeaderBalances();

    let message = `🏁 <b>CURSA ONLINE COMPLETADA!</b><br><br>`;
    message += `📊 Posició: <b>${position}è</b><br>`;
    message += `⭐ XP guanyada: <b>+${xpEarned}</b><br>`;

    if (user.data.online.sponsor) {
        message += `<br>💼 <b>Recompenses del Patrocinador:</b><br>`;
        message += `🪙 +${sponsorRewards.coins} coins<br>`;
        if (sponsorRewards.money > 0) {
            message += `💰 +${formatMoney(sponsorRewards.money)}<br>`;
        }
    }

    showGameMessage(message, 'success');

    // Afegir XP (pot fer pujar de nivell)
    setTimeout(() => addXP(xpEarned), 1500);
}