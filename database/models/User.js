const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    teamName: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
        maxlength: [50, 'Team name cannot exceed 50 characters']
    },
    gameData: {
        budget: {
            type: Number,
            default: 20000000
        },
        drivers: {
            type: Array,
            default: []
        },
        managers: {
            type: Array,
            default: []
        },
        upgrades: {
            engine: { type: Number, default: 1 },
            aero: { type: Number, default: 1 },
            chassis: { type: Number, default: 1 }
        },
        wins: {
            type: Number,
            default: 0
        },
        podiums: {
            type: Number,
            default: 0
        },
        points: {
            type: Number,
            default: 0
        },
        racesCompleted: {
            type: Number,
            default: 0
        },
        careerMode: {
            active: { type: Boolean, default: false },
            currentRace: { type: Number, default: 0 },
            races: { type: Array, default: [] },
            standings: { type: Array, default: [] }
        },
        raceHistory: {
            type: Array,
            default: []
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare passwords
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
