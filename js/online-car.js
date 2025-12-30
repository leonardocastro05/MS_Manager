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
    user.data.online.carConfig = { color, finish };
    saveUserData(user.data);
    loadCarCustomization();
}

/**
 * Carrega el formulari de personalització del monoplaza
 */
function loadCarCustomization() {
    const upgradesDiv = document.getElementById('online-car-upgrades-list');
    if (!upgradesDiv) return;
    const user = getCurrentUser();
    if (!user || !user.data.online) return;
    const car = user.data.online.carConfig || { color: '#FFD700', finish: 'brillant' };
    upgradesDiv.innerHTML = `
        <div class="shop-card" style="min-width:220px;">
            <b>🎨 Personalitza el teu monoplaza</b><br>
            <label>Color:<br><input type="color" id="car-color" value="${car.color}"></label><br>
            <label>Acabat:<br>
                <select id="car-finish">
                    <option value="mate" ${car.finish==='mate'?'selected':''}>Mate</option>
                    <option value="brillant" ${car.finish==='brillant'?'selected':''}>Brillant</option>
                </select>
            </label><br>
            <button onclick="saveOnlineCarConfig(document.getElementById('car-color').value, document.getElementById('car-finish').value)">Desar</button>
        </div>
        <div class="shop-card" style="background:${car.color};color:#232526;min-width:120px;">
            <b>Vista prèvia</b><br>
            <span style="font-style:italic;">${car.finish==='mate'?'Acabat mate':'Acabat brillant'}</span>
            <div style="width:60px;height:32px;border-radius:12px;margin:12px auto 0 auto;background:${car.color};box-shadow:${car.finish==='brillant'?'0 0 16px #fff8':'none'};"></div>
        </div>
    `;
}

// Inicialitza listeners
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        loadCarCustomization();
    });
}
