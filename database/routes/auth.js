// ===========================================
// AUTHENTICATION ROUTES
// ===========================================
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// ===========================================
// HELPER: Generate JWT Token
// ===========================================
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '30d' }
    );
};

// ===========================================
// @route   POST /api/auth/register
// @desc    Register new user with username/password
// @access  Public
// ===========================================
router.post('/register', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers and underscores'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('teamName')
        .trim()
        .notEmpty()
        .withMessage('Team name is required')
        .isLength({ max: 50 })
        .withMessage('Team name cannot exceed 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please enter a valid email')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { username, password, teamName, email } = req.body;

        // Check if username exists
        const existingUser = await User.findOne({ 
            username: username.toLowerCase() 
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        // Check if email exists (if provided)
        if (email) {
            const existingEmail = await User.findOne({ email: email.toLowerCase() });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
        }

        // Create user
        const user = await User.create({
            username: username.toLowerCase(),
            password,
            teamName,
            email: email ? email.toLowerCase() : undefined,
            displayName: username
        });

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: user.getPublicProfile(),
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// ===========================================
// @route   POST /api/auth/login
// @desc    Login with username/password
// @access  Public
// ===========================================
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Find user with password field
        const user = await User.findOne({ 
            username: username.toLowerCase() 
        }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            user: user.getPublicProfile(),
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// ===========================================
// GOOGLE OAUTH ROUTES
// ===========================================

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get('/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed` 
    }),
    async (req, res) => {
        try {
            const { user, isNew } = req.user;
            const token = generateToken(user);
            
            // Redirect to frontend with token
            const redirectUrl = new URL(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`);
            redirectUrl.searchParams.set('token', token);
            redirectUrl.searchParams.set('isNew', isNew);
            
            res.redirect(redirectUrl.toString());
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`);
        }
    }
);

// ===========================================
// FACEBOOK OAUTH ROUTES
// ===========================================

// @route   GET /api/auth/facebook
// @desc    Initiate Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', {
    scope: ['email', 'public_profile']
}));

// @route   GET /api/auth/facebook/callback
// @desc    Facebook OAuth callback
router.get('/facebook/callback',
    passport.authenticate('facebook', { 
        failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=facebook_failed` 
    }),
    async (req, res) => {
        try {
            const { user, isNew } = req.user;
            const token = generateToken(user);
            
            const redirectUrl = new URL(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback`);
            redirectUrl.searchParams.set('token', token);
            redirectUrl.searchParams.set('isNew', isNew);
            
            res.redirect(redirectUrl.toString());
        } catch (error) {
            console.error('Facebook callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=facebook_failed`);
        }
    }
);

// ===========================================
// @route   POST /api/auth/verify
// @desc    Verify JWT token
// @access  Public
// ===========================================
router.post('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        res.json({
            success: true,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});

module.exports = router;
