const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    gameData: {
        budget: { type: Number, default: 20000000 },
        drivers: { type: Array, default: [] },
        managers: { type: Array, default: [] },
        upgrades: {
            engine: { type: Number, default: 1, min: 1, max: 10 }
        },
        online: {
            coins: { type: Number, default: 20 },
            level: { type: Number, default: 1 }
        }
    }
});

const User = mongoose.model('User', UserSchema);

async function test() {
    await mongoose.connect('mongodb://127.0.0.1:27017/test_db');
    
    // Create user
    const user = new User();
    user.gameData.online.coins = 500;
    await user.save();
    console.log('Saved user coins:', user.gameData.online.coins);

    // Simulate the PUT /api/user/profile route logic
    const foundUser = await User.findById(user._id);
    
    const incomingGameData = {
        budget: 99999
        // Notice online is missing
    };

    if (incomingGameData.budget !== undefined) foundUser.gameData.budget = incomingGameData.budget;
    // ... missing online
    
    // Simulate what user.js does:
    foundUser.markModified('gameData');
    await foundUser.save();

    const afterSave = await User.findById(user._id);
    console.log('After save user coins:', afterSave.gameData.online.coins);
    
    await mongoose.disconnect();
}

test();
