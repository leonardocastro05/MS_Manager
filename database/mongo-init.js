// ===========================================
// MongoDB Initialization Script
// ===========================================
// This script runs when the MongoDB container is first created

// Switch to msmanager database
db = db.getSiblingDB('msmanager');

// Create application user with read/write access
db.createUser({
    user: 'msmanager',
    pwd: 'msmanager2026',
    roles: [
        {
            role: 'readWrite',
            db: 'msmanager'
        }
    ]
});

// Create indexes for better performance
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true, sparse: true });
db.users.createIndex({ "googleId": 1 }, { sparse: true });
db.users.createIndex({ "facebookId": 1 }, { sparse: true });
db.users.createIndex({ "createdAt": 1 });
db.users.createIndex({ "lastLogin": 1 });

// Create indexes for game data queries
db.users.createIndex({ "gameData.online.level": -1 });
db.users.createIndex({ "gameData.wins": -1 });
db.users.createIndex({ "gameData.points": -1 });

print('✅ MongoDB initialized successfully for MS Manager');
