// File Name: revert20thPool.js

const path = require('path');
// 🔥 .env file ko pakka load karne ke liye path set kiya hai
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

const mongoose = require('mongoose');
const User = require('./models/User'); 
const Transaction = require('./models/Transaction'); 

// 🔥 .env se Mongo URI uthana
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const revert20thPool = async () => {
    try {
        if (!MONGODB_URI) {
            console.error("❌ Error: MongoDB URI nahi mili! Apni .env file check karein ki usme MONGO_URI likha hai ya nahi.");
            process.exit(1);
        }

        console.log("⏳ Connecting to Database...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Database connected successfully from .env!");

        // 🔥 20 Tareek (Aaj) ki date range set kar rahe hain (00:00:00 se 23:59:59 tak)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date(startOfToday);
        endOfToday.setHours(23, 59, 59, 999);

        // 1. 20 tareek ke saare 'pool' credit transactions dhoondho
        const txns = await Transaction.find({
            type: 'credit',
            source: 'pool',
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        });

        if (txns.length === 0) {
            console.log("⚠️ 20 Tareek ka koi pool transaction nahi mila. Sab clear hai!");
            process.exit(0);
        }

        console.log(`🚀 Found ${txns.length} pool transactions from 20th. Reverting now...`);

        let revertedCount = 0;
        let totalAmountReverted = 0;

        for (let txn of txns) {
            // 2. User ke account se exactly utna hi amount minus karna
            await User.updateOne(
                { userId: txn.userId },
                { 
                    $inc: { 
                        poolIncome: -txn.amount,      // Pool income history se minus
                     } 
                }
            );

            // 3. Transaction ko database se hamesha ke liye delete kar dena
            await Transaction.findByIdAndDelete(txn._id);
            
            revertedCount++;
            totalAmountReverted += txn.amount;
            
            console.log(`✅ Reverted $${txn.amount} for User ID: ${txn.userId}`);
        }

        console.log(`🎉 Mission Accomplished!`);
        console.log(`👉 Total Transactions Deleted: ${revertedCount}`);
        console.log(`👉 Total Amount Deducted from Wallets: $${totalAmountReverted.toFixed(2)}`);
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Error running script:", err);
        process.exit(1);
    }
};

revert20thPool();