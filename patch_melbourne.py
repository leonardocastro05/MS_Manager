with open("frontend/app/js/race.js") as f:
    rjs = f.read()

# Add else if for melbourne
rjs = rjs.replace(
    "} else if (this.config.trackId === 'leoverse') {\n                this._drawLeoverseDecoration(ctx);\n            }",
    "} else if (this.config.trackId === 'leoverse') {\n                this._drawLeoverseDecoration(ctx);\n            } else if (this.config.trackId === 'melbourne') {\n                this._drawMelbourneDecoration(ctx);\n            }"
)

melbourne_bg = """
        _drawMelbourneDecoration(ctx) {
            // High quality 2D environment based on Albert Park satellite data
            const w = this.width;
            const h = this.height;

            // 1. Grass Base Gradient
            const grassGlow = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w);
            grassGlow.addColorStop(0, '#2d5a3f');
            grassGlow.addColorStop(0.7, '#1f402c');
            grassGlow.addColorStop(1, '#152b1d');
            ctx.fillStyle = grassGlow;
            ctx.fillRect(0, 0, w, h);

            // 2. The Golf Course (Center/Top/Right)
            ctx.save();
            ctx.filter = 'blur(' + (w * 0.025) + 'px)';
            
            // Light grass patches
            ctx.fillStyle = 'rgba(74, 128, 85, 0.4)';
            ctx.beginPath(); ctx.ellipse(w * 0.45, h * 0.25, w * 0.2, h * 0.15, -0.2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(w * 0.8, h * 0.2, w * 0.15, h * 0.1, 0.3, 0, Math.PI * 2); ctx.fill();
            
            // Sand bunkers
            ctx.fillStyle = '#bfa571';
            const bunkers = [
                [0.45, 0.25, 0.015, 0.008], [0.52, 0.28, 0.02, 0.01], [0.55, 0.35, 0.01, 0.008],
                [0.4, 0.33, 0.025, 0.012], [0.35, 0.22, 0.018, 0.011], [0.78, 0.18, 0.015, 0.01],
                [0.82, 0.25, 0.02, 0.009]
            ];
            bunkers.forEach(b => {
                ctx.beginPath();
                ctx.ellipse(w * b[0], h * b[1], w * b[2], h * b[3], 0.3, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();

            // 3. Albert Park Lake (Central huge water body extending Ascari to Lauda)
            ctx.save();
            const lakeGrad = ctx.createRadialGradient(w*0.5, h*0.5, 0, w*0.5, h*0.5, w*0.5);
            lakeGrad.addColorStop(0, '#51819c');
            lakeGrad.addColorStop(0.5, '#355b73');
            lakeGrad.addColorStop(1, '#203947');
            ctx.fillStyle = lakeGrad;

            // Draw organic lake boundaries simulating the reference completely 
            ctx.beginPath();
            ctx.moveTo(w * 0.65, h * 0.3);
            ctx.bezierCurveTo(w*0.8, h*0.35, w*0.92, h*0.4, w*0.9, h*0.55); // Ascari edge
            ctx.bezierCurveTo(w*0.8, h*0.65, w*0.4, h*0.7, w*0.25, h*0.68); // Brabham bottom sweep
            ctx.bezierCurveTo(w*0.12, h*0.5, w*0.15, h*0.35, w*0.25, h*0.25); // Lauda edge
            ctx.bezierCurveTo(w*0.4, h*0.1, w*0.5, h*0.25, w*0.65, h*0.3); // Top corner closure
            ctx.fill();

            // The Island inside the lake (left side)
            ctx.fillStyle = '#224a2f';
            ctx.beginPath();
            ctx.ellipse(w * 0.28, h * 0.38, w * 0.04, h * 0.02, 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Very subtle lake ripples
            ctx.strokeStyle = 'rgba(255,255,255,0.06)';
            ctx.lineWidth = 1.5;
            for(let i=0; i<12; i++) {
                ctx.beginPath();
                let ly = h * (0.35 + i*0.025);
                ctx.moveTo(w * 0.25, ly);
                ctx.bezierCurveTo(w * 0.5, ly - h*0.02, w * 0.7, ly, w * 0.85, ly - h*0.03);
                ctx.stroke();
            }
            ctx.restore();

            // 4. Urban Areas & Paddock/Stadiums
            ctx.fillStyle = 'rgba(200, 200, 210, 0.1)'; // Light asphalt / concrete
            // Paddock / Pit lane blocks
            ctx.fillRect(w * 0.4, h * 0.8, w * 0.3, h * 0.03); // main paddock
            ctx.fillRect(w * 0.5, h * 0.84, w * 0.1, h * 0.04);
            
            // Outer grey roads (St. Kilda Rd, Kings Way) randomly outlining
            ctx.strokeStyle = 'rgba(120, 125, 130, 0.15)';
            ctx.lineWidth = w * 0.01;
            ctx.beginPath();
            ctx.moveTo(w * 0.05, h * 0.1); ctx.lineTo(w * 0.1, h * 0.9);
            ctx.moveTo(w * 0.95, h * 0.1); ctx.lineTo(w * 0.85, h * 0.9);
            ctx.stroke();

            // Lauda corner Stadium
            ctx.save();
            ctx.translate(w * 0.13, h * 0.45);
            ctx.rotate(-0.1);
            ctx.fillStyle = 'rgba(160, 160, 160, 0.15)';
            ctx.fillRect(0, 0, w * 0.06, h * 0.08); // Base structure
            ctx.strokeStyle = 'rgba(250, 250, 250, 0.25)';
            ctx.lineWidth = 1;
            ctx.strokeRect(w * 0.01, h * 0.015, w * 0.04, h * 0.05); // Open roof
            ctx.restore();

            // 5. Trees Map (Clusters mapping satellite image)
            // Creating hundreds of trees organically distributed
            ctx.save();
            ctx.globalAlpha = 0.85;
            const treeZones = [
                // Behind start/finish (bottom)
                [0.1, 0.82, 0.8, 0.15, 180],
                // Inside track borders, around Brabham
                [0.2, 0.7, 0.2, 0.08, 60],
                // Between Wait and Hill
                [0.6, 0.4, 0.15, 0.1, 50],
                // Behind Ascari/Stewart (Right side)
                [0.85, 0.5, 0.1, 0.3, 90],
                // Top section near Golf Course/Marina
                [0.1, 0.05, 0.3, 0.2, 100],
                [0.6, 0.05, 0.3, 0.15, 70]
            ];

            // Render trees deterministically using pseudo-random to prevent blinking
            let seed = 1234;
            const random = () => {
                const x = Math.sin(seed++) * 10000;
                return x - Math.floor(x);
            };

            treeZones.forEach(zone => {
                for (let i = 0; i < zone[4]; i++) {
                    const tx = w * (zone[0] + random() * zone[2]);
                    const ty = h * (zone[1] + random() * zone[3]);
                    const tr = w * (0.004 + random() * 0.004);
                    
                    ctx.fillStyle = random() > 0.5 ? '#15291a' : '#1c3e25';
                    ctx.beginPath();
                    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
                    ctx.fill();
                    
                    // Simple highlight dot for 3D look
                    ctx.fillStyle = 'rgba(255,255,255,0.06)';
                    ctx.beginPath();
                    ctx.arc(tx - tr*0.3, ty - tr*0.3, tr*0.4, 0, Math.PI*2);
                    ctx.fill();
                }
            });
            ctx.restore();
        }
"""

rjs = rjs.replace("_drawLeoverseGlowOverlay(ctx) {", melbourne_bg + "\n        _drawLeoverseGlowOverlay(ctx) {")

with open("frontend/app/js/race.js", "w") as f:
    f.write(rjs)
