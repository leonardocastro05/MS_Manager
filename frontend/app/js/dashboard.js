/**
 * MS Manager - Dashboard Controller
 * Gestiona la homepage y navegación principal
 */

class DashboardController {
    constructor() {
        this.apiBaseUrl = this.getApiUrl();
        this.user = null;
        this.token = localStorage.getItem('authToken');
        this.socialOverview = {
            friendCode: '',
            friends: [],
            incomingRequests: [],
            outgoingRequests: [],
            raceInvites: []
        };
        this.socialPollInterval = null;
        this.feedbackTimeout = null;
        
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
            this.redirectToLogin();
            return;
        }
        
        // Cargar datos del usuario
        await this.loadUserData();
        await this.loadSocialOverview();
        
        // Inicializar eventos
        this.bindEvents();
        this.startSocialPolling();
        
        // Animaciones de entrada
        this.playEntryAnimations();
        
        // Iniciar música del dashboard
        this.playDashboardMusic();
    }
    
    /**
     * Carga los datos del usuario desde el servidor
     */
    async loadUserData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    this.redirectToLogin();
                    return;
                }
                throw new Error('Failed to load user data');
            }
            
            const data = await response.json();
            this.user = data.user;
            this.updateUI();
            
        } catch (error) {
            console.error('Error loading user data:', error);
            // Usar datos del token si el servidor falla
            this.loadUserFromToken();
        }
    }
    
    /**
     * Decodifica datos básicos del token JWT
     */
    loadUserFromToken() {
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            this.user = {
                id: payload.id,
                username: payload.username || 'Usuario',
                teamName: 'Mi Equipo',
                gameData: { budget: 0 },
                stats: { coins: 0, wins: 0, matches: 0 }
            };
            this.updateUI();
        } catch (e) {
            console.error('Error decoding token:', e);
        }
    }
    
    /**
     * Actualiza la interfaz con los datos del usuario
     */
    updateUI() {
        if (!this.user) return;
        
        // Nombre de usuario
        const welcomeName = document.getElementById('welcome-name');
        const userName = document.getElementById('user-name');
        const userTeam = document.getElementById('user-team');
        const avatarLetter = document.getElementById('user-avatar-letter');
        
        if (welcomeName) welcomeName.textContent = this.user.username;
        if (userName) userName.textContent = this.user.username;
        if (userTeam) userTeam.textContent = this.user.teamName || 'Sin equipo';
        if (avatarLetter) avatarLetter.textContent = this.user.username.charAt(0).toUpperCase();
        
        // Estadísticas del header - Money y Coins
        const gameData = this.user.gameData || {};
        const onlineData = gameData.online || {};
        
        // 💰 Money (budget del juego)
        const moneyEl = document.getElementById('user-money');
        if (moneyEl) moneyEl.textContent = this.formatNumber(gameData.budget || 0);
        
        // 💎 Coins (moneda premium)
        const coinsEl = document.getElementById('user-coins');
        if (coinsEl) coinsEl.textContent = onlineData.coins || 0;
        
        // Quick stats
        const stats = this.user.stats || {};
        document.getElementById('stat-wins').textContent = gameData.wins || stats.wins || 0;
        document.getElementById('stat-matches').textContent = gameData.racesCompleted || stats.matches || 0;
        
        // Calcular win rate
        const matches = gameData.racesCompleted || stats.matches || 0;
        const wins = gameData.wins || stats.wins || 0;
        const winRate = matches > 0 
            ? Math.round((wins / matches) * 100) 
            : 0;
        document.getElementById('stat-winrate').textContent = `${winRate}%`;
        
        // Ranking
        document.getElementById('stat-rank').textContent = stats.rank 
            ? `#${stats.rank}` 
            : '#---';
    }

    async apiRequest(path, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`,
            ...(options.headers || {})
        };

        const response = await fetch(`${this.apiBaseUrl}${path}`, {
            ...options,
            headers
        });

        let data = null;
        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        if (!response.ok) {
            const error = new Error(data?.message || 'Request failed');
            error.status = response.status;
            throw error;
        }

        return data;
    }

    async loadSocialOverview(silent = false) {
        try {
            const data = await this.apiRequest('/social/friends/overview');
            this.socialOverview = {
                friendCode: data.friendCode || '',
                friends: Array.isArray(data.friends) ? data.friends : [],
                incomingRequests: Array.isArray(data.incomingRequests) ? data.incomingRequests : [],
                outgoingRequests: Array.isArray(data.outgoingRequests) ? data.outgoingRequests : [],
                raceInvites: Array.isArray(data.raceInvites) ? data.raceInvites : []
            };
            this.renderSocialOverview();
        } catch (error) {
            if (error.status === 401) {
                this.redirectToLogin();
                return;
            }

            if (!silent) {
                this.showFriendsFeedback('No se pudo cargar la seccion de amigos', 'error');
            }
            console.error('Error loading social overview:', error);
        }
    }

    renderSocialOverview() {
        const friendCodeValue = document.getElementById('friend-code-value');
        const incomingCount = document.getElementById('incoming-requests-count');
        const incomingList = document.getElementById('incoming-requests-list');
        const incomingEmpty = document.getElementById('incoming-empty');
        const friendsList = document.getElementById('friends-list');
        const friendsEmpty = document.getElementById('friends-empty');
        const raceInvitesList = document.getElementById('race-invites-list');
        const raceInvitesEmpty = document.getElementById('race-invites-empty');
        const friendsDot = document.getElementById('friends-dot');

        const incomingRequests = this.socialOverview.incomingRequests || [];
        const friends = this.socialOverview.friends || [];
        const raceInvites = this.socialOverview.raceInvites || [];

        if (friendCodeValue) {
            friendCodeValue.textContent = this.socialOverview.friendCode || '------';
        }

        if (incomingCount) {
            incomingCount.textContent = String(incomingRequests.length);
        }

        if (friendsDot) {
            friendsDot.classList.toggle('hidden', incomingRequests.length === 0);
        }

        if (incomingList) {
            incomingList.innerHTML = incomingRequests.map((request) => {
                const from = request.from || {};
                const displayName = this.escapeHtml(from.displayName || from.username || 'Manager');
                const teamName = this.escapeHtml(from.teamName || 'Sin equipo');
                const userId = this.escapeHtml(from.id || '');
                return `
                    <div class="friend-item">
                        <div class="friend-item-main">
                            <span class="friend-item-name">${displayName}</span>
                            <span class="friend-item-sub">${teamName}</span>
                        </div>
                        <div class="friend-item-actions">
                            <button class="friend-mini-btn accept" data-action="accept-request" data-user-id="${userId}">Aceptar</button>
                            <button class="friend-mini-btn reject" data-action="reject-request" data-user-id="${userId}">Rechazar</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (incomingEmpty) {
            incomingEmpty.classList.toggle('hidden', incomingRequests.length > 0);
        }

        if (friendsList) {
            friendsList.innerHTML = friends.map((friend) => {
                const friendId = this.escapeHtml(friend.id || '');
                const displayName = this.escapeHtml(friend.displayName || friend.username || 'Manager');
                const teamName = this.escapeHtml(friend.teamName || 'Sin equipo');
                return `
                    <div class="friend-item">
                        <div class="friend-item-main">
                            <span class="friend-item-name">${displayName}</span>
                            <span class="friend-item-sub">${teamName}</span>
                        </div>
                        <div class="friend-item-actions">
                            <button class="friend-mini-btn remove" data-action="remove-friend" data-user-id="${friendId}">Quitar</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (friendsEmpty) {
            friendsEmpty.classList.toggle('hidden', friends.length > 0);
        }

        if (raceInvitesList) {
            raceInvitesList.innerHTML = raceInvites.map((invite) => {
                const hostName = this.escapeHtml(invite.host?.displayName || invite.host?.username || 'Manager');
                const track = this.escapeHtml((invite.trackId || 'pista').toUpperCase());
                const laps = Number(invite.laps || 10);
                const roomCode = this.escapeHtml(invite.roomCode || '');
                return `
                    <div class="friend-item">
                        <div class="friend-item-main">
                            <span class="friend-item-name">${hostName}</span>
                            <span class="friend-item-sub">${track} · ${laps} vueltas · #${roomCode}</span>
                        </div>
                        <div class="friend-item-actions">
                            <button class="friend-mini-btn join" data-action="join-race-invite" data-room-code="${roomCode}">Unirme</button>
                            <button class="friend-mini-btn reject" data-action="reject-race-invite" data-room-code="${roomCode}">Rechazar</button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        if (raceInvitesEmpty) {
            raceInvitesEmpty.classList.toggle('hidden', raceInvites.length > 0);
        }
    }

    openFriendsDrawer() {
        const drawer = document.getElementById('friends-drawer');
        const overlay = document.getElementById('friends-overlay');
        const profileBtn = document.getElementById('user-profile-btn');
        const profileDropdown = document.getElementById('profile-dropdown');

        if (drawer) {
            drawer.classList.add('show');
            drawer.setAttribute('aria-hidden', 'false');
        }
        if (overlay) overlay.classList.add('show');

        if (profileBtn && profileDropdown) {
            profileBtn.classList.remove('open');
            profileDropdown.classList.remove('show');
        }

        this.loadSocialOverview(true);
    }

    closeFriendsDrawer() {
        const drawer = document.getElementById('friends-drawer');
        const overlay = document.getElementById('friends-overlay');

        if (drawer) {
            drawer.classList.remove('show');
            drawer.setAttribute('aria-hidden', 'true');
        }
        if (overlay) overlay.classList.remove('show');
    }

    showFriendsFeedback(message, type = 'success') {
        const feedback = document.getElementById('friends-feedback');
        if (!feedback) return;

        feedback.textContent = message;
        feedback.classList.remove('hidden', 'success', 'error');
        feedback.classList.add(type === 'error' ? 'error' : 'success');

        if (this.feedbackTimeout) {
            clearTimeout(this.feedbackTimeout);
        }

        this.feedbackTimeout = setTimeout(() => {
            feedback.classList.add('hidden');
        }, 3200);
    }

    async sendFriendRequest() {
        const input = document.getElementById('friend-code-input');
        if (!input) return;

        const friendCode = String(input.value || '').trim().toUpperCase();
        if (!friendCode) {
            this.showFriendsFeedback('Introduce un codigo de usuario valido', 'error');
            return;
        }

        try {
            const data = await this.apiRequest('/social/friends/request', {
                method: 'POST',
                body: JSON.stringify({ friendCode })
            });

            input.value = '';
            this.showFriendsFeedback(data.message || 'Solicitud enviada');
            await this.loadSocialOverview(true);
        } catch (error) {
            this.showFriendsFeedback(error.message || 'No se pudo enviar la solicitud', 'error');
        }
    }

    async copyFriendCode() {
        const friendCode = this.socialOverview.friendCode;
        if (!friendCode) {
            this.showFriendsFeedback('Aun no tienes un codigo generado', 'error');
            return;
        }

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(friendCode);
            } else {
                const temp = document.createElement('textarea');
                temp.value = friendCode;
                document.body.appendChild(temp);
                temp.select();
                document.execCommand('copy');
                document.body.removeChild(temp);
            }
            this.showFriendsFeedback('Codigo copiado al portapapeles');
        } catch (error) {
            this.showFriendsFeedback('No se pudo copiar el codigo', 'error');
        }
    }

    async handleFriendAction(target) {
        const action = target?.dataset?.action;
        if (!action) return;

        try {
            if (action === 'accept-request') {
                const userId = target.dataset.userId;
                await this.apiRequest(`/social/friends/request/${encodeURIComponent(userId)}/accept`, {
                    method: 'POST'
                });
                this.showFriendsFeedback('Solicitud aceptada');
            } else if (action === 'reject-request') {
                const userId = target.dataset.userId;
                await this.apiRequest(`/social/friends/request/${encodeURIComponent(userId)}/reject`, {
                    method: 'POST'
                });
                this.showFriendsFeedback('Solicitud rechazada');
            } else if (action === 'remove-friend') {
                const userId = target.dataset.userId;
                await this.apiRequest(`/social/friends/${encodeURIComponent(userId)}`, {
                    method: 'DELETE'
                });
                this.showFriendsFeedback('Amigo eliminado');
            } else if (action === 'join-race-invite') {
                const roomCode = target.dataset.roomCode;
                await this.apiRequest('/social/quick-races/join', {
                    method: 'POST',
                    body: JSON.stringify({ roomCode })
                });
                window.location.href = `friendly-online.html?room=${encodeURIComponent(roomCode)}`;
                return;
            } else if (action === 'reject-race-invite') {
                const roomCode = target.dataset.roomCode;
                await this.apiRequest(`/social/quick-races/${encodeURIComponent(roomCode)}/reject-invite`, {
                    method: 'POST'
                });
                this.showFriendsFeedback('Invitacion rechazada');
            }

            await this.loadSocialOverview(true);
        } catch (error) {
            this.showFriendsFeedback(error.message || 'No se pudo completar la accion', 'error');
        }
    }

    startSocialPolling() {
        if (this.socialPollInterval) {
            clearInterval(this.socialPollInterval);
        }

        this.socialPollInterval = setInterval(() => {
            this.loadSocialOverview(true);
        }, 15000);
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    /**
     * Formatea números grandes (1000 -> 1K)
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    /**
     * Vincula todos los eventos
     */
    bindEvents() {
        // Profile dropdown
        const profileBtn = document.getElementById('user-profile-btn');
        const profileDropdown = document.getElementById('profile-dropdown');
        const friendsMenuItem = document.getElementById('friends-menu-item');
        const friendsCloseBtn = document.getElementById('friends-close-btn');
        const friendsOverlay = document.getElementById('friends-overlay');
        const sendFriendRequestBtn = document.getElementById('send-friend-request-btn');
        const copyFriendCodeBtn = document.getElementById('copy-friend-code-btn');
        const friendCodeInput = document.getElementById('friend-code-input');
        const friendsDrawer = document.getElementById('friends-drawer');
        
        if (profileBtn && profileDropdown) {
            profileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                profileBtn.classList.toggle('open');
                profileDropdown.classList.toggle('show');
            });
            
            // Cerrar dropdown al hacer click fuera
            document.addEventListener('click', () => {
                profileBtn.classList.remove('open');
                profileDropdown.classList.remove('show');
            });
        }

        if (friendsMenuItem) {
            friendsMenuItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openFriendsDrawer();
            });
        }

        if (friendsCloseBtn) {
            friendsCloseBtn.addEventListener('click', () => this.closeFriendsDrawer());
        }

        if (friendsOverlay) {
            friendsOverlay.addEventListener('click', () => this.closeFriendsDrawer());
        }

        if (sendFriendRequestBtn) {
            sendFriendRequestBtn.addEventListener('click', () => this.sendFriendRequest());
        }

        if (copyFriendCodeBtn) {
            copyFriendCodeBtn.addEventListener('click', () => this.copyFriendCode());
        }

        if (friendCodeInput) {
            friendCodeInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.sendFriendRequest();
                }
            });
        }

        if (friendsDrawer) {
            friendsDrawer.addEventListener('click', (e) => {
                const target = e.target.closest('[data-action]');
                if (!target) return;
                this.handleFriendAction(target);
            });
        }
        
        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Game mode cards
        const offlineCard = document.getElementById('mode-offline');
        const onlineCard = document.getElementById('mode-online');
        const onlineCompetitiveBtn = document.getElementById('btn-online-competitive');
        const onlineFriendlyBtn = document.getElementById('btn-online-friendly');
        
        if (offlineCard) {
            offlineCard.addEventListener('click', () => this.selectGameMode('offline'));
        }

        if (onlineCompetitiveBtn) {
            onlineCompetitiveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectGameMode('online');
            });
        }

        if (onlineFriendlyBtn) {
            onlineFriendlyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.selectGameMode('friendly');
            });
        }
        
        if (onlineCard) {
            onlineCard.addEventListener('click', (e) => {
                if (e.target.closest('#btn-online-competitive') || e.target.closest('#btn-online-friendly')) {
                    return;
                }
                if (onlineCard.classList.contains('locked')) return;
                this.selectGameMode('online');
            });
        }
        
        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const section = item.dataset.section;
                if (section) {
                    e.preventDefault();
                    this.navigateTo(section);
                } else if (item.getAttribute('href') === '#') {
                    // Solo prevenir default si el href es '#'
                    e.preventDefault();
                }
            });
        });
    }
    
    /**
     * Selecciona un modo de juego
     */
    async selectGameMode(mode) {
        console.log(`Selecting game mode: ${mode}`);
        
        // Efecto visual de selección
        const card = mode === 'friendly'
            ? document.getElementById('mode-online')
            : document.getElementById(`mode-${mode}`);

        if (card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(async () => {
                card.style.transform = '';
                
                // Navegar a la página del modo
                if (mode === 'offline') {
                    window.location.href = 'offline.html';
                } else if (mode === 'online') {
                    // Verificar acceso al modo online
                    const canAccess = await this.checkOnlineAccess();
                    if (canAccess) {
                        window.location.href = 'online.html';
                    }
                } else if (mode === 'friendly') {
                    const canAccess = await this.checkOnlineAccess();
                    if (canAccess) {
                        window.location.href = 'friendly-online.html';
                    }
                }
            }, 150);
        }
    }
    
    /**
     * Verifica si el usuario puede acceder al modo online
     * TODO: En el futuro añadir requisitos de nivel HQ
     */
    async checkOnlineAccess() {
        // Modo online desbloqueado temporalmente
        // TODO: Descomentar cuando se implementen los requisitos
        /*
        try {
            const response = await fetch(`${this.apiBaseUrl}/online/status`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to check online status');
            }
            
            const data = await response.json();
            
            if (data.success && data.hasAccess) {
                return true;
            } else {
                // Mostrar mensaje de desbloqueo
                this.showOnlineLockedMessage(data.hqLevels, data.requiredLevel);
                return false;
            }
        } catch (error) {
            console.error('Error checking online access:', error);
            // Permitir acceso si hay error (el servidor validará de nuevo)
            return true;
        }
        */
        return true;
    }
    
    /**
     * Muestra mensaje de modo online bloqueado
     */
    showOnlineLockedMessage(hqLevels, required) {
        const levels = hqLevels || { facilities: 1, engineering: 1, marketing: 1, staff: 1 };
        
        let message = `🔒 Modo Online Bloqueado\n\n`;
        message += `Necesitas nivel ${required} en todas las categorías de HQ:\n\n`;
        message += `🏢 Instalaciones: ${levels.facilities}/${required} ${levels.facilities >= required ? '✓' : '✗'}\n`;
        message += `⚙️ Ingeniería: ${levels.engineering}/${required} ${levels.engineering >= required ? '✓' : '✗'}\n`;
        message += `📢 Marketing: ${levels.marketing}/${required} ${levels.marketing >= required ? '✓' : '✗'}\n`;
        message += `👥 Personal: ${levels.staff}/${required} ${levels.staff >= required ? '✓' : '✗'}\n\n`;
        message += `¡Sigue jugando en modo offline para desbloquear!`;
        
        alert(message);
    }
    
    /**
     * Navega a una sección
     */
    navigateTo(section) {
        // Actualizar nav active
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });
        
        console.log(`Navigating to: ${section}`);
        
        // Redirección suave
        setTimeout(() => {
            switch(section) {
                case 'home':
                    // Ya estamos en home
                    break;
                case 'offline':
                    window.location.href = 'offline.html';
                    break;
                case 'online':
                    window.location.href = 'online.html';
                    break;
                case 'friendly':
                    window.location.href = 'friendly-online.html';
                    break;
                case 'shop':
                    window.location.href = 'https://msmanager.duckdns.org/app/online.html#shop';
                    break;
            }
        }, 100);
    }
    
    /**
     * Muestra mensaje de "próximamente"
     */
    showComingSoon(feature) {
        // Simple alert por ahora, luego podemos hacer un modal bonito
        alert(`🚧 "${feature}" estará disponible próximamente!`);
    }
    
    /**
     * Cierra sesión
     */
    logout() {
        localStorage.removeItem('authToken');
        this.redirectToLogin();
    }
    
    /**
     * Redirige al login
     */
    redirectToLogin() {
        window.location.href = 'index.html';
    }
    
    /**
     * Animaciones de entrada
     */
    playDashboardMusic() {
        const bgMusic = new Audio('img/videos/Redline_Pursuit.mp3');
        bgMusic.loop = true;
        bgMusic.volume = 0.3;
        
        // Algunos navegadores bloquean el autoplay, así que intentamos reproducir
        // y si falla (porque no hay interacción aún), lo atamos a un clic en el body.
        const playMusic = () => {
            bgMusic.play().then(() => {
                document.body.removeEventListener('click', playMusic);
                document.body.removeEventListener('keydown', playMusic);
            }).catch(e => console.warn('Autoplay prevented:', e));
        };
        
        playMusic();
        document.body.addEventListener('click', playMusic);
        document.body.addEventListener('keydown', playMusic);
    }
    
    playEntryAnimations() {
        // Animar elementos con delay escalonado
        const elements = [
            '.welcome-section',
            '.game-mode-card.offline',
            '.modes-divider',
            '.game-mode-card.online',
            '.quick-stats',
            '.news-section'
        ];
        
        elements.forEach((selector, index) => {
            const el = document.querySelector(selector);
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 100 + (index * 100));
            }
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardController = new DashboardController();
});
