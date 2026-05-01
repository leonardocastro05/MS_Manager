const fs = require('fs');
let content = fs.readFileSync('frontend/app/dashboard.html', 'utf-8');
content = content.replace('href="offline.html" class="nav-item"', 'href="#" class="nav-item" data-section="offline"');
content = content.replace('href="online.html" class="nav-item"', 'href="#" class="nav-item" data-section="online"');
content = content.replace('href="friendly-online.html" class="nav-item"', 'href="#" class="nav-item" data-section="friendly"');
content = content.replace('href="https://msmanager.duckdns.org/app/online.html#shop" class="nav-item"', 'href="#" class="nav-item" data-section="shop"');
fs.writeFileSync('frontend/app/dashboard.html', content);
