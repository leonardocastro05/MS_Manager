const fs = require('fs');
const path = './frontend/app/dashboard.html';
let html = fs.readFileSync(path, 'utf8');
html = html.replace(`            <a href="offline.html" class="nav-item">
                <span class="nav-icon">⚽</span>
                <span class="nav-text">Offline</span>
            </a>
            <a href="online.html" class="nav-item">
                <span class="nav-icon">🛒</span>
                <span class="nav-text">Online</span>
            </a>
            <a href="friendly-online.html" class="nav-item">
                <span class="nav-icon">⚙️</span>
                <span class="nav-text">Amistoso</span>
            </a>

            <a href="https://msmanager.duckdns.org/app/online.html#shop" class="nav-item">
                <span class="nav-icon">⚙️</span>
                <span class="nav-text">Tienda</span>
            </a>`, `            <a href="#" class="nav-item" data-section="offline">
                <span class="nav-icon">⚽</span>
                <span class="nav-text">Offline</span>
            </a>
            <a href="#" class="nav-item" data-section="online">
                <span class="nav-icon">🛒</span>
                <span class="nav-text">Online</span>
            </a>
            <a href="#" class="nav-item" data-section="friendly">
                <span class="nav-icon">⚙️</span>
                <span class="nav-text">Amistoso</span>
            </a>

            <a href="#" class="nav-item" data-section="shop">
                <span class="nav-icon">⚙️</span>
                <span class="nav-text">Tienda</span>
            </a>`);
html = html.replace(`<a href="#" class="nav-item active">`, `<a href="#" class="nav-item active" data-section="home">`);
fs.writeFileSync(path, html);
