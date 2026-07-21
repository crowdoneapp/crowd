require('dotenv').config();
const mongoose = require('mongoose');
const SystemStat = require('./models/SystemStat');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URL;

async function resetAllCrowdStats() {
    try {
        if (!MONGO_URI) {
            console.error('❌ Error: MONGO_URI not found in environment variables (.env)');
            process.exit(1);
        }

        await mongoose.connect(MONGO_URI);
        console.log('📦 Connected to MongoDB successfully...');

        // 🔥 Sabhi packages ke All Crowd ko starting chote numbers par reset karna
        const updatedStats = await SystemStat.findOneAndUpdate(
            {}, 
            {
                $set: {
                    "globalTeamCount": 50,
                    "packageStats.30.allCrowd": 50,
                    "packageStats.100.allCrowd": 15,
                    "packageStats.300.allCrowd": 5,
                    "packageStats.500.allCrowd": 2,
                    "packageStats.1000.allCrowd": 1
                }
            },
            { upsert: true, returnDocument: 'after' }
        );

        console.log('✅ Success! All Crowd stats have been successfully reset to natural start numbers:');
        console.log(updatedStats);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error resetting stats:', err);
        process.exit(1);
    }
}

resetAllCrowdStats();