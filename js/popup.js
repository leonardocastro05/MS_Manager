// ============================================
// SISTEMA DE POP-UPS PERSONALITZATS
// ============================================

/**
 * Mostra un pop-up personalitzat
 * @param {Object} options - Opcions del pop-up
 * @param {string} options.title - Títol del pop-up
 * @param {string} options.message - Missatge del pop-up
 * @param {string} options.type - Tipus: 'success', 'error', 'warning', 'info', 'confirm'
 * @param {Function} options.onConfirm - Callback si l'usuari confirma (només per type='confirm')
 * @param {Function} options.onCancel - Callback si l'usuari cancel·la
 */
function showCustomPopup(options) {
    // Eliminar pop-up anterior si existeix
    const existingPopup = document.getElementById('custom-popup-overlay');
    if (existingPopup) {
        existingPopup.remove();
    }

    const {
        title = '⚠️ Atención',
        message = '',
        type = 'info',
        onConfirm = null,
        onCancel = null,
        confirmText = 'Aceptar',
        cancelText = 'Cancelar'
    } = options;

    // Definir colors i icones segons tipus
    const typeConfig = {
        success: {
            icon: '✅',
            color: '#2ecc40',
            gradient: 'linear-gradient(135deg, #2ecc40 0%, #27ae60 100%)'
        },
        error: {
            icon: '❌',
            color: '#e74c3c',
            gradient: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
        },
        warning: {
            icon: '⚠️',
            color: '#ff9800',
            gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
        },
        info: {
            icon: 'ℹ️',
            color: '#3498db',
            gradient: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)'
        },
        confirm: {
            icon: '❓',
            color: '#FFD700',
            gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
        }
    };

    const config = typeConfig[type] || typeConfig.info;
    const isConfirm = type === 'confirm';

    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'custom-popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease;
    `;

    // Crear pop-up
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: linear-gradient(135deg, #232526 0%, #1a1a2e 100%);
        border: 3px solid ${config.color};
        border-radius: 20px;
        padding: 0;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px ${config.color}40;
        animation: popupSlideIn 0.3s ease;
        position: relative;
        overflow: hidden;
    `;

    // Header amb gradient
    const header = document.createElement('div');
    header.style.cssText = `
        background: ${config.gradient};
        padding: 25px;
        text-align: center;
        border-bottom: 2px solid ${config.color};
    `;
    header.innerHTML = `
        <div style="font-size: 3em; margin-bottom: 10px;">${config.icon}</div>
        <h2 style="color: white; margin: 0; font-size: 1.5em; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${title}</h2>
    `;

    // Cos del missatge
    const body = document.createElement('div');
    body.style.cssText = `
        padding: 30px;
        color: #ffffff;
        font-size: 1.1em;
        line-height: 1.6;
        text-align: center;
    `;
    body.innerHTML = message.replace(/\n/g, '<br>');

    // Footer amb botons
    const footer = document.createElement('div');
    footer.style.cssText = `
        padding: 20px 30px;
        display: flex;
        gap: 15px;
        justify-content: center;
        background: rgba(0, 0, 0, 0.2);
    `;

    if (isConfirm) {
        // Botó de cancel·lar
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = cancelText;
        cancelBtn.style.cssText = `
            flex: 1;
            padding: 15px 30px;
            font-size: 1.1em;
            font-weight: bold;
            background: linear-gradient(90deg, #666 0%, #888 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        cancelBtn.onmouseover = () => {
            cancelBtn.style.transform = 'translateY(-2px)';
            cancelBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.5)';
        };
        cancelBtn.onmouseout = () => {
            cancelBtn.style.transform = 'translateY(0)';
            cancelBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        };
        cancelBtn.onclick = () => {
            closePopup();
            if (onCancel) onCancel();
        };
        footer.appendChild(cancelBtn);

        // Botó de confirmar
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = confirmText;
        confirmBtn.style.cssText = `
            flex: 1;
            padding: 15px 30px;
            font-size: 1.1em;
            font-weight: bold;
            background: ${config.gradient};
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px ${config.color}60;
        `;
        confirmBtn.onmouseover = () => {
            confirmBtn.style.transform = 'translateY(-2px)';
            confirmBtn.style.boxShadow = `0 6px 20px ${config.color}80`;
        };
        confirmBtn.onmouseout = () => {
            confirmBtn.style.transform = 'translateY(0)';
            confirmBtn.style.boxShadow = `0 4px 12px ${config.color}60`;
        };
        confirmBtn.onclick = () => {
            closePopup();
            if (onConfirm) onConfirm();
        };
        footer.appendChild(confirmBtn);
    } else {
        // Només botó d'acceptar
        const okBtn = document.createElement('button');
        okBtn.textContent = confirmText;
        okBtn.style.cssText = `
            flex: 1;
            max-width: 200px;
            padding: 15px 30px;
            font-size: 1.1em;
            font-weight: bold;
            background: ${config.gradient};
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px ${config.color}60;
        `;
        okBtn.onmouseover = () => {
            okBtn.style.transform = 'translateY(-2px)';
            okBtn.style.boxShadow = `0 6px 20px ${config.color}80`;
        };
        okBtn.onmouseout = () => {
            okBtn.style.transform = 'translateY(0)';
            okBtn.style.boxShadow = `0 4px 12px ${config.color}60`;
        };
        okBtn.onclick = () => {
            closePopup();
            if (onConfirm) onConfirm();
        };
        footer.appendChild(okBtn);
    }

    // Construir pop-up
    popup.appendChild(header);
    popup.appendChild(body);
    popup.appendChild(footer);
    overlay.appendChild(popup);

    // Tancar en clicar l'overlay (només si no és confirm)
    if (!isConfirm) {
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                closePopup();
            }
        };
    }

    // Afegir animacions CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes popupSlideIn {
            from {
                opacity: 0;
                transform: scale(0.8) translateY(-50px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // Afegir al DOM
    document.body.appendChild(overlay);

    function closePopup() {
        overlay.style.animation = 'fadeIn 0.2s ease reverse';
        popup.style.animation = 'popupSlideIn 0.2s ease reverse';
        setTimeout(() => {
            overlay.remove();
        }, 200);
    }
}

// Funcions d'ajuda ràpides
function showSuccess(title, message, onConfirm) {
    showCustomPopup({ title, message, type: 'success', onConfirm });
}

function showError(title, message, onConfirm) {
    showCustomPopup({ title, message, type: 'error', onConfirm });
}

function showWarning(title, message, onConfirm) {
    showCustomPopup({ title, message, type: 'warning', onConfirm });
}

function showInfo(title, message, onConfirm) {
    showCustomPopup({ title, message, type: 'info', onConfirm });
}

function showConfirm(title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar') {
    showCustomPopup({ title, message, type: 'confirm', onConfirm, onCancel, confirmText, cancelText });
}
