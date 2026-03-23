const mongoose = require('mongoose');

// ===========================================
// RACE SCHEMA - MS Manager Live Racing System
// ===========================================
const RaceSchema = new mongoose.Schema({
    // ===== Basic Info =====
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League',
        required: true
    },
    circuit: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        country: { type: String },
        laps: { type: Number, default: 50 },
        length: { type: Number }, // km
        characteristics: {
            tyreWear: { type: String, enum: ['low', 'medium', 'high'] },
            fuelConsumption: { type: String, enum: ['low', 'medium', 'high'] },
            overtaking: { type: String, enum: ['easy', 'medium', 'hard'] }
        }
    },
    raceNumber: {
        type: Number,
        required: true
    },
    seasonNumber: {
        type: Number,
        default: 1
    },
    
    // ===== Schedule =====
    scheduledTime: {
        type: Date,
        required: true
    },
    actualStartTime: Date,
    endTime: Date,
    
    // ===== Race Status =====
    status: {
        type: String,
        enum: ['scheduled', 'practice', 'qualifying', 'racing', 'finished', 'cancelled'],
        default: 'scheduled'
    },
    currentLap: {
        type: Number,
        default: 0
    },
    totalLaps: {
        type: Number,
        default: 50
    },
    
    // ===== Weather =====
    weather: {
        condition: {
            type: String,
            enum: ['sunny', 'cloudy', 'lightRain', 'heavyRain', 'night'],
            default: 'sunny'
        },
        temperature: { type: Number, default: 25 }, // Celsius
        trackTemperature: { type: Number, default: 35 },
        rainChance: { type: Number, default: 0, min: 0, max: 100 }
    },
    
    // ===== Practice Session =====
    practice: {
        startTime: Date,
        endTime: Date,
        duration: { type: Number, default: 30 }, // minutes
        results: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            pilotName: String,
            teamName: String,
            bestLap: String, // "1:32.456" format
            bestLapMs: Number, // milliseconds for sorting
            lapsCompleted: { type: Number, default: 0 },
            sector1: String,
            sector2: String,
            sector3: String
        }]
    },
    
    // ===== Qualifying Session =====
    qualifying: {
        startTime: Date,
        endTime: Date,
        results: [{
            position: Number,
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            pilotName: String,
            teamName: String,
            lapTime: String,
            lapTimeMs: Number,
            gap: String // "+0.234" format
        }]
    },
    
    // ===== Grid (Starting Positions) =====
    grid: [{
        position: Number,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        pilotName: String,
        teamName: String,
        teamColor: String
    }],
    
    // ===== Live Race State =====
    liveState: {
        // All participants current state
        participants: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            pilotName: String,
            teamName: String,
            teamColor: { type: String, default: '#ff0000' },
            
            // Position & Timing
            position: Number,
            currentLap: { type: Number, default: 0 },
            lastLapTime: String,
            lastLapMs: Number,
            bestLapTime: String,
            bestLapMs: Number,
            totalTime: Number, // ms from race start
            gap: String, // gap to leader
            interval: String, // gap to car ahead
            
            // Track Position (for visualization)
            trackProgress: { type: Number, default: 0, min: 0, max: 100 }, // 0-100% of lap
            
            // Car Status
            tyres: {
                compound: { type: String, enum: ['soft', 'medium', 'hard', 'intermediate', 'wet'], default: 'medium' },
                wear: { type: Number, default: 100, min: 0, max: 100 }
            },
            fuel: {
                current: { type: Number, default: 100 }, // kg
                consumption: { type: Number, default: 1.5 } // kg per lap
            },
            damage: { type: Number, default: 0, min: 0, max: 100 },
            
            // Status
            status: {
                type: String,
                enum: ['racing', 'pit', 'retired', 'finished'],
                default: 'racing'
            },
            pitStops: [{
                lap: Number,
                duration: Number, // seconds
                tyreChange: String,
                fuelAdded: Number
            }],
            
            // Strategy (set by user)
            strategy: {
                pitLap: Number, // planned pit stop lap
                fuelLoad: Number, // starting fuel
                tyreCompound: String
            },
            
            // Online status
            isConnected: { type: Boolean, default: false },
            lastPing: Date
        }],
        
        // Race events log
        events: [{
            lap: Number,
            time: Date,
            type: {
                type: String,
                enum: ['start', 'overtake', 'pit_entry', 'pit_exit', 'fastest_lap', 
                       'incident', 'safety_car', 'yellow_flag', 'finish', 'retirement']
            },
            description: String,
            involvedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        }],
        
        // Flags
        flags: {
            safetycar: { type: Boolean, default: false },
            yellowFlag: { type: Boolean, default: false },
            redFlag: { type: Boolean, default: false }
        },
        
        // Fastest Lap
        fastestLap: {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            pilotName: String,
            time: String,
            timeMs: Number,
            lap: Number
        }
    },
    
    // ===== Final Results =====
    results: [{
        position: Number,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        pilotName: String,
        teamName: String,
        totalTime: String,
        totalTimeMs: Number,
        gap: String,
        lapsCompleted: Number,
        bestLap: String,
        points: Number,
        xpEarned: Number,
        moneyEarned: Number,
        pitStops: Number,
        status: { type: String, enum: ['finished', 'retired', 'dnf'] }
    }],
    
    // ===== Live Chat =====
    chat: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    
    // ===== Metadata =====
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ===== Indexes =====
RaceSchema.index({ league: 1, scheduledTime: 1 });
RaceSchema.index({ status: 1 });
RaceSchema.index({ 'liveState.participants.user': 1 });

// ===== Methods =====

// Get current standings sorted by position
RaceSchema.methods.getStandings = function() {
    if (!this.liveState || !this.liveState.participants) return [];
    
    return [...this.liveState.participants]
        .sort((a, b) => a.position - b.position);
};

// Add race event
RaceSchema.methods.addEvent = function(type, description, involvedUsers = []) {
    this.liveState.events.push({
        lap: this.currentLap,
        time: new Date(),
        type,
        description,
        involvedUsers
    });
};

// Calculate points based on position
RaceSchema.statics.calculatePoints = function(position) {
    const pointsTable = {
        1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
        6: 8, 7: 6, 8: 4, 9: 2, 10: 1
    };
    return pointsTable[position] || 0;
};

// Calculate XP earned
RaceSchema.statics.calculateXP = function(position, fastestLap = false) {
    const baseXP = Math.max(100 - (position - 1) * 8, 10);
    const fastestLapBonus = fastestLap ? 20 : 0;
    return baseXP + fastestLapBonus;
};

module.exports = mongoose.model('Race', RaceSchema);
