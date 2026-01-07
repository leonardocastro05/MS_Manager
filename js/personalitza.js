// js/personalitza.js
// Permet personalitzar el monoplaza F1 en temps real amb disseny realista

let carColors = {
    body: '#FFD700'  // Només color principal - més simple per a un joc 2D
};

/**
 * Dibuixa un monoplaza F1 modern i realista
 * Inclou: Halo, pontons, difusor, alerons detallats, suspensió
 */
function drawF1Car(ctx, colors, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w/2, h/2);
    ctx.scale(w/500, h/250);
    
    const bodyColor = colors.body;
    
    // === PONTONS LATERALS (Sidepods) ===
    ctx.fillStyle = bodyColor;
    ctx.globalAlpha = 0.85;
    // Ponton esquerre
    ctx.beginPath();
    ctx.moveTo(-30, -35);
    ctx.lineTo(80, -35);
    ctx.lineTo(90, -25);
    ctx.lineTo(90, -20);
    ctx.lineTo(-30, -20);
    ctx.closePath();
    ctx.fill();
    // Ponton dret
    ctx.beginPath();
    ctx.moveTo(-30, 35);
    ctx.lineTo(80, 35);
    ctx.lineTo(90, 25);
    ctx.lineTo(90, 20);
    ctx.lineTo(-30, 20);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // === COS PRINCIPAL (Monocoque) ===
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-150, 0);
    ctx.lineTo(-80, -15);
    ctx.lineTo(100, -15);
    ctx.lineTo(130, -8);
    ctx.lineTo(140, 0);
    ctx.lineTo(130, 8);
    ctx.lineTo(100, 15);
    ctx.lineTo(-80, 15);
    ctx.closePath();
    ctx.fill();
    
    // Ombra del cos
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(-150, 0);
    ctx.lineTo(-80, 10);
    ctx.lineTo(100, 10);
    ctx.lineTo(140, 0);
    ctx.lineTo(100, 15);
    ctx.lineTo(-80, 15);
    ctx.closePath();
    ctx.fill();
    
    // === HALO (Protecció del pilot) ===
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(20, 0, 25, Math.PI, 0, false);
    ctx.stroke();
    // Suports del halo
    ctx.beginPath();
    ctx.moveTo(-5, 25);
    ctx.lineTo(-5, 12);
    ctx.moveTo(45, 25);
    ctx.lineTo(45, 12);
    ctx.stroke();
    
    // === CABINA (Cockpit) amb cristall ===
    ctx.fillStyle = 'rgba(100, 150, 200, 0.6)'; // Vidre blau
    ctx.beginPath();
    ctx.ellipse(15, 0, 35, 18, 0, 0, 2*Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // === MUS DEL PILOT (Helmet) ===
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(20, 0, 10, 0, 2*Math.PI);
    ctx.fill();
    
    // === ALERÓ DAVANTER (Front wing) - Molt detallat ===
    const wingColor = '#1a1a1a';
    ctx.fillStyle = wingColor;
    // Placa principal
    ctx.fillRect(-180, -32, 35, 64);
    // Elements (flaps)
    ctx.fillStyle = bodyColor;
    for (let i = 0; i < 3; i++) {
        const offset = -28 + i * 20;
        ctx.fillRect(-175, offset, 28, 14);
    }
    // Endplates
    ctx.fillStyle = wingColor;
    ctx.beginPath();
    ctx.moveTo(-180, -32);
    ctx.lineTo(-190, -28);
    ctx.lineTo(-190, 28);
    ctx.lineTo(-180, 32);
    ctx.closePath();
    ctx.fill();
    
    // === ALERÓ POSTERIOR (Rear wing) ===
    ctx.fillStyle = wingColor;
    // Suports (pylons)
    ctx.fillRect(130, -5, 8, -30);
    ctx.fillRect(130, 5, 8, 30);
    // Ales superiors
    ctx.fillRect(130, -35, 45, 8);
    ctx.fillRect(130, 27, 45, 8);
    // Element central
    ctx.fillStyle = bodyColor;
    ctx.fillRect(132, -25, 40, 6);
    ctx.fillRect(132, 19, 40, 6);
    
    // === DRS (Reductor de resistència) ===
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(130, -35, 45, 8);
    ctx.setLineDash([]);
    
    // === DIFUSOR POSTERIOR ===
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.moveTo(100, -18);
    ctx.lineTo(140, -12);
    ctx.lineTo(140, 12);
    ctx.lineTo(100, 18);
    ctx.closePath();
    ctx.fill();
    // Detalls del difusor (canals)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i += 5) {
        ctx.beginPath();
        ctx.moveTo(105, i);
        ctx.lineTo(135, i * 0.7);
        ctx.stroke();
    }
    
    // === RODES amb pneumàtics detallats ===
    const wheelPositions = [
        { x: -120, y: -40 },  // Davant esquerra
        { x: -120, y: 40 },   // Davant dreta
        { x: 110, y: -40 },   // Darrere esquerra
        { x: 110, y: 40 }     // Darrere dreta
    ];
    
    wheelPositions.forEach(pos => {
        // Pneumàtic
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, 18, 18, 0, 0, 2*Math.PI);
        ctx.fill();
        
        // Llanta
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, 12, 12, 0, 0, 2*Math.PI);
        ctx.fill();
        
        // Detall llanta (radis)
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 3) {
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(pos.x + Math.cos(angle) * 10, pos.y + Math.sin(angle) * 10);
            ctx.stroke();
        }
        
        // Disc de fre
        ctx.fillStyle = '#ff4400';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, 6, 6, 0, 0, 2*Math.PI);
        ctx.fill();
    });
    
    // === SUSPENSIÓ VISIBLE ===
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    // Davant
    ctx.beginPath();
    ctx.moveTo(-120, -40);
    ctx.lineTo(-90, -15);
    ctx.moveTo(-120, 40);
    ctx.lineTo(-90, 15);
    ctx.stroke();
    // Darrere
    ctx.beginPath();
    ctx.moveTo(110, -40);
    ctx.lineTo(90, -15);
    ctx.moveTo(110, 40);
    ctx.lineTo(90, 15);
    ctx.stroke();
    
    // === DETALLS FINALS ===
    // Número del cotxe
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('1', 20, 5);
    
    // Reflexos brillants
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-50, -8, 40, 6, -0.2, 0, 2*Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(60, -10, 30, 4, -0.1, 0, 2*Math.PI);
    ctx.fill();
    
    ctx.restore();
}

function updateCarColor(part, value) {
    carColors[part] = value;
    const canvas = document.getElementById('car-canvas');
    if (canvas) drawF1Car(canvas.getContext('2d'), carColors, canvas.width, canvas.height);
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('car-canvas');
    if (canvas) {
        drawF1Car(canvas.getContext('2d'), carColors, canvas.width, canvas.height);
    }
    
    // Només un selector de color principal
    const bodyInput = document.getElementById('color-body');
    if (bodyInput) {
        bodyInput.addEventListener('input', e => updateCarColor('body', e.target.value));
    }
});
