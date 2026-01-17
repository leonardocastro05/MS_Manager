const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ===========================================
// USER SCHEMA - MS Manager
// ===========================================
const UserSchema = new mongoose.Schema({
    // ===== Authentication Fields =====
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },
    
    // ===== OAuth Fields =====
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true
    },
    avatar: {
        type: String,
        default: null
    },
    
    // ===== Profile Fields =====
    teamName: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
        maxlength: [50, 'Team name cannot exceed 50 characters']
    },
    displayName: {
        type: String,
        trim: true,
        maxlength: [50, 'Display name cannot exceed 50 characters']
    },
    country: {
        type: String,
        default: 'ES'
    },
    
    // ===== Game Data =====
    gameData: {
        budget: { type: Number, default: 20000000 },
        drivers: { type: Array, default: [] },
        managers: { type: Array, default: [] },
        upgrades: {
            engine: { type: Number, default: 1, min: 1, max: 10 },
            aero: { type: Number, default: 1, min: 1, max: 10 },
            drs: { type: Number, default: 1, min: 1, max: 10 },
            chassis: { type: Number, default: 1, min: 1, max: 10 }
        },
        // HQ Levels - Required level 5 in all to unlock online mode
        hqLevels: {
            facilities: { type: Number, default: 1, min: 1, max: 50 },
            engineering: { type: Number, default: 1, min: 1, max: 50 },
            marketing: { type: Number, default: 1, min: 1, max: 50 },
            staff: { type: Number, default: 1, min: 1, max: 50 }
        },
        wins: { type: Number, default: 0 },
        podiums: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        racesCompleted: { type: Number, default: 0 },
        careerMode: {
            active: { type: Boolean, default: false },
            currentRace: { type: Number, default: 0 },
            races: { type: Array, default: [] },
            standings: { type: Array, default: [] }
        },
        raceHistory: { type: Array, default: [] },
        
        // Online Mode Data
        online: {
            coins: { type: Number, default: 20 },
            level: { type: Number, default: 1 },
            xp: { type: Number, default: 0 },
            driverLevel: { type: Number, default: 1 },
            managerLevel: { type: Number, default: 1 },
            sponsor: { type: Object, default: null },
            sponsorRacesRemaining: { type: Number, default: 0 },
            carConfig: {
                color: { type: String, default: '#FFD700' },
                finish: { type: String, default: 'brillant' }
            },
            carUpgrades: {
                engine: { type: Number, default: 0 },
                aero: { type: Number, default: 0 },
                chassis: { type: Number, default: 0 }
            },
            totalRaces: { type: Number, default: 0 },
            onlineWins: { type: Number, default: 0 },
            onlinePodiums: { type: Number, default: 0 }
        },
        onlineLeagues: { type: Array, default: [] }
    },
    
    // ===== Account Status =====
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: { 
        type: String, 
        enum: ['user', 'moderator', 'admin'], 
        default: 'user' 
    },
    
    // ===== Timestamps =====
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now }
});

// ===========================================
// INDEXES
// ===========================================
UserSchema.index({ 'gameData.online.level': -1 });
UserSchema.index({ 'gameData.wins': -1 });
UserSchema.index({ 'gameData.points': -1 });

// ===========================================
// MIDDLEWARE
// ===========================================
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.pre('save', function(next) {
    this.lastActivity = new Date();
    next();
});

// ===========================================
// METHODS
// ===========================================
UserSchema.methods.matchPassword = async function(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        username: this.username,
        displayName: this.displayName || this.username,
        teamName: this.teamName,
        avatar: this.avatar,
        country: this.country,
        gameData: this.gameData,
        createdAt: this.createdAt,
        lastLogin: this.lastLogin
    };
};

UserSchema.methods.getLeaderboardData = function() {
    return {
        id: this._id,
        displayName: this.displayName || this.username,
        teamName: this.teamName,
        avatar: this.avatar,
        country: this.country,
        level: this.gameData.online?.level || 1,
        wins: this.gameData.wins || 0,
        points: this.gameData.points || 0,
        onlineWins: this.gameData.online?.onlineWins || 0
    };
};

// ===========================================
// STATICS
// ===========================================
UserSchema.statics.findOrCreateFromOAuth = async function(profile, provider) {
    const providerIdField = `${provider}Id`;
    
    let user = await this.findOne({ [providerIdField]: profile.id });
    
    if (user) {
        user.lastLogin = new Date();
        await user.save();
        return { user, isNew: false };
    }
    
    if (profile.emails && profile.emails[0]) {
        user = await this.findOne({ email: profile.emails[0].value });
        if (user) {
            user[providerIdField] = profile.id;
            if (!user.avatar && profile.photos && profile.photos[0]) {
                user.avatar = profile.photos[0].value;
            }
            user.lastLogin = new Date();
            await user.save();
            return { user, isNew: false };
        }
    }
    
    const newUser = new this({
        [providerIdField]: profile.id,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : undefined,
        displayName: profile.displayName,
        teamName: `${profile.displayName}'s Team`,
        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        isVerified: true
    });
    
    await newUser.save();
    return { user: newUser, isNew: true };
};

UserSchema.statics.getLeaderboard = async function(type = 'points', limit = 100) {
    const sortField = type === 'wins' ? 'gameData.wins' : 
                      type === 'online' ? 'gameData.online.onlineWins' : 
                      'gameData.points';
    
    const users = await this.find({ isActive: true })
        .sort({ [sortField]: -1 })
        .limit(limit)
        .select('username displayName teamName avatar country gameData.wins gameData.points gameData.online.level gameData.online.onlineWins');
    
    return users.map((u, index) => ({
        rank: index + 1,
        ...u.getLeaderboardData()
    }));
};

module.exports = mongoose.model('User', UserSchema);
