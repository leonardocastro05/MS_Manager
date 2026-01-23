/**
 * MS Manager - Race Simulation Engine
 * Motor de simulación de carreras con IA
 */

class RaceEngine {
    constructor(trackId, participants) {
        this.track = TRACKS_DATA[trackId];
        this.participants = participants; // Array de {pilot, hq, tyreCompound}
        this.currentLap = 0;
        this.totalLaps = this.track.laps;
        this.raceState = 'pre-race'; // pre-race, racing, safety-car, red-flag, finished
        this.positions = [];
        this.lapTimes = {};
        this.events = [];
        this.weather = this.generateWeather();
        this.fastestLap = { time: Infinity, pilot: null };
        
        this.initializeRace();
    }
    
    /**
     * Inicializa la carrera con las posiciones de salida
     */
    initializeRace() {
        // Ordenar por tiempo de clasificación (si existe) o aleatorio
        this.positions = this.participants.map((p, index) => ({
            ...p,
            position: index + 1,
            totalTime: 0,
            gap: 0,
            currentSpeed: 0,
            currentWaypoint: 0,
            tyreWear: 0,
            fuel: 100,
            damage: 0,
            pits: 0,
            status: 'racing', // racing, pit, dnf
            lapTimes: [],
            sectorTimes: [],
            bestLap: null,
            drsEnabled: false
        }));
        
        // Inicializar tiempos por vuelta
        this.participants.forEach(p => {
            this.lapTimes[p.pilot.id] = [];
        });
    }
    
    /**
     * Genera condiciones meteorológicas aleatorias
     */
    generateWeather() {
        const conditions = Object.keys(WEATHER_CONDITIONS);
        const weights = [0.5, 0.25, 0.15, 0.05, 0.05]; // Probabilidades
        
        let random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < conditions.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return WEATHER_CONDITIONS[conditions[i]];
            }
        }
        return WEATHER_CONDITIONS.sunny;
    }
    
    /**
     * Calcula el tiempo base de vuelta para un piloto
     */
    calculateBaseLapTime(racer) {
        const baseTime = this.track.referenceTimes.average;
        
        // Factores que afectan el tiempo
        const pilotSkill = racer.pilot.level / 50; // 0-1
        const engineBonus = (racer.hq?.engine || 1) * 0.005; // Cada nivel de motor reduce 0.5%
        const aeroBonus = (racer.hq?.aero || 1) * 0.004;
        const drsBonus = (racer.hq?.drs || 1) * 0.003;
        const chassisBonus = (racer.hq?.chassis || 1) * 0.004;
        
        // Neumáticos
        const tyre = TYRE_COMPOUNDS[racer.tyreCompound];
        const tyreGrip = tyre.grip * (1 - racer.tyreWear / 100);
        
        // Clima
        const weatherEffect = this.weather.gripModifier;
        
        // Fuel effect (más combustible = más lento)
        const fuelEffect = 1 + (racer.fuel / 100) * 0.03;
        
        // Damage effect
        const damageEffect = 1 + (racer.damage / 100) * 0.1;
        
        // Cálculo final
        let lapTime = baseTime;
        lapTime *= (1 - pilotSkill * 0.08); // Piloto top puede ser 8% más rápido
        lapTime *= (1 - engineBonus - aeroBonus - drsBonus - chassisBonus);
        lapTime *= (2 - tyreGrip); // Menos grip = más lento
        lapTime *= (2 - weatherEffect);
        lapTime *= fuelEffect;
        lapTime *= damageEffect;
        
        // Variación aleatoria (+/- 0.5%)
        const randomVariation = 0.995 + Math.random() * 0.01;
        lapTime *= randomVariation;
        
        return lapTime;
    }
    
    /**
     * Simula una vuelta completa
     */
    simulateLap() {
        if (this.raceState === 'finished') return;
        
        this.currentLap++;
        const lapEvents = [];
        
        this.positions.forEach((racer, index) => {
            if (racer.status !== 'racing') return;
            
            // Calcular tiempo de vuelta
            const lapTime = this.calculateBaseLapTime(racer);
            racer.lapTimes.push(lapTime);
            racer.totalTime += lapTime;
            
            // Actualizar mejor vuelta
            if (lapTime < (racer.bestLap || Infinity)) {
                racer.bestLap = lapTime;
            }
            
            // Verificar vuelta rápida de carrera
            if (lapTime < this.fastestLap.time) {
                this.fastestLap = {
                    time: lapTime,
                    pilot: racer.pilot,
                    lap: this.currentLap
                };
                lapEvents.push({
                    type: 'fastest-lap',
                    pilot: racer.pilot.name,
                    time: this.formatTime(lapTime),
                    lap: this.currentLap
                });
            }
            
            // Degradación de neumáticos
            const tyre = TYRE_COMPOUNDS[racer.tyreCompound];
            racer.tyreWear += tyre.degradation * 100 * this.weather.tyreWearModifier;
            
            // Consumo de combustible
            racer.fuel -= (100 / this.totalLaps) * this.track.characteristics.fuelConsumption === 'high' ? 1.2 : 1;
            
            // Eventos aleatorios
            const eventRoll = Math.random();
            
            // Posibilidad de error del piloto (más probable con baja habilidad)
            const errorChance = 0.02 * (1 - racer.pilot.level / 50);
            if (eventRoll < errorChance) {
                const timeLoss = 2 + Math.random() * 5;
                racer.totalTime += timeLoss;
                lapEvents.push({
                    type: 'mistake',
                    pilot: racer.pilot.name,
                    description: this.generateMistakeDescription(),
                    timeLoss: timeLoss.toFixed(1)
                });
            }
            
            // Posibilidad de avería mecánica
            const mechanicalChance = 0.003 * (1 - (racer.hq?.engine || 1) / 50);
            if (eventRoll < mechanicalChance) {
                racer.status = 'dnf';
                racer.dnfReason = 'Avería mecánica';
                lapEvents.push({
                    type: 'dnf',
                    pilot: racer.pilot.name,
                    reason: 'Avería mecánica',
                    lap: this.currentLap
                });
            }
            
            // DRS disponible si está a menos de 1 segundo del de delante
            if (index > 0 && this.track.drsZones.length > 0) {
                const gap = racer.totalTime - this.positions[index - 1].totalTime;
                racer.drsEnabled = gap < 1;
            }
        });
        
        // Reordenar posiciones
        this.updatePositions();
        
        // Guardar eventos
        this.events.push(...lapEvents);
        
        // Verificar si la carrera ha terminado
        if (this.currentLap >= this.totalLaps) {
            this.raceState = 'finished';
            this.calculateFinalResults();
        }
        
        return {
            lap: this.currentLap,
            positions: this.getPositions(),
            events: lapEvents,
            weather: this.weather,
            fastestLap: this.fastestLap
        };
    }
    
    /**
     * Actualiza las posiciones basándose en el tiempo total
     */
    updatePositions() {
        // Separar DNFs
        const racing = this.positions.filter(r => r.status === 'racing');
        const dnfs = this.positions.filter(r => r.status === 'dnf');
        
        // Ordenar por tiempo
        racing.sort((a, b) => a.totalTime - b.totalTime);
        
        // Actualizar posiciones y gaps
        racing.forEach((racer, index) => {
            racer.position = index + 1;
            if (index === 0) {
                racer.gap = 0;
            } else {
                racer.gap = racer.totalTime - racing[0].totalTime;
            }
        });
        
        // DNFs al final
        dnfs.forEach((racer, index) => {
            racer.position = racing.length + index + 1;
        });
        
        this.positions = [...racing, ...dnfs];
    }
    
    /**
     * Genera descripción de error aleatorio
     */
    generateMistakeDescription() {
        const mistakes = [
            'Se ha ido largo en la frenada',
            'Ha bloqueado los neumáticos',
            'Ha tocado el bordillo y perdido tracción',
            'Se ha pasado del punto de frenada',
            'Ha tenido un pequeño trompo',
            'Ha tocado ligeramente el muro',
            'Ha perdido el control momentáneamente'
        ];
        return mistakes[Math.floor(Math.random() * mistakes.length)];
    }
    
    /**
     * Realiza una parada en boxes
     */
    pitStop(pilotId, newTyreCompound) {
        const racer = this.positions.find(r => r.pilot.id === pilotId);
        if (!racer || racer.status !== 'racing') return false;
        
        const pitTime = this.track.pitLane.timeLoss;
        const tyreChangeTime = 2.5 + Math.random() * 1.5; // 2.5-4 segundos
        
        racer.totalTime += pitTime + tyreChangeTime;
        racer.tyreCompound = newTyreCompound;
        racer.tyreWear = 0;
        racer.fuel = Math.min(100, racer.fuel + 50); // Repostaje parcial
        racer.pits++;
        
        this.events.push({
            type: 'pit-stop',
            pilot: racer.pilot.name,
            tyreCompound: newTyreCompound,
            time: (pitTime + tyreChangeTime).toFixed(1),
            lap: this.currentLap
        });
        
        this.updatePositions();
        return true;
    }
    
    /**
     * Simula toda la carrera de golpe
     */
    simulateFullRace() {
        this.raceState = 'racing';
        
        while (this.currentLap < this.totalLaps) {
            this.simulateLap();
            
            // IA de pit stops automáticos
            this.autoManagePitStops();
        }
        
        return this.getRaceResults();
    }
    
    /**
     * Gestión automática de pit stops por IA
     */
    autoManagePitStops() {
        this.positions.forEach(racer => {
            if (racer.status !== 'racing') return;
            
            // Parar si los neumáticos están muy gastados
            if (racer.tyreWear > 85 && racer.pits < 2) {
                // Elegir compuesto según vueltas restantes
                const remainingLaps = this.totalLaps - this.currentLap;
                let newTyre = 'medium';
                
                if (remainingLaps <= 15) newTyre = 'soft';
                else if (remainingLaps >= 30) newTyre = 'hard';
                
                this.pitStop(racer.pilot.id, newTyre);
            }
        });
    }
    
    /**
     * Calcula los resultados finales
     */
    calculateFinalResults() {
        this.positions.forEach(racer => {
            // Asignar puntos
            const points = RACE_POINTS[racer.position] || 0;
            racer.points = points;
            
            // Punto extra por vuelta rápida (solo top 10)
            if (this.fastestLap.pilot?.id === racer.pilot.id && racer.position <= 10) {
                racer.points += RACE_POINTS.fastestLap;
                racer.fastestLapBonus = true;
            }
        });
    }
    
    /**
     * Obtiene las posiciones actuales
     */
    getPositions() {
        return this.positions.map(r => ({
            position: r.position,
            pilot: r.pilot,
            totalTime: r.totalTime,
            gap: r.gap,
            gapFormatted: r.gap > 0 ? `+${this.formatTime(r.gap)}` : 'LÍDER',
            lastLap: r.lapTimes[r.lapTimes.length - 1] || null,
            lastLapFormatted: r.lapTimes.length ? this.formatTime(r.lapTimes[r.lapTimes.length - 1]) : '-',
            bestLap: r.bestLap,
            bestLapFormatted: r.bestLap ? this.formatTime(r.bestLap) : '-',
            tyreCompound: r.tyreCompound,
            tyreWear: Math.round(r.tyreWear),
            pits: r.pits,
            status: r.status,
            drsEnabled: r.drsEnabled
        }));
    }
    
    /**
     * Obtiene los resultados finales de la carrera
     */
    getRaceResults() {
        return {
            track: this.track,
            totalLaps: this.totalLaps,
            weather: this.weather,
            results: this.positions.map(r => ({
                position: r.position,
                pilot: r.pilot,
                totalTime: r.totalTime,
                totalTimeFormatted: this.formatTime(r.totalTime),
                gap: r.gap,
                gapFormatted: r.position === 1 ? '-' : `+${this.formatTime(r.gap)}`,
                bestLap: r.bestLap,
                bestLapFormatted: r.bestLap ? this.formatTime(r.bestLap) : '-',
                points: r.points || 0,
                pits: r.pits,
                status: r.status,
                dnfReason: r.dnfReason || null,
                fastestLapBonus: r.fastestLapBonus || false
            })),
            fastestLap: {
                pilot: this.fastestLap.pilot?.name,
                time: this.formatTime(this.fastestLap.time),
                lap: this.fastestLap.lap
            },
            events: this.events
        };
    }
    
    /**
     * Formatea tiempo en mm:ss.xxx
     */
    formatTime(seconds) {
        if (!seconds || !isFinite(seconds)) return '-';
        
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        
        if (mins > 0) {
            return `${mins}:${secs.toFixed(3).padStart(6, '0')}`;
        }
        return secs.toFixed(3);
    }
}

/**
 * Clase para gestionar el visualizador de carreras
 */
class RaceVisualizer {
    constructor(containerId, trackId) {
        this.container = document.getElementById(containerId);
        this.track = TRACKS_DATA[trackId];
        this.cars = [];
        this.animationFrame = null;
        this.isRunning = false;
    }
    
    /**
     * Inicializa el visualizador cargando el SVG del circuito
     */
    async initialize() {
        // Cargar SVG del circuito
        const response = await fetch(this.track.image);
        const svgText = await response.text();
        
        this.container.innerHTML = svgText;
        this.svg = this.container.querySelector('svg');
        
        // Obtener el path de racing line
        this.racingPath = this.svg.querySelector('#racing-line');
        this.pathLength = this.racingPath?.getTotalLength() || 0;
    }
    
    /**
     * Añade un coche al visualizador
     */
    addCar(id, color, name) {
        const car = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        car.setAttribute('r', '6');
        car.setAttribute('fill', color);
        car.setAttribute('stroke', '#ffffff');
        car.setAttribute('stroke-width', '2');
        car.setAttribute('id', `car-${id}`);
        car.dataset.progress = '0';
        
        // Posición inicial
        const startPoint = this.track.waypoints[0];
        car.setAttribute('cx', startPoint.x);
        car.setAttribute('cy', startPoint.y);
        
        this.svg.appendChild(car);
        this.cars.push({ id, element: car, color, name, progress: 0 });
        
        return car;
    }
    
    /**
     * Actualiza la posición de un coche
     */
    updateCarPosition(carId, progress) {
        const car = this.cars.find(c => c.id === carId);
        if (!car || !this.racingPath) return;
        
        // Progress es 0-1 representando el porcentaje de la vuelta
        const point = this.racingPath.getPointAtLength(progress * this.pathLength);
        
        car.element.setAttribute('cx', point.x);
        car.element.setAttribute('cy', point.y);
        car.progress = progress;
    }
    
    /**
     * Anima los coches por una vuelta
     */
    animateLap(positions, duration = 5000) {
        return new Promise(resolve => {
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Actualizar posición de cada coche basado en su velocidad relativa
                positions.forEach((pos, index) => {
                    const carId = pos.pilot.id;
                    const speedFactor = 1 - (index * 0.02); // Los de atrás un poco más lentos
                    this.updateCarPosition(carId, progress * speedFactor);
                });
                
                if (progress < 1) {
                    this.animationFrame = requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            this.animationFrame = requestAnimationFrame(animate);
        });
    }
    
    /**
     * Detiene la animación
     */
    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.isRunning = false;
    }
    
    /**
     * Limpia el visualizador
     */
    destroy() {
        this.stop();
        this.cars.forEach(car => car.element.remove());
        this.cars = [];
    }
}

// Exportar si es módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RaceEngine, RaceVisualizer };
}
