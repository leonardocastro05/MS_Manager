// ===========================================
// MS MANAGER BACKEND SERVER v2.0
// ===========================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/db');

// Initialize express app
const app = express();

// ===========================================
// CONNECT TO DATABASE
// ===========================================
connectDB();

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Helmet - Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL, process.env.BACKEND_URL, /\.duckdns\.org$/]
        : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Rate Limiting - General API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Increased for general use
    message: {
        success: false,
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// More permissive limiter for race endpoints (frequent polling needed)
const raceLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 120, // 2 requests per second max
    message: {
        success: false,
        message: 'Too many race requests, please slow down'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply race limiter first (more specific)
app.use('/api/race/', raceLimiter);
// General limiter for other endpoints
app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        message: 'Too many login attempts, please try again later'
    }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ===========================================
// BODY PARSING MIDDLEWARE
// ===========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===========================================
// LOGGING
// ===========================================
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ===========================================
// SESSION & PASSPORT
// ===========================================
app.use(session({
    secret: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// ===========================================
// ROUTES
// ===========================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/online', require('./routes/online'));
app.use('/api/race', require('./routes/race'));

// ===========================================
// HEALTH CHECK
// ===========================================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'MS Manager Server v2.0 is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        oauth: {
            google: !!process.env.GOOGLE_CLIENT_ID,
            facebook: !!process.env.FACEBOOK_APP_ID
        }
    });
});

// ===========================================
// ERROR HANDLERS
// ===========================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});

app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: messages
        });
    }
    
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`
        });
    }
    
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// ===========================================
// START SERVER
// ===========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 MS MANAGER SERVER v2.0');
    console.log('='.repeat(50));
    console.log(`📍 Port: ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 CORS: ${process.env.NODE_ENV === 'production' ? 'Restricted' : 'Open'}`);
    console.log('='.repeat(50));
});

module.exports = app;
