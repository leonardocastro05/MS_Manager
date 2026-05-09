const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    gameData: {
        budget: { type: Number, default: 20000000 },
        online: {
            coins: { type: Number, default: 20 },
            level: { type: Number, default: 1 }
        }
    }
});

const User = mongoose.model('User', UserSchema);

function ensureOnlineData(onlineData = {}) {
    const existing = onlineData || {};
    return {
        ...existing,
        coins: Math.max(0, Math.floor(Number(existing.coins) || 0)),
    };
}

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test_db', { useNewUrlParser: true, useUnifiedTopology: true })
        .catch(() => console.log('Mongo not available locally'));
    
    if (mongoose.connection.readyState !== 1) return;
    
    const user = new User();
    user.gameData.online.coins = 50;
    await user.save();

    const u = await User.findById(user._id);
    
    // Simulate what happens in backend:
    const data = ensureOnlineData(u.gameData.online);
    console.log("ensureOnlineData returns:", data);
    
    // Then doing
    u.gameData.online = data;
    await u.save();

    console.log("After save:", (await User.findById(user._id)).gameData.online);

    await mongoose.disconnect();
}
test();
