const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/user/profile
// @desc    Get user profile and game data
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                teamName: user.teamName,
                gameData: user.gameData,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/user/profile
// @desc    Update user profile and game data
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update game data
        const { gameData } = req.body;
        
        if (gameData) {
            if (gameData.budget !== undefined) user.gameData.budget = gameData.budget;
            if (gameData.drivers !== undefined) user.gameData.drivers = gameData.drivers;
            if (gameData.managers !== undefined) user.gameData.managers = gameData.managers;
            if (gameData.upgrades !== undefined) user.gameData.upgrades = gameData.upgrades;
            if (gameData.wins !== undefined) user.gameData.wins = gameData.wins;
            if (gameData.podiums !== undefined) user.gameData.podiums = gameData.podiums;
            if (gameData.points !== undefined) user.gameData.points = gameData.points;
            if (gameData.racesCompleted !== undefined) user.gameData.racesCompleted = gameData.racesCompleted;
            if (gameData.careerMode !== undefined) user.gameData.careerMode = gameData.careerMode;
            if (gameData.raceHistory !== undefined) user.gameData.raceHistory = gameData.raceHistory;
        }

        user.lastLogin = Date.now();
        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                teamName: user.teamName,
                gameData: user.gameData,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/user/gamedata
// @desc    Update user game data (alias for backward compatibility)
// @access  Private
router.put('/gamedata', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update game data
        const { budget, drivers, managers, upgrades, wins, podiums, points, racesCompleted, careerMode, raceHistory } = req.body;
        
        if (budget !== undefined) user.gameData.budget = budget;
        if (drivers !== undefined) user.gameData.drivers = drivers;
        if (managers !== undefined) user.gameData.managers = managers;
        if (upgrades !== undefined) user.gameData.upgrades = upgrades;
        if (wins !== undefined) user.gameData.wins = wins;
        if (podiums !== undefined) user.gameData.podiums = podiums;
        if (points !== undefined) user.gameData.points = points;
        if (racesCompleted !== undefined) user.gameData.racesCompleted = racesCompleted;
        if (careerMode !== undefined) user.gameData.careerMode = careerMode;
        if (raceHistory !== undefined) user.gameData.raceHistory = raceHistory;

        await user.save();

        res.json({
            success: true,
            message: 'Game data updated successfully',
            gameData: user.gameData
        });
    } catch (error) {
        console.error('Update game data error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/user/profile
// @desc    Delete user account
// @access  Private
router.delete('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(req.user.id);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
