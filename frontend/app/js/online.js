/**
 * MS Manager - Online Mode Controller
 * Gestiona el modo online: perfil, ligas, tienda, rankings
 */

class OnlineController {
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
        this.currentSection = 'home';
        this.leagues = [];
        this.myLeagues = [];
        this.globalRanking = null;
        this.myRank = null;
        this.currentRankingTab = 'international';
        
        // Rank tier configuration (should match backend)
        this.RANK_CONFIG = {
            learner: { name: 'Learner', icon: 'stroll', color: '#CD853F' },
            amateur: { name: 'Amateur', icon: 'a', color: '#C0C0C0' },
            professional: { name: 'Professional', icon: 'p', color: '#FFD700' },
            king: { name: 'King', icon: 'goat', color: '#9B59B6' },
            senna: { name: 'Senna', icon: 'senna', color: '#E74C3C' }
        };
        
        this.init();
    }
    
    async init() {
        // Verificar autenticación
        const token = localStorage.getItem('authToken');
        console.log('Token found:', token ? 'Yes' : 'No');
        if (!token) {
            console.log('No token, redirecting to login');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('Starting online mode initialization...');
        console.log('API URL:', this.API_URL);
        
        // TODO: Verificar acceso al modo online cuando se implementen requisitos
        // const hasAccess = await this.checkOnlineAccess();
        // if (!hasAccess) {
        //     this.showToast('Necesitas nivel 5 en todas las categorías de HQ', 'error');
        //     setTimeout(() => {
        //         window.location.href = 'dashboard.html';
        //     }, 2000);
        //     return;
        // }
        
        // Cargar datos
        console.log('Loading profile...');
        await this.loadProfile();
        console.log('Loading leagues...');
        await this.loadMyLeagues();
        
        // Inicializar eventos
        console.log('Binding events...');
        this.bindEvents();
        this.initNavigation();
        
        console.log('Online mode initialized successfully');
    }
    
    // ==========================================
    // API CALLS
    // ==========================================
    
    async checkOnlineAccess() {
        // TODO: Implementar verificación de requisitos en el futuro
        // Modo online desbloqueado temporalmente
        /*
        try {
            const response = await fetch(`${this.API_URL}/online/status`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            return data.success && data.hasAccess;
        } catch (error) {
            console.error('Error checking online access:', error);
            return false;
        }
        */
        return true;
    }
    
    async loadProfile() {
        try {
            console.log('Loading profile from:', `${this.API_URL}/user/profile`);
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                console.warn('No auth token found, redirecting to login');
                window.location.href = 'index.html';
                return;
            }
            
            const response = await fetch(`${this.API_URL}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Response status:', response.status);
            
            // Handle token expired or invalid
            if (response.status === 401) {
                console.warn('Token invalid or expired, redirecting to login');
                localStorage.removeItem('authToken');
                window.location.href = 'index.html';
                return;
            }
            
            const data = await response.json();
            console.log('Profile data received:', data);
            
            if (data.success && data.user) {
                this.profile = data.user;
                console.log('Profile set:', this.profile);
                this.updateProfileUI();
            } else {
                console.error('Profile load failed:', data);
                // Try to show page with limited data
                this.profile = this.getProfileFromToken(token);
                if (this.profile) {
                    this.updateProfileUI();
                    this.showToast('Perfil cargado parcialmente', 'warning');
                } else {
                    this.showToast('Error al cargar perfil', 'error');
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            // Try to recover with token data
            const token = localStorage.getItem('authToken');
            this.profile = this.getProfileFromToken(token);
            if (this.profile) {
                this.updateProfileUI();
                this.showToast('Modo offline - datos del perfil limitados', 'warning');
            } else {
                this.showToast('Error de conexión al cargar perfil', 'error');
            }
        }
    }
    
    /**
     * Extract basic profile info from JWT token as fallback
     */
    getProfileFromToken(token) {
        try {
            if (!token) return null;
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                username: payload.username || 'Usuario',
                teamName: payload.teamName || 'Mi Equipo',
                gameData: { budget: 0, online: { coins: 0, xp: 0 } }
            };
        } catch (e) {
            console.error('Error decoding token:', e);
            return null;
        }
    }
    
    async loadMyLeagues() {
        try {
            const response = await fetch(`${this.API_URL}/online/my-leagues`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                this.myLeagues = data.leagues;
                this.renderMyLeagues();
            }
        } catch (error) {
            console.error('Error loading leagues:', error);
        }
    }
    
    async searchLeagues(query = '', country = '') {
        try {
            const params = new URLSearchParams();
            if (query) params.append('search', query);
            if (country) params.append('country', country);
            
            const response = await fetch(`${this.API_URL}/online/leagues?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                this.leagues = data.leagues;
                this.renderLeagues();
            }
        } catch (error) {
            console.error('Error searching leagues:', error);
        }
    }
    
    async createLeague(leagueData) {
        try {
            const response = await fetch(`${this.API_URL}/online/leagues`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(leagueData)
            });
            const data = await response.json();
            
            if (data.success) {
                this.showToast('¡Liga creada con éxito!', 'success');
                this.closeModal('modal-create-league');
                await this.loadProfile();
                await this.loadMyLeagues();
                return true;
            } else {
                this.showToast(data.message || 'Error al crear liga', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error creating league:', error);
            this.showToast('Error de conexión', 'error');
            return false;
        }
    }
    
    async joinLeague(leagueId, inviteCode = null) {
        try {
            const body = inviteCode ? { inviteCode } : {};
            
            const response = await fetch(`${this.API_URL}/online/leagues/${leagueId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            
            if (data.success) {
                this.showToast('¡Te has unido a la liga!', 'success');
                await this.loadMyLeagues();
                return true;
            } else {
                this.showToast(data.message || 'Error al unirse', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error joining league:', error);
            this.showToast('Error de conexión', 'error');
            return false;
        }
    }
    
    async buyMoneyPackage(packageId) {
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
                this.profile.coins = data.newBalance.coins;
                this.updateHeaderStats();
                return true;
            } else {
                this.showToast(data.message || 'Error en la compra', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error buying package:', error);
            this.showToast('Error de conexión', 'error');
            return false;
        }
    }
    
    async buyCoinPackage(packageId) {
        try {
            // Show confirmation modal
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
                this.profile.coins = data.newBalance.coins;
                this.updateHeaderStats();
                
                // Reload profile to ensure data is synced
                await this.loadProfile();
                return true;
            } else {
                this.showToast(data.message || 'Error en la compra simulada', 'error');
                return false;
            }
        } catch (error) {
            console.error('Error buying coin package:', error);
            this.showToast('Error de conexión', 'error');
            return false;
        }
    }
    
    // ==========================================
    // INTERNATIONAL RANKING API
    // ==========================================
    
    async loadGlobalRanking() {
        try {
            const response = await fetch(`${this.API_URL}/leaderboard/global`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                this.globalRanking = data;
                this.renderGlobalRanking();
            }
        } catch (error) {
            console.error('Error loading global ranking:', error);
        }
    }
    
    async loadMyRank() {
        try {
            const response = await fetch(`${this.API_URL}/leaderboard/global/my-rank`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                this.myRank = data;
                this.renderMyRank();
            }
        } catch (error) {
            console.error('Error loading my rank:', error);
        }
    }
    
    // ==========================================
    // UI UPDATES
    // ==========================================
    
    updateProfileUI() {
        console.log('updateProfileUI called, profile:', this.profile);
        if (!this.profile) {
            console.error('No profile data available');
            return;
        }
        
        // Header stats
        this.updateHeaderStats();
        
        // Profile card
        const displayName = this.profile.displayName || this.profile.username;
        console.log('Setting profile name to:', displayName);
        document.getElementById('profile-name').textContent = displayName;
        document.getElementById('profile-team').textContent = this.profile.teamName;
        
        // Level desde gameData.online.level
        const level = this.profile.gameData?.online?.level || 1;
        document.getElementById('profile-level').textContent = level;
        
        // Country flag
        const countryFlags = {
            'ES': '🇪🇸', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CO': '🇨🇴', 'US': '🇺🇸',
            'GB': '🇬🇧', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'BR': '🇧🇷'
        };
        document.getElementById('profile-flag').textContent = countryFlags[this.profile.country] || '🏳️';
        document.getElementById('profile-country').textContent = this.getCountryName(this.profile.country);
        
        // XP Bar - calcular progreso basado en level
        const xp = this.profile.gameData?.online?.xp || 0;
        const xpForNextLevel = level * 100; // Simple formula: level * 100 XP
        const currentXp = xp % xpForNextLevel;
        const progress = Math.min((currentXp / xpForNextLevel) * 100, 100);
        
        document.getElementById('xp-text').textContent = `${currentXp} / ${xpForNextLevel}`;
        document.getElementById('xp-progress').style.width = `${progress}%`;
        
        // Level ring
        const circumference = 283; // 2 * PI * 45
        const offset = circumference - (progress / 100 * circumference);
        document.getElementById('level-progress-ring').style.strokeDashoffset = offset;
        
        // Stats desde gameData.online
        const onlineData = this.profile.gameData?.online || {};
        const totalRaces = onlineData.totalRaces || 0;
        const wins = onlineData.onlineWins || 0;
        const podiums = onlineData.onlinePodiums || 0;
        
        document.getElementById('stat-races').textContent = totalRaces;
        document.getElementById('stat-wins').textContent = wins;
        document.getElementById('stat-podiums').textContent = podiums;
        
        const winrate = totalRaces > 0 
            ? Math.round((wins / totalRaces) * 100) 
            : 0;
        document.getElementById('stat-winrate').textContent = `${winrate}%`;
    }
    
    updateHeaderStats() {
        console.log('updateHeaderStats called, profile:', this.profile);
        if (!this.profile) {
            console.error('No profile for header stats');
            return;
        }
        
        console.log('gameData:', this.profile.gameData);
        
        // Coins desde gameData.online.coins
        const coins = this.profile.gameData?.online?.coins || 0;
        console.log('Coins:', coins);
        document.getElementById('user-coins').textContent = coins;
        
        // Level desde gameData.online.level
        const level = this.profile.gameData?.online?.level || 1;
        console.log('Level:', level);
        document.getElementById('user-level').textContent = `Nv. ${level}`;
        
        // Budget desde gameData.budget (mismo que el modo offline)
        const budget = this.profile.gameData?.budget || 0;
        console.log('Budget:', budget);
        document.getElementById('user-budget').textContent = this.formatMoney(budget);
    }
    
    renderMyLeagues() {
        const container = document.getElementById('my-leagues-container');
        const emptyState = document.getElementById('no-leagues');
        
        if (this.myLeagues.length === 0) {
            container.innerHTML = '';
            container.appendChild(emptyState);
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        container.innerHTML = this.myLeagues.map(league => `
            <div class="league-card" data-id="${league.id}">
                <div class="league-card-header">
                    <div class="league-logo">
                        ${league.logo 
                            ? `<img src="${league.logo}" alt="${league.name}">`
                            : '🏁'
                        }
                    </div>
                    <div class="league-info">
                        <h3>${league.name}</h3>
                        <p>${this.getCountryFlag(league.country)} ${league.memberCount}/${league.maxMembers} miembros</p>
                    </div>
                </div>
                <div class="league-card-stats">
                    <div class="league-stat">
                        <span class="league-stat-value">${league.currentSeason?.currentRace || 0}</span>
                        <span class="league-stat-label">Carrera</span>
                    </div>
                    <div class="league-stat">
                        <span class="league-stat-value">${league.currentSeason?.totalRaces || 10}</span>
                        <span class="league-stat-label">Total</span>
                    </div>
                    <div class="league-stat">
                        <span class="league-stat-value">${league.myRole || 'Miembro'}</span>
                        <span class="league-stat-label">Rol</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.league-card').forEach(card => {
            card.addEventListener('click', () => {
                const leagueId = card.dataset.id;
                // Navigate to league homepage
                window.location.href = `league.html?id=${leagueId}`;
            });
        });
    }
    
    renderLeagues() {
        const container = document.getElementById('leagues-container');
        
        if (this.leagues.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">🔍</span>
                    <p>No se encontraron ligas</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.leagues.map(league => `
            <div class="league-card" data-id="${league.id}">
                <div class="league-card-header">
                    <div class="league-logo">
                        ${league.logo 
                            ? `<img src="${league.logo}" alt="${league.name}">`
                            : '🏁'
                        }
                    </div>
                    <div class="league-info">
                        <h3>${league.name}</h3>
                        <p>${this.getCountryFlag(league.country)} ${league.memberCount}/${league.maxMembers} miembros</p>
                    </div>
                </div>
                ${league.description ? `<p class="league-desc">${league.description.substring(0, 100)}...</p>` : ''}
                <div class="league-card-stats">
                    <div class="league-stat">
                        <span class="league-stat-value">Nv.${league.minLevel}</span>
                        <span class="league-stat-label">Mínimo</span>
                    </div>
                    <div class="league-stat">
                        <span class="league-stat-value">${league.schedule?.time || '20:00'}</span>
                        <span class="league-stat-label">Hora</span>
                    </div>
                    <button class="btn-join-league" data-id="${league.id}">Unirse</button>
                </div>
            </div>
        `).join('');
        
        // Add join handlers
        container.querySelectorAll('.btn-join-league').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const leagueId = btn.dataset.id;
                await this.joinLeague(leagueId);
            });
        });
    }
    
    // ==========================================
    // INTERNATIONAL RANKING UI
    // ==========================================
    
    renderGlobalRanking() {
        if (!this.globalRanking) return;
        
        const { season, tiers, totalPlayers } = this.globalRanking;
        
        // Update season info
        document.getElementById('current-season').textContent = season.current;
        document.getElementById('season-days-remaining').textContent = season.daysRemaining;
        
        // Render each tier
        const tierOrder = ['senna', 'king', 'professional', 'amateur', 'learner'];
        
        tierOrder.forEach(tierName => {
            const players = tiers[tierName] || [];
            const container = document.getElementById(`tier-${tierName}-players`);
            
            if (!container) return;
            
            if (players.length === 0) {
                container.innerHTML = `
                    <div class="no-players">
                        <span class="no-players-icon">👤</span>
                        <p>Nadie en este rango todavía</p>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = players.slice(0, 50).map((player, index) => `
                <div class="tier-player" data-player-id="${player.id}">
                    <span class="player-position ${index < 3 ? 'top-3' : ''}">#${player.tierPosition}</span>
                    <div class="player-avatar">
                        ${player.avatar 
                            ? `<img src="${player.avatar}" alt="${player.displayName}">`
                            : this.getCountryFlag(player.country)
                        }
                    </div>
                    <div class="player-info">
                        <div class="player-name">${player.displayName}</div>
                        <div class="player-team">${player.teamName}</div>
                    </div>
                    ${player.activeBadge ? `
                        <div class="player-badge">
                            <img src="img/ranks/${player.activeBadge}.png" alt="${player.activeBadge}">
                        </div>
                    ` : ''}
                    <div class="player-wins">
                        ${player.totalWins}
                        <span>victorias</span>
                    </div>
                </div>
            `).join('');
        });
    }
    
    renderMyRank() {
        if (!this.myRank) return;
        
        const { ranking } = this.myRank;
        const rankConfig = this.RANK_CONFIG[ranking.rank];
        
        // Update my rank badge
        const rankIcon = document.getElementById('my-rank-icon');
        const rankName = document.getElementById('my-rank-name');
        
        if (rankConfig.icon === 'a' || rankConfig.icon === 'p' || rankConfig.icon === 's') {
            rankIcon.style.display = 'none';
            rankName.innerHTML = `<span style="font-size: 2rem; margin-right: 10px;">${rankConfig.icon.toUpperCase()}</span>${rankConfig.name}`;
        } else {
            rankIcon.style.display = 'block';
            rankIcon.src = `img/ranks/${rankConfig.icon}.png`;
            rankName.textContent = rankConfig.name;
        }
        
        // Update stats
        document.getElementById('my-global-position').textContent = ranking.globalPosition;
        document.getElementById('my-tier-position').textContent = `${ranking.tierPosition}/${ranking.totalInTier}`;
        document.getElementById('my-total-wins').textContent = ranking.totalWins;
        
        // Update status
        const statusEl = document.getElementById('my-rank-status');
        if (ranking.willPromote && ranking.rank !== 'senna') {
            statusEl.className = 'my-rank-status promoting';
            statusEl.innerHTML = '⬆️ ¡Estás en zona de ascenso!';
        } else if (ranking.willRelegate && ranking.rank !== 'learner') {
            statusEl.className = 'my-rank-status relegating';
            statusEl.innerHTML = '⬇️ Cuidado, estás en zona de descenso';
        } else {
            statusEl.className = 'my-rank-status safe';
            statusEl.innerHTML = '✓ Posición estable';
        }
    }
    
    switchRankingTab(tabName) {
        this.currentRankingTab = tabName;
        
        const internationalSection = document.getElementById('international-ranking-section');
        const regularRankings = document.getElementById('rankings-container');
        
        if (tabName === 'international') {
            internationalSection.style.display = 'block';
            regularRankings.style.display = 'none';
            this.loadGlobalRanking();
            this.loadMyRank();
        } else {
            internationalSection.style.display = 'none';
            regularRankings.style.display = 'block';
            this.loadRegularRanking(tabName);
        }
    }
    
    async loadRegularRanking(type) {
        try {
            const endpoint = type === 'level' ? 'online' : type;
            const response = await fetch(`${this.API_URL}/leaderboard/${endpoint}?limit=100`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                this.renderRegularRanking(data.leaderboard, type);
            }
        } catch (error) {
            console.error('Error loading ranking:', error);
        }
    }
    
    renderRegularRanking(players, type) {
        const container = document.getElementById('rankings-container');
        
        if (players.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📊</span>
                    <p>No hay datos de ranking disponibles</p>
                </div>
            `;
            return;
        }
        
        const valueKey = type === 'level' ? 'level' : type === 'wins' ? 'onlineWins' : 'points';
        const valueLabel = type === 'level' ? 'Nivel' : type === 'wins' ? 'Victorias' : 'Puntos';
        
        container.innerHTML = players.map((player, index) => `
            <div class="rank-item">
                <span class="rank-position ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">${index + 1}</span>
                <div class="rank-avatar">
                    ${player.avatar 
                        ? `<img src="${player.avatar}" alt="${player.displayName}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
                        : '👤'
                    }
                </div>
                <div class="rank-info">
                    <div class="rank-name">${player.displayName}</div>
                    <div class="rank-team">${player.teamName}</div>
                </div>
                <div class="rank-value">${player[valueKey] || 0}</div>
            </div>
        `).join('');
    }
    
    // ==========================================
    // EVENT HANDLERS
    // ==========================================
    
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateTo(section);
            });
        });
        
        // Quick actions
        document.getElementById('btn-create-league')?.addEventListener('click', () => {
            this.openModal('modal-create-league');
        });
        
        document.getElementById('btn-join-league')?.addEventListener('click', () => {
            this.navigateTo('leagues');
        });
        
        document.getElementById('btn-find-league')?.addEventListener('click', () => {
            this.navigateTo('leagues');
        });
        
        document.getElementById('btn-view-leagues')?.addEventListener('click', () => {
            this.navigateTo('leagues');
        });
        
        document.getElementById('btn-open-shop')?.addEventListener('click', () => {
            this.navigateTo('shop');
        });
        
        // Create league modal
        document.getElementById('close-create-league')?.addEventListener('click', () => {
            this.closeModal('modal-create-league');
        });
        
        document.getElementById('cancel-create-league')?.addEventListener('click', () => {
            this.closeModal('modal-create-league');
        });
        
        document.getElementById('create-league-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreateLeague();
        });
        
        // Logo upload
        document.getElementById('btn-upload-logo')?.addEventListener('click', () => {
            document.getElementById('league-logo-input').click();
        });
        
        document.getElementById('league-logo-input')?.addEventListener('change', (e) => {
            this.handleLogoUpload(e.target.files[0]);
        });
        
        // Description character count
        document.getElementById('league-description')?.addEventListener('input', (e) => {
            document.getElementById('desc-count').textContent = e.target.value.length;
        });
        
        // Join league modal
        document.getElementById('close-join-league')?.addEventListener('click', () => {
            this.closeModal('modal-join-league');
        });
        
        document.getElementById('cancel-join-league')?.addEventListener('click', () => {
            this.closeModal('modal-join-league');
        });
        
        // League search
        document.getElementById('league-search')?.addEventListener('input', this.debounce(() => {
            const query = document.getElementById('league-search').value;
            const country = document.getElementById('country-filter').value;
            this.searchLeagues(query, country);
        }, 300));
        
        document.getElementById('country-filter')?.addEventListener('change', () => {
            const query = document.getElementById('league-search').value;
            const country = document.getElementById('country-filter').value;
            this.searchLeagues(query, country);
        });
        
        // Shop money packages
        document.querySelectorAll('.shop-item.money').forEach(item => {
            item.querySelector('.item-price')?.addEventListener('click', async () => {
                const packageId = item.dataset.package;
                await this.buyMoneyPackage(packageId);
            });
        });
        
        // Shop coin packages
        document.querySelectorAll('.shop-item:not(.money)').forEach(item => {
            const packageId = item.dataset.package;
            if (packageId && packageId.startsWith('coins_')) {
                item.querySelector('.item-price')?.addEventListener('click', async () => {
                    await this.buyCoinPackage(packageId);
                });
            }
        });
        
        // Modal overlay click to close
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', () => {
                const modal = overlay.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });
        
        // Rankings tabs
        document.querySelectorAll('.rank-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.rank-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const rankType = tab.dataset.rank;
                this.switchRankingTab(rankType);
            });
        });
        
        // Tier header click to expand/collapse
        document.querySelectorAll('.tier-header').forEach(header => {
            header.addEventListener('click', () => {
                const tier = header.closest('.rank-tier');
                const players = tier.querySelector('.tier-players');
                players.style.display = players.style.display === 'none' ? 'block' : 'none';
            });
        });
    }
    
    async handleCreateLeague() {
        const name = document.getElementById('league-name').value.trim();
        const description = document.getElementById('league-description').value.trim();
        const country = document.getElementById('league-country').value;
        const dayOfWeek = parseInt(document.getElementById('league-day').value);
        const time = document.getElementById('league-time').value;
        const isPrivate = document.getElementById('league-private').checked;
        const maxMembers = parseInt(document.getElementById('league-max-members').value);
        const minLevel = parseInt(document.getElementById('league-min-level').value);
        
        // Get logo if uploaded
        const logoPreview = document.getElementById('league-logo-preview');
        const logo = logoPreview.dataset.base64 || null;
        
        const leagueData = {
            name,
            description,
            logo,
            country,
            schedule: {
                dayOfWeek,
                time,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            settings: {
                isPrivate,
                maxMembers,
                minLevel
            }
        };
        
        await this.createLeague(leagueData);
    }
    
    handleLogoUpload(file) {
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showToast('Por favor, selecciona una imagen', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) { // 2MB max
            this.showToast('La imagen no puede superar 2MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('league-logo-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Logo preview">`;
            preview.dataset.base64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // ==========================================
    // NAVIGATION
    // ==========================================
    
    initNavigation() {
        // Check URL hash for initial section
        const hash = window.location.hash.replace('#', '');
        if (hash && ['home', 'leagues', 'shop', 'rankings'].includes(hash)) {
            this.navigateTo(hash);
        }
    }
    
    navigateTo(section) {
        this.currentSection = section;
        
        // Update nav items
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
        
        // Load data for section
        if (section === 'leagues') {
            this.searchLeagues();
        } else if (section === 'rankings') {
            // Load international ranking by default
            this.switchRankingTab('international');
        }
        
        // Update URL hash
        window.location.hash = section;
    }
    
    // ==========================================
    // MODALS
    // ==========================================
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // ==========================================
    // UTILITIES
    // ==========================================
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            info: 'ℹ'
        };
        
        toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${message}`;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    formatMoney(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'M';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(0) + 'K';
        }
        return amount.toString();
    }
    
    getCountryName(code) {
        const countries = {
            'ES': 'España', 'MX': 'México', 'AR': 'Argentina', 'CO': 'Colombia',
            'US': 'Estados Unidos', 'GB': 'Reino Unido', 'FR': 'Francia',
            'DE': 'Alemania', 'IT': 'Italia', 'BR': 'Brasil'
        };
        return countries[code] || code;
    }
    
    getCountryFlag(code) {
        const flags = {
            'ES': '🇪🇸', 'MX': '🇲🇽', 'AR': '🇦🇷', 'CO': '🇨🇴', 'US': '🇺🇸',
            'GB': '🇬🇧', 'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'BR': '🇧🇷'
        };
        return flags[code] || '🏳️';
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.onlineController = new OnlineController();
});
