/**
 * MS Manager - Offline Mode Controller
 * Gestiona HQ (mejoras), Carreras y Tienda de Pilotos
 */

class OfflineController {
    constructor() {
        this.apiBaseUrl = this.getApiUrl();
        this.token = localStorage.getItem('authToken');
        
        // Estado del jugador
        this.player = {
            money: 50000000,  // 💰 Dinero del juego (crece rápido con carreras)
            coins: 10,       // 💎 Moneda premium (competitivo/pago)
            car: {
                engine: { level: 1, power: 10, accel: 10 },
                aero: { level: 1, downforce: 10, stability: 10 },
                drs: { level: 1, speed: 10, efficiency: 10 },
                chassis: { level: 1, durability: 10, weight: 10 }
            },
            hqLevels: {
                facilities: 1,
                engineering: 1,
                marketing: 1,
                staff: 1
            },
            currentPilot: null,
            racesCompleted: 0,
            wins: 0,
            podiums: 0
        };
        
        // Pilotos disponibles en la tienda
        this.availablePilots = [];
        
        // Pistas disponibles
        this.availableTracks = ['bahrain', 'leoverse', 'monza'];
        
        // Timer de refresh de tienda
        this.shopRefreshTime = 300; // 5 minutos en segundos
        this.shopTimer = null;
        
        this.init();
    }

    getApiUrl() {
        const isFileProtocol = window.location.protocol === 'file:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isFileProtocol || isLocalhost) {
            return 'http://localhost:5000/api';
        }
        return `${window.location.origin}/api`;
    }
    
    async init() {
        // Verificar autenticación
        if (!this.token) {
            window.location.href = 'index.html';
            return;
        }
        
        // Cargar datos del servidor
        await this.loadPlayerData();
        
        this.bindEvents();
        this.updateUI();
        this.renderCurrentPilot();
        this.generatePilots();
        this.loadTracks();
        this.startShopTimer();
    }
    
    /**
     * Vincula eventos
     */
    bindEvents() {
        // Navegación sidebar
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
        
        // Botones de mejora
        const upgradeButtons = document.querySelectorAll('.btn-upgrade');
        upgradeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const component = e.currentTarget.dataset.component;
                this.upgradeComponent(component);
            });
        });
        
        // Refresh de tienda
        const refreshBtn = document.getElementById('refresh-pilots');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshPilotShop());
        }
    }
    
    /**
     * Cambia entre secciones
     */
    switchSection(section) {
        // Actualizar sidebar
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });
        
        // Actualizar contenido
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.toggle('active', sec.id === `section-${section}`);
        });
    }
    
    /**
     * Carga datos del jugador desde el servidor
     */
    async loadPlayerData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = 'index.html';
                    return;
                }
                throw new Error('Failed to load user data');
            }
            
            const data = await response.json();
            const user = data.user;
            
            // Mapear datos del servidor al formato offline
            if (user.gameData) {
                this.player.money = user.gameData.budget || 20000000;
                this.player.coins = user.gameData.online?.coins || 20;
                this.player.wins = user.gameData.wins || 0;
                this.player.podiums = user.gameData.podiums || 0;
                this.player.racesCompleted = user.gameData.racesCompleted || 0;
                
                // Cargar mejoras del coche si existen
                if (user.gameData.upgrades) {
                    const upgrades = user.gameData.upgrades;
                    
                    // Engine
                    if (upgrades.engine) {
                        this.player.car.engine.level = upgrades.engine;
                        this.player.car.engine.power = 10 + (upgrades.engine - 1) * 10;
                        this.player.car.engine.accel = 10 + (upgrades.engine - 1) * 10;
                    }
                    
                    // Aero
                    if (upgrades.aero) {
                        this.player.car.aero.level = upgrades.aero;
                        this.player.car.aero.downforce = 10 + (upgrades.aero - 1) * 10;
                        this.player.car.aero.stability = 10 + (upgrades.aero - 1) * 10;
                    }
                    
                    // DRS
                    if (upgrades.drs) {
                        this.player.car.drs.level = upgrades.drs;
                        this.player.car.drs.speed = 10 + (upgrades.drs - 1) * 10;
                        this.player.car.drs.efficiency = 10 + (upgrades.drs - 1) * 10;
                    }
                    
                    // Chassis
                    if (upgrades.chassis) {
                        this.player.car.chassis.level = upgrades.chassis;
                        this.player.car.chassis.durability = 10 + (upgrades.chassis - 1) * 10;
                        this.player.car.chassis.weight = 10 + (upgrades.chassis - 1) * 10;
                    }
                }
                
                // Cargar niveles HQ
                if (user.gameData.hqLevels) {
                    this.player.hqLevels = user.gameData.hqLevels;
                }
                
                // Cargar piloto contratado
                if (user.gameData.currentPilot) {
                    this.player.currentPilot = user.gameData.currentPilot;
                }
            }
            
            // Guardar referencia al usuario
            this.userId = user.id;
            this.username = user.username;
            this.displayName = user.displayName || user.username;
            this.teamName = user.teamName || 'Tu Equipo';
            this.country = user.country || 'ES';
            
            // Actualizar nombre de usuario en la UI
            const avatarLetter = document.getElementById('user-avatar-letter');
            if (avatarLetter) {
                avatarLetter.textContent = this.username.charAt(0).toUpperCase();
            }
            
        } catch (error) {
            console.error('Error loading player data:', error);
            // Si falla, usar valores por defecto
            this.showNotification('Error al cargar datos del servidor', 'error');
        }
    }
    
    /**
     * Guarda datos del jugador en el servidor
     */
    async savePlayerData() {
        try {
            // Preparar datos para enviar
            const gameData = {
                budget: this.player.money,
                wins: this.player.wins,
                podiums: this.player.podiums,
                racesCompleted: this.player.racesCompleted,
                upgrades: {
                    engine: this.player.car.engine.level,
                    aero: this.player.car.aero.level,
                    drs: this.player.car.drs.level,
                    chassis: this.player.car.chassis.level
                },
                hqLevels: this.player.hqLevels,
                currentPilot: this.player.currentPilot,
                online: {
                    coins: this.player.coins
                }
            };
            
            const response = await fetch(`${this.apiBaseUrl}/user/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ gameData })
            });
            
            if (!response.ok) {
                throw new Error('Failed to save data');
            }
            
            console.log('Datos guardados correctamente');
            
        } catch (error) {
            console.error('Error saving player data:', error);
            this.showNotification('Error al guardar datos', 'error');
        }
    }
    
    /**
     * Actualiza toda la UI
     */
    updateUI() {
        this.updateCurrency();
        this.updateCarStats();
    }
    
    /**
     * Actualiza dinero y coins
     */
    updateCurrency() {
        document.getElementById('user-money').textContent = this.formatMoney(this.player.money);
        document.getElementById('user-coins').textContent = this.player.coins;
    }
    
    /**
     * Formatea dinero (5000000 -> 5,000,000 o 5M)
     */
    formatMoney(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1).replace('.0', '') + 'M';
        }
        return amount.toLocaleString('es-ES');
    }
    
    /**
     * Actualiza estadísticas del coche
     */
    updateCarStats() {
        const car = this.player.car;
        let totalRating = 0;
        
        // Actualizar cada componente
        Object.keys(car).forEach(component => {
            const comp = car[component];
            const level = comp.level;
            
            // Actualizar nivel
            const levelEl = document.getElementById(`${component}-level`);
            if (levelEl) levelEl.textContent = level;
            
            // Actualizar stats
            Object.keys(comp).forEach(stat => {
                if (stat === 'level') return;
                
                const value = comp[stat];
                const fillEl = document.getElementById(`${component}-${stat}`);
                const valueEl = document.getElementById(`${component}-${stat}-value`);
                
                if (fillEl) fillEl.style.width = `${value}%`;
                if (valueEl) valueEl.textContent = value;
                
                totalRating += value;
            });
            
            // Actualizar costo de mejora
            const cost = this.getUpgradeCost(component, level);
            const costEl = document.getElementById(`${component}-cost`);
            if (costEl) costEl.textContent = this.formatMoney(cost);
            
            // Deshabilitar botón si no hay suficiente dinero
            const btn = document.querySelector(`.btn-upgrade[data-component="${component}"]`);
            if (btn) {
                btn.disabled = this.player.money < cost || level >= 10;
                if (level >= 10) {
                    btn.querySelector('span').textContent = 'MAX';
                }
            }
        });
        
        // Actualizar rating total
        const totalRatingEl = document.getElementById('car-total-rating');
        if (totalRatingEl) {
            totalRatingEl.textContent = Math.round(totalRating / 8);
        }
    }
    
    /**
     * Calcula el costo de mejora (en money 💰)
     * Costos más altos para que el dinero fluya más
     */
    getUpgradeCost(component, currentLevel) {
        const baseCosts = {
            engine: 250000,    // 250K base
            aero: 300000,      // 300K base
            drs: 350000,       // 350K base
            chassis: 400000    // 400K base
        };
        
        // Crecimiento exponencial x1.8 por nivel
        return Math.floor(baseCosts[component] * Math.pow(1.8, currentLevel - 1));
    }
    
    /**
     * Mejora un componente del coche
     */
    upgradeComponent(component) {
        const comp = this.player.car[component];
        const cost = this.getUpgradeCost(component, comp.level);
        
        if (this.player.money < cost) {
            this.showNotification('No tienes suficiente dinero 💰', 'error');
            return;
        }
        
        if (comp.level >= 10) {
            this.showNotification('Componente al nivel máximo', 'info');
            return;
        }
        
        // Descontar dinero
        this.player.money -= cost;
        
        // Subir nivel
        comp.level++;
        
        // Mejorar stats (incremento de 8-12 puntos por nivel)
        Object.keys(comp).forEach(stat => {
            if (stat === 'level') return;
            const increment = Math.floor(Math.random() * 5) + 8;
            comp[stat] = Math.min(100, comp[stat] + increment);
        });
        
        // Animación de mejora
        this.animateUpgrade(component);
        
        // Actualizar UI
        this.updateUI();
        this.savePlayerData();
        
        // Notificación
        this.showNotification(`${component.toUpperCase()} mejorado al nivel ${comp.level}!`, 'success');
    }
    
    /**
     * Animación de mejora
     */
    animateUpgrade(component) {
        const card = document.querySelector(`.upgrade-card[data-component="${component}"]`);
        if (card) {
            card.style.transform = 'scale(1.05)';
            card.style.boxShadow = '0 0 40px rgba(0, 247, 255, 0.5)';
            
            setTimeout(() => {
                card.style.transform = '';
                card.style.boxShadow = '';
            }, 300);
        }
    }
    
    /**
     * Genera pilotos aleatorios para la tienda
     */
    generatePilots() {
        const firstNames = ['Max', 'Lewis', 'Charles', 'Lando', 'Carlos', 'George', 'Fernando', 
                           'Oscar', 'Pierre', 'Esteban', 'Daniel', 'Yuki', 'Alex', 'Lance'];
        const lastNames = ['Rodriguez', 'Hamilton', 'Silva', 'Norris', 'Sainz', 'Russell', 
                          'Alonso', 'Piastri', 'Gasly', 'Ocon', 'Ricciardo', 'Tsunoda'];
        const nationalities = ['🇪🇸 España', '🇬🇧 Reino Unido', '🇫🇷 Francia', '🇩🇪 Alemania', 
                              '🇮🇹 Italia', '🇧🇷 Brasil', '🇳🇱 Holanda', '🇯🇵 Japón', '🇦🇺 Australia'];
        const rarities = ['common', 'common', 'rare', 'rare', 'epic', 'legendary'];
        
        this.availablePilots = [];
        
        for (let i = 0; i < 6; i++) {
            const rarity = rarities[Math.floor(Math.random() * rarities.length)];
            const baseStats = this.getRarityBaseStats(rarity);
            
            const pilot = {
                id: Date.now() + i,
                name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
                nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
                rarity: rarity,
                speed: baseStats.speed + Math.floor(Math.random() * 20),
                control: baseStats.control + Math.floor(Math.random() * 20),
                experience: baseStats.experience + Math.floor(Math.random() * 20),
                price: this.calculatePilotPrice(rarity, baseStats)
            };
            
            pilot.overall = Math.round((pilot.speed + pilot.control + pilot.experience) / 3);
            
            this.availablePilots.push(pilot);
        }
        
        this.renderPilots();
    }
    
    /**
     * Stats base según rareza
     */
    getRarityBaseStats(rarity) {
        const stats = {
            common: { speed: 40, control: 40, experience: 40 },
            rare: { speed: 55, control: 55, experience: 55 },
            epic: { speed: 70, control: 70, experience: 70 },
            legendary: { speed: 85, control: 85, experience: 85 }
        };
        return stats[rarity];
    }
    
    /**
     * Calcula precio del piloto (en money 💰)
     */
    calculatePilotPrice(rarity, stats) {
        const basePrices = {
            common: 500000,      // 500K
            rare: 1500000,       // 1.5M
            epic: 3000000,       // 3M
            legendary: 7500000   // 7.5M
        };
        return basePrices[rarity];
    }
    
    /**
     * Renderiza pilotos en la tienda
     */
    renderPilots() {
        const container = document.getElementById('pilots-shop');
        const template = document.getElementById('pilot-template');
        
        if (!container || !template) return;
        
        container.innerHTML = '';
        
        this.availablePilots.forEach(pilot => {
            const card = template.content.cloneNode(true);
            
            // Datos básicos
            card.querySelector('.pilot-rarity').classList.add(pilot.rarity);
            card.querySelector('.pilot-name').textContent = pilot.name;
            card.querySelector('.pilot-nationality').textContent = pilot.nationality;
            card.querySelector('.overall-value').textContent = pilot.overall;
            
            // Stats
            card.querySelector('.speed').style.width = `${pilot.speed}%`;
            card.querySelector('.speed-val').textContent = pilot.speed;
            
            card.querySelector('.control').style.width = `${pilot.control}%`;
            card.querySelector('.control-val').textContent = pilot.control;
            
            card.querySelector('.experience').style.width = `${pilot.experience}%`;
            card.querySelector('.experience-val').textContent = pilot.experience;
            
            // Precio
            card.querySelector('.price-value').textContent = this.formatMoney(pilot.price);
            
            // Botón contratar
            const hireBtn = card.querySelector('.btn-hire');
            hireBtn.disabled = this.player.money < pilot.price;
            hireBtn.addEventListener('click', () => this.hirePilot(pilot));
            
            container.appendChild(card);
        });
    }
    
    /**
     * Contrata un piloto
     */
    hirePilot(pilot) {
        if (this.player.money < pilot.price) {
            this.showNotification('No tienes suficiente dinero 💰', 'error');
            return;
        }
        
        // Descontar dinero
        this.player.money -= pilot.price;
        
        // Asignar piloto
        this.player.currentPilot = pilot;
        
        // Actualizar UI
        this.updateCurrency();
        this.renderCurrentPilot();
        this.savePlayerData();
        
        this.showNotification(`¡${pilot.name} se ha unido a tu equipo!`, 'success');
    }
    
    /**
     * Renderiza el piloto actual
     */
    renderCurrentPilot() {
        const container = document.getElementById('current-pilot');
        if (!container) return;
        
        if (!this.player.currentPilot) {
            container.innerHTML = `
                <div class="pilot-placeholder">
                    <span class="placeholder-icon">👨‍✈️</span>
                    <p>Sin piloto contratado</p>
                    <small>Contrata un piloto de la tienda</small>
                </div>
            `;
            return;
        }
        
        const pilot = this.player.currentPilot;
        container.innerHTML = `
            <div class="pilot-rarity ${pilot.rarity}"></div>
            <div class="pilot-header">
                <div class="pilot-avatar">
                    <span class="avatar-icon">👨‍✈️</span>
                </div>
                <div class="pilot-info">
                    <h4 class="pilot-name">${pilot.name}</h4>
                    <p class="pilot-nationality">${pilot.nationality}</p>
                </div>
                <div class="pilot-overall">
                    <span class="overall-value">${pilot.overall}</span>
                </div>
            </div>
            <div class="pilot-stats">
                <div class="pilot-stat">
                    <span class="stat-label">Velocidad</span>
                    <div class="stat-bar-mini">
                        <div class="stat-fill-mini" style="width: ${pilot.speed}%"></div>
                    </div>
                    <span class="stat-num">${pilot.speed}</span>
                </div>
                <div class="pilot-stat">
                    <span class="stat-label">Control</span>
                    <div class="stat-bar-mini">
                        <div class="stat-fill-mini" style="width: ${pilot.control}%"></div>
                    </div>
                    <span class="stat-num">${pilot.control}</span>
                </div>
                <div class="pilot-stat">
                    <span class="stat-label">Experiencia</span>
                    <div class="stat-bar-mini">
                        <div class="stat-fill-mini" style="width: ${pilot.experience}%"></div>
                    </div>
                    <span class="stat-num">${pilot.experience}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Refresca la tienda de pilotos
     */
    refreshPilotShop() {
        // Verificar que haya pasado tiempo suficiente
        const lastRefresh = localStorage.getItem('lastPilotRefresh');
        const now = Date.now();
        
        if (lastRefresh && (now - parseInt(lastRefresh)) < 300000) { // 5 minutos
            this.showNotification('Debes esperar antes de refrescar de nuevo', 'info');
            return;
        }
        
        // Generar nuevos pilotos
        this.generatePilots();
        localStorage.setItem('lastPilotRefresh', now.toString());
        
        // Reiniciar timer
        this.shopRefreshTime = 300;
        
        this.showNotification('¡Tienda actualizada!', 'success');
    }
    
    /**
     * Timer de refresh de tienda
     */
    startShopTimer() {
        this.shopTimer = setInterval(() => {
            this.shopRefreshTime--;
            
            const minutes = Math.floor(this.shopRefreshTime / 60);
            const seconds = this.shopRefreshTime % 60;
            const timerEl = document.getElementById('refresh-timer');
            
            if (timerEl) {
                timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
            
            if (this.shopRefreshTime <= 0) {
                this.shopRefreshTime = 300;
                // Auto-refresh opcional
            }
        }, 1000);
    }
    
    /**
     * Muestra notificación
     */
    showNotification(message, type = 'info') {
        // Por ahora un alert simple, luego podemos hacer un toast bonito
        const emoji = {
            success: '✅',
            error: '❌',
            info: 'ℹ️'
        };
        
        console.log(`${emoji[type]} ${message}`);
        
        // TODO: Implementar toast notifications
        alert(`${emoji[type]} ${message}`);
    }
    
    // ==========================================
    // SISTEMA DE CARRERAS Y RECOMPENSAS
    // ==========================================
    
    /**
     * Configuración de recompensas de carreras
     * El dinero crece RÁPIDO para que el jugador pueda progresar
     */
    getRaceRewards() {
        return {
            // Recompensas base de dinero 💰 (crecen rápido)
            money: {
                participation: 100000,   // 100K por participar
                finish: 250000,          // 250K por terminar
                podium: 500000,          // 500K extra por podio
                win: 1000000,            // 1M extra por ganar
                fastestLap: 150000,      // 150K por vuelta rápida
                polePosition: 200000     // 200K por pole
            },
            // Recompensas de XP para HQ
            hqXp: {
                participation: 5,
                finish: 10,
                podium: 25,
                win: 50
            },
            // Recompensas de coins 💎 (solo en competitivo/logros especiales)
            coins: {
                firstWin: 5,             // Primera victoria
                win10Streak: 10,         // 10 victorias seguidas
                perfectRace: 3,          // Carrera perfecta (pole + win + fastest)
                seasonChampion: 25       // Campeón de temporada
            }
        };
    }
    
    /**
     * Completa una carrera y otorga recompensas
     * @param {Object} raceResult - Resultado de la carrera
     */
    completeRace(raceResult) {
        const rewards = this.getRaceRewards();
        let totalMoney = 0;
        let totalHqXp = 0;
        let coinsEarned = 0;
        let rewardDetails = [];
        
        // Siempre gana dinero por participar
        totalMoney += rewards.money.participation;
        totalHqXp += rewards.hqXp.participation;
        rewardDetails.push(`Participación: +${this.formatMoney(rewards.money.participation)}`);
        
        // Terminó la carrera
        if (raceResult.finished) {
            totalMoney += rewards.money.finish;
            totalHqXp += rewards.hqXp.finish;
            rewardDetails.push(`Finalización: +${this.formatMoney(rewards.money.finish)}`);
        }
        
        // Posición final
        if (raceResult.position <= 3) {
            totalMoney += rewards.money.podium;
            totalHqXp += rewards.hqXp.podium;
            this.player.podiums++;
            rewardDetails.push(`🏆 Podio: +${this.formatMoney(rewards.money.podium)}`);
        }
        
        if (raceResult.position === 1) {
            totalMoney += rewards.money.win;
            totalHqXp += rewards.hqXp.win;
            this.player.wins++;
            rewardDetails.push(`🥇 Victoria: +${this.formatMoney(rewards.money.win)}`);
            
            // Bonus de coins por primera victoria
            if (this.player.wins === 1) {
                coinsEarned += rewards.coins.firstWin;
                rewardDetails.push(`💎 ¡Primera victoria! +${rewards.coins.firstWin} Coins`);
            }
        }
        
        // Extras
        if (raceResult.fastestLap) {
            totalMoney += rewards.money.fastestLap;
            rewardDetails.push(`⚡ Vuelta rápida: +${this.formatMoney(rewards.money.fastestLap)}`);
        }
        
        if (raceResult.polePosition) {
            totalMoney += rewards.money.polePosition;
            rewardDetails.push(`🚀 Pole Position: +${this.formatMoney(rewards.money.polePosition)}`);
        }
        
        // Carrera perfecta (pole + win + fastest)
        if (raceResult.position === 1 && raceResult.fastestLap && raceResult.polePosition) {
            coinsEarned += rewards.coins.perfectRace;
            rewardDetails.push(`💎 ¡Carrera Perfecta! +${rewards.coins.perfectRace} Coins`);
        }
        
        // Aplicar multiplicadores según nivel de HQ
        const hqMultiplier = this.getHqMultiplier();
        totalMoney = Math.floor(totalMoney * hqMultiplier);
        
        // Aplicar recompensas
        this.player.money += totalMoney;
        this.player.coins += coinsEarned;
        this.player.racesCompleted++;
        
        // Subir XP de HQ
        this.addHqXp(totalHqXp);
        
        // Guardar y actualizar UI
        this.savePlayerData();
        this.updateCurrency();
        
        // Mostrar resumen de recompensas
        return {
            totalMoney,
            coinsEarned,
            hqXp: totalHqXp,
            details: rewardDetails,
            multiplier: hqMultiplier
        };
    }
    
    /**
     * Calcula multiplicador de dinero basado en niveles de HQ
     */
    getHqMultiplier() {
        const hq = this.player.hqLevels;
        const avgLevel = (hq.facilities + hq.engineering + hq.marketing + hq.staff) / 4;
        // Cada nivel de HQ añade 5% de bonus
        return 1 + (avgLevel - 1) * 0.05;
    }
    
    /**
     * Añade XP a las categorías de HQ
     */
    addHqXp(xp) {
        // Distribuir XP entre las categorías
        const categories = ['facilities', 'engineering', 'marketing', 'staff'];
        const xpPerCategory = Math.floor(xp / categories.length);
        
        categories.forEach(cat => {
            // Por ahora el XP sube directamente el nivel (simplificado)
            // En el futuro podemos hacer un sistema de XP acumulativo
            if (this.player.hqLevels[cat] < 50) {
                // Cada 100 XP sube 1 nivel
                const levelUps = Math.floor(xpPerCategory / 20);
                this.player.hqLevels[cat] = Math.min(50, this.player.hqLevels[cat] + levelUps);
            }
        });
    }
    
    /**
     * Carga y renderiza las pistas disponibles
     */
    loadTracks() {
        const tracksGrid = document.getElementById('tracks-list');
        if (!tracksGrid) return;
        
        // Obtener solo las pistas disponibles
        this.availableTracks.forEach(trackId => {
            const track = TRACKS_DATA[trackId];
            if (track) {
                const trackCard = this.createTrackCard(track);
                tracksGrid.appendChild(trackCard);
            }
        });
    }
    
    /**
     * Crea la tarjeta HTML de una pista
     */
    createTrackCard(track) {
        const circuitImg = `img/tracks/image-tracks/${track.id}-2d-model-msmanager.jpg`;
        const card = document.createElement('div');
        card.className = 'track-card';
        card.innerHTML = `
            <div class="track-image">
                <img src="${circuitImg}" alt="${track.name}" onerror="this.src='img/tracks/race-tracks/${track.id}.png'">
            </div>
            <div class="track-info">
                <h3>${track.shortName || track.name}</h3>
                <div class="track-details">
                    <span>${track.flag} ${track.country}</span>
                    <span>📏 ${track.length} km</span>
                    <span>🔄 ${track.laps} vueltas</span>
                </div>
                <div class="track-stats">
                    <div class="stat">
                        <span class="stat-label">Dificultad</span>
                        <span class="stat-value">${'★'.repeat(track.difficulty)}${'☆'.repeat(5 - track.difficulty)}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Desgaste</span>
                        <span class="stat-value">${track.characteristics.tyreWear}</span>
                    </div>
                </div>
                <button class="race-button" onclick="offlineController.startRace('${track.id}')">
                    <span class="button-icon">🏎️</span>
                    Correr
                </button>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Inicia una carrera en la pista seleccionada
     */
    startRace(trackId) {
        const track = TRACKS_DATA[trackId];
        if (!track) {
            this.showNotification('❌ Pista no encontrada', 'error');
            return;
        }

        this._pendingTrackId = trackId;

        // Fill modal
        const circuitImg = `img/tracks/image-tracks/${trackId}-2d-model-msmanager.jpg`;
        const circuitImgEl = document.getElementById('rs-circuit-img');
        circuitImgEl.src = circuitImg;
        circuitImgEl.onerror = function() {
            if (!this.dataset.fallbackStage) {
                this.dataset.fallbackStage = 'race';
                this.src = `img/tracks/race-tracks/${trackId}.png`;
                return;
            }
            this.src = `img/tracks/race-tracks/bahrain.png`;
        };
        circuitImgEl.dataset.fallbackStage = '';
        document.getElementById('rs-flag').textContent = track.flag || '';
        document.getElementById('rs-track-name').textContent = track.name;
        document.getElementById('rs-track-country').textContent = track.country;
        document.getElementById('rs-length').textContent = track.length;
        document.getElementById('rs-laps').textContent = Math.min(track.laps, 20);
        document.getElementById('rs-record').textContent = track.referenceTimes
            ? this._formatLapTime(track.referenceTimes.fastestLap)
            : (track.characteristics ? '—' : '—');
        document.getElementById('rs-tyre-wear').textContent =
            track.characteristics?.tyreWear || '—';
        document.getElementById('rs-drs').textContent =
            track.drsZones ? track.drsZones.length : '—';

        // Reset tyre radio to soft
        const softRadio = document.querySelector('#race-setup-modal input[value="soft"]');
        if (softRadio) softRadio.checked = true;

        document.getElementById('race-setup-modal').style.display = 'flex';
    }

    closeRaceSetup() {
        document.getElementById('race-setup-modal').style.display = 'none';
        this._pendingTrackId = null;
    }

    confirmRace() {
        const trackId = this._pendingTrackId;
        if (!trackId) return;

        const track = TRACKS_DATA[trackId];
        const selectedTyre = document.querySelector('#race-setup-modal input[name="tyre"]:checked')?.value || 'soft';

        const config = {
            trackId: trackId,
            playerTeam: 3,
            laps: Math.min(track.laps, 20),
            weather: 'dry',
            startingTyre: selectedTyre,
            playerProfile: {
                userId: this.userId,
                username: this.username,
                displayName: this.displayName || this.username,
                teamName: this.teamName || 'Tu Equipo',
                country: this.country || 'ES',
                currentPilot: this.player.currentPilot,
                car: this.player.car,
            },
        };
        localStorage.setItem('raceConfig', JSON.stringify(config));
        window.location.href = 'race.html';
    }

    _formatLapTime(seconds) {
        if (!seconds || isNaN(seconds)) return '—';
        const m = Math.floor(seconds / 60);
        const s = (seconds % 60).toFixed(3).padStart(6, '0');
        return `${m}:${s}`;
    }

    /**
     * Simula una carrera rápida (para testing/desarrollo)
     */
    simulateRace() {
        const positions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const position = positions[Math.floor(Math.random() * positions.length)];
        
        const result = {
            finished: true,
            position: position,
            fastestLap: Math.random() < 0.2, // 20% probabilidad
            polePosition: Math.random() < 0.15 // 15% probabilidad
        };
        
        const rewards = this.completeRace(result);
        
        let message = `🏁 Carrera completada - Posición: ${position}\n\n`;
        message += `💰 Dinero ganado: ${this.formatMoney(rewards.totalMoney)}`;
        if (rewards.multiplier > 1) {
            message += ` (x${rewards.multiplier.toFixed(2)} bonus HQ)`;
        }
        message += '\n\n';
        message += rewards.details.join('\n');
        
        if (rewards.coinsEarned > 0) {
            message += `\n\n💎 Coins ganados: ${rewards.coinsEarned}`;
        }
        
        this.showNotification(message, position <= 3 ? 'success' : 'info');
        
        return rewards;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.offlineController = new OfflineController();
});
