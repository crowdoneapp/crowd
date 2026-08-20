// File Name: revert20thPool.js

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); 

const mongoose = require('mongoose');
const User = require('./models/User'); 
const Transaction = require('./models/Transaction'); 

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const revert20thPool = async () => {
    try {
        if (!MONGODB_URI) {
            console.error("❌ Error: MongoDB URI nahi mili!");
            process.exit(1);
        }

        console.log("⏳ Connecting to Database...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Database connected successfully from .env!");

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date(startOfToday);
        endOfToday.setHours(23, 59, 59, 999);

        console.log("🔍 Database me transactions dhoondh raha hai... Data bada hone par isme 1-2 minute lag sakte hain, kripya wait karein...");

        // 🔥 NAYA UPDATE: .lean().cursor() use kiya gaya hai taaki RAM crash na ho aur script na atke
        const cursor = Transaction.find({
            type: 'credit',
            source: 'pool',
            createdAt: { $gte: startOfToday, $lte: endOfToday }
        }).lean().cursor(); 

        let revertedCount = 0;
        let totalAmountReverted = 0;

        // Ek-ek karke transaction aayega aur process hoga
        for await (const txn of cursor) {
            
            // 1. User ke account se amount minus karna
            await User.updateOne(
                { userId: txn.userId },
                { 
                    $inc: { 
                        poolIncome: -txn.amount,      
                        // Agar wallet se bhi minus karna hai toh niche wali line se // hata dein
                        // walletBalance: -txn.amount    
                    } 
                }
            );

            // 2. Transaction ko hamesha ke liye delete kar dena
            await Transaction.findByIdAndDelete(txn._id);
            
            revertedCount++;
            totalAmountReverted += txn.amount;
            
            // 🔥 Progress dikhane ke liye (Har 50 delete hone par console me message aayega)
            if (revertedCount % 50 === 0) {
                console.log(`🔄 Ab tak ${revertedCount} transactions delete ho chuke hain...`);
            }
        }

        if (revertedCount === 0) {
            console.log("⚠️ 20 Tareek ka koi pool transaction nahi mila. Sab clear hai!");
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

revert20thPool();