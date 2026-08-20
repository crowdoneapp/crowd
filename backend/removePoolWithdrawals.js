// File Name: removePoolWithdrawals.js

const path = require('path');
// 🔥 .env file ko pakka load karne ke liye path set kiya hai
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

const mongoose = require('mongoose');
const User = require('./models/User'); 
const Transaction = require('./models/Transaction'); 
const Withdrawal = require('./models/Withdrawal'); // Agar aapka Withdrawal model alag hai

// 🔥 .env se Mongo URI uthana
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const removePoolWithdrawals = async () => {
    try {
        if (!MONGODB_URI) {
            console.error("❌ Error: MongoDB URI nahi mili! Apni .env file check karein ki usme MONGO_URI likha hai ya nahi.");
            process.exit(1);
        }

        console.log("⏳ Connecting to Database...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Database connected successfully from .env!");

        // 'pool' source wale pending/approved withdrawals dhoondho
        const withdrawals = await Withdrawal.find({ source: 'pool' });

        console.log(`🚀 Found ${withdrawals.length} pool withdrawals. Smashing them completely...`);

        let deletedCount = 0;

        for (let wd of withdrawals) {
            // 1. User ka balance wapas return karna (Kyunki withdrawal lagate waqt minus hua hoga)
            await User.updateOne(
                { userId: wd.userId },
                { $inc: { walletBalance: wd.grossAmount || wd.amount } }
            );

            // 2. Withdrawal collection se delete karna
            await Withdrawal.findByIdAndDelete(wd._id);

            // 3. Transaction History (Passbook) se bhi iska record delete karna
            await Transaction.deleteMany({ 
                userId: wd.userId, 
                source: 'pool',
                type: 'withdrawal' // ya 'debit' jo bhi aap save karte hain
            });

            deletedCount++;
            console.log(`✅ Reversed and deleted pool withdrawal for User ID: ${wd.userId}`);
        }

        // Failsafe: Agar koi transaction reh gayi ho (bina withdrawal entry ke), usko bhi uda do
        const extraTxns = await Transaction.deleteMany({ type: 'withdrawal', source: 'pool' });

        console.log(`🎉 Mission Accomplished! Reversed and deleted ${deletedCount} pool withdrawals.`);
        console.log(`🧹 Cleaned up ${extraTxns.deletedCount} extra transaction records.`);
        process.exit(0);
    } catch (err) {
        console.error("❌ Error running script:", err);
        process.exit(1);
    }
};

removePoolWithdrawals();