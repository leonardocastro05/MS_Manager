// Mostra un missatge estilitzat dins el joc
function showGameMessage(msg, type) {
    var modal = document.getElementById('game-message-modal');
    var text = document.getElementById('game-message-text');
    if (!modal || !text) return alert(msg);
    text.innerHTML = msg;
    modal.style.display = 'flex';
    // Opcional: canvia color segons tipus
    var content = document.getElementById('game-message-content');
    if (content) {
        if (type === 'error') content.style.color = '#D32F2F';
        else if (type === 'success') content.style.color = '#2ecc40';
        else content.style.color = '#FFD700';
    }
}
// Inicialitza un usuari dummy per proves si no existeix cap usuari
function ensureDummyUser() {
    if (typeof getCurrentUser !== 'function') return;
    let user = getCurrentUser();
    if (!user) {
        user = {
            username: 'demo',
            data: {
                budget: 20000000,
                upgrades: { engine: 5, aero: 5, chassis: 5 },
                online: null,
                onlineLeagues: []
            }
        };
        // Simula guardat a localStorage (substitueix per la teva funció real)
        if (typeof saveUserData === 'function') saveUserData(user.data);
        window._dummyUser = user;
        // Sobreescriu getCurrentUser per retornar el dummy
        window.getCurrentUser = () => window._dummyUser;
    }
    initializeOnlineData(user);
}

document.addEventListener('DOMContentLoaded', function() {
    ensureDummyUser();
    if (typeof loadOnlineScreen === 'function') loadOnlineScreen();
    if (typeof loadCarCustomization === 'function') loadCarCustomization();
    if (typeof updateOnlineHeaderBalances === 'function') updateOnlineHeaderBalances();
    if (typeof showOnlineSection === 'function') showOnlineSection('shop');
});
// Carrega tota la pantalla del modo online amb contingut dinàmic
function loadOnlineScreen() {
    const user = getCurrentUser();
    if (!user) return;
    initializeOnlineData(user);

    // Tenda de coins
    const shopCoinsDiv = document.getElementById('online-shop-coins');
    if (shopCoinsDiv && typeof coinShop !== 'undefined') {
        shopCoinsDiv.innerHTML = coinShop.map(pack => `
            <div class="shop-card">
                <div style="font-size:2.2em;">🪙</div>
                <b>${pack.coins} Coins</b><br>
                <span>${pack.label}</span><br>
                <span><b>${pack.price.toFixed(2)}€</b></span><br>
                ${pack.badge ? `<span style='color:#FFD700;font-size:0.9em;'>${pack.badge}</span><br>` : ''}
                <button onclick="buyCoinsReal('${pack.id}')">Comprar</button>
            </div>
        `).join('');
    }

    // Tenda de bitllets amb coins
    const shopMoneyDiv = document.getElementById('online-shop-money');
    if (shopMoneyDiv && typeof moneyShop !== 'undefined') {
        shopMoneyDiv.innerHTML = moneyShop.map(pack => `
            <div class="shop-card">
                <div style="font-size:2.2em;">💵</div>
                <b>${pack.label}</b><br>
                <span>Cost: <b>${pack.coinsCost} coins</b></span><br>
                <button onclick="buyMoneyWithCoins('${pack.id}')">Comprar</button>
            </div>
        `).join('');
    }

    // Starter pack
    const starterDiv = document.getElementById('online-starter-pack');
    if (starterDiv && typeof starterPack !== 'undefined') {
        starterDiv.innerHTML = `
            <div class="shop-card">
                <div style="font-size:2.2em;">🎁</div>
                <b>${starterPack.label}</b><br>
                <span>${starterPack.description}</span><br>
                <span><b>${starterPack.price.toFixed(2)}€</b></span><br>
                <button onclick="buyStarterPack()">Comprar</button>
            </div>
        `;
    }
}
// ============================================
// MODE ONLINE - LÒGICA PRINCIPAL
// ============================================

/**
 * INICIALITZAR DADES ONLINE PER UN USUARI NOU
 * Cridar això quan es crea un compte
 */
function initializeOnlineData(user) {
    if (!user.data.online) {
        user.data.online = {
            coins: 10,              // 10 coins inicials
            level: 1,               // Nivell 1
            xp: 0,                  // 0 XP
            driverLevel: 1,         // Pilot nivell 1
            managerLevel: 1,        // Manager nivell 1
            sponsor: null,          // Cap patrocinador
            carUpgrades: {          // Millores específiques online (diferents de HQ)
                engine: 0,
                aero: 0,
                chassis: 0
            },
            totalRaces: 0,          // Total de curses online
            onlineWins: 0,          // Victòries online
            onlinePodiums: 0        // Podis online
        };
        saveUserData(user.data);
    }
}

/**
 * COMPROVAR SI POT ACCEDIR AL MODE ONLINE
 * Requisit: HQ nivell 5 mínim en tots els components
 */
function canAccessOnline() {
    const user = getCurrentUser();
    if (!user) return false;
    
    const { engine, aero, chassis } = user.data.upgrades;
    return engine >= 5 && aero >= 5 && chassis >= 5;
}

/**
 * COMPRAR PATROCINADOR
 */
function buySponsor(sponsorId) {
    const user = getCurrentUser();
    if (!user) return;
    
    // Assegurar que té dades online
    initializeOnlineData(user);
    
    const sponsor = sponsors.find(s => s.id === sponsorId);
    if (!sponsor) {
        showGameMessage('⚠️ Patrocinador no trobat!', 'error');
        return;
    }
    
    // Comprovar diners
    if (user.data.budget < sponsor.cost) {
        showGameMessage(`💰 No tens prou diners!<br>Necessites: ${formatMoney(sponsor.cost)}<br>Tens: ${formatMoney(user.data.budget)}`, 'error');
        return;
    }
    
    // Comprar
    user.data.budget -= sponsor.cost;
    user.data.online.sponsor = sponsor;
    
    saveUserData(user.data);
    showGameMessage(`✅ Has contractat: ${sponsor.name}<br>${sponsor.description}`, 'success');
    
    // Recarregar pantalla
    if (typeof loadOnlineScreen === 'function') {
        loadOnlineScreen();
    }
}

/**
 * MILLORAR PILOT ONLINE (amb coins)
 */
function upgradeOnlineDriver() {
    const user = getCurrentUser();
    if (!user) return;
    
    initializeOnlineData(user);
    
    const currentLevel = user.data.online.driverLevel;
    const maxLevel = 20;
    
    if (currentLevel >= maxLevel) {
        showGameMessage('✅ El teu pilot ja està al nivell màxim (20)!', 'success');
        return;
    }
    
    // Cost: 5 coins per nivell
    const cost = 5;
    
    if (user.data.online.coins < cost) {
        showGameMessage(`🪙 No tens prou coins!<br>Necessites: ${cost} coins<br>Tens: ${user.data.online.coins} coins`, 'error');
        return;
    }
    
    // Millorar
    user.data.online.coins -= cost;
    user.data.online.driverLevel++;
    
    saveUserData(user.data);
    showGameMessage(`✅ Pilot millorat!<br>Nivell: ${user.data.online.driverLevel}<br>Cost: ${cost} coins`, 'success');
    
    if (typeof loadOnlineScreen === 'function') {
        loadOnlineScreen();
    }
}

/**
 * MILLORAR MANAGER ONLINE (amb coins)
 */
function upgradeOnlineManager() {
    const user = getCurrentUser();
    if (!user) return;
    
    initializeOnlineData(user);
    
    const currentLevel = user.data.online.managerLevel;
    const maxLevel = 20;
    
    if (currentLevel >= maxLevel) {
        showGameMessage('✅ El teu manager ja està al nivell màxim (20)!', 'success');
        return;
    }
    
    // Cost: 5 coins per nivell
    const cost = 5;
    
    if (user.data.online.coins < cost) {
        showGameMessage(`🪙 No tens prou coins!<br>Necessites: ${cost} coins<br>Tens: ${user.data.online.coins} coins`, 'error');
        return;
    }
    
    // Millorar
    user.data.online.coins -= cost;
    user.data.online.managerLevel++;
    
    saveUserData(user.data);
    showGameMessage(`✅ Manager millorat!<br>Nivell: ${user.data.online.managerLevel}<br>Cost: ${cost} coins`, 'success');
    
    if (typeof loadOnlineScreen === 'function') {
        loadOnlineScreen();
    }
}

/**
 * MILLORAR COTXE ONLINE (amb coins)
 */
function upgradeOnlineCar(component) {
    const user = getCurrentUser();
    if (!user) return;
    
    initializeOnlineData(user);
    
    const currentLevel = user.data.online.carUpgrades[component];
    const maxLevel = 20;
    
    if (currentLevel >= maxLevel) {
        showGameMessage('✅ Ja tens el nivell màxim (20) en aquest component!', 'success');
        return;
    }
    
    // Cost: 3 coins per nivell
    const cost = 3;
    
    if (user.data.online.coins < cost) {
        showGameMessage(`🪙 No tens prou coins!<br>Necessites: ${cost} coins<br>Tens: ${user.data.online.coins} coins`, 'error');
        return;
    }
    
    // Millorar
    user.data.online.coins -= cost;
    user.data.online.carUpgrades[component]++;
    
    saveUserData(user.data);
    showGameMessage(`✅ ${component.toUpperCase()} millorat!<br>Nivell: ${user.data.online.carUpgrades[component]}<br>Cost: ${cost} coins`, 'success');
    
    if (typeof loadOnlineScreen === 'function') {
        loadOnlineScreen();
    }
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
    
    // Comprar
    user.data.online.coins -= pack.coinsCost;
    user.data.budget += pack.amount;
    
    saveUserData(user.data);
    updateUserInfo();
    showGameMessage(`✅ Has comprat ${formatMoney(pack.amount)}!<br>Cost: ${pack.coinsCost} coins`, 'success');
    
    if (typeof loadOnlineScreen === 'function') {
        loadOnlineScreen();
    }
}

/**
 * AFEGIR XP I COMPROVAR PUJADA DE NIVELL
 */
function addXP(xpAmount) {
    const user = getCurrentUser();
    if (!user) return;
    
    initializeOnlineData(user);
    
    user.data.online.xp += xpAmount;
    
    // Comprovar si puja de nivell
    const currentLevel = user.data.online.level;
    const xpNeeded = getXPForLevel(currentLevel + 1);
    
    if (user.data.online.xp >= xpNeeded && currentLevel < 20) {
        // PUJA DE NIVELL!
        user.data.online.level++;
        user.data.online.xp = 0; // Reset XP
        
        // Donar recompenses
        const rewards = getRewardForLevel(user.data.online.level);
        user.data.budget += rewards.money;
        user.data.online.coins += rewards.coins;
        
        saveUserData(user.data);
        updateUserInfo();
        
        showGameMessage(`🎉 FELICITATS!<br>Has pujat al NIVELL ${user.data.online.level}!<br><br>🎁 Recompenses:<br>💰 +${formatMoney(rewards.money)}<br>🪙 +${rewards.coins} coins`, 'success');
    } else {
        saveUserData(user.data);
    }
}

/**
 * FINALITZAR CURSA ONLINE
 * Dona recompenses de patrocinador i XP
 */
function finishOnlineRace(position) {
    const user = getCurrentUser();
    if (!user) return;
    
    initializeOnlineData(user);
    
    // Actualitzar estadístiques
    user.data.online.totalRaces++;
    if (position === 1) user.data.online.onlineWins++;
    if (position <= 3) user.data.online.onlinePodiums++;
    
    // Recompenses del patrocinador
    let sponsorRewards = {
        coins: 0,
        money: 0
    };
    
    if (user.data.online.sponsor) {
        const sponsor = user.data.online.sponsor;
        
        // Coins per cursa (sempre)
        sponsorRewards.coins = sponsor.coinsPerRace;
        user.data.online.coins += sponsorRewards.coins;
        
        // Bonus per posició
        let bonusEarned = false;
        
        if (sponsor.bonusCondition === 'winner' && position === 1) {
            bonusEarned = true;
        } else if (sponsor.bonusCondition === 'top3' && position <= 3) {
            bonusEarned = true;
        } else if (sponsor.bonusCondition === 'top5' && position <= 5) {
            bonusEarned = true;
        }
        
        if (bonusEarned) {
            sponsorRewards.money = sponsor.bonusMoney;
            user.data.budget += sponsorRewards.money;
        }
    }
    
    // XP per posició
    const xpEarned = getXPForPosition(position);
    
    saveUserData(user.data);
    updateUserInfo();
    
    // Afegir XP (això pot fer pujar de nivell)
    addXP(xpEarned);
    
    // Missatge de recompenses
    let message = `🏁 CURSA ONLINE COMPLETADA!\n\n`;
    message += `📊 Posició: ${position}è\n`;
    message += `⭐ XP guanyada: +${xpEarned}\n\n`;
    
    if (user.data.online.sponsor) {
        message += `💼 Recompenses del Patrocinador:\n`;
        message += `🪙 +${sponsorRewards.coins} coins\n`;
        if (sponsorRewards.money > 0) {
            message += `💰 +${formatMoney(sponsorRewards.money)}\n`;
        }
    }
    
    showGameMessage(message, 'success');
}

/**
 * SIMULAR COMPRA REAL (només mostra missatge de moment)
 */
function buyCoinsReal(coinPackId) {
    const pack = coinShop.find(p => p.id === coinPackId);
    if (!pack) return;
    
    showGameMessage(`🚧 EN PRODUCCIÓ FINS A GENER 2026<br><br>Aquesta funcionalitat estarà disponible aviat!<br><br>Paquet: ${pack.label}<br>${pack.coins} coins per ${pack.price}€`, 'info');
}

/**
 * COMPRAR STARTER PACK (simulat)
 */
function buyStarterPack() {
    showGameMessage(`🚧 EN PRODUCCIÓ FINS A GENER 2026<br><br>Starter Pack: ${starterPack.description}<br>Preu: ${starterPack.price}€`, 'info');
}