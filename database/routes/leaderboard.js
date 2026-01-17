// ===========================================
// LEADERBOARD ROUTES
// ===========================================
const express = require('express');
const router = express.Router();
const User = require('../models/User');

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

module.exports = router;
