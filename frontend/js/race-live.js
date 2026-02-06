/**
 * MS Manager - Live Race Controller
 * Sistema de carreras en vivo con visualización en tiempo real
 */

class RaceLiveController {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5000/api';
        this.token = localStorage.getItem('authToken');
        this.userId = null;
        
        // Race data
        this.raceId = null;
        this.leagueId = null;
        this.race = null;
        this.myParticipant = null;
        
        // Track data
        this.track = null;
        this.trackPath = null;
        
        // Timers
        this.countdownInterval = null;
        this.raceInterval = null;
        this.updateInterval = null;
        
        // Pit stop settings
        this.selectedTyre = 'medium';
        this.selectedFuel = 20;
        
        // Race duration config - 10 minutes = 600 seconds
        this.RACE_DURATION_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
        this.raceStartTime = null;
        this.raceElapsedTime = 0;
        
        this.init();
    }
    
    async init() {
        if (!this.token) {
            window.location.href = 'index.html';
            return;
        }
        
        // Get race ID from URL
        const params = new URLSearchParams(window.location.search);
        this.raceId = params.get('race');
        this.leagueId = params.get('league');
        
        if (!this.raceId && !this.leagueId) {
            alert('No se especificó carrera');
            window.location.href = 'online.html';
            return;
        }
        
        await this.loadUserData();
        await this.loadRaceData();
        this.bindEvents();
        this.startUpdates();
    }
    
    /**
     * Cargar datos del usuario
     */
    async loadUserData() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/user/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.userId = data.user._id || data.user.id;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
    
    /**
     * Cargar datos de la carrera
     */
    async loadRaceData() {
        try {
            let url;
            
            // Si tenemos raceId, cargar esa carrera específica
            if (this.raceId) {
                url = `${this.apiBaseUrl}/race/${this.raceId}`;
            } 
            // Si tenemos leagueId, cargar carrera activa de la liga
            else if (this.leagueId) {
                url = `${this.apiBaseUrl}/race/league/${this.leagueId}/active`;
            }
            
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.race) {
                    this.race = data.race;
                    this.raceId = data.race._id;
                    
                    // Encontrar mi participante
                    this.myParticipant = this.race.liveState.participants.find(
                        p => p.user === this.userId || p.user?._id === this.userId
                    );
                    
                    // Si no estoy en la carrera, unirme automáticamente
                    if (!this.myParticipant && ['scheduled', 'practice', 'qualifying'].includes(this.race.status)) {
                        await this.joinRace();
                    }
                } else {
                    throw new Error('Race data not found');
                }
            } else {
                throw new Error('Failed to load race');
            }
        } catch (error) {
            console.error('Error loading race data, using mock:', error);
            // Fallback to mock data for development
            this.race = this.generateMockRace();
            this.myParticipant = this.race.liveState.participants.find(p => p.isPlayer);
        }
        
        this.updateUI();
        this.loadTrack();
        this.checkRaceStatus();
    }
    
    /**
     * Unirse a la carrera
     */
    async joinRace() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/race/${this.raceId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tyreCompound: 'medium',
                    fuelLoad: 100
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.race = data.race;
                this.myParticipant = this.race.liveState.participants.find(
                    p => p.user === this.userId || p.user?._id === this.userId
                );
            }
        } catch (error) {
            console.error('Error joining race:', error);
        }
    }
    
    /**
     * Generar carrera de prueba
     */
    generateMockRace() {
        const trackId = 'monza';
        const track = TRACKS_DATA[trackId];
        
        const participants = [];
        const teams = [
            { name: 'Red Bull Racing', color: '#1e3a8a' },
            { name: 'Ferrari', color: '#dc2626' },
            { name: 'Mercedes', color: '#0d9488' },
            { name: 'McLaren', color: '#f97316' },
            { name: 'Aston Martin', color: '#166534' },
            { name: 'Alpine', color: '#0ea5e9' },
            { name: 'Williams', color: '#1d4ed8' },
            { name: 'AlphaTauri', color: '#1e293b' },
            { name: 'Alfa Romeo', color: '#991b1b' },
            { name: 'Haas', color: '#4b5563' }
        ];
        
        const drivers = [
            'Max Verstappen', 'Charles Leclerc', 'Lewis Hamilton', 'Lando Norris',
            'Fernando Alonso', 'Pierre Gasly', 'Alex Albon', 'Yuki Tsunoda',
            'Valtteri Bottas', 'Kevin Magnussen', 'Sergio Pérez', 'Carlos Sainz',
            'George Russell', 'Oscar Piastri', 'Lance Stroll', 'Esteban Ocon'
        ];
        
        // Generate 16 participants
        for (let i = 0; i < 16; i++) {
            const isMe = i === 5; // Player is in position 6
            const team = teams[Math.floor(i / 2)];
            
            participants.push({
                user: isMe ? this.userId : `user_${i}`,
                pilotName: drivers[i],
                teamName: team.name,
                teamColor: team.color,
                position: i + 1,
                currentLap: 0,
                lastLapTime: null,
                lastLapMs: null,
                bestLapTime: null,
                bestLapMs: null,
                totalTime: 0,
                gap: i === 0 ? 'Líder' : `+${(i * 1.5).toFixed(3)}`,
                interval: i === 0 ? '-' : `+${((Math.random() * 2) + 0.5).toFixed(3)}`,
                trackProgress: Math.random() * 100,
                tyres: {
                    compound: 'medium',
                    wear: 100
                },
                fuel: {
                    current: 100,
                    consumption: 1.8
                },
                damage: 0,
                status: 'racing',
                pitStops: [],
                isConnected: true,
                isPlayer: isMe
            });
        }
        
        // Scheduled time: 30 seconds from now for testing
        const scheduledTime = new Date();
        scheduledTime.setSeconds(scheduledTime.getSeconds() + 30);
        
        return {
            _id: 'race_1',
            league: {
                _id: this.leagueId || 'league_1',
                name: 'Spanish Racing Series'
            },
            circuit: {
                id: trackId,
                name: track.name,
                country: track.country,
                laps: 10, // Short race for testing
                length: track.length
            },
            raceNumber: 18,
            seasonNumber: 1,
            scheduledTime: scheduledTime,
            status: 'scheduled', // scheduled, practice, qualifying, racing, finished
            currentLap: 0,
            totalLaps: 10,
            weather: {
                condition: 'sunny',
                temperature: 25,
                trackTemperature: 35,
                rainChance: 10
            },
            liveState: {
                participants: participants,
                events: [],
                flags: {
                    safetycar: false,
                    yellowFlag: false,
                    redFlag: false
                },
                fastestLap: null
            },
            chat: []
        };
    }
    
    /**
     * Cargar pista SVG
     */
    loadTrack() {
        const trackId = this.race.circuit.id;
        this.track = TRACKS_DATA[trackId];
        
        // Load track SVG
        const trackSvg = document.getElementById('track-svg');
        
        // Create simple oval track path for now
        // In production, load actual SVG from file
        const trackPath = this.createTrackPath();
        trackSvg.innerHTML = trackPath;
        
        // Store path for car positioning
        this.trackPath = document.querySelector('#track-path');
        
        // Initialize car markers
        this.initCarMarkers();
    }
    
    /**
     * Crear path de la pista (simplificado)
     */
    createTrackPath() {
        // Simple race track shape
        return `
            <defs>
                <linearGradient id="track-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#444"/>
                    <stop offset="50%" style="stop-color:#555"/>
                    <stop offset="100%" style="stop-color:#444"/>
                </linearGradient>
            </defs>
            
            <!-- Track outline -->
            <path id="track-path" 
                  d="M 150,250 
                     C 150,100 300,50 400,50
                     C 500,50 650,100 650,200
                     C 650,280 580,320 500,350
                     C 420,380 350,400 300,400
                     C 200,400 150,350 150,250 Z"
                  class="track-outline"
                  fill="none"
                  stroke="#333"
                  stroke-width="45"/>
                  
            <!-- Track surface -->
            <path d="M 150,250 
                     C 150,100 300,50 400,50
                     C 500,50 650,100 650,200
                     C 650,280 580,320 500,350
                     C 420,380 350,400 300,400
                     C 200,400 150,350 150,250 Z"
                  fill="none"
                  stroke="url(#track-gradient)"
                  stroke-width="35"/>
            
            <!-- Start/Finish line -->
            <line x1="145" y1="250" x2="155" y2="250" 
                  stroke="white" stroke-width="3"/>
            
            <!-- Pit lane indicator -->
            <rect x="200" y="320" width="100" height="20" 
                  fill="rgba(255,165,0,0.3)" rx="3"/>
            <text x="250" y="335" fill="white" font-size="10" 
                  text-anchor="middle">PIT</text>
        `;
    }
    
    /**
     * Inicializar marcadores de coches
     */
    initCarMarkers() {
        const container = document.getElementById('cars-container');
        container.innerHTML = '';
        
        this.race.liveState.participants.forEach((participant, index) => {
            const marker = document.createElement('div');
            marker.className = 'car-marker';
            if (participant.isPlayer) {
                marker.classList.add('my-car');
            }
            marker.id = `car-${index}`;
            marker.style.backgroundColor = participant.teamColor;
            marker.textContent = participant.position;
            marker.title = `${participant.pilotName} - ${participant.teamName}`;
            
            container.appendChild(marker);
        });
        
        this.updateCarPositions();
    }
    
    /**
     * Actualizar posiciones de los coches en la pista
     */
    updateCarPositions() {
        const path = document.getElementById('track-path');
        if (!path) return;
        
        const pathLength = path.getTotalLength();
        
        this.race.liveState.participants.forEach((participant, index) => {
            const marker = document.getElementById(`car-${index}`);
            if (!marker) return;
            
            // Calculate position on path
            const progress = participant.trackProgress / 100;
            const point = path.getPointAtLength(progress * pathLength);
            
            // Position marker
            const svgRect = document.getElementById('track-svg').getBoundingClientRect();
            const containerRect = document.getElementById('track-container').getBoundingClientRect();
            
            const scaleX = containerRect.width / 800;
            const scaleY = containerRect.height / 500;
            
            marker.style.left = `${point.x * scaleX}px`;
            marker.style.top = `${point.y * scaleY}px`;
            marker.textContent = participant.position;
            
            // Update status
            if (participant.status === 'pit') {
                marker.classList.add('pit');
            } else {
                marker.classList.remove('pit');
            }
        });
    }
    
    /**
     * Actualizar UI
     */
    updateUI() {
        // Header info
        document.getElementById('league-name').textContent = this.race.league.name;
        document.getElementById('race-number').textContent = this.race.raceNumber;
        document.getElementById('total-races').textContent = 18;
        document.getElementById('current-lap').textContent = this.race.currentLap;
        document.getElementById('total-laps').textContent = this.race.totalLaps;
        
        // Weather
        const weatherIcons = {
            sunny: '☀️',
            cloudy: '🌤️',
            lightRain: '🌧️',
            heavyRain: '⛈️',
            night: '🌙'
        };
        document.querySelector('.weather-icon').textContent = 
            weatherIcons[this.race.weather.condition] || '☀️';
        document.querySelector('.weather-temp').textContent = 
            `${this.race.weather.temperature}°C`;
        
        // Circuit info
        document.getElementById('circuit-name').textContent = this.race.circuit.name;
        document.getElementById('circuit-length').textContent = this.race.circuit.length;
        document.getElementById('circuit-laps').textContent = this.race.totalLaps;
        
        // Standings
        this.updateStandings();
        
        // My car panel
        this.updateMyCarPanel();
        
        // Session status
        this.updateSessionStatus();
    }
    
    /**
     * Actualizar clasificación
     */
    updateStandings() {
        const container = document.getElementById('standings-list');
        container.innerHTML = '';
        
        const sorted = [...this.race.liveState.participants]
            .sort((a, b) => a.position - b.position);
        
        sorted.forEach(p => {
            const isMe = p.isPlayer;
            const posClass = p.position <= 3 ? `p${p.position}` : '';
            
            const row = document.createElement('div');
            row.className = `standing-row ${isMe ? 'my-row' : ''}`;
            row.innerHTML = `
                <span class="standing-pos ${posClass}">${p.position}</span>
                <div class="standing-color" style="background: ${p.teamColor}"></div>
                <div class="standing-info">
                    <div class="standing-driver">${p.pilotName}</div>
                    <div class="standing-team">${p.teamName}</div>
                </div>
                <div class="standing-time">
                    <div class="standing-gap">${p.gap}</div>
                    <div class="standing-interval">${p.interval}</div>
                </div>
                <div class="standing-status ${p.status === 'pit' ? 'pit' : ''}">
                    ${p.status === 'pit' ? '🔧' : p.status === 'retired' ? '❌' : ''}
                </div>
            `;
            
            container.appendChild(row);
        });
    }
    
    /**
     * Actualizar panel de mi coche
     */
    updateMyCarPanel() {
        this.myParticipant = this.race.liveState.participants.find(p => p.isPlayer);
        if (!this.myParticipant) return;
        
        const p = this.myParticipant;
        
        document.getElementById('my-position').textContent = `P${p.position}`;
        document.getElementById('my-last-lap').textContent = p.lastLapTime || '--:--:---';
        
        // Tyres
        document.getElementById('my-tyre-compound').textContent = 
            p.tyres.compound.toUpperCase();
        document.getElementById('my-tyre-compound').className = 
            `tyre-compound ${p.tyres.compound}`;
        document.getElementById('my-tyre-wear').style.width = `${p.tyres.wear}%`;
        document.getElementById('my-tyre-percent').textContent = Math.round(p.tyres.wear);
        
        // Fuel
        const fuelPercent = (p.fuel.current / 110) * 100;
        const fuelLaps = Math.floor(p.fuel.current / p.fuel.consumption);
        document.getElementById('my-fuel-kg').textContent = `${Math.round(p.fuel.current)} kg`;
        document.getElementById('my-fuel-level').style.width = `${fuelPercent}%`;
        document.getElementById('my-fuel-laps').textContent = `~${fuelLaps}`;
    }
    
    /**
     * Actualizar estado de sesión
     */
    updateSessionStatus() {
        const indicator = document.getElementById('session-indicator');
        const statusEl = indicator.querySelector('.session-status');
        const nameEl = indicator.querySelector('.session-name');
        
        const statusMap = {
            scheduled: { text: 'PRÓXIMA', class: 'upcoming', name: 'ESPERANDO' },
            practice: { text: 'EN VIVO', class: 'live', name: 'PRÁCTICA LIBRE' },
            qualifying: { text: 'EN VIVO', class: 'live', name: 'CLASIFICACIÓN' },
            racing: { text: 'EN VIVO', class: 'live', name: 'CARRERA' },
            finished: { text: 'FIN', class: 'finished', name: 'FINALIZADA' }
        };
        
        const status = statusMap[this.race.status] || statusMap.scheduled;
        statusEl.textContent = status.text;
        statusEl.className = `session-status ${status.class}`;
        nameEl.textContent = status.name;
    }
    
    /**
     * Verificar estado de la carrera
     */
    checkRaceStatus() {
        const now = new Date();
        const raceTime = new Date(this.race.scheduledTime);
        const timeDiff = raceTime - now;
        
        if (this.race.status === 'scheduled') {
            if (timeDiff > 0) {
                // Show countdown
                this.showCountdown(timeDiff);
            } else {
                // Race should start
                this.startRace();
            }
        } else if (this.race.status === 'racing') {
            // Hide countdown, show race
            document.getElementById('countdown-overlay').style.display = 'none';
            this.startRaceSimulation();
        }
    }
    
    /**
     * Mostrar cuenta atrás
     */
    showCountdown(timeDiff) {
        const overlay = document.getElementById('countdown-overlay');
        overlay.style.display = 'flex';
        
        this.updateCountdownDisplay(timeDiff);
        
        this.countdownInterval = setInterval(() => {
            const now = new Date();
            const raceTime = new Date(this.race.scheduledTime);
            const remaining = raceTime - now;
            
            if (remaining <= 0) {
                clearInterval(this.countdownInterval);
                this.startRace();
            } else {
                this.updateCountdownDisplay(remaining);
            }
        }, 1000);
    }
    
    /**
     * Actualizar display de cuenta atrás
     */
    updateCountdownDisplay(ms) {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        
        document.getElementById('countdown-hours').textContent = 
            hours.toString().padStart(2, '0');
        document.getElementById('countdown-minutes').textContent = 
            minutes.toString().padStart(2, '0');
        document.getElementById('countdown-seconds').textContent = 
            seconds.toString().padStart(2, '0');
    }
    
    /**
     * Iniciar carrera
     */
    startRace() {
        // Hide countdown
        document.getElementById('countdown-overlay').style.display = 'none';
        
        // Show start lights
        this.showStartLights();
    }
    
    /**
     * Mostrar luces de salida
     */
    showStartLights() {
        const lights = document.getElementById('start-lights');
        lights.style.display = 'flex';
        
        let lightCount = 0;
        const lightInterval = setInterval(() => {
            if (lightCount < 5) {
                document.getElementById(`light-${lightCount + 1}`).classList.add('on');
                lightCount++;
            } else {
                clearInterval(lightInterval);
                
                // Random delay before lights out (1-3 seconds)
                const delay = 1000 + Math.random() * 2000;
                setTimeout(() => {
                    // Lights out!
                    for (let i = 1; i <= 5; i++) {
                        document.getElementById(`light-${i}`).classList.remove('on');
                        document.getElementById(`light-${i}`).classList.add('go');
                    }
                    
                    // Hide after animation
                    setTimeout(() => {
                        lights.style.display = 'none';
                        this.race.status = 'racing';
                        this.race.currentLap = 1;
                        this.raceStartTime = Date.now(); // Track real start time
                        this.updateUI();
                        this.startRaceSimulation();
                        this.addChatMessage('Sistema', '🏁 ¡Luces apagadas! ¡Comienza la carrera de 10 minutos!', true);
                    }, 1000);
                }, delay);
            }
        }, 1000);
    }
    
    /**
     * Iniciar simulación de carrera
     */
    startRaceSimulation() {
        // Update every 100ms for smooth animation
        this.raceInterval = setInterval(() => {
            this.simulateRaceTick();
        }, 100);
    }
    
    /**
     * Tick de simulación de carrera
     */
    simulateRaceTick() {
        if (this.race.status !== 'racing') return;
        
        // Check if race time has elapsed (10 minutes)
        this.raceElapsedTime = Date.now() - this.raceStartTime;
        const raceTimeRemaining = this.RACE_DURATION_MS - this.raceElapsedTime;
        
        // Update time display
        this.updateRaceTimeDisplay(raceTimeRemaining);
        
        // Check for race end by time (only announce once)
        if (raceTimeRemaining <= 0 && !this.race.finalLap) {
            this.addChatMessage('Sistema', '🏁 ¡Última vuelta! El tiempo se ha agotado.', true);
            // Let current lap finish, then end race
            this.race.finalLap = true;
            // Set the lap to complete as the leader's current lap
            const leader = this.race.liveState.participants
                .filter(p => p.status === 'racing')
                .sort((a, b) => b.currentLap - a.currentLap || b.trackProgress - a.trackProgress)[0];
            if (leader) {
                this.race.finalLapNumber = leader.currentLap;
            }
        }
        
        this.race.liveState.participants.forEach(p => {
            if (p.status !== 'racing') return;
            
            // Calculate speed based on car performance and tyres
            // Adjusted for 10-minute race (~15-20 laps)
            const baseSpeed = 0.6 + Math.random() * 0.25;
            const tyreEffect = p.tyres.wear / 100;
            const fuelEffect = 1 - (p.fuel.current / 200) * 0.1;
            
            const speed = baseSpeed * tyreEffect * fuelEffect;
            
            // Update track progress
            p.trackProgress += speed;
            
            // Check for lap completion
            if (p.trackProgress >= 100) {
                p.trackProgress -= 100;
                p.currentLap++;
                
                // Check if this is the final lap after time ended
                if (this.race.finalLap && p.currentLap > this.race.finalLapNumber) {
                    p.status = 'finished';
                    this.addChatMessage('Sistema', `🏁 ${p.pilotName} cruza la línea de meta en P${p.position}`, true);
                    this.checkRaceFinish();
                    return;
                }
                
                // Generate lap time
                const baseLapTime = 90000; // 1:30.000
                const variation = (Math.random() - 0.5) * 5000;
                const lapTimeMs = baseLapTime + variation + (100 - p.tyres.wear) * 50;
                
                p.lastLapMs = lapTimeMs;
                p.lastLapTime = this.formatLapTime(lapTimeMs);
                
                // Update best lap
                if (!p.bestLapMs || lapTimeMs < p.bestLapMs) {
                    p.bestLapMs = lapTimeMs;
                    p.bestLapTime = p.lastLapTime;
                    
                    // Check for overall fastest lap
                    if (!this.race.liveState.fastestLap || 
                        lapTimeMs < this.race.liveState.fastestLap.timeMs) {
                        this.race.liveState.fastestLap = {
                            user: p.user,
                            pilotName: p.pilotName,
                            time: p.lastLapTime,
                            timeMs: lapTimeMs,
                            lap: p.currentLap
                        };
                        this.updateFastestLap();
                        this.addChatMessage('Sistema', 
                            `⚡ ${p.pilotName} marca la vuelta rápida: ${p.lastLapTime}`, true);
                    }
                }
                
                // Degradation
                p.tyres.wear = Math.max(0, p.tyres.wear - (2 + Math.random() * 2));
                p.fuel.current = Math.max(0, p.fuel.current - p.fuel.consumption);
                
                // Check if player completed lap
                if (p.isPlayer && p.currentLap > this.race.currentLap) {
                    this.race.currentLap = p.currentLap;
                    document.getElementById('current-lap').textContent = this.race.currentLap;
                }
                
                // Check for race finish
                if (p.currentLap > this.race.totalLaps) {
                    p.status = 'finished';
                    if (p.isPlayer) {
                        this.checkRaceFinish();
                    }
                }
            }
        });
        
        // Update positions
        this.updatePositions();
        this.updateCarPositions();
        this.updateStandings();
        this.updateMyCarPanel();
    }
    
    /**
     * Actualizar posiciones
     */
    updatePositions() {
        const sorted = [...this.race.liveState.participants]
            .sort((a, b) => {
                // Finished cars first, then by lap count, then by track progress
                if (a.status === 'finished' && b.status !== 'finished') return -1;
                if (b.status === 'finished' && a.status !== 'finished') return 1;
                if (a.currentLap !== b.currentLap) return b.currentLap - a.currentLap;
                return b.trackProgress - a.trackProgress;
            });
        
        const leader = sorted[0];
        
        sorted.forEach((p, index) => {
            p.position = index + 1;
            
            if (index === 0) {
                p.gap = 'Líder';
                p.interval = '-';
            } else {
                // Calculate gap to leader
                const lapDiff = leader.currentLap - p.currentLap;
                if (lapDiff > 0) {
                    p.gap = `+${lapDiff} vuelta${lapDiff > 1 ? 's' : ''}`;
                } else {
                    const progressDiff = leader.trackProgress - p.trackProgress + 
                                         (leader.currentLap - p.currentLap) * 100;
                    p.gap = `+${(progressDiff * 0.02).toFixed(3)}`;
                }
                
                // Interval to car ahead
                const ahead = sorted[index - 1];
                const interval = ahead.trackProgress - p.trackProgress + 
                                (ahead.currentLap - p.currentLap) * 100;
                p.interval = `+${Math.abs(interval * 0.02).toFixed(3)}`;
            }
        });
    }
    
    /**
     * Actualizar display del tiempo restante de carrera
     */
    updateRaceTimeDisplay(remainingMs) {
        const timerElement = document.getElementById('race-time-remaining');
        if (!timerElement) return;
        
        if (remainingMs <= 0) {
            timerElement.textContent = 'ÚLTIMA VUELTA';
            timerElement.style.color = '#ff4444';
            return;
        }
        
        const totalSeconds = Math.ceil(remainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color when less than 2 minutes
        if (remainingMs < 120000) {
            timerElement.style.color = '#ff8800';
        } else {
            timerElement.style.color = '';
        }
    }
    
    /**
     * Actualizar vuelta rápida
     */
    updateFastestLap() {
        const fl = this.race.liveState.fastestLap;
        if (fl) {
            document.getElementById('fl-driver').textContent = fl.pilotName;
            document.getElementById('fl-time').textContent = fl.time;
            document.getElementById('fl-lap').textContent = `Vuelta ${fl.lap}`;
        }
    }
    
    /**
     * Verificar fin de carrera
     */
    checkRaceFinish() {
        const allFinished = this.race.liveState.participants
            .every(p => p.status === 'finished' || p.status === 'retired');
        
        if (allFinished) {
            clearInterval(this.raceInterval);
            this.race.status = 'finished';
            this.showFinishModal();
        }
    }
    
    /**
     * Mostrar modal de fin
     */
    showFinishModal() {
        const modal = document.getElementById('finish-modal');
        
        // Generate podium
        const sorted = [...this.race.liveState.participants]
            .sort((a, b) => a.position - b.position);
        
        const podium = document.getElementById('podium');
        podium.innerHTML = '';
        
        for (let i = 0; i < 3; i++) {
            const p = sorted[i];
            const place = document.createElement('div');
            place.className = `podium-place ${['first', 'second', 'third'][i]}`;
            place.innerHTML = `
                <div class="podium-position">${i + 1}</div>
                <div class="podium-driver">${p.pilotName}</div>
                <div class="podium-block"></div>
            `;
            podium.appendChild(place);
        }
        
        // My result
        const me = this.myParticipant;
        const points = this.calculatePoints(me.position);
        const xp = this.calculateXP(me.position, 
            this.race.liveState.fastestLap?.user === me.user);
        
        document.getElementById('result-position').textContent = `P${me.position}`;
        document.getElementById('result-points').textContent = `+${points}`;
        document.getElementById('result-xp').textContent = `+${xp}`;
        document.getElementById('result-money').textContent = `+${(points * 20000).toLocaleString()}`;
        
        modal.style.display = 'flex';
    }
    
    /**
     * Realizar pit stop
     */
    async performPitStop() {
        if (!this.myParticipant || this.myParticipant.status !== 'racing') return;
        
        this.myParticipant.status = 'pit';
        
        const modal = document.getElementById('pit-modal');
        const pitFill = document.getElementById('pit-progress-fill');
        const pitTime = document.getElementById('pit-time');
        
        document.getElementById('pit-new-tyres').textContent = 
            this.selectedTyre.charAt(0).toUpperCase() + this.selectedTyre.slice(1);
        document.getElementById('pit-fuel-added').textContent = `${this.selectedFuel} kg`;
        
        modal.style.display = 'flex';
        
        // Enviar pit stop al servidor
        try {
            await fetch(`${this.apiBaseUrl}/race/${this.raceId}/participant`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'pit',
                    data: {
                        tyreCompound: this.selectedTyre,
                        fuelAdded: this.selectedFuel
                    }
                })
            });
        } catch (error) {
            console.error('Error sending pit stop:', error);
        }
        
        // Pit stop duration: 2-4 seconds
        const duration = 2 + Math.random() * 2;
        let elapsed = 0;
        
        const pitInterval = setInterval(() => {
            elapsed += 0.1;
            const progress = (elapsed / duration) * 100;
            pitFill.style.width = `${progress}%`;
            pitTime.textContent = `${elapsed.toFixed(1)}s`;
            
            if (elapsed >= duration) {
                clearInterval(pitInterval);
                
                // Apply changes
                this.myParticipant.tyres.compound = this.selectedTyre;
                this.myParticipant.tyres.wear = 100;
                this.myParticipant.fuel.current = Math.min(110, 
                    this.myParticipant.fuel.current + this.selectedFuel);
                this.myParticipant.status = 'racing';
                this.myParticipant.pitStops.push({
                    lap: this.myParticipant.currentLap,
                    duration: duration,
                    tyreChange: this.selectedTyre,
                    fuelAdded: this.selectedFuel
                });
                
                // Hide modal
                setTimeout(() => {
                    modal.style.display = 'none';
                    pitFill.style.width = '0%';
                }, 500);
                
                this.addChatMessage('Sistema', 
                    `🔧 ${this.myParticipant.pilotName} sale de boxes (${duration.toFixed(1)}s)`, true);
            }
        }, 100);
    }
    
    /**
     * Añadir mensaje al chat
     */
    addChatMessage(username, message, isSystem = false) {
        const container = document.getElementById('chat-messages');
        const time = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const msgEl = document.createElement('div');
        msgEl.className = `chat-message ${isSystem ? 'system' : ''}`;
        msgEl.innerHTML = `
            <span class="username">${username}</span>
            <span class="text">${message}</span>
            <span class="time">${time}</span>
        `;
        
        container.appendChild(msgEl);
        container.scrollTop = container.scrollHeight;
    }
    
    /**
     * Enviar mensaje de chat
     */
    async sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Enviar al servidor
        try {
            await fetch(`${this.apiBaseUrl}/race/${this.raceId}/chat`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
        } catch (error) {
            console.error('Error sending chat:', error);
        }
        
        this.addChatMessage('Tú', message);
        input.value = '';
    }
    
    /**
     * Formatear tiempo de vuelta
     */
    formatLapTime(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const millis = ms % 1000;
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
    }
    
    /**
     * Calcular puntos
     */
    calculatePoints(position) {
        const points = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };
        return points[position] || 0;
    }
    
    /**
     * Calcular XP
     */
    calculateXP(position, hasFastestLap) {
        const baseXP = Math.max(100 - (position - 1) * 8, 10);
        return baseXP + (hasFastestLap ? 20 : 0);
    }
    
    /**
     * Vincular eventos
     */
    bindEvents() {
        // Join race button
        document.getElementById('join-race-btn')?.addEventListener('click', () => {
            // Player joins the race
            this.addChatMessage('Sistema', `¡Te has unido a la carrera!`, true);
        });
        
        // Chat
        document.getElementById('send-chat')?.addEventListener('click', () => {
            this.sendChatMessage();
        });
        
        document.getElementById('chat-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
        
        // Pit stop
        document.getElementById('pit-btn')?.addEventListener('click', () => {
            this.performPitStop();
        });
        
        // Fuel slider
        document.getElementById('pit-fuel')?.addEventListener('input', (e) => {
            this.selectedFuel = parseInt(e.target.value);
            document.getElementById('pit-fuel-value').textContent = `${this.selectedFuel} kg`;
        });
        
        // Tyre selection
        document.querySelectorAll('.tyre-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tyre-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedTyre = btn.dataset.compound;
            });
        });
        
        // Session tabs
        document.querySelectorAll('.session-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.session-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                // TODO: Switch session view
            });
        });
        
        // Toggle chat panel
        document.getElementById('toggle-chat')?.addEventListener('click', () => {
            document.querySelector('.left-panel').classList.toggle('collapsed');
        });
        
        // Close finish modal
        document.getElementById('close-finish-modal')?.addEventListener('click', () => {
            this.stopUpdates();
            window.location.href = this.leagueId ? `league.html?id=${this.leagueId}` : 'online.html';
        });
        
        // Back button - manejar salida de carrera de forma segura
        document.getElementById('back-btn')?.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (this.race && this.race.status === 'racing') {
                if (!confirm('¿Seguro que quieres abandonar la carrera? Perderás tu progreso actual.')) {
                    return;
                }
                
                // Notify server that player is leaving
                try {
                    await fetch(`${this.apiBaseUrl}/race/${this.raceId}/participant`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${this.token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            action: 'retire',
                            data: { reason: 'player_left' }
                        })
                    });
                } catch (error) {
                    console.log('Could not notify server of retirement');
                }
            }
            
            // Stop all intervals before navigating
            this.stopUpdates();
            
            // Small delay to ensure cleanup
            setTimeout(() => {
                const targetUrl = this.leagueId 
                    ? `league.html?id=${this.leagueId}` 
                    : 'online.html';
                window.location.href = targetUrl;
            }, 100);
        });
    }
    
    /**
     * Iniciar actualizaciones periódicas
     */
    startUpdates() {
        // Update race timer every second
        this.updateInterval = setInterval(() => {
            this.updateRaceTimer();
        }, 1000);
        
        // Poll race state every 5 seconds (reduced from 2s to lower server load)
        this.stateInterval = setInterval(async () => {
            await this.pollRaceState();
        }, 5000);
        
        // Poll chat every 5 seconds (reduced from 3s to lower server load)
        this.chatInterval = setInterval(async () => {
            await this.pollChat();
        }, 5000);
    }
    
    /**
     * Obtener estado actualizado de la carrera
     */
    async pollRaceState() {
        if (!this.raceId) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/race/${this.raceId}/state`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Update race state
                if (data.status !== this.race.status) {
                    this.race.status = data.status;
                    this.checkRaceStatus();
                }
                
                // Update participants
                if (data.participants) {
                    // Merge participants data
                    data.participants.forEach(serverParticipant => {
                        const local = this.race.liveState.participants.find(
                            p => p.user === serverParticipant.user || p.user?._id === serverParticipant.user
                        );
                        if (local && local !== this.myParticipant) {
                            // Update other participants (not ourselves)
                            Object.assign(local, serverParticipant);
                        }
                    });
                }
                
                // Update UI
                this.updateStandings();
            }
        } catch (error) {
            // Silent fail - will retry
        }
    }
    
    /**
     * Obtener mensajes de chat nuevos
     */
    async pollChat() {
        if (!this.raceId) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/race/${this.raceId}/chat`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // Add new messages (compare timestamps)
                if (data.chat && data.chat.length > 0) {
                    const lastKnown = this.race.chat?.length || 0;
                    const newMessages = data.chat.slice(lastKnown);
                    
                    newMessages.forEach(msg => {
                        if (msg.user !== this.userId) {
                            this.addChatMessage(msg.username, msg.message);
                        }
                    });
                    
                    this.race.chat = data.chat;
                }
            }
        } catch (error) {
            // Silent fail - will retry
        }
    }
    
    /**
     * Actualizar timer de carrera
     */
    updateRaceTimer() {
        if (this.race.status !== 'racing') return;
        
        // Calculate elapsed time
        const now = new Date();
        const start = new Date(this.race.scheduledTime);
        const elapsed = now - start;
        
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        
        document.querySelector('.timer-value').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Detener actualizaciones
     */
    stopUpdates() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        if (this.stateInterval) clearInterval(this.stateInterval);
        if (this.chatInterval) clearInterval(this.chatInterval);
        if (this.raceInterval) clearInterval(this.raceInterval);
        if (this.countdownInterval) clearInterval(this.countdownInterval);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.raceLive = new RaceLiveController();
});
