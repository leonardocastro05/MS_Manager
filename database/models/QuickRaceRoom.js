const mongoose = require('mongoose');

const QuickRaceParticipantSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    displayName: {
        type: String,
        required: true,
        trim: true,
        maxlength: [60, 'Display name cannot exceed 60 characters']
    },
    teamName: {
        type: String,
        default: 'Sin equipo',
        trim: true,
        maxlength: [80, 'Team name cannot exceed 80 characters']
    },
    tyreCompound: {
        type: String,
        enum: ['soft', 'medium', 'hard'],
        default: 'medium'
    },
    ready: {
        type: Boolean,
        default: false
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const QuickRaceInvitationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: {
        type: Date,
        default: null
    }
}, { _id: true });

const QuickRaceChatSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true,
        trim: true,
        maxlength: [60, 'Username cannot exceed 60 characters']
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: [300, 'Message cannot exceed 300 characters']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const QuickRaceRoomSchema = new mongoose.Schema({
    roomCode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        minlength: [5, 'Room code must be 5 characters'],
        maxlength: [5, 'Room code must be 5 characters']
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trackId: {
        type: String,
        required: true,
        default: 'monza'
    },
    laps: {
        type: Number,
        enum: [10, 20, 30],
        default: 10
    },
    status: {
        type: String,
        enum: ['waiting', 'countdown', 'racing', 'finished', 'cancelled'],
        default: 'waiting'
    },
    countdownStartAt: {
        type: Date,
        default: null
    },
    raceStartedAt: {
        type: Date,
        default: null
    },
    raceFinishedAt: {
        type: Date,
        default: null
    },
    participants: {
        type: [QuickRaceParticipantSchema],
        default: []
    },
    invitations: {
        type: [QuickRaceInvitationSchema],
        default: []
    },
    chat: {
        type: [QuickRaceChatSchema],
        default: []
    }
}, {
    timestamps: true
});

QuickRaceRoomSchema.index({ roomCode: 1 }, { unique: true });
QuickRaceRoomSchema.index({ host: 1 });
QuickRaceRoomSchema.index({ 'participants.user': 1 });
QuickRaceRoomSchema.index({ 'invitations.user': 1, 'invitations.status': 1 });

module.exports = mongoose.model('QuickRaceRoom', QuickRaceRoomSchema);
