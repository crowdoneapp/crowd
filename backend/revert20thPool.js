// File Name: revert21stPool.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

const mongoose = require('mongoose');
const User = require('./models/User'); 
const Transaction = require('./models/Transaction'); 

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const revert21stPool = async () => {
    try {
        if (!MONGODB_URI) {
            console.error("❌ Error: MongoDB URI nahi mili!");
            process.exit(1);
        }

        console.log("⏳ Connecting to Database...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Database connected successfully from .env!");

        // 🔥 DATE FIX: Sirf 21 August 2026 ka data uthayega (Indian Time)
        const startOfDay = new Date('2026-08-21T00:00:00.000+05:30');
        const endOfDay = new Date('2026-08-21T23:59:59.999+05:30');

        console.log("🔍 Database me 21 Tareek ke transactions dhoondh raha hai... Superfast Mode ON! 🚀");

        const BATCH_SIZE = 1000; // Ek jhatke me 1000 delete karega!
        let revertedCount = 0;
        let totalAmountReverted = 0;

        while (true) {
            // 1000 transactions uthao
            const txns = await Transaction.find({
                type: 'credit',
                source: 'pool',
                createdAt: { $gte: startOfDay, $lte: endOfDay }
            }).limit(BATCH_SIZE).lean(); 

            // Agar aur data nahi bacha, toh loop band karo
            if (txns.length === 0) {
                break;
            }

            const userBulkOps = [];
            const txnIdsToDelete = [];

            // Sabka hisaab ek array me jama karo
            for (const txn of txns) {
                userBulkOps.push({
                    updateOne: {
                        filter: { userId: txn.userId },
                        update: { $inc: { poolIncome: -txn.amount } }
                    }
                });
                txnIdsToDelete.push(txn._id);
                totalAmountReverted += txn.amount;
            }

            // 🔥 Ek saath hazaron users ka balance minus (SUPER FAST)
            if (userBulkOps.length > 0) {
                await User.bulkWrite(userBulkOps);
            }

            // 🔥 Ek saath hazaron transactions delete (SUPER FAST)
            if (txnIdsToDelete.length > 0) {
                await Transaction.deleteMany({ _id: { $in: txnIdsToDelete } });
            }
            
            revertedCount += txns.length;
            console.log(`🔄 Ab tak ${revertedCount} transactions delete ho chuke hain...`);
        }

        if (revertedCount === 0) {
            console.log("⚠️ 21 Tareek ka koi pool transaction nahi mila. Sab already clear hai!");
        } else {
            console.log(`\n🎉 Mission Accomplished!`);
            console.log(`👉 Total Transactions Deleted: ${revertedCount}`);
            console.log(`👉 Total Amount Deducted: $${totalAmountReverted.toFixed(2)}`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error("❌ Error running script:", err);
        process.exit(1);
    }
};

revert21stPool();