// ===========================================
// PASSPORT CONFIGURATION - OAuth Strategies
// ===========================================
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// ===========================================
// SERIALIZE / DESERIALIZE USER
// ===========================================
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// ===========================================
// GOOGLE STRATEGY
// ===========================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const { user, isNew } = await User.findOrCreateFromOAuth(profile, 'google');
            return done(null, { user, isNew });
        } catch (error) {
            console.error('Google OAuth error:', error);
            return done(error, null);
        }
    }));
    console.log('✅ Google OAuth strategy configured');
} else {
    console.log('⚠️ Google OAuth not configured (missing credentials)');
}

// ===========================================
// FACEBOOK STRATEGY
// ===========================================
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'photos', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const { user, isNew } = await User.findOrCreateFromOAuth(profile, 'facebook');
            return done(null, { user, isNew });
        } catch (error) {
            console.error('Facebook OAuth error:', error);
            return done(error, null);
        }
    }));
    console.log('✅ Facebook OAuth strategy configured');
} else {
    console.log('⚠️ Facebook OAuth not configured (missing credentials)');
}

module.exports = passport;
