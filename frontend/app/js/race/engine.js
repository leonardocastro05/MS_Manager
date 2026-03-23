// ============================================================
// RACE ENGINE - Core Racing Simulation
// ============================================================

import {
    getSplinePoint,
    getSplineAngle,
    buildArcLengthTable,
    arcLengthToFraction,
    getSpeedFactor,
    isInDRSZone,
    isInOvertakingZone,
    getCurrentSector,
    getTrackById,
} from '../tracks/index.js';

// ── F1 TEAMS ──
export const TEAMS = [
    { id: 1, name: "Red Bull Racing", shortName: "RBR", color: "#1E41FF", accent: "#FFD700" },
    { id: 2, name: "Mercedes AMG", shortName: "MER", color: "#00D2BE", accent: "#FFFFFF" },
    { id: 3, name: "Ferrari", shortName: "FER", color: "#DC0000", accent: "#FFEB3B" },
    { id: 4, name: "McLaren", shortName: "MCL", color: "#FF8700", accent: "#000000" },
    { id: 5, name: "Aston Martin", shortName: "AMR", color: "#006F62", accent: "#CEDC00" },
    { id: 6, name: "Alpine", shortName: "ALP", color: "#0090FF", accent: "#FF87C0" },
    { id: 7, name: "Williams", shortName: "WIL", color: "#005AFF", accent: "#00A3E0" },
    { id: 8, name: "RB", shortName: "RB", color: "#6692FF", accent: "#FFFFFF" },
    { id: 9, name: "Kick Sauber", shortName: "SAU", color: "#52E252", accent: "#000000" },
    { id: 10, name: "Haas", shortName: "HAA", color: "#B6BABD", accent: "#E10600" },
];

// ── F1 DRIVERS ──
export const DRIVERS = [
    { id: 1, name: "M. Verstappen", abbr: "VER", number: 1, teamId: 1, speed: 97, consistency: 95, aggression: 88, tireMgmt: 90, wetSkill: 93 },
    { id: 2, name: "S. Pérez", abbr: "PER", number: 11, teamId: 1, speed: 83, consistency: 76, aggression: 68, tireMgmt: 78, wetSkill: 75 },
    { id: 3, name: "L. Hamilton", abbr: "HAM", number: 44, teamId: 3, speed: 93, consistency: 92, aggression: 80, tireMgmt: 94, wetSkill: 96 },
    { id: 4, name: "C. Leclerc", abbr: "LEC", number: 16, teamId: 3, speed: 94, consistency: 85, aggression: 82, tireMgmt: 80, wetSkill: 84 },
    { id: 5, name: "G. Russell", abbr: "RUS", number: 63, teamId: 2, speed: 90, consistency: 88, aggression: 75, tireMgmt: 85, wetSkill: 86 },
    { id: 6, name: "A. Antonelli", abbr: "ANT", number: 12, teamId: 2, speed: 88, consistency: 78, aggression: 72, tireMgmt: 76, wetSkill: 74 },
    { id: 7, name: "L. Norris", abbr: "NOR", number: 4, teamId: 4, speed: 92, consistency: 88, aggression: 76, tireMgmt: 86, wetSkill: 88 },
    { id: 8, name: "O. Piastri", abbr: "PIA", number: 81, teamId: 4, speed: 89, consistency: 84, aggression: 74, tireMgmt: 82, wetSkill: 80 },
    { id: 9, name: "F. Alonso", abbr: "ALO", number: 14, teamId: 5, speed: 87, consistency: 90, aggression: 78, tireMgmt: 95, wetSkill: 90 },
    { id: 10, name: "L. Stroll", abbr: "STR", number: 18, teamId: 5, speed: 78, consistency: 72, aggression: 65, tireMgmt: 70, wetSkill: 68 },
    { id: 11, name: "P. Gasly", abbr: "GAS", number: 10, teamId: 6, speed: 84, consistency: 80, aggression: 70, tireMgmt: 78, wetSkill: 79 },
    { id: 12, name: "J. Doohan", abbr: "DOO", number: 7, teamId: 6, speed: 79, consistency: 74, aggression: 66, tireMgmt: 72, wetSkill: 70 },
    { id: 13, name: "A. Albon", abbr: "ALB", number: 23, teamId: 7, speed: 82, consistency: 80, aggression: 68, tireMgmt: 80, wetSkill: 78 },
    { id: 14, name: "C. Sainz", abbr: "SAI", number: 55, teamId: 7, speed: 88, consistency: 86, aggression: 74, tireMgmt: 85, wetSkill: 82 },
    { id: 15, name: "Y. Tsunoda", abbr: "TSU", number: 22, teamId: 8, speed: 82, consistency: 74, aggression: 78, tireMgmt: 72, wetSkill: 73 },
    { id: 16, name: "I. Hadjar", abbr: "HAD", number: 6, teamId: 8, speed: 78, consistency: 72, aggression: 68, tireMgmt: 70, wetSkill: 68 },
    { id: 17, name: "N. Hülkenberg", abbr: "HUL", number: 27, teamId: 9, speed: 80, consistency: 82, aggression: 66, tireMgmt: 80, wetSkill: 76 },
    { id: 18, name: "G. Bortoleto", abbr: "BOR", number: 5, teamId: 9, speed: 79, consistency: 72, aggression: 70, tireMgmt: 68, wetSkill: 66 },
    { id: 19, name: "O. Bearman", abbr: "BEA", number: 87, teamId: 10, speed: 78, consistency: 73, aggression: 70, tireMgmt: 68, wetSkill: 65 },
    { id: 20, name: "E. Ocon", abbr: "OCO", number: 31, teamId: 10, speed: 80, consistency: 76, aggression: 72, tireMgmt: 74, wetSkill: 74 },
];

// ── CAR PERFORMANCE (by team) ──
export const CAR_PERFORMANCE = {
    1: { engine: 96, aero: 95, chassis: 94, reliability: 90, pitCrew: 95 },
    2: { engine: 94, aero: 92, chassis: 92, reliability: 92, pitCrew: 90 },
    3: { engine: 95, aero: 93, chassis: 93, reliability: 88, pitCrew: 92 },
    4: { engine: 93, aero: 94, chassis: 91, reliability: 91, pitCrew: 88 },
    5: { engine: 90, aero: 88, chassis: 89, reliability: 93, pitCrew: 85 },
    6: { engine: 87, aero: 86, chassis: 86, reliability: 90, pitCrew: 82 },
    7: { engine: 85, aero: 84, chassis: 85, reliability: 88, pitCrew: 80 },
    8: { engine: 86, aero: 85, chassis: 84, reliability: 87, pitCrew: 83 },
    9: { engine: 82, aero: 82, chassis: 83, reliability: 86, pitCrew: 78 },
    10: { engine: 81, aero: 80, chassis: 81, reliability: 85, pitCrew: 76 },
};

// ── TIRE COMPOUNDS ──
export const TIRE_COMPOUNDS = {
    soft: {
        name: "Soft", letter: "S", color: "#FF3333",
        speedBonus: 0.025,
        degradation: 0.0035,
        cliff: 25,
    },
    medium: {
        name: "Medium", letter: "M", color: "#FFD700",
        speedBonus: 0.0,
        degradation: 0.0020,
        cliff: 20,
    },
    hard: {
        name: "Hard", letter: "H", color: "#FFFFFF",
        speedBonus: -0.015,
        degradation: 0.0012,
        cliff: 15,
    },
};


// ============================================================
// CAR STATE
// ============================================================

class CarState {
    constructor(driver, team, carPerf, gridPosition) {
        this.driver = driver;
        this.team = team;
        this.carPerf = carPerf;
        this.gridPosition = gridPosition;
        this.position = gridPosition;

        this.lap = 0;
        this.progress = 0;
        this.totalProgress = 0;

        this.baseSpeed = this._calculateBaseSpeed();

        this.tire = gridPosition <= 10 ? 'soft' : 'medium';
        this.tireLife = 100;
        this.tiresUsed = [this.tire];

        this.fuel = 100;

        this.currentLapStart = 0;
        this.lastLapTime = 0;
        this.bestLapTime = Infinity;
        this.sectorTimes = [0, 0, 0];
        this.currentSectorStart = 0;
        this.currentSector = 1;

        this.gapToLeader = 0;
        this.gapToAhead = 0;
        this.interval = 0;
        this.drsActive = false;
        this.drsAvailable = false;
        this.inPitLane = false;
        this.pitStopTimer = 0;
        this.pitStops = 0;
        this.retired = false;
        this.retiredReason = "";
        this.finished = false;
        this.penalties = 0;
        this.pitStopDuration = 0;

        this.visualOffset = 0;
        this.isOvertaking = false;
        this.overtakeTimer = 0;

        this.plannedStops = this._planStrategy();
        this.nextStopLap = this.plannedStops[0] || 999;
    }

    _calculateBaseSpeed() {
        const d = this.driver;
        const c = this.carPerf;
        const driverFactor = (d.speed * 0.4 + d.consistency * 0.3 + d.tireMgmt * 0.15 + d.aggression * 0.15) / 100;
        const carFactor = (c.engine * 0.35 + c.aero * 0.25 + c.chassis * 0.25 + c.reliability * 0.15) / 100;
        return 0.065 + (driverFactor * 0.5 + carFactor * 0.5) * 0.012;
    }

    _planStrategy() {
        const totalLaps = 20;
        if (this.tire === 'soft') {
            return [Math.floor(totalLaps * 0.35 + Math.random() * 3)];
        } else {
            return [Math.floor(totalLaps * 0.50 + Math.random() * 3)];
        }
    }
}


// ============================================================
// RACE ENGINE
// ============================================================

export class RaceEngine {
    constructor(config = {}) {
        this.track = config.track || getTrackById(config.trackId || 'monza');
        this.totalLaps = config.laps || this.track.defaultLaps || 20;
        this.playerTeamId = config.playerTeam || 3;
        this.weather = config.weather || 'dry';
        this.startingTyre = config.startingTyre || null;
        this.playerProfile = config.playerProfile || null;

        const result = buildArcLengthTable(this.track.points);
        this.arcTable = result.table;
        this.trackTotalLength = result.totalLength;

        this.raceTime = 0;
        this.realTime = 0;
        this.speedMultiplier = 1.0;

        this.status = 'pre-race';
        this.currentLap = 0;
        this.safetyCarActive = false;
        this.safetyCarLaps = 0;
        this.drsEnabled = false;
        this.drsEnabledLap = 3;

        this.messages = [];
        this.fastestLap = { driver: null, time: Infinity };

        this.cars = this._buildGrid();

        for (const car of this.cars) {
            // Apply player's chosen starting tyre to player team
            if (this.startingTyre && car.team.id === this.playerTeamId) {
                car.tire = this.startingTyre;
                car.tiresUsed = [this.startingTyre];
            }
            if (car.tire === 'soft') {
                car.plannedStops = [Math.floor(this.totalLaps * 0.35 + Math.random() * 3)];
            } else {
                car.plannedStops = [Math.floor(this.totalLaps * 0.50 + Math.random() * 3)];
            }
            car.nextStopLap = car.plannedStops[0] || 999;
        }

        this.countdownTimer = 0;
        this.lightsStage = 0;
    }

    _buildGrid() {
        const teams = TEAMS.map(team => ({ ...team }));
        const drivers = DRIVERS.map(driver => ({ ...driver }));
        const carPerfByTeam = { ...CAR_PERFORMANCE };

        this._applyPlayerProfile(teams, drivers, carPerfByTeam);

        const entries = drivers.map(d => {
            const team = teams.find(t => t.id === d.teamId);
            const carPerf = carPerfByTeam[d.teamId] || CAR_PERFORMANCE[d.teamId];
            const perfScore = (d.speed + d.consistency) / 2 +
                (carPerf.engine + carPerf.aero + carPerf.chassis) / 3;
            return { driver: d, team, carPerf, perfScore };
        });

        entries.forEach(e => {
            e.qualyScore = e.perfScore + (Math.random() - 0.5) * 8;
        });

        entries.sort((a, b) => b.qualyScore - a.qualyScore);

        return entries.map((e, i) => {
            const car = new CarState(e.driver, e.team, e.carPerf, i + 1);
            return car;
        });
    }

    _applyPlayerProfile(teams, drivers, carPerfByTeam) {
        if (!this.playerProfile) return;

        const playerTeam = teams.find(team => team.id === this.playerTeamId);
        if (playerTeam) {
            const customTeamName = this.playerProfile.teamName || playerTeam.name;
            playerTeam.name = customTeamName;
            playerTeam.shortName = this._shortCode(customTeamName, playerTeam.shortName);
        }

        const customCarPerf = this._buildPlayerCarPerf();
        if (customCarPerf) {
            carPerfByTeam[this.playerTeamId] = customCarPerf;
        }

        const playerPilot = this.playerProfile.currentPilot;
        if (!playerPilot) return;

        const teamDrivers = drivers
            .filter(driver => driver.teamId === this.playerTeamId)
            .sort((a, b) => a.id - b.id);

        if (teamDrivers.length === 0) return;

        const mappedPilot = this._mapPilotToRaceDriver(playerPilot, teamDrivers[0]);
        Object.assign(teamDrivers[0], mappedPilot);

        if (teamDrivers[1]) {
            const teammate = this._buildTeammateFromPilot(playerPilot, teamDrivers[1]);
            Object.assign(teamDrivers[1], teammate);
        }
    }

    _buildPlayerCarPerf() {
        const car = this.playerProfile?.car;
        if (!car) return null;

        const clamp = (value, min = 60, max = 99) => Math.max(min, Math.min(max, Math.round(value)));
        const levelToRating = (level, base = 76, step = 2.2) => base + ((level || 1) - 1) * step;

        const engineLevel = car.engine?.level || 1;
        const aeroLevel = car.aero?.level || 1;
        const drsLevel = car.drs?.level || 1;
        const chassisLevel = car.chassis?.level || 1;

        const engine = levelToRating(engineLevel, 78, 2.4);
        const aero = levelToRating(aeroLevel, 77, 2.3);
        const chassis = levelToRating(chassisLevel, 77, 2.2);
        const reliability = levelToRating(chassisLevel, 80, 1.6);
        const pitCrew = levelToRating(drsLevel, 76, 2.0);

        return {
            engine: clamp(engine),
            aero: clamp(aero),
            chassis: clamp(chassis),
            reliability: clamp(reliability, 65, 99),
            pitCrew: clamp(pitCrew, 65, 99),
        };
    }

    _mapPilotToRaceDriver(pilot, baseDriver) {
        const speed = this._statFromPilot(pilot.speed, baseDriver.speed, 55, 99);
        const consistency = this._statFromPilot(pilot.control, baseDriver.consistency, 50, 98);
        const aggression = this._statFromPilot(100 - pilot.control * 0.35, baseDriver.aggression, 45, 95);
        const tireMgmt = this._statFromPilot((pilot.control + pilot.experience) / 2, baseDriver.tireMgmt, 50, 98);
        const wetSkill = this._statFromPilot(pilot.experience, baseDriver.wetSkill, 45, 98);

        const displayName = pilot.name || baseDriver.name;
        const abbr = this._driverAbbr(displayName, baseDriver.abbr);

        return {
            name: displayName,
            abbr,
            speed,
            consistency,
            aggression,
            tireMgmt,
            wetSkill,
        };
    }

    _buildTeammateFromPilot(pilot, baseDriver) {
        const seed = (pilot.overall || 75) - 6;
        const speed = this._clamp(Math.round((pilot.speed || seed) * 0.93), 50, 96);
        const consistency = this._clamp(Math.round((pilot.control || seed) * 0.92), 50, 96);
        const aggression = this._clamp(Math.round((80 - (pilot.control || 70) * 0.2)), 45, 92);
        const tireMgmt = this._clamp(Math.round(((pilot.control || seed) + (pilot.experience || seed)) / 2 * 0.9), 48, 95);
        const wetSkill = this._clamp(Math.round((pilot.experience || seed) * 0.9), 45, 95);

        return {
            name: `${this.playerProfile?.teamName || 'Equipo'} #2`,
            abbr: 'TM2',
            speed,
            consistency,
            aggression,
            tireMgmt,
            wetSkill,
        };
    }

    _shortCode(teamName, fallback = 'PLR') {
        if (!teamName || typeof teamName !== 'string') return fallback;
        const words = teamName
            .replace(/[^a-zA-Z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);

        if (words.length >= 2) {
            return (words[0][0] + words[1][0] + (words[2]?.[0] || '')).toUpperCase().slice(0, 3);
        }

        return words[0].slice(0, 3).toUpperCase() || fallback;
    }

    _driverAbbr(name, fallback = 'DRV') {
        if (!name || typeof name !== 'string') return fallback;
        const words = name.trim().split(/\s+/).filter(Boolean);
        if (words.length >= 2) {
            return (words[0][0] + words[1].slice(0, 2)).toUpperCase();
        }
        return name.slice(0, 3).toUpperCase() || fallback;
    }

    _statFromPilot(sourceValue, fallback, min, max) {
        if (typeof sourceValue !== 'number' || Number.isNaN(sourceValue)) return fallback;
        return this._clamp(Math.round(sourceValue), min, max);
    }

    _clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    startRace() {
        this.status = 'formation';
        this.countdownTimer = 0;
        this.lightsStage = 0;
        this.addMessage("🏁 Vuelta de formación", "system");

        for (let i = 0; i < this.cars.length; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            this.cars[i].progress = 1.0 - (row * 0.012 + col * 0.004);
            if (this.cars[i].progress < 0) this.cars[i].progress += 1;
            this.cars[i].totalProgress = this.cars[i].progress;
        }
    }

    update(realDeltaMs) {
        if (this.status === 'finished' || this.status === 'pre-race') return;

        const realDelta = realDeltaMs / 1000;
        this.realTime += realDelta;
        const gameDelta = realDelta * this.speedMultiplier;
        this.raceTime += gameDelta;

        if (this.status === 'formation') {
            this._updateFormation(gameDelta);
            return;
        }

        if (this.status !== 'racing') return;

        for (const car of this.cars) {
            if (car.retired || car.finished) continue;
            this._updateCar(car, gameDelta);
        }

        this._updatePositions();
        this._updateGaps();
        this._updateDRS();
        this._checkOvertaking();
        this._checkRandomEvents(gameDelta);
        this._checkRaceEnd();
    }

    _updateFormation(gameDelta) {
        this.countdownTimer += gameDelta;

        if (this.countdownTimer < 6) {
            this.lightsStage = Math.min(5, Math.floor(this.countdownTimer));
        } else if (this.lightsStage < 6) {
            if (this.countdownTimer >= 6 + Math.random() * 0.5) {
                this.lightsStage = 6;
                this.status = 'racing';
                this.currentLap = 1;
                this.drsEnabled = false;
                this.addMessage("🟢 ¡LUCES FUERA! ¡COMIENZA LA CARRERA!", "start");

                for (const car of this.cars) {
                    car.currentLapStart = this.raceTime;
                    car.currentSectorStart = this.raceTime;
                    car.currentSector = getCurrentSector(car.progress, this.track.sectors);
                }
            }
        }
    }

    _updateCar(car, gameDelta) {
        if (car.inPitLane) {
            this._updatePitStop(car, gameDelta);
            return;
        }

        if (this._shouldPit(car)) {
            this._enterPitLane(car);
            return;
        }

        const speedZoneFactor = getSpeedFactor(car.progress, this.track.speedZones);
        const tireFactor = this._getTireFactor(car);
        const fuelFactor = 1.0 + (100 - car.fuel) * 0.0003;
        const tireCompound = TIRE_COMPOUNDS[car.tire];
        const tireBonus = 1.0 + tireCompound.speedBonus;
        const consistencyNoise = 1.0 + (Math.random() - 0.5) * (1 - car.driver.consistency / 100) * 0.03;
        const scFactor = this.safetyCarActive ? 0.5 : 1.0;
        const drsFactor = car.drsActive ? 1.06 : 1.0;

        let slipstreamFactor = 1.0;
        if (!this.safetyCarActive) {
            const ahead = this.cars.find(c => c.position === car.position - 1 && !c.retired);
            if (ahead) {
                const gap = this._getGapBetween(ahead, car);
                if (gap > 0 && gap < 1.5) {
                    slipstreamFactor = 1.0 + (1.5 - gap) * 0.02;
                }
            }
        }

        const effectiveSpeed = car.baseSpeed * speedZoneFactor * tireFactor * fuelFactor *
            tireBonus * consistencyNoise * scFactor * drsFactor * slipstreamFactor;

        const prevProgress = car.progress;
        car.progress += effectiveSpeed * gameDelta;

        car.currentSpeed = Math.round(340 * speedZoneFactor * drsFactor);

        const prevSector = car.currentSector;
        const newSector = getCurrentSector(car.progress % 1, this.track.sectors);
        if (newSector !== prevSector && car.lap > 0) {
            car.sectorTimes[prevSector - 1] = this.raceTime - car.currentSectorStart;
            car.currentSectorStart = this.raceTime;
            car.currentSector = newSector;
        }

        if (car.progress >= 1.0) {
            car.progress -= 1.0;
            this._completeLap(car);
        }

        car.totalProgress = car.lap + car.progress;

        const degradation = tireCompound.degradation * gameDelta * (1.1 - car.driver.tireMgmt / 100);
        car.tireLife = Math.max(0, car.tireLife - degradation * 100);

        car.fuel = Math.max(0, car.fuel - 0.015 * gameDelta);

        if (car.isOvertaking) {
            car.overtakeTimer -= gameDelta;
            if (car.overtakeTimer <= 0) {
                car.isOvertaking = false;
                car.visualOffset = 0;
            }
        }
    }

    _getTireFactor(car) {
        const compound = TIRE_COMPOUNDS[car.tire];
        if (car.tireLife > compound.cliff) {
            return 1.0 - (100 - car.tireLife) * 0.0005;
        } else {
            return 1.0 - (100 - car.tireLife) * 0.002;
        }
    }

    _completeLap(car) {
        car.lap++;
        const lapTime = this.raceTime - car.currentLapStart;
        car.lastLapTime = lapTime;
        car.currentLapStart = this.raceTime;

        if (car.lap > 1 && lapTime < car.bestLapTime) {
            car.bestLapTime = lapTime;
        }

        if (car.lap > 1 && lapTime < this.fastestLap.time) {
            this.fastestLap = { driver: car.driver.abbr, time: lapTime, teamColor: car.team.color };
            this.addMessage(`⚡ ¡Vuelta rápida! ${car.driver.abbr} - ${this.formatLapTime(lapTime)}`, "fastest");
        }

        if (car.position === 1) {
            this.currentLap = car.lap;

            if (car.lap >= this.drsEnabledLap && !this.drsEnabled && !this.safetyCarActive) {
                this.drsEnabled = true;
                this.addMessage("🟢 DRS habilitado", "drs");
            }
        }

        if (car.lap >= this.totalLaps) {
            car.finished = true;
            if (car.position === 1) {
                this.addMessage(`🏁 ${car.driver.name} GANA EL GRAN PREMIO`, "winner");
            } else if (car.position <= 3) {
                this.addMessage(`🏁 ${car.driver.abbr} P${car.position}`, "podium");
            }
        }
    }

    _shouldPit(car) {
        if (car.inPitLane || car.lap < 1) return false;

        if (car.lap >= car.nextStopLap && car.pitStops < car.plannedStops.length) {
            const entryFraction = this.track.pitLane.entryFraction;
            const dist = car.progress - entryFraction;
            if (dist >= 0 && dist < 0.02) {
                return true;
            }
        }

        if (car.tireLife < 10) {
            const entryFraction = this.track.pitLane.entryFraction;
            const dist = car.progress - entryFraction;
            if (dist >= 0 && dist < 0.02) {
                return true;
            }
        }

        return false;
    }

    _enterPitLane(car) {
        car.inPitLane = true;
        car.pitStopTimer = 0;
        car.pitStopDuration = 2.0 + (100 - car.carPerf.pitCrew) * 0.025 + Math.random() * 0.5;
        car.pitStops++;
        this.addMessage(`🔧 ${car.driver.abbr} entra a boxes (Parada ${car.pitStops})`, "pit");
    }

    _updatePitStop(car, gameDelta) {
        car.pitStopTimer += gameDelta;

        if (car.pitStopTimer < car.pitStopDuration) {
            car.progress += 0.008 * gameDelta;
        } else {
            car.inPitLane = false;

            const oldTire = car.tire;
            if (oldTire === 'soft') {
                car.tire = Math.random() > 0.4 ? 'hard' : 'medium';
            } else if (oldTire === 'medium') {
                car.tire = Math.random() > 0.5 ? 'hard' : 'soft';
            } else {
                car.tire = Math.random() > 0.5 ? 'medium' : 'soft';
            }
            car.tireLife = 100;
            car.tiresUsed.push(car.tire);

            const nextStopIndex = car.pitStops;
            if (nextStopIndex < car.plannedStops.length) {
                car.nextStopLap = car.plannedStops[nextStopIndex];
            } else {
                car.nextStopLap = 999;
            }

            this.addMessage(
                `🔧 ${car.driver.abbr} sale de boxes ─ ${TIRE_COMPOUNDS[car.tire].name} (${car.pitStopTimer.toFixed(1)}s)`,
                "pit"
            );

            car.progress = this.track.pitLane.exitFraction;
            car.totalProgress = car.lap + car.progress;
        }
    }

    _updatePositions() {
        const activeCars = this.cars.filter(c => !c.retired);
        activeCars.sort((a, b) => b.totalProgress - a.totalProgress);

        for (let i = 0; i < activeCars.length; i++) {
            activeCars[i].position = i + 1;
        }
    }

    _updateGaps() {
        const leader = this.cars.find(c => c.position === 1);
        if (!leader) return;

        for (const car of this.cars) {
            if (car.retired) continue;

            car.gapToLeader = this._getGapBetween(leader, car);

            const ahead = this.cars.find(c => c.position === car.position - 1 && !c.retired);
            car.gapToAhead = ahead ? this._getGapBetween(ahead, car) : 0;
            car.interval = car.position === 1 ? 0 : car.gapToAhead;
        }
    }

    _getGapBetween(carAhead, carBehind) {
        const progressDiff = carAhead.totalProgress - carBehind.totalProgress;
        if (progressDiff < 0) return 0;
        const avgLapTime = 13.5;
        return progressDiff * avgLapTime;
    }

    _updateDRS() {
        if (!this.drsEnabled || this.safetyCarActive) {
            for (const car of this.cars) {
                car.drsActive = false;
                car.drsAvailable = false;
            }
            return;
        }

        for (const car of this.cars) {
            if (car.retired || car.inPitLane) {
                car.drsActive = false;
                car.drsAvailable = false;
                continue;
            }

            const drsZone = isInDRSZone(car.progress, this.track.drsZones);
            if (drsZone) {
                const ahead = this.cars.find(c => c.position === car.position - 1 && !c.retired && !c.inPitLane);
                if (ahead) {
                    const gap = this._getGapBetween(ahead, car);
                    car.drsAvailable = gap > 0 && gap < 1.0;
                    car.drsActive = car.drsAvailable;
                } else {
                    car.drsAvailable = false;
                    car.drsActive = false;
                }
            } else {
                car.drsActive = false;
            }
        }
    }

    _checkOvertaking() {
        if (this.safetyCarActive) return;

        for (const car of this.cars) {
            if (car.retired || car.inPitLane || car.position === 1) continue;

            const ahead = this.cars.find(c => c.position === car.position - 1 && !c.retired && !c.inPitLane);
            if (!ahead) continue;

            const gap = this._getGapBetween(ahead, car);
            if (gap > 0.5 || gap < 0) continue;

            const otZone = isInOvertakingZone(car.progress, this.track.overtakingZones);
            if (!otZone) continue;

            let prob = otZone.chance * 0.003;

            if (car.drsActive) prob *= 2.5;
            prob *= (car.driver.aggression / 80);
            if (car.baseSpeed > ahead.baseSpeed) prob *= 1.5;
            if (car.tireLife > ahead.tireLife + 20) prob *= 1.5;
            prob *= (1.0 - ahead.driver.aggression * 0.003);

            if (Math.random() < prob) {
                this._executeOvertake(car, ahead);
            }
        }
    }

    _executeOvertake(overtaker, defender) {
        overtaker.totalProgress = defender.totalProgress + 0.002;
        overtaker.progress = overtaker.totalProgress - overtaker.lap;
        if (overtaker.progress >= 1) {
            overtaker.progress -= 1;
        }

        overtaker.isOvertaking = true;
        overtaker.overtakeTimer = 1.5;
        overtaker.visualOffset = -15;

        this.addMessage(
            `🔄 ${overtaker.driver.abbr} adelanta a ${defender.driver.abbr} (P${defender.position})`,
            "overtake"
        );
    }

    _checkRandomEvents(gameDelta) {
        if (Math.random() < 0.00005 * gameDelta) {
            const activeCars = this.cars.filter(c => !c.retired && !c.finished);
            if (activeCars.length > 5) {
                const weights = activeCars.map(c => (100 - c.carPerf.reliability) / 100);
                const totalWeight = weights.reduce((a, b) => a + b, 0);
                let r = Math.random() * totalWeight;
                let victim = activeCars[0];
                for (let i = 0; i < activeCars.length; i++) {
                    r -= weights[i];
                    if (r <= 0) { victim = activeCars[i]; break; }
                }

                victim.retired = true;
                const reasons = ["Motor", "Caja de cambios", "Hidráulico", "Frenos", "Electrónico"];
                victim.retiredReason = reasons[Math.floor(Math.random() * reasons.length)];
                this.addMessage(
                    `❌ ${victim.driver.abbr} ABANDONA ─ Problema de ${victim.retiredReason}`,
                    "retire"
                );
            }
        }
    }

    _checkRaceEnd() {
        const allFinished = this.cars.filter(c => !c.retired).every(c => c.finished);
        if (allFinished && this.status === 'racing') {
            this.status = 'finished';
            this.addMessage("🏁 FINAL DE LA CARRERA", "end");
        }
    }

    // ── PLAYER COMMANDS ──

    pitPlayerCar(driverIndex = 0) {
        const playerCars = this.cars.filter(c => c.team.id === this.playerTeamId && !c.retired);
        const car = playerCars[driverIndex];
        if (!car || car.inPitLane) return false;

        car.nextStopLap = car.lap;
        this.addMessage(`📡 Radio: "${car.driver.abbr}, box box box"`, "radio");
        return true;
    }

    changeTireForPlayer(driverIndex, compound) {
        const playerCars = this.cars.filter(c => c.team.id === this.playerTeamId && !c.retired);
        const car = playerCars[driverIndex];
        if (!car) return;
        car._nextTire = compound;
    }

    setSpeed(multiplier) {
        this.speedMultiplier = Math.max(0.5, Math.min(10, multiplier));
    }

    // ── STATE GETTERS ──

    getState() {
        return {
            cars: this.cars.map(car => ({
                id: car.driver.id,
                name: car.driver.name,
                abbr: car.driver.abbr,
                number: car.driver.number,
                teamName: car.team.name,
                teamShort: car.team.shortName,
                teamColor: car.team.color,
                teamAccent: car.team.accent,
                teamId: car.team.id,
                position: car.position,
                gridPosition: car.gridPosition,
                lap: car.lap,
                progress: car.progress,
                totalProgress: car.totalProgress,
                currentSpeed: car.currentSpeed || 0,
                tire: car.tire,
                tireLife: car.tireLife,
                tireColor: TIRE_COMPOUNDS[car.tire]?.color || '#FFF',
                tireLetter: TIRE_COMPOUNDS[car.tire]?.letter || '?',
                pitStops: car.pitStops,
                lastLapTime: car.lastLapTime,
                bestLapTime: car.bestLapTime,
                sectorTimes: [...car.sectorTimes],
                gapToLeader: car.gapToLeader,
                gapToAhead: car.gapToAhead,
                interval: car.interval,
                drsActive: car.drsActive,
                drsAvailable: car.drsAvailable,
                inPitLane: car.inPitLane,
                retired: car.retired,
                retiredReason: car.retiredReason,
                finished: car.finished,
                fuel: car.fuel,
                isOvertaking: car.isOvertaking,
                visualOffset: car.visualOffset,
                tiresUsed: [...car.tiresUsed],
            })),
            currentLap: this.currentLap,
            totalLaps: this.totalLaps,
            raceTime: this.raceTime,
            status: this.status,
            lightsStage: this.lightsStage,
            messages: [...this.messages],
            fastestLap: { ...this.fastestLap },
            drsEnabled: this.drsEnabled,
            safetyCarActive: this.safetyCarActive,
            weather: this.weather,
            playerTeamId: this.playerTeamId,
            speedMultiplier: this.speedMultiplier,
        };
    }

    // ── HELPERS ──

    addMessage(text, type = "info") {
        this.messages.push({
            text,
            type,
            time: this.raceTime,
            timestamp: Date.now(),
        });
        if (this.messages.length > 50) {
            this.messages.shift();
        }
    }

    formatLapTime(seconds) {
        if (!seconds || seconds === Infinity) return "--:--.---";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toFixed(3).padStart(6, '0')}`;
    }

    formatGap(seconds) {
        if (seconds <= 0) return "";
        if (seconds >= 60) return `+${Math.floor(seconds / 60)} vuelta${Math.floor(seconds / 60) > 1 ? 's' : ''}`;
        return `+${seconds.toFixed(1)}`;
    }

    getResults() {
        return this.cars
            .filter(c => !c.retired)
            .sort((a, b) => a.position - b.position)
            .map(car => ({
                position: car.position,
                driver: car.driver.name,
                abbr: car.driver.abbr,
                team: car.team.name,
                teamColor: car.team.color,
                laps: car.lap,
                bestLap: this.formatLapTime(car.bestLapTime),
                pitStops: car.pitStops,
                tiresUsed: car.tiresUsed,
                gapToLeader: car.gapToLeader,
            }));
    }

    getRetirements() {
        return this.cars
            .filter(c => c.retired)
            .map(car => ({
                driver: car.driver.name,
                abbr: car.driver.abbr,
                team: car.team.name,
                teamColor: car.team.color,
                reason: car.retiredReason,
                lap: car.lap,
            }));
    }
}
