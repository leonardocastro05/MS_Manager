/**
 * MS Manager - League Controller
 * Gestiona la homepage de una liga: HQ, pilotos, tienda, carreras, clasificación
 */

class LeagueController {
    constructor() {
        // Detectar si estamos en file:// o en servidor web
        const isFileProtocol = window.location.protocol === 'file:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isFileProtocol || isLocalhost) {
            this.API_URL = 'http://localhost:5000/api';
        } else {
            this.API_URL = `${window.location.origin}/api`;
        }
        
        this.user = null;
        this.profile = null;
        this.league = null;
        this.leagueId = null;
        this.leagueStandings = [];
        this.raceCenter = null;
        this.currentStandingsView = 'drivers';
        this.currentSection = 'home';
        this.purchaseCooldownMs = 2000;
        this.lastPurchaseAt = 0;
        this.isPurchaseInProgress = false;
        this.raceCountdownTimer = null;
        
        // HQ Components con sus stats
        this.hqComponents = {
            engine: { level: 1, power: 10, accel: 5, baseCost: 500000 },
            aero: { level: 1, downforce: 8, curves: 6, baseCost: 600000 },
            drs: { level: 1, speed: 12, efficiency: 4, baseCost: 700000 },
            chassis: { level: 1, durability: 10, resistance: 5, baseCost: 800000 },
            market: { level: 1, chance: 2, highChance: 0.5, baseCost: 1000000 }
        };
        
        // Pilotos disponibles en la tienda
        this.availablePilots = [];
        this.currentPilot = null;
        this.pilotRefreshTimer = null;
        this.pilotRefreshTime = 300; // 5 minutos en segundos
        
        // Skins comprados
        this.ownedSkins = [];
        
        // Daily Races System
        this.dailyRacesStatus = {
            canRace: true,
            racesToday: 0,
            racesRemaining: 1,
            isRestDay: false,
            maxRacesPerDay: 1,
            schedule: null
        };
        
        // Chat System
        this.chatMessages = [];
        this.chatPollingInterval = null;
        
        // XP System
        this.xpConfig = {
            maxRaceXp: 100,
            minRaceXp: 20
        };
        
        this.init();
    }
    
    async init() {
        // Verificar autenticación
        const token = localStorage.getItem('authToken');
        if (!token) {
            window.location.href = 'index.html';
            return;
        }
        
        // Obtener ID de la liga de la URL
        const urlParams = new URLSearchParams(window.location.search);
        this.leagueId = urlParams.get('id');
        
        if (!this.leagueId) {
            console.error('No league ID provided');
            window.location.href = 'online.html';
            return;
        }
        
        console.log('Starting league initialization for:', this.leagueId);
        
        // Cargar datos
        await this.loadProfile();
        await this.loadLeagueData();
        await this.loadHQData();
        await this.loadPilotShop();
        await this.loadDailyRacesStatus();
        await this.loadChatMessages();
        await this.loadLeagueStandings();
        await this.loadRaceCenter();
        
        // Inicializar eventos y navegación
        this.bindEvents();
        this.initNavigation();
        this.startPilotRefreshTimer();
        this.startChatPolling();
        this.startRaceCountdownTimer();
        
        // Inicializar sistema de carreras
        this.initRaceSystem();
        
        console.log('League initialized successfully');
    }

    startRaceCountdownTimer() {
        this.updateRaceCountdown();

        if (this.raceCountdownTimer) {
            clearInterval(this.raceCountdownTimer);
        }

        this.raceCountdownTimer = setInterval(() => {
            this.updateRaceCountdown();
        }, 30000);
    }
    
    // ==========================================
    // API CALLS
    // ==========================================
    
    async loadProfile() {
        try {
            const response = await fetch(`${this.API_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.user) {
                this.profile = data.user;
                this.updateHeaderStats();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }
    
    async loadLeagueData() {
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.league) {
                this.league = data.league;
                this.leagueStandings = Array.isArray(data.standings) ? data.standings : this.leagueStandings;
                this.updateLeagueUI();
                this.renderFullStandingsTable();
            } else {
                // Liga no encontrada o no tienes acceso
                this.showToast('No se pudo cargar la liga', 'error');
                setTimeout(() => {
                    window.location.href = 'online.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Error loading league:', error);
            // Para desarrollo, usar datos de prueba
            this.league = this.getMockLeagueData();
            this.updateLeagueUI();
        }
    }

    async loadLeagueStandings() {
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/standings`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            if (data.success) {
                this.leagueStandings = Array.isArray(data.standings) ? data.standings : [];
                this.renderMiniLeaderboard();
                this.renderFullStandingsTable();
            }
        } catch (error) {
            console.error('Error loading standings:', error);
        }
    }

    async loadRaceCenter() {
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/race-center`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            const data = await response.json();
            if (!data.success) {
                return;
            }

            this.raceCenter = data;
            this.renderRaceCenter();
            this.updateRaceCountdown(data.schedule || null);
        } catch (error) {
            console.error('Error loading race center:', error);
        }
    }

    async postOnlineRaceAction(endpointCandidates, payload = null) {
        const token = localStorage.getItem('authToken');
        const requestBody = payload === null ? undefined : JSON.stringify(payload);
        let lastFailure = null;

        for (const endpoint of endpointCandidates) {
            try {
                const response = await fetch(`${this.API_URL}${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: requestBody
                });

                let data = null;
                const responseText = await response.text();
                try {
                    data = responseText ? JSON.parse(responseText) : {};
                } catch (parseError) {
                    data = {
                        success: false,
                        message: responseText || `HTTP ${response.status}`
                    };
                }

                const normalizedMessage = typeof data?.message === 'string'
                    ? data.message.toLowerCase()
                    : '';

                const routeNotFound = response.status === 404
                    && (
                        normalizedMessage.includes('route post')
                        || normalizedMessage.includes('cannot post')
                    );

                if (routeNotFound) {
                    lastFailure = data;
                    continue;
                }

                return { response, data, endpoint };
            } catch (error) {
                lastFailure = { success: false, message: error.message };
            }
        }

        return {
            response: null,
            data: lastFailure || { success: false, message: 'No se encontro un endpoint compatible' },
            endpoint: null
        };
    }

    async saveRaceStrategy() {
        const tyreCompound = document.getElementById('strategy-tyre')?.value || 'medium';
        const pitLap = Number(document.getElementById('strategy-pitlap')?.value || 0);
        const plannedLaps = Number(document.getElementById('strategy-laps')?.value || 20);

        try {
            const payload = {
                tyreCompound,
                pitLap: Number.isFinite(pitLap) && pitLap > 0 ? pitLap : null,
                plannedLaps: Number.isFinite(plannedLaps) ? plannedLaps : 20
            };

            const { data } = await this.postOnlineRaceAction([
                `/online/leagues/${this.leagueId}/race/strategy`,
                `/online/leagues/${this.leagueId}/strategy`
            ], payload);

            if (!data.success) {
                this.showToast(data.message || 'No se pudo guardar la estrategia', 'error');
                return false;
            }

            this.showToast('Estrategia guardada para la próxima salida', 'success');
            await this.loadRaceCenter();
            return true;
        } catch (error) {
            console.error('Error saving strategy:', error);
            this.showToast('Error guardando estrategia', 'error');
            return false;
        }
    }
    
    async loadHQData() {
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/hq`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                Object.keys(this.hqComponents).forEach(component => {
                    const incomingLevel = Number(data.hq?.[component]?.level);
                    this.hqComponents[component].level = Number.isFinite(incomingLevel)
                        ? Math.max(1, incomingLevel)
                        : 1;
                });
                this.currentPilot = data.pilot;

                const accountLevel = Number(data.accountLevel);
                if (this.profile?.gameData?.online && Number.isFinite(accountLevel)) {
                    this.profile.gameData.online.level = accountLevel;
                }
            }
        } catch (error) {
            console.error('Error loading HQ data:', error);
        }
        
        this.updateHQUI();
        this.updatePilotUI();
    }
    
    async loadPilotShop() {
        // Generar pilotos basados en el nivel del mercado
        this.generatePilotShop();
        this.renderPilotShop();
    }
    
    async upgradeHQ(component) {
        const comp = this.hqComponents[component];
        const accountLevel = this.profile?.gameData?.online?.level || 1;
        const currentLevel = Number.isFinite(Number(comp?.level)) ? Math.max(1, Number(comp.level)) : 1;
        comp.level = currentLevel;
        
        // Verificar límite de nivel
        if (currentLevel >= accountLevel) {
            this.showToast(`Necesitas nivel ${currentLevel + 1} de cuenta para mejorar más`, 'error');
            return false;
        }
        
        // Verificar dinero
        const cost = this.calculateUpgradeCost(component);
        const budget = this.profile?.gameData?.budget || 0;
        
        if (budget < cost) {
            this.showToast('No tienes suficiente dinero', 'error');
            return false;
        }
        
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/hq/upgrade`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ component })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Actualizar localmente
                comp.level = currentLevel + 1;
                this.profile.gameData.budget -= cost;
                this.updateHQUI();
                this.updateHeaderStats();
                this.showToast(`¡${this.getComponentName(component)} mejorado a nivel ${comp.level}!`, 'success');
                return true;
            } else {
                this.showToast(data.message || 'Error al mejorar', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error upgrading HQ:', error);
            // Para desarrollo, simular éxito
            comp.level = currentLevel + 1;
            this.updateHQUI();
            this.showToast(`¡${this.getComponentName(component)} mejorado a nivel ${comp.level}!`, 'success');
            return true;
        }
    }
    
    async hirePilot(pilotIndex) {
        const purchaseReady = await this.prepareShopPurchase();
        if (!purchaseReady) return false;

        const pilot = this.availablePilots[pilotIndex];
        if (!pilot) {
            this.finishShopPurchase();
            return false;
        }
        
        const budget = this.profile?.gameData?.budget || 0;
        
        if (budget < pilot.price) {
            this.showToast('No tienes suficiente dinero', 'error');
            this.finishShopPurchase();
            return false;
        }
        
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/pilot/hire`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ pilot })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentPilot = pilot;
                this.profile.gameData.budget -= pilot.price;
                this.updatePilotUI();
                this.updateHeaderStats();
                this.closeModal('modal-hire-pilot');
                this.showToast(`¡Has contratado a ${pilot.name}!`, 'success');
                return true;
            }
        } catch (error) {
            console.error('Error hiring pilot:', error);
            // Para desarrollo
            this.currentPilot = pilot;
            this.updatePilotUI();
            this.closeModal('modal-hire-pilot');
            this.showToast(`¡Has contratado a ${pilot.name}!`, 'success');
            return true;
        } finally {
            this.finishShopPurchase();
        }
    }
    
    async sellPilot() {
        if (!this.currentPilot) return;
        
        const sellPrice = Math.floor(this.currentPilot.price * 0.7); // 70% del precio original
        
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/pilot/sell`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.profile.gameData.budget += sellPrice;
                this.currentPilot = null;
                this.updatePilotUI();
                this.updateHeaderStats();
                this.showToast(`Piloto vendido por ${this.formatMoney(sellPrice)}`, 'success');
            }
        } catch (error) {
            // Para desarrollo
            this.profile.gameData.budget = (this.profile?.gameData?.budget || 0) + sellPrice;
            this.currentPilot = null;
            this.updatePilotUI();
            this.updateHeaderStats();
            this.showToast(`Piloto vendido por ${this.formatMoney(sellPrice)}`, 'success');
        }
    }
    
    // ==========================================
    // PILOT GENERATION SYSTEM
    // ==========================================
    
    generatePilotShop() {
        const marketLevel = this.hqComponents.market.level;
        this.availablePilots = [];
        
        // Generar 6 pilotos
        for (let i = 0; i < 6; i++) {
            this.availablePilots.push(this.generateRandomPilot(marketLevel));
        }
        
        // Ordenar por nivel
        this.availablePilots.sort((a, b) => b.level - a.level);
    }
    
    generateRandomPilot(marketLevel) {
        // Sistema de probabilidades basado en nivel de mercado
        // A mayor nivel de mercado, más probabilidad de pilotos de alto nivel
        const level = this.calculatePilotLevel(marketLevel);
        
        // Generar stats basados en nivel
        const baseSpeed = 20 + (level * 1.5);
        const baseControl = 20 + (level * 1.4);
        const baseExperience = 10 + (level * 1.6);
        
        const pilot = {
            id: Date.now() + Math.random(),
            name: this.generatePilotName(),
            nationality: this.getRandomNationality(),
            level: level,
            stats: {
                speed: Math.min(99, Math.floor(baseSpeed + Math.random() * 10)),
                control: Math.min(99, Math.floor(baseControl + Math.random() * 10)),
                experience: Math.min(99, Math.floor(baseExperience + Math.random() * 10))
            },
            rarity: this.getRarityFromLevel(level),
            price: this.calculatePilotPrice(level)
        };
        
        pilot.overall = Math.floor((pilot.stats.speed + pilot.stats.control + pilot.stats.experience) / 3);
        
        return pilot;
    }
    
    calculatePilotLevel(marketLevel) {
        // Base: probabilidad ponderada hacia niveles bajos
        // Con market level, aumenta la probabilidad de niveles altos
        
        const random = Math.random() * 100;
        const marketBonus = marketLevel * 2; // 2% extra por nivel de mercado
        
        // Rangos de probabilidad base (ajustados por marketLevel)
        if (random < 40 - marketBonus) {
            // Nivel 1-10 (Común)
            return Math.floor(Math.random() * 10) + 1;
        } else if (random < 70 - (marketBonus * 0.5)) {
            // Nivel 11-25 (Poco común)
            return Math.floor(Math.random() * 15) + 11;
        } else if (random < 90 - (marketBonus * 0.3)) {
            // Nivel 26-40 (Raro)
            return Math.floor(Math.random() * 15) + 26;
        } else {
            // Nivel 41-50 (Épico/Legendario)
            return Math.floor(Math.random() * 10) + 41;
        }
    }
    
    getRarityFromLevel(level) {
        if (level <= 10) return 'common';
        if (level <= 25) return 'uncommon';
        if (level <= 40) return 'rare';
        if (level <= 48) return 'epic';
        return 'legendary';
    }
    
    calculatePilotPrice(level) {
        // Precio base + multiplicador exponencial por nivel
        const basePrice = 100000;
        const multiplier = Math.pow(1.15, level);
        return Math.floor(basePrice * multiplier);
    }
    
    generatePilotName() {
        const firstNames = [
            'Carlos', 'Lewis', 'Max', 'Charles', 'Fernando', 'Sebastian',
            'Daniel', 'Lando', 'George', 'Oscar', 'Pierre', 'Esteban',
            'Alexander', 'Valtteri', 'Sergio', 'Kevin', 'Nico', 'Yuki',
            'Zhou', 'Logan', 'Nyck', 'Mick', 'Robert', 'Antonio'
        ];
        
        const lastNames = [
            'Sainz', 'Hamilton', 'Verstappen', 'Leclerc', 'Alonso', 'Vettel',
            'Ricciardo', 'Norris', 'Russell', 'Piastri', 'Gasly', 'Ocon',
            'Albon', 'Bottas', 'Perez', 'Magnussen', 'Hulkenberg', 'Tsunoda',
            'Guanyu', 'Sargeant', 'De Vries', 'Schumacher', 'Kubica', 'Giovinazzi'
        ];
        
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        
        return `${firstName} ${lastName}`;
    }
    
    getRandomNationality() {
        const nationalities = [
            { code: 'ES', flag: '🇪🇸', name: 'España' },
            { code: 'GB', flag: '🇬🇧', name: 'Reino Unido' },
            { code: 'NL', flag: '🇳🇱', name: 'Países Bajos' },
            { code: 'MC', flag: '🇲🇨', name: 'Mónaco' },
            { code: 'DE', flag: '🇩🇪', name: 'Alemania' },
            { code: 'AU', flag: '🇦🇺', name: 'Australia' },
            { code: 'FR', flag: '🇫🇷', name: 'Francia' },
            { code: 'FI', flag: '🇫🇮', name: 'Finlandia' },
            { code: 'MX', flag: '🇲🇽', name: 'México' },
            { code: 'JP', flag: '🇯🇵', name: 'Japón' },
            { code: 'CN', flag: '🇨🇳', name: 'China' },
            { code: 'IT', flag: '🇮🇹', name: 'Italia' },
            { code: 'BR', flag: '🇧🇷', name: 'Brasil' },
            { code: 'CA', flag: '🇨🇦', name: 'Canadá' }
        ];
        
        return nationalities[Math.floor(Math.random() * nationalities.length)];
    }
    
    // ==========================================
    // UI UPDATES
    // ==========================================
    
    updateHeaderStats() {
        if (!this.profile) return;
        
        const coins = this.profile.gameData?.online?.coins || 0;
        const level = this.profile.gameData?.online?.level || 1;
        const budget = this.profile.gameData?.budget || 0;
        
        document.getElementById('user-coins').textContent = coins;
        document.getElementById('user-level').textContent = `Nv. ${level}`;
        document.getElementById('user-budget').textContent = this.formatMoney(budget);
    }
    
    updateLeagueUI() {
        if (!this.league) return;
        
        // Header
        document.getElementById('header-league-name').textContent = this.league.name;
        
        // Home section
        document.getElementById('league-name-display').textContent = this.league.name;
        document.getElementById('league-desc-display').textContent = this.league.description || 'Sin descripción';
        document.getElementById('league-members').textContent = `${this.league.memberCount || this.league.members?.length || 1}/${this.league.settings?.maxMembers || 22}`;
        document.getElementById('league-country').textContent = this.getCountryName(this.league.country);
        
        const schedule = this.league.schedule;
        if (schedule) {
            const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
            const timeLabel = schedule.time || '20:00';

            const scheduleLabel = schedule.frequency === 'weekdays'
                ? `Lunes a Viernes ${timeLabel}`
                : `${dayNames[schedule.dayOfWeek] || 'Lunes'} ${timeLabel}`;

            document.getElementById('league-schedule').textContent = scheduleLabel;
        }

        this.updateRaceCountdown(schedule || null);
        
        // Season info
        const season = this.league.currentSeason;
        if (season) {
            document.getElementById('current-season').textContent = season.number || 1;
            document.getElementById('next-race').textContent = `${season.currentRace || 1} de ${season.totalRaces || 20}`;
        }
        
        // Show/hide delete button based on creator status
        const deleteBtn = document.getElementById('btn-delete-league');
        const leaveBtn = document.getElementById('btn-leave-league');
        
        if (deleteBtn && leaveBtn && this.profile) {
            // Multiple ways to check if user is the creator/owner
            const myUserId = this.profile._id || this.profile.id;
            const creatorId = this.league.creator?._id || this.league.creator;
            
            // Check direct creator match
            const isCreatorDirect = creatorId && myUserId && 
                                    creatorId.toString() === myUserId.toString();
            
            // Check if user has owner role in members
            const isOwnerRole = this.league.members && this.league.members.some(m => {
                const memberUserId = m.user?._id || m.user;
                return memberUserId && myUserId && 
                       memberUserId.toString() === myUserId.toString() && 
                       m.role === 'owner';
            });
            
            const isCreator = isCreatorDirect || isOwnerRole;
            
            console.log('League owner check:', { myUserId, creatorId, isCreatorDirect, isOwnerRole, isCreator });
            
            if (isCreator) {
                deleteBtn.classList.remove('hidden');
                leaveBtn.classList.add('hidden'); // Creator can't leave, only delete
            } else {
                deleteBtn.classList.add('hidden');
                leaveBtn.classList.remove('hidden');
            }
        }
        
        // Update mini leaderboard
        this.renderMiniLeaderboard();
    }
    
    updateHQUI() {
        const accountLevel = this.profile?.gameData?.online?.level || 1;
        
        // Mostrar límite de nivel
        document.getElementById('max-upgrade-level').textContent = accountLevel;
        document.getElementById('account-level-display').textContent = accountLevel;
        
        // Calcular rating total
        let totalRating = 0;
        
        // Actualizar cada componente
        Object.keys(this.hqComponents).forEach(key => {
            const comp = this.hqComponents[key];
            const safeLevel = Number.isFinite(Number(comp.level)) ? Math.max(1, Number(comp.level)) : 1;
            comp.level = safeLevel;
            totalRating += safeLevel;
            
            // Nivel y barra
            const levelEl = document.getElementById(`${key}-level`);
            const fillEl = document.getElementById(`${key}-fill`);
            const costEl = document.getElementById(`${key}-cost`);
            
            if (levelEl) levelEl.textContent = safeLevel;
            if (fillEl) fillEl.style.width = `${(safeLevel / 50) * 100}%`;
            if (costEl) costEl.textContent = this.formatMoney(this.calculateUpgradeCost(key));
            
            // Stats específicos
            if (key === 'engine') {
                document.getElementById('engine-power').textContent = `+${safeLevel * 10}`;
                document.getElementById('engine-accel').textContent = `+${safeLevel * 5}`;
            } else if (key === 'aero') {
                document.getElementById('aero-downforce').textContent = `+${safeLevel * 8}`;
                document.getElementById('aero-curves').textContent = `+${safeLevel * 6}`;
            } else if (key === 'drs') {
                document.getElementById('drs-speed').textContent = `+${safeLevel * 12}`;
                document.getElementById('drs-efficiency').textContent = `+${safeLevel * 4}`;
            } else if (key === 'chassis') {
                document.getElementById('chassis-durability').textContent = `+${safeLevel * 10}`;
                document.getElementById('chassis-resistance').textContent = `+${safeLevel * 5}`;
            } else if (key === 'market') {
                const baseChance = 2;
                const bonusChance = safeLevel * 0.5;
                document.getElementById('market-chance').textContent = `${(baseChance + bonusChance).toFixed(1)}%`;
                document.getElementById('market-high-chance').textContent = `${(0.5 + safeLevel * 0.3).toFixed(1)}%`;
            }
            
            // Deshabilitar botón si alcanzó el límite
            const btn = document.querySelector(`.btn-upgrade-hq[data-component="${key}"]`);
            if (btn) {
                if (safeLevel >= accountLevel) {
                    btn.disabled = true;
                    btn.innerHTML = '<span>🔒</span><span>Bloqueado</span>';
                } else if (safeLevel >= 50) {
                    btn.disabled = true;
                    btn.innerHTML = '<span>✓</span><span>Máximo</span>';
                } else {
                    btn.disabled = false;
                    btn.innerHTML = '<span>Mejorar</span><span class="btn-icon">⬆️</span>';
                }
            }
        });
        
        // Rating total
        document.getElementById('hq-total-rating').textContent = totalRating;
        document.getElementById('car-rating').textContent = totalRating;
    }
    
    updatePilotUI() {
        const container = document.getElementById('current-pilot');
        const sellSection = document.getElementById('sell-section');
        
        if (this.currentPilot) {
            container.innerHTML = this.renderPilotCard(this.currentPilot, true);
            sellSection.style.display = 'block';
            
            const sellPrice = Math.floor(this.currentPilot.price * 0.7);
            document.getElementById('sell-price').textContent = this.formatMoney(sellPrice);
            document.getElementById('pilot-level').textContent = `Nv.${this.currentPilot.level}`;
        } else {
            container.innerHTML = `
                <div class="pilot-placeholder">
                    <span class="placeholder-icon">👨‍✈️</span>
                    <p>Sin piloto contratado</p>
                    <small>Contrata un piloto de la tienda</small>
                </div>
            `;
            sellSection.style.display = 'none';
            document.getElementById('pilot-level').textContent = '-';
        }
        
        // Actualizar nivel de mercado en la tienda
        const marketLevelDisplay = document.getElementById('market-level-display');
        if (marketLevelDisplay) {
            marketLevelDisplay.textContent = this.hqComponents.market.level;
        }
    }
    
    renderPilotShop() {
        const container = document.getElementById('pilots-shop');
        
        container.innerHTML = this.availablePilots.map((pilot, index) => 
            this.renderPilotCard(pilot, false, index)
        ).join('');
        
        // Bind hire buttons
        container.querySelectorAll('.btn-hire').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.showHirePilotModal(index);
            });
        });
    }
    
    renderPilotCard(pilot, isCurrent = false, index = 0) {
        const rarityColors = {
            common: '#9e9e9e',
            uncommon: '#4caf50',
            rare: '#2196f3',
            epic: '#9c27b0',
            legendary: '#ff9800'
        };
        
        const rarityNames = {
            common: 'Común',
            uncommon: 'Poco Común',
            rare: 'Raro',
            epic: 'Épico',
            legendary: 'Legendario'
        };
        
        return `
            <div class="pilot-card ${pilot.rarity}" data-index="${index}">
                <div class="pilot-rarity" style="background: ${rarityColors[pilot.rarity]}">
                    ${rarityNames[pilot.rarity]}
                </div>
                <div class="pilot-header">
                    <div class="pilot-avatar">
                        <span class="avatar-icon">👨‍✈️</span>
                    </div>
                    <div class="pilot-info">
                        <h4 class="pilot-name">${pilot.name}</h4>
                        <p class="pilot-nationality">${pilot.nationality.flag} ${pilot.nationality.name}</p>
                    </div>
                    <div class="pilot-overall">
                        <span class="overall-value">${pilot.overall}</span>
                        <span class="overall-label">Nv.${pilot.level}</span>
                    </div>
                </div>
                
                <div class="pilot-stats">
                    <div class="pilot-stat">
                        <span class="stat-label">Velocidad</span>
                        <div class="stat-bar-mini">
                            <div class="stat-fill-mini speed" style="width: ${pilot.stats.speed}%"></div>
                        </div>
                        <span class="stat-num">${pilot.stats.speed}</span>
                    </div>
                    <div class="pilot-stat">
                        <span class="stat-label">Control</span>
                        <div class="stat-bar-mini">
                            <div class="stat-fill-mini control" style="width: ${pilot.stats.control}%"></div>
                        </div>
                        <span class="stat-num">${pilot.stats.control}</span>
                    </div>
                    <div class="pilot-stat">
                        <span class="stat-label">Experiencia</span>
                        <div class="stat-bar-mini">
                            <div class="stat-fill-mini experience" style="width: ${pilot.stats.experience}%"></div>
                        </div>
                        <span class="stat-num">${pilot.stats.experience}</span>
                    </div>
                </div>
                
                ${!isCurrent ? `
                    <div class="pilot-footer">
                        <div class="pilot-price">
                            <span class="price-icon">💰</span>
                            <span class="price-value">${this.formatMoney(pilot.price)}</span>
                        </div>
                        <button class="btn-hire" data-index="${index}">
                            <span>Contratar</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    getFallbackStandingsFromLeagueMembers() {
        const members = Array.isArray(this.league?.members) ? this.league.members : [];

        return members
            .map(member => {
                const user = member.user || {};
                return {
                    userId: (user._id || user.id || member.user || '').toString(),
                    displayName: user.displayName || user.username || 'Manager',
                    teamName: user.teamName || 'Sin equipo',
                    points: Number(member.stats?.points || 0),
                    wins: Number(member.stats?.wins || 0),
                    podiums: Number(member.stats?.podiums || 0),
                    racesCompleted: Number(member.stats?.racesCompleted || 0)
                };
            })
            .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.wins !== a.wins) return b.wins - a.wins;
                if (b.podiums !== a.podiums) return b.podiums - a.podiums;
                return a.displayName.localeCompare(b.displayName, 'es');
            })
            .map((entry, index) => ({ ...entry, position: index + 1 }));
    }

    getEffectiveStandings() {
        if (Array.isArray(this.leagueStandings) && this.leagueStandings.length > 0) {
            return this.leagueStandings;
        }
        return this.getFallbackStandingsFromLeagueMembers();
    }

    updateMyStandingStats() {
        const standings = this.getEffectiveStandings();
        const myId = (this.profile?._id || this.profile?.id || '').toString();
        const myStanding = standings.find(row => (row.userId || '').toString() === myId);

        const myPositionEl = document.getElementById('my-position');
        const myPointsEl = document.getElementById('my-points');
        if (myPositionEl) myPositionEl.textContent = myStanding ? `#${myStanding.position}` : '-';
        if (myPointsEl) myPointsEl.textContent = myStanding ? `${myStanding.points}` : '0';
    }

    renderMiniLeaderboard() {
        const container = document.getElementById('mini-leaderboard');
        if (!container) return;

        const standings = this.getEffectiveStandings();
        if (standings.length === 0) {
            container.innerHTML = '<div class="mini-lb-row"><span class="lb-name">Aún no hay managers en clasificación</span></div>';
            return;
        }

        container.innerHTML = standings.slice(0, 5).map((manager, i) => `
            <div class="mini-lb-row ${i < 3 ? 'top-' + (i + 1) : ''}">
                <span class="lb-position">${manager.position}</span>
                <span class="lb-name">${manager.displayName}</span>
                <span class="lb-team">${manager.teamName || 'Sin equipo'}</span>
                <span class="lb-points">${manager.points || 0} pts</span>
            </div>
        `).join('');

        this.updateMyStandingStats();
    }

    renderFullStandingsTable() {
        const tbody = document.getElementById('standings-body');
        if (!tbody) return;

        const standings = this.getEffectiveStandings();
        if (standings.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No hay datos de clasificación todavía.</td></tr>';
            return;
        }

        if (this.currentStandingsView === 'constructors') {
            const teams = new Map();
            standings.forEach(row => {
                const teamName = row.teamName || 'Sin equipo';
                const current = teams.get(teamName) || { teamName, points: 0, wins: 0, podiums: 0 };
                current.points += Number(row.points || 0);
                current.wins += Number(row.wins || 0);
                current.podiums += Number(row.podiums || 0);
                teams.set(teamName, current);
            });

            const constructors = Array.from(teams.values()).sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.wins !== a.wins) return b.wins - a.wins;
                return b.podiums - a.podiums;
            });

            tbody.innerHTML = constructors.map((team, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>—</td>
                    <td>${team.teamName}</td>
                    <td>${team.wins}</td>
                    <td>${team.podiums}</td>
                    <td>${team.points}</td>
                </tr>
            `).join('');
            return;
        }

        tbody.innerHTML = standings.map(row => `
            <tr>
                <td>${row.position}</td>
                <td>${row.displayName}</td>
                <td>${row.teamName || 'Sin equipo'}</td>
                <td>${row.wins || 0}</td>
                <td>${row.podiums || 0}</td>
                <td>${row.points || 0}</td>
            </tr>
        `).join('');
    }
    
    // ==========================================
    // SHOP TABS
    // ==========================================
    
    initShopTabs() {
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                // Actualizar tabs activos
                document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Mostrar contenido correspondiente
                document.querySelectorAll('.shop-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        });
    }
    
    // ==========================================
    // PILOT REFRESH TIMER
    // ==========================================
    
    startPilotRefreshTimer() {
        // Cargar tiempo restante del localStorage
        const savedTime = localStorage.getItem(`pilotRefresh_${this.leagueId}`);
        if (savedTime) {
            const remaining = Math.max(0, parseInt(savedTime) - Math.floor(Date.now() / 1000));
            this.pilotRefreshTime = remaining > 0 ? remaining : 300;
        }
        
        this.updateRefreshTimerDisplay();
        
        this.pilotRefreshTimer = setInterval(() => {
            this.pilotRefreshTime--;
            
            if (this.pilotRefreshTime <= 0) {
                this.pilotRefreshTime = 300;
                this.generatePilotShop();
                this.renderPilotShop();
                this.showToast('¡Nueva selección de pilotos disponible!', 'info');
            }
            
            this.updateRefreshTimerDisplay();
            
            // Guardar tiempo
            localStorage.setItem(
                `pilotRefresh_${this.leagueId}`, 
                Math.floor(Date.now() / 1000) + this.pilotRefreshTime
            );
        }, 1000);
    }
    
    updateRefreshTimerDisplay() {
        const minutes = Math.floor(this.pilotRefreshTime / 60);
        const seconds = this.pilotRefreshTime % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        const timerEl = document.getElementById('refresh-timer');
        if (timerEl) {
            timerEl.textContent = display;
        }
    }
    
    async instantRefreshPilots() {
        const purchaseReady = await this.prepareShopPurchase();
        if (!purchaseReady) return;

        const coins = this.profile?.gameData?.online?.coins || 0;
        
        if (coins < 5) {
            this.showToast('No tienes suficientes coins', 'error');
            this.finishShopPurchase();
            return;
        }
        
        // Descontar coins
        this.profile.gameData.online.coins -= 5;
        this.updateHeaderStats();
        
        // Refrescar tienda
        this.pilotRefreshTime = 300;
        this.generatePilotShop();
        this.renderPilotShop();
        this.showToast('¡Tienda de pilotos actualizada!', 'success');
        this.finishShopPurchase();
    }
    
    // ==========================================
    // MODALS
    // ==========================================
    
    showHirePilotModal(index) {
        const pilot = this.availablePilots[index];
        if (!pilot) return;
        
        const preview = document.getElementById('hire-pilot-preview');
        preview.innerHTML = this.renderPilotCard(pilot, true);
        preview.innerHTML += `
            <div class="hire-cost">
                <span class="cost-label">Coste:</span>
                <span class="cost-value">💰 ${this.formatMoney(pilot.price)}</span>
            </div>
        `;
        
        // Mostrar advertencia si ya tiene piloto
        const warning = document.getElementById('hire-warning');
        warning.style.display = this.currentPilot ? 'flex' : 'none';
        
        // Guardar índice para confirmación
        document.getElementById('confirm-hire-pilot').dataset.index = index;
        
        this.openModal('modal-hire-pilot');
    }
    
    showUpgradeHQModal(component) {
        const comp = this.hqComponents[component];
        const accountLevel = this.profile?.gameData?.online?.level || 1;
        const safeLevel = Number.isFinite(Number(comp?.level)) ? Math.max(1, Number(comp.level)) : 1;
        comp.level = safeLevel;
        const cost = this.calculateUpgradeCost(component);
        const budget = this.profile?.gameData?.budget || 0;
        
        const preview = document.getElementById('upgrade-preview');
        const blocked = document.getElementById('upgrade-blocked');
        const confirmBtn = document.getElementById('confirm-upgrade-hq');
        
        // Verificar si está bloqueado por nivel
        if (safeLevel >= accountLevel) {
            blocked.style.display = 'flex';
            document.getElementById('blocked-account-level').textContent = accountLevel;
            document.getElementById('blocked-max-level').textContent = accountLevel;
            confirmBtn.disabled = true;
        } else {
            blocked.style.display = 'none';
            confirmBtn.disabled = budget < cost;
        }
        
        preview.innerHTML = `
            <div class="upgrade-component-info">
                <span class="component-icon-large">${this.getComponentIcon(component)}</span>
                <div class="component-details">
                    <h3>${this.getComponentName(component)}</h3>
                    <p>Nivel actual: <strong>${safeLevel}</strong> → <strong>${safeLevel + 1}</strong></p>
                </div>
            </div>
            <div class="upgrade-cost-display">
                <span class="cost-label">Coste de mejora:</span>
                <span class="cost-value ${budget < cost ? 'insufficient' : ''}">
                    💰 ${this.formatMoney(cost)}
                </span>
                ${budget < cost ? '<span class="insufficient-msg">Fondos insuficientes</span>' : ''}
            </div>
        `;
        
        confirmBtn.dataset.component = component;
        
        this.openModal('modal-upgrade-hq');
    }
    
    openModal(modalId) {
        document.getElementById(modalId)?.classList.add('active');
    }
    
    closeModal(modalId) {
        document.getElementById(modalId)?.classList.remove('active');
    }
    
    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo(item.dataset.section);
            });
        });
        
        // Quick actions en home
        document.getElementById('btn-go-hq')?.addEventListener('click', () => this.navigateTo('headquarters'));
        document.getElementById('btn-go-pilots')?.addEventListener('click', () => this.navigateTo('pilots'));
        document.getElementById('btn-go-shop')?.addEventListener('click', () => this.navigateTo('shop'));
        document.getElementById('btn-go-races')?.addEventListener('click', () => this.navigateTo('races'));
        document.getElementById('btn-view-standings')?.addEventListener('click', () => this.navigateTo('standings'));
        
        // HQ Upgrade buttons
        document.querySelectorAll('.btn-upgrade-hq').forEach(btn => {
            btn.addEventListener('click', () => {
                const component = btn.dataset.component;
                this.showUpgradeHQModal(component);
            });
        });
        
        // Confirm upgrade
        document.getElementById('confirm-upgrade-hq')?.addEventListener('click', async () => {
            const component = document.getElementById('confirm-upgrade-hq').dataset.component;
            await this.upgradeHQ(component);
            this.closeModal('modal-upgrade-hq');
        });
        
        document.getElementById('cancel-upgrade-hq')?.addEventListener('click', () => {
            this.closeModal('modal-upgrade-hq');
        });
        
        document.getElementById('close-upgrade-hq')?.addEventListener('click', () => {
            this.closeModal('modal-upgrade-hq');
        });
        
        // Pilot hire
        document.getElementById('confirm-hire-pilot')?.addEventListener('click', async () => {
            const index = parseInt(document.getElementById('confirm-hire-pilot').dataset.index);
            await this.hirePilot(index);
        });
        
        document.getElementById('cancel-hire-pilot')?.addEventListener('click', () => {
            this.closeModal('modal-hire-pilot');
        });
        
        document.getElementById('close-hire-pilot')?.addEventListener('click', () => {
            this.closeModal('modal-hire-pilot');
        });
        
        // Sell pilot
        document.getElementById('btn-sell-pilot')?.addEventListener('click', () => {
            if (confirm('¿Seguro que quieres vender a tu piloto?')) {
                this.sellPilot();
            }
        });
        
        // Instant refresh
        document.getElementById('instant-refresh')?.addEventListener('click', async () => {
            await this.instantRefreshPilots();
        });
        
        // Shop tabs
        this.initShopTabs();
        
        // Shop coin packages
        document.querySelectorAll('#coin-packages .shop-item').forEach(item => {
            const packageId = item.dataset.package;
            if (packageId && packageId.startsWith('coins_')) {
                item.querySelector('.item-price')?.addEventListener('click', async () => {
                    await this.buyCoinPackage(packageId);
                });
            }
        });
        
        // Shop money packages
        document.querySelectorAll('#money-packages .shop-item').forEach(item => {
            const packageId = item.dataset.package;
            if (packageId && packageId.startsWith('money_')) {
                item.querySelector('.item-price')?.addEventListener('click', async () => {
                    await this.buyMoneyPackage(packageId);
                });
            }
        });
        
        // Skin purchase
        document.querySelectorAll('.btn-buy-skin:not([disabled])').forEach(btn => {
            btn.addEventListener('click', () => {
                const skin = btn.dataset.skin;
                this.showBuySkinModal(skin);
            });
        });
        
        document.getElementById('confirm-buy-skin')?.addEventListener('click', () => {
            // Aquí iría la lógica de compra real
            this.showToast('Compra de skins próximamente disponible', 'info');
            this.closeModal('modal-buy-skin');
        });
        
        document.getElementById('cancel-buy-skin')?.addEventListener('click', () => {
            this.closeModal('modal-buy-skin');
        });
        
        document.getElementById('close-buy-skin')?.addEventListener('click', () => {
            this.closeModal('modal-buy-skin');
        });
        
        // Modal overlays
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                const modal = overlay.closest('.modal');
                if (modal) modal.classList.remove('active');
            });
        });
        
        // Standings tabs
        document.querySelectorAll('.standings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.standings-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentStandingsView = tab.dataset.type || 'drivers';
                this.renderFullStandingsTable();
            });
        });

        // Race strategy actions
        document.getElementById('btn-save-strategy')?.addEventListener('click', async () => {
            await this.saveRaceStrategy();
        });

        document.getElementById('btn-refresh-race-center')?.addEventListener('click', async () => {
            await this.loadRaceCenter();
        });
        
        // Chat events
        document.getElementById('btn-send-chat')?.addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        // Leave League button
        document.getElementById('btn-leave-league')?.addEventListener('click', () => {
            this.showLeaveLeagueConfirm();
        });
        
        // Delete League button (only for creator)
        document.getElementById('btn-delete-league')?.addEventListener('click', () => {
            this.showDeleteLeagueConfirm();
        });
    }
    
    // ==========================================
    // LEAVE / DELETE LEAGUE
    // ==========================================
    
    showLeaveLeagueConfirm() {
        const leagueName = this.league?.name || 'esta liga';
        
        if (confirm(`¿Estás seguro de que quieres salir de "${leagueName}"?\n\nPerderás todo tu progreso en esta liga incluyendo:\n• Tu piloto contratado\n• Todas las mejoras de HQ\n• Tu posición en la clasificación\n\nEsta acción no se puede deshacer.`)) {
            this.leaveLeague();
        }
    }
    
    async leaveLeague() {
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Has salido de la liga correctamente', 'success');
                setTimeout(() => {
                    window.location.href = 'online.html';
                }, 1500);
            } else {
                this.showToast(data.message || 'Error al salir de la liga', 'error');
            }
        } catch (error) {
            console.error('Error leaving league:', error);
            this.showToast('Error de conexión', 'error');
        }
    }
    
    showDeleteLeagueConfirm() {
        const leagueName = this.league?.name || 'esta liga';
        const memberCount = this.league?.memberCount || this.league?.members?.length || 0;
        
        if (confirm(`⚠️ ATENCIÓN: Vas a ELIMINAR "${leagueName}"\n\nEsto afectará a ${memberCount} miembro(s):\n• Se eliminará TODO el historial de la liga\n• Todos los miembros perderán su progreso\n• Los datos de carreras serán borrados\n• Las mejoras de todos los jugadores se perderán\n\n¿Estás COMPLETAMENTE seguro?`)) {
            // Segunda confirmación por seguridad
            const confirmText = prompt('Escribe "ELIMINAR" para confirmar la eliminación de la liga:');
            if (confirmText === 'ELIMINAR') {
                this.deleteLeague();
            } else {
                this.showToast('Eliminación cancelada', 'info');
            }
        }
    }
    
    async deleteLeague() {
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.showToast('Liga eliminada correctamente', 'success');
                setTimeout(() => {
                    window.location.href = 'online.html';
                }, 1500);
            } else {
                this.showToast(data.message || 'Error al eliminar la liga', 'error');
            }
        } catch (error) {
            console.error('Error deleting league:', error);
            this.showToast('Error de conexión', 'error');
        }
    }
    
    showBuySkinModal(skinId) {
        const skinNames = {
            galactic: 'Temática Galáctica',
            neon: 'Neón Nocturno',
            retro: 'Arcade Retro',
            cyberpunk: 'Cyberpunk 2099'
        };
        
        document.getElementById('purchase-skin-name').textContent = skinNames[skinId];
        
        const trackSelect = document.getElementById(`${skinId}-track`);
        if (trackSelect) {
            document.getElementById('purchase-track-name').textContent = 
                trackSelect.options[trackSelect.selectedIndex].text;
        }
        
        this.openModal('modal-buy-skin');
    }
    
    // ==========================================
    // SHOP SYSTEM - SIMULATED PURCHASES
    // ==========================================
    
    async buyCoinPackage(packageId) {
        const purchaseReady = await this.prepareShopPurchase();
        if (!purchaseReady) return false;

        try {
            const packages = {
                'coins_5': { coins: 5, price: '1,99€' },
                'coins_12': { coins: 12, price: '4,99€' },
                'coins_18': { coins: 18, price: '7,99€' },
                'coins_30': { coins: 30, price: '12,99€' },
                'coins_50': { coins: 50, price: '19,99€' },
                'coins_80': { coins: 80, price: '29,99€' }
            };
            
            const pkg = packages[packageId];
            if (!pkg) return;
            
            const confirmed = confirm(
                `🪙 COMPRA SIMULADA (DEMO)\n\n` +
                `Vas a recibir ${pkg.coins} coins\n` +
                `Precio: ${pkg.price}\n\n` +
                `⚠️ Esta es una compra simulada para desarrollo.\n` +
                `No se realizará ningún cargo real.\n\n` +
                `¿Continuar con la compra simulada?`
            );
            
            if (!confirmed) return;
            
            const response = await fetch(`${this.API_URL}/online/shop/buy-coins-simulated`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ packageId })
            });
            const data = await response.json();
            
            if (data.success) {
                this.showToast(`✅ ${data.message}`, 'success');
                // Update coins in UI
                if (this.profile) {
                    this.profile.gameData.online = this.profile.gameData.online || {};
                    this.profile.gameData.online.coins = data.newBalance.coins;
                    this.updateHeaderStats();
                }
                return true;
            } else {
                this.showToast(data.message || 'Error en la compra simulada', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error buying coin package:', error);
            this.showToast('Error de conexión', 'error');
            return false;
        } finally {
            this.finishShopPurchase();
        }
    }
    
    async buyMoneyPackage(packageId) {
        const purchaseReady = await this.prepareShopPurchase();
        if (!purchaseReady) return false;

        try {
            const response = await fetch(`${this.API_URL}/online/shop/buy-money`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ packageId })
            });
            const data = await response.json();
            
            if (data.success) {
                this.showToast(data.message, 'success');
                // Update balance
                if (this.profile) {
                    this.profile.gameData.online.coins = data.newBalance.coins;
                    this.profile.gameData.budget = data.newBalance.budget;
                    this.updateHeaderStats();
                }
                return true;
            } else {
                this.showToast(data.message || 'Error en la compra', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error buying money package:', error);
            this.showToast('Error de conexión', 'error');
            return false;
        } finally {
            this.finishShopPurchase();
        }
    }
    
    // ==========================================
    // DAILY RACES SYSTEM
    // ==========================================
    
    async loadDailyRacesStatus() {
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/daily-status`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.dailyRacesStatus = {
                    canRace: data.canRace,
                    racesToday: data.racesToday || 0,
                    racesRemaining: data.racesRemaining || 0,
                    isRestDay: data.isRestDay,
                    maxRacesPerDay: data.maxRacesPerDay || 1,
                    reason: data.reason,
                    message: data.message,
                    schedule: data.schedule || null
                };
            }
        } catch (error) {
            console.error('Error loading daily races status:', error);
            // Default: Check if weekend locally
            const today = new Date().getDay();
            this.dailyRacesStatus.isRestDay = (today === 0 || today === 6);
        }
        
        this.updateDailyRacesUI();
    }
    
    updateDailyRacesUI() {
        const status = this.dailyRacesStatus;
        const qualifyingButton = document.getElementById('btn-qualifying');
        const startRaceButton = document.getElementById('btn-start-race');
        
        // Update counters
        document.getElementById('races-done-today').textContent = status.racesToday;
        document.getElementById('races-max-daily').textContent = status.maxRacesPerDay;
        document.getElementById('races-remaining-text').textContent = 
            `${status.racesRemaining} carreras restantes hoy`;
        
        // Show/hide rest day notice
        const restDayNotice = document.getElementById('rest-day-notice');
        const racesStatus = document.getElementById('daily-races-status');
        
        if (status.isRestDay) {
            restDayNotice.style.display = 'flex';
        } else {
            restDayNotice.style.display = 'none';
        }

        if (qualifyingButton) {
            if (status.canRace && !status.isRestDay) {
                qualifyingButton.removeAttribute('disabled');
            } else {
                qualifyingButton.setAttribute('disabled', 'disabled');
            }
        }

        if (startRaceButton && (status.isRestDay || !status.canRace)) {
            startRaceButton.setAttribute('disabled', 'disabled');
        }
        
        // Disable race if no races remaining
        if (!status.canRace && !status.isRestDay) {
            this.showToast(status.message || 'No puedes correr más hoy', 'info');
        }

        this.updateRaceCountdown(status.schedule || null);
    }

    getScheduleCountdownTarget(schedule) {
        if (!schedule || schedule.seasonCompleted) {
            return null;
        }

        if (schedule.nextRaceAt) {
            const parsed = new Date(schedule.nextRaceAt);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
        }

        if (schedule.canRaceNow) {
            return new Date();
        }

        return null;
    }

    updateRaceCountdown(scheduleOverride = null) {
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minsEl = document.getElementById('countdown-mins');
        const raceStatus = document.getElementById('race-status');

        if (!daysEl || !hoursEl || !minsEl) {
            return;
        }

        const schedule = scheduleOverride
            || this.raceCenter?.schedule
            || this.dailyRacesStatus?.schedule
            || null;

        if (!schedule) {
            daysEl.textContent = '-';
            hoursEl.textContent = '-';
            minsEl.textContent = '-';
            return;
        }

        if (schedule.seasonCompleted) {
            daysEl.textContent = '0';
            hoursEl.textContent = '0';
            minsEl.textContent = '0';
            return;
        }

        if (schedule.canRaceNow) {
            daysEl.textContent = '0';
            hoursEl.textContent = '0';
            minsEl.textContent = '0';

            if (raceStatus && raceStatus.textContent === 'Esperando') {
                raceStatus.textContent = 'Carrera disponible ahora';
            }
            return;
        }

        const targetDate = this.getScheduleCountdownTarget(schedule);
        if (!targetDate) {
            daysEl.textContent = '-';
            hoursEl.textContent = '-';
            minsEl.textContent = '-';
            return;
        }

        const diffMs = Math.max(0, targetDate.getTime() - Date.now());
        const totalMinutes = Math.floor(diffMs / 60000);
        const days = Math.floor(totalMinutes / (24 * 60));
        const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
        const mins = totalMinutes % 60;

        daysEl.textContent = String(days);
        hoursEl.textContent = String(hours);
        minsEl.textContent = String(mins);
    }
    
    // Calculate XP based on position
    calculateXpForPosition(position) {
        const totalParticipants = Math.max(2, this.raceCenter?.participants?.length || 20);
        const safePosition = Math.max(1, Math.min(totalParticipants, Number(position) || totalParticipants));
        const step = (this.xpConfig.maxRaceXp - this.xpConfig.minRaceXp) / Math.max(1, totalParticipants - 1);
        return Math.max(this.xpConfig.minRaceXp, Math.round(this.xpConfig.maxRaceXp - (safePosition - 1) * step));
    }
    
    // Complete race and award XP
    async completeRace(position, raceData) {
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/race/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ position, raceData })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update daily races status
                this.dailyRacesStatus.racesToday = data.racesToday;
                this.dailyRacesStatus.racesRemaining = data.racesRemaining;
                this.dailyRacesStatus.canRace = data.racesRemaining > 0;
                this.updateDailyRacesUI();
                
                // Show XP earned
                this.showXpEarnedToast(data.xpEarned, position);
                
                // Check for level up
                if (data.leveledUp) {
                    this.showLevelUpToast(data.newLevel);
                }
                
                return data;
            } else {
                this.showToast(data.message || 'Error al completar carrera', 'error');
                return null;
            }
        } catch (error) {
            console.error('Error completing race:', error);
            // Fallback: calculate locally
            const xp = this.calculateXpForPosition(position);
            this.showXpEarnedToast(xp, position);
            return { xpEarned: xp };
        }
    }
    
    showXpEarnedToast(xp, position) {
        const positionEmoji = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : '🏁';
        this.showToast(`${positionEmoji} P${position} - +${xp} XP ganados!`, 'success');
    }
    
    showLevelUpToast(newLevel) {
        this.showToast(`🎉 ¡SUBIDA DE NIVEL! Ahora eres nivel ${newLevel}`, 'success');
    }
    
    // ==========================================
    // CHAT SYSTEM
    // ==========================================
    
    async loadChatMessages() {
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/chat?limit=50`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.chatMessages = data.messages;
                this.renderChatMessages();
            }
        } catch (error) {
            console.error('Error loading chat:', error);
            // Show empty chat
            this.chatMessages = [];
            this.renderChatMessages();
        }
    }
    
    renderChatMessages() {
        const container = document.getElementById('chat-messages');
        if (!container) return;
        
        if (this.chatMessages.length === 0) {
            container.innerHTML = `
                <div class="chat-empty">
                    <span class="chat-empty-icon">💬</span>
                    <p>No hay mensajes todavía</p>
                    <p>¡Sé el primero en escribir!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.chatMessages.map(msg => this.renderChatMessage(msg)).join('');
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }
    
    renderChatMessage(msg) {
        const isSystem = msg.type === 'system' || msg.type === 'announcement' || msg.type === 'season_winner';
        const timestamp = new Date(msg.timestamp).toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        if (msg.type === 'season_winner') {
            return `
                <div class="chat-message season_winner">
                    <div class="message-content">${this.escapeHtml(msg.message)}</div>
                    <div class="chat-timestamp">${timestamp}</div>
                </div>
            `;
        }
        
        const avatarContent = msg.avatar 
            ? `<img src="${msg.avatar}" alt="${msg.username}">`
            : (msg.username?.charAt(0).toUpperCase() || '?');
        
        return `
            <div class="chat-message ${msg.type || 'message'}">
                <div class="chat-avatar">${avatarContent}</div>
                <div class="chat-content">
                    <div class="chat-header-row">
                        <span class="chat-username">${this.escapeHtml(msg.username || 'Usuario')}</span>
                        <span class="chat-timestamp">${timestamp}</span>
                    </div>
                    <div class="chat-text">${this.escapeHtml(msg.message)}</div>
                </div>
            </div>
        `;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    async sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input?.value.trim();
        
        if (!message) return;
        
        try {
            const response = await fetch(`${this.API_URL}/online/leagues/${this.leagueId}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Clear input
                input.value = '';
                
                // Add message to local list
                this.chatMessages.push(data.message);
                this.renderChatMessages();
            } else {
                this.showToast(data.message || 'Error al enviar mensaje', 'error');
            }
        } catch (error) {
            console.error('Error sending chat message:', error);
            this.showToast('Error al enviar mensaje', 'error');
        }
    }
    
    startChatPolling() {
        // Poll for new messages every 10 seconds
        this.chatPollingInterval = setInterval(() => {
            if (this.currentSection === 'chat') {
                this.loadChatMessages();
            }
        }, 10000);
    }
    
    stopChatPolling() {
        if (this.chatPollingInterval) {
            clearInterval(this.chatPollingInterval);
            this.chatPollingInterval = null;
        }
    }
    
    // ==========================================
    // NAVIGATION
    // ==========================================
    
    initNavigation() {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['home', 'chat', 'headquarters', 'pilots', 'shop', 'races', 'standings'].includes(hash)) {
            this.navigateTo(hash);
        }
    }
    
    navigateTo(section) {
        this.currentSection = section;
        
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });
        
        // Update sections
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`section-${section}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        window.location.hash = section;
    }
    
    // ==========================================
    // UTILITIES
    // ==========================================
    
    calculateUpgradeCost(component) {
        const baseCosts = {
            engine: 500000,
            aero: 600000,
            drs: 700000,
            chassis: 800000,
            market: 1000000
        };

        const currentLevel = Number(this.hqComponents?.[component]?.level);
        const safeLevel = Number.isFinite(currentLevel) ? Math.max(1, currentLevel) : 1;
        const baseCost = baseCosts[component] || 500000;

        // Next-level price with exponential growth
        return Math.floor(baseCost * Math.pow(1.35, safeLevel));
    }
    
    getComponentName(component) {
        const names = {
            engine: 'Motor',
            aero: 'Aerodinámica',
            drs: 'DRS',
            chassis: 'Chasis',
            market: 'Mercado'
        };
        return names[component] || component;
    }
    
    getComponentIcon(component) {
        const icons = {
            engine: '🔧',
            aero: '✈️',
            drs: '⚡',
            chassis: '🏎️',
            market: '📈'
        };
        return icons[component] || '⚙️';
    }
    
    formatMoney(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K';
        }
        return amount.toLocaleString();
    }

    async prepareShopPurchase() {
        if (this.isPurchaseInProgress) {
            this.showToast('Ya hay una compra en proceso...', 'info');
            return false;
        }

        const remainingMs = this.purchaseCooldownMs - (Date.now() - this.lastPurchaseAt);
        if (remainingMs > 0) {
            const remainingSec = (remainingMs / 1000).toFixed(1);
            this.showToast(`Espera ${remainingSec}s antes de otra compra`, 'info');
            return false;
        }

        this.isPurchaseInProgress = true;
        this.toggleShopButtons(true);
        this.showToast('Procesando compra...', 'info');

        await new Promise(resolve => setTimeout(resolve, this.purchaseCooldownMs));
        return true;
    }

    finishShopPurchase() {
        if (!this.isPurchaseInProgress) return;

        this.lastPurchaseAt = Date.now();
        this.isPurchaseInProgress = false;
        this.toggleShopButtons(false);
    }

    toggleShopButtons(disabled) {
        const selectors = [
            '#coin-packages .item-price',
            '#money-packages .item-price',
            '#instant-refresh',
            '#confirm-hire-pilot',
            '.btn-hire'
        ];

        document.querySelectorAll(selectors.join(',')).forEach(button => {
            button.disabled = disabled;
        });
    }
    
    getCountryName(code) {
        const countries = {
            'ES': 'España', 'MX': 'México', 'AR': 'Argentina', 'CO': 'Colombia',
            'US': 'Estados Unidos', 'GB': 'Reino Unido', 'FR': 'Francia',
            'DE': 'Alemania', 'IT': 'Italia', 'BR': 'Brasil'
        };
        return countries[code] || code;
    }

    renderRaceCenter() {
        if (!this.raceCenter) return;

        const setText = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = String(value);
        };

        const track = this.raceCenter.track || {};
        const participants = Array.isArray(this.raceCenter.participants) ? this.raceCenter.participants : [];
        const myId = (this.profile?._id || this.profile?.id || '').toString();
        const me = participants.find(participant => participant.userId === myId) || this.raceCenter.myParticipant || null;

        const seasonEl = document.getElementById('race-season');
        const numberEl = document.getElementById('race-number');
        const totalEl = document.getElementById('total-races');
        if (seasonEl) seasonEl.textContent = this.league?.currentSeason?.number || 1;
        if (numberEl) numberEl.textContent = this.raceCenter.raceNumber || 1;
        if (totalEl) totalEl.textContent = this.league?.currentSeason?.totalRaces || 10;

        const pilotName = me?.pilot?.name || 'Sin piloto contratado';
        const pilotLevel = me?.pilot?.level || 1;
        const pilotOverall = me?.pilot?.overall || '-';
        setText('race-pilot-name', pilotName);
        setText('race-pilot-level', `Nv.${pilotLevel}`);
        setText('race-pilot-overall', pilotOverall);

        const hq = me?.hq || this.hqComponents;
        setText('race-car-engine', hq?.engine || 1);
        setText('race-car-aero', hq?.aero || 1);
        setText('race-car-drs', hq?.drs || 1);
        setText('race-car-chassis', hq?.chassis || 1);
        setText('race-car-rating', Math.round(me?.carRating || this.calculateHQBonus() * 100));

        const myStrategy = me?.strategy || {};
        const strategyTyre = document.getElementById('strategy-tyre');
        const strategyPit = document.getElementById('strategy-pitlap');
        const strategyLaps = document.getElementById('strategy-laps');
        if (strategyTyre) strategyTyre.value = myStrategy.tyreCompound || 'medium';
        if (strategyPit) strategyPit.value = myStrategy.pitLap || Math.max(3, Math.floor((track.laps || 20) / 2));
        if (strategyLaps) strategyLaps.value = myStrategy.plannedLaps || track.laps || 20;

        setText('current-track-name', track.name || 'Circuito pendiente');
        setText('current-track-location', `${track.flag || '🏁'} ${track.country || ''}`);
        setText('track-length', `${track.length || '-'} km`);
        setText('track-laps', track.laps || '-');
        setText('track-turns', track.turns || '-');
        setText('track-topspeed', track.topSpeed ? `${track.topSpeed} km/h` : '-');
        setText('drs-zones-count', track.drsZones || '-');

        if (track.image) {
            this.loadTrackSVG(track.image, 'track-preview-container');
        }

        const statusBadge = document.getElementById('race-status');
        const schedule = this.raceCenter.schedule || {};
        const canQualifyNow = schedule.canRaceNow !== false;
        const hasPilot = Boolean(me?.pilot);
        const canStartRace = Boolean(me?.qualifying?.lapTime) && canQualifyNow;

        if (statusBadge) {
            if (!canQualifyNow) {
                statusBadge.textContent = schedule.message || 'Carrera no disponible todavia';
            } else if (canStartRace) {
                statusBadge.textContent = `Clasificado P${me.gridPosition || '-'}`;
            } else {
                statusBadge.textContent = hasPilot ? 'Esperando clasificación' : 'Necesitas piloto para clasificar';
            }
        }

        const qualifyingButton = document.getElementById('btn-qualifying');
        if (qualifyingButton) {
            qualifyingButton.disabled = !canQualifyNow || !hasPilot;
        }

        const startRaceButton = document.getElementById('btn-start-race');
        if (startRaceButton) startRaceButton.disabled = !canStartRace;

        const qualifyingBody = document.getElementById('qualifying-grid-body');
        if (qualifyingBody) {
            if (!participants.length) {
                qualifyingBody.innerHTML = '<tr><td colspan="6" class="empty-qualy">Todavia no hay managers en parrilla</td></tr>';
            } else {
                qualifyingBody.innerHTML = participants.map(participant => `
                    <tr>
                        <td>P${participant.gridPosition || '-'}</td>
                        <td>${participant.displayName}</td>
                        <td>${participant.teamName || 'Sin equipo'}</td>
                        <td>${participant.pilot?.name || 'Piloto por asignar'}</td>
                        <td>${(participant.strategy?.tyreCompound || 'medium').toUpperCase()}</td>
                        <td>${participant.qualifying?.lapTime || 'Sin vuelta'}</td>
                    </tr>
                `).join('');
            }
        }
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = { success: '✓', error: '✕', info: 'ℹ' };
        toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // ==========================================
    // RACE SYSTEM
    // ==========================================
    
    /**
     * Inicializa el sistema de carreras
     */
    initRaceSystem() {
        this.raceEngine = null;
        this.raceVisualizer = null;
        this.raceSpeed = 1;
        this.isPaused = false;
        this.hasQualified = false;
        this.qualifyingPosition = null;

        this.bindRaceEvents();
        this.renderRaceCenter();
    }
    
    /**
     * Vincula los eventos del sistema de carreras
     */
    bindRaceEvents() {
        document.querySelectorAll('.race-mode-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.race-mode-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
        
        // Qualifying button
        document.getElementById('btn-qualifying')?.addEventListener('click', () => {
            this.startQualifying();
        });
        
        // Start race button
        document.getElementById('btn-start-race')?.addEventListener('click', () => {
            this.startRace();
        });
        
        // Race controls
        document.getElementById('btn-pause-race')?.addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('btn-speed-1x')?.addEventListener('click', () => this.setRaceSpeed(1));
        document.getElementById('btn-speed-2x')?.addEventListener('click', () => this.setRaceSpeed(2));
        document.getElementById('btn-speed-5x')?.addEventListener('click', () => this.setRaceSpeed(5));
        
        // Results actions
        document.getElementById('btn-close-results')?.addEventListener('click', () => {
            document.getElementById('race-results-container').style.display = 'none';
        });
        
        document.getElementById('btn-next-race')?.addEventListener('click', () => {
            this.advanceToNextRace();
        });
    }
    
    /**
     * Navegar a la página de carrera en vivo
     */
    goToLiveRace() {
        if (!this.league) {
            this.showToast('No se ha cargado la liga', 'error');
            return;
        }
        
        // Navegar a race-live.html con el ID de la liga
        window.location.href = `race-live.html?league=${this.league._id}`;
    }
    
    /**
     * Carga y muestra el circuito actual
     */
    async loadCurrentTrack() {
        const currentRace = this.raceCalendar[this.currentRaceIndex];
        const track = TRACKS_DATA[currentRace.trackId];
        
        if (!track) {
            console.error('Track not found:', currentRace.trackId);
            return;
        }
        
        // Actualizar información del circuito
        document.getElementById('current-track-name').textContent = track.name;
        document.getElementById('current-track-location').textContent = `${track.flag} ${track.country}`;
        document.getElementById('track-length').textContent = `${track.length} km`;
        document.getElementById('track-laps').textContent = track.laps;
        document.getElementById('track-turns').textContent = track.corners?.length || '-';
        document.getElementById('track-topspeed').textContent = `${track.characteristics?.topSpeed || 300} km/h`;
        document.getElementById('drs-zones-count').textContent = track.drsZones?.length || 0;
        
        // Tipo de pista
        const typeTexts = {
            'high-speed': '⚡ Alta velocidad',
            'technical': '🔧 Técnico',
            'street': '🏙️ Urbano',
            'mixed': '🔄 Mixto'
        };
        document.getElementById('track-type').textContent = typeTexts[track.type] || track.type;
        
        // Dificultad (estrellas)
        const difficultyEl = document.getElementById('track-difficulty');
        if (difficultyEl) {
            difficultyEl.innerHTML = Array(5).fill(0).map((_, i) => 
                `<span${i >= track.difficulty ? ' class="dim"' : ''}>⭐</span>`
            ).join('');
        }
        
        // Cargar SVG del circuito en el preview
        await this.loadTrackSVG(track.image, 'track-preview-container');
        
        // Generar condiciones meteorológicas
        this.generateRaceWeather();
    }
    
    /**
     * Carga el SVG del circuito en un contenedor
     */
    async loadTrackSVG(svgPath, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        try {
            // Intentar fetch primero (funciona en servidor web)
            try {
                const response = await fetch(svgPath);
                if (!response.ok) throw new Error('Fetch failed');
                const svgText = await response.text();
                container.innerHTML = svgText;
            } catch (fetchError) {
                // Si fetch falla (file:// protocol), usar object tag
                console.log('Fetch failed, using object tag:', fetchError.message);
                container.innerHTML = `<object data="${svgPath}" type="image/svg+xml" style="width: 100%; height: 100%;"></object>`;
                
                // Esperar a que cargue el object
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Ajustar el SVG al contenedor
            const svg = container.querySelector('svg') || container.querySelector('object');
            if (svg && svg.tagName === 'svg') {
                svg.style.width = '100%';
                svg.style.height = '100%';
            }
        } catch (error) {
            console.error('Error loading track SVG:', error);
            // Fallback: crear SVG simple con el trazado
            this.createFallbackTrackSVG(containerId);
        }
    }
    
    /**
     * Crea un SVG de fallback si no se puede cargar el archivo
     */
    createFallbackTrackSVG(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const currentRace = this.raceCalendar[this.currentRaceIndex];
        const track = TRACKS_DATA[currentRace.trackId];
        
        const svg = `
            <svg width="100%" height="100%" viewBox="0 0 500 400" xmlns="http://www.w3.org/2000/svg">
                <rect width="500" height="400" fill="#1a472a"/>
                <path d="${track.racingLinePath}" 
                      fill="none" 
                      stroke="#333333" 
                      stroke-width="35" 
                      stroke-linecap="round"/>
                <path d="${track.racingLinePath}" 
                      fill="none" 
                      stroke="#2a2a2a" 
                      stroke-width="30" 
                      stroke-linecap="round"/>
                <path d="${track.racingLinePath}" 
                      fill="none" 
                      stroke="#ffffff" 
                      stroke-width="2" 
                      stroke-dasharray="15,10" 
                      opacity="0.4"/>
                <text x="250" y="200" fill="#ffffff" font-size="20" text-anchor="middle" font-family="Orbitron">${track.shortName}</text>
            </svg>
        `;
        
        container.innerHTML = svg;
    }
    
    /**
     * Genera condiciones meteorológicas aleatorias
     */
    generateRaceWeather() {
        const conditions = Object.entries(WEATHER_CONDITIONS);
        const weights = [0.5, 0.25, 0.15, 0.07, 0.03];
        
        let random = Math.random();
        let cumulative = 0;
        let selectedWeather = conditions[0][1];
        
        for (let i = 0; i < conditions.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                selectedWeather = conditions[i][1];
                break;
            }
        }
        
        this.currentWeather = selectedWeather;
        document.getElementById('race-weather').textContent = selectedWeather.icon;
        document.getElementById('race-weather-text').textContent = selectedWeather.name;
    }
    
    /**
     * Renderiza el calendario de carreras
     */
    renderRaceCalendar() {
        const container = document.getElementById('race-calendar');
        if (!container) return;
        
        container.innerHTML = this.raceCalendar.map((race, index) => {
            const track = TRACKS_DATA[race.trackId];
            if (!track) return '';
            
            return `
                <div class="calendar-race-card ${race.status}" data-round="${race.round}">
                    <div class="calendar-race-number">Carrera ${race.round}</div>
                    <div class="calendar-race-flag">${track.flag}</div>
                    <div class="calendar-race-name">${track.shortName}</div>
                    <div class="calendar-race-status">
                        ${race.status === 'completed' ? '✓ Completada' : 
                          race.status === 'current' ? '▶ Actual' : 
                          '🔒 Bloqueada'}
                    </div>
                </div>
            `;
        }).join('');
        
        // Eventos de click en las carreras
        container.querySelectorAll('.calendar-race-card:not(.locked)').forEach(card => {
            card.addEventListener('click', () => {
                const round = parseInt(card.dataset.round);
                this.selectRace(round - 1);
            });
        });
    }
    
    /**
     * Selecciona una carrera del calendario
     */
    selectRace(index) {
        if (index < 0 || index >= this.raceCalendar.length) return;
        if (this.raceCalendar[index].status === 'locked') return;
        
        this.currentRaceIndex = index;
        this.loadCurrentTrack();
        
        // Actualizar estado visual
        document.querySelectorAll('.calendar-race-card').forEach((card, i) => {
            card.classList.toggle('current', i === index);
        });
    }
    
    /**
     * Inicia la clasificación
     */
    async startQualifying() {
        try {
            if (this.raceCenter?.schedule && this.raceCenter.schedule.canRaceNow === false) {
                this.showToast(this.raceCenter.schedule.message || 'La carrera todavia no esta habilitada', 'info');
                return;
            }

            this.showToast('Iniciando clasificación de liga...', 'info');
            document.getElementById('race-status').textContent = 'Clasificando...';

            const { data } = await this.postOnlineRaceAction([
                `/online/leagues/${this.leagueId}/race/qualify`,
                `/online/leagues/${this.leagueId}/race/qualifying`,
                `/online/leagues/${this.leagueId}/qualify`
            ], {});

            if (!data.success) {
                this.showToast(data.message || 'No se pudo completar la clasificación', 'error');
                document.getElementById('race-status').textContent = 'Esperando clasificación';
                return;
            }

            this.raceCenter = {
                ...this.raceCenter,
                raceNumber: data.raceNumber,
                track: data.track,
                participants: data.participants,
                schedule: data.schedule || this.raceCenter?.schedule || null
            };
            this.hasQualified = true;
            this.qualifyingPosition = data.position;

            document.getElementById('race-status').textContent = `Clasificado P${data.position}`;
            document.getElementById('btn-start-race').disabled = false;
            this.renderRaceCenter();

            this.showToast(`Clasificación completada: P${data.position} (${data.lapTime})`, 'success');
        } catch (error) {
            console.error('Error qualifying:', error);
            this.showToast('Error de conexión durante clasificación', 'error');
        }
    }
    
    /**
     * Genera tiempos de clasificación para los rivales
     */
    generateRivalTimes(track, count) {
        const baseTime = track.referenceTimes.average;
        const rivals = [];
        
        for (let i = 0; i < count; i++) {
            const skillLevel = 20 + Math.random() * 30; // Nivel 20-50
            const skill = skillLevel / 50;
            const time = baseTime * (1 - skill * 0.06) * (0.995 + Math.random() * 0.015);
            
            rivals.push({
                id: `rival-${i}`,
                name: this.generateRivalName(),
                level: Math.floor(skillLevel),
                time: time,
                isPlayer: false
            });
        }
        
        return rivals;
    }
    
    /**
     * Genera un nombre aleatorio para un rival
     */
    generateRivalName() {
        const firstNames = ['Max', 'Lewis', 'Charles', 'Carlos', 'Lando', 'Oscar', 'George', 'Fernando', 'Sergio', 'Daniel', 'Pierre', 'Yuki', 'Kevin', 'Nico', 'Valtteri', 'Zhou', 'Alex', 'Logan', 'Nyck', 'Lance'];
        const lastNames = ['Verstappen', 'Hamilton', 'Leclerc', 'Sainz', 'Norris', 'Piastri', 'Russell', 'Alonso', 'Perez', 'Ricciardo', 'Gasly', 'Tsunoda', 'Magnussen', 'Hulkenberg', 'Bottas', 'Guanyu', 'Albon', 'Sargeant', 'De Vries', 'Stroll'];
        
        return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }
    
    /**
     * Calcula el bonus total del HQ
     */
    calculateHQBonus() {
        const engine = (this.hqComponents.engine?.level || 1) * 0.004;
        const aero = (this.hqComponents.aero?.level || 1) * 0.003;
        const drs = (this.hqComponents.drs?.level || 1) * 0.002;
        const chassis = (this.hqComponents.chassis?.level || 1) * 0.003;
        return engine + aero + drs + chassis;
    }
    
    /**
     * Inicia la carrera
     */
    async startRace() {
        if (this.raceCenter?.schedule && this.raceCenter.schedule.canRaceNow === false) {
            this.showToast(this.raceCenter.schedule.message || 'La carrera no esta habilitada en este momento', 'info');
            return;
        }

        if (!this.raceCenter || !Array.isArray(this.raceCenter.participants) || this.raceCenter.participants.length < 2) {
            this.showToast('No hay suficientes managers clasificados para correr', 'error');
            return;
        }

        const myId = (this.profile?._id || this.profile?.id || '').toString();
        const me = this.raceCenter.participants.find(participant => participant.userId === myId);
        if (!me?.qualifying?.lapTime) {
            this.showToast('Debes clasificar antes de iniciar carrera', 'error');
            return;
        }

        const plannedLaps = Number(document.getElementById('strategy-laps')?.value || this.raceCenter.track?.laps || 20);
        const safeLaps = Number.isFinite(plannedLaps) ? Math.max(8, Math.min(40, plannedLaps)) : 20;

        const participants = this.raceCenter.participants.map(participant => {
            const hq = participant.hq || {};
            const pilot = participant.pilot || {};
            const pilotLevel = Number(pilot.level || pilot.overall || 20);

            return {
                userId: participant.userId,
                isPlayer: participant.userId === myId,
                name: pilot.name || participant.displayName,
                teamName: participant.teamName || 'Sin equipo',
                pilot: {
                    id: pilot.id || `pilot-${participant.userId}`,
                    name: pilot.name || participant.displayName,
                    level: Number.isFinite(pilotLevel) ? pilotLevel : 20,
                    speed: pilot.stats?.speed || Math.min(99, Math.max(50, pilotLevel + 25)),
                    control: pilot.stats?.control || Math.min(99, Math.max(45, pilotLevel + 20)),
                    experience: pilot.stats?.experience || Math.min(99, Math.max(40, pilotLevel + 15))
                },
                car: {
                    engine: { level: hq.engine || 1 },
                    aero: { level: hq.aero || 1 },
                    drs: { level: hq.drs || 1 },
                    chassis: { level: hq.chassis || 1 }
                },
                startingTyre: participant.strategy?.tyreCompound || 'medium',
                gridPosition: participant.gridPosition || 99
            };
        });

        participants.sort((a, b) => a.gridPosition - b.gridPosition);

        const raceConfig = {
            mode: 'league',
            leagueId: this.leagueId,
            trackId: this.raceCenter.track?.id || 'monza',
            laps: safeLaps,
            weather: 'dry',
            startingTyre: me.strategy?.tyreCompound || 'medium',
            participants,
            playerProfile: {
                userId: myId,
                username: this.profile?.username,
                displayName: this.profile?.displayName || this.profile?.username,
                teamName: this.profile?.teamName || me.teamName || 'Tu Equipo',
                country: this.profile?.country || 'ES',
                currentPilot: me.pilot || this.currentPilot,
                car: {
                    engine: { level: me.hq?.engine || 1 },
                    aero: { level: me.hq?.aero || 1 },
                    drs: { level: me.hq?.drs || 1 },
                    chassis: { level: me.hq?.chassis || 1 }
                }
            }
        };

        localStorage.setItem('raceConfig', JSON.stringify(raceConfig));
        window.location.href = 'online-raceMode.html';
    }
    
    /**
     * Simula la carrera con actualizaciones en vivo
     */
    async simulateRaceLive() {
        while (this.raceEngine.currentLap < this.raceEngine.totalLaps) {
            if (this.isPaused) {
                await this.sleep(100);
                continue;
            }
            
            const lapResult = this.raceEngine.simulateLap();
            
            // Actualizar UI
            this.updateRaceLiveUI(lapResult);
            
            // Esperar según velocidad
            await this.sleep(1000 / this.raceSpeed);
        }
        
        // Carrera terminada
        this.showRaceResults();
    }
    
    /**
     * Actualiza la UI durante la carrera
     */
    updateRaceLiveUI(lapResult) {
        // Vuelta actual
        document.getElementById('current-lap').textContent = lapResult.lap;
        
        // Vuelta rápida
        if (lapResult.fastestLap.pilot) {
            document.getElementById('fastest-lap-time').textContent = lapResult.fastestLap.time !== Infinity ? 
                this.formatLapTime(lapResult.fastestLap.time) : '-';
            document.getElementById('fastest-lap-driver').textContent = lapResult.fastestLap.pilot?.name || '-';
        }
        
        // Clasificación en vivo
        const standingsContainer = document.getElementById('live-standings');
        standingsContainer.innerHTML = lapResult.positions.map((p, i) => `
            <div class="live-standing-item ${i < 3 ? 'position-' + (i + 1) : ''}">
                <span class="standing-position">${p.position}</span>
                <span class="standing-driver">
                    ${p.pilot.name}
                    <span class="tyre-indicator tyre-${p.tyreCompound}"></span>
                </span>
                <span class="standing-gap ${p.gap === 0 ? 'leader' : ''}">${p.gapFormatted}</span>
            </div>
        `).join('');
        
        // Eventos
        if (lapResult.events.length > 0) {
            const eventsContainer = document.getElementById('race-events-list');
            lapResult.events.forEach(event => {
                const eventEl = document.createElement('div');
                eventEl.className = `race-event-item ${event.type}`;
                
                let icon = '📢';
                let text = '';
                
                switch (event.type) {
                    case 'fastest-lap':
                        icon = '🟣';
                        text = `${event.pilot} marca vuelta rápida: ${event.time}`;
                        break;
                    case 'pit-stop':
                        icon = '🔧';
                        text = `${event.pilot} entra a boxes (${event.time}s)`;
                        break;
                    case 'dnf':
                        icon = '❌';
                        text = `${event.pilot} abandona: ${event.reason}`;
                        break;
                    case 'mistake':
                        icon = '⚠️';
                        text = `${event.pilot}: ${event.description} (+${event.timeLoss}s)`;
                        break;
                }
                
                eventEl.innerHTML = `
                    <span class="event-icon">${icon}</span>
                    <span class="event-lap">V${event.lap}</span>
                    <span class="event-text">${text}</span>
                `;
                
                eventsContainer.insertBefore(eventEl, eventsContainer.firstChild);
            });
        }
    }
    
    /**
     * Muestra los resultados de la carrera
     */
    async showRaceResults() {
        const results = this.raceEngine.getRaceResults();
        
        // Ocultar vista en vivo
        document.getElementById('race-live-container').style.display = 'none';
        
        // Mostrar resultados
        const resultsContainer = document.getElementById('race-results-container');
        resultsContainer.style.display = 'block';
        
        document.getElementById('results-track-name').textContent = results.track.shortName;
        document.getElementById('results-track-flag').textContent = results.track.flag;
        
        // Podium
        const podium = results.results.slice(0, 3);
        document.getElementById('podium-p1').textContent = podium[0]?.pilot.name || '-';
        document.getElementById('podium-p2').textContent = podium[1]?.pilot.name || '-';
        document.getElementById('podium-p3').textContent = podium[2]?.pilot.name || '-';
        
        // Encontrar resultado del jugador
        const playerResult = results.results.find(r => r.pilot.id === 'player');
        const playerPosition = playerResult?.position || 0;
        const xpEarned = this.calculateXpForPosition(playerPosition);
        
        // Tabla de resultados con XP
        const tbody = document.getElementById('results-table-body');
        tbody.innerHTML = results.results.map(r => {
            const isPlayer = r.pilot.id === 'player';
            const rowXp = isPlayer ? this.calculateXpForPosition(r.position) : 0;
            
            return `
                <tr class="${r.status === 'dnf' ? 'dnf' : ''} ${isPlayer ? 'player-row' : ''}">
                    <td class="position-cell">${r.position}</td>
                    <td>
                        ${r.pilot.name} 
                        ${r.fastestLapBonus ? '<span class="fastest-lap-indicator">🟣</span>' : ''}
                        ${isPlayer ? '<span class="you-badge">TÚ</span>' : ''}
                    </td>
                    <td>${r.status === 'dnf' ? 'DNF' : r.totalTimeFormatted}</td>
                    <td>${r.gapFormatted}</td>
                    <td>${r.bestLapFormatted}</td>
                    <td class="points-cell">${r.points > 0 ? `+${r.points}` : '-'}</td>
                    <td class="xp-cell">${isPlayer ? `<span class="xp-earned-badge">+${rowXp} XP</span>` : ''}</td>
                </tr>
            `;
        }).join('');
        
        // Guardar resultado en servidor y otorgar XP
        if (playerResult) {
            const currentRace = this.raceCalendar[this.currentRaceIndex];
            const raceData = {
                trackId: currentRace.trackId,
                raceNumber: currentRace.round,
                time: playerResult.totalTime,
                points: playerResult.points
            };
            
            // Completar carrera y obtener XP
            await this.completeRace(playerPosition, raceData);
        }
        
        // Marcar carrera como completada
        this.raceCalendar[this.currentRaceIndex].status = 'completed';
        this.renderRaceCalendar();
    }
    
    /**
     * Avanza a la siguiente carrera
     */
    advanceToNextRace() {
        document.getElementById('race-results-container').style.display = 'none';
        
        if (this.currentRaceIndex < this.raceCalendar.length - 1) {
            this.currentRaceIndex++;
            this.raceCalendar[this.currentRaceIndex].status = 'current';
            this.hasQualified = false;
            this.qualifyingPosition = null;
            
            document.getElementById('btn-start-race').disabled = true;
            document.getElementById('race-status').textContent = 'Esperando';
            
            this.loadCurrentTrack();
            this.renderRaceCalendar();
        } else {
            this.showToast('🏆 ¡Has completado la temporada!', 'success');
        }
    }
    
    /**
     * Pausa/reanuda la carrera
     */
    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('btn-pause-race').textContent = this.isPaused ? '▶️' : '⏸️';
    }
    
    /**
     * Establece la velocidad de simulación
     */
    setRaceSpeed(speed) {
        this.raceSpeed = speed;
        document.querySelectorAll('.btn-race-control').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`btn-speed-${speed}x`)?.classList.add('active');
    }
    
    /**
     * Cambia el modo de carrera (live, practice, qualifying)
     */
    handleRaceModeChange(mode) {
        // Por ahora solo cambia visualmente
        console.log('Race mode changed to:', mode);
    }
    
    /**
     * Formatea tiempo de vuelta
     */
    formatLapTime(seconds) {
        if (!seconds || !isFinite(seconds)) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}:${secs.toFixed(3).padStart(6, '0')}` : secs.toFixed(3);
    }
    
    /**
     * Helper para esperar
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    getMockLeagueData() {
        return {
            id: this.leagueId,
            name: 'Liga de Prueba',
            description: 'Esta es una liga de desarrollo para probar las funcionalidades',
            country: 'ES',
            memberCount: 5,
            settings: {
                maxMembers: 22,
                minLevel: 1,
                isPrivate: false
            },
            schedule: {
                dayOfWeek: 6,
                time: '20:00'
            },
            currentSeason: {
                number: 1,
                currentRace: 1,
                totalRaces: 5
            },
            standings: []
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.leagueController = new LeagueController();
});
