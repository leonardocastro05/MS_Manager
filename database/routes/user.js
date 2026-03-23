// ===========================================
// USER ROUTES
// ===========================================
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// ===========================================
// @route   GET /api/user/profile
// @desc    Get user profile and game data
// @access  Private
// ===========================================
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ===========================================
// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
// ===========================================
router.put('/profile', protect, [
    body('teamName').optional().trim().isLength({ max: 50 }),
    body('displayName').optional().trim().isLength({ max: 50 }),
    body('country').optional().isLength({ min: 2, max: 2 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update allowed fields
        const { teamName, displayName, country, gameData } = req.body;
        
        if (teamName) user.teamName = teamName;
        if (displayName) user.displayName = displayName;
        if (country) user.country = country;
        
        // Update game data if provided
        if (gameData) {
            // Merge gameData fields
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
            if (gameData.online !== undefined) user.gameData.online = gameData.online;
            if (gameData.onlineLeagues !== undefined) user.gameData.onlineLeagues = gameData.onlineLeagues;
            if (gameData.hqLevels !== undefined) user.gameData.hqLevels = gameData.hqLevels;
            if (gameData.currentPilot !== undefined) user.gameData.currentPilot = gameData.currentPilot;
        }

        // Marcar gameData como modificado (necesario para campos Mixed)
        user.markModified('gameData');
        user.lastLogin = Date.now();
        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ===========================================
// @route   PUT /api/user/gamedata
// @desc    Update game data only
// @access  Private
// ===========================================
router.put('/gamedata', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const { 
            budget, drivers, managers, upgrades, 
            wins, podiums, points, racesCompleted, 
            careerMode, raceHistory, online, onlineLeagues 
        } = req.body;
        
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
        if (online !== undefined) user.gameData.online = online;
        if (onlineLeagues !== undefined) user.gameData.onlineLeagues = onlineLeagues;

        user.markModified('gameData');
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

// ===========================================
// @route   PUT /api/user/password
// @desc    Change password
// @access  Private
// ===========================================
router.put('/password', protect, [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const user = await User.findById(req.user.id).select('+password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isMatch = await user.matchPassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ===========================================
// @route   DELETE /api/user/profile
// @desc    Delete user account
// @access  Private
// ===========================================
router.delete('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Soft delete - just deactivate
        user.isActive = false;
        await user.save();

        res.json({
            success: true,
            message: 'Account deactivated successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// ===========================================
// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
// ===========================================
router.get('/stats', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const stats = {
            career: {
                wins: user.gameData.wins,
                podiums: user.gameData.podiums,
                points: user.gameData.points,
                racesCompleted: user.gameData.racesCompleted
            },
            online: {
                level: user.gameData.online?.level || 1,
                xp: user.gameData.online?.xp || 0,
                coins: user.gameData.online?.coins || 0,
                totalRaces: user.gameData.online?.totalRaces || 0,
                onlineWins: user.gameData.online?.onlineWins || 0,
                onlinePodiums: user.gameData.online?.onlinePodiums || 0
            },
            account: {
                createdAt: user.createdAt,
                lastLogin: user.lastLogin,
                daysSinceCreation: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))
            }
        };

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
