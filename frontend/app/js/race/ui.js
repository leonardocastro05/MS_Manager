// ============================================================
// RACE UI - User Interface Management
// ============================================================

import { TIRE_COMPOUNDS } from './engine.js';

export class RaceUI {
    constructor(engine, renderer) {
        this.engine = engine;
        this.renderer = renderer;

        // DOM element caches
        this.timingBoard = document.getElementById('timing-board');
        this.messagesPanel = document.getElementById('messages-panel');
        this.driverInfo = document.getElementById('driver-info');
        this.lapDisplay = document.getElementById('lap-display');
        this.statusDisplay = document.getElementById('race-status');
        this.timerDisplay = document.getElementById('race-timer');
        this.speedDisplay = document.getElementById('speed-display');
        this.fastestLapDisplay = document.getElementById('fastest-lap');
        this.resultsModal = document.getElementById('results-modal');
        this.resultsTable = document.getElementById('results-table');
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.pitBtn1 = document.getElementById('pit-btn-1');
        this.pitBtn2 = document.getElementById('pit-btn-2');

        this._lastMessageCount = 0;
        this._resultsShown = false;
    }

    update(state) {
        if (!state) return;

        this._updateTopBar(state);
        this._updateTimingBoard(state);
        this._updateMessages(state);
        this._updateDriverInfo(state);
        this._updatePitControls(state);
        this._updateFastestLap(state);

        if (state.status === 'finished' && !this._resultsShown) {
            this._showResults(state);
            this._resultsShown = true;
        }
    }

    _updateTopBar(state) {
        if (this.lapDisplay) {
            if (state.status === 'racing' || state.status === 'finished') {
                this.lapDisplay.textContent = `Vuelta ${Math.min(state.currentLap, state.totalLaps)}/${state.totalLaps}`;
            } else {
                this.lapDisplay.textContent = 'Previo';
            }
        }

        if (this.statusDisplay) {
            const statusTexts = {
                'pre-race': 'Pre-Carrera',
                'formation': 'Formación',
                'racing': state.safetyCarActive ? '🟡 Safety Car' : (state.drsEnabled ? 'DRS Activado' : 'Carrera'),
                'finished': 'Finalizada',
            };
            this.statusDisplay.textContent = statusTexts[state.staººtus] || state.status;
        }

        if (this.timerDisplay) {
            this.timerDisplay.textContent = this.engine.formatLapTime(state.raceTime);
        }

        if (this.speedDisplay) {
            this.speedDisplay.textContent = `${state.speedMultiplier.toFixed(1)}x`;
        }
    }

    _updateTimingBoard(state) {
        if (!this.timingBoard) return;

        const cars = [...state.cars]
            .filter(c => !c.retired)
            .sort((a, b) => a.position - b.position);

        let html = '';
        for (const car of cars) {
            const isPlayer = car.teamId === state.playerTeamId;
            const intervalText = car.position === 1 ? 'LDR' : this.engine.formatGap(car.interval);
            const drsClass = car.drsActive ? 'drs-active' : '';
            const playerClass = isPlayer ? 'player-car' : '';
            const pitClass = car.inPitLane ? 'in-pit' : '';

            html += `
                <div class="timing-row ${playerClass} ${drsClass} ${pitClass}" data-abbr="${car.abbr}">
                    <span class="pos">${car.position}</span>
                    <span class="team-color" style="background:${car.teamColor}"></span>
                    <span class="driver-name">${car.abbr}</span>
                    <span class="tire-indicator" style="background:${car.tireColor}">${car.tireLetter}</span>
                    <span class="interval">${intervalText}</span>
                    <span class="tire-life" style="color:${car.tireLife < 20 ? '#FF4444' : car.tireLife < 40 ? '#FFD700' : '#4CAF50'}">${Math.round(car.tireLife)}%</span>
                </div>
            `;
        }

        // Add retired cars
        const retired = state.cars.filter(c => c.retired);
        for (const car of retired) {
            html += `
                <div class="timing-row retired">
                    <span class="pos">DNF</span>
                    <span class="team-color" style="background:${car.teamColor}"></span>
                    <span class="driver-name">${car.abbr}</span>
                    <span class="tire-indicator">-</span>
                    <span class="interval">${car.retiredReason}</span>
                    <span class="tire-life">-</span>
                </div>
            `;
        }

        this.timingBoard.innerHTML = html;

        // Click to follow
        const rows = this.timingBoard.querySelectorAll('.timing-row[data-abbr]');
        rows.forEach(row => {
            row.addEventListener('click', () => {
                const abbr = row.dataset.abbr;
                this.renderer.setCameraMode('follow', abbr);
                this._highlightTimingRow(abbr);
            });
        });
    }

    _highlightTimingRow(abbr) {
        const rows = this.timingBoard.querySelectorAll('.timing-row');
        rows.forEach(r => r.classList.remove('selected'));
        const target = this.timingBoard.querySelector(`[data-abbr="${abbr}"]`);
        if (target) target.classList.add('selected');
    }

    _updateMessages(state) {
        if (!this.messagesPanel) return;
        if (state.messages.length === this._lastMessageCount) return;

        this._lastMessageCount = state.messages.length;
        let html = '';
        const msgs = state.messages.slice(-15);
        for (const msg of msgs) {
            html += `<div class="message msg-${msg.type}">${msg.text}</div>`;
        }
        this.messagesPanel.innerHTML = html;
        this.messagesPanel.scrollTop = this.messagesPanel.scrollHeight;
    }

    _updateDriverInfo(state) {
        if (!this.driverInfo) return;

        const playerCars = state.cars
            .filter(c => c.teamId === state.playerTeamId)
            .sort((a, b) => a.position - b.position);

        if (playerCars.length === 0) return;

        let html = '';
        for (const car of playerCars) {
            const lapTimeStr = car.lastLapTime ? this.engine.formatLapTime(car.lastLapTime) : '--:--.---';
            const bestTimeStr = car.bestLapTime < Infinity ? this.engine.formatLapTime(car.bestLapTime) : '--:--.---';

            html += `
                <div class="driver-card">
                    <div class="driver-header" style="border-color:${car.teamColor}">
                        <span class="driver-pos">P${car.position}</span>
                        <span class="driver-abbr">${car.abbr}</span>
                        <span class="driver-number">#${car.number}</span>
                    </div>
                    <div class="driver-stats">
                        <div class="stat">
                            <span class="label">Última</span>
                            <span class="value">${lapTimeStr}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Mejor</span>
                            <span class="value">${bestTimeStr}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Neumático</span>
                            <span class="value" style="color:${car.tireColor}">${TIRE_COMPOUNDS[car.tire]?.name || car.tire} ${Math.round(car.tireLife)}%</span>
                        </div>
                        <div class="stat">
                            <span class="label">Paradas</span>
                            <span class="value">${car.pitStops}</span>
                        </div>
                        <div class="stat">
                            <span class="label">Combustible</span>
                            <span class="value">${Math.round(car.fuel)}%</span>
                        </div>
                        ${car.drsActive ? '<div class="stat drs-badge"><span class="label">DRS</span><span class="value">ACTIVO</span></div>' : ''}
                    </div>
                </div>
            `;
        }

        this.driverInfo.innerHTML = html;
    }

    _updatePitControls(state) {
        const playerCars = state.cars
            .filter(c => c.teamId === state.playerTeamId && !c.retired)
            .sort((a, b) => a.position - b.position);

        if (this.pitBtn1 && playerCars[0]) {
            this.pitBtn1.textContent = `PIT ${playerCars[0].abbr}`;
            this.pitBtn1.disabled = playerCars[0].inPitLane;
        }
        if (this.pitBtn2 && playerCars[1]) {
            this.pitBtn2.textContent = `PIT ${playerCars[1].abbr}`;
            this.pitBtn2.disabled = playerCars[1].inPitLane;
        }
    }

    _updateFastestLap(state) {
        if (!this.fastestLapDisplay) return;
        if (state.fastestLap.driver) {
            this.fastestLapDisplay.innerHTML = `
                <span style="color:${state.fastestLap.teamColor || '#A020F0'}">
                    ⚡ ${state.fastestLap.driver} ${this.engine.formatLapTime(state.fastestLap.time)}
                </span>
            `;
        }
    }

    _showResults(state) {
        if (!this.resultsModal || !this.resultsTable) return;

        const results = this.engine.getResults();
        const retirements = this.engine.getRetirements();

        let html = `
            <tr class="results-header">
                <th>Pos</th>
                <th>Piloto</th>
                <th>Equipo</th>
                <th>Vueltas</th>
                <th>Mejor Vuelta</th>
                <th>Paradas</th>
                <th>Intervalo</th>
            </tr>
        `;

        for (const r of results) {
            const isPlayer = state.cars.find(c => c.abbr === r.abbr)?.teamId === state.playerTeamId;
            const rowClass = r.position <= 3 ? `podium-${r.position}` : (isPlayer ? 'player-result' : '');

            html += `
                <tr class="result-row ${rowClass}">
                    <td class="pos-cell">${r.position <= 3 ? ['🥇', '🥈', '🥉'][r.position - 1] : r.position}</td>
                    <td>
                        <span class="result-color" style="background:${r.teamColor}"></span>
                        ${r.driver}
                    </td>
                    <td>${r.team}</td>
                    <td>${r.laps}</td>
                    <td>${r.bestLap}</td>
                    <td>${r.pitStops}</td>
                    <td>${r.position === 1 ? '-' : this.engine.formatGap(r.gapToLeader)}</td>
                </tr>
            `;
        }

        for (const r of retirements) {
            html += `
                <tr class="result-row retired-row">
                    <td class="pos-cell">DNF</td>
                    <td>
                        <span class="result-color" style="background:${r.teamColor}"></span>
                        ${r.driver}
                    </td>
                    <td>${r.team}</td>
                    <td>${r.lap}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${r.reason}</td>
                </tr>
            `;
        }

        this.resultsTable.innerHTML = html;
        this.resultsModal.classList.add('visible');
    }

    setupCameraControls() {
        const fullBtn = document.getElementById('cam-full');
        const followBtn = document.getElementById('cam-follow');
        const tvBtn = document.getElementById('cam-tv');

        if (fullBtn) {
            fullBtn.addEventListener('click', () => {
                this.renderer.setCameraMode('full');
                this._setActiveCamera('full');
            });
        }

        if (followBtn) {
            followBtn.addEventListener('click', () => {
                // Follow leader by default
                const state = this.engine.getState();
                const leader = state.cars.find(c => c.position === 1);
                if (leader) {
                    this.renderer.setCameraMode('follow', leader.abbr);
                    this._highlightTimingRow(leader.abbr);
                }
                this._setActiveCamera('follow');
            });
        }

        if (tvBtn) {
            tvBtn.addEventListener('click', () => {
                const state = this.engine.getState();
                const playerCar = state.cars.find(c => c.teamId === state.playerTeamId);
                if (playerCar) {
                    this.renderer.setCameraMode('tv', playerCar.abbr);
                    this._highlightTimingRow(playerCar.abbr);
                }
                this._setActiveCamera('tv');
            });
        }
    }

    _setActiveCamera(mode) {
        document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`cam-${mode}`);
        if (btn) btn.classList.add('active');
    }

    setupSpeedControls() {
        const speeds = [0.5, 1, 2, 5, 10];
        const container = document.getElementById('speed-controls');
        if (!container) return;

        for (const s of speeds) {
            const btn = container.querySelector(`[data-speed="${s}"]`);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.engine.setSpeed(s);
                    container.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                });
            }
        }
    }

    setupPitControls() {
        if (this.pitBtn1) {
            this.pitBtn1.addEventListener('click', () => {
                this.engine.pitPlayerCar(0);
            });
        }
        if (this.pitBtn2) {
            this.pitBtn2.addEventListener('click', () => {
                this.engine.pitPlayerCar(1);
            });
        }
    }
}
