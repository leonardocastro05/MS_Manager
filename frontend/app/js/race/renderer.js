// ============================================================
// RACE RENDERER - Canvas-based Track & Car Rendering
// ============================================================

import {
    getSplinePoint,
    getSplineAngle,
    getSplineNormal,
    buildArcLengthTable,
    arcLengthToFraction,
    precomputeTrackGeometry,
} from '../tracks/index.js';

export class RaceRenderer {
    constructor(canvas, track) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.track = track;

        // Pre-computed geometry
        const result = buildArcLengthTable(this.track.points);
        this.arcTable = result.table;
        this.trackTotalLength = result.totalLength;
        this.geometry = precomputeTrackGeometry(this.track);

        // Camera
        this.cameraMode = 'full'; // 'full', 'follow', 'tv'
        this.cameraTarget = null;
        this.cameraX = 0;
        this.cameraY = 0;
        this.cameraZoom = 1.0;
        this.targetCameraX = 0;
        this.targetCameraY = 0;
        this.targetCameraZoom = 1.0;

        // Offscreen track canvas (pre-rendered)
        this.trackCanvas = null;
        this.trackCtx = null;
        this.trackRendered = false;

        // Track scale
        this.scaleX = 1;
        this.scaleY = 1;

        this._resize();
        this._preRenderTrack();
    }

    _resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.width = rect.width;
        this.height = rect.height;

        this.scaleX = this.width / this.track.refWidth;
        this.scaleY = this.height / this.track.refHeight;

        this.trackRendered = false;
        this._preRenderTrack();
    }

    handleResize() {
        this._resize();
    }

    // ============================================================
    // PRE-RENDER TRACK TO OFFSCREEN CANVAS
    // ============================================================

    _preRenderTrack() {
        const dpr = window.devicePixelRatio || 1;
        this.trackCanvas = document.createElement('canvas');
        this.trackCanvas.width = this.canvas.width;
        this.trackCanvas.height = this.canvas.height;
        this.trackCtx = this.trackCanvas.getContext('2d');
        this.trackCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const ctx = this.trackCtx;

        // ── Background / Grass ──
        const grassGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        grassGrad.addColorStop(0, '#1a3a1a');
        grassGrad.addColorStop(1, '#0d2810');
        ctx.fillStyle = grassGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // ── Environment features ──
        this._drawEnvironment(ctx);

        // ── Gravel traps / Runoff ──
        this._drawRunoff(ctx);

        // ── Asphalt ──
        this._drawAsphalt(ctx);

        // ── Track markings ──
        this._drawMarkings(ctx);

        // ── Kerbs ──
        this._drawKerbs(ctx);

        // ── Pit Lane ──
        this._drawPitLane(ctx);

        // ── Start/Finish line ──
        this._drawStartFinish(ctx);

        // ── Grandstands ──
        this._drawGrandstands(ctx);

        // ── DRS markers ──
        this._drawDRSMarkers(ctx);

        this.trackRendered = true;
    }

    _drawEnvironment(ctx) {
        const env = this.track.environment || {};

        // Forests
        if (env.forests) {
            for (const f of env.forests) {
                ctx.save();
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = '#0a2a0a';
                ctx.beginPath();
                ctx.ellipse(
                    f.x * this.scaleX, f.y * this.scaleY,
                    f.radiusX * this.scaleX, f.radiusY * this.scaleY,
                    0, 0, Math.PI * 2
                );
                ctx.fill();

                // Tree dots
                const treeCount = Math.floor(f.radiusX * f.radiusY * 0.003);
                for (let i = 0; i < treeCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const rX = Math.random() * f.radiusX * 0.9;
                    const rY = Math.random() * f.radiusY * 0.9;
                    const tx = (f.x + Math.cos(angle) * rX) * this.scaleX;
                    const ty = (f.y + Math.sin(angle) * rY) * this.scaleY;
                    const treeR = (2 + Math.random() * 4) * this.scaleX;

                    ctx.fillStyle = `hsl(${130 + Math.random() * 30}, ${40 + Math.random() * 20}%, ${12 + Math.random() * 10}%)`;
                    ctx.beginPath();
                    ctx.arc(tx, ty, treeR, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }
        }

        // Parking areas
        if (env.parking) {
            for (const p of env.parking) {
                const parkingWidth = p.width ?? p.w;
                const parkingHeight = p.height ?? p.h;
                if (typeof parkingWidth !== 'number' || typeof parkingHeight !== 'number') continue;
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(
                    p.x * this.scaleX, p.y * this.scaleY,
                    parkingWidth * this.scaleX, parkingHeight * this.scaleY
                );
            }
        }
    }

    _drawRunoff(ctx) {
        const corners = this.track.corners || [];
        for (const corner of corners) {
            if (!corner.runoff) continue;
            const frac = (corner.entry + corner.apex) / 2;
            const pt = getSplinePoint(this.track.points, frac);
            const normal = getSplineNormal(this.track.points, frac);
            const runoffSize = corner.runoff * this.scaleX;

            // Gravel
            ctx.fillStyle = '#8B7355';
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.ellipse(
                (pt.x + normal.x * 40) * this.scaleX,
                (pt.y + normal.y * 40) * this.scaleY,
                runoffSize, runoffSize * 0.7,
                0, 0, Math.PI * 2
            );
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
    }

    _drawAsphalt(ctx) {
        const points = this.geometry.points;
        const normals = this.geometry.normals;
        const tw = this.track.trackWidth;

        // Main track
        ctx.beginPath();
        for (let i = 0; i <= points.length; i++) {
            const idx = i % points.length;
            const px = (points[idx].x + normals[idx].x * tw / 2) * this.scaleX;
            const py = (points[idx].y + normals[idx].y * tw / 2) * this.scaleY;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        for (let i = points.length; i >= 0; i--) {
            const idx = i % points.length;
            const px = (points[idx].x - normals[idx].x * tw / 2) * this.scaleX;
            const py = (points[idx].y - normals[idx].y * tw / 2) * this.scaleY;
            ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = '#333333';
        ctx.fill();

        // Track edge lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);

        // Outer edge
        ctx.beginPath();
        for (let i = 0; i <= points.length; i++) {
            const idx = i % points.length;
            const px = (points[idx].x + normals[idx].x * tw / 2) * this.scaleX;
            const py = (points[idx].y + normals[idx].y * tw / 2) * this.scaleY;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Inner edge
        ctx.beginPath();
        for (let i = 0; i <= points.length; i++) {
            const idx = i % points.length;
            const px = (points[idx].x - normals[idx].x * tw / 2) * this.scaleX;
            const py = (points[idx].y - normals[idx].y * tw / 2) * this.scaleY;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }

    _drawMarkings(ctx) {
        const points = this.geometry.points;
        const normals = this.geometry.normals;

        // Center line (dashed)
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([10, 15]);
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
            const px = points[i].x * this.scaleX;
            const py = points[i].y * this.scaleY;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    _drawKerbs(ctx) {
        const corners = this.track.corners || [];
        for (const corner of corners) {
            if (
                typeof corner.entry !== 'number' ||
                typeof corner.exit !== 'number'
            ) {
                continue;
            }

            const numKerbSegments = 12;
            const kerbWidth = 6;
            const tw = this.track.trackWidth / 2;

            for (let i = 0; i < numKerbSegments; i++) {
                const t = corner.entry + (corner.exit - corner.entry) * (i / numKerbSegments);
                const pt = getSplinePoint(this.track.points, t);
                const normal = getSplineNormal(this.track.points, t);

                const side = corner.direction === 'left' ? -1 : 1;
                const kx = (pt.x + normal.x * (tw + kerbWidth) * side) * this.scaleX;
                const ky = (pt.y + normal.y * (tw + kerbWidth) * side) * this.scaleY;

                ctx.fillStyle = i % 2 === 0 ? '#FF0000' : '#FFFFFF';
                ctx.fillRect(kx - 3 * this.scaleX, ky - 3 * this.scaleY, 6 * this.scaleX, 6 * this.scaleY);
            }
        }
    }

    _drawPitLane(ctx) {
        const pitLane = this.track.pitLane;
        if (!pitLane || !pitLane.points) return;

        ctx.strokeStyle = '#555555';
        ctx.lineWidth = 18 * this.scaleX;
        ctx.setLineDash([]);
        ctx.beginPath();
        for (let i = 0; i < pitLane.points.length; i++) {
            const px = pitLane.points[i].x * this.scaleX;
            const py = pitLane.points[i].y * this.scaleY;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Pit lane line
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        for (let i = 0; i < pitLane.points.length; i++) {
            const px = pitLane.points[i].x * this.scaleX;
            const py = pitLane.points[i].y * this.scaleY;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Pit boxes
        if (pitLane.boxes) {
            for (const box of pitLane.boxes) {
                ctx.fillStyle = 'rgba(255,255,255,0.1)';
                ctx.fillRect(
                    box.x * this.scaleX - 4, box.y * this.scaleY - 4,
                    8, 8
                );
            }
        }
    }

    _drawStartFinish(ctx) {
        const sfLine = this.track.startFinish || { fraction: 0 };
        const pt = getSplinePoint(this.track.points, sfLine.fraction || 0);
        const normal = getSplineNormal(this.track.points, sfLine.fraction || 0);
        const tw = this.track.trackWidth / 2;

        // Checkered pattern
        const x1 = (pt.x + normal.x * tw) * this.scaleX;
        const y1 = (pt.y + normal.y * tw) * this.scaleY;
        const x2 = (pt.x - normal.x * tw) * this.scaleX;
        const y2 = (pt.y - normal.y * tw) * this.scaleY;

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }

    _drawGrandstands(ctx) {
        const grandstands = this.track.environment?.grandstands || [];
        for (const gs of grandstands) {
            ctx.save();
            ctx.translate(gs.x * this.scaleX, gs.y * this.scaleY);
            ctx.rotate((gs.angle || 0) * Math.PI / 180);

            const w = (gs.width ?? gs.w ?? 60) * this.scaleX;
            const h = (gs.height ?? gs.h ?? 15) * this.scaleY;

            // Structure
            ctx.fillStyle = '#4a4a4a';
            ctx.fillRect(-w / 2, -h / 2, w, h);

            // Seats (colored rows)
            const rows = 3;
            for (let r = 0; r < rows; r++) {
                ctx.fillStyle = `hsl(${r * 40 + 200}, 60%, 50%)`;
                const rh = h / rows;
                ctx.fillRect(-w / 2 + 2, -h / 2 + r * rh + 1, w - 4, rh - 2);
            }

            ctx.restore();
        }
    }

    _drawDRSMarkers(ctx) {
        const drsZones = this.track.drsZones || [];
        for (const zone of drsZones) {
            // Detection point
            const detPt = getSplinePoint(this.track.points, zone.detection);
            const detNormal = getSplineNormal(this.track.points, zone.detection);
            const tw = this.track.trackWidth / 2;

            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(
                (detPt.x + detNormal.x * tw) * this.scaleX,
                (detPt.y + detNormal.y * tw) * this.scaleY
            );
            ctx.lineTo(
                (detPt.x - detNormal.x * tw) * this.scaleX,
                (detPt.y - detNormal.y * tw) * this.scaleY
            );
            ctx.stroke();

            // Activation point
            const actPt = getSplinePoint(this.track.points, zone.start);
            const actNormal = getSplineNormal(this.track.points, zone.start);

            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(
                (actPt.x + actNormal.x * tw) * this.scaleX,
                (actPt.y + actNormal.y * tw) * this.scaleY
            );
            ctx.lineTo(
                (actPt.x - actNormal.x * tw) * this.scaleX,
                (actPt.y - actNormal.y * tw) * this.scaleY
            );
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    // ============================================================
    // RENDER FRAME
    // ============================================================

    render(state) {
        if (!state) return;

        const ctx = this.ctx;
        ctx.save();

        // Clear
        ctx.fillStyle = '#0d2810';
        ctx.fillRect(0, 0, this.width, this.height);

        // Camera transform
        this._updateCamera(state);
        ctx.translate(this.width / 2, this.height / 2);
        ctx.scale(this.cameraZoom, this.cameraZoom);
        ctx.translate(-this.cameraX, -this.cameraY);

        // Draw pre-rendered track
        if (this.trackCanvas) {
            ctx.drawImage(this.trackCanvas, 0, 0, this.width, this.height);
        }

        // Draw cars
        this._drawCars(ctx, state);

        ctx.restore();

        // Draw start lights (overlay, not affected by camera)
        if (state.status === 'formation') {
            this._drawStartLights(ctx, state.lightsStage);
        }
    }

    _updateCamera(state) {
        switch (this.cameraMode) {
            case 'full':
                this.targetCameraX = this.width / 2;
                this.targetCameraY = this.height / 2;
                this.targetCameraZoom = 1.0;
                break;

            case 'follow': {
                if (this.cameraTarget) {
                    const car = state.cars.find(c => c.abbr === this.cameraTarget);
                    if (car) {
                        const pt = getSplinePoint(this.track.points, car.progress);
                        this.targetCameraX = pt.x * this.scaleX;
                        this.targetCameraY = pt.y * this.scaleY;
                        this.targetCameraZoom = 2.5;
                    }
                }
                break;
            }

            case 'tv': {
                if (this.cameraTarget) {
                    const car = state.cars.find(c => c.abbr === this.cameraTarget);
                    if (car) {
                        const pt = getSplinePoint(this.track.points, car.progress);
                        this.targetCameraX = pt.x * this.scaleX;
                        this.targetCameraY = pt.y * this.scaleY;
                        this.targetCameraZoom = 1.8;
                    }
                }
                break;
            }
        }

        // Smooth camera
        const lerp = 0.06;
        this.cameraX += (this.targetCameraX - this.cameraX) * lerp;
        this.cameraY += (this.targetCameraY - this.cameraY) * lerp;
        this.cameraZoom += (this.targetCameraZoom - this.cameraZoom) * lerp;
    }

    setCameraMode(mode, target = null) {
        this.cameraMode = mode;
        this.cameraTarget = target;
    }

    // ============================================================
    // DRAW CARS
    // ============================================================

    _drawCars(ctx, state) {
        // Sort by progress so further cars are drawn first
        const sortedCars = [...state.cars]
            .filter(c => !c.retired)
            .sort((a, b) => a.totalProgress - b.totalProgress);

        for (const car of sortedCars) {
            this._drawCar(ctx, car, state);
        }
    }

    _drawCar(ctx, car, state) {
        let pt, angle;

        if (car.inPitLane) {
            // Draw in pit lane
            const pitLane = this.track.pitLane;
            if (pitLane && pitLane.points) {
                const pitProgress = Math.min(1, car.progress / 0.02);
                const pitIdx = Math.floor(pitProgress * (pitLane.points.length - 1));
                const pitPt = pitLane.points[Math.min(pitIdx, pitLane.points.length - 1)];
                pt = { x: pitPt.x, y: pitPt.y };
                angle = 0;
            } else {
                return;
            }
        } else {
            pt = getSplinePoint(this.track.points, car.progress);
            angle = getSplineAngle(this.track.points, car.progress);
        }

        const x = pt.x * this.scaleX;
        const y = pt.y * this.scaleY;

        // Visual offset for overtaking
        const offsetX = car.visualOffset ? Math.cos(angle + Math.PI / 2) * car.visualOffset * this.scaleX * 0.1 : 0;
        const offsetY = car.visualOffset ? Math.sin(angle + Math.PI / 2) * car.visualOffset * this.scaleY * 0.1 : 0;

        const drawX = x + offsetX;
        const drawY = y + offsetY;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(angle);

        // DRS trail effect
        if (car.drsActive) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.fillStyle = '#00FF9D';
            ctx.beginPath();
            ctx.moveTo(-18 * this.scaleX, 0);
            ctx.lineTo(-6 * this.scaleX, -4 * this.scaleY);
            ctx.lineTo(-6 * this.scaleX, 4 * this.scaleY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Car shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(2 * this.scaleX, 2 * this.scaleY, 9 * this.scaleX, 5 * this.scaleY, 0, 0, Math.PI * 2);
        ctx.fill();

        // Car body
        const carW = 14 * this.scaleX;
        const carH = 7 * this.scaleY;
        ctx.fillStyle = car.teamColor;
        ctx.beginPath();
        this._roundRect(ctx, -carW / 2, -carH / 2, carW, carH, 3 * this.scaleX);
        ctx.fill();

        // Accent stripe
        ctx.fillStyle = car.teamAccent || '#FFF';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(-carW / 2 + 2, -1, carW - 4, 2);
        ctx.globalAlpha = 1.0;

        ctx.restore();

        // Position badge
        const badgeSize = 9 * this.scaleX;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(drawX, drawY - 12 * this.scaleY, badgeSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFF';
        ctx.font = `bold ${Math.max(7, 9 * this.scaleX)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`P${car.position}`, drawX, drawY - 12 * this.scaleY);

        // Tire indicator
        ctx.fillStyle = car.tireColor;
        ctx.beginPath();
        ctx.arc(drawX + 10 * this.scaleX, drawY - 12 * this.scaleY, 4 * this.scaleX, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = `bold ${Math.max(5, 6 * this.scaleX)}px monospace`;
        ctx.fillText(car.tireLetter, drawX + 10 * this.scaleX, drawY - 12 * this.scaleY);
    }

    // ============================================================
    // START LIGHTS
    // ============================================================

    _drawStartLights(ctx, stage) {
        const centerX = this.width / 2;
        const topY = 50;
        const lightR = 14;
        const spacing = 40;
        const numLights = 5;

        // Background panel
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        const panelW = numLights * spacing + 40;
        const panelH = 60;
        const panelX = centerX - panelW / 2;
        ctx.beginPath();
        this._roundRect(ctx, panelX, topY - panelH / 2, panelW, panelH, 10);
        ctx.fill();
        ctx.stroke();

        for (let i = 0; i < numLights; i++) {
            const lx = centerX - ((numLights - 1) * spacing) / 2 + i * spacing;
            const ly = topY;

            // Light glow
            if (i < stage && stage < 6) {
                ctx.save();
                ctx.shadowColor = '#FF0000';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(lx, ly, lightR, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else if (stage >= 6) {
                // Lights out - all green flash
                ctx.save();
                ctx.shadowColor = '#00FF00';
                ctx.shadowBlur = 20;
                ctx.fillStyle = '#00FF00';
                ctx.beginPath();
                ctx.arc(lx, ly, lightR, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            } else {
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.arc(lx, ly, lightR, 0, Math.PI * 2);
                ctx.fill();
            }

            // Light border
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(lx, ly, lightR, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // ============================================================
    // MINIMAP
    // ============================================================

    renderMinimap(minimapCanvas, state) {
        if (!minimapCanvas || !state) return;

        const ctx = minimapCanvas.getContext('2d');
        const w = minimapCanvas.width;
        const h = minimapCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        this._roundRect(ctx, 0, 0, w, h, 8);
        ctx.fill();

        // Scale to fit track in minimap
        const padding = 15;
        const points = this.track.points;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (const p of points) {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        }
        const trackW = maxX - minX;
        const trackH = maxY - minY;
        const scale = Math.min((w - padding * 2) / trackW, (h - padding * 2) / trackH);
        const offsetX = (w - trackW * scale) / 2;
        const offsetY = (h - trackH * scale) / 2;

        // Draw track outline
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
            const frac = i / 100;
            const pt = getSplinePoint(this.track.points, frac);
            const mx = (pt.x - minX) * scale + offsetX;
            const my = (pt.y - minY) * scale + offsetY;
            if (i === 0) ctx.moveTo(mx, my); else ctx.lineTo(mx, my);
        }
        ctx.closePath();
        ctx.stroke();

        // Draw cars
        for (const car of state.cars) {
            if (car.retired) continue;
            const pt = getSplinePoint(this.track.points, car.progress);
            const mx = (pt.x - minX) * scale + offsetX;
            const my = (pt.y - minY) * scale + offsetY;

            // Highlight player cars
            const isPlayer = car.teamId === state.playerTeamId;

            ctx.fillStyle = car.teamColor;
            ctx.beginPath();
            ctx.arc(mx, my, isPlayer ? 4 : 2.5, 0, Math.PI * 2);
            ctx.fill();

            if (isPlayer) {
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }
    }

    _roundRect(ctx, x, y, w, h, r) {
        if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y, w, h, r);
            return;
        }

        const radius = Math.max(0, Math.min(r, w / 2, h / 2));
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + w - radius, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
        ctx.lineTo(x + w, y + h - radius);
        ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        ctx.lineTo(x + radius, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}
