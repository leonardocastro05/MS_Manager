/**
 * MS Manager - Intro/Loading Screen Controller
 * Gestiona la animación de carga y transición al login
 */

class IntroController {
    constructor() {
        this.introScreen = document.getElementById('intro-screen');
        this.authScreen = document.getElementById('auth-screen');
        this.loadingProgress = document.getElementById('loading-progress');
        this.loadingText = document.getElementById('loading-text');
        this.particlesContainer = document.getElementById('particles');
        
        this.isLoading = true;
        this.loadingComplete = false;
        this.progress = 0;
        
        this.loadingMessages = [
            'Inicializando sistemas...',
            'Cargando módulos de seguridad...',
            'Estableciendo conexión...',
            'Verificando integridad...',
            'Preparando interfaz...',
            'Sistema listo'
        ];
        
        this.init();
    }
    
    init() {
        this.createParticles();
        this.startLoading();
        this.bindEvents();
    }
    
    /**
     * Crea partículas decorativas animadas
     */
    createParticles() {
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Posición aleatoria horizontal
            particle.style.left = Math.random() * 100 + '%';
            
            // Delay aleatorio para que no aparezcan todas a la vez
            particle.style.animationDelay = Math.random() * 4 + 's';
            
            // Tamaño aleatorio
            const size = Math.random() * 4 + 2;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Color aleatorio entre cyan y verde
            const hue = Math.random() * 60 + 160; // 160-220 (cyan a verde)
            particle.style.background = `hsl(${hue}, 100%, 50%)`;
            particle.style.boxShadow = `0 0 ${size * 2}px hsl(${hue}, 100%, 50%)`;
            
            this.particlesContainer.appendChild(particle);
        }
    }
    
    /**
     * Simula el proceso de carga
     */
    startLoading() {
        const loadingDuration = 3000; // 3 segundos de carga
        const updateInterval = 50;
        const steps = loadingDuration / updateInterval;
        const progressIncrement = 100 / steps;
        
        let currentStep = 0;
        
        const loadingInterval = setInterval(() => {
            // Incremento con algo de variación para parecer más realista
            const variance = (Math.random() - 0.5) * 2;
            this.progress = Math.min(100, this.progress + progressIncrement + variance);
            
            // Actualizar barra de progreso
            this.loadingProgress.style.width = this.progress + '%';
            
            // Actualizar texto de carga
            const messageIndex = Math.floor((this.progress / 100) * (this.loadingMessages.length - 1));
            this.loadingText.textContent = this.loadingMessages[messageIndex];
            
            currentStep++;
            
            if (this.progress >= 100) {
                clearInterval(loadingInterval);
                this.loadingProgress.style.width = '100%';
                this.loadingText.textContent = this.loadingMessages[this.loadingMessages.length - 1];
                this.loadingComplete = true;
                
                // Añadir efecto visual de completado
                this.loadingProgress.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.8)';
                this.loadingProgress.style.background = 'linear-gradient(90deg, #00ff88, #00f7ff, #00ff88)';
            }
        }, updateInterval);
    }
    
    /**
     * Vincula eventos de teclado y click
     */
    bindEvents() {
        // Transición al presionar cualquier tecla
        document.addEventListener('keydown', (e) => {
            if (this.loadingComplete && this.isLoading) {
                this.transitionToAuth();
            }
        });
        
        // Transición al hacer click
        this.introScreen.addEventListener('click', () => {
            if (this.loadingComplete && this.isLoading) {
                this.transitionToAuth();
            }
        });
        
        // Botón volver a intro
        const backButton = document.getElementById('back-to-intro');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.transitionToIntro();
            });
        }
    }
    
    /**
     * Transición de intro a pantalla de auth
     */
    transitionToAuth() {
        if (!this.isLoading) return;
        this.isLoading = false;
        
        // Efecto de sonido (opcional - descomentar si se añade audio)
        // this.playTransitionSound();
        
        // Fade out de la intro
        this.introScreen.classList.add('fade-out');
        
        // Mostrar auth después de la transición
        setTimeout(() => {
            this.introScreen.style.display = 'none';
            this.authScreen.classList.remove('hidden');
            
            // Trigger reflow para la animación
            void this.authScreen.offsetWidth;
            this.authScreen.classList.add('visible');
        }, 800);
    }
    
    /**
     * Volver a la intro desde auth
     */
    transitionToIntro() {
        this.authScreen.classList.remove('visible');
        
        setTimeout(() => {
            this.authScreen.classList.add('hidden');
            this.introScreen.style.display = 'flex';
            this.introScreen.classList.remove('fade-out');
            this.isLoading = true;
        }, 500);
    }
    
    /**
     * Reproduce sonido de transición (opcional)
     */
    playTransitionSound() {
        // Crear un sonido simple con Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.introController = new IntroController();
});
