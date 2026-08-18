// File Name: revertSetupPool.js (Backend folder ke andar)

require('dotenv').config(); 
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('./models/User');               
const Transaction = require('./models/Transaction'); 

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI; 

// Terminal se Yes/No lene ke liye helper
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};

const revertSetupPool = async () => {
    try {
        if (!MONGODB_URI) {
            console.error("❌ Error: MONGO_URI is not defined in your .env file!");
            process.exit(1);
        }

        console.log("⏳ Connecting to Database...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Database connected successfully!\n");

        // 1. Un setup aur super_setup ko dhoondho jinke paas Pool Income ya active pool hai
        const targetUsers = await User.find({ 
            role: { $in: ['setup', 'super_setup'] },
            $or: [
                { poolIncome: { $gt: 0 } },
                { activePools: { $not: { $size: 0 } } } // jinke active pools khule hue hain
            ]
        });

        if (targetUsers.length === 0) {
            console.log("⚠️ Kisi bhi Setup ya Super Setup user ke paas Pool Income nahi hai. Sab theek hai!");
            process.exit(0);
        }

        // 2. Calculate Total Deductions
        let totalPoolDeduction = 0;
        targetUsers.forEach(u => {
            totalPoolDeduction += (u.poolIncome || 0);
        });

        // 3. User se Confirm karwayein (YES OR NO)
        console.log("==================================================");
        console.log(`🔍 SUMMARY REPORT:`);
        console.log(`👨‍💻 Total Users Affected : ${targetUsers.length} (Setup / Super Setup)`);
        console.log(`💰 Total Pool Income to Deduct : $${totalPoolDeduction.toFixed(2)}`);
        console.log("==================================================\n");

        const answer = await askQuestion(`⚠️ Do you want to proceed and DEDUCT this amount? Type 'YES' to confirm or 'NO' to cancel: `);

        if (answer.trim().toUpperCase() !== 'YES') {
            console.log("\n🛑 Operation Cancelled by Admin. No deductions were made.");
            process.exit(0);
        }

        console.log("\n🚀 Starting Deductions...");

        let processedCount = 0;

        // 4. Sabhi ko 0 karo aur passbook entry maaro
        for (const user of targetUsers) {
            const amountToDeduct = user.poolIncome || 0;

            if (amountToDeduct > 0) {
                // Passbook entry for reversal
                await Transaction.create({
                    userId: user.userId,
                    type: 'debit',
                    source: 'pool', 
                    amount: amountToDeduct,
                    description: 'System Correction: Reversal of Crowd Donation (Pool Income) for Setup Account',
                    status: 'success',
                    date: new Date()
                });
            }

            // Unka pool income 0 kar do aur activePools ka data uda do taaki error free rahe
            user.poolIncome = 0;
            user.activePools = []; 
            
            await user.save();
            processedCount++;
            
            console.log(`✅ Deducted $${amountToDeduct.toFixed(2)} from UserID: ${user.userId}`);
        }

        console.log(`\n🎉 Done! Successfully cleared Pool Income for ${processedCount} Setup/Super Setup users.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Error running script:", error);
        process.exit(1);
    }
};

revertSetupPool();