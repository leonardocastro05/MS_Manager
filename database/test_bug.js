const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const dbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/ms-manager";

async function test() {
    await mongoose.connect(dbUri);
    // Create dummy user
    const user = new User({
        username: "testuser",
        email: "test@domain.com",
        password: "abc",
        gameData: {
            budget: 100,
            online: { coins: 50, xp: 1000 }
        }
    });
    await user.save();
    
    // Simulate user.js PUT logic
    const reqGameData = { budget: 200, points: 50 }; // what race.js sends
    
    const dbUser = await User.findById(user._id);
    if (reqGameData.budget !== undefined) dbUser.gameData.budget = reqGameData.budget;
    if (reqGameData.points !== undefined) dbUser.gameData.points = reqGameData.points;
    if (reqGameData.online !== undefined) {
        dbUser.gameData.online = reqGameData.online; // merge
    }
    
    dbUser.markModified('gameData');
    await dbUser.save();
    
    const checkUser = await User.findById(user._id);
    console.log("After save:", JSON.stringify(checkUser.gameData, null, 2));
    
    await User.deleteOne({ _id: user._id });
    await mongoose.disconnect();
}
test().catch(console.error);
