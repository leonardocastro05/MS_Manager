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
        onlineLeagues: { type: Array, default: [] },
        
        // Offline mode pilot
        currentPilot: { type: mongoose.Schema.Types.Mixed, default: null },
        
        // ===== International Ranking System =====
        globalRanking: {
            // Rank tiers: learner, amateur, professional, king, senna
            rank: { 
                type: String, 
                enum: ['learner', 'amateur', 'professional', 'king', 'senna'], 
                default: 'learner' 
            },
            // Total global wins (used for ranking)
            totalWins: { type: Number, default: 0 },
            // Position within current rank tier
            position: { type: Number, default: 0 },
            // Last season's final position (for promotion/relegation)
            lastSeasonPosition: { type: Number, default: 0 },
            // Season rewards history
            rewardsHistory: [{
                season: { type: Number },
                rank: { type: String },
                position: { type: Number },
                reward: { type: Number },
                icon: { type: String },
                date: { type: Date }
            }],
            // Current season stats
            currentSeason: {
                wins: { type: Number, default: 0 },
                races: { type: Number, default: 0 },
                startDate: { type: Date },
                endDate: { type: Date }
            },
            // Special badges earned
            badges: [{
                type: { type: String }, // 'stroll', 'a', 'p', 'goat', 'senna', 's'
                earnedAt: { type: Date },
                season: { type: Number }
            }],
            // Current active badge to display
            activeBadge: { type: String, default: null }
        }
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
UserSchema.index({ 'gameData.globalRanking.totalWins': -1 });
UserSchema.index({ 'gameData.globalRanking.rank': 1 });

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
        onlineWins: this.gameData.online?.onlineWins || 0,
        globalRanking: this.gameData.globalRanking || { rank: 'learner', totalWins: 0, position: 0 }
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
                      type === 'global' ? 'gameData.globalRanking.totalWins' :
                      'gameData.points';
    
    const users = await this.find({ isActive: true })
        .sort({ [sortField]: -1 })
        .limit(limit)
        .select('username displayName teamName avatar country gameData.wins gameData.points gameData.online.level gameData.online.onlineWins gameData.globalRanking');
    
    return users.map((u, index) => ({
        rank: index + 1,
        ...u.getLeaderboardData()
    }));
};

// Get global ranking with rank tiers
UserSchema.statics.getGlobalRanking = async function() {
    const rankTiers = ['learner', 'amateur', 'professional', 'king', 'senna'];
    const result = {};
    
    for (const tier of rankTiers) {
        const users = await this.find({ 
            isActive: true,
            'gameData.globalRanking.rank': tier
        })
        .sort({ 'gameData.globalRanking.totalWins': -1 })
        .select('username displayName teamName avatar country gameData.online.level gameData.globalRanking');
        
        result[tier] = users.map((u, index) => ({
            position: index + 1,
            id: u._id,
            displayName: u.displayName || u.username,
            teamName: u.teamName,
            avatar: u.avatar,
            country: u.country,
            level: u.gameData.online?.level || 1,
            globalRanking: u.gameData.globalRanking
        }));
    }
    
    return result;
};

// Calculate rewards for end of season
UserSchema.statics.calculateSeasonRewards = function(rank, position) {
    const rewards = {
        learner: { icon: 'stroll', money: 0 },
        amateur: { icon: 'a', money: 0 },
        professional: { icon: 'p', money: 0 },
        king: { icon: 'goat', money: 0 },
        senna: { icon: 's', money: 0 }
    };
    
    // Amateur rewards - Top 10 share 5M
    if (rank === 'amateur' && position <= 10) {
        const distribution = [1000000, 900000, 750000, 650000, 550000, 450000, 350000, 200000, 100000, 50000];
        rewards.amateur.money = distribution[position - 1] || 0;
    }
    
    // Professional rewards - Top 10 share 7M
    if (rank === 'professional' && position <= 10) {
        const distribution = [1400000, 1260000, 1050000, 910000, 770000, 630000, 490000, 280000, 140000, 70000];
        rewards.professional.money = distribution[position - 1] || 0;
    }
    
    // King rewards - Top 5 get 7M each, 6-10 share 5M
    if (rank === 'king') {
        if (position <= 5) {
            rewards.king.money = 7000000;
        } else if (position <= 10) {
            const distribution = [1500000, 1200000, 1000000, 800000, 500000];
            rewards.king.money = distribution[position - 6] || 0;
        }
    }
    
    // Senna rewards - Top 3 get 15M + special icon, rest get 'S' icon
    if (rank === 'senna') {
        if (position <= 3) {
            rewards.senna.money = 15000000;
            rewards.senna.icon = 'senna';
        }
    }
    
    return rewards[rank];
};

// Check for promotion/relegation
UserSchema.statics.shouldPromote = function(position, totalInRank) {
    // Top 10 of server get promoted
    return position <= 10;
};

UserSchema.statics.shouldRelegate = function(position, totalInRank) {
    // Bottom 3 of server get relegated
    return position > totalInRank - 3;
};

module.exports = mongoose.model('User', UserSchema);
