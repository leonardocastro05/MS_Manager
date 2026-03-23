(function () {
    const DEFAULT_CONFIG = {
        trackId: 'monza',
        laps: 12,
        weather: 'dry',
        startingTyre: 'soft',
        playerProfile: null,
    };

    const TEAM_COLORS = [
        '#ff3b30', '#2997ff', '#00d47a', '#ffd60a', '#bf5af2',
        '#ff9f0a', '#64d2ff', '#ff375f', '#30d158', '#5e5ce6'
    ];

    const TRACKS = {
        monza: {
            name: 'Monza',
            refWidth: 1400,
            refHeight: 800,
            gridStartProgress: 0.24,
            points: [
                [1240, 742], [1120, 732], [995, 721], [870, 708], [745, 694], [630, 676], [550, 654],
                [492, 632], [452, 607], [430, 575], [414, 540], [392, 504],
                [368, 456], [338, 400], [296, 322], [268, 268], [252, 220],
                [248, 178], [256, 148], [280, 122], [316, 110], [356, 114], [390, 132],
                [414, 164], [424, 210], [418, 260],
                [410, 310], [404, 362], [410, 410],
                [428, 450], [458, 488], [500, 520],
                [548, 542], [596, 550], [636, 538], [676, 550], [720, 540],
                [810, 552], [900, 575], [1008, 612],
                [1100, 656], [1178, 700], [1232, 733], [1250, 747], [1240, 742]
            ],
            pitWindow: { start: 0.90, end: 0.99 },
            baseLapSeconds: 80.4,
            fastestLapSeconds: 78.792,
        },
        bahrain: {
            name: 'Bahrain',
            refWidth: 1,
            refHeight: 1,
            gridStartProgress: 0.10,
            points: [
                [0.10, 0.88], [0.22, 0.88], [0.36, 0.88], [0.52, 0.88], [0.68, 0.88],
                [0.82, 0.88], [0.92, 0.87], [0.96, 0.84], [0.90, 0.74], [0.84, 0.64],
                [0.78, 0.54], [0.72, 0.44], [0.66, 0.34], [0.62, 0.26], [0.58, 0.20],
                [0.54, 0.24], [0.51, 0.31], [0.52, 0.38], [0.56, 0.45], [0.62, 0.49],
                [0.66, 0.55], [0.67, 0.63], [0.64, 0.68], [0.56, 0.68], [0.46, 0.68],
                [0.35, 0.68], [0.24, 0.68], [0.18, 0.67], [0.16, 0.64], [0.18, 0.60],
                [0.24, 0.58], [0.34, 0.59], [0.44, 0.60], [0.50, 0.60], [0.52, 0.57],
                [0.49, 0.54], [0.44, 0.49], [0.39, 0.44], [0.35, 0.39], [0.32, 0.33],
                [0.31, 0.27], [0.32, 0.20], [0.34, 0.13], [0.33, 0.09], [0.30, 0.08],
                [0.27, 0.12], [0.25, 0.22], [0.23, 0.35], [0.21, 0.50], [0.19, 0.66],
                [0.17, 0.78], [0.14, 0.84], [0.10, 0.88]
            ],
            pitWindow: { start: 0.90, end: 0.985 },
            baseLapSeconds: 91.6,
            fastestLapSeconds: 89.47,
        },
        leoverse: {
            name: 'Leoverse',
            refWidth: 1,
            refHeight: 1,
            gridStartProgress: 0.24,
            points: [
                [0.64, 0.23], [0.74, 0.22], [0.83, 0.25], [0.90, 0.33], [0.92, 0.43],
                [0.88, 0.52], [0.80, 0.58], [0.71, 0.60], [0.64, 0.57], [0.61, 0.50],
                [0.63, 0.43], [0.67, 0.39], [0.75, 0.37], [0.81, 0.41], [0.82, 0.49],
                [0.77, 0.55], [0.68, 0.56], [0.59, 0.54], [0.52, 0.58], [0.46, 0.66],
                [0.40, 0.72], [0.31, 0.74], [0.22, 0.70], [0.16, 0.63], [0.14, 0.54],
                [0.18, 0.46], [0.25, 0.40], [0.33, 0.35], [0.43, 0.31], [0.53, 0.29],
                [0.58, 0.24], [0.60, 0.17], [0.56, 0.11], [0.48, 0.08], [0.39, 0.10],
                [0.33, 0.16], [0.31, 0.25], [0.33, 0.33], [0.38, 0.39], [0.46, 0.43],
                [0.56, 0.43], [0.62, 0.39], [0.64, 0.32], [0.64, 0.23]
            ],
            pitWindow: { start: 0.82, end: 0.93 },
            baseLapSeconds: 94.3,
            fastestLapSeconds: 91.98,
        },
    };

    class OfflineRace {
        constructor() {
            this.config = this._loadConfig();
            this.track = TRACKS[this.config.trackId] || TRACKS.monza;
            this.apiBaseUrl = this._getApiUrl();
            this.token = localStorage.getItem('authToken');
            this.resultsPersisted = false;

            this.canvas = document.getElementById('race-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.minimap = document.getElementById('minimap-canvas');
            this.minimapCtx = this.minimap.getContext('2d');

            this.elLap = document.getElementById('lap-display');
            this.elStatus = document.getElementById('race-status');
            this.elTimer = document.getElementById('race-timer');
            this.elSpeed = document.getElementById('speed-display');
            this.elFastest = document.getElementById('fastest-lap');
            this.elTiming = document.getElementById('timing-board');
            this.elDriverInfo = document.getElementById('driver-info');
            this.elMessages = document.getElementById('messages-panel');
            this.elResultsModal = document.getElementById('results-modal');
            this.elResultsTable = document.getElementById('results-table');
            this.elPitTyreSelect = document.getElementById('pit-tyre-select');

            this.speedMultiplier = 1;
            this.baseRaceSpeedFactor = 12;
            this.status = 'countdown';
            this.countdown = 3.5;
            this.raceTime = 0;
            this.lastTimestamp = 0;
            this.fastestLap = null;
            this.cameraMode = 'full';
            this.cameraState = null;
            this.selectedPitTyre = this.config.startingTyre || 'medium';

            this.trackSamples = [];
            this.trackLength = 0;

            this.cars = [];
            this.messages = [];

            this._resize();
            this._sampleTrack();
            this._initCars();
            this._bindControls();
            this._pushMessage(`🏁 ${this.track.name} cargado`, true);
            this._renderStaticUI();
            requestAnimationFrame((ts) => this._loop(ts));
        }

        _loadConfig() {
            try {
                const raw = localStorage.getItem('raceConfig');
                if (!raw) return { ...DEFAULT_CONFIG };
                return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
            } catch {
                return { ...DEFAULT_CONFIG };
            }
        }

        _getApiUrl() {
            const isFileProtocol = window.location.protocol === 'file:';
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isFileProtocol || isLocalhost) {
                return 'http://localhost:5000/api';
            }
            return `${window.location.origin}/api`;
        }

        _resize() {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.width = rect.width;
            this.height = rect.height;
        }

        _sampleTrack() {
            const pts = this.track.points;
            const refWidth = this.track.refWidth || 1;
            const refHeight = this.track.refHeight || 1;

            const transformed = pts.map((point) => {
                const x = Array.isArray(point) ? point[0] : point.x;
                const y = Array.isArray(point) ? point[1] : point.y;
                return {
                    x: (x / refWidth) * this.width,
                    y: (y / refHeight) * this.height,
                };
            });

            this.trackSamples = transformed;
            this.trackLength = 0;
            for (let i = 0; i < transformed.length - 1; i++) {
                this.trackLength += this._dist(transformed[i], transformed[i + 1]);
            }
        }

        _initCars() {
            const player = this.config.playerProfile || {};
            const teamName = player.teamName || 'Tu Equipo';
            const mainPilot = player.currentPilot || null;
            const laps = Math.max(4, Number(this.config.laps || DEFAULT_CONFIG.laps));
            this.totalLaps = laps;

            const gridSize = 20;
            const gridStartProgress = Number.isFinite(this.track.gridStartProgress)
                ? this.track.gridStartProgress
                : 0.24;
            const gridStep = 0.0024;

            for (let i = 0; i < gridSize; i++) {
                const isPlayer = i === 0;
                const name = isPlayer
                    ? (mainPilot?.name || 'Piloto de Reserva')
                    : `Piloto ${i + 1}`;

                const team = isPlayer ? teamName : `Equipo ${Math.floor(i / 2) + 1}`;
                const abbr = this._abbr(name);

                const basePace = this._basePaceFromData(isPlayer, mainPilot, player?.car);
                const tireManagement = this._tireManagementFromData(isPlayer, mainPilot, player?.car);
                const consistency = this._consistencyFromData(isPlayer, mainPilot);
                const aiAggression = isPlayer ? 1 : this._aiAggressionFromGrid(i);
                const gridProgress = Math.max(0, gridStartProgress - i * gridStep);

                this.cars.push({
                    id: i + 1,
                    name,
                    abbr,
                    team,
                    teamColor: isPlayer ? '#ff3b30' : TEAM_COLORS[i % TEAM_COLORS.length],
                    isPlayer,
                    progress: gridProgress,
                    lap: 0,
                    totalProgress: gridProgress,
                    finished: false,
                    retired: false,
                    basePace,
                    tireManagement,
                    consistency,
                    aiAggression,
                    tire: isPlayer ? (this.config.startingTyre || 'soft') : (i < 10 ? 'soft' : 'medium'),
                    tireLife: 100,
                    pitRequested: false,
                    nextPitTyre: null,
                    inPit: false,
                    pitTime: 0,
                    lockupCooldown: 0,
                    position: i + 1,
                    lastLap: null,
                    bestLap: null,
                });
            }

            this._sortPositions();
        }

        _basePaceFromData(isPlayer, pilot, car) {
            const randomBase = 0.0102 + Math.random() * 0.0012;
            if (!isPlayer) return randomBase + 0.00045 + (Math.random() - 0.5) * 0.00055;

            const pilotFactor = pilot
                ? ((pilot.speed || 70) + (pilot.control || 70) + (pilot.experience || 70)) / 300
                : 0.72;

            const carLevelAvg = car
                ? ((car.engine?.level || 1) + (car.aero?.level || 1) + (car.drs?.level || 1) + (car.chassis?.level || 1)) / 40
                : 0.1;

            const boost = pilotFactor * 0.0013 + carLevelAvg * 0.0015;
            return randomBase + boost;
        }

        _aiAggressionFromGrid(gridIndex) {
            const frontBias = 1 - (gridIndex / 19);
            return 1.04 + frontBias * 0.2 + Math.random() * 0.14;
        }

        _aiPressureFactor(car, playerCar) {
            if (car.isPlayer) return 1;

            let factor = 1;
            const lapsLeft = Math.max(0, this.totalLaps - car.lap);

            if (car.tireLife >= 58) factor += 0.04;
            if (car.tire === 'soft' && car.tireLife > 35) factor += 0.03;
            if (lapsLeft <= 3 && car.position > 1) factor += 0.05;

            if (playerCar) {
                if (playerCar.inPit) {
                    factor += 0.08;
                } else {
                    const playerTyreStress = Math.max(0, 60 - playerCar.tireLife) / 60;
                    factor += playerTyreStress * 0.12;

                    if (playerCar.tireLife < 45 && !playerCar.pitRequested) {
                        factor += 0.07;
                    }

                    if (playerCar.pitRequested && playerCar.tireLife < 55) {
                        factor += 0.05;
                    }
                }
            }

            return Math.min(1.35, factor);
        }

        _tireManagementFromData(isPlayer, pilot, car) {
            if (!isPlayer) return 0.82 + Math.random() * 0.3;

            const control = (pilot?.control || 70) / 100;
            const experience = (pilot?.experience || 70) / 100;
            const chassis = (car?.chassis?.level || 1) / 10;
            return 0.75 + control * 0.35 + experience * 0.25 + chassis * 0.2;
        }

        _consistencyFromData(isPlayer, pilot) {
            if (!isPlayer) return 0.86 + Math.random() * 0.12;
            const experience = (pilot?.experience || 70) / 100;
            return Math.min(0.99, 0.9 + experience * 0.09);
        }

        _bindControls() {
            window.addEventListener('resize', () => {
                this._resize();
                this._sampleTrack();
            });

            document.querySelectorAll('.speed-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const speed = Number(btn.dataset.speed || 1);
                    this.speedMultiplier = speed;
                    document.querySelectorAll('.speed-btn').forEach((b) => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.elSpeed.textContent = `${speed}x`;
                });
            });

            const cameraButtons = [
                { id: 'cam-full', mode: 'full' },
                { id: 'cam-follow', mode: 'follow' },
                { id: 'cam-tv', mode: 'tv' },
            ];
            cameraButtons.forEach(({ id, mode }) => {
                const button = document.getElementById(id);
                if (!button) return;
                button.addEventListener('click', () => {
                    this.cameraMode = mode;
                    document.querySelectorAll('.cam-btn').forEach((b) => b.classList.remove('active'));
                    button.classList.add('active');
                });
            });

            if (this.elPitTyreSelect) {
                this.elPitTyreSelect.value = this.selectedPitTyre;
                this.elPitTyreSelect.addEventListener('change', (e) => {
                    this.selectedPitTyre = e.target.value;
                });
            }

            const pitMain = document.getElementById('pit-btn-main');
            if (pitMain) {
                pitMain.addEventListener('click', () => this._requestPit());
            }
        }

        _requestPit() {
            const playerCars = this.cars.filter((car) => car.isPlayer && !car.finished && !car.retired);
            const car = playerCars[0];
            if (!car) return;
            if (car.inPit) return;
            car.pitRequested = true;
            car.nextPitTyre = this.selectedPitTyre || 'medium';
            this._pushMessage(`📡 ${car.abbr}: preparado para pit (${car.nextPitTyre.toUpperCase()})`, true);
        }

        _loop(timestamp) {
            if (!this.lastTimestamp) this.lastTimestamp = timestamp;
            const dt = Math.min(0.05, (timestamp - this.lastTimestamp) / 1000);
            this.lastTimestamp = timestamp;

            this._update(dt);
            this._render();
            this._renderMinimap();
            this._renderUI();

            requestAnimationFrame((ts) => this._loop(ts));
        }

        _update(dt) {
            if (this.status === 'finished') return;

            if (this.status === 'countdown') {
                this.countdown -= dt;
                this.elStatus.textContent = this.countdown > 0 ? `Semáforo ${Math.ceil(this.countdown)}` : 'En carrera';
                if (this.countdown <= 0) {
                    this.status = 'racing';
                    this._pushMessage('🟢 ¡Luces fuera!', true);
                }
                return;
            }

            this.raceTime += dt * this.speedMultiplier;
            const playerCar = this.cars.find((car) => car.isPlayer && !car.finished && !car.retired);

            for (const car of this.cars) {
                if (car.finished || car.retired) continue;
                car.lockupCooldown = Math.max(0, (car.lockupCooldown || 0) - dt);

                if (car.inPit) {
                    car.pitTime += dt * this.speedMultiplier;
                    car.progress = (car.progress + 0.0012 * this.speedMultiplier * dt * this.baseRaceSpeedFactor) % 1;
                    if (car.pitTime >= 4.5) {
                        car.inPit = false;
                        car.pitTime = 0;
                        car.pitRequested = false;
                        car.tireLife = 100;
                        car.tire = car.nextPitTyre || this._nextTire(car.tire);
                        car.nextPitTyre = null;
                        this._pushMessage(`🔧 ${car.abbr} sale de boxes (${car.tire.toUpperCase()})`, car.isPlayer);
                    }
                    continue;
                }

                let pace = car.basePace;
                const tyreFactor = this._tirePerformanceFactor(car);
                const tyreRiskFactor = this._tireRiskFactor(car);
                pace *= tyreFactor;
                pace *= car.aiAggression || 1;
                pace *= this._aiPressureFactor(car, playerCar);
                pace *= 1 + (Math.random() - 0.5) * (1 - car.consistency) * (0.2 + tyreRiskFactor * 0.35);

                if (car.tireLife < 50 && car.lockupCooldown <= 0) {
                    const compoundRisk = car.tire === 'soft' ? 1.35 : car.tire === 'medium' ? 1.15 : 1;
                    const errorChance = dt * 0.55 * (0.55 + tyreRiskFactor) * compoundRisk;
                    if (Math.random() < errorChance) {
                        pace *= 0.64 + Math.random() * 0.16;
                        car.lockupCooldown = 1.8;
                        if (car.isPlayer) {
                            this._pushMessage(`⚠️ ${car.abbr}: bloqueo en curva por neumáticos al límite`, true);
                        }
                    }
                }

                if (!car.isPlayer && !car.pitRequested && !car.inPit) {
                    const playerVulnerable = playerCar && !playerCar.inPit && playerCar.tireLife < 45 && !playerCar.pitRequested;
                    const aggressivePitThreshold = playerVulnerable ? 55 : 42;

                    if (car.tireLife <= aggressivePitThreshold) {
                        car.pitRequested = true;
                        car.nextPitTyre = this._nextTire(car.tire);
                    }
                }

                if (car.pitRequested && this._isPitWindow(car.progress)) {
                    car.inPit = true;
                    car.pitTime = 0;
                    this._pushMessage(`🔧 ${car.abbr} entra a boxes`, car.isPlayer);
                    continue;
                }

                const progressGain = pace * this.speedMultiplier * dt * this.baseRaceSpeedFactor;
                const tireWear = this._tireWearPerLap(car.tire) * progressGain / Math.max(0.65, car.tireManagement);
                car.tireLife = Math.max(0, car.tireLife - tireWear);

                car.progress += progressGain;
                if (car.progress >= 1) {
                    car.progress -= 1;
                    car.lap += 1;

                    const lapTime = this._calculateLapTime(car, pace);
                    car.lastLap = lapTime;
                    if (!car.bestLap || lapTime < car.bestLap) {
                        car.bestLap = lapTime;
                        if (!this.fastestLap || lapTime < this.fastestLap.time) {
                            this.fastestLap = { abbr: car.abbr, time: lapTime };
                        }
                    }

                    if (car.lap >= this.totalLaps) {
                        car.finished = true;
                    }
                }

                car.totalProgress = car.lap + car.progress;
            }

            this._sortPositions();

            const leader = this.cars.find((car) => car.position === 1);
            if (leader && leader.finished) {
                this.status = 'finished';
                this.elStatus.textContent = 'Finalizada';
                this._pushMessage(`🏁 ${leader.abbr} gana la carrera`, true);
                this._showResults();
            }
        }

        _sortPositions() {
            const sorted = [...this.cars].sort((a, b) => (b.totalProgress || 0) - (a.totalProgress || 0));
            sorted.forEach((car, idx) => {
                car.position = idx + 1;
            });
        }

        _render() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.width, this.height);

            const grass = ctx.createLinearGradient(0, 0, 0, this.height);
            grass.addColorStop(0, '#184f1f');
            grass.addColorStop(1, '#0e3a17');
            ctx.fillStyle = grass;
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.save();
            this._applyCamera(ctx);
            this._drawTrack(ctx);
            this._drawCars(ctx);
            ctx.restore();
        }

        _applyCamera(ctx) {
            if (this.cameraMode === 'full') {
                this.cameraState = null;
                return;
            }

            const leader = this.cars.find((car) => car.position === 1 && !car.retired);
            const player = this.cars.find((car) => car.isPlayer && !car.retired);
            const targetCar = this.cameraMode === 'follow' ? player : (leader || player);
            if (!targetCar) return;

            const targetPoint = this._pointAt(targetCar.progress % 1);
            const zoom = this.cameraMode === 'follow' ? 1.45 : 1.25;

            if (!this.cameraState) {
                this.cameraState = { x: targetPoint.x, y: targetPoint.y };
            }

            const smoothing = this.cameraMode === 'follow' ? 0.18 : 0.1;
            this.cameraState.x += (targetPoint.x - this.cameraState.x) * smoothing;
            this.cameraState.y += (targetPoint.y - this.cameraState.y) * smoothing;

            const tx = this.width / 2 - this.cameraState.x * zoom;
            const ty = this.height / 2 - this.cameraState.y * zoom;

            ctx.translate(tx, ty);
            ctx.scale(zoom, zoom);
        }

        _drawTrack(ctx) {
            if (this.trackSamples.length < 2) return;

            ctx.save();

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (this.config.trackId === 'monza') {
                this._drawMonzaDecoration(ctx);
            } else if (this.config.trackId === 'leoverse') {
                this._drawLeoverseDecoration(ctx);
            }

            ctx.strokeStyle = '#a8b1c7';
            ctx.lineWidth = 44;
            ctx.beginPath();
            this._pathTrack(ctx);
            ctx.stroke();

            ctx.strokeStyle = '#2a2e39';
            ctx.lineWidth = 34;
            ctx.beginPath();
            this._pathTrack(ctx);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(255,255,255,0.13)';
            ctx.lineWidth = 2;
            ctx.setLineDash([11, 12]);
            ctx.beginPath();
            this._pathTrack(ctx);
            ctx.stroke();
            ctx.setLineDash([]);

            if (this.config.trackId === 'leoverse') {
                this._drawLeoverseGlowOverlay(ctx);
            }

            const sf = this._pointAt(0);
            const sf2 = this._pointAt(0.002);
            const angle = Math.atan2(sf2.y - sf.y, sf2.x - sf.x) + Math.PI / 2;
            ctx.translate(sf.x, sf.y);
            ctx.rotate(angle);
            ctx.fillStyle = '#fff';
            ctx.fillRect(-20, -18, 40, 4);
            ctx.restore();
        }

        _toCanvasPoint(refX, refY) {
            const refWidth = this.track.refWidth || 1;
            const refHeight = this.track.refHeight || 1;
            return {
                x: (refX / refWidth) * this.width,
                y: (refY / refHeight) * this.height,
            };
        }

        _drawMonzaDecoration(ctx) {
            const forests = [
                [352, 355, 102, 108], [508, 404, 60, 74], [612, 656, 74, 42],
                [188, 505, 84, 104], [1188, 208, 122, 106], [1085, 360, 96, 80],
                [598, 170, 90, 50], [1018, 160, 72, 50], [910, 250, 66, 52],
                [740, 250, 120, 90], [920, 360, 150, 110], [1080, 540, 120, 95],
                [330, 650, 105, 70], [520, 706, 120, 64], [164, 270, 72, 82],
            ];

            forests.forEach(([x, y, rx, ry]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.fillStyle = 'rgba(24, 80, 31, 0.55)';
                ctx.beginPath();
                ctx.ellipse(
                    p.x,
                    p.y,
                    (rx / this.track.refWidth) * this.width,
                    (ry / this.track.refHeight) * this.height,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            });

            const roads = [
                [185, 88, 1120, 24, 0.03],
                [340, 650, 360, 18, -0.08],
                [840, 760, 520, 18, -0.03],
                [1088, 640, 300, 16, 0.32],
            ];

            roads.forEach(([x, y, w, h, angle]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(angle);
                ctx.fillStyle = 'rgba(124, 139, 148, 0.62)';
                ctx.fillRect(
                    (-w / 2 / this.track.refWidth) * this.width,
                    (-h / 2 / this.track.refHeight) * this.height,
                    (w / this.track.refWidth) * this.width,
                    (h / this.track.refHeight) * this.height
                );
                ctx.fillStyle = 'rgba(171, 184, 192, 0.75)';
                ctx.fillRect(
                    (-w / 2 / this.track.refWidth) * this.width,
                    (-h / 2 / this.track.refHeight) * this.height,
                    (w / this.track.refWidth) * this.width,
                    (h / 5 / this.track.refHeight) * this.height
                );
                ctx.restore();
            });

            const roundabout = this._toCanvasPoint(560, 170);
            ctx.fillStyle = 'rgba(160, 171, 171, 0.68)';
            ctx.beginPath();
            ctx.arc(roundabout.x, roundabout.y, (34 / this.track.refWidth) * this.width, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(32, 105, 43, 0.78)';
            ctx.beginPath();
            ctx.arc(roundabout.x, roundabout.y, (20 / this.track.refWidth) * this.width, 0, Math.PI * 2);
            ctx.fill();

            const paddock = this._toCanvasPoint(850, 240);
            const paddockW = (250 / this.track.refWidth) * this.width;
            const paddockH = (114 / this.track.refHeight) * this.height;
            ctx.fillStyle = 'rgba(149, 151, 151, 0.6)';
            ctx.fillRect(paddock.x - paddockW / 2, paddock.y - paddockH / 2, paddockW, paddockH);

            const slots = 9;
            const rows = 4;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < slots; c++) {
                    const x = paddock.x - paddockW * 0.42 + c * (paddockW * 0.09);
                    const y = paddock.y - paddockH * 0.35 + r * (paddockH * 0.22);
                    const colors = ['#ff3b30', '#2997ff', '#ffd60a', '#bf5af2', '#00d47a', '#ff9f0a'];
                    ctx.fillStyle = colors[(r + c) % colors.length];
                    ctx.fillRect(x, y, paddockW * 0.055, paddockH * 0.08);
                }
            }

            const runoffs = [
                [444, 590, 84, 52, -0.7],
                [286, 140, 98, 58, -0.26],
                [634, 545, 76, 40, -0.1],
                [1182, 708, 92, 46, 0.32],
            ];

            runoffs.forEach(([x, y, w, h, angle]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(angle);
                ctx.fillStyle = 'rgba(206, 178, 96, 0.5)';
                ctx.fillRect(
                    (-w / 2 / this.track.refWidth) * this.width,
                    (-h / 2 / this.track.refHeight) * this.height,
                    (w / this.track.refWidth) * this.width,
                    (h / this.track.refHeight) * this.height
                );
                ctx.restore();
            });

            const grandstands = [
                [430, 710, 180, 18, -0.08],
                [220, 360, 15, 164, 0],
                [300, 100, 126, 15, -0.2],
                [860, 748, 240, 22, -0.03],
                [1016, 640, 180, 18, 0.28],
                [1115, 530, 140, 15, 0.33],
                [180, 260, 120, 14, -0.25],
            ];

            grandstands.forEach(([x, y, w, h, angle]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(angle);
                ctx.fillStyle = 'rgba(92, 98, 114, 0.7)';
                ctx.fillRect(
                    (-w / 2 / this.track.refWidth) * this.width,
                    (-h / 2 / this.track.refHeight) * this.height,
                    (w / this.track.refWidth) * this.width,
                    (h / this.track.refHeight) * this.height
                );
                ctx.fillStyle = 'rgba(210, 214, 225, 0.45)';
                ctx.fillRect(
                    (-w / 2 / this.track.refWidth) * this.width,
                    (-h / 2 / this.track.refHeight) * this.height,
                    (w / this.track.refWidth) * this.width,
                    (h / 3 / this.track.refHeight) * this.height
                );
                ctx.restore();
            });

            const pitBuildings = [
                [760, 714, 300, 26, '#585f67'],
                [748, 740, 230, 16, '#666e77'],
            ];

            pitBuildings.forEach(([x, y, w, h, color]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.fillStyle = color;
                ctx.fillRect(
                    p.x - (w / 2 / this.track.refWidth) * this.width,
                    p.y - (h / 2 / this.track.refHeight) * this.height,
                    (w / this.track.refWidth) * this.width,
                    (h / this.track.refHeight) * this.height
                );
            });

            const garageStart = this._toCanvasPoint(635, 744);
            const garageW = (18 / this.track.refWidth) * this.width;
            const garageH = (11 / this.track.refHeight) * this.height;
            for (let i = 0; i < 12; i++) {
                ctx.fillStyle = i % 2 === 0 ? 'rgba(231, 236, 238, 0.8)' : 'rgba(184, 191, 196, 0.8)';
                ctx.fillRect(garageStart.x + i * garageW * 1.16, garageStart.y, garageW, garageH);
            }

            const treeDots = [
                [640, 686], [676, 688], [712, 690], [748, 692], [784, 694], [820, 696], [856, 698],
                [604, 676], [628, 678], [652, 680], [700, 684], [724, 686], [772, 690], [796, 692],
                [870, 700], [894, 702], [918, 704], [944, 706], [968, 708], [992, 710],
                [320, 620], [350, 634], [380, 648], [410, 664], [440, 680], [470, 694],
                [1060, 474], [1084, 488], [1108, 502], [1132, 516], [1158, 530], [1180, 544],
                [890, 128], [920, 136], [950, 146], [980, 158], [1010, 170], [1042, 184],
            ];
            treeDots.forEach(([x, y]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.fillStyle = 'rgba(38, 113, 47, 0.8)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, (6 / this.track.refWidth) * this.width, 0, Math.PI * 2);
                ctx.fill();
            });

            const treeClusters = [
                [160, 180, 8], [186, 198, 7], [212, 216, 8], [236, 236, 7], [262, 254, 8],
                [1018, 584, 8], [1042, 600, 7], [1068, 616, 8], [1094, 632, 7], [1120, 648, 8],
                [620, 120, 7], [644, 126, 8], [670, 134, 7], [696, 146, 8], [720, 158, 7],
            ];

            treeClusters.forEach(([x, y, r]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.fillStyle = 'rgba(27, 98, 38, 0.86)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, (r / this.track.refWidth) * this.width, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(70, 142, 66, 0.42)';
                ctx.beginPath();
                ctx.arc(p.x - (2 / this.track.refWidth) * this.width, p.y - (2 / this.track.refHeight) * this.height, (r * 0.45 / this.track.refWidth) * this.width, 0, Math.PI * 2);
                ctx.fill();
            });

            const sf = this._pointAt(0.005);
            ctx.save();
            ctx.translate(sf.x - 70, sf.y + 30);
            const stripeW = 16;
            const stripeH = 8;
            ['#1f8b4c', '#ffffff', '#d6202a'].forEach((color, idx) => {
                ctx.fillStyle = color;
                ctx.fillRect(idx * stripeW, 0, stripeW, stripeH);
            });
            ctx.restore();
        }

        _drawBahrainDecoration(ctx) {
            ctx.fillStyle = 'rgba(201, 162, 96, 0.16)';
            ctx.fillRect(0, 0, this.width, this.height);

            const dunes = [
                [0.18, 0.16, 0.22, 0.10, -0.2],
                [0.42, 0.22, 0.26, 0.11, 0.12],
                [0.74, 0.18, 0.28, 0.10, -0.08],
                [0.16, 0.74, 0.24, 0.10, 0.24],
                [0.46, 0.84, 0.30, 0.12, -0.14],
                [0.82, 0.72, 0.24, 0.10, 0.18],
            ];

            dunes.forEach(([x, y, w, h, angle]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(angle);
                ctx.fillStyle = 'rgba(230, 197, 132, 0.28)';
                ctx.beginPath();
                ctx.ellipse(
                    0,
                    0,
                    (w * this.width) / 2,
                    (h * this.height) / 2,
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.restore();
            });

            const runOffs = [
                [0.26, 0.64, 0.22, 0.08, 0.1],
                [0.62, 0.62, 0.20, 0.08, -0.05],
                [0.82, 0.48, 0.16, 0.07, 0.2],
                [0.58, 0.30, 0.20, 0.08, -0.22],
            ];

            runOffs.forEach(([x, y, w, h, angle]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(angle);
                ctx.fillStyle = 'rgba(216, 183, 111, 0.35)';
                ctx.fillRect(-w * this.width / 2, -h * this.height / 2, w * this.width, h * this.height);
                ctx.restore();
            });

            const tents = [
                [0.53, 0.88], [0.57, 0.88], [0.61, 0.88], [0.65, 0.88],
                [0.69, 0.88], [0.73, 0.88], [0.77, 0.88],
            ];

            tents.forEach(([x, y], index) => {
                const p = this._toCanvasPoint(x, y);
                const tw = this.width * 0.024;
                const th = this.height * 0.015;
                const colors = ['#ff4d4f', '#40a9ff', '#ffd666', '#73d13d', '#9254de', '#ffa940'];
                ctx.fillStyle = colors[index % colors.length];
                ctx.fillRect(p.x - tw / 2, p.y - th / 2, tw, th);
            });

            const pit = this._toCanvasPoint(0.66, 0.92);
            ctx.fillStyle = 'rgba(121, 128, 138, 0.65)';
            ctx.fillRect(pit.x - this.width * 0.13, pit.y - this.height * 0.02, this.width * 0.26, this.height * 0.032);
            ctx.fillStyle = 'rgba(178, 186, 196, 0.52)';
            ctx.fillRect(pit.x - this.width * 0.13, pit.y - this.height * 0.02, this.width * 0.26, this.height * 0.009);

            const floodlights = [
                [0.16, 0.82], [0.26, 0.80], [0.38, 0.79], [0.52, 0.79], [0.66, 0.80], [0.80, 0.82],
                [0.86, 0.62], [0.84, 0.40], [0.74, 0.22], [0.54, 0.18], [0.30, 0.22], [0.16, 0.36],
            ];

            floodlights.forEach(([x, y]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.strokeStyle = 'rgba(186, 190, 198, 0.8)';
                ctx.lineWidth = this.width * 0.0016;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x, p.y - this.height * 0.03);
                ctx.stroke();
                ctx.fillStyle = 'rgba(255, 241, 198, 0.85)';
                ctx.beginPath();
                ctx.arc(p.x, p.y - this.height * 0.032, this.width * 0.0048, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        _drawLeoverseDecoration(ctx) {
            const baseGlow = ctx.createRadialGradient(
                this.width * 0.54,
                this.height * 0.52,
                this.width * 0.08,
                this.width * 0.54,
                this.height * 0.52,
                this.width * 0.72
            );
            baseGlow.addColorStop(0, 'rgba(121, 77, 214, 0.24)');
            baseGlow.addColorStop(0.5, 'rgba(77, 207, 255, 0.12)');
            baseGlow.addColorStop(1, 'rgba(8, 10, 28, 0)');
            ctx.fillStyle = baseGlow;
            ctx.fillRect(0, 0, this.width, this.height);

            const auroras = [
                [0.24, 0.20, 0.34, 0.06, -0.20, 'rgba(102, 255, 232, 0.10)'],
                [0.72, 0.24, 0.30, 0.05, 0.14, 'rgba(189, 119, 255, 0.11)'],
                [0.30, 0.82, 0.40, 0.07, 0.10, 'rgba(116, 205, 255, 0.10)'],
                [0.76, 0.76, 0.28, 0.05, -0.12, 'rgba(128, 255, 171, 0.09)'],
            ];

            auroras.forEach(([x, y, w, h, angle, color]) => {
                const p = this._toCanvasPoint(x, y);
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(angle);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(0, 0, (w * this.width) / 2, (h * this.height) / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            const nodes = [
                [0.18, 0.62], [0.28, 0.78], [0.40, 0.86], [0.58, 0.18],
                [0.72, 0.20], [0.84, 0.34], [0.88, 0.54], [0.74, 0.70],
            ];

            nodes.forEach(([x, y], i) => {
                const p = this._toCanvasPoint(x, y);
                const radius = this.width * (0.009 + (i % 3) * 0.0025);
                const color = i % 2 === 0 ? 'rgba(96, 236, 255, 0.85)' : 'rgba(192, 134, 255, 0.82)';
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius * 0.45, 0, Math.PI * 2);
                ctx.fill();
            });

            const pulses = [
                [0.56, 0.50, 0.10], [0.56, 0.50, 0.16], [0.56, 0.50, 0.22]
            ];
            pulses.forEach(([x, y, r], idx) => {
                const p = this._toCanvasPoint(x, y);
                ctx.strokeStyle = idx % 2 === 0 ? 'rgba(117, 237, 255, 0.32)' : 'rgba(201, 130, 255, 0.32)';
                ctx.lineWidth = this.width * 0.0022;
                ctx.beginPath();
                ctx.arc(p.x, p.y, r * this.width, 0, Math.PI * 2);
                ctx.stroke();
            });
        }

        _drawLeoverseGlowOverlay(ctx) {
            ctx.save();

            ctx.strokeStyle = 'rgba(79, 235, 255, 0.16)';
            ctx.lineWidth = 56;
            ctx.beginPath();
            this._pathTrack(ctx);
            ctx.stroke();

            ctx.strokeStyle = 'rgba(179, 122, 255, 0.22)';
            ctx.lineWidth = 38;
            ctx.beginPath();
            this._pathTrack(ctx);
            ctx.stroke();

            const sparkFractions = [0.03, 0.11, 0.17, 0.24, 0.31, 0.37, 0.44, 0.52, 0.60, 0.67, 0.75, 0.83, 0.91];
            sparkFractions.forEach((fraction, index) => {
                const p = this._pointAt(fraction);
                const s = this.width * (0.0028 + (index % 3) * 0.0008);
                ctx.fillStyle = index % 2 === 0 ? 'rgba(105, 245, 255, 0.78)' : 'rgba(198, 132, 255, 0.74)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.restore();
        }

        _drawMonzaKerbs(ctx) {
            const kerbFractions = [0.138, 0.166, 0.352, 0.392, 0.666, 0.708, 0.862, 0.898, 0.936, 0.972];
            const length = 30;
            const halfWidth = 26;

            kerbFractions.forEach((fraction) => {
                const point = this._pointAt(fraction);
                const ahead = this._pointAt((fraction + 0.0025) % 1);
                const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x);

                ctx.save();
                ctx.translate(point.x, point.y);
                ctx.rotate(angle + Math.PI / 2);

                ctx.fillStyle = '#d11a1a';
                ctx.fillRect(-halfWidth, -length / 2, 10, length);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-halfWidth + 10, -length / 2, 10, length);
                ctx.fillStyle = '#d11a1a';
                ctx.fillRect(-halfWidth + 20, -length / 2, 10, length);

                ctx.restore();
            });
        }

        _drawCars(ctx) {
            const drawOrder = [...this.cars].sort((a, b) => a.position - b.position).reverse();
            for (const car of drawOrder) {
                if (car.retired) continue;
                const p = this._pointAt(car.progress % 1);
                const ahead = this._pointAt((car.progress + 0.003) % 1);
                const angle = Math.atan2(ahead.y - p.y, ahead.x - p.x);

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(angle);

                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                ctx.beginPath();
                ctx.ellipse(1, 1.5, 10, 5, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = car.teamColor;
                ctx.fillRect(-8, -4, 16, 8);
                ctx.fillStyle = '#f8f8f8';
                ctx.fillRect(-4, -1, 8, 2);

                ctx.restore();
            }
        }

        _renderMinimap() {
            const ctx = this.minimapCtx;
            const w = this.minimap.width;
            const h = this.minimap.height;
            ctx.clearRect(0, 0, w, h);

            ctx.fillStyle = '#0e1534';
            ctx.fillRect(0, 0, w, h);

            const scaleX = w / this.width;
            const scaleY = h / this.height;

            ctx.strokeStyle = 'rgba(255,255,255,0.35)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            this.trackSamples.forEach((point, i) => {
                if (i === 0) ctx.moveTo(point.x * scaleX, point.y * scaleY);
                else ctx.lineTo(point.x * scaleX, point.y * scaleY);
            });
            ctx.stroke();

            for (const car of this.cars) {
                if (car.retired) continue;
                const p = this._pointAt(car.progress % 1);
                ctx.fillStyle = car.teamColor;
                ctx.beginPath();
                ctx.arc(p.x * scaleX, p.y * scaleY, car.isPlayer ? 3.5 : 2.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        _renderUI() {
            const leader = this.cars.find((car) => car.position === 1);
            const leaderLap = leader ? Math.min(this.totalLaps, leader.lap + 1) : 1;
            this.elLap.textContent = `${leaderLap}/${this.totalLaps}`;
            this.elTimer.textContent = this._formatTime(this.raceTime);
            this.elStatus.textContent = this.status === 'racing' ? 'En carrera' : (this.status === 'finished' ? 'Finalizada' : this.elStatus.textContent);

            if (this.fastestLap) {
                this.elFastest.textContent = `⚡ ${this.fastestLap.abbr} ${this._formatTime(this.fastestLap.time)}`;
            }

            this._renderTimingBoard();
            this._renderDriverInfo();
            this._renderMessages();
        }

        _renderStaticUI() {
            this.elSpeed.textContent = `${this.speedMultiplier}x`;
        }

        _renderTimingBoard() {
            const sorted = [...this.cars].sort((a, b) => a.position - b.position);
            const leader = sorted[0];
            this.elTiming.innerHTML = '';

            sorted.forEach((car) => {
                const row = document.createElement('div');
                row.className = `timing-row${car.isPlayer ? ' player' : ''}`;

                const gap = car.position === 1
                    ? 'Líder'
                    : `+${((leader.totalProgress - car.totalProgress) * this.track.baseLapSeconds).toFixed(1)}s`;

                row.innerHTML = `
                    <span class="timing-pos">P${car.position}</span>
                    <span class="timing-name">${car.abbr} · ${car.team}</span>
                    <span class="timing-gap">${gap}</span>
                `;

                this.elTiming.appendChild(row);
            });
        }

        _renderDriverInfo() {
            const playerCars = this.cars.filter((car) => car.isPlayer);
            this.elDriverInfo.innerHTML = '';

            playerCars.forEach((car) => {
                const card = document.createElement('div');
                card.className = 'driver-card';
                card.innerHTML = `
                    <strong>${car.name}</strong><br>
                    P${car.position} · V ${Math.min(this.totalLaps, car.lap + 1)}/${this.totalLaps}<br>
                    Neumático: ${car.tire.toUpperCase()} · ${Math.round(car.tireLife)}%<br>
                    Próximo pit: ${(car.nextPitTyre || this.selectedPitTyre || car.tire).toUpperCase()}<br>
                    ${car.inPit ? '🔧 En boxes' : car.pitRequested ? '📡 Pit solicitado' : '🏎️ En pista'}
                `;
                this.elDriverInfo.appendChild(card);
            });
        }

        _renderMessages() {
            this.elMessages.innerHTML = '';
            this.messages.slice(-10).forEach((item) => {
                const line = document.createElement('div');
                line.className = `msg${item.highlight ? ' highlight' : ''}`;
                line.textContent = item.text;
                this.elMessages.appendChild(line);
            });
            this.elMessages.scrollTop = this.elMessages.scrollHeight;
        }

        _showResults() {
            const sorted = [...this.cars].sort((a, b) => a.position - b.position);
            const rows = sorted.slice(0, 10).map((car) => `
                <tr>
                    <td>P${car.position}</td>
                    <td>${car.name}</td>
                    <td>${car.team}</td>
                    <td>${car.bestLap ? this._formatTime(car.bestLap) : '--:--.---'}</td>
                    <td>${car.tire}</td>
                </tr>
            `).join('');

            this.elResultsTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Piloto</th>
                        <th>Equipo</th>
                        <th>Mejor vuelta</th>
                        <th>Último compuesto</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            `;

            this.elResultsModal.classList.remove('hidden');
            this._persistRaceResults(sorted);
        }

        async _persistRaceResults(sorted) {
            if (this.resultsPersisted || !this.token) return;
            this.resultsPersisted = true;

            const playerCars = sorted.filter((car) => car.isPlayer);
            if (!playerCars.length) return;

            const bestPlayerPosition = Math.min(...playerCars.map((car) => car.position));
            const isWin = bestPlayerPosition === 1;
            const isPodium = bestPlayerPosition <= 3;
            const pointsByPosition = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };
            const pointsGained = pointsByPosition[bestPlayerPosition] || 0;
            const moneyGained = pointsGained > 0 ? pointsGained * 50000 : 25000;

            try {
                const profileResponse = await fetch(`${this.apiBaseUrl}/user/profile`, {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!profileResponse.ok) {
                    throw new Error('No se pudo cargar el perfil para guardar la carrera');
                }

                const profileData = await profileResponse.json();
                const user = profileData.user || {};
                const gameData = user.gameData || {};
                const raceHistory = Array.isArray(gameData.raceHistory) ? [...gameData.raceHistory] : [];

                raceHistory.unshift({
                    trackId: this.config.trackId,
                    trackName: this.track.name,
                    date: new Date().toISOString(),
                    position: bestPlayerPosition,
                    points: pointsGained,
                    laps: this.totalLaps,
                    bestLap: this.fastestLap?.abbr && playerCars.some((car) => car.abbr === this.fastestLap.abbr)
                        ? this.fastestLap.time
                        : null,
                });

                const trimmedHistory = raceHistory.slice(0, 50);

                const updateResponse = await fetch(`${this.apiBaseUrl}/user/profile`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        gameData: {
                            budget: (gameData.budget || 0) + moneyGained,
                            racesCompleted: (gameData.racesCompleted || 0) + 1,
                            wins: (gameData.wins || 0) + (isWin ? 1 : 0),
                            podiums: (gameData.podiums || 0) + (isPodium ? 1 : 0),
                            points: (gameData.points || 0) + pointsGained,
                            raceHistory: trimmedHistory,
                        }
                    })
                });

                if (!updateResponse.ok) {
                    throw new Error('No se pudo guardar el resultado en la base de datos');
                }

                this._pushMessage(`💾 Resultado guardado (+${pointsGained} pts / +${moneyGained.toLocaleString('es-ES')}$)`, true);
            } catch (error) {
                console.error('Error saving race result:', error);
                this._pushMessage('⚠️ Error guardando resultado en base de datos', true);
            }
        }

        _isPitWindow(progress) {
            const w = this.track.pitWindow;
            if (w.start <= w.end) {
                return progress >= w.start && progress <= w.end;
            }
            return progress >= w.start || progress <= w.end;
        }

        _tireWearPerLap(compound) {
            const raceLaps = Math.max(4, this.totalLaps || 12);
            const stints = {
                soft: Math.max(3, Math.round(raceLaps * 0.22)),
                medium: Math.max(4, Math.round(raceLaps * 0.36)),
                hard: Math.max(5, Math.round(raceLaps * 0.62)),
            };
            const stintLaps = stints[compound] || stints.medium;
            return 100 / stintLaps;
        }

        _tirePerformanceFactor(car) {
            const life = Math.max(0, Math.min(100, car.tireLife || 0));
            let factor = 1 - (100 - life) * 0.0036;

            if (life < 50) {
                const ratio = (50 - life) / 50;
                const compoundPenalty = car.tire === 'soft' ? 1.5 : car.tire === 'medium' ? 1.3 : 1.0;
                factor -= ratio * ratio * 0.3 * compoundPenalty;

                if (life < 30) {
                    const deepRatio = (30 - life) / 30;
                    factor -= deepRatio * 0.08 * compoundPenalty;
                }
            }

            return Math.max(0.18, factor);
        }

        _tireRiskFactor(car) {
            const life = Math.max(0, Math.min(100, car.tireLife || 0));
            if (life >= 50) return 0;
            const ratio = (50 - life) / 50;
            const compoundRisk = car.tire === 'soft' ? 1.45 : car.tire === 'medium' ? 1.25 : 1;
            return ratio * compoundRisk;
        }

        _criticalTyreTimePenalty(car) {
            const life = Math.max(0, Math.min(100, car.tireLife || 0));
            if (life >= 50) return 0;

            const ratio = (50 - life) / 50;
            const compoundScale = car.tire === 'soft' ? 2.8 : car.tire === 'medium' ? 2.3 : 1.6;
            let penalty = Math.pow(ratio, 1.7) * 4.2 * compoundScale;

            if (life < 30) {
                penalty += Math.pow((30 - life) / 30, 1.4) * 2.2 * compoundScale;
            }

            return penalty;
        }

        _calculateLapTime(car, pace) {
            const base = this.track.baseLapSeconds || 90;
            const fastestReference = this.track.fastestLapSeconds || Math.max(60, base - 2);

            const paceDelta = (0.0115 - pace) * 900;
            const tyrePenalty = (100 - car.tireLife) * 0.052 + this._criticalTyreTimePenalty(car);
            const randomSpread = (Math.random() - 0.5) * (2.0 - car.consistency * 1.3 + this._tireRiskFactor(car) * 1.8);

            let lapTime = base + paceDelta + tyrePenalty + randomSpread;
            lapTime = Math.max(fastestReference - 0.12, lapTime);
            lapTime = Math.min(base + 24, lapTime);

            return lapTime;
        }

        _nextTire(current) {
            if (current === 'soft') return 'medium';
            if (current === 'medium') return 'hard';
            return 'medium';
        }

        _pushMessage(text, highlight = false) {
            this.messages.push({ text, highlight });
            if (this.messages.length > 40) this.messages.shift();
        }

        _pathTrack(ctx) {
            this.trackSamples.forEach((point, idx) => {
                if (idx === 0) ctx.moveTo(point.x, point.y);
                else ctx.lineTo(point.x, point.y);
            });
        }

        _pointAt(progress) {
            const p = ((progress % 1) + 1) % 1;
            const target = this.trackLength * p;
            let walked = 0;

            for (let i = 0; i < this.trackSamples.length - 1; i++) {
                const a = this.trackSamples[i];
                const b = this.trackSamples[i + 1];
                const d = this._dist(a, b);
                if (walked + d >= target) {
                    const t = (target - walked) / Math.max(1e-6, d);
                    return {
                        x: a.x + (b.x - a.x) * t,
                        y: a.y + (b.y - a.y) * t,
                    };
                }
                walked += d;
            }

            return this.trackSamples[this.trackSamples.length - 1];
        }

        _dist(a, b) {
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        _formatTime(seconds) {
            const s = Math.max(0, seconds || 0);
            const mins = Math.floor(s / 60);
            const rest = (s % 60).toFixed(3).padStart(6, '0');
            return `${mins}:${rest}`;
        }

        _abbr(name) {
            if (!name) return 'DRV';
            const words = name.trim().split(/\s+/).filter(Boolean);
            if (words.length >= 2) {
                return (words[0][0] + words[1].slice(0, 2)).toUpperCase();
            }
            return name.slice(0, 3).toUpperCase();
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        new OfflineRace();
    });
})();
