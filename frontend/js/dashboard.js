/**
 * MS Manager - Dashboard Controller
 * Gestiona la homepage y navegación principal
 */

class DashboardController {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000/api';
        this.user = null;
        this.token = localStorage.getItem('authToken');
        
        this.init();
    }
    
    async init() {
        // Verificar autenticación
        if (!this.token) {
            this.redirectToLogin();
            return;
        }
        
        // Cargar datos del usuario
        await this.loadUserData();
        
        // Inicializar eventos
        this.bindEvents();
        
        // Animaciones de entrada
        this.playEntryAnimations();
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
        
        if (offlineCard) {
            offlineCard.addEventListener('click', () => this.selectGameMode('offline'));
        }
        
        if (onlineCard) {
            onlineCard.addEventListener('click', () => this.selectGameMode('online'));
        }
        
        // Navigation items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateTo(section);
            });
        });
    }
    
    /**
     * Selecciona un modo de juego
     */
    async selectGameMode(mode) {
        console.log(`Selecting game mode: ${mode}`);
        
        // Efecto visual de selección
        const card = document.getElementById(`mode-${mode}`);
        if (card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(async () => {
                card.style.transform = '';
                
                // Navegar a la página del modo
                if (mode === 'offline') {
                    window.location.href = 'offline.html';
                } else {
                    // Verificar acceso al modo online
                    const canAccess = await this.checkOnlineAccess();
                    if (canAccess) {
                        window.location.href = 'online.html';
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
        
        // TODO: Implementar navegación real o SPA routing
        switch(section) {
            case 'home':
                // Ya estamos en home
                break;
            case 'team':
                // window.location.href = '/team.html';
                this.showComingSoon('Mi Equipo');
                break;
            case 'shop':
                // window.location.href = '/shop.html';
                this.showComingSoon('Tienda');
                break;
            case 'settings':
                // window.location.href = '/settings.html';
                this.showComingSoon('Ajustes');
                break;
        }
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
