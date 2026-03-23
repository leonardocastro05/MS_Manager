const mongoose = require('mongoose');

// ===========================================
// LEAGUE SCHEMA - MS Manager Online Mode
// ===========================================
const LeagueSchema = new mongoose.Schema({
    // ===== Basic Info =====
    name: {
        type: String,
        required: [true, 'League name is required'],
        trim: true,
        minlength: [3, 'League name must be at least 3 characters'],
        maxlength: [50, 'League name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    logo: {
        type: String, // URL or base64 image (300x300)
        default: null
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'ES'
    },
    
    // ===== Schedule =====
    schedule: {
        dayOfWeek: {
            type: Number, // 0 = Sunday, 1 = Monday, etc.
            min: 0,
            max: 6,
            default: 6 // Saturday by default
        },
        time: {
            type: String, // Format: "HH:MM" (24h)
            default: '20:00'
        },
        timezone: {
            type: String,
            default: 'Europe/Madrid'
        }
    },
    
    // ===== Daily Races System =====
    dailyRaces: {
        maxRacesPerDay: {
            type: Number,
            default: 5 // 5 carreras máximas por día
        },
        // Días de descanso (0 = Domingo, 6 = Sábado)
        restDays: {
            type: [Number],
            default: [0, 6] // Sábado y Domingo son días de descanso
        }
    },
    
    // ===== Creator & Members =====
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        stats: {
            wins: { type: Number, default: 0 },
            podiums: { type: Number, default: 0 },
            points: { type: Number, default: 0 },
            racesCompleted: { type: Number, default: 0 }
        },
        // HQ (Headquarters) - Each user has their own HQ per league
        hq: {
            engine: { level: { type: Number, default: 1, min: 1, max: 50 } },
            aero: { level: { type: Number, default: 1, min: 1, max: 50 } },
            drs: { level: { type: Number, default: 1, min: 1, max: 50 } },
            chassis: { level: { type: Number, default: 1, min: 1, max: 50 } },
            market: { level: { type: Number, default: 1, min: 1, max: 50 } }
        },
        // Daily races tracking
        dailyRacesCount: {
            date: { type: Date, default: Date.now },
            count: { type: Number, default: 0 }
        },
        // Current pilot for this league
        currentPilot: {
            id: String,
            name: String,
            nationality: {
                code: String,
                flag: String,
                name: String
            },
            level: Number,
            overall: Number,
            stats: {
                speed: Number,
                control: Number,
                experience: Number
            },
            rarity: {
                type: String,
                enum: ['common', 'uncommon', 'rare', 'epic', 'legendary']
            },
            price: Number
        }
    }],
    
    // ===== League Settings =====
    settings: {
        maxMembers: {
            type: Number,
            default: 22,
            min: 2,
            max: 22
        },
        isPrivate: {
            type: Boolean,
            default: false
        },
        inviteCode: {
            type: String,
            unique: true,
            sparse: true
        },
        minLevel: {
            type: Number,
            default: 1,
            min: 1,
            max: 50
        }
    },
    
    // ===== Season Data =====
    currentSeason: {
        number: { type: Number, default: 1 },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date },
        currentRace: { type: Number, default: 0 },
        totalRaces: { type: Number, default: 10 },
        standings: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            points: { type: Number, default: 0 },
            wins: { type: Number, default: 0 },
            podiums: { type: Number, default: 0 },
            position: { type: Number }
        }]
    },
    
    // ===== Race History =====
    raceHistory: [{
        raceNumber: Number,
        circuit: String,
        date: Date,
        results: [{
            position: Number,
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            points: Number,
            time: String,
            xpEarned: Number
        }]
    }],
    
    // ===== League Chat/Forum =====
    chat: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        avatar: String,
        message: {
            type: String,
            maxlength: 500
        },
        type: {
            type: String,
            enum: ['message', 'system', 'announcement', 'season_winner'],
            default: 'message'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    
    // ===== Status =====
    status: {
        type: String,
        enum: ['active', 'paused', 'ended', 'archived'],
        default: 'active'
    },
    
    // ===== Timestamps =====
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// ===========================================
// INDEXES
// ===========================================
LeagueSchema.index({ name: 'text', description: 'text' });
LeagueSchema.index({ country: 1 });
LeagueSchema.index({ 'settings.isPrivate': 1 });
LeagueSchema.index({ creator: 1 });
LeagueSchema.index({ 'members.user': 1 });

// ===========================================
// MIDDLEWARE
// ===========================================
LeagueSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Generate invite code if private
LeagueSchema.pre('save', function(next) {
    if (this.settings.isPrivate && !this.settings.inviteCode) {
        this.settings.inviteCode = generateInviteCode();
    }
    next();
});

function generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ===========================================
// METHODS
// ===========================================
LeagueSchema.methods.getPublicInfo = function() {
    return {
        id: this._id,
        name: this.name,
        description: this.description,
        logo: this.logo,
        country: this.country,
        schedule: this.schedule,
        dailyRaces: this.dailyRaces,
        memberCount: this.members.length,
        maxMembers: this.settings.maxMembers,
        minLevel: this.settings.minLevel,
        isPrivate: this.settings.isPrivate,
        status: this.status,
        currentSeason: {
            number: this.currentSeason.number,
            currentRace: this.currentSeason.currentRace,
            totalRaces: this.currentSeason.totalRaces
        },
        createdAt: this.createdAt
    };
};

// Check if user can race today
LeagueSchema.methods.canUserRaceToday = function(userId) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Check if it's a rest day (Saturday = 6, Sunday = 0)
    if (this.dailyRaces.restDays.includes(dayOfWeek)) {
        return { canRace: false, reason: 'rest_day', message: 'Hoy es día de descanso (fin de semana)' };
    }
    
    // Find member
    const member = this.members.find(m => m.user.toString() === userId.toString());
    if (!member) {
        return { canRace: false, reason: 'not_member', message: 'No eres miembro de esta liga' };
    }
    
    // Check daily race count
    const memberDailyRaces = member.dailyRacesCount || { date: new Date(0), count: 0 };
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const raceDate = new Date(memberDailyRaces.date);
    const raceDateStart = new Date(raceDate.getFullYear(), raceDate.getMonth(), raceDate.getDate());
    
    // If it's a new day, reset count
    if (todayStart.getTime() !== raceDateStart.getTime()) {
        return { canRace: true, racesRemaining: this.dailyRaces.maxRacesPerDay, racesToday: 0 };
    }
    
    // Check if under limit
    const racesToday = memberDailyRaces.count || 0;
    if (racesToday >= this.dailyRaces.maxRacesPerDay) {
        return { 
            canRace: false, 
            reason: 'daily_limit', 
            message: `Has alcanzado el límite de ${this.dailyRaces.maxRacesPerDay} carreras hoy`,
            racesToday,
            racesRemaining: 0
        };
    }
    
    return { 
        canRace: true, 
        racesRemaining: this.dailyRaces.maxRacesPerDay - racesToday,
        racesToday 
    };
};

// Increment user's daily race count
LeagueSchema.methods.incrementDailyRaceCount = async function(userId) {
    const memberIndex = this.members.findIndex(m => m.user.toString() === userId.toString());
    if (memberIndex === -1) return false;
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const memberDailyRaces = this.members[memberIndex].dailyRacesCount || { date: new Date(0), count: 0 };
    const raceDate = new Date(memberDailyRaces.date);
    const raceDateStart = new Date(raceDate.getFullYear(), raceDate.getMonth(), raceDate.getDate());
    
    if (todayStart.getTime() !== raceDateStart.getTime()) {
        // New day, reset
        this.members[memberIndex].dailyRacesCount = { date: today, count: 1 };
    } else {
        // Same day, increment
        this.members[memberIndex].dailyRacesCount.count++;
    }
    
    await this.save();
    return true;
};

// Add chat message
LeagueSchema.methods.addChatMessage = async function(userId, message, type = 'message') {
    const User = mongoose.model('User');
    const user = await User.findById(userId);
    
    if (!user) throw new Error('User not found');
    
    this.chat.push({
        user: userId,
        username: user.displayName || user.username,
        avatar: user.avatar,
        message,
        type,
        timestamp: new Date()
    });
    
    // Limit chat history to last 500 messages
    if (this.chat.length > 500) {
        this.chat = this.chat.slice(-500);
    }
    
    await this.save();
    return this.chat[this.chat.length - 1];
};

// Announce season winner
LeagueSchema.methods.announceSeasonWinner = async function() {
    if (this.currentSeason.standings.length === 0) return;
    
    // Sort and get winner
    this.updateStandings();
    const winner = this.currentSeason.standings[0];
    
    const User = mongoose.model('User');
    const winnerUser = await User.findById(winner.user);
    
    const winnerMessage = `🏆🎉 ¡${winnerUser?.displayName || winnerUser?.username || 'Jugador'} ha ganado la TEMPORADA ${this.currentSeason.number}! 🎉🏆\n` +
        `📊 Estadísticas: ${winner.points} puntos | ${winner.wins} victorias | ${winner.podiums} podios`;
    
    await this.addChatMessage(winner.user, winnerMessage, 'season_winner');
    
    return { winner: winnerUser, stats: winner };
};

LeagueSchema.methods.addMember = async function(userId, role = 'member') {
    if (this.members.length >= this.settings.maxMembers) {
        throw new Error('League is full');
    }
    
    const existingMember = this.members.find(m => m.user.toString() === userId.toString());
    if (existingMember) {
        throw new Error('User is already a member');
    }
    
    this.members.push({
        user: userId,
        role: role,
        joinedAt: new Date(),
        stats: { wins: 0, podiums: 0, points: 0, racesCompleted: 0 }
    });
    
    await this.save();
    return this;
};

LeagueSchema.methods.removeMember = async function(userId) {
    const memberIndex = this.members.findIndex(m => m.user.toString() === userId.toString());
    
    if (memberIndex === -1) {
        throw new Error('User is not a member');
    }
    
    if (this.members[memberIndex].role === 'owner') {
        throw new Error('Cannot remove the owner');
    }
    
    this.members.splice(memberIndex, 1);
    await this.save();
    return this;
};

LeagueSchema.methods.updateStandings = function() {
    // Sort standings by points (desc), then by wins (desc)
    this.currentSeason.standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.wins - a.wins;
    });
    
    // Update positions
    this.currentSeason.standings.forEach((standing, index) => {
        standing.position = index + 1;
    });
};

// ===========================================
// STATICS
// ===========================================
LeagueSchema.statics.searchLeagues = async function(query, options = {}) {
    const {
        country,
        minMembers = 0,
        maxMembers = 22,
        page = 1,
        limit = 20
    } = options;
    
    const filter = {
        'settings.isPrivate': false,
        status: 'active'
    };
    
    if (query) {
        filter.$text = { $search: query };
    }
    
    if (country) {
        filter.country = country;
    }
    
    const leagues = await this.find(filter)
        .select('name description logo country schedule members settings currentSeason createdAt')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    
    // Filter by member count
    return leagues.filter(league => 
        league.members.length >= minMembers && 
        league.members.length <= maxMembers
    );
};

module.exports = mongoose.model('League', LeagueSchema);
