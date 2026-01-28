/**
 * MS Manager - New Dashboard Controller (iGP Style)
 */

class DashboardController {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000/api';
        this.token = localStorage.getItem('authToken');
        this.user = null;
        
        this.init();
    }
    
    async init() {
        // Verificar autenticación
        if (!this.token) {
            window.location.href = 'index.html';
            return;
        }
        
        await this.loadUserData();
        this.bindEvents();
        this.startAnimations();
    }
    
    /**
     * Carga datos del usuario desde el servidor
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
                    localStorage.removeItem('authToken');
                    window.location.href = 'index.html';
                    return;
                }
                throw new Error('Failed to load user data');
            }
            
            const data = await response.json();
            this.user = data.user;
            this.updateUI();
            
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showNotification('Error al cargar datos del usuario', 'error');
        }
    }
    
    /**
     * Actualiza la UI con los datos del usuario
     */
    updateUI() {
        if (!this.user) return;
        
        // Actualizar monedas/dinero
        const money = this.user.gameData?.budget || 0;
        const tokens = this.user.gameData?.online?.coins || 0;
        
        document.getElementById('user-money').textContent = this.formatMoney(money);
        document.getElementById('user-tokens').textContent = tokens;
        
        // Actualizar nivel y experiencia
        const level = this.user.gameData?.level || 1;
        const exp = this.user.gameData?.experience || 0;
        const expForNextLevel = level * 1000; // Ejemplo: 1000 exp por nivel
        const expProgress = (exp / expForNextLevel) * 100;
        
        document.getElementById('user-level').textContent = level;
        document.getElementById('total-exp').textContent = exp;
        document.getElementById('exp-remaining').textContent = 
            `${this.formatNumber(expForNextLevel - exp)} EXP para el siguiente nivel`;
        
        const expFill = document.querySelector('.exp-fill');
        if (expFill) {
            expFill.style.width = `${Math.min(expProgress, 100)}%`;
        }
        
        // Actualizar avatar
        const avatarLetter = document.getElementById('user-avatar-letter');
        if (avatarLetter && this.user.username) {
            avatarLetter.textContent = this.user.username.charAt(0).toUpperCase();
        }
    }
    
    /**
     * Vincula eventos de la UI
     */
    bindEvents() {
        // Navegación principal
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });
        
        // Tarjetas del dashboard
        document.getElementById('card-career')?.addEventListener('click', () => {
            window.location.href = 'online.html';
        });
        
        document.getElementById('card-community')?.addEventListener('click', () => {
            window.location.href = 'league.html';
        });
        
        document.getElementById('card-offline')?.addEventListener('click', () => {
            window.location.href = 'offline.html';
        });
        
        document.getElementById('card-league')?.addEventListener('click', () => {
            window.location.href = 'league.html';
        });
        
        document.getElementById('card-vip')?.addEventListener('click', () => {
            this.showNotification('Suscripción VIP próximamente', 'info');
        });
        
        // Menú de perfil
        const profileBtn = document.getElementById('user-profile-btn');
        const profileDropdown = document.getElementById('profile-dropdown');
        
        profileBtn?.addEventListener('click', () => {
            profileDropdown?.classList.toggle('active');
        });
        
        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!profileBtn?.contains(e.target) && !profileDropdown?.contains(e.target)) {
                profileDropdown?.classList.remove('active');
            }
        });
        
        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });
        
        // Tabs del sidebar
        document.querySelectorAll('.sidebar-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
            });
        });
        
        // Botón de estrategia
        document.querySelector('.strategy-btn')?.addEventListener('click', () => {
            window.location.href = 'league.html';
        });
    }
    
    /**
     * Navega a una sección
     */
    navigateToSection(section) {
        switch(section) {
            case 'car':
                // TODO: Página de monoplazas
                this.showNotification('Sección de monoplazas próximamente', 'info');
                break;
            case 'team':
                // TODO: Página de equipo
                this.showNotification('Sección de equipo próximamente', 'info');
                break;
            case 'home':
                // Ya estamos en home
                break;
            case 'hq':
                window.location.href = 'offline.html'; // HQ está en offline por ahora
                break;
            case 'shop':
                // TODO: Tienda
                this.showNotification('Tienda próximamente', 'info');
                break;
        }
        
        // Actualizar estado activo
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });
    }
    
    /**
     * Inicia animaciones
     */
    startAnimations() {
        // Animación de entrada para las tarjetas
        const cards = document.querySelectorAll('.dashboard-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
        
        // Carrusel del circuito (cambiar cada 5 segundos)
        this.startTrackCarousel();
    }
    
    /**
     * Carrusel de circuitos
     */
    startTrackCarousel() {
        const tracks = ['monza', 'bahrain', 'monaco'];
        const temps = ['25°C', '32°C', '22°C'];
        const icons = ['☀️', '☀️', '🌤️'];
        let currentIndex = 0;
        
        setInterval(() => {
            currentIndex = (currentIndex + 1) % tracks.length;
            
            const trackImg = document.querySelector('.track-card img');
            const tempEl = document.querySelector('.weather-temp');
            const iconEl = document.querySelector('.weather-icon');
            const dots = document.querySelectorAll('.track-dots .dot');
            
            if (trackImg) {
                trackImg.style.opacity = '0';
                setTimeout(() => {
                    trackImg.src = `img/tracks/${tracks[currentIndex]}.svg`;
                    trackImg.style.opacity = '0.8';
                }, 300);
            }
            
            if (tempEl) tempEl.textContent = temps[currentIndex];
            if (iconEl) iconEl.textContent = icons[currentIndex];
            
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentIndex);
            });
            
        }, 5000);
    }
    
    /**
     * Cierra sesión
     */
    logout() {
        localStorage.removeItem('authToken');
        window.location.href = 'index.html';
    }
    
    /**
     * Formatea dinero
     */
    formatMoney(amount) {
        if (amount >= 1000000) {
            return (amount / 1000000).toFixed(1) + 'm';
        } else if (amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'k';
        }
        return amount.toString();
    }
    
    /**
     * Formatea números con separadores
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    /**
     * Muestra notificación
     */
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
        `;
        
        // Estilos inline
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '15px 25px',
            background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6',
            color: 'white',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: '9999',
            animation: 'slideIn 0.3s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        });
        
        document.body.appendChild(notification);
        
        // Añadir keyframes para la animación
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardController = new DashboardController();
});
