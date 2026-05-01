const fs = require('fs');
let html = fs.readFileSync('frontend/app/dashboard.html', 'utf8');
html = html.replace(`        <nav class="header-nav">
            <a href="#" class="nav-item active" data-section="home">
                <span class="nav-icon">🏠</span>
                <span class="nav-text">Inicio</span>
            </a>
            <a href="offline.html" class="nav-item">
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
            </a>
        </nav>`, `        <nav class="header-nav">
            <a href="#" class="nav-item active" data-section="home">
                <span class="nav-icon">🏠</span>
                <span class="nav-text">Inicio</span>
            </a>
            <a href="#" class="nav-item" data-section="offline">
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
            </a>
        </nav>`);
fs.writeFileSync('frontend/app/dashboard.html', html);
