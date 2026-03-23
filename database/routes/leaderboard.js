// ===========================================
// LEADERBOARD ROUTES
// ===========================================
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Rank tier configuration
const RANK_CONFIG = {
    learner: {
        name: 'Learner',
        icon: 'stroll',
        color: '#8B4513',
        description: 'Principiante - Icono de Lance Stroll'
    },
    amateur: {
        name: 'Amateur',
        icon: 'a',
        color: '#C0C0C0',
        description: 'Top 10 reparten 5M',
        rewards: { total: 5000000, topCount: 10 }
    },
    professional: {
        name: 'Professional',
        icon: 'p',
        color: '#FFD700',
        description: 'Top 10 reparten 7M',
        rewards: { total: 7000000, topCount: 10 }
    },
    king: {
        name: 'King',
        icon: 'goat',
        color: '#9B59B6',
        description: 'Top 5: 7M cada uno | Top 6-10 reparten 5M',
        rewards: { top5: 7000000, top10Total: 5000000 }
    },
    senna: {
        name: 'Senna',
        icon: 'senna',
        color: '#E74C3C',
        description: 'Top 3: Icono Senna + 15M | Resto: Icono S',
        rewards: { top3: 15000000 }
    }
};

// Season duration in days
const SEASON_DURATION_DAYS = 30;

// @route   GET /api/leaderboard
// @desc    Get global leaderboard
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { type = 'points', limit = 100 } = req.query;
        const leaderboard = await User.getLeaderboard(type, parseInt(limit));
        
        res.json({
            success: true,
            type,
            count: leaderboard.length,
            leaderboard
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard'
        });
    }
});

// @route   GET /api/leaderboard/online
// @desc    Get online mode leaderboard
// @access  Public
router.get('/online', async (req, res) => {
    try {
        const { limit = 100 } = req.query;
        const leaderboard = await User.getLeaderboard('online', parseInt(limit));
        
        res.json({
            success: true,
            type: 'online',
            count: leaderboard.length,
            leaderboard
        });
    } catch (error) {
        console.error('Online leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching online leaderboard'
        });
    }
});

// @route   GET /api/leaderboard/global
// @desc    Get international ranking with all tiers
// @access  Public
router.get('/global', async (req, res) => {
    try {
        // Get all users sorted by global wins
        const allUsers = await User.find({ isActive: true })
            .sort({ 'gameData.globalRanking.totalWins': -1 })
            .select('username displayName teamName avatar country gameData.online.level gameData.globalRanking');
        
        // Calculate current season info
        const now = new Date();
        const seasonStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const seasonEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysRemaining = Math.ceil((seasonEnd - now) / (1000 * 60 * 60 * 24));
        
        // Group by rank tiers
        const tiers = {
            senna: [],
            king: [],
            professional: [],
            amateur: [],
            learner: []
        };
        
        allUsers.forEach((user, globalIndex) => {
            const rank = user.gameData.globalRanking?.rank || 'learner';
            const userData = {
                globalPosition: globalIndex + 1,
                id: user._id,
                displayName: user.displayName || user.username,
                teamName: user.teamName,
                avatar: user.avatar,
                country: user.country,
                level: user.gameData.online?.level || 1,
                totalWins: user.gameData.globalRanking?.totalWins || 0,
                activeBadge: user.gameData.globalRanking?.activeBadge,
                currentSeason: user.gameData.globalRanking?.currentSeason || { wins: 0, races: 0 }
            };
            
            tiers[rank].push(userData);
        });
        
        // Add position within tier
        Object.keys(tiers).forEach(tier => {
            tiers[tier].forEach((user, index) => {
                user.tierPosition = index + 1;
            });
        });
        
        res.json({
            success: true,
            season: {
                current: Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24 * 30)) + 1,
                startDate: seasonStart,
                endDate: seasonEnd,
                daysRemaining,
                durationDays: SEASON_DURATION_DAYS
            },
            rankConfig: RANK_CONFIG,
            tiers,
            totalPlayers: allUsers.length
        });
    } catch (error) {
        console.error('Global ranking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching global ranking'
        });
    }
});

// @route   GET /api/leaderboard/global/my-rank
// @desc    Get current user's global ranking info
// @access  Private
router.get('/global/my-rank', async (req, res) => {
    try {
        // Get user from token (assuming auth middleware sets req.user)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const user = await User.findById(decoded.id)
            .select('username displayName teamName avatar country gameData.online.level gameData.globalRanking');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Get global position
        const usersAbove = await User.countDocuments({
            isActive: true,
            'gameData.globalRanking.totalWins': { $gt: user.gameData.globalRanking?.totalWins || 0 }
        });
        
        // Get position within tier
        const rank = user.gameData.globalRanking?.rank || 'learner';
        const tierUsersAbove = await User.countDocuments({
            isActive: true,
            'gameData.globalRanking.rank': rank,
            'gameData.globalRanking.totalWins': { $gt: user.gameData.globalRanking?.totalWins || 0 }
        });
        
        // Get total in tier
        const totalInTier = await User.countDocuments({
            isActive: true,
            'gameData.globalRanking.rank': rank
        });
        
        res.json({
            success: true,
            user: {
                id: user._id,
                displayName: user.displayName || user.username,
                teamName: user.teamName,
                avatar: user.avatar,
                country: user.country,
                level: user.gameData.online?.level || 1
            },
            ranking: {
                rank,
                rankInfo: RANK_CONFIG[rank],
                globalPosition: usersAbove + 1,
                tierPosition: tierUsersAbove + 1,
                totalInTier,
                totalWins: user.gameData.globalRanking?.totalWins || 0,
                activeBadge: user.gameData.globalRanking?.activeBadge,
                currentSeason: user.gameData.globalRanking?.currentSeason || { wins: 0, races: 0 },
                rewardsHistory: user.gameData.globalRanking?.rewardsHistory || [],
                badges: user.gameData.globalRanking?.badges || [],
                willPromote: tierUsersAbove + 1 <= 10,
                willRelegate: tierUsersAbove + 1 > totalInTier - 3 && rank !== 'learner'
            }
        });
    } catch (error) {
        console.error('My rank error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your ranking'
        });
    }
});

// @route   POST /api/leaderboard/global/record-win
// @desc    Record a win for global ranking (called after online match)
// @access  Private
router.post('/global/record-win', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Initialize globalRanking if not exists
        if (!user.gameData.globalRanking) {
            user.gameData.globalRanking = {
                rank: 'learner',
                totalWins: 0,
                position: 0,
                currentSeason: { wins: 0, races: 0 },
                badges: [],
                rewardsHistory: []
            };
        }
        
        // Increment wins
        user.gameData.globalRanking.totalWins += 1;
        user.gameData.globalRanking.currentSeason.wins += 1;
        user.gameData.globalRanking.currentSeason.races += 1;
        
        await user.save();
        
        res.json({
            success: true,
            message: 'Win recorded',
            newTotalWins: user.gameData.globalRanking.totalWins
        });
    } catch (error) {
        console.error('Record win error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording win'
        });
    }
});

// @route   POST /api/leaderboard/global/process-season-end
// @desc    Process end of season rewards and promotions (Admin only)
// @access  Private/Admin
router.post('/global/process-season-end', async (req, res) => {
    try {
        // TODO: Add admin authentication check
        
        const allUsers = await User.find({ 
            isActive: true,
            'gameData.globalRanking': { $exists: true }
        }).sort({ 'gameData.globalRanking.totalWins': -1 });
        
        const rankTiers = ['senna', 'king', 'professional', 'amateur', 'learner'];
        const tierUsers = {};
        
        // Group users by tier
        rankTiers.forEach(tier => {
            tierUsers[tier] = allUsers.filter(u => u.gameData.globalRanking.rank === tier);
        });
        
        const seasonNumber = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24 * 30)) + 1;
        
        // Process each tier
        for (const tier of rankTiers) {
            const users = tierUsers[tier];
            
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const position = i + 1;
                
                // Calculate rewards
                const reward = User.calculateSeasonRewards(tier, position);
                
                // Add rewards history
                user.gameData.globalRanking.rewardsHistory.push({
                    season: seasonNumber,
                    rank: tier,
                    position,
                    reward: reward.money,
                    icon: reward.icon,
                    date: new Date()
                });
                
                // Add badge
                if (reward.icon) {
                    user.gameData.globalRanking.badges.push({
                        type: reward.icon,
                        earnedAt: new Date(),
                        season: seasonNumber
                    });
                    user.gameData.globalRanking.activeBadge = reward.icon;
                }
                
                // Add money reward
                if (reward.money > 0) {
                    user.gameData.budget += reward.money;
                }
                
                // Handle promotion/relegation
                const totalInTier = users.length;
                const globalPosition = allUsers.findIndex(u => u._id.equals(user._id)) + 1;
                
                // Promotion: Top 10 of the server
                if (globalPosition <= 10 && tier !== 'senna') {
                    const tierIndex = rankTiers.indexOf(tier);
                    if (tierIndex > 0) {
                        user.gameData.globalRanking.rank = rankTiers[tierIndex - 1];
                    }
                }
                
                // Relegation: Bottom 3 of the server
                const totalPlayers = allUsers.length;
                if (globalPosition > totalPlayers - 3 && tier !== 'learner') {
                    const tierIndex = rankTiers.indexOf(tier);
                    if (tierIndex < rankTiers.length - 1) {
                        user.gameData.globalRanking.rank = rankTiers[tierIndex + 1];
                    }
                }
                
                // Reset season stats
                user.gameData.globalRanking.lastSeasonPosition = position;
                user.gameData.globalRanking.currentSeason = {
                    wins: 0,
                    races: 0,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000)
                };
                
                await user.save();
            }
        }
        
        res.json({
            success: true,
            message: 'Season processed successfully',
            processed: allUsers.length
        });
    } catch (error) {
        console.error('Process season error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing season'
        });
    }
});

module.exports = router;
