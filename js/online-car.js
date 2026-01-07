// ============================================
// Personalització del Monoplaza Online
// ============================================

/**
 * Desa la configuració de color del monoplaza online
 * @param {string} color - Hex color
 * @param {string} finish - Acabat ('mate' o 'brillant')
 */
function saveOnlineCarConfig(color, finish) {
    const user = getCurrentUser();
    if (!user) return;
    if (!user.data.online) initializeOnlineData(user);
    
    // Comprovar si és el primer canvi (GRATIS)
    const isFirstChange = !user.data.online.carConfig || !user.data.online.carConfigChanged;
    
    if (!isFirstChange) {
        // Comprovar que té coins
        if (!user.data.online.coins || user.data.online.coins < 1) {
            showWarning('⚠️ No tens prou coins!', 'Necessites <b>1 coin</b> per canviar el color del monoplaza.<br><br>Compra coins a la tenda! 💰');
            return;
        }
        
        // Descomptar 1 coin
        user.data.online.coins -= 1;
    }
    
    user.data.online.carConfig = { color, finish };
    user.data.online.carConfigChanged = true; // Marcar que ja ha fet un canvi
    
    saveUserData(user.data);
    updateUserInfo();
    if (typeof refreshOnlineUI === 'function') refreshOnlineUI();
    // loadCarCustomization(); // DESACTIVAT: No es mostra en 2D
    
    const costMsg = isFirstChange ? '🎁 GRATIS (primer canvi)' : '💰 -1 coin';
    showSuccess('✅ Monoplaza Guardat!', `🎨 Color: <b>${color}</b><br>✨ Acabat: <b>${finish}</b><br><br>${costMsg}`);
}

/**
 * Actualitza el preview del monoplaza en temps real
 */
function updateCarPreview() {
    const color = document.getElementById('car-color').value;
    const finish = document.getElementById('car-finish').value;
    
    // Aplicar el color a la imatge del canvas
    applyColorToCarImage(color, finish);
    
    // Actualitzar text informatiu
    const finishText = document.getElementById('finish-text');
    if (finishText) {
        finishText.textContent = finish === 'mate' ? '✨ Acabat Mate' : '💎 Acabat Brillant';
    }
}

/**
 * Aplica el color a la imatge del monoplaza utilitzant canvas
 */
function applyColorToCarImage(hexColor, finish) {
    const canvas = document.getElementById('f1-car-canvas');
    const sourceImg = document.getElementById('f1-car-source');
    
    if (!canvas || !sourceImg) return;
    
    const ctx = canvas.getContext('2d');
    
    // Esperar que la imatge estigui carregada
    if (!sourceImg.complete) {
        sourceImg.onload = () => applyColorToCarImage(hexColor, finish);
        return;
    }
    
    // Ajustar mida del canvas
    canvas.width = sourceImg.naturalWidth;
    canvas.height = sourceImg.naturalHeight;
    
    // Dibuixar imatge original
    ctx.drawImage(sourceImg, 0, 0);
    
    // Obtenir dades de píxels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convertir hex a RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Aplicar tint de color a cada píxel
    for (let i = 0; i < data.length; i += 4) {
        // Obtenir luminositat del píxel original
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const luminosity = gray / 255;
        
        // Mantenir píxels molt foscos (rodes, cockpit) i molt clars (reflexos)
        if (luminosity < 0.15 || luminosity > 0.85) {
            continue; // No modificar píxels molt foscos o molt clars
        }
        
        // Aplicar color mantenint la luminositat
        const intensity = finish === 'brillant' ? 0.75 : 0.6;
        
        data[i] = data[i] * (1 - intensity) + r * intensity * luminosity;     // R
        data[i + 1] = data[i + 1] * (1 - intensity) + g * intensity * luminosity; // G
        data[i + 2] = data[i + 2] * (1 - intensity) + b * intensity * luminosity; // B
    }
    
    // Aplicar filtres segons acabat
    if (finish === 'brillant') {
        // Augmentar lluminositat per acabat brillant
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * 1.1);
            data[i + 1] = Math.min(255, data[i + 1] * 1.1);
            data[i + 2] = Math.min(255, data[i + 2] * 1.1);
        }
    } else {
        // Reduir lluminositat per acabat mat
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] * 0.9;
            data[i + 1] = data[i + 1] * 0.9;
            data[i + 2] = data[i + 2] * 0.9;
        }
    }
    
    // Redibuixar amb els canvis
    ctx.putImageData(imageData, 0, 0);
}

/**
 * Carrega el formulari de personalització del monoplaza
 * NOTA: Funció desactivada - El joc és 2D i no es veuen els colors
 */
/*
function loadCarCustomization() {
    const upgradesDiv = document.getElementById('online-car-upgrades-list');
    if (!upgradesDiv) return;
    const user = getCurrentUser();
    if (!user || !user.data.online) return;
    
    const car = user.data.online.carConfig || { color: '#FFD700', finish: 'brillant' };
    const isFirstChange = !user.data.online.carConfigChanged;
    const costText = isFirstChange ? '🎁 GRATIS (primer canvi)' : '💰 1 coin';
    
    upgradesDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h3 style="color: #FFD700; margin-bottom: 10px;">🏎️ Personalitza el teu Monoplaza</h3>
            <p style="color: #aaa; font-size: 0.9em;">Els canvis es veuen en temps real!</p>
        </div>
        
        <!-- MONOPLAZA VISUAL -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; border-radius: 20px; margin-bottom: 30px; border: 2px solid rgba(255, 215, 0, 0.3); position: relative; overflow: hidden;">
            <!-- Efecte de pista de fons -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, transparent 2px, transparent 20px); pointer-events: none;"></div>
            
            <!-- Canvas per al monoplaza amb color modificable -->
            <div style="position: relative; z-index: 1; text-align: center;">
                <canvas id="f1-car-canvas" style="max-width: 600px; width: 100%; height: auto; filter: drop-shadow(0 8px 20px rgba(0,0,0,0.6));"></canvas>
                <img id="f1-car-source" src="img/monoplaza.jpg" style="display: none;">
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #FFD700; font-weight: bold; font-size: 1.1em;">
                <span id="finish-text">${car.finish === 'mate' ? '✨ Acabat Mate' : '💎 Acabat Brillant'}</span>
            </div>
        </div>
        
        <!-- CONTROLS -->
        <div style="background: linear-gradient(135deg, rgba(35, 37, 38, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%); padding: 30px; border-radius: 16px; border: 2px solid rgba(255, 215, 0, 0.2);">
            <div style="margin-bottom: 25px;">
                <label style="display: block; color: #FFD700; font-weight: bold; margin-bottom: 10px; font-size: 1.1em;">
                    🎨 Color del Monoplaza
                </label>
                <input type="color" id="car-color" value="${car.color}" 
                       oninput="updateCarPreview()"
                       style="width: 100%; height: 60px; cursor: pointer; border: 3px solid #FFD700; border-radius: 8px;">
            </div>
            
            <div style="margin-bottom: 25px;">
                <label style="display: block; color: #FFD700; font-weight: bold; margin-bottom: 10px; font-size: 1.1em;">
                    ✨ Acabat de la Pintura
                </label>
                <select id="car-finish" onchange="updateCarPreview()"
                        style="width: 100%; padding: 15px; font-size: 1em; border: 2px solid #FFD700; border-radius: 8px; background: #232526; color: white; cursor: pointer;">
                    <option value="mate" ${car.finish==='mate'?'selected':''}>Mate (Discret)</option>
                    <option value="brillant" ${car.finish==='brillant'?'selected':''}>Brillant (Reflectant)</option>
                </select>
            </div>
            
            <button onclick="saveOnlineCarConfig(document.getElementById('car-color').value, document.getElementById('car-finish').value)"
                    style="width: 100%; padding: 18px; font-size: 1.2em; font-weight: bold; background: linear-gradient(90deg, #00a000 0%, #2ecc40 100%); color: white; border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(46, 204, 64, 0.3);"
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(46, 204, 64, 0.5)';"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(46, 204, 64, 0.3)';">
                💾 Desar Canvis (${costText})
            </button>
            
            <p style="text-align: center; color: #888; font-size: 0.85em; margin-top: 15px;">
                ${isFirstChange ? '🎁 El primer canvi és completament gratis!' : '💰 Cada canvi costa 1 coin'}
            </p>
        </div>
    `;
    
    // Inicialitzar el canvas amb la imatge
    setTimeout(() => {
        const color = document.getElementById('car-color').value;
        const finish = document.getElementById('car-finish').value;
        applyColorToCarImage(color, finish);
    }, 100);
}
*/

// Inicialitza listeners
// DESACTIVAT: No es mostra la personalització visual en 2D
/*
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        loadCarCustomization();
    });
}
*/
