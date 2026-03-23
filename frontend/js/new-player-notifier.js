/**
 * MS Manager - New Player Notification System
 * Shows subtle notifications when new players join the game
 * 
 * This script should be included in all pages EXCEPT race-live.html
 */

class NewPlayerNotifier {
    constructor() {
        this.API_URL = this.getApiUrl();
        this.lastCheckTime = Date.now();
        this.shownUsers = new Set();
        this.notificationQueue = [];
        this.isShowingNotification = false;
        this.notificationElement = null;
        
        // Create notification element if it doesn't exist
        this.createNotificationElement();
        
        // Start polling for new registrations
        this.startPolling();
    }
    
    getApiUrl() {
        const isFileProtocol = window.location.protocol === 'file:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (isFileProtocol || isLocalhost) {
            return 'http://localhost:5000/api';
        }
        return '/api';
    }
    
    createNotificationElement() {
        // Check if notification element already exists
        if (document.getElementById('new-player-notification')) {
            this.notificationElement = document.getElementById('new-player-notification');
            return;
        }
        
        // Create the notification container
        const notification = document.createElement('div');
        notification.id = 'new-player-notification';
        notification.className = 'new-player-notification hidden';
        notification.innerHTML = `
            <span class="notification-icon">🎮</span>
            <span class="notification-text" id="notification-text"></span>
        `;
        
        // Add styles if not already present
        if (!document.getElementById('new-player-notifier-styles')) {
            const styles = document.createElement('style');
            styles.id = 'new-player-notifier-styles';
            styles.textContent = `
                .new-player-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, rgba(0, 200, 100, 0.15), rgba(0, 150, 80, 0.1));
                    border: 1px solid rgba(0, 200, 100, 0.4);
                    border-radius: 15px;
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 10000;
                    animation: slideInNotification 0.5s ease;
                    backdrop-filter: blur(10px);
                    max-width: 350px;
                    box-shadow: 0 5px 25px rgba(0, 200, 100, 0.2);
                    font-family: 'Rajdhani', sans-serif;
                }
                
                .new-player-notification.hidden {
                    display: none !important;
                }
                
                .new-player-notification.fade-out {
                    animation: fadeOutNotification 0.5s ease forwards;
                }
                
                .new-player-notification .notification-icon {
                    font-size: 1.5rem;
                    animation: bounceIcon 0.5s ease;
                }
                
                .new-player-notification .notification-text {
                    color: rgba(255, 255, 255, 0.9);
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
                
                .new-player-notification .notification-text strong {
                    color: #00c864;
                    font-weight: 600;
                }
                
                @keyframes slideInNotification {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeOutNotification {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                }
                
                @keyframes bounceIcon {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                
                @media (max-width: 768px) {
                    .new-player-notification {
                        bottom: 10px;
                        right: 10px;
                        left: 10px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        this.notificationElement = notification;
    }
    
    startPolling() {
        // Check every 30 seconds for new registrations
        this.checkNewRegistrations();
        setInterval(() => this.checkNewRegistrations(), 30000);
    }
    
    async checkNewRegistrations() {
        try {
            const response = await fetch(`${this.API_URL}/auth/recent-registrations?minutes=1`);
            const data = await response.json();
            
            if (data.success && data.users && data.users.length > 0) {
                // Filter out users we've already shown
                const newUsers = data.users.filter(u => !this.shownUsers.has(u.username));
                
                newUsers.forEach(user => {
                    this.shownUsers.add(user.username);
                    this.notificationQueue.push(user);
                });
                
                // Process the queue
                this.processNotificationQueue();
            }
        } catch (error) {
            // Silently fail - this is a non-critical feature
            console.debug('New player check failed:', error);
        }
    }
    
    processNotificationQueue() {
        if (this.isShowingNotification || this.notificationQueue.length === 0) {
            return;
        }
        
        const user = this.notificationQueue.shift();
        this.showNotification(user);
    }
    
    showNotification(user) {
        if (!this.notificationElement) {
            this.createNotificationElement();
        }
        
        const textEl = document.getElementById('notification-text');
        if (!textEl) return;
        
        this.isShowingNotification = true;
        
        // Random welcome messages
        const messages = [
            `<strong>${user.username}</strong> se ha unido a la experiencia 🏎️`,
            `¡Bienvenido <strong>${user.username}</strong>! Nuevo piloto en la parrilla 🏁`,
            `<strong>${user.username}</strong> ha creado su equipo: ${user.teamName || 'Nuevo Equipo'} 🎮`,
            `Nuevo competidor: <strong>${user.username}</strong> ha llegado 🌟`,
            `<strong>${user.username}</strong> está listo para correr 🏆`
        ];
        
        textEl.innerHTML = messages[Math.floor(Math.random() * messages.length)];
        
        // Remove hidden class and fade-out to trigger animation
        this.notificationElement.classList.remove('hidden', 'fade-out');
        
        // Hide after 5 seconds
        setTimeout(() => {
            this.notificationElement.classList.add('fade-out');
            
            setTimeout(() => {
                this.notificationElement.classList.add('hidden');
                this.isShowingNotification = false;
                
                // Process next notification after a small delay
                setTimeout(() => this.processNotificationQueue(), 500);
            }, 500);
        }, 5000);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're not on the race-live page
    if (!window.location.pathname.includes('race-live')) {
        window.newPlayerNotifier = new NewPlayerNotifier();
    }
});
