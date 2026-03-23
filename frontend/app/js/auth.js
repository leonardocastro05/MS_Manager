/**
 * MS Manager - Authentication Controller
 * Gestiona login, registro y validación de formularios
 */

class AuthController {
    constructor() {
        // Elementos del DOM
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.loginMessage = document.getElementById('login-message');
        this.registerMessage = document.getElementById('register-message');
        this.tabs = document.querySelectorAll('.auth-tab');
        
        // Estado
        this.currentTab = 'login';
        this.isSubmitting = false;
        
        // Configuración API - Detectar automáticamente
        this.apiBaseUrl = this.getApiUrl();

        // Inicializar eventos
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
    
    init() {
        this.bindEvents();
        this.setupPasswordStrength();
    }
    
    /**
     * Vincula todos los eventos
     */
    bindEvents() {
        // Tabs
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });
        
        // Formularios
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        
        // Validación en tiempo real
        const inputs = document.querySelectorAll('.auth-form input');
        inputs.forEach(input => {
            input.addEventListener('input', () => this.clearMessage());
            input.addEventListener('blur', () => this.validateField(input));
        });
        
        // Confirmar contraseña
        const confirmPassword = document.getElementById('register-confirm');
        if (confirmPassword) {
            confirmPassword.addEventListener('input', () => this.validatePasswordMatch());
        }
    }
    
    /**
     * Cambia entre tabs de login y registro
     */
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Actualizar tabs activos
        this.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Mostrar/ocultar formularios
        if (tabName === 'login') {
            this.loginForm.classList.remove('hidden');
            this.registerForm.classList.add('hidden');
        } else {
            this.loginForm.classList.add('hidden');
            this.registerForm.classList.remove('hidden');
        }
        
        // Limpiar mensajes
        this.clearMessage();
    }
    
    /**
     * Maneja el envío del formulario de login
     */
    async handleLogin(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        // Validación básica
        if (username.length < 3) {
            this.showMessage('login', 'Por favor, introduce tu nombre de usuario', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('login', 'La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        // Enviar al servidor
        await this.submitForm('login', {
            username,
            password
        });
    }
    
    /**
     * Maneja el envío del formulario de registro
     */
    async handleRegister(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const username = document.getElementById('register-username').value.trim();
        const teamName = document.getElementById('register-team').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        const acceptTerms = document.getElementById('accept-terms').checked;
        
        // Validaciones
        if (username.length < 3) {
            this.showMessage('register', 'El nombre de usuario debe tener al menos 3 caracteres', 'error');
            return;
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            this.showMessage('register', 'El usuario solo puede contener letras, números y guiones bajos', 'error');
            return;
        }
        
        if (!teamName || teamName.length === 0) {
            this.showMessage('register', 'El nombre del equipo es obligatorio', 'error');
            return;
        }
        
        if (email && !this.validateEmail(email)) {
            this.showMessage('register', 'Por favor, introduce un email válido', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('register', 'La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showMessage('register', 'Las contraseñas no coinciden', 'error');
            return;
        }
        
        if (!acceptTerms) {
            this.showMessage('register', 'Debes aceptar los términos y condiciones', 'error');
            return;
        }
        
        // Preparar datos - email es opcional
        const data = { username, teamName, password };
        if (email) data.email = email;
        
        // Enviar al servidor
        await this.submitForm('register', data);
    }
    
    /**
     * Envía el formulario al servidor
     */
    async submitForm(type, data) {
        const button = type === 'login' 
            ? this.loginForm.querySelector('button[type="submit"]')
            : this.registerForm.querySelector('button[type="submit"]');
        
        this.isSubmitting = true;
        button.classList.add('loading');
        
        try {
            const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
            
            const response = await fetch(this.apiBaseUrl + endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                this.showMessage(type, result.message || 'Operación exitosa', 'success');
                
                if (type === 'login' && result.token) {
                    // Guardar token
                    localStorage.setItem('authToken', result.token);
                    
                    // Redirigir al dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else if (type === 'register') {
                    // Cambiar a login después de registro exitoso
                    setTimeout(() => {
                        this.switchTab('login');
                        this.showMessage('login', 'Cuenta creada. ¡Ahora puedes iniciar sesión!', 'success');
                    }, 1500);
                }
            } else {
                this.showMessage(type, result.message || 'Error en la operación', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            this.showMessage(type, 'Error de conexión. Inténtalo de nuevo.', 'error');
        } finally {
            this.isSubmitting = false;
            button.classList.remove('loading');
        }
    }
    
    /**
     * Configura el indicador de fortaleza de contraseña
     */
    setupPasswordStrength() {
        const passwordInput = document.getElementById('register-password');
        const strengthIndicator = document.getElementById('password-strength');
        const strengthText = strengthIndicator.querySelector('.strength-text');
        
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = this.calculatePasswordStrength(password);
            
            // Remover clases anteriores
            strengthIndicator.classList.remove('weak', 'fair', 'good', 'strong');
            
            if (password.length === 0) {
                strengthText.textContent = 'Seguridad de contraseña';
                return;
            }
            
            if (strength < 25) {
                strengthIndicator.classList.add('weak');
                strengthText.textContent = 'Muy débil';
            } else if (strength < 50) {
                strengthIndicator.classList.add('fair');
                strengthText.textContent = 'Débil';
            } else if (strength < 75) {
                strengthIndicator.classList.add('good');
                strengthText.textContent = 'Buena';
            } else {
                strengthIndicator.classList.add('strong');
                strengthText.textContent = 'Muy fuerte';
            }
        });
    }
    
    /**
     * Calcula la fortaleza de la contraseña
     */
    calculatePasswordStrength(password) {
        let strength = 0;
        
        // Longitud
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 10;
        if (password.length >= 16) strength += 10;
        
        // Mayúsculas
        if (/[A-Z]/.test(password)) strength += 15;
        
        // Minúsculas
        if (/[a-z]/.test(password)) strength += 10;
        
        // Números
        if (/[0-9]/.test(password)) strength += 15;
        
        // Caracteres especiales
        if (/[^A-Za-z0-9]/.test(password)) strength += 15;
        
        return Math.min(100, strength);
    }
    
    /**
     * Valida que las contraseñas coincidan
     */
    validatePasswordMatch() {
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;
        const confirmInput = document.getElementById('register-confirm');
        
        if (confirmPassword.length > 0) {
            if (password === confirmPassword) {
                confirmInput.style.borderColor = 'rgba(0, 255, 136, 0.5)';
            } else {
                confirmInput.style.borderColor = 'rgba(255, 68, 68, 0.5)';
            }
        }
    }
    
    /**
     * Valida un campo individual
     */
    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        
        if (type === 'email' && value) {
            if (!this.validateEmail(value)) {
                input.style.borderColor = 'rgba(255, 68, 68, 0.5)';
            }
        }
    }
    
    /**
     * Valida formato de email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    /**
     * Muestra un mensaje en el formulario
     */
    showMessage(type, message, messageType) {
        const messageEl = type === 'login' ? this.loginMessage : this.registerMessage;
        
        messageEl.textContent = message;
        messageEl.className = 'form-message ' + messageType;
        
        // Auto-ocultar mensajes de éxito
        if (messageType === 'success') {
            setTimeout(() => {
                messageEl.className = 'form-message';
            }, 5000);
        }
    }
    
    /**
     * Limpia los mensajes
     */
    clearMessage() {
        this.loginMessage.className = 'form-message';
        this.registerMessage.className = 'form-message';
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.authController = new AuthController();
});
