// ===========================================
// SOCIAL ROUTES (Friends + Quick Friendly Races)
// ===========================================
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { addXpToOnlineData, getXpForRacePosition } = require('../utils/onlineProgression');
const User = require('../models/User');
const QuickRaceRoom = require('../models/QuickRaceRoom');

const FRIEND_SUMMARY_FIELDS = 'username displayName teamName avatar country';
const FRIEND_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 5;
const FRIEND_CODE_LENGTH = 8;
const ROOM_COUNTDOWN_MS = 3000;
const ALLOWED_TRACK_IDS = new Set(['monza', 'bahrain', 'melbourne', 'shanghai', 'montmelo', 'leoverse']);
const ALLOWED_LAPS = new Set([10, 20, 30]);
const ALLOWED_TYRES = new Set(['soft', 'medium', 'hard']);
const QUICK_RACE_ACTIVE_STATUSES = ['waiting', 'countdown', 'racing'];
const QUICK_RACE_LIVE_STATE_TTL_MS = 15 * 60 * 1000;
const QUICK_RACE_LIVE_MEMBERS_CACHE_MS = 30 * 1000;
const quickRaceLiveStateByRoom = new Map();

function toId(value) {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (value._id) return value._id.toString();
    return value.toString();
}

function normalizeLiveProgress(value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return ((parsed % 1) + 1) % 1;
}

function normalizeLiveCarState(carState = {}) {
    const progress = normalizeLiveProgress(carState.progress);
    const lap = Math.max(0, Math.floor(Number(carState.lap) || 0));
    const totalProgressParsed = Number(carState.totalProgress);
    const totalProgress = Number.isFinite(totalProgressParsed)
        ? Math.max(0, totalProgressParsed)
        : (lap + progress);
    const tireLifeParsed = Number(carState.tireLife);
    const pitTimeParsed = Number(carState.pitTime);
    const lastLapParsed = Number(carState.lastLap);
    const bestLapParsed = Number(carState.bestLap);

    return {
        progress,
        lap,
        totalProgress,
        inPit: Boolean(carState.inPit),
        pitRequested: Boolean(carState.pitRequested),
        pitTime: Number.isFinite(pitTimeParsed) ? Math.max(0, Math.min(20, pitTimeParsed)) : 0,
        tire: normalizeTyreCompound(carState.tire),
        tireLife: Number.isFinite(tireLifeParsed) ? Math.max(0, Math.min(100, tireLifeParsed)) : 100,
        finished: Boolean(carState.finished),
        retired: Boolean(carState.retired),
        lastLap: Number.isFinite(lastLapParsed) && lastLapParsed > 0 ? lastLapParsed : null,
        bestLap: Number.isFinite(bestLapParsed) && bestLapParsed > 0 ? bestLapParsed : null,
        nextPitTyre: normalizeTyreCompound(carState.nextPitTyre)
    };
}

function pruneStaleQuickRaceLiveStateEntries() {
    const now = Date.now();
    for (const [roomCode, entry] of quickRaceLiveStateByRoom.entries()) {
        if (!entry || now - entry.updatedAt > QUICK_RACE_LIVE_STATE_TTL_MS) {
            quickRaceLiveStateByRoom.delete(roomCode);
        }
    }
}

function ensureQuickRaceLiveStateEntry(roomCode) {
    const existing = quickRaceLiveStateByRoom.get(roomCode);
    if (existing) return existing;

    const created = {
        updatedAt: Date.now(),
        participants: new Map(),
        allowedUserIds: new Set(),
        roomStatus: null,
        membersCheckedAt: 0
    };

    quickRaceLiveStateByRoom.set(roomCode, created);
    return created;
}

function clearQuickRaceLiveState(roomCode) {
    quickRaceLiveStateByRoom.delete(roomCode);
}

function removeQuickRaceParticipantLiveState(roomCode, userId) {
    const entry = quickRaceLiveStateByRoom.get(roomCode);
    if (!entry) return;

    const targetId = toId(userId);
    entry.participants.delete(targetId);
    entry.allowedUserIds.delete(targetId);
    entry.updatedAt = Date.now();

    if (entry.participants.size === 0) {
        quickRaceLiveStateByRoom.delete(roomCode);
    }
}

function upsertQuickRaceParticipantLiveState(roomCode, userId, carState) {
    const entry = ensureQuickRaceLiveStateEntry(roomCode);
    const state = normalizeLiveCarState(carState);
    const targetId = toId(userId);

    entry.participants.set(targetId, {
        userId: targetId,
        ...state,
        updatedAt: new Date().toISOString()
    });
    entry.allowedUserIds.add(targetId);
    entry.updatedAt = Date.now();
}

function cacheQuickRaceLiveMembership(roomCode, room) {
    const entry = ensureQuickRaceLiveStateEntry(roomCode);
    entry.allowedUserIds = new Set((room.participants || []).map((participant) => toId(participant.user)));
    entry.roomStatus = room.status || null;
    entry.membersCheckedAt = Date.now();
    entry.updatedAt = Date.now();
}

function hasFreshQuickRaceLiveMembership(roomCode, userId) {
    const entry = quickRaceLiveStateByRoom.get(roomCode);
    if (!entry) return false;

    const age = Date.now() - Number(entry.membersCheckedAt || 0);
    if (age > QUICK_RACE_LIVE_MEMBERS_CACHE_MS) return false;

    return entry.allowedUserIds.has(toId(userId));
}

function getCachedQuickRaceLiveStatus(roomCode) {
    const entry = quickRaceLiveStateByRoom.get(roomCode);
    return entry?.roomStatus || null;
}

function serializeQuickRaceLiveStates(roomCode) {
    const entry = quickRaceLiveStateByRoom.get(roomCode);
    if (!entry) return [];

    return [...entry.participants.values()]
        .sort((a, b) => (b.totalProgress || 0) - (a.totalProgress || 0))
        .map((state, index) => ({
            ...state,
            position: index + 1
        }));
}

function mapUserSummary(userDoc) {
    if (!userDoc) return null;

    if (typeof userDoc === 'string' || userDoc instanceof mongoose.Types.ObjectId) {
        return {
            id: toId(userDoc),
            username: null,
            displayName: 'Manager',
            teamName: 'Sin equipo',
            avatar: null,
            country: 'ES'
        };
    }

    return {
        id: toId(userDoc._id || userDoc.id),
        username: userDoc.username || null,
        displayName: userDoc.displayName || userDoc.username || 'Manager',
        teamName: userDoc.teamName || 'Sin equipo',
        avatar: userDoc.avatar || null,
        country: userDoc.country || 'ES'
    };
}

function hasUserInRelation(relationList, userId) {
    const targetId = toId(userId);
    return Array.isArray(relationList) && relationList.some((entry) => toId(entry?.user) === targetId);
}

function removeUserFromRelation(relationList, userId) {
    const targetId = toId(userId);
    return (relationList || []).filter((entry) => toId(entry?.user) !== targetId);
}

function randomFromChars(chars, length) {
    let code = '';
    for (let i = 0; i < length; i += 1) {
        const index = Math.floor(Math.random() * chars.length);
        code += chars[index];
    }
    return code;
}

async function createUniqueFriendCode() {
    for (let attempt = 0; attempt < 30; attempt += 1) {
        const code = randomFromChars(FRIEND_CODE_CHARS, FRIEND_CODE_LENGTH);
        const exists = await User.exists({ friendCode: code });
        if (!exists) return code;
    }
    throw new Error('Could not generate unique friend code');
}

async function ensureFriendCode(user) {
    if (user.friendCode) return user.friendCode;
    const code = await createUniqueFriendCode();
    user.friendCode = code;
    await user.save();
    return user.friendCode;
}

function sanitizeFriendCode(input) {
    return String(input || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function sanitizeRoomCode(input) {
    return String(input || '').trim().replace(/\D/g, '').slice(0, ROOM_CODE_LENGTH);
}

function normalizeTrackId(trackId) {
    const normalized = String(trackId || '').trim().toLowerCase();
    return ALLOWED_TRACK_IDS.has(normalized) ? normalized : 'monza';
}

function normalizeLaps(laps) {
    const parsed = Number(laps);
    return ALLOWED_LAPS.has(parsed) ? parsed : 10;
}

function normalizeTyreCompound(tyreCompound) {
    const normalized = String(tyreCompound || '').trim().toLowerCase();
    return ALLOWED_TYRES.has(normalized) ? normalized : 'medium';
}

async function createUniqueRoomCode() {
    for (let attempt = 0; attempt < 30; attempt += 1) {
        const code = randomFromChars('0123456789', ROOM_CODE_LENGTH);
        const exists = await QuickRaceRoom.exists({ roomCode: code });
        if (!exists) return code;
    }
    throw new Error('Could not generate unique room code');
}

function isRoomParticipant(room, userId) {
    const targetId = toId(userId);
    return (room.participants || []).some((participant) => toId(participant.user) === targetId);
}

function hasPendingInvitation(room, userId) {
    const targetId = toId(userId);
    return (room.invitations || []).some(
        (invitation) => toId(invitation.user) === targetId && invitation.status === 'pending'
    );
}

function transitionCountdownToRaceIfNeeded(room) {
    if (room.status !== 'countdown' || !room.countdownStartAt) return false;
    const elapsed = Date.now() - new Date(room.countdownStartAt).getTime();
    if (elapsed < ROOM_COUNTDOWN_MS) return false;
    room.status = 'racing';
    if (!room.raceStartedAt) {
        room.raceStartedAt = new Date(new Date(room.countdownStartAt).getTime() + ROOM_COUNTDOWN_MS);
    }
    return true;
}

function serializeRaceMessage(message) {
    return {
        id: toId(message._id),
        userId: toId(message.user),
        username: message.username,
        message: message.message,
        timestamp: message.timestamp
    };
}

function serializeQuickRaceRoom(room, currentUserId) {
    const currentId = toId(currentUserId);
    const hostId = toId(room.host?._id || room.host);
    const participants = (room.participants || []).map((participant) => ({
        userId: toId(participant.user),
        displayName: participant.displayName,
        teamName: participant.teamName,
        tyreCompound: participant.tyreCompound,
        ready: Boolean(participant.ready),
        joinedAt: participant.joinedAt,
        isHost: toId(participant.user) === hostId,
        isSelf: toId(participant.user) === currentId
    }));

    const invitationPending = hasPendingInvitation(room, currentId);
    const pendingInvitations = (room.invitations || [])
        .filter((invitation) => invitation.status === 'pending')
        .map((invitation) => ({
            id: toId(invitation._id),
            user: mapUserSummary(invitation.user),
            fromUserId: toId(invitation.from),
            createdAt: invitation.createdAt
        }));

    const countdownRemainingMs = room.status === 'countdown' && room.countdownStartAt
        ? Math.max(0, ROOM_COUNTDOWN_MS - (Date.now() - new Date(room.countdownStartAt).getTime()))
        : null;

    return {
        roomCode: room.roomCode,
        trackId: room.trackId,
        laps: room.laps,
        status: room.status,
        host: mapUserSummary(room.host),
        countdownStartAt: room.countdownStartAt,
        countdownRemainingMs,
        raceStartedAt: room.raceStartedAt,
        raceFinishedAt: room.raceFinishedAt,
        participants,
        pendingInvitations,
        chatCount: Array.isArray(room.chat) ? room.chat.length : 0,
        currentUser: {
            userId: currentId,
            isHost: hostId === currentId,
            isParticipant: participants.some((participant) => participant.userId === currentId),
            invitationPending
        }
    };
}

function serializeQuickRaceHistoryRoom(room, currentUserId) {
    const currentId = toId(currentUserId);
    const hostId = toId(room.host?._id || room.host);
    const participantCount = Array.isArray(room.participants) ? room.participants.length : 0;
    const isHost = hostId === currentId;
    const isParticipant = isRoomParticipant(room, currentId);
    const isActive = QUICK_RACE_ACTIVE_STATUSES.includes(room.status);

    return {
        roomCode: room.roomCode,
        trackId: room.trackId,
        laps: room.laps,
        status: room.status,
        host: mapUserSummary(room.host),
        participantCount,
        isHost,
        isParticipant,
        isActive,
        canDelete: isHost || !isActive,
        raceStartedAt: room.raceStartedAt,
        raceFinishedAt: room.raceFinishedAt,
        updatedAt: room.updatedAt,
        createdAt: room.createdAt
    };
}

async function loadRoomOr404(roomCode) {
    return QuickRaceRoom.findOne({ roomCode })
        .populate('host', FRIEND_SUMMARY_FIELDS)
        .populate('invitations.user', FRIEND_SUMMARY_FIELDS);
}

function canAccessQuickRaceLiveState(room, userId) {
    return isRoomParticipant(room, userId);
}

// ===========================================
// FRIENDS
// ===========================================

// @route   GET /api/social/friends/overview
// @desc    Get friends, pending requests and pending quick-race invites
// @access  Private
router.get('/friends/overview', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await ensureFriendCode(user);
        await user.populate([
            { path: 'friends.user', select: FRIEND_SUMMARY_FIELDS },
            { path: 'incomingFriendRequests.user', select: FRIEND_SUMMARY_FIELDS },
            { path: 'outgoingFriendRequests.user', select: FRIEND_SUMMARY_FIELDS }
        ]);

        const pendingRaceInvites = await QuickRaceRoom.find({
            status: { $in: ['waiting', 'countdown'] },
            invitations: {
                $elemMatch: {
                    user: user._id,
                    status: 'pending'
                }
            }
        })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('host', FRIEND_SUMMARY_FIELDS);

        const friends = (user.friends || [])
            .map((friend) => {
                const payload = mapUserSummary(friend.user);
                if (!payload) return null;
                payload.since = friend.since;
                return payload;
            })
            .filter(Boolean);

        const incomingRequests = (user.incomingFriendRequests || [])
            .map((request) => {
                const from = mapUserSummary(request.user);
                if (!from) return null;
                return {
                    from,
                    createdAt: request.createdAt
                };
            })
            .filter(Boolean);

        const outgoingRequests = (user.outgoingFriendRequests || [])
            .map((request) => {
                const to = mapUserSummary(request.user);
                if (!to) return null;
                return {
                    to,
                    createdAt: request.createdAt
                };
            })
            .filter(Boolean);

        const raceInvites = pendingRaceInvites.map((room) => ({
            roomCode: room.roomCode,
            host: mapUserSummary(room.host),
            trackId: room.trackId,
            laps: room.laps,
            status: room.status,
            createdAt: room.createdAt
        }));

        res.json({
            success: true,
            friendCode: user.friendCode,
            friends,
            incomingRequests,
            outgoingRequests,
            raceInvites,
            hasPendingRequests: incomingRequests.length > 0,
            hasPendingRaceInvites: raceInvites.length > 0
        });
    } catch (error) {
        console.error('Social overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while loading social overview'
        });
    }
});

// @route   POST /api/social/friends/request
// @desc    Send friend request by friend code
// @access  Private
router.post('/friends/request', protect, async (req, res) => {
    try {
        const sourceUser = await User.findById(req.user.id);
        if (!sourceUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await ensureFriendCode(sourceUser);

        const friendCode = sanitizeFriendCode(req.body.friendCode);
        if (friendCode.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Friend code is invalid'
            });
        }

        const targetUser = await User.findOne({ friendCode });
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'No manager found with that friend code'
            });
        }

        if (toId(sourceUser._id) === toId(targetUser._id)) {
            return res.status(400).json({
                success: false,
                message: 'You cannot add yourself as a friend'
            });
        }

        if (hasUserInRelation(sourceUser.friends, targetUser._id)) {
            return res.status(409).json({
                success: false,
                message: 'This manager is already your friend'
            });
        }

        if (hasUserInRelation(sourceUser.outgoingFriendRequests, targetUser._id)) {
            return res.status(409).json({
                success: false,
                message: 'Friend request already sent'
            });
        }

        if (hasUserInRelation(sourceUser.incomingFriendRequests, targetUser._id)) {
            return res.status(409).json({
                success: false,
                message: 'You already have a pending request from this manager'
            });
        }

        sourceUser.outgoingFriendRequests.push({
            user: targetUser._id,
            createdAt: new Date()
        });

        targetUser.incomingFriendRequests.push({
            user: sourceUser._id,
            createdAt: new Date()
        });

        await Promise.all([sourceUser.save(), targetUser.save()]);

        res.json({
            success: true,
            message: 'Friend request sent successfully'
        });
    } catch (error) {
        console.error('Send friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending friend request'
        });
    }
});

// @route   POST /api/social/friends/request/:fromUserId/accept
// @desc    Accept friend request
// @access  Private
router.post('/friends/request/:fromUserId/accept', protect, async (req, res) => {
    try {
        const { fromUserId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(fromUserId)) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }

        const currentUser = await User.findById(req.user.id);
        const fromUser = await User.findById(fromUserId);

        if (!currentUser || !fromUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const hasIncomingRequest = hasUserInRelation(currentUser.incomingFriendRequests, fromUser._id);
        if (!hasIncomingRequest) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }

        currentUser.incomingFriendRequests = removeUserFromRelation(currentUser.incomingFriendRequests, fromUser._id);
        fromUser.outgoingFriendRequests = removeUserFromRelation(fromUser.outgoingFriendRequests, currentUser._id);

        if (!hasUserInRelation(currentUser.friends, fromUser._id)) {
            currentUser.friends.push({ user: fromUser._id, since: new Date() });
        }
        if (!hasUserInRelation(fromUser.friends, currentUser._id)) {
            fromUser.friends.push({ user: currentUser._id, since: new Date() });
        }

        await Promise.all([currentUser.save(), fromUser.save()]);

        res.json({
            success: true,
            message: 'Friend request accepted'
        });
    } catch (error) {
        console.error('Accept friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while accepting request'
        });
    }
});

// @route   POST /api/social/friends/request/:fromUserId/reject
// @desc    Reject friend request
// @access  Private
router.post('/friends/request/:fromUserId/reject', protect, async (req, res) => {
    try {
        const { fromUserId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(fromUserId)) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }

        const currentUser = await User.findById(req.user.id);
        const fromUser = await User.findById(fromUserId);

        if (!currentUser || !fromUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const hasIncomingRequest = hasUserInRelation(currentUser.incomingFriendRequests, fromUser._id);
        if (!hasIncomingRequest) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found'
            });
        }

        currentUser.incomingFriendRequests = removeUserFromRelation(currentUser.incomingFriendRequests, fromUser._id);
        fromUser.outgoingFriendRequests = removeUserFromRelation(fromUser.outgoingFriendRequests, currentUser._id);

        await Promise.all([currentUser.save(), fromUser.save()]);

        res.json({
            success: true,
            message: 'Friend request rejected'
        });
    } catch (error) {
        console.error('Reject friend request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting request'
        });
    }
});

// @route   DELETE /api/social/friends/:friendUserId
// @desc    Remove friend relationship
// @access  Private
router.delete('/friends/:friendUserId', protect, async (req, res) => {
    try {
        const { friendUserId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(friendUserId)) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }

        const currentUser = await User.findById(req.user.id);
        const friendUser = await User.findById(friendUserId);

        if (!currentUser || !friendUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const wereFriends = hasUserInRelation(currentUser.friends, friendUser._id);

        currentUser.friends = removeUserFromRelation(currentUser.friends, friendUser._id);
        friendUser.friends = removeUserFromRelation(friendUser.friends, currentUser._id);

        currentUser.incomingFriendRequests = removeUserFromRelation(currentUser.incomingFriendRequests, friendUser._id);
        currentUser.outgoingFriendRequests = removeUserFromRelation(currentUser.outgoingFriendRequests, friendUser._id);
        friendUser.incomingFriendRequests = removeUserFromRelation(friendUser.incomingFriendRequests, currentUser._id);
        friendUser.outgoingFriendRequests = removeUserFromRelation(friendUser.outgoingFriendRequests, currentUser._id);

        await Promise.all([currentUser.save(), friendUser.save()]);

        res.json({
            success: true,
            message: wereFriends ? 'Friend removed successfully' : 'No active friendship found'
        });
    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing friend'
        });
    }
});

// ===========================================
// QUICK FRIENDLY RACES
// ===========================================

// @route   GET /api/social/quick-races/active/me
// @desc    Get active quick-race room for current user (if any)
// @access  Private
router.get('/quick-races/active/me', protect, async (req, res) => {
    try {
        const room = await QuickRaceRoom.findOne({
            status: { $in: ['waiting', 'countdown', 'racing'] },
            'participants.user': req.user.id
        })
            .sort({ updatedAt: -1 })
            .populate('host', FRIEND_SUMMARY_FIELDS)
            .populate('invitations.user', FRIEND_SUMMARY_FIELDS);

        if (!room) {
            return res.json({ success: true, room: null });
        }

        const updated = transitionCountdownToRaceIfNeeded(room);
        if (updated) await room.save();

        res.json({
            success: true,
            room: serializeQuickRaceRoom(room, req.user.id)
        });
    } catch (error) {
        console.error('Get active quick-race room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while loading active room'
        });
    }
});

// @route   GET /api/social/quick-races/history/me
// @desc    Get quick-race history/rooms for current user
// @access  Private
router.get('/quick-races/history/me', protect, async (req, res) => {
    try {
        const rooms = await QuickRaceRoom.find({
            $or: [
                { host: req.user.id },
                { 'participants.user': req.user.id }
            ]
        })
            .sort({ updatedAt: -1 })
            .limit(40)
            .populate('host', FRIEND_SUMMARY_FIELDS);

        res.json({
            success: true,
            rooms: rooms.map((room) => serializeQuickRaceHistoryRoom(room, req.user.id))
        });
    } catch (error) {
        console.error('Get quick-race history error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while loading quick-race history'
        });
    }
});

// @route   POST /api/social/quick-races/create
// @desc    Create a quick friendly race room
// @access  Private
router.post('/quick-races/create', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('username displayName teamName');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const trackId = normalizeTrackId(req.body.trackId);
        const laps = normalizeLaps(req.body.laps);
        const roomCode = await createUniqueRoomCode();

        const room = await QuickRaceRoom.create({
            roomCode,
            host: user._id,
            trackId,
            laps,
            status: 'waiting',
            participants: [{
                user: user._id,
                displayName: user.displayName || user.username || 'Manager',
                teamName: user.teamName || 'Sin equipo',
                tyreCompound: 'medium',
                ready: false,
                joinedAt: new Date()
            }],
            invitations: [],
            chat: []
        });

        await room.populate('host', FRIEND_SUMMARY_FIELDS);

        res.status(201).json({
            success: true,
            room: serializeQuickRaceRoom(room, req.user.id)
        });
    } catch (error) {
        console.error('Create quick-race room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating room'
        });
    }
});

// @route   POST /api/social/quick-races/join
// @desc    Join quick-race room using room code
// @access  Private
router.post('/quick-races/join', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.body.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({
                success: false,
                message: 'Room code must be a 5-digit code'
            });
        }

        const room = await loadRoomOr404(roomCode);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        const currentUserId = toId(req.user.id);
        const alreadyInRoom = isRoomParticipant(room, currentUserId);
        if (alreadyInRoom) {
            const updated = transitionCountdownToRaceIfNeeded(room);
            if (updated) await room.save();
            return res.json({
                success: true,
                room: serializeQuickRaceRoom(room, req.user.id)
            });
        }

        if (room.status !== 'waiting') {
            return res.status(409).json({
                success: false,
                message: 'This room is no longer accepting new players'
            });
        }

        const user = await User.findById(req.user.id).select('username displayName teamName');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        room.participants.push({
            user: user._id,
            displayName: user.displayName || user.username || 'Manager',
            teamName: user.teamName || 'Sin equipo',
            tyreCompound: 'medium',
            ready: false,
            joinedAt: new Date()
        });

        const invitation = (room.invitations || []).find(
            (entry) => toId(entry.user) === currentUserId && entry.status === 'pending'
        );
        if (invitation) {
            invitation.status = 'accepted';
            invitation.respondedAt = new Date();
        }

        await room.save();

        res.json({
            success: true,
            room: serializeQuickRaceRoom(room, req.user.id)
        });
    } catch (error) {
        console.error('Join quick-race room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while joining room'
        });
    }
});

// @route   GET /api/social/quick-races/:roomCode
// @desc    Get quick-race room state
// @access  Private
router.get('/quick-races/:roomCode', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        const room = await loadRoomOr404(roomCode);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const currentUserId = toId(req.user.id);
        const canAccess = isRoomParticipant(room, currentUserId) || hasPendingInvitation(room, currentUserId);

        if (!canAccess) {
            return res.status(403).json({
                success: false,
                message: 'You are not part of this room'
            });
        }

        const updated = transitionCountdownToRaceIfNeeded(room);
        if (updated) await room.save();

        res.json({
            success: true,
            room: serializeQuickRaceRoom(room, req.user.id)
        });
    } catch (error) {
        console.error('Get quick-race room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while loading room'
        });
    }
});

// @route   POST /api/social/quick-races/:roomCode/invite
// @desc    Invite a friend to room
// @access  Private
router.post('/quick-races/:roomCode/invite', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        const { friendId } = req.body;

        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        if (!mongoose.Types.ObjectId.isValid(friendId)) {
            return res.status(400).json({ success: false, message: 'Invalid friend id' });
        }

        const room = await loadRoomOr404(roomCode);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (toId(room.host) !== toId(req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'Only the host can send room invitations'
            });
        }

        if (room.status !== 'waiting') {
            return res.status(409).json({
                success: false,
                message: 'Invitations are disabled once countdown starts'
            });
        }

        const hostUser = await User.findById(req.user.id).select('friends');
        if (!hostUser) {
            return res.status(404).json({ success: false, message: 'Host user not found' });
        }

        if (!hasUserInRelation(hostUser.friends, friendId)) {
            return res.status(403).json({
                success: false,
                message: 'You can only invite managers from your friends list'
            });
        }

        const isAlreadyParticipant = isRoomParticipant(room, friendId);
        if (isAlreadyParticipant) {
            return res.status(409).json({
                success: false,
                message: 'This manager is already in the room'
            });
        }

        const existingInvitation = (room.invitations || []).find((invitation) => toId(invitation.user) === toId(friendId));
        if (existingInvitation && existingInvitation.status === 'pending') {
            return res.status(409).json({
                success: false,
                message: 'Invitation already sent'
            });
        }

        if (existingInvitation) {
            existingInvitation.status = 'pending';
            existingInvitation.from = req.user.id;
            existingInvitation.createdAt = new Date();
            existingInvitation.respondedAt = null;
        } else {
            room.invitations.push({
                user: friendId,
                from: req.user.id,
                status: 'pending',
                createdAt: new Date()
            });
        }

        await room.save();
        await room.populate('invitations.user', FRIEND_SUMMARY_FIELDS);

        res.json({
            success: true,
            message: 'Invitation sent',
            room: serializeQuickRaceRoom(room, req.user.id)
        });
    } catch (error) {
        console.error('Invite friend to room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending room invitation'
        });
    }
});

// @route   POST /api/social/quick-races/:roomCode/reject-invite
// @desc    Reject quick-race invitation
// @access  Private
router.post('/quick-races/:roomCode/reject-invite', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        const room = await loadRoomOr404(roomCode);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const invitation = (room.invitations || []).find(
            (entry) => toId(entry.user) === toId(req.user.id) && entry.status === 'pending'
        );

        if (!invitation) {
            return res.status(404).json({
                success: false,
                message: 'Invitation not found'
            });
        }

        invitation.status = 'rejected';
        invitation.respondedAt = new Date();
        await room.save();

        res.json({
            success: true,
            message: 'Invitation rejected'
        });
    } catch (error) {
        console.error('Reject quick-race invitation error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while rejecting invitation'
        });
    }
});

// @route   POST /api/social/quick-races/:roomCode/tyre
// @desc    Set tyre for current user in room
// @access  Private
router.post('/quick-races/:roomCode/tyre', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        const room = await loadRoomOr404(roomCode);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (room.status !== 'waiting') {
            return res.status(409).json({
                success: false,
                message: 'Tyre changes are locked once countdown starts'
            });
        }

        const participant = (room.participants || []).find(
            (entry) => toId(entry.user) === toId(req.user.id)
        );

        if (!participant) {
            return res.status(403).json({
                success: false,
                message: 'You are not participating in this room'
            });
        }

        participant.tyreCompound = normalizeTyreCompound(req.body.tyreCompound);
        await room.save();

        res.json({
            success: true,
            room: serializeQuickRaceRoom(room, req.user.id)
        });
    } catch (error) {
        console.error('Update tyre in quick-race room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating tyre'
        });
    }
});

// @route   POST /api/social/quick-races/:roomCode/ready
// @desc    Toggle ready state and auto-start countdown when all are ready
// @access  Private
router.post('/quick-races/:roomCode/ready', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        const room = await loadRoomOr404(roomCode);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (!['waiting', 'countdown'].includes(room.status)) {
            return res.status(409).json({
                success: false,
                message: 'Room is no longer in ready state'
            });
        }

        const participant = (room.participants || []).find(
            (entry) => toId(entry.user) === toId(req.user.id)
        );

        if (!participant) {
            return res.status(403).json({
                success: false,
                message: 'You are not participating in this room'
            });
        }

        if (room.status === 'countdown') {
            const updated = transitionCountdownToRaceIfNeeded(room);
            if (updated) await room.save();
            return res.json({
                success: true,
                room: serializeQuickRaceRoom(room, req.user.id),
                message: 'Countdown already started and cannot be cancelled'
            });
        }

        const ready = req.body.ready !== false;
        participant.ready = ready;

        const hasEnoughParticipants = (room.participants || []).length >= 2;
        const allReady = hasEnoughParticipants && (room.participants || []).every((entry) => entry.ready === true);

        if (allReady) {
            room.status = 'countdown';
            room.countdownStartAt = new Date();
        }

        await room.save();

        res.json({
            success: true,
            room: serializeQuickRaceRoom(room, req.user.id),
            message: hasEnoughParticipants
                ? (allReady ? 'Countdown started' : 'Ready status updated')
                : 'Need at least 2 managers to start countdown'
        });
    } catch (error) {
        console.error('Update ready state in quick-race room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating ready status'
        });
    }
});

// @route   GET /api/social/quick-races/:roomCode/live-state
// @desc    Get live synchronized race states for participants
// @access  Private
router.get('/quick-races/:roomCode/live-state', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        pruneStaleQuickRaceLiveStateEntries();

        let status = getCachedQuickRaceLiveStatus(roomCode);
        if (!hasFreshQuickRaceLiveMembership(roomCode, req.user.id) || !status) {
            const room = await QuickRaceRoom.findOne({ roomCode }).select('roomCode status participants');
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found' });
            }

            if (!canAccessQuickRaceLiveState(room, req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not participating in this room'
                });
            }

            cacheQuickRaceLiveMembership(roomCode, room);
            status = room.status;
        }

        if (['finished', 'cancelled'].includes(status)) {
            clearQuickRaceLiveState(roomCode);
        }

        res.json({
            success: true,
            status,
            serverTime: new Date().toISOString(),
            states: serializeQuickRaceLiveStates(roomCode)
        });
    } catch (error) {
        console.error('Get quick-race live state error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while loading live race state'
        });
    }
});

// @route   POST /api/social/quick-races/:roomCode/live-state
// @desc    Upsert current participant live race state and return synchronized states
// @access  Private
router.post('/quick-races/:roomCode/live-state', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        pruneStaleQuickRaceLiveStateEntries();

        let status = getCachedQuickRaceLiveStatus(roomCode);
        if (!hasFreshQuickRaceLiveMembership(roomCode, req.user.id) || !status) {
            const room = await QuickRaceRoom.findOne({ roomCode }).select('roomCode status participants');
            if (!room) {
                return res.status(404).json({ success: false, message: 'Room not found' });
            }

            if (!canAccessQuickRaceLiveState(room, req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not participating in this room'
                });
            }

            cacheQuickRaceLiveMembership(roomCode, room);
            status = room.status;
        }

        if (['finished', 'cancelled'].includes(status)) {
            clearQuickRaceLiveState(roomCode);
            return res.json({
                success: true,
                status,
                serverTime: new Date().toISOString(),
                states: []
            });
        }

        if (req.body && typeof req.body.carState === 'object' && req.body.carState) {
            upsertQuickRaceParticipantLiveState(roomCode, req.user.id, req.body.carState);
        }

        res.json({
            success: true,
            status,
            serverTime: new Date().toISOString(),
            states: serializeQuickRaceLiveStates(roomCode)
        });
    } catch (error) {
        console.error('Update quick-race live state error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while synchronizing live race state'
        });
    }
});

// @route   POST /api/social/quick-races/:roomCode/complete
// @desc    Mark quick-race room as finished
// @access  Private
router.post('/quick-races/:roomCode/complete', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        const room = await QuickRaceRoom.findOne({ roomCode });
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const currentUserId = toId(req.user.id);
        const isHost = toId(room.host) === currentUserId;
        const isParticipant = isRoomParticipant(room, currentUserId);

        if (!isHost && !isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not participating in this room'
            });
        }

        if (!['finished', 'cancelled'].includes(room.status)) {
            room.status = 'finished';
            room.countdownStartAt = null;
            if (!room.raceStartedAt) {
                room.raceStartedAt = new Date();
            }
            room.raceFinishedAt = new Date();
            (room.participants || []).forEach((participant) => {
                participant.ready = false;
            });
            await room.save();
            
            // Recompensas de carrera amistosa
            const { results } = req.body;
            if (Array.isArray(results) && results.length > 0) {
                const User = require('../models/User');
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    if (!result.userId) continue;
                    try {
                        const participatorUser = await User.findById(result.userId);
                        if (!participatorUser) continue;
                        
                        const position = i + 1;
                        const participantsCount = results.length;
                        
                        // XP
                        const xpEarned = getXpForRacePosition(position, participantsCount);
                        const xpUpdate = addXpToOnlineData(participatorUser.gameData.online || {}, xpEarned);
                        participatorUser.gameData.online = xpUpdate.online;
                        participatorUser.gameData.online.totalRaces = (participatorUser.gameData.online.totalRaces || 0) + 1;
                        if (position === 1) participatorUser.gameData.online.onlineWins = (participatorUser.gameData.online.onlineWins || 0) + 1;
                        if (position <= 3) participatorUser.gameData.online.onlinePodiums = (participatorUser.gameData.online.onlinePodiums || 0) + 1;
                        
                        // Monedas (amistosos dan pocas)
                        const coinsEarned = position === 1 ? 50 : (position <= 3 ? 25 : 10);
                        participatorUser.gameData.online.coins = (participatorUser.gameData.online.coins || 0) + coinsEarned;
                        
                        // Presupuesto
                        const moneyEarned = position * 10000;
                        participatorUser.gameData.budget = (participatorUser.gameData.budget || 0) + moneyEarned;
                        
                        participatorUser.markModified('gameData');
                        await participatorUser.save();
                    } catch (e) {
                        console.error('Error awarding friendly race xp:', e);
                    }
                }
            }
        }

        clearQuickRaceLiveState(roomCode);

        await room.populate('host', FRIEND_SUMMARY_FIELDS);
        await room.populate('invitations.user', FRIEND_SUMMARY_FIELDS);

        res.json({
            success: true,
            message: 'Room marked as finished',
            room: serializeQuickRaceRoom(room, req.user.id)
        });
    } catch (error) {
        console.error('Complete quick-race room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while completing room'
        });
    }
});

// @route   POST /api/social/quick-races/:roomCode/leave
// @desc    Leave room and update room state accordingly
// @access  Private
router.post('/quick-races/:roomCode/leave', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        const room = await loadRoomOr404(roomCode);
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const currentUserId = toId(req.user.id);
        const wasParticipant = isRoomParticipant(room, currentUserId);

        if (!wasParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not participating in this room'
            });
        }

        room.participants = (room.participants || []).filter(
            (participant) => toId(participant.user) !== currentUserId
        );

        room.invitations = (room.invitations || []).filter(
            (invitation) => toId(invitation.user) !== currentUserId
        );

        removeQuickRaceParticipantLiveState(roomCode, currentUserId);

        if (toId(room.host) === currentUserId && room.participants.length > 0) {
            room.host = room.participants[0].user;
        }

        if (room.status === 'countdown') {
            const hasEnoughParticipants = room.participants.length >= 2;
            const allReady = hasEnoughParticipants && room.participants.every((participant) => participant.ready === true);

            if (!allReady) {
                room.status = 'waiting';
                room.countdownStartAt = null;
                room.participants.forEach((participant) => {
                    participant.ready = false;
                });
            }
        }

        if (room.status === 'racing' && room.participants.length <= 1) {
            room.status = 'finished';
            room.raceFinishedAt = new Date();
        }

        if (room.participants.length === 0 && room.status !== 'finished') {
            room.status = 'cancelled';
            room.countdownStartAt = null;
        }

        if (room.status !== 'countdown') {
            room.countdownStartAt = null;
        }

        await room.save();

        if (room.status === 'cancelled' && room.participants.length === 0) {
            await QuickRaceRoom.deleteOne({ _id: room._id });
            clearQuickRaceLiveState(roomCode);
            return res.json({
                success: true,
                message: 'Room closed',
                room: null
            });
        }

        await room.populate('host', FRIEND_SUMMARY_FIELDS);
        await room.populate('invitations.user', FRIEND_SUMMARY_FIELDS);

        res.json({
            success: true,
            room: serializeQuickRaceRoom(room, req.user.id)
        });
    } catch (error) {
        console.error('Leave quick-race room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while leaving room'
        });
    }
});

// @route   DELETE /api/social/quick-races/:roomCode
// @desc    Delete quick-race room (host can delete active rooms, anyone can delete finished/cancelled)
// @access  Private
router.delete('/quick-races/:roomCode', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        const room = await QuickRaceRoom.findOne({ roomCode });
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        const currentUserId = toId(req.user.id);
        const isHost = toId(room.host) === currentUserId;
        const isParticipant = isRoomParticipant(room, currentUserId);
        const isActive = QUICK_RACE_ACTIVE_STATUSES.includes(room.status);

        if (!isHost && !isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not allowed to delete this room'
            });
        }

        if (isActive && !isHost) {
            return res.status(403).json({
                success: false,
                message: 'Only the host can delete an active room'
            });
        }

        await QuickRaceRoom.deleteOne({ _id: room._id });
        clearQuickRaceLiveState(roomCode);

        res.json({
            success: true,
            message: 'Room deleted successfully'
        });
    } catch (error) {
        console.error('Delete quick-race room error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting room'
        });
    }
});

// @route   GET /api/social/quick-races/:roomCode/chat
// @desc    Get room chat messages
// @access  Private
router.get('/quick-races/:roomCode/chat', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        const room = await QuickRaceRoom.findOne({ roomCode });
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (!isRoomParticipant(room, req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not participating in this room'
            });
        }

        const updated = transitionCountdownToRaceIfNeeded(room);
        if (updated) await room.save();

        const messages = (room.chat || []).slice(-80).map(serializeRaceMessage);

        res.json({
            success: true,
            messages,
            status: room.status
        });
    } catch (error) {
        console.error('Get quick-race chat error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while loading chat'
        });
    }
});

// @route   POST /api/social/quick-races/:roomCode/chat
// @desc    Send room chat message
// @access  Private
router.post('/quick-races/:roomCode/chat', protect, async (req, res) => {
    try {
        const roomCode = sanitizeRoomCode(req.params.roomCode);
        if (!/^\d{5}$/.test(roomCode)) {
            return res.status(400).json({ success: false, message: 'Invalid room code' });
        }

        const room = await QuickRaceRoom.findOne({ roomCode });
        if (!room) {
            return res.status(404).json({ success: false, message: 'Room not found' });
        }

        if (!isRoomParticipant(room, req.user.id)) {
            return res.status(403).json({
                success: false,
                message: 'You are not participating in this room'
            });
        }

        const message = String(req.body.message || '').trim();
        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot be empty'
            });
        }

        if (message.length > 300) {
            return res.status(400).json({
                success: false,
                message: 'Message cannot exceed 300 characters'
            });
        }

        const username = req.user.displayName || req.user.username || 'Manager';
        room.chat.push({
            user: req.user.id,
            username,
            message,
            timestamp: new Date()
        });

        if (room.chat.length > 200) {
            room.chat = room.chat.slice(-200);
        }

        const updated = transitionCountdownToRaceIfNeeded(room);
        if (updated) {
            room.markModified('chat');
        }

        await room.save();

        const latest = room.chat[room.chat.length - 1];

        res.status(201).json({
            success: true,
            message: serializeRaceMessage(latest)
        });
    } catch (error) {
        console.error('Send quick-race chat message error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending message'
        });
    }
});

module.exports = router;
