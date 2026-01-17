const express = require('express');
const router = express.Router();
const { protect: auth } = require('../middleware/auth');
const User = require('../models/User');
const League = require('../models/League');

// ===========================================
// XP SYSTEM CONFIGURATION
// ===========================================
const XP_CONFIG = {
    // XP needed per level (exponential growth)
    getXpForLevel: (level) => Math.floor(100 * Math.pow(1.5, level - 1)),
    
    // XP rewards
    rewards: {
        raceWin: 100,
        racePodium: 50,
        raceFinish: 20,
        leagueWin: 500,
        seasonPodium: 250
    },
    
    maxLevel: 50
};

// ===========================================
// COIN SHOP CONFIGURATION
// ===========================================
const SHOP_CONFIG = {
    // Coin packages (real money)
    coinPackages: [
        { id: 'coins_5', coins: 5, price: 1.99, currency: 'EUR' },
        { id: 'coins_12', coins: 12, price: 4.99, currency: 'EUR' },
        { id: 'coins_18', coins: 18, price: 7.99, currency: 'EUR' },
        { id: 'coins_30', coins: 30, price: 12.99, currency: 'EUR' },
        { id: 'coins_50', coins: 50, price: 19.99, currency: 'EUR' },
        { id: 'coins_80', coins: 80, price: 29.99, currency: 'EUR' }
    ],
    
    // In-game money packages (coins)
    moneyPackages: [
        { id: 'money_5m', money: 5000000, cost: 5, label: '5M' },
        { id: 'money_10m', money: 10000000, cost: 8, label: '10M' },
        { id: 'money_30m', money: 30000000, cost: 15, label: '30M' }
    ],
    
    // League creation cost
    leagueCreationCost: 5000000 // 5M
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Check if user can access online mode (min level 5 in all HQ categories)
// TODO: Restaurar validación cuando se implementen los requisitos
const canAccessOnline = (user) => {
    // Modo online desbloqueado temporalmente
    return true;
    
    /* DESCOMENTAR PARA REACTIVAR REQUISITOS:
    const hqLevels = user.gameData?.hqLevels || {
        facilities: 1,
        engineering: 1,
        marketing: 1,
        staff: 1
    };
    
    const minRequired = 5;
    return Object.values(hqLevels).every(level => level >= minRequired);
    */
};

// Calculate level from XP
const calculateLevel = (xp) => {
    let level = 1;
    let xpNeeded = XP_CONFIG.getXpForLevel(level);
    
    while (xp >= xpNeeded && level < XP_CONFIG.maxLevel) {
        xp -= xpNeeded;
        level++;
        xpNeeded = XP_CONFIG.getXpForLevel(level);
    }
    
    return {
        level,
        currentXp: xp,
        xpForNextLevel: xpNeeded,
        progress: Math.min((xp / xpNeeded) * 100, 100)
    };
};

// ===========================================
// ROUTES
// ===========================================

// GET /api/online/status - Check online mode access
router.get('/status', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const hasAccess = canAccessOnline(user);
        const hqLevels = user.gameData?.hqLevels || {
            facilities: 1,
            engineering: 1,
            marketing: 1,
            staff: 1
        };
        
        res.json({
            success: true,
            hasAccess,
            hqLevels,
            requiredLevel: 5,
            online: user.gameData.online || {}
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/online/profile - Get online profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (!canAccessOnline(user)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Online mode not unlocked. Reach level 5 in all HQ categories.' 
            });
        }
        
        const online = user.gameData.online || {};
        const levelData = calculateLevel(online.xp || 0);
        
        res.json({
            success: true,
            profile: {
                username: user.username,
                displayName: user.displayName || user.username,
                teamName: user.teamName,
                avatar: user.avatar,
                country: user.country,
                coins: online.coins || 0,
                level: levelData.level,
                xp: online.xp || 0,
                xpProgress: levelData,
                stats: {
                    totalRaces: online.totalRaces || 0,
                    wins: online.onlineWins || 0,
                    podiums: online.onlinePodiums || 0
                },
                leagues: user.gameData.onlineLeagues || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/online/shop - Get shop items
router.get('/shop', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            shop: {
                coinPackages: SHOP_CONFIG.coinPackages,
                moneyPackages: SHOP_CONFIG.moneyPackages
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/shop/buy-money - Buy in-game money with coins
router.post('/shop/buy-money', auth, async (req, res) => {
    try {
        const { packageId } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const package_ = SHOP_CONFIG.moneyPackages.find(p => p.id === packageId);
        if (!package_) {
            return res.status(400).json({ success: false, message: 'Invalid package' });
        }
        
        const userCoins = user.gameData.online?.coins || 0;
        if (userCoins < package_.cost) {
            return res.status(400).json({ 
                success: false, 
                message: 'Not enough coins',
                required: package_.cost,
                current: userCoins
            });
        }
        
        // Deduct coins and add money
        user.gameData.online.coins -= package_.cost;
        user.gameData.budget += package_.money;
        await user.save();
        
        res.json({
            success: true,
            message: `Purchased ${package_.label} for ${package_.cost} coins`,
            newBalance: {
                coins: user.gameData.online.coins,
                budget: user.gameData.budget
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/xp/add - Add XP (for race results)
router.post('/xp/add', auth, async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const oldLevel = calculateLevel(user.gameData.online?.xp || 0).level;
        
        user.gameData.online = user.gameData.online || {};
        user.gameData.online.xp = (user.gameData.online.xp || 0) + amount;
        
        const newLevelData = calculateLevel(user.gameData.online.xp);
        user.gameData.online.level = newLevelData.level;
        
        await user.save();
        
        const leveledUp = newLevelData.level > oldLevel;
        
        res.json({
            success: true,
            xpAdded: amount,
            reason,
            leveledUp,
            newLevel: newLevelData.level,
            xpProgress: newLevelData
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ===========================================
// LEAGUE ROUTES
// ===========================================

// GET /api/online/leagues - Search/list leagues
router.get('/leagues', auth, async (req, res) => {
    try {
        const { search, country, page = 1, limit = 20 } = req.query;
        
        const leagues = await League.searchLeagues(search, {
            country,
            page: parseInt(page),
            limit: parseInt(limit)
        });
        
        res.json({
            success: true,
            leagues: leagues.map(l => l.getPublicInfo()),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: leagues.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/online/leagues/:id - Get league details
router.get('/leagues/:id', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id)
            .populate('members.user', 'username displayName teamName avatar country')
            .populate('creator', 'username displayName teamName avatar');
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        // Check if user is member for full info
        const isMember = league.members.some(m => m.user._id.toString() === req.user.id);
        
        res.json({
            success: true,
            league: isMember ? league : league.getPublicInfo(),
            isMember,
            inviteCode: isMember && league.settings.isPrivate ? league.settings.inviteCode : null
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues - Create a new league
router.post('/leagues', auth, async (req, res) => {
    try {
        const { name, description, logo, country, schedule, settings } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (!canAccessOnline(user)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Online mode not unlocked' 
            });
        }
        
        // Check budget
        if (user.gameData.budget < SHOP_CONFIG.leagueCreationCost) {
            return res.status(400).json({
                success: false,
                message: 'Not enough budget to create a league',
                required: SHOP_CONFIG.leagueCreationCost,
                current: user.gameData.budget
            });
        }
        
        // Deduct creation cost
        user.gameData.budget -= SHOP_CONFIG.leagueCreationCost;
        
        // Create league
        const league = new League({
            name,
            description,
            logo,
            country: country || user.country,
            schedule: schedule || {},
            settings: settings || {},
            creator: user._id,
            members: [{
                user: user._id,
                role: 'owner',
                joinedAt: new Date()
            }]
        });
        
        // Initialize standings
        league.currentSeason.standings = [{
            user: user._id,
            points: 0,
            wins: 0,
            podiums: 0,
            position: 1
        }];
        
        await league.save();
        
        // Add league to user's list
        user.gameData.onlineLeagues = user.gameData.onlineLeagues || [];
        user.gameData.onlineLeagues.push(league._id);
        await user.save();
        
        res.status(201).json({
            success: true,
            message: 'League created successfully',
            league: league.getPublicInfo(),
            newBudget: user.gameData.budget
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues/:id/join - Join a league
router.post('/leagues/:id/join', auth, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const league = await League.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (!canAccessOnline(user)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Online mode not unlocked' 
            });
        }
        
        // Check level requirement
        const userLevel = calculateLevel(user.gameData.online?.xp || 0).level;
        if (userLevel < league.settings.minLevel) {
            return res.status(403).json({
                success: false,
                message: `Minimum level ${league.settings.minLevel} required`,
                currentLevel: userLevel
            });
        }
        
        // Check if private and invite code
        if (league.settings.isPrivate) {
            if (!inviteCode || inviteCode !== league.settings.inviteCode) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid invite code'
                });
            }
        }
        
        // Add member
        await league.addMember(user._id);
        
        // Add league to user's list
        user.gameData.onlineLeagues = user.gameData.onlineLeagues || [];
        if (!user.gameData.onlineLeagues.includes(league._id)) {
            user.gameData.onlineLeagues.push(league._id);
            await user.save();
        }
        
        res.json({
            success: true,
            message: 'Joined league successfully',
            league: league.getPublicInfo()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /api/online/leagues/:id/leave - Leave a league
router.post('/leagues/:id/leave', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id);
        const user = await User.findById(req.user.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        await league.removeMember(user._id);
        
        // Remove from user's list
        user.gameData.onlineLeagues = user.gameData.onlineLeagues.filter(
            id => id.toString() !== league._id.toString()
        );
        await user.save();
        
        res.json({
            success: true,
            message: 'Left league successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /api/online/leagues/:id - Update league (owner/admin only)
router.put('/leagues/:id', auth, async (req, res) => {
    try {
        const league = await League.findById(req.params.id);
        
        if (!league) {
            return res.status(404).json({ success: false, message: 'League not found' });
        }
        
        // Check permissions
        const member = league.members.find(m => m.user.toString() === req.user.id);
        if (!member || !['owner', 'admin'].includes(member.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to edit this league' 
            });
        }
        
        const { name, description, logo, schedule, settings } = req.body;
        
        if (name) league.name = name;
        if (description !== undefined) league.description = description;
        if (logo !== undefined) league.logo = logo;
        if (schedule) league.schedule = { ...league.schedule, ...schedule };
        if (settings) {
            // Only owner can change certain settings
            if (member.role === 'owner') {
                league.settings = { ...league.settings, ...settings };
            }
        }
        
        await league.save();
        
        res.json({
            success: true,
            message: 'League updated successfully',
            league: league.getPublicInfo()
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/online/my-leagues - Get user's leagues
router.get('/my-leagues', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        const leagues = await League.find({
            _id: { $in: user.gameData.onlineLeagues || [] }
        }).populate('creator', 'username displayName teamName avatar');
        
        res.json({
            success: true,
            leagues: leagues.map(l => ({
                ...l.getPublicInfo(),
                myRole: l.members.find(m => m.user.toString() === req.user.id)?.role
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
